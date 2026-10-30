-- Phase 4 fix: public seat counts.
--
-- Registrations intentionally have no public read policy (attendee names and
-- emails must never be exposed to anonymous visitors), which also means the
-- public event pages cannot count seats through RLS. This function exposes
-- ONLY aggregate counts for published, public events -- never attendee data.

create or replace function public.get_public_registration_counts(
  target_event_ids uuid[]
)
returns table (event_id uuid, registered_count bigint)
language sql
security definer
set search_path = public
as $$
  select r.event_id, count(*)::bigint as registered_count
  from public.registrations r
  join public.events e on e.id = r.event_id
  where r.event_id = any (target_event_ids)
    and r.status <> 'cancelled'
    and e.status = 'published'
    and e.is_public
  group by r.event_id;
$$;

revoke all on function public.get_public_registration_counts(uuid[]) from public;
grant execute on function public.get_public_registration_counts(uuid[]) to anon, authenticated;
