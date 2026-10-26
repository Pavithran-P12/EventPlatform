"use client";

import { useMemo, useState } from "react";

import { EventCard } from "@/components/event-card";
import { SiteHeaderView } from "@/components/site-header-view";
import { mockEvents, type EventCategory } from "@/lib/mock/data";

const categories: ("All" | EventCategory)[] = [
  "All",
  "Symposium",
  "Sports",
  "Workshop",
  "Community",
  "Conference",
];

export default function EventsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All");
  const [freeOnly, setFreeOnly] = useState(false);

  const events = useMemo(
    () =>
      mockEvents.filter((event) => {
        if (event.status !== "published") return false;
        if (category !== "All" && event.category !== category) return false;
        if (freeOnly && !event.isFree) return false;
        const haystack =
          `${event.title} ${event.organization} ${event.location}`.toLowerCase();
        return haystack.includes(query.trim().toLowerCase());
      }),
    [query, category, freeOnly],
  );

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeaderView displayName={null} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold">Discover events</h1>
        <p className="mt-2 text-muted-foreground">
          Symposiums, tournaments, workshops, and community events near you.
        </p>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, organisers, places…"
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 outline-none focus:border-primary lg:max-w-md"
            aria-label="Search events"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
                  category === item
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card hover:bg-muted"
                }`}
              >
                {item}
              </button>
            ))}
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm">
              <input
                type="checkbox"
                checked={freeOnly}
                onChange={(e) => setFreeOnly(e.target.checked)}
                className="accent-indigo-600"
              />
              Free only
            </label>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-lg font-medium">No events match your filters</p>
            <p className="mt-1 text-muted-foreground">
              Try a different search or category.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
