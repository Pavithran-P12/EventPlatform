import Link from "next/link";

import { EventCard } from "@/components/event-card";
import { SiteHeader } from "@/components/site-header";
import { mockEvents } from "@/lib/mock/data";

const features = [
  {
    icon: "🧩",
    title: "Reusable event modules",
    text: "Registration, payments, schedules, and check-in snap into any event — symposium, tournament, workshop, or meetup.",
  },
  {
    icon: "📝",
    title: "Custom registration forms",
    text: "Build forms with the fields you actually need. Capacity limits and duplicate protection built in.",
  },
  {
    icon: "💳",
    title: "Payments without spreadsheets",
    text: "Collect fees online, track who has paid, and reconcile everything from one dashboard.",
  },
  {
    icon: "✅",
    title: "Fast day-of check-in",
    text: "Search or scan to check participants in. No more paper lists at the gate.",
  },
];

const eventTypes = ["College symposiums", "Sports tournaments", "Workshops", "Community events", "Conferences", "Alumni meets"];

export default function HomePage() {
  const featured = mockEvents.filter((e) => e.status === "published").slice(0, 3);
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
          <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-primary">
            For organisers who&apos;d rather run events than spreadsheets
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Run any event. Reuse everything.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Create events, collect registrations and payments, publish schedules,
            and check people in — one platform for symposiums, tournaments,
            workshops, and community events.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard/events/new"
              className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
            >
              Create your event
            </Link>
            <Link
              href="/events"
              className="rounded-lg border border-border bg-card px-6 py-3 font-medium hover:bg-muted"
            >
              Browse events
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {eventTypes.map((type) => (
              <span
                key={type}
                className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground"
              >
                {type}
              </span>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6"
              >
                <div className="text-3xl">{feature.icon}</div>
                <h3 className="mt-3 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Featured events</h2>
              <p className="text-muted-foreground">
                Happening soon on EventPlatform
              </p>
            </div>
            <Link href="/events" className="font-medium text-primary hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
            <h2 className="text-3xl font-bold">Your next event, minus the chaos</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Set up in minutes. Reuse your forms, schedules, and settings for
              every event after that.
            </p>
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90"
            >
              Open the organiser dashboard
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        EventPlatform — frontend preview with sample data. Backend wiring comes in Phase 3+.
      </footer>
    </div>
  );
}
