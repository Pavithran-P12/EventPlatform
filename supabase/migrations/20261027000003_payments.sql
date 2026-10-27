-- Phase 4: orders, payments, provider webhook idempotency.
-- Money is only ever confirmed by verified provider state (capture API
-- response or verified webhook), never by a browser redirect.

create type public.order_status as enum (
  'pending', 'paid', 'failed', 'cancelled', 'refunded', 'partially_refunded'
);
create type public.payment_status as enum (
  'initiated', 'approved', 'captured', 'failed', 'refunded', 'partially_refunded'
);
create type public.payment_provider as enum ('paypal');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.registrations (id) on delete cascade,
  event_id uuid not null references public.events (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  status public.order_status not null default 'pending',
  provider public.payment_provider not null default 'paypal',
  provider_order_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_event_id_idx on public.orders (event_id);
create index orders_organization_id_idx on public.orders (organization_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider public.payment_provider not null default 'paypal',
  provider_payment_id text unique,
  provider_capture_id text unique,
  status public.payment_status not null default 'initiated',
  amount_cents integer not null check (amount_cents > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_order_id_idx on public.payments (order_id);

create table public.payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider public.payment_provider not null default 'paypal',
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.payment_webhook_events enable row level security;

-- Organisers can read their organisation's orders/payments. All writes go
-- through server-side service code (service role) after provider checks.
create policy "orders_select_member"
  on public.orders for select to authenticated
  using (public.is_org_member(organization_id));
create policy "payments_select_member"
  on public.payments for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and public.is_org_member(o.organization_id)
    )
  );
-- payment_webhook_events: no policies — service role only.

-- Atomic paid registration: reserves a seat as pending_payment.
-- Same capacity/duplicate rules as free registration.
create or replace function public.register_for_paid_event(
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
  if target_event.is_free then
    raise exception 'FREE_EVENT';
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
    'pending_payment'
  )
  returning * into created;
  return created;
end;
$$;

revoke all on function public.register_for_paid_event(uuid, text, text, text, uuid) from public;
grant execute on function public.register_for_paid_event(uuid, text, text, text, uuid) to anon, authenticated;
