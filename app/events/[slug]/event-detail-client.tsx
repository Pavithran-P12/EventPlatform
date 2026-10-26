"use client";

import Link from "next/link";
import { useState } from "react";

import { SiteHeaderView } from "@/components/site-header-view";
import {
  formatDateRange,
  formatPrice,
  mockEvents,
  seatsLeft,
} from "@/lib/mock/data";

const inputClass =
  "w-full rounded-lg border border-border bg-card px-3.5 py-2.5 outline-none focus:border-primary";

export default function EventDetailClient({ slug }: { slug: string }) {
  const event = mockEvents.find((item) => item.slug === slug);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", college: "" });
  const [error, setError] = useState("");

  if (!event) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeaderView displayName={null} />
        <main className="mx-auto max-w-3xl flex-1 px-4 py-20 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <p className="mt-2 text-muted-foreground">
            This event may have been removed or the link is incorrect.
          </p>
          <Link href="/events" className="mt-6 inline-block font-medium text-primary hover:underline">
            ← Back to all events
          </Link>
        </main>
      </div>
    );
  }

  const left = seatsLeft(event);
  const soldOut = left === 0;
  const fillPercent =
    event.capacity === null
      ? 0
      : Math.min(100, Math.round((event.registered / event.capacity) * 100));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Please enter your name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeaderView displayName={null} />
      <div className={`bg-gradient-to-br ${event.gradient}`}>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-stone-800">
            {event.category}
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold text-white sm:text-5xl">
            {event.title}
          </h1>
          <p className="mt-3 text-white/85">Organised by {event.organization}</p>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="text-xl font-semibold">About this event</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{event.description}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Schedule</h2>
            <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
              {event.schedule.map((item) => (
                <div key={item.title} className="flex gap-4 p-4">
                  <span className="w-14 shrink-0 font-mono text-sm font-semibold text-primary">
                    {item.time}
                  </span>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    {item.speaker && (
                      <p className="text-sm text-muted-foreground">{item.speaker}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold">What&apos;s included</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {event.modules.map((module) => (
                <span
                  key={module}
                  className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-primary"
                >
                  {module}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="space-y-2 text-sm">
            <p>📅 {formatDateRange(event)}</p>
            <p>{event.isOnline ? "🌐 Online event" : `📍 ${event.location}`}</p>
            <p className="text-lg font-bold text-foreground">{formatPrice(event)}</p>
          </div>

          {event.capacity !== null && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {event.registered} registered
                {left !== null && (soldOut ? " · Sold out" : ` · ${left} seats left`)}
              </p>
            </div>
          )}

          {submitted ? (
            <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-center">
              <p className="text-2xl">🎉</p>
              <p className="mt-1 font-semibold text-emerald-800">You&apos;re on the list!</p>
              <p className="mt-1 text-sm text-emerald-700">
                Preview only — no registration was saved. Real registration
                arrives in Phase 3{event.isFree ? "" : ", payments in Phase 4"}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <h3 className="font-semibold">Register</h3>
              <input
                className={inputClass}
                placeholder="Full name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                aria-label="Full name"
              />
              <input
                className={inputClass}
                placeholder="Email address *"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                aria-label="Email address"
              />
              <input
                className={inputClass}
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                aria-label="Phone"
              />
              <input
                className={inputClass}
                placeholder="College / Organisation (optional)"
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                aria-label="College or organisation"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={soldOut}
                className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {soldOut
                  ? "Sold out"
                  : event.isFree
                    ? "Register for free"
                    : `Register · ${formatPrice(event)}`}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Frontend preview — submitting does not save data or charge you.
              </p>
            </form>
          )}
        </aside>
      </main>
    </div>
  );
}
