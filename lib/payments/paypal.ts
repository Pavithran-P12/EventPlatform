import "server-only";

import { getServerEnv } from "@/lib/env";
import { toProviderAmount } from "@/lib/payments/helpers";

export function isPayPalConfigured(): boolean {
  try {
    const env = getServerEnv();
    return Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);
  } catch {
    return false;
  }
}

function paypalBaseUrl(): string {
  const env = getServerEnv();
  return env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.token;
  }
  const env = getServerEnv();
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal is not configured");
  }
  const basic = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");
  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`PayPal token request failed (${response.status})`);
  }
  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function paypalFetch(path: string, init: RequestInit): Promise<unknown> {
  const token = await getAccessToken();
  const response = await fetch(`${paypalBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : `PayPal request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export type CreatedPayPalOrder = {
  providerOrderId: string;
  approveUrl: string;
  raw: unknown;
};

export async function createPayPalOrder(input: {
  internalOrderId: string;
  amountCents: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<CreatedPayPalOrder> {
  const data = (await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    headers: { "PayPal-Request-Id": `order-${input.internalOrderId}` },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.internalOrderId,
          custom_id: input.internalOrderId,
          description: input.description.slice(0, 127),
          amount: {
            currency_code: input.currency,
            value: toProviderAmount(input.amountCents),
          },
        },
      ],
      application_context: {
        brand_name: "EventPlatform",
        user_action: "PAY_NOW",
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
      },
    }),
  })) as {
    id: string;
    links?: { rel: string; href: string }[];
  };
  const approveUrl = data.links?.find((link) => link.rel === "approve")?.href;
  if (!approveUrl) throw new Error("PayPal did not return an approval link");
  return { providerOrderId: data.id, approveUrl, raw: data };
}

export async function capturePayPalOrder(
  providerOrderId: string,
): Promise<unknown> {
  return paypalFetch(`/v2/checkout/orders/${providerOrderId}/capture`, {
    method: "POST",
    headers: { "PayPal-Request-Id": `capture-${providerOrderId}` },
    body: JSON.stringify({}),
  });
}

export async function getPayPalOrder(providerOrderId: string): Promise<unknown> {
  return paypalFetch(`/v2/checkout/orders/${providerOrderId}`, {
    method: "GET",
  });
}

export async function refundPayPalCapture(
  captureId: string,
  amountCents: number,
  currency: string,
): Promise<unknown> {
  return paypalFetch(`/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    headers: { "PayPal-Request-Id": `refund-${captureId}` },
    body: JSON.stringify({
      amount: { value: toProviderAmount(amountCents), currency_code: currency },
    }),
  });
}

export async function verifyPayPalWebhook(input: {
  headers: Headers;
  rawBody: string;
}): Promise<boolean> {
  const env = getServerEnv();
  if (!env.PAYPAL_WEBHOOK_ID) return false;
  let webhookEvent: unknown;
  try {
    webhookEvent = JSON.parse(input.rawBody);
  } catch {
    return false;
  }
  try {
    const data = (await paypalFetch("/v1/notifications/verify-webhook-signature", {
      method: "POST",
      body: JSON.stringify({
        auth_algo: input.headers.get("paypal-auth-algo"),
        cert_url: input.headers.get("paypal-cert-url"),
        transmission_id: input.headers.get("paypal-transmission-id"),
        transmission_sig: input.headers.get("paypal-transmission-sig"),
        transmission_time: input.headers.get("paypal-transmission-time"),
        webhook_id: env.PAYPAL_WEBHOOK_ID,
        webhook_event: webhookEvent,
      }),
    })) as { verification_status?: string };
    return data.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}
