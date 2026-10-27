import { describe, expect, it } from "vitest";

import {
  extractCaptureFacts,
  extractWebhookCaptureId,
  extractWebhookOrderId,
  formatMoney,
  parseProviderAmount,
  toProviderAmount,
} from "@/lib/payments/helpers";

describe("money helpers", () => {
  it("formats INR and USD amounts", () => {
    expect(formatMoney(49900, "INR")).toBe("₹499");
    expect(formatMoney(1250, "USD")).toBe("USD 12.50");
  });

  it("converts cents to provider amount strings", () => {
    expect(toProviderAmount(49900)).toBe("499.00");
    expect(toProviderAmount(5)).toBe("0.05");
  });

  it("parses provider amounts back to cents", () => {
    expect(parseProviderAmount("499.00")).toBe(49900);
    expect(parseProviderAmount("0.05")).toBe(5);
    expect(parseProviderAmount("nope")).toBeNull();
    expect(parseProviderAmount("-1")).toBeNull();
  });
});

describe("capture extraction", () => {
  it("reads capture facts from a completed order payload", () => {
    const facts = extractCaptureFacts({
      id: "ORDER1",
      status: "COMPLETED",
      purchase_units: [
        {
          payments: {
            captures: [
              {
                id: "CAP1",
                status: "COMPLETED",
                amount: { value: "499.00", currency_code: "INR" },
              },
            ],
          },
        },
      ],
    });
    expect(facts).toEqual({
      captureId: "CAP1",
      amountCents: 49900,
      currency: "INR",
      status: "COMPLETED",
    });
  });

  it("handles payloads without captures", () => {
    const facts = extractCaptureFacts({ id: "ORDER1", status: "APPROVED" });
    expect(facts.captureId).toBeNull();
    expect(facts.status).toBe("APPROVED");
  });
});

describe("webhook id extraction", () => {
  it("reads the order id from capture events via related ids", () => {
    const payload = {
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: {
        id: "CAP9",
        supplementary_data: { related_ids: { order_id: "ORDER9" } },
      },
    };
    expect(extractWebhookOrderId(payload)).toBe("ORDER9");
    expect(extractWebhookCaptureId(payload)).toBe("CAP9");
  });

  it("reads the order id from checkout order events", () => {
    const payload = {
      event_type: "CHECKOUT.ORDER.APPROVED",
      resource: {
        id: "ORDER7",
        purchase_units: [
          { payments: { captures: [{ id: "CAP7" }] } },
        ],
      },
    };
    expect(extractWebhookOrderId(payload)).toBe("ORDER7");
    expect(extractWebhookCaptureId(payload)).toBe("CAP7");
  });
});
