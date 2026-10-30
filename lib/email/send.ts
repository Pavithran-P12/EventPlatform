import "server-only";

import { getServerEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  renderConfirmationEmail,
  type ConfirmationEmailInput,
} from "@/lib/email/templates";

const RESEND_API_URL = "https://api.resend.com/emails";
// Resend's shared test sender; replace with a verified domain address
// via EMAIL_FROM before sending to arbitrary recipients in production.
const DEFAULT_FROM = "EventPlatform <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  try {
    return Boolean(getServerEnv().RESEND_API_KEY);
  } catch {
    return false;
  }
}

async function sendViaResend(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<boolean> {
  const env = getServerEnv();
  if (!env.RESEND_API_KEY) return false;
  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM || DEFAULT_FROM,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Send the registration confirmation exactly once. The sent-at timestamp
 * is claimed atomically before sending, so concurrent capture + webhook
 * processing cannot produce duplicates. Email failures never fail the
 * registration or payment that triggered them.
 */
export async function sendRegistrationConfirmation(
  registrationId: string,
): Promise<void> {
  if (!isEmailConfigured()) return;
  const admin = createAdminClient();

  const { data: claimed } = await admin
    .from("registrations")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", registrationId)
    .eq("status", "confirmed")
    .is("confirmation_email_sent_at", null)
    .select("id, full_name, email, event_id")
    .maybeSingle();
  if (!claimed) return;

  const registration = claimed as {
    id: string;
    full_name: string;
    email: string;
    event_id: string;
  };

  const { data: eventRow } = await admin
    .from("events")
    .select(
      "title, starts_at, ends_at, timezone, is_online, location, organization_id, organizations(name)",
    )
    .eq("id", registration.event_id)
    .maybeSingle();
  if (!eventRow) return;

  const event = eventRow as unknown as {
    title: string;
    starts_at: string;
    ends_at: string;
    timezone: string;
    is_online: boolean;
    location: string | null;
    organizations: { name: string } | { name: string }[] | null;
  };
  const organizationName = Array.isArray(event.organizations)
    ? (event.organizations[0]?.name ?? "Event organiser")
    : (event.organizations?.name ?? "Event organiser");

  const { data: orderRow } = await admin
    .from("orders")
    .select("amount_cents, currency, provider_order_id, status")
    .eq("registration_id", registration.id)
    .maybeSingle();
  const order = orderRow as {
    amount_cents: number;
    currency: string;
    provider_order_id: string | null;
    status: string;
  } | null;

  const emailInput: ConfirmationEmailInput = {
    attendeeName: registration.full_name,
    eventTitle: event.title,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    timezone: event.timezone,
    isOnline: event.is_online,
    location: event.location,
    organizationName,
    amountCents: order?.status === "paid" ? order.amount_cents : null,
    currency: order?.currency ?? "INR",
    orderReference: order?.provider_order_id ?? null,
  };
  const rendered = renderConfirmationEmail(emailInput);
  const sent = await sendViaResend({ to: registration.email, ...rendered });

  if (!sent) {
    // Release the claim so a later trigger (e.g. webhook retry) can resend.
    await admin
      .from("registrations")
      .update({ confirmation_email_sent_at: null })
      .eq("id", registration.id);
  }
}
