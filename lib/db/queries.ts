import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type {
  EventRecord,
  Organization,
  OrganizationMembership,
  PublicEvent,
  RegistrationFieldRecord,
  RegistrationRecord,
} from "@/lib/db/types";

const EVENT_COLUMNS =
  "id, organization_id, created_by, title, slug, description, status, starts_at, ends_at, timezone, location, is_online, capacity, is_free, price_cents, currency, is_public, cover_image_path, created_at, updated_at";

type MembershipRow = {
  role: OrganizationMembership["role"];
  organizations: Organization | null;
};

export async function getMyOrganizations(
  userId: string,
): Promise<OrganizationMembership[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_members")
    .select(
      "role, organizations(id, name, slug, description, created_by, created_at, updated_at)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as unknown as MembershipRow[])
    .filter((row) => row.organizations !== null)
    .map((row) => ({
      role: row.role,
      organization: row.organizations as Organization,
    }));
}

export async function getOrganizationForUser(
  userId: string,
  organizationId: string,
): Promise<OrganizationMembership | null> {
  const memberships = await getMyOrganizations(userId);
  return (
    memberships.find((m) => m.organization.id === organizationId) ?? null
  );
}

export async function getOrgEvents(
  organizationId: string,
): Promise<EventRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("organization_id", organizationId)
    .order("starts_at", { ascending: true });
  if (error || !data) return [];
  return data as EventRecord[];
}

export async function getEventForOrg(
  organizationId: string,
  eventId: string,
): Promise<EventRecord | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_COLUMNS)
    .eq("organization_id", organizationId)
    .eq("id", eventId)
    .maybeSingle();
  if (error || !data) return null;
  return data as EventRecord;
}

export async function getEventModules(
  eventId: string,
): Promise<{ module_key: string }[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_modules")
    .select("module_key")
    .eq("event_id", eventId);
  if (error || !data) return [];
  return data as { module_key: string }[];
}

export async function getRegistrationCounts(
  eventIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!isSupabaseConfigured() || eventIds.length === 0) return counts;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("event_id")
    .in("event_id", eventIds)
    .neq("status", "cancelled");
  if (error || !data) return counts;
  for (const row of data as { event_id: string }[]) {
    counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1);
  }
  return counts;
}

export async function getEventRegistrations(
  eventId: string,
): Promise<RegistrationRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, event_id, form_id, user_id, full_name, email, phone, status, created_at, updated_at",
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as RegistrationRecord[];
}

export async function getPublicEvents(): Promise<PublicEvent[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`${EVENT_COLUMNS}, organizations(name)`)
    .eq("status", "published")
    .eq("is_public", true)
    .order("starts_at", { ascending: true });
  if (error || !data) return [];
  const events = data as unknown as (EventRecord & {
    organizations: { name: string } | { name: string }[] | null;
  })[];
  const counts = await getRegistrationCounts(events.map((e) => e.id));
  return events.map((event) => ({
    ...event,
    organization_name:
      (Array.isArray(event.organizations)
        ? event.organizations[0]?.name
        : event.organizations?.name) ?? "EventPlatform organiser",
    registered_count: counts.get(event.id) ?? 0,
  }));
}

export async function getPublicEventBySlug(
  slug: string,
): Promise<PublicEvent | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select(`${EVENT_COLUMNS}, organizations(name)`)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("is_public", true)
    .maybeSingle();
  if (error || !data) return null;
  const event = data as unknown as EventRecord & {
    organizations: { name: string } | { name: string }[] | null;
  };
  const counts = await getRegistrationCounts([event.id]);
  return {
    ...event,
    organization_name:
      (Array.isArray(event.organizations)
        ? event.organizations[0]?.name
        : event.organizations?.name) ?? "EventPlatform organiser",
    registered_count: counts.get(event.id) ?? 0,
  };
}

export async function getPublicRegistrationFields(
  eventId: string,
): Promise<RegistrationFieldRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data: form } = await supabase
    .from("registration_forms")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();
  if (!form) return [];
  const { data, error } = await supabase
    .from("registration_fields")
    .select(
      "id, form_id, field_key, label, field_type, is_required, options, sort_order",
    )
    .eq("form_id", (form as { id: string }).id)
    .order("sort_order", { ascending: true });
  if (error || !data) return [];
  return data as RegistrationFieldRecord[];
}
