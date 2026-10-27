"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { parseRegistrationError } from "@/lib/db/helpers";
import { getPublicEventBySlug } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { registrationFormSchema } from "@/lib/validation/phase3";
import {
  attachProviderOrder,
  createOrderForRegistration,
} from "@/lib/payments/orders";
import { createPayPalOrder, isPayPalConfigured } from "@/lib/payments/paypal";

export type CheckoutState = { error: string | null };

export async function startPaidCheckoutAction(
  slug: string,
  _previousState: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const parsed = registrationFormSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please check your details and try again." };
  }
  if (!isPayPalConfigured()) {
    return { error: "Online payment is not available right now." };
  }

  const event = await getPublicEventBySlug(slug);
  if (!event) return { error: "This event could not be found." };
  if (event.is_free) {
    return { error: "This is a free event — use the free registration form." };
  }

  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("register_for_paid_event", {
    target_event_id: event.id,
    attendee_name: parsed.data.fullName,
    attendee_email: parsed.data.email,
    attendee_phone: parsed.data.phone ?? null,
    attendee_user_id: user?.id ?? null,
  });
  if (error || !data) {
    const code = parseRegistrationError(error?.message ?? "");
    if (code === "ALREADY_REGISTERED") {
      return {
        error:
          "This email already has a registration for this event. If you started a payment earlier, check your email or contact the organiser.",
      };
    }
    if (code === "EVENT_FULL") {
      return { error: "This event is sold out." };
    }
    if (code === "REGISTRATION_CLOSED" || code === "EVENT_NOT_FOUND") {
      return { error: "Registration is not open for this event." };
    }
    return { error: "Registration failed. Please try again." };
  }
  const registration = data as { id: string };

  const order = await createOrderForRegistration({
    registrationId: registration.id,
    eventId: event.id,
    organizationId: event.organization_id,
    amountCents: event.price_cents ?? 0,
    currency: event.currency,
  });

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${proto}://${host}` : "http://localhost:3000";

  let approveUrl: string;
  try {
    const created = await createPayPalOrder({
      internalOrderId: order.id,
      amountCents: order.amount_cents,
      currency: order.currency,
      description: `Registration: ${event.title}`,
      returnUrl: `${origin}/events/${slug}/checkout/return?order=${order.id}`,
      cancelUrl: `${origin}/events/${slug}/checkout/cancel?order=${order.id}`,
    });
    await attachProviderOrder(order, created.providerOrderId, created.raw);
    approveUrl = created.approveUrl;
  } catch {
    return {
      error:
        "We could not start the PayPal checkout. Your seat is reserved briefly — please try again or contact the organiser.",
    };
  }

  revalidatePath(`/events/${slug}`);
  redirect(approveUrl);
}
