import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendRegistrationConfirmation } from "@/lib/email/send";
import { extractCaptureFacts } from "@/lib/payments/helpers";
import type { OrderRecord, PaymentRecord } from "@/lib/payments/types";

const ORDER_COLUMNS =
  "id, registration_id, event_id, organization_id, amount_cents, currency, status, provider, provider_order_id, created_at, updated_at";
const PAYMENT_COLUMNS =
  "id, order_id, provider, provider_payment_id, provider_capture_id, status, amount_cents, currency, created_at, updated_at";

export async function createOrderForRegistration(input: {
  registrationId: string;
  eventId: string;
  organizationId: string;
  amountCents: number;
  currency: string;
}): Promise<OrderRecord> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .insert({
      registration_id: input.registrationId,
      event_id: input.eventId,
      organization_id: input.organizationId,
      amount_cents: input.amountCents,
      currency: input.currency,
      provider: "paypal",
    })
    .select(ORDER_COLUMNS)
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Could not create order");
  }
  return data as OrderRecord;
}

export async function attachProviderOrder(
  order: OrderRecord,
  providerOrderId: string,
  raw: unknown,
): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("orders")
    .update({ provider_order_id: providerOrderId })
    .eq("id", order.id);
  await admin.from("payments").insert({
    order_id: order.id,
    provider: "paypal",
    provider_payment_id: providerOrderId,
    status: "initiated",
    amount_cents: order.amount_cents,
    currency: order.currency,
    raw: raw as never,
  });
}

export async function getOrderByProviderOrderId(
  providerOrderId: string,
): Promise<OrderRecord | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("provider_order_id", providerOrderId)
    .maybeSingle();
  return (data as OrderRecord | null) ?? null;
}

export async function getOrderById(orderId: string): Promise<OrderRecord | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq("id", orderId)
    .maybeSingle();
  return (data as OrderRecord | null) ?? null;
}

export async function getPaymentForOrder(
  orderId: string,
): Promise<PaymentRecord | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("payments")
    .select(PAYMENT_COLUMNS)
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as PaymentRecord | null) ?? null;
}

/**
 * Apply verified provider facts to an order. Idempotent: a paid order is
 * never downgraded, and amounts must match the server-side order exactly.
 * Returns the resulting order status.
 */
export async function applyVerifiedPayment(input: {
  order: OrderRecord;
  providerPayload: unknown;
  source: "capture" | "webhook";
}): Promise<OrderRecord["status"]> {
  const admin = createAdminClient();
  const order = input.order;
  if (order.status === "paid" || order.status === "refunded") {
    return order.status;
  }
  const facts = extractCaptureFacts(input.providerPayload);
  const verified =
    facts.status === "COMPLETED" &&
    facts.captureId !== null &&
    facts.amountCents === order.amount_cents &&
    facts.currency === order.currency;

  if (!verified) {
    if (facts.status === "DECLINED" || facts.status === "DENIED") {
      await admin
        .from("orders")
        .update({ status: "failed" })
        .eq("id", order.id)
        .eq("status", "pending");
      await admin
        .from("payments")
        .update({ status: "failed", raw: input.providerPayload as never })
        .eq("order_id", order.id);
      await admin
        .from("registrations")
        .update({ status: "cancelled" })
        .eq("id", order.registration_id)
        .eq("status", "pending_payment");
      return "failed";
    }
    return order.status;
  }

  await admin
    .from("payments")
    .update({
      status: "captured",
      provider_capture_id: facts.captureId,
      raw: input.providerPayload as never,
    })
    .eq("order_id", order.id);
  const { data: updated } = await admin
    .from("orders")
    .update({ status: "paid" })
    .eq("id", order.id)
    .eq("status", "pending")
    .select(ORDER_COLUMNS)
    .maybeSingle();
  if (updated) {
    await admin
      .from("registrations")
      .update({ status: "confirmed" })
      .eq("id", order.registration_id)
      .eq("status", "pending_payment");
    await sendRegistrationConfirmation(order.registration_id);
    return "paid";
  }
  const current = await getOrderById(order.id);
  return current?.status ?? order.status;
}

/** Mark an order refunded (from a verified refund webhook). Idempotent. */
export async function applyRefund(input: {
  order: OrderRecord;
  providerPayload: unknown;
}): Promise<void> {
  const admin = createAdminClient();
  if (input.order.status === "refunded") return;
  await admin
    .from("orders")
    .update({ status: "refunded" })
    .eq("id", input.order.id)
    .eq("status", "paid");
  await admin
    .from("payments")
    .update({ status: "refunded", raw: input.providerPayload as never })
    .eq("order_id", input.order.id);
  await admin
    .from("registrations")
    .update({ status: "cancelled" })
    .eq("id", input.order.registration_id)
    .eq("status", "confirmed");
}

/**
 * Expire abandoned pending checkouts and release their seats.
 * Backed by a service-role-only database function; safe to call repeatedly.
 */
export async function expireStalePendingPayments(
  staleAfterMinutes = 30,
): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("expire_stale_pending_payments", {
    stale_after: `${staleAfterMinutes} minutes`,
  });
  if (error) throw new Error(error.message);
  return typeof data === "number" ? data : 0;
}

/** Cancel a pending order and release its reserved seat. */
export async function cancelPendingOrder(order: OrderRecord): Promise<void> {
  const admin = createAdminClient();
  if (order.status !== "pending") return;
  await admin
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", order.id)
    .eq("status", "pending");
  await admin
    .from("registrations")
    .update({ status: "cancelled" })
    .eq("id", order.registration_id)
    .eq("status", "pending_payment");
}

/** Record a webhook event; returns false when it was already recorded. */
export async function recordWebhookEvent(input: {
  providerEventId: string;
  eventType: string;
  payload: unknown;
}): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin.from("payment_webhook_events").insert({
    provider: "paypal",
    provider_event_id: input.providerEventId,
    event_type: input.eventType,
    payload: input.payload as never,
  });
  if (error) {
    if (error.code === "23505") return false;
    throw new Error(error.message);
  }
  return true;
}

export async function markWebhookProcessed(providerEventId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("payment_webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("provider", "paypal")
    .eq("provider_event_id", providerEventId);
}
