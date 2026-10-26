"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  parseRegistrationError,
  REGISTRATION_ERROR_MESSAGES,
} from "@/lib/db/helpers";
import { registrationFormSchema } from "@/lib/validation/phase3";

export type RegistrationState = {
  error?: string;
  success?: string;
  registrationId?: string;
};

export async function registerForEventAction(
  eventId: string,
  slug: string,
  input: { fullName: string; email: string; phone?: string },
): Promise<RegistrationState> {
  const parsed = registrationFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid registration details." };
  }
  const user = await getCurrentUser();
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("register_for_free_event", {
    target_event_id: eventId,
    attendee_name: parsed.data.fullName,
    attendee_email: parsed.data.email,
    attendee_phone: parsed.data.phone ?? null,
    attendee_user_id: user?.id ?? null,
  });
  if (error || !data) {
    const code = parseRegistrationError(error?.message ?? "");
    return { error: REGISTRATION_ERROR_MESSAGES[code] };
  }
  const registration = data as { id: string };
  revalidatePath(`/events/${slug}`);
  revalidatePath("/events");
  return {
    success: "You're registered! A confirmation has been recorded for this event.",
    registrationId: registration.id,
  };
}
