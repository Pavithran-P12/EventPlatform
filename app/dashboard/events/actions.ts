"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/lib/db/org-context";
import { getEventForOrg } from "@/lib/db/queries";
import { slugify, uniqueSlug } from "@/lib/db/helpers";
import { eventFormSchema, type EventFormInput } from "@/lib/validation/phase3";

export type ActionState = { error?: string; success?: string };

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

async function requireActiveOrg() {
  const user = await requireUser();
  const active = await getActiveOrganization(user.id);
  if (!active) redirect("/dashboard/organizations/new");
  return { user, organization: active.organization };
}

function toEventRow(input: EventFormInput, organizationId: string, userId: string, slug: string) {
  return {
    organization_id: organizationId,
    created_by: userId,
    title: input.title,
    slug,
    description: input.description ?? null,
    starts_at: new Date(input.startsAt).toISOString(),
    ends_at: new Date(input.endsAt).toISOString(),
    location: input.isOnline ? null : (input.location ?? null),
    is_online: input.isOnline,
    capacity: input.capacity ?? null,
    is_free: input.isFree,
    price_cents: input.isFree ? 0 : Math.round(input.priceInr * 100),
    currency: "INR",
    is_public: true,
  };
}

async function syncModules(eventId: string, modules: string[]) {
  const supabase = await createClient();
  await supabase.from("event_modules").delete().eq("event_id", eventId);
  if (modules.length > 0) {
    await supabase.from("event_modules").insert(
      modules.map((module_key) => ({ event_id: eventId, module_key })),
    );
  }
  if (modules.includes("registration")) {
    const { data: existing } = await supabase
      .from("registration_forms")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle();
    if (!existing) {
      await supabase
        .from("registration_forms")
        .insert({ event_id: eventId, title: "Registration" });
    }
  }
}

export async function createEventAction(input: EventFormInput): Promise<ActionState> {
  const { user, organization } = await requireActiveOrg();
  const parsed = eventFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid event details." };
  }
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("events")
    .select("slug")
    .eq("organization_id", organization.id);
  const taken = new Set((existing ?? []).map((row) => (row as { slug: string }).slug));
  const slug = uniqueSlug(slugify(parsed.data.title), taken);

  const { data, error } = await supabase
    .from("events")
    .insert(toEventRow(parsed.data, organization.id, user.id, slug))
    .select("id")
    .single();
  if (error || !data) {
    return { error: "Event could not be created. Please try again." };
  }
  const eventId = (data as { id: string }).id;
  await syncModules(eventId, parsed.data.modules);
  revalidatePath("/dashboard/events");
  revalidatePath("/events");
  redirect(`/dashboard/events/${eventId}`);
}

export async function updateEventAction(
  eventId: string,
  input: EventFormInput,
): Promise<ActionState> {
  const { organization } = await requireActiveOrg();
  const parsed = eventFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid event details." };
  }
  const existing = await getEventForOrg(organization.id, eventId);
  if (!existing) return { error: "Event not found in this organisation." };

  const supabase = await createClient();
  const row = toEventRow(parsed.data, organization.id, existing.created_by, existing.slug);
  const { error } = await supabase
    .from("events")
    .update({
      title: row.title,
      description: row.description,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      location: row.location,
      is_online: row.is_online,
      capacity: row.capacity,
      is_free: row.is_free,
      price_cents: row.price_cents,
      currency: row.currency,
    })
    .eq("id", eventId)
    .eq("organization_id", organization.id);
  if (error) return { error: "Event could not be updated. Please try again." };
  await syncModules(eventId, parsed.data.modules);
  revalidatePath("/dashboard/events");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath(`/events/${existing.slug}`);
  return { success: "Event updated." };
}

async function setEventStatus(eventId: string, status: "published" | "draft" | "cancelled") {
  const { organization } = await requireActiveOrg();
  const existing = await getEventForOrg(organization.id, eventId);
  if (!existing) return;
  const supabase = await createClient();
  await supabase
    .from("events")
    .update({ status })
    .eq("id", eventId)
    .eq("organization_id", organization.id);
  revalidatePath("/dashboard/events");
  revalidatePath(`/dashboard/events/${eventId}`);
  revalidatePath("/events");
  revalidatePath(`/events/${existing.slug}`);
}

export async function publishEventAction(formData: FormData) {
  await setEventStatus(String(formData.get("eventId") ?? ""), "published");
}

export async function unpublishEventAction(formData: FormData) {
  await setEventStatus(String(formData.get("eventId") ?? ""), "draft");
}

export async function cancelEventAction(formData: FormData) {
  await setEventStatus(String(formData.get("eventId") ?? ""), "cancelled");
}

export async function deleteEventAction(formData: FormData) {
  const { organization } = await requireActiveOrg();
  const eventId = String(formData.get("eventId") ?? "");
  const existing = await getEventForOrg(organization.id, eventId);
  if (!existing) return;
  const supabase = await createClient();
  await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("organization_id", organization.id);
  revalidatePath("/dashboard/events");
  revalidatePath("/events");
  redirect("/dashboard/events");
}

export async function cancelRegistrationAction(formData: FormData) {
  const { organization } = await requireActiveOrg();
  const registrationId = String(formData.get("registrationId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  const existing = await getEventForOrg(organization.id, eventId);
  if (!existing) return;
  const supabase = await createClient();
  await supabase
    .from("registrations")
    .update({ status: "cancelled" })
    .eq("id", registrationId)
    .eq("event_id", eventId);
  revalidatePath(`/dashboard/events/${eventId}/participants`);
  revalidatePath("/events");
  revalidatePath(`/events/${existing.slug}`);
}
