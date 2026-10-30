import { formatDateRange } from "@/lib/db/helpers";
import { formatMoney } from "@/lib/payments/helpers";

export type ConfirmationEmailInput = {
  attendeeName: string;
  eventTitle: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isOnline: boolean;
  location: string | null;
  organizationName: string;
  amountCents: number | null;
  currency: string;
  orderReference: string | null;
};

export type RenderedEmail = { subject: string; html: string; text: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderConfirmationEmail(
  input: ConfirmationEmailInput,
): RenderedEmail {
  const when = formatDateRange(input.startsAt, input.endsAt);
  const where = input.isOnline
    ? "Online event"
    : (input.location ?? "Venue to be announced");
  const paidLine =
    input.amountCents !== null
      ? `Amount paid: ${formatMoney(input.amountCents, input.currency)} via PayPal`
      : "This is a free event — no payment was required.";
  const referenceLine = input.orderReference
    ? `Order reference: ${input.orderReference}`
    : null;

  const subject = `You're registered for ${input.eventTitle}`;
  const text = [
    `Hi ${input.attendeeName},`,
    "",
    `Your registration for ${input.eventTitle} is confirmed.`,
    "",
    `When: ${when} (${input.timezone})`,
    `Where: ${where}`,
    `Organised by: ${input.organizationName}`,
    paidLine,
    ...(referenceLine ? [referenceLine] : []),
    "",
    "Show this email at check-in. If you can no longer attend, please contact the organiser.",
    "",
    "— EventPlatform",
  ].join("\n");

  const rows: Array<[string, string]> = [
    ["When", `${when} (${input.timezone})`],
    ["Where", where],
    ["Organised by", input.organizationName],
    ["Payment", paidLine],
    ...(referenceLine ? [["Reference", referenceLine] as [string, string]] : []),
  ];
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;vertical-align:top">${escapeHtml(label)}</td><td style="padding:6px 0;color:#0f172a;font-size:14px">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const html = `<!doctype html>
<html><body style="margin:0;background:#f8f9fc;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:32px 16px">
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:32px">
    <p style="margin:0 0 8px;color:#4f46e5;font-size:12px;font-weight:bold;letter-spacing:1px">REGISTRATION CONFIRMED</p>
    <h1 style="margin:0 0 12px;color:#0f172a;font-size:22px">${escapeHtml(input.eventTitle)}</h1>
    <p style="margin:0 0 20px;color:#334155;font-size:14px">Hi ${escapeHtml(input.attendeeName)}, your seat is confirmed.</p>
    <table style="border-collapse:collapse">${rowsHtml}</table>
    <p style="margin:24px 0 0;color:#64748b;font-size:13px">Show this email at check-in. If you can no longer attend, please contact the organiser.</p>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin:16px 0 0">Sent by EventPlatform on behalf of ${escapeHtml(input.organizationName)}</p>
</div>
</body></html>`;

  return { subject, html, text };
}
