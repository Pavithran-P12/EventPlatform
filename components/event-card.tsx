import Link from "next/link";

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
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md"
    >
      <div
        className={`flex h-36 items-end bg-gradient-to-br p-4 ${event.gradient}`}
      >
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-stone-800">
          {event.category}
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
            {event.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            by {event.organization}
          </p>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>📅 {formatDateRange(event)}</p>
          <p>
            {event.isOnline ? "🌐 Online" : `📍 ${event.location}`}
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-semibold">{formatPrice(event)}</span>
          <span
            className={`text-xs font-medium ${left === 0 ? "text-red-600" : "text-muted-foreground"}`}
          >
            {left === null
              ? `${event.registered} registered`
              : left === 0
                ? "Sold out"
                : `${left} seats left`}
          </span>
        </div>
      </div>
    </Link>
  );
}
