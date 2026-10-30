import { describe, expect, it } from "vitest";

import { renderConfirmationEmail } from "@/lib/email/templates";

const base = {
  attendeeName: "Test Buyer",
  eventTitle: "USD Checkout Test",
  startsAt: "2026-11-15T09:00:00.000Z",
  endsAt: "2026-11-15T17:00:00.000Z",
  timezone: "UTC",
  isOnline: true,
  location: null,
  organizationName: "Pavi Events",
};

describe("confirmation email template", () => {
  it("renders a paid confirmation with amount and reference", () => {
    const email = renderConfirmationEmail({
      ...base,
      amountCents: 500,
      currency: "USD",
      orderReference: "9CW121154A292452R",
    });
    expect(email.subject).toContain("USD Checkout Test");
    expect(email.text).toContain("Amount paid: USD 5.00 via PayPal");
    expect(email.text).toContain("Order reference: 9CW121154A292452R");
    expect(email.text).toContain("Online event");
    expect(email.html).toContain("REGISTRATION CONFIRMED");
  });

  it("renders a free confirmation without payment lines", () => {
    const email = renderConfirmationEmail({
      ...base,
      isOnline: false,
      location: "Main Hall",
      amountCents: null,
      currency: "INR",
      orderReference: null,
    });
    expect(email.text).toContain("free event");
    expect(email.text).toContain("Main Hall");
    expect(email.text).not.toContain("Order reference");
  });

  it("escapes attendee-controlled values in HTML", () => {
    const email = renderConfirmationEmail({
      ...base,
      attendeeName: "<script>alert(1)</script>",
      amountCents: null,
      currency: "INR",
      orderReference: null,
    });
    expect(email.html).not.toContain("<script>alert(1)</script>");
    expect(email.html).toContain("&lt;script&gt;");
  });
});
