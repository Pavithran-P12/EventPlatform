export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug.length >= 3 ? slug : `${slug}-event`.slice(0, 80);
}

export function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  if (!taken.has(base)) return base;
  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${base.slice(0, 80 - String(suffix).length - 1)}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base.slice(0, 70)}-${Date.now()}`;
}

export type RegistrationErrorCode =
  | "EVENT_NOT_FOUND"
  | "REGISTRATION_CLOSED"
  | "PAID_EVENT"
  | "ALREADY_REGISTERED"
  | "EVENT_FULL"
  | "UNKNOWN";

const REGISTRATION_CODES: RegistrationErrorCode[] = [
  "EVENT_NOT_FOUND",
  "REGISTRATION_CLOSED",
  "PAID_EVENT",
  "ALREADY_REGISTERED",
  "EVENT_FULL",
];

export function parseRegistrationError(message: string): RegistrationErrorCode {
  const found = REGISTRATION_CODES.find((code) => message.includes(code));
  return found ?? "UNKNOWN";
}

export const REGISTRATION_ERROR_MESSAGES: Record<RegistrationErrorCode, string> = {
  EVENT_NOT_FOUND: "This event could not be found.",
  REGISTRATION_CLOSED: "Registration is not open for this event.",
  PAID_EVENT: "This is a paid event. Online payment opens in the next phase.",
  ALREADY_REGISTERED: "This email is already registered for this event.",
  EVENT_FULL: "This event is fully booked.",
  UNKNOWN: "Registration could not be completed. Please try again.",
};

export function seatsLeft(capacity: number | null, registered: number): number | null {
  if (capacity === null) return null;
  return Math.max(capacity - registered, 0);
}

export function formatPrice(input: {
  is_free: boolean;
  price_cents: number;
  currency: string;
}): string {
  if (input.is_free) return "Free";
  const amount = input.price_cents / 100;
  return input.currency === "INR"
    ? `₹${amount.toLocaleString("en-IN")}`
    : `${input.currency} ${amount.toLocaleString()}`;
}

export function formatDateRange(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-IN", opts);
  }
  return `${start.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-IN", opts)}`;
}

const GRADIENTS = [
  "from-indigo-500 via-purple-500 to-fuchsia-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-sky-500 via-blue-500 to-indigo-600",
  "from-violet-500 via-purple-500 to-pink-500",
  "from-lime-500 via-green-500 to-emerald-600",
];

export function gradientForKey(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}
