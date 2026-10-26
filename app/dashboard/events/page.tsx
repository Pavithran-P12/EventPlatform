import Link from "next/link";

import { formatDateRange, formatPrice, mockEvents } from "@/lib/mock/data";

const statusStyles: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-stone-200 text-stone-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-indigo-100 text-indigo-800",
};

export default function DashboardEventsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Events</h1>
          <p className="mt-1 text-muted-foreground">
            {mockEvents.length} events · drafts are only visible to your team
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:opacity-90"
        >
          + Create event
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/60 text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Event</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Registrations</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockEvents.map((event) => (
                <tr key={event.id} className="hover:bg-muted/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br ${event.gradient}`}
                      />
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">
                    {formatDateRange(event)}
                  </td>
                  <td className="px-5 py-4">
                    {event.registered}
                    {event.capacity ? ` / ${event.capacity}` : ""}
                  </td>
                  <td className="px-5 py-4">{formatPrice(event)}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusStyles[event.status]}`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {event.status === "published" ? (
                      <Link
                        href={`/events/${event.slug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        View page
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Preview data. Event management actions arrive in Phase 3.
      </p>
    </div>
  );
}
