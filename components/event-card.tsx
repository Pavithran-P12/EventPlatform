import Link from "next/link";

import {
  CalendarIcon,
  GlobeIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/icons";
import {
  formatDateRange,
  formatPrice,
  seatsLeft,
  type MockEvent,
} from "@/lib/mock/data";

export function EventCard({ event }: { event: MockEvent }) {
  const left = seatsLeft(event);
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div
        className={`relative flex h-40 items-end bg-gradient-to-br p-4 ${event.gradient}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
        <span className="relative rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm">
          {event.category}
        </span>
        <span className="relative ml-auto rounded-full bg-black/30 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {formatPrice(event)}
        </span>
      </div>
      <div className="space-y-3.5 p-5">
        <div>
          <h3 className="line-clamp-2 font-semibold leading-snug tracking-tight transition group-hover:text-primary">
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            by {event.organization}
          </p>
        </div>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0 text-primary/70" />
            {formatDateRange(event)}
          </p>
          <p className="flex items-center gap-2">
            {event.isOnline ? (
              <GlobeIcon className="h-4 w-4 shrink-0 text-primary/70" />
            ) : (
              <MapPinIcon className="h-4 w-4 shrink-0 text-primary/70" />
            )}
            {event.isOnline ? "Online event" : event.location}
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3.5">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <UsersIcon className="h-4 w-4" />
            {event.registered} registered
          </span>
          <span
            className={`text-xs font-semibold ${left === 0 ? "text-red-600" : left !== null && left <= 20 ? "text-amber-600" : "text-emerald-600"}`}
          >
            {left === null
              ? "Open registration"
              : left === 0
                ? "Sold out"
                : `${left} seats left`}
          </span>
        </div>
      </div>
    </Link>
  );
}
