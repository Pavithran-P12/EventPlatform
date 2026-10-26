"use client";

import Link from "next/link";
import { useState } from "react";

import { CheckCircleIcon } from "@/components/icons";

const inputClass =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring/40";
const labelClass = "mb-1.5 block text-sm font-medium";

const moduleOptions = [
  { key: "registration", label: "Registration form", hint: "Collect attendee details" },
  { key: "payments", label: "Payments", hint: "Charge a ticket fee online" },
  { key: "schedule", label: "Schedule", hint: "Sessions, matches, activities" },
  { key: "checkin", label: "Check-in", hint: "Day-of attendance tracking" },
];

export default function NewEventPage() {
  const [isFree, setIsFree] = useState(true);
  const [modules, setModules] = useState<string[]>(["registration"]);
  const [saved, setSaved] = useState(false);

  function toggleModule(key: string) {
    setModules((prev) =>
      prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key],
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard/events" className="text-sm font-medium text-primary hover:underline">
          ← Back to events
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Create event</h1>
        <p className="mt-1 text-muted-foreground">
          Start with the basics — you can reuse this setup for future events.
        </p>
      </div>

      {saved ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-card">
          <CheckCircleIcon className="mx-auto h-11 w-11 text-emerald-600" />
          <h2 className="mt-3 text-xl font-semibold tracking-tight">Draft preview created</h2>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">
            This is a frontend preview — nothing was saved. Real event creation
            with Supabase arrives in Phase 3.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/dashboard/events"
              className="rounded-xl bg-primary px-5 py-2.5 font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover"
            >
              View events
            </Link>
            <button
              onClick={() => setSaved(false)}
              className="rounded-xl border border-border bg-card px-5 py-2.5 font-medium shadow-sm transition hover:bg-muted"
            >
              Create another
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSaved(true);
          }}
          className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div>
            <label className={labelClass} htmlFor="title">Event title *</label>
            <input id="title" required className={inputClass} placeholder="e.g. Innovate 2026 — Tech Symposium" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="category">Event type</label>
              <select id="category" className={inputClass} defaultValue="Symposium">
                <option>Symposium</option>
                <option>Sports tournament</option>
                <option>Workshop</option>
                <option>Community event</option>
                <option>Conference</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="capacity">Capacity (optional)</label>
              <input id="capacity" type="number" min={1} className={inputClass} placeholder="e.g. 300" />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="description">Description</label>
            <textarea id="description" rows={4} className={inputClass} placeholder="What is this event about? Who should attend?" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="starts">Starts *</label>
              <input id="starts" required type="datetime-local" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="ends">Ends *</label>
              <input id="ends" required type="datetime-local" className={inputClass} />
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="location">Location</label>
            <input id="location" className={inputClass} placeholder="Venue or 'Online'" />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Ticket price</legend>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsFree(true)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${isFree ? "bg-primary text-primary-foreground shadow-sm" : "border border-border hover:bg-muted"}`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => setIsFree(false)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${!isFree ? "bg-primary text-primary-foreground shadow-sm" : "border border-border hover:bg-muted"}`}
              >
                Paid
              </button>
            </div>
            {!isFree && (
              <input
                type="number"
                min={1}
                className={`${inputClass} mt-3`}
                placeholder="Price in ₹ (e.g. 499)"
                aria-label="Ticket price"
              />
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Modules</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {moduleOptions.map((module) => (
                <label
                  key={module.key}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 shadow-sm transition hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={modules.includes(module.key)}
                    onChange={() => toggleModule(module.key)}
                    className="mt-1 accent-indigo-600"
                  />
                  <span>
                    <span className="block font-medium">{module.label}</span>
                    <span className="text-sm text-muted-foreground">{module.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-2.5 font-medium text-primary-foreground shadow-sm transition hover:bg-primary-hover"
            >
              Save draft (preview)
            </button>
            <Link
              href="/dashboard/events"
              className="rounded-xl border border-border px-6 py-2.5 font-medium shadow-sm transition hover:bg-muted"
            >
              Cancel
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Preview only — this form does not save yet. Wired to Supabase in Phase 3.
          </p>
        </form>
      )}
    </div>
  );
}
