import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import {
  getPublicEventBySlug,
  getPublicRegistrationFields,
} from "@/lib/db/queries";
import {
  formatDateRange,
  formatPrice,
  gradientForKey,
  seatsLeft,
} from "@/lib/db/helpers";
import { SiteHeaderView } from "@/components/site-header-view";
import RegistrationForm from "@/app/events/[slug]/registration-form";
import {
  CalendarIcon,
  GlobeIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/icons";

async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();
  const fields = await getPublicRegistrationFields(event.id);
  const left = seatsLeft(event.capacity, event.registered_count);
  const percentFull =
    event.capacity && event.capacity > 0
      ? Math.min(100, Math.round((event.registered_count / event.capacity) * 100))
      : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeaderView displayName={null} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link href="/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          ← All events
        </Link>

        <div className={`relative mt-4 overflow-hidden rounded-3xl bg-gradient-to-br ${gradientForKey(event.slug)}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
          <div className="relative px-6 pb-8 pt-20 sm:px-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {event.organization_name}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${event.is_free ? "bg-emerald-500 text-white" : "bg-white/95 text-slate-800"}`}>
                {formatPrice(event)}
              </span>
            </div>
            <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {event.title}
            </h1>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
              <h2 className="text-base font-semibold text-slate-900">About this event</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {event.description ?? "Details coming soon from the organiser."}
              </p>
              <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2.5">
                  <CalendarIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" />
                  <div>
                    <dt className="font-medium text-slate-700">Date</dt>
                    <dd className="text-slate-500">{formatDateRange(event.starts_at, event.ends_at)}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  {event.is_online ? (
                    <GlobeIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" />
                  ) : (
                    <MapPinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" />
                  )}
                  <div>
                    <dt className="font-medium text-slate-700">Location</dt>
                    <dd className="text-slate-500">{event.is_online ? "Online event" : (event.location ?? "Location TBA")}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <UsersIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" />
                  <div>
                    <dt className="font-medium text-slate-700">Hosted by</dt>
                    <dd className="text-slate-500">{event.organization_name}</dd>
                  </div>
                </div>
              </dl>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
              <h2 className="text-base font-semibold text-slate-900">Capacity</h2>
              {percentFull !== null ? (
                <>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${left === 0 ? "bg-red-500" : "bg-indigo-500"}`}
                      style={{ width: `${percentFull}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {event.registered_count} of {event.capacity} seats booked
                    {left === 0 ? " — fully booked" : ` — ${left} remaining`}
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  {event.registered_count} people registered so far. Open capacity.
                </p>
              )}
            </section>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <RegistrationForm event={event} fields={fields} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Loading event…
        </div>
      }
    >
      <EventDetail params={params} />
    </Suspense>
  );
}
