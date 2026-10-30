-- Migration 6: lock down stale-payment expiry to the service role.
-- Supabase default privileges grant EXECUTE on new functions directly to
-- anon/authenticated, so migration 5's revoke from public was not enough.
-- The expiry function takes a caller-controlled interval, so anonymous
-- execution would let anyone cancel pending orders early.

revoke execute on function public.expire_stale_pending_payments(interval)
  from anon, authenticated;
