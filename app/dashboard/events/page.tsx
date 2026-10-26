import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";
import { getActiveOrganization } from "@/lib/db/org-context";
import { getOrgEvents, getRegistrationCounts } from "@/lib/db/queries";
import { formatDateRange, formatPrice, gradientForKey } from "@/lib/db/helpers";
import { PlusIcon } from "@/components/icons";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 ring-amber-600/20",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  completed: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

async function EventsList() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const active = await getActiveOrganization(user.id);
  if (!active) redirect("/dashboard/organizations/new");
  const events = await getOrgEvents(active.organization.id);
  const counts = await getRegistrationCounts(events.map((e) => e.id));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Events</h1>
          <p className="mt-1 text-sm text-slate-500">
            {events.length} event{events.length === 1 ? "" : "s"} in {active.organization.name}
          </p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <PlusIcon className="h-4 w-4" /> Create event
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70">
        {events.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-700">No events yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Create your first event — it starts as a draft and goes public
              when you publish it.
            </p>
            <Link
              href="/dashboard/events/new"
              className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-semibold">Event</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Registered</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((event) => {
                  const registered = counts.get(event.id) ?? 0;
                  return (
                    <tr key={event.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${gradientForKey(event.slug)}`} aria-hidden="true" />
                          <div>
                            <p className="font-medium text-slate-800">{event.title}</p>
                            <p className="text-xs text-slate-400">
                              {event.is_online ? "Online" : (event.location ?? "Location TBA")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {formatDateRange(event.starts_at, event.ends_at)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{formatPrice(event)}</td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {registered}
                        {event.capacity ? ` / ${event.capacity}` : ""}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${STATUS_STYLES[event.status]}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-3">
                          <Link href={`/dashboard/events/${event.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                            Manage
                          </Link>
                          {event.status === "published" ? (
                            <Link href={`/events/${event.slug}`} className="font-medium text-slate-500 hover:text-slate-700">
                              Public page
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardEventsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading events…</p>}>
      <EventsList />
    </Suspense>
  );
}
