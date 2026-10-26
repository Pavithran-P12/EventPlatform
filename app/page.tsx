import Link from "next/link";
import { Suspense } from "react";

import EventCard from "@/components/event-card";
import {
  ArrowRightIcon,
  CardIcon,
  CheckCircleIcon,
  FormIcon,
  LayoutGridIcon,
  SparklesIcon,
} from "@/components/icons";
import { SiteHeader } from "@/components/site-header";
import { getPublicEvents } from "@/lib/db/queries";

const features = [
  {
    icon: LayoutGridIcon,
    title: "Reusable event modules",
    text: "Registration, payments, schedules, and check-in snap into any event — symposium, tournament, workshop, or meetup.",
  },
  {
    icon: FormIcon,
    title: "Custom registration forms",
    text: "Build forms with the fields you actually need. Capacity limits and duplicate protection built in.",
  },
  {
    icon: CardIcon,
    title: "Payments without spreadsheets",
    text: "Collect fees online, track who has paid, and reconcile everything from one dashboard.",
  },
  {
    icon: CheckCircleIcon,
    title: "Fast day-of check-in",
    text: "Search or scan to check participants in. No more paper lists at the gate.",
  },
];

const eventTypes = [
  "College symposiums",
  "Sports tournaments",
  "Workshops",
  "Community events",
  "Conferences",
  "Alumni meets",
];

const stats = [
  { value: "6+", label: "Event formats supported" },
  { value: "4", label: "Reusable modules" },
  { value: "1", label: "Dashboard for everything" },
];

async function FeaturedEvents() {
  const events = await getPublicEvents();
  const featured = events.slice(0, 3);
  if (featured.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
        <p className="font-medium text-slate-700">New events are being published</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
          Organisers are setting up right now. Browse the discovery page or
          create the first event for your organisation.
        </p>
        <Link
          href="/dashboard/events/new"
          className="mt-5 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Create an event
        </Link>
      </div>
    );
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense
        fallback={<div className="h-16 border-b border-border bg-background" />}
      >
        <SiteHeader />
      </Suspense>
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-indigo-400/20 blur-3xl" />
            <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />
            <div className="absolute left-[-6rem] top-64 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3.5 py-1.5 text-sm font-medium text-primary shadow-sm">
              <SparklesIcon className="h-4 w-4" />
              For organisers who would rather run events than spreadsheets
            </span>
            <h1 className="mx-auto mt-7 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              Run any event.{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Reuse everything.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Create events, collect registrations and payments, publish
              schedules, and check people in — one platform for symposiums,
              tournaments, workshops, and community events.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/events/new"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-lg shadow-indigo-600/25 transition hover:bg-primary-hover"
              >
                Create your event
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/events"
                className="rounded-xl border border-border bg-card px-6 py-3 font-medium shadow-sm transition hover:bg-muted"
              >
                Browse events
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {eventTypes.map((type) => (
                <span
                  key={type}
                  className="rounded-full border border-border bg-white/80 px-3.5 py-1.5 text-sm text-muted-foreground shadow-sm"
                >
                  {type}
                </span>
              ))}
            </div>
            <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-border/80 pt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="order-2 mt-1 block text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm sm:normal-case sm:tracking-normal">
                    {stat.label}
                  </dt>
                  <dd className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                Discover
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Featured events
              </h2>
              <p className="mt-1 text-muted-foreground">
                Happening soon on EventPlatform
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              View all events
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <Suspense
            fallback={<p className="text-sm text-slate-500">Loading events…</p>}
          >
            <FeaturedEvents />
          </Suspense>
        </section>

        <section className="relative overflow-hidden bg-slate-950">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -top-24 left-1/3 h-72 w-[36rem] rounded-full bg-indigo-600/30 blur-3xl" />
            <div className="absolute bottom-[-8rem] right-[-4rem] h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your next event, minus the chaos
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
              Set up in minutes. Reuse your forms, schedules, and settings for
              every event after that.
            </p>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-slate-950 shadow-lg transition hover:bg-slate-100"
            >
              Open the organiser dashboard
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p className="font-medium text-foreground">EventPlatform</p>
          <p>One platform for symposiums, tournaments, workshops, and community events.</p>
          <p>© 2026 EventPlatform</p>
        </div>
      </footer>
    </div>
  );
}
