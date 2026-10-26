-- Phase 2 foundation: profiles, organizations, memberships, events.
-- Later features (registration, payments, invites, schedules, check-ins)
-- are added in subsequent migrations.

create extension if not exists pgcrypto;

create type public.organization_role as enum ('owner', 'admin', 'member');
create type public.event_status as enum ('draft', 'published', 'cancelled', 'completed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_format check (position('@' in email) > 1)
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 2000),
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.organization_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_by uuid not null references public.profiles (id) on delete restrict,
  title text not null check (char_length(title) between 3 and 200),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 10000),
  status public.event_status not null default 'draft',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  location text check (char_length(location) <= 500),
  is_online boolean not null default false,
  capacity integer check (capacity is null or capacity > 0),
  is_free boolean not null default true,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  is_public boolean not null default true,
  cover_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, slug),
  check (ends_at > starts_at),
  check (is_free or price_cents > 0)
);

create index organization_members_user_id_idx
  on public.organization_members (user_id);
create index events_organization_id_idx
  on public.events (organization_id);
create index events_public_discovery_idx
  on public.events (starts_at)
  where status = 'published' and is_public;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();
create trigger organization_members_set_updated_at
  before update on public.organization_members
  for each row execute function public.set_updated_at();
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.profiles.display_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Membership helpers. security definer + direct membership-table lookup
-- avoids recursive RLS evaluation on organization_members itself.
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(org_id uuid, allowed_roles public.organization_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = auth.uid()
      and role = any (allowed_roles)
  );
$$;

create or replace function public.create_organization_with_owner(
  org_name text,
  org_slug text,
  org_description text default null
)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  created_org public.organizations;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.organizations (name, slug, description, created_by)
  values (org_name, org_slug, org_description, auth.uid())
  returning * into created_org;

  insert into public.organization_members (organization_id, user_id, role)
  values (created_org.id, auth.uid(), 'owner');

  return created_org;
end;
$$;

revoke all on function public.create_organization_with_owner(text, text, text) from public;
grant execute on function public.create_organization_with_owner(text, text, text) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.events enable row level security;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "organizations_select_member"
  on public.organizations for select to authenticated
  using (public.is_org_member(id));
create policy "organizations_update_admin"
  on public.organizations for update to authenticated
  using (public.has_org_role(id, array['owner', 'admin']::public.organization_role[]))
  with check (public.has_org_role(id, array['owner', 'admin']::public.organization_role[]));
create policy "organizations_delete_owner"
  on public.organizations for delete to authenticated
  using (public.has_org_role(id, array['owner']::public.organization_role[]));
-- No direct INSERT policy: creation goes through
-- create_organization_with_owner() so the creator becomes owner atomically.

create policy "organization_members_select_member"
  on public.organization_members for select to authenticated
  using (public.is_org_member(organization_id));
create policy "organization_members_insert_admin"
  on public.organization_members for insert to authenticated
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.organization_role[]));
create policy "organization_members_update_admin"
  on public.organization_members for update to authenticated
  using (public.has_org_role(organization_id, array['owner', 'admin']::public.organization_role[]))
  with check (public.has_org_role(organization_id, array['owner', 'admin']::public.organization_role[]));
create policy "organization_members_delete_admin_or_self"
  on public.organization_members for delete to authenticated
  using (
    user_id = auth.uid()
    or public.has_org_role(organization_id, array['owner', 'admin']::public.organization_role[])
  );

create policy "events_select_public_or_member"
  on public.events for select to anon, authenticated
  using (
    (status = 'published' and is_public)
    or public.is_org_member(organization_id)
  );
create policy "events_insert_member"
  on public.events for insert to authenticated
  with check (
    created_by = auth.uid()
    and public.is_org_member(organization_id)
  );
create policy "events_update_member"
  on public.events for update to authenticated
  using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
create policy "events_delete_admin_draft_only"
  on public.events for delete to authenticated
  using (
    status = 'draft'
    and public.has_org_role(organization_id, array['owner', 'admin']::public.organization_role[])
  );
