export function formatMoney(amountCents: number, currency: string): string {
  const amount = amountCents / 100;
  return currency === "INR"
    ? `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : `${currency} ${amount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
}

/** PayPal amount string, e.g. 49900 INR cents -> "499.00". */
export function toProviderAmount(amountCents: number): string {
  return (amountCents / 100).toFixed(2);
}

/** Parse a provider amount string back to integer cents. */
export function parseProviderAmount(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

export type CaptureFacts = {
  captureId: string | null;
  amountCents: number | null;
  currency: string | null;
  status: string | null;
};

type PayPalAmount = { value?: string; currency_code?: string };
type PayPalCapture = {
  id?: string;
  status?: string;
  amount?: PayPalAmount;
};
type PayPalPurchaseUnit = {
  reference_id?: string;
  custom_id?: string;
  payments?: { captures?: PayPalCapture[] };
};
type PayPalOrderLike = {
  id?: string;
  status?: string;
  purchase_units?: PayPalPurchaseUnit[];
};

/** Extract the first capture's facts from a PayPal order/capture payload. */
export function extractCaptureFacts(payload: unknown): CaptureFacts {
  const order = (payload ?? {}) as PayPalOrderLike;
  const unit = order.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  if (!capture) {
    return { captureId: null, amountCents: null, currency: null, status: order.status ?? null };
  }
  return {
    captureId: capture.id ?? null,
    amountCents: capture.amount?.value
      ? parseProviderAmount(capture.amount.value)
      : null,
    currency: capture.amount?.currency_code ?? null,
    status: capture.status ?? null,
  };
}

/** Extract the PayPal order id from a webhook payload (resource shapes vary). */
export function extractWebhookOrderId(payload: unknown): string | null {
  const event = (payload ?? {}) as {
    resource?: {
      id?: string;
      supplementary_data?: { related_ids?: { order_id?: string } };
      purchase_units?: { payments?: { captures?: { id?: string }[] } }[];
    };
    resource_type?: string;
  };
  const resource = event.resource;
  if (!resource) return null;
  // PAYMENT.CAPTURE.* events: resource is the capture; order id is related.
  const related = resource.supplementary_data?.related_ids?.order_id;
  if (related) return related;
  // CHECKOUT.ORDER.* events: resource is the order itself.
  if (resource.purchase_units) return resource.id ?? null;
  return null;
}

/** Extract capture id from a webhook payload, when present. */
export function extractWebhookCaptureId(payload: unknown): string | null {
  const event = (payload ?? {}) as {
    event_type?: string;
    resource?: {
      id?: string;
      purchase_units?: { payments?: { captures?: { id?: string }[] } }[];
    };
  };
  const resource = event.resource;
  if (!resource) return null;
  if (event.event_type?.startsWith("PAYMENT.CAPTURE.")) {
    return resource.id ?? null;
  }
  return resource.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null;
}

export function isPaidOrderStatus(status: string): boolean {
  return status === "paid";
}
