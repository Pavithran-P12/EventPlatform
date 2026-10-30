# Setup

## Prerequisites

- Node.js 20+ (developed on Node 24)
- npm
- A Supabase project (not yet created — see below)
- Optional for local database work: Docker + Supabase CLI (`npx supabase ...`)

## Environment variables

Two separate settings locations — they never share a file, so changing
one cannot break the other:

| Setting | Local development | Production (Git/Vercel) |
|---|---|---|
| File / location | `.env.local` in the project folder (git-ignored, never committed) | Vercel → Project → Settings → Environment Variables |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://p12vizha.vercel.app` |
| Supabase keys | Same project values, copied from the dashboard | Same names, set per environment (Production/Preview) |
| PayPal | Sandbox values in `.env.local` (Phase 4) | Sandbox values in Vercel env vars (Phase 4) |

Copy `.env.example` to `.env.local` and fill in real values locally.
Never commit `.env.local` or share secrets in chat/tickets.
If `NEXT_PUBLIC_APP_URL` is missing, the app defaults to
`http://localhost:3000` so builds never fail on it — still set it
explicitly in Vercel so production links use the real origin.

| Variable | Where to get it | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL | Browser-safe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page → anon / publishable key (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` also accepted) | Browser-safe, RLS still applies |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page → service_role key | **Server-only. Bypasses RLS.** |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally; production origin on Vercel | Browser-safe |
| `PAYPAL_ENV` | `sandbox` until go-live | Server |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | PayPal developer dashboard → Apps & Credentials → Sandbox | Server-only |
| `PAYPAL_WEBHOOK_ID` | PayPal app → Webhooks (after webhook is registered) | Server-only |

PayPal variables are only required in Phase 4. The app builds and runs
without them; `lib/env.ts` validates them only when server env is read.

## Supabase project setup (manual, one-time)

1. Create a project at supabase.com. Pick a region close to your users.
2. Project Settings → API: copy the URL and keys into `.env.local`.
3. Apply the database migration:
   - Hosted: SQL Editor → paste `supabase/migrations/20261027000001_foundation.sql` → Run, **or**
   - CLI: `npx supabase link --project-ref <ref>` then `npx supabase db push`.
4. Authentication → Providers → Google: enable after creating the OAuth
   client below. Add redirect URL `http://localhost:3000/auth/callback`
   (and the Vercel production URL later) under Authentication → URL Configuration.

## Google OAuth setup (manual, one-time)

1. Google Cloud Console → APIs & Services → Credentials → Create OAuth
   client ID (Web application).
2. Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   (shown in the Supabase Google provider panel).
3. Paste the client ID/secret into Supabase → Authentication → Providers → Google.
4. No Google credentials go into this repo's env files.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test
npm run build
```

Without Supabase env vars the starter page still builds/renders; the
session proxy skips refresh and any Supabase-backed feature will fail
with a clear env error until `.env.local` is configured.

## Optional: local Supabase

```bash
npx supabase start   # requires Docker; uses supabase/config.toml
npx supabase db reset
```

## Deployment (Vercel)

1. Import the repo in Vercel (connected to GitHub `main`).
2. Project → Settings → Environment Variables — set these for
   Production (and Preview if used). These are the production settings;
   they are independent of local `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL=https://p12vizha.vercel.app`
3. Supabase → Authentication → URL Configuration must allow
   `https://p12vizha.vercel.app/auth/callback` (already added).
4. PayPal webhook URL (Phase 4): `https://p12vizha.vercel.app/api/webhooks/paypal`.

## Phase 4: PayPal checkout + webhooks (one-time setup)

1. Apply the payments migration in the Supabase SQL Editor:
   `supabase/migrations/20261027000003_payments.sql` (adds `orders`,
   `payments`, `payment_webhook_events`, and `register_for_paid_event()`).
2. Make sure `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` **and** Vercel
   is the real key starting with `sb_secret_` (Project Settings → API).
   The webhook and order services use it server-side only.
3. Register the webhook in the PayPal developer dashboard:
   Apps & Credentials → Sandbox → your app → Webhooks → Add webhook:
   - URL: `https://p12vizha.vercel.app/api/webhooks/paypal`
   - Events: `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`,
     `PAYMENT.CAPTURE.DENIED`, `PAYMENT.CAPTURE.REFUNDED`
4. Copy the generated Webhook ID into `PAYPAL_WEBHOOK_ID` in `.env.local`
   **and** separately in Vercel env vars, then redeploy.
5. Test with a sandbox buyer account: create + publish a paid event,
   register, approve payment on PayPal, and confirm the registration
   shows as confirmed/paid in the dashboard participants list.

Note: events are priced in INR. If the sandbox business account cannot
accept INR, PayPal will reject order creation — switch the sandbox
account country/currency or test with a USD-priced event.

## Phase 5: production readiness

### Test commands

```bash
npm run lint
npm run typecheck
npm test                  # unit tests (no live services needed)
npm run test:integration  # Supabase boundary tests; needs .env.local
npm run build
```

Integration tests are opt-in (`RUN_INTEGRATION_TESTS=1` is set by the
`test:integration` script environment in CI; locally the script reads
`.env.local` via `tests/setup-env.ts`). They verify anonymous visitors
cannot read registrations or webhook events, public counts are
aggregate-only, and payment expiry is service-role only.

### Abandoned checkout cleanup

Migration `20261027000005_payment_expiry.sql` adds
`expire_stale_pending_payments()` (service-role only). It cancels
`pending` orders older than 30 minutes and releases their
`pending_payment` seats. It never touches paid/confirmed records.
Call it from trusted server-side maintenance (for example a scheduled
job) via `expireStalePendingPayments()` in `lib/payments/orders.ts`,
or manually in the SQL Editor:

```sql
select public.expire_stale_pending_payments();
```

### Refund verification (do once per environment)

1. Complete a sandbox purchase so a registration is `confirmed`.
2. Dashboard → event → Participants → **Refund**.
3. Expected: order `refunded`, payment `refunded`, registration
   `cancelled`, seat released, and a `PAYMENT.CAPTURE.REFUNDED`
   webhook recorded (duplicate deliveries are ignored safely).

### PayPal go-live checklist (no code changes)

1. PayPal developer dashboard → Apps & Credentials → **Live** → create
   or open the live app (verified live business account required).
2. Register the webhook under the **Live** app:
   `https://p12vizha.vercel.app/api/webhooks/paypal` with the same four
   events; copy the new Webhook ID.
3. Update four values in `.env.local` **and** Vercel (Production), then
   redeploy: `PAYPAL_ENV=live`, live `PAYPAL_CLIENT_ID`, live
   `PAYPAL_CLIENT_SECRET`, live `PAYPAL_WEBHOOK_ID`.
4. Test with a small real payment from a **different** PayPal account
   (PayPal blocks self-payments), then refund it from the dashboard.
5. India note: PayPal India live accounts support international
   payments only; confirm INR/domestic support before pricing events
   in ₹ for Indian buyers.

### Production checklist

- [ ] All migrations applied (foundation, registration, payments,
      public counts, payment expiry).
- [ ] Vercel env vars present for Production, then redeployed after
      any change (env changes do not apply to existing deployments).
- [ ] `NEXT_PUBLIC_APP_URL=https://p12vizha.vercel.app` in Vercel.
- [ ] Supabase redirect URLs include local + production callbacks.
- [ ] Vercel Deployment Protection does not block the production
      domain for visitors.
- [ ] Sandbox purchase + refund verified in production before going
      live with real money.

## Current status / blockers

- Supabase project: created (`unvhxnyydbimszvheqif`); foundation
  migration applied and verified (tables + RPC live).
- Phase 3 migration (`20261027000002_registration.sql`): applied and
  verified live (event modules, registration forms/fields,
  registrations/answers, atomic `register_for_free_event()` RPC).
- Phase 4 migration (`20261027000003_payments.sql`): applied and
  verified live (orders, payments, webhook events, paid-registration
  RPC). PayPal webhook registered; `PAYPAL_WEBHOOK_ID` set locally.
- Google OAuth: enabled in Supabase; local login verified end-to-end
  (Google sign-in → `/auth/callback` → `/dashboard`).
- Vercel: deployed at `https://p12vizha.vercel.app`; env vars are set
  via the Vercel–Supabase connection. `NEXT_PUBLIC_APP_URL` must be set
  explicitly in Vercel (see Deployment above).
- PayPal sandbox: **verified end-to-end locally and in production**
  (2026-10-31) — checkout → buyer approval → capture → order `paid`,
  payment `captured`, registration `confirmed`, and both webhooks
  (`CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`) received
  and processed in both environments. Sandbox notes: the seller
  account rejects INR (`CURRENCY_NOT_SUPPORTED`) and India buyers
  cannot pay India sellers (PayPal India domestic rule) — test with
  a USD event and a US sandbox buyer.
- Public seat counts: registrations have no anon read policy
  (attendee privacy), so public pages get counts from the
  counts-only `get_public_registration_counts()` RPC (migration
  `20261027000004_public_counts.sql`, applied and verified live).
- Phase 5: unit tests cover env validation, money/payment helpers,
  and migration security invariants (36 tests). Supabase boundary
  integration tests are opt-in via `npm run test:integration` and
  pass live (4/4). Migrations 5 (stale pending-payment expiry) and 6
  (expiry locked to service role — the boundary test caught anonymous
  EXECUTE granted by Supabase defaults) are applied and verified.
  Refund path is implemented; run the refund verification above once
  per environment.
