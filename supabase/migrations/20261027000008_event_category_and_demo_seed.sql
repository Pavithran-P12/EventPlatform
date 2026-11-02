-- Event category + separable demo seed support.
-- Every dummy row created by supabase/seed-demo.sql is tagged 'demo-seed'
-- (organizations.slug / events.slug prefix, profiles/registrations email
-- domain, auth user email). Cleanup is one call:
--   select public.purge_demo_seed();
-- That function deletes ONLY demo rows (real orgs/events/users untouched)
-- and also removes the demo auth users, which cascades their profiles.

-- Idempotent: safe to re-run in the SQL Editor.
do $$ begin
  create type public.event_category as enum (
    'symposium', 'sports', 'workshop', 'community', 'conference'
  );
exception when duplicate_object then null;
end $$;

alter table public.events
  add column if not exists category public.event_category not null default 'community';

create index if not exists events_category_idx
  on public.events (category)
  where status = 'published' and is_public;

-- Public event cards/detail show the organiser name, but organizations RLS
-- is member-only, so anon joins returned null and the UI fell back to a
-- generic label for every event. Expose ONLY the name of organisations
-- that own at least one published, public event.
drop policy if exists "organizations_select_public_event_owner" on public.organizations;
create policy "organizations_select_public_event_owner"
  on public.organizations for select to anon, authenticated
  using (
    exists (
      select 1 from public.events e
      where e.organization_id = organizations.id
        and e.status = 'published'
        and e.is_public
    )
  );

create or replace function public.purge_demo_seed()
returns table (
  registrations_deleted bigint,
  events_deleted bigint,
  organizations_deleted bigint,
  demo_users_deleted bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_registrations bigint := 0;
  v_events bigint := 0;
  v_orgs bigint := 0;
  v_users bigint := 0;
begin
  -- Registrations on demo events (also cascaded by event delete, counted first).
  delete from public.registrations r
  using public.events e
  where r.event_id = e.id and e.slug like 'demo-seed-%';
  get diagnostics v_registrations = row_count;

  -- Any stray demo registrations not attached to a demo event.
  delete from public.registrations where email like '%@demo-seed.example.com';

  -- Events -> cascades event_modules, registration_forms/fields/answers, orders.
  delete from public.events where slug like 'demo-seed-%';
  get diagnostics v_events = row_count;

  -- Organizations -> cascades organization_members + any remaining events.
  delete from public.organizations where slug like 'demo-seed-%';
  get diagnostics v_orgs = row_count;

  -- Demo auth users -> cascades public.profiles + organization_members.
  delete from auth.users where email like '%@demo-seed.example.com';
  get diagnostics v_users = row_count;

  -- Safety net if a demo profile somehow outlived its auth user.
  delete from public.profiles where email like '%@demo-seed.example.com';

  return query select v_registrations, v_events, v_orgs, v_users;
end;
$$;

revoke all on function public.purge_demo_seed() from public;
revoke all on function public.purge_demo_seed() from anon, authenticated;
-- Intentionally no grant: run via SQL Editor / service role only.
