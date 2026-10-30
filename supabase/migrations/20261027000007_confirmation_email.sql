-- Migration 7: track registration confirmation emails.
-- The timestamp doubles as an idempotency claim: the server sets it
-- atomically (only where still null) before sending, so the capture
-- path and the webhook path can never send two confirmations for the
-- same registration.

alter table public.registrations
  add column if not exists confirmation_email_sent_at timestamptz;
