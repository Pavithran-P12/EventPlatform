import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";
import { getActiveOrganization } from "@/lib/db/org-context";
import {
  getEventForOrg,
  getEventModules,
  getRegistrationCounts,
} from "@/lib/db/queries";
import { formatDateRange, formatPrice } from "@/lib/db/helpers";
import {
  cancelEventAction,
  deleteEventAction,
  publishEventAction,
  unpublishEventAction,
} from "@/app/dashboard/events/actions";
import EditEventForm from "@/app/dashboard/events/[id]/edit-event-form";
import type { EventFormValues } from "@/app/dashboard/events/event-form";
import ConfirmAction from "@/components/confirm-action";
import PageSkeleton from "@/components/page-skeleton";

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-amber-50 text-amber-700 ring-amber-600/20",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  cancelled: "bg-red-50 text-red-700 ring-red-600/20",
  completed: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const active = await getActiveOrganization(user.id);
  if (!active) redirect("/dashboard/organizations/new");
  const event = await getEventForOrg(active.organization.id, id);
  if (!event) notFound();

  const [modules, counts] = await Promise.all([
    getEventModules(event.id),
    getRegistrationCounts([event.id]),
  ]);
  const registered = counts.get(event.id) ?? 0;

  const initial: EventFormValues = {
    title: event.title,
    description: event.description ?? "",
    startsAt: toLocalInput(event.starts_at),
    endsAt: toLocalInput(event.ends_at),
    location: event.location ?? "",
    isOnline: event.is_online,
    capacity: event.capacity ? String(event.capacity) : "",
    isFree: event.is_free,
    priceInr: event.is_free ? "" : String(event.price_cents / 100),
    modules: modules.map((m) => m.module_key),
  };

  const buttonClass =
    "rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition disabled:opacity-60";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/events" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
            ← All events
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{event.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {formatDateRange(event.starts_at, event.ends_at)} ·{" "}
            {event.is_online ? "Online" : (event.location ?? "Location TBA")} ·{" "}
            {formatPrice(event)} · {registered} registered
            {event.capacity ? ` of ${event.capacity}` : ""}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${STATUS_STYLES[event.status]}`}>
          {event.status}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {event.status === "draft" ? (
          <form action={publishEventAction}>
            <input type="hidden" name="eventId" value={event.id} />
            <button type="submit" className={`${buttonClass} bg-indigo-600 text-white ring-indigo-600 hover:bg-indigo-700`}>
              Publish event
            </button>
          </form>
        ) : null}
        {event.status === "published" ? (
          <>
            <form action={unpublishEventAction}>
              <input type="hidden" name="eventId" value={event.id} />
              <button type="submit" className={`${buttonClass} bg-white text-slate-700 ring-slate-300 hover:bg-slate-50`}>
                Unpublish
              </button>
            </form>
            <Link href={`/events/${event.slug}`} className={`${buttonClass} bg-white text-indigo-700 ring-indigo-200 hover:bg-indigo-50`}>
              View public page
            </Link>
          </>
        ) : null}
        <Link href={`/dashboard/events/${event.id}/participants`} className={`${buttonClass} bg-white text-slate-700 ring-slate-300 hover:bg-slate-50`}>
          Participants ({registered})
        </Link>
        {event.status !== "cancelled" ? (
          <ConfirmAction
            action={cancelEventAction}
            fields={{ eventId: event.id }}
            triggerLabel="Cancel event"
            triggerClassName={`${buttonClass} bg-white text-red-600 ring-red-200 hover:bg-red-50`}
            title="Cancel this event?"
            description={`"${event.title}" will be marked cancelled and removed from public listings. Existing registrations stay on record. This cannot be undone.`}
            confirmLabel="Cancel event"
          />
        ) : null}
        {event.status === "draft" ? (
          <ConfirmAction
            action={deleteEventAction}
            fields={{ eventId: event.id }}
            triggerLabel="Delete draft"
            triggerClassName={`${buttonClass} bg-white text-red-600 ring-red-200 hover:bg-red-50`}
            title="Delete this draft?"
            description={`"${event.title}" and its setup will be permanently deleted. This cannot be undone.`}
            confirmLabel="Delete draft"
          />
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
        <h2 className="text-base font-semibold text-slate-900">Event details</h2>
        <div className="mt-4">
          <EditEventForm eventId={event.id} initial={initial} />
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl">
          <PageSkeleton rows={3} />
        </div>
      }
    >
      <EventDetail params={params} />
    </Suspense>
  );
}
