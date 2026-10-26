import Link from "next/link";

import { formatDateRange, mockEvents, mockOrganization } from "@/lib/mock/data";

const statusStyles: Record<string, string> = {
  Confirmed: "bg-emerald-100 text-emerald-800",
  "Pending payment": "bg-amber-100 text-amber-800",
  "Checked in": "bg-indigo-100 text-indigo-800",
};

export default function DashboardPage() {
  const upcoming = mockEvents
    .filter((e) => e.status === "published")
    .slice(0, 3);
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {mockOrganization.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening across your events.
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
        >
          + Create event
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockOrganization.stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-card lg:col-span-3">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h2 className="font-semibold">Upcoming events</h2>
            <Link href="/dashboard/events" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {upcoming.map((event) => (
              <div key={event.id} className="flex items-center gap-4 p-5">
                <div
                  className={`h-12 w-12 shrink-0 rounded-xl bg-gradient-to-br ${event.gradient}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{event.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateRange(event)} · {event.registered}
                    {event.capacity ? `/${event.capacity}` : ""} registered
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium capitalize text-emerald-800">
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card lg:col-span-2">
          <h2 className="border-b border-border p-5 font-semibold">
            Recent registrations
          </h2>
          <div className="divide-y divide-border">
            {mockOrganization.recentRegistrations.map((row) => (
              <div key={row.name + row.event} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{row.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[row.status] ?? "bg-muted text-muted-foreground"}`}
                  >
                    {row.status}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {row.event} · {row.amount}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
