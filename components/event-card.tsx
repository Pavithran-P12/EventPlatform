import Link from "next/link";

import type { PublicEvent } from "@/lib/db/types";
import {
  formatDateRange,
  formatPrice,
  gradientForKey,
  seatsLeft,
} from "@/lib/db/helpers";
import { CalendarIcon, GlobeIcon, MapPinIcon, UsersIcon } from "@/components/icons";

export default function EventCard({ event }: { event: PublicEvent }) {
  const left = seatsLeft(event.capacity, event.registered_count);
  const soldOut = left === 0;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70 transition duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className={`relative h-36 bg-gradient-to-br ${gradientForKey(event.slug)}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {event.organization_name}
        </span>
        <span
          className={`absolute right-4 top-4 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
            event.is_free ? "bg-emerald-500 text-white" : "bg-white/95 text-slate-800"
          }`}
        >
          {formatPrice(event)}
        </span>
        <p className="absolute bottom-3 left-4 right-4 truncate text-lg font-bold text-white drop-shadow-sm">
          {event.title}
        </p>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-1.5 text-sm text-slate-500">
          <p className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0 text-slate-400" />
            {formatDateRange(event.starts_at, event.ends_at)}
          </p>
          <p className="flex items-center gap-2">
            {event.is_online ? (
              <GlobeIcon className="h-4 w-4 shrink-0 text-slate-400" />
            ) : (
              <MapPinIcon className="h-4 w-4 shrink-0 text-slate-400" />
            )}
            <span className="truncate">{event.is_online ? "Online event" : (event.location ?? "Location TBA")}</span>
          </p>
          <p className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 shrink-0 text-slate-400" />
            {event.registered_count} registered
            {event.capacity ? ` · ${event.capacity} seats` : ""}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          {soldOut ? (
            <span className="text-sm font-semibold text-red-600">Sold out</span>
          ) : left !== null && left <= 20 ? (
            <span className="text-sm font-semibold text-amber-600">Only {left} seats left</span>
          ) : (
            <span className="text-sm font-medium text-emerald-600">Registration open</span>
          )}
          <span className="text-sm font-semibold text-indigo-600 transition group-hover:translate-x-0.5">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
