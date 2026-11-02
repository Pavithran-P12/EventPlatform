<div align="center">

<img src="public/brand/p12vizha-symbol.svg" alt="p12Vizha logo" width="140" />

# p12Vizha

**Run any event. Reuse everything.**

*Vizha* (விழா) means **festival** in Tamil.

[**🌐 Live app → p12vizha.vercel.app**](https://p12vizha.vercel.app)

Built for the [Meta Global AI Developer Hackathon](https://cerebralvalley.ai/e/meta-ai-developer-hackathon) by Cerebral Valley, with Meta's **Muse Wonder** model.

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)
![PayPal](https://img.shields.io/badge/Payments-PayPal-003087?logo=paypal&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel)
![Tests](https://img.shields.io/badge/unit%20tests-36%20passing-1F7A4C)

</div>

---

## Why p12Vizha?

Anyone who has organised a college symposium, a local tournament or a community drive knows the routine: payment screenshots in group chats, a paper list at the gate, and a spreadsheet that always breaks.

p12Vizha replaces all of that with **one reusable platform**. Organisers set up once and reuse it for every event; attendees register and pay in under a minute.

## ✨ Features

### For organisers
- **Google sign-in.** No passwords to manage.
- **Organisations.** Every event, member and registration belongs to an organisation.
- **Create an event once:** dates, venue, capacity, and free or paid tickets (INR).
- **Reusable modules** per event: Registration, Payments, Schedule, Check-in.
- **Publish when ready**, edit any time, cancel or delete drafts (with a confirm step).
- **Live participants list:** who's confirmed, who's pending, who was refunded.
- **One-click refunds** through PayPal, after a confirm step.
- **Overview dashboard** across all your events and registrations.

### For attendees
- **Discover and search** every public event.
- **Free events:** name, email, done. No account needed.
- **Paid events:** secure checkout on PayPal. The seat is confirmed only after PayPal verifies the payment.
- **Confirmation email** sent automatically, exactly once.

### Built to be trusted with real money
- 🔒 **Row-level security** in Supabase keeps attendee data private. Public pages only see aggregate seat counts.
- ✅ **PayPal webhooks are verified**, and duplicate deliveries are ignored.
- ⏱️ **Unpaid checkouts expire after 30 minutes** and release their seat.
- 🧮 **Capacity and duplicate registrations are enforced in the database**, not just in the UI.
- 📧 **Idempotent confirmation emails**, so nobody gets the same email twice.
- 🧪 **36 unit tests**, plus opt-in integration tests for database security boundaries.

## 🤖 Built with Meta's Muse Wonder

p12Vizha was built with Meta's **Muse Wonder** model as the main development partner, using the free access and API keys Meta provided to hackathon participants through the Meta platform. Muse Wonder was used to:

- plan the architecture and break the build into phases (foundation → registration → events → payments → production readiness);
- write and refactor the Next.js and Supabase code, including database migrations and row-level security policies;
- build the PayPal payment flow: order creation, capture, webhook verification, refunds and expiry of unpaid checkouts;
- write the unit tests and debug issues along the way.

The developer's role was orchestrating: deciding what to build, reviewing every change and shaping the product.

## 🛠️ Tech stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions), React 19, TypeScript |
| Styling | Tailwind CSS 4, Geist font |
| Database & auth | [Supabase](https://supabase.com): Postgres, row-level security, Google OAuth |
| Payments | [PayPal](https://developer.paypal.com) Orders API + webhooks |
| Email | [Resend](https://resend.com) |
| Validation & tests | Zod, Vitest |
| Hosting | [Vercel](https://vercel.com) |
| AI | Meta **Muse Wonder** (development partner) |

## 🚀 Getting started

**Prerequisites:** Node.js 20+, npm, and a Supabase project.

```bash
git clone https://github.com/Pavithran-P12/EventPlatform.git
cd EventPlatform
npm install
cp .env.example .env.local   # then fill in your Supabase / PayPal / Resend values
npm run dev                  # http://localhost:3000
```

Apply the SQL migrations in `supabase/migrations/` to your Supabase project (SQL Editor, or `npx supabase db push`).

📘 The full setup guide (environment variables, Google OAuth, PayPal webhooks, Resend, deployment) is in **[docs/setup.md](docs/setup.md)**.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint with ESLint |
| `npm run typecheck` | Type-check with TypeScript |
| `npm test` | Run unit tests |
| `npm run test:integration` | Run Supabase security-boundary tests (needs `.env.local`) |

## 🔭 Roadmap: Phase II

- **AI-generated tournament brackets** for any competition (cricket, football, badminton, chess, quizzes), with fixtures created automatically from the teams that register, powered by Meta's models.
- **Smarter scheduling** that balances venues, time slots and rest gaps between matches.
- **One platform** where the same event that takes registrations also runs the whole competition.

## 🎨 Brand

The p12Vizha mark is a *thoranam*: the string of mango leaves hung over doorways for Tamil festivals. Every event starts at the entrance. Logo files are in [`public/brand/`](public/brand/).

---

<div align="center">

Built with ❤️ by **[Pavithran M](https://github.com/Pavithran-P12)** for the Meta Global AI Developer Hackathon

[**Try p12Vizha →**](https://p12vizha.vercel.app)

</div>
