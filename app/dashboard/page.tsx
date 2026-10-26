import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";
import { getActiveOrganization } from "@/lib/db/org-context";
import {
  getEventRegistrations,
  getOrgEvents,
  getRegistrationCounts,
} from "@/lib/db/queries";
import { formatDateRange } from "@/lib/db/helpers";
import {
  CalendarIcon,
  CardIcon,
  CheckCircleIcon,
  TicketIcon,
  UsersIcon,
} from "@/components/icons";

const statIcons = [CalendarIcon, UsersIcon, CardIcon, CheckCircleIcon];

async function Overview() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const active = await getActiveOrganization(user.id);
  if (!active) redirect("/dashboard/organizations/new");

  const events = await getOrgEvents(active.organization.id);
  const counts = await getRegistrationCounts(events.map((e) => e.id));
  const published = events.filter((e) => e.status === "published");
  const totalRegistrations = events.reduce(
    (sum, e) => sum + (counts.get(e.id) ?? 0),
    0,
  );
  const revenueCents = events.reduce((sum, e) => {
    if (e.is_free) return sum;
    return sum + e.price_cents * (counts.get(e.id) ?? 0);
  }, 0);

  const nextEvent = published
    .filter((e) => new Date(e.starts_at) >= new Date())
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];

  const recentRegistrations = nextEvent
    ? (await getEventRegistrations(nextEvent.id)).slice(0, 5)
    : [];

  const stats = [
    { label: "Total events", value: String(events.length), hint: `${published.length} published` },
    { label: "Registrations", value: String(totalRegistrations), hint: "Across all events" },
    {
      label: "Ticket value",
      value: `₹${(revenueCents / 100).toLocaleString("en-IN")}`,
      hint: "Checkout opens in Phase 4",
    },
    {
      label: "Next event",
      value: nextEvent ? formatDateRange(nextEvent.starts_at, nextEvent.ends_at) : "—",
      hint: nextEvent ? nextEvent.title : "Nothing scheduled",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Overview</h1>
      <p className="mt-1 text-sm text-slate-500">
        {active.organization.name} · signed in as {user.email}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[index];
          return (
            <div key={stat.label} className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200/70">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon className="h-4.5 w-4.5" />
                </span>
              </div>
              <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              <p className="mt-1 truncate text-xs text-slate-400">{stat.hint}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Your events</h2>
            <Link href="/dashboard/events/new" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Create event
            </Link>
          </div>
          {events.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-700">No events yet</p>
              <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
                Create your first event and publish it to start collecting
                registrations.
              </p>
              <Link href="/dashboard/events/new" className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Create your first event
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-slate-100">
              {events.slice(0, 5).map((event) => (
                <li key={event.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link href={`/dashboard/events/${event.id}`} className="truncate font-medium text-slate-800 hover:text-indigo-700">
                      {event.title}
                    </Link>
                    <p className="text-xs text-slate-400">
                      {formatDateRange(event.starts_at, event.ends_at)} · {counts.get(event.id) ?? 0} registered
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${event.status === "published" ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" : "bg-amber-50 text-amber-700 ring-amber-600/20"}`}>
                    {event.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70 lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Recent registrations</h2>
          {recentRegistrations.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              Registrations for your next event will appear here.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentRegistrations.map((registration) => (
                <li key={registration.id} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">
                    {registration.full_name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{registration.full_name}</p>
                    <p className="truncate text-xs text-slate-400">{registration.email}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-xs capitalize text-slate-400">
                    {registration.status.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {nextEvent ? (
            <Link href={`/dashboard/events/${nextEvent.id}/participants`} className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View all participants
            </Link>
          ) : null}
        </section>
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <TicketIcon className="h-4 w-4" />
        Free registrations are live. PayPal checkout for paid events arrives in Phase 4.
      </p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading dashboard…</p>}>
      <Overview />
    </Suspense>
  );
}
