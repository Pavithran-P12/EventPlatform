-- Phase 3: event modules, registration forms, registrations.
-- Free-event registration is atomic via register_for_free_event():
-- capacity and duplicate checks happen inside one transaction so
-- concurrent submissions cannot oversell or double-register.

create type public.event_module_key as enum ('registration', 'payments', 'schedule', 'checkin');
create type public.registration_field_type as enum ('text', 'email', 'phone', 'textarea', 'select', 'checkbox');
create type public.registration_status as enum ('confirmed', 'pending_payment', 'cancelled', 'waitlisted');

create table public.event_modules (
  event_id uuid not null references public.events (id) on delete cascade,
  module_key public.event_module_key not null,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_id, module_key)
);

create table public.registration_forms (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null unique references public.events (id) on delete cascade,
  title text not null default 'Registration' check (char_length(title) between 1 and 200),
  description text check (char_length(description) <= 2000),
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.registration_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.registration_forms (id) on delete cascade,
  field_key text not null check (field_key ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$'),
  label text not null check (char_length(label) between 1 and 200),
  field_type public.registration_field_type not null default 'text',
  is_required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (form_id, field_key)
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  form_id uuid references public.registration_forms (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  full_name text not null check (char_length(full_name) between 1 and 200),
  email text not null check (position('@' in email) > 1),
  email_normalized text generated always as (lower(btrim(email))) stored,
  phone text check (char_length(phone) <= 50),
  status public.registration_status not null default 'confirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One active registration per email per event (cancelled rows don't block).
create unique index registrations_active_email_unique
  on public.registrations (event_id, email_normalized)
  where status <> 'cancelled';
create index registrations_event_id_idx on public.registrations (event_id);
create index registration_fields_form_id_idx on public.registration_fields (form_id);

create table public.registration_answers (
  registration_id uuid not null references public.registrations (id) on delete cascade,
  field_id uuid not null references public.registration_fields (id) on delete cascade,
  value text,
  created_at timestamptz not null default now(),
  primary key (registration_id, field_id)
);

create trigger event_modules_set_updated_at
  before update on public.event_modules
  for each row execute function public.set_updated_at();
create trigger registration_forms_set_updated_at
  before update on public.registration_forms
  for each row execute function public.set_updated_at();
create trigger registration_fields_set_updated_at
  before update on public.registration_fields
  for each row execute function public.set_updated_at();
create trigger registrations_set_updated_at
  before update on public.registrations
  for each row execute function public.set_updated_at();

alter table public.event_modules enable row level security;
alter table public.registration_forms enable row level security;
alter table public.registration_fields enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_answers enable row level security;

-- Helper: organisation that owns an event (for member checks via RLS).
create or replace function public.event_org_id(target_event_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id from public.events where id = target_event_id;
$$;

create policy "event_modules_select_public_or_member"
  on public.event_modules for select to anon, authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.status = 'published' and e.is_public
    )
    or public.is_org_member(public.event_org_id(event_id))
  );
create policy "event_modules_write_member"
  on public.event_modules for all to authenticated
  using (public.is_org_member(public.event_org_id(event_id)))
  with check (public.is_org_member(public.event_org_id(event_id)));

create policy "registration_forms_select_public_or_member"
  on public.registration_forms for select to anon, authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id and e.status = 'published' and e.is_public
    )
    or public.is_org_member(public.event_org_id(event_id))
  );
create policy "registration_forms_write_member"
  on public.registration_forms for all to authenticated
  using (public.is_org_member(public.event_org_id(event_id)))
  with check (public.is_org_member(public.event_org_id(event_id)));

create policy "registration_fields_select_public_or_member"
  on public.registration_fields for select to anon, authenticated
  using (
    exists (
      select 1
      from public.registration_forms f
      join public.events e on e.id = f.event_id
      where f.id = form_id and e.status = 'published' and e.is_public
    )
    or public.is_org_member((
      select f.event_id from public.registration_forms f where f.id = form_id
    ))
  );
create policy "registration_fields_write_member"
  on public.registration_fields for all to authenticated
  using (
    public.is_org_member((
      select f.event_id from public.registration_forms f where f.id = form_id
    ))
  )
  with check (
    public.is_org_member((
      select f.event_id from public.registration_forms f where f.id = form_id
    ))
  );

-- Registrations are never directly readable/writable by the public.
-- Guests register through register_for_free_event(); members read via RLS.
create policy "registrations_select_member_or_self"
  on public.registrations for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_org_member(public.event_org_id(event_id))
  );
create policy "registrations_update_member"
  on public.registrations for update to authenticated
  using (public.is_org_member(public.event_org_id(event_id)))
  with check (public.is_org_member(public.event_org_id(event_id)));
create policy "registrations_delete_admin"
  on public.registrations for delete to authenticated
  using (
    public.has_org_role(
      public.event_org_id(event_id),
      array['owner', 'admin']::public.organization_role[]
    )
  );

create policy "registration_answers_select_member"
  on public.registration_answers for select to authenticated
  using (
    exists (
      select 1 from public.registrations r
      where r.id = registration_id
        and public.is_org_member(public.event_org_id(r.event_id))
    )
  );

-- Atomic free registration. Returns a stable machine-readable code in
-- error messages: EVENT_NOT_FOUND, REGISTRATION_CLOSED, PAID_EVENT,
-- ALREADY_REGISTERED, EVENT_FULL.
create or replace function public.register_for_free_event(
  target_event_id uuid,
  attendee_name text,
  attendee_email text,
  attendee_phone text default null,
  attendee_user_id uuid default null
)
returns public.registrations
language plpgsql
security definer
set search_path = public
as $$
declare
  target_event public.events;
  active_count integer;
  created public.registrations;
begin
  select * into target_event from public.events where id = target_event_id for update;
  if not found then
    raise exception 'EVENT_NOT_FOUND';
  end if;
  if target_event.status <> 'published' or not target_event.is_public then
    raise exception 'REGISTRATION_CLOSED';
  end if;
  if not target_event.is_free then
    raise exception 'PAID_EVENT';
  end if;
  if exists (
    select 1 from public.registrations
    where event_id = target_event_id
      and email_normalized = lower(btrim(attendee_email))
      and status <> 'cancelled'
  ) then
    raise exception 'ALREADY_REGISTERED';
  end if;
  if target_event.capacity is not null then
    select count(*) into active_count
    from public.registrations
    where event_id = target_event_id and status <> 'cancelled';
    if active_count >= target_event.capacity then
      raise exception 'EVENT_FULL';
    end if;
  end if;

  insert into public.registrations (event_id, form_id, user_id, full_name, email, phone, status)
  values (
    target_event_id,
    (select id from public.registration_forms where event_id = target_event_id),
    attendee_user_id,
    btrim(attendee_name),
    btrim(attendee_email),
    nullif(btrim(coalesce(attendee_phone, '')), ''),
    'confirmed'
  )
  returning * into created;
  return created;
end;
$$;

revoke all on function public.register_for_free_event(uuid, text, text, text, uuid) from public;
grant execute on function public.register_for_free_event(uuid, text, text, text, uuid) to anon, authenticated;
