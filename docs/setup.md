# Setup

## Prerequisites

- Node.js 20+ (developed on Node 24)
- npm
- A Supabase project (not yet created — see below)
- Optional for local database work: Docker + Supabase CLI (`npx supabase ...`)

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values locally.
Never commit `.env.local` or share secrets in chat/tickets.

| Variable | Where to get it | Exposure |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API → Project URL | Browser-safe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same page → anon / publishable key | Browser-safe, RLS still applies |
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

1. Import the repo in Vercel.
2. Set the same env vars in Project Settings → Environment Variables.
3. Set `NEXT_PUBLIC_APP_URL` to the production origin and add
   `<origin>/auth/callback` to Supabase redirect URLs.
4. PayPal webhook URL (Phase 4): `<origin>/api/webhooks/paypal`.

## Current status / blockers

- Supabase project: **not created yet** — migration and RLS policies are
  written but not yet applied or tested against a live database.
- Google OAuth: **not configured yet** — required before Phase 3 auth work.
- PayPal sandbox credentials: **pending** — required only in Phase 4.
- Tenant-isolation / RLS integration tests will be added with the
  features they protect (Phases 3–5), per the incremental plan.
