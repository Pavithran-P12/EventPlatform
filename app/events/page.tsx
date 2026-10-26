"use client";

import { useMemo, useState } from "react";

import { SearchIcon } from "@/components/icons";
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
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Discover
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          Find your next event
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Symposiums, tournaments, workshops, and community events — hosted by
          organisers on EventPlatform.
        </p>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, organisers, places…"
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-11 pr-4 shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/40"
              aria-label="Search events"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  category === item
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-card shadow-sm hover:bg-muted"
                }`}
              >
                {item}
              </button>
            ))}
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm shadow-sm transition hover:bg-muted">
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
          <div className="mt-16 rounded-2xl border border-dashed border-border bg-card p-12 text-center shadow-card">
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
