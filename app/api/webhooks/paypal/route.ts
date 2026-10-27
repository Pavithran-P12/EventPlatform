import {
  extractWebhookCaptureId,
  extractWebhookOrderId,
} from "@/lib/payments/helpers";
import {
  applyRefund,
  applyVerifiedPayment,
  getOrderByProviderOrderId,
  markWebhookProcessed,
  recordWebhookEvent,
} from "@/lib/payments/orders";
import { getPayPalOrder, verifyPayPalWebhook } from "@/lib/payments/paypal";

type WebhookPayload = {
  id?: string;
  event_type?: string;
};

export async function POST(request: Request) {
  const rawBody = await request.text();

  const verified = await verifyPayPalWebhook({
    headers: request.headers,
    rawBody,
  });
  if (!verified) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const eventId = payload.id;
  const eventType = payload.event_type ?? "";
  if (!eventId) {
    return Response.json({ error: "Missing event id" }, { status: 400 });
  }

  // Idempotency: a duplicate delivery is acknowledged without reprocessing.
  const recorded = await recordWebhookEvent({
    providerEventId: eventId,
    eventType,
    payload,
  });
  if (!recorded) {
    return Response.json({ received: true, duplicate: true });
  }

  try {
    const providerOrderId = extractWebhookOrderId(payload);
    if (providerOrderId) {
      const order = await getOrderByProviderOrderId(providerOrderId);
      if (order) {
        if (
          eventType === "PAYMENT.CAPTURE.COMPLETED" ||
          eventType === "CHECKOUT.ORDER.APPROVED" ||
          eventType === "CHECKOUT.ORDER.COMPLETED"
        ) {
          // Reconcile against the provider's own order state, not just the
          // webhook body, before marking anything paid.
          const current = await getPayPalOrder(providerOrderId);
          await applyVerifiedPayment({
            order,
            providerPayload: current,
            source: "webhook",
          });
        } else if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
          await applyRefund({ order, providerPayload: payload });
        } else if (
          eventType === "PAYMENT.CAPTURE.DENIED" ||
          eventType === "PAYMENT.CAPTURE.DECLINED"
        ) {
          await applyVerifiedPayment({
            order,
            providerPayload: {
              status: "DENIED",
              purchase_units: [
                {
                  payments: {
                    captures: [
                      {
                        id: extractWebhookCaptureId(payload) ?? "denied",
                        status: "DENIED",
                        amount: {
                          value: (order.amount_cents / 100).toFixed(2),
                          currency_code: order.currency,
                        },
                      },
                    ],
                  },
                },
              ],
            },
            source: "webhook",
          });
        }
      }
    }
  } catch {
    // Still acknowledge: the event is recorded and can be reconciled from
    // the provider order state; returning 5xx would cause retry storms for
    // permanently-failing payloads.
  }

  await markWebhookProcessed(eventId);
  return Response.json({ received: true });
}
