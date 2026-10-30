-- Phase 5: expire abandoned paid checkouts.
--
-- A pending_payment registration reserves a seat. If the buyer abandons
-- PayPal checkout, that seat must eventually be released. This function
-- cancels stale pending orders and their pending_payment registrations.
-- It never touches paid, captured, refunded, or confirmed records.

create or replace function public.expire_stale_pending_payments(
  stale_after interval default interval '30 minutes'
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  expired_count integer := 0;
  stale_order record;
begin
  for stale_order in
    select id, registration_id
    from public.orders
    where status = 'pending'
      and created_at < now() - stale_after
    for update skip locked
  loop
    update public.orders
    set status = 'cancelled'
    where id = stale_order.id
      and status = 'pending';

    update public.registrations
    set status = 'cancelled'
    where id = stale_order.registration_id
      and status = 'pending_payment';

    expired_count := expired_count + 1;
  end loop;

  return expired_count;
end;
$$;

revoke all on function public.expire_stale_pending_payments(interval) from public;
-- Service role only: this is called by trusted server-side maintenance code,
-- never by browsers or anonymous users.
