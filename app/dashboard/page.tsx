import Link from "next/link";

import {
  ArrowRightIcon,
  CalendarIcon,
  CardIcon,
  CheckCircleIcon,
  TicketIcon,
  UsersIcon,
} from "@/components/icons";
import {
  formatDateRange,
  formatPrice,
  mockEvents,
  mockOrganization,
} from "@/lib/mock/data";

const statIcons = [TicketIcon, UsersIcon, CardIcon, CheckCircleIcon];

const statusStyles: Record<string, string> = {
  Confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  "Pending payment": "bg-amber-50 text-amber-700 ring-amber-600/20",
  "Checked in": "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
};

export default function DashboardPage() {
  const upcoming = mockEvents
    .filter((e) => e.status === "published")
    .slice(0, 3);
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Good to see you
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here is what is happening across {mockOrganization.name}.
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover"
        >
          Create event
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockOrganization.stats.map((stat, index) => {
          const Icon = statIcons[index] ?? TicketIcon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium text-emerald-600">
                {stat.delta}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold tracking-tight">Upcoming events</h2>
            <Link
              href="/dashboard/events"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {upcoming.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 rounded-xl border border-border p-3.5 transition hover:bg-muted/50"
              >
                <div
                  className={`h-11 w-11 shrink-0 rounded-xl bg-gradient-to-br ${event.gradient}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{event.title}</p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {formatDateRange(event)} · {formatPrice(event)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium">
                  {event.registered}
                  {event.capacity ? `/${event.capacity}` : ""} registered
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-2">
          <h2 className="font-semibold tracking-tight">Recent registrations</h2>
          <div className="mt-4 space-y-4">
            {mockOrganization.recentRegistrations.map((reg) => (
              <div key={reg.name + reg.event} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{reg.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {reg.event}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[reg.status] ?? "bg-muted text-muted-foreground ring-border"}`}
                >
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
      <p className="text-sm text-muted-foreground">
        Sample data for preview. Live organisation data arrives in Phase 3.
      </p>
    </div>
  );
}
