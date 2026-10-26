"use client";

import { useMemo, useState } from "react";

import type { PublicEvent } from "@/lib/db/types";
import EventCard from "@/components/event-card";
import { SiteHeaderView } from "@/components/site-header-view";
import { SearchIcon } from "@/components/icons";

export default function EventsExplorer({ events }: { events: PublicEvent[] }) {
  const [query, setQuery] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return events.filter((event) => {
      if (freeOnly && !event.is_free) return false;
      if (!term) return true;
      return (
        event.title.toLowerCase().includes(term) ||
        event.organization_name.toLowerCase().includes(term) ||
        (event.location ?? "").toLowerCase().includes(term)
      );
    });
  }, [events, query, freeOnly]);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeaderView displayName={null} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Discover events
          </h1>
          <p className="mt-2 text-slate-500">
            Symposiums, tournaments, workshops, and community events — hosted by
            verified organisers on EventPlatform.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search events</span>
            <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, organiser, or place…"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
            />
          </label>
          <button
            type="button"
            onClick={() => setFreeOnly((v) => !v)}
            aria-pressed={freeOnly}
            className={`rounded-full px-4 py-2.5 text-sm font-medium shadow-sm ring-1 transition ${
              freeOnly
                ? "bg-indigo-600 text-white ring-indigo-600"
                : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"
            }`}
          >
            Free events only
          </button>
        </div>

        <p className="mt-6 text-sm text-slate-500" aria-live="polite">
          {filtered.length} event{filtered.length === 1 ? "" : "s"} found
        </p>

        {filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-white px-6 py-14 text-center shadow-card ring-1 ring-slate-200/70">
            <p className="text-base font-semibold text-slate-800">No events match your filters</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Try a different search term, or check back soon — new events are
              published every week.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFreeOnly(false);
              }}
              className="mt-5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
