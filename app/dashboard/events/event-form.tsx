"use client";

import { useState } from "react";

import type { EventFormInput } from "@/lib/validation/phase3";
import { CheckCircleIcon } from "@/components/icons";

const MODULE_OPTIONS = [
  { key: "registration", label: "Registration", description: "Collect attendee sign-ups" },
  { key: "payments", label: "Payments", description: "Paid tickets (checkout in Phase 4)" },
  { key: "schedule", label: "Schedule", description: "Sessions and agenda" },
  { key: "checkin", label: "Check-in", description: "Attendance tracking" },
] as const;

export type EventFormValues = {
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  location: string;
  isOnline: boolean;
  capacity: string;
  isFree: boolean;
  priceInr: string;
  modules: string[];
};

export const emptyEventForm: EventFormValues = {
  title: "",
  description: "",
  startsAt: "",
  endsAt: "",
  location: "",
  isOnline: false,
  capacity: "",
  isFree: true,
  priceInr: "",
  modules: ["registration"],
};

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";

export default function EventForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial: EventFormValues;
  submitLabel: string;
  onSubmit: (input: EventFormInput) => Promise<{ error?: string; success?: string }>;
}) {
  const [values, setValues] = useState<EventFormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function toggleModule(key: string) {
    setValues((prev) => ({
      ...prev,
      modules: prev.modules.includes(key)
        ? prev.modules.filter((m) => m !== key)
        : [...prev.modules, key],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (new Date(values.endsAt) <= new Date(values.startsAt)) {
      setError("End time must be after start time.");
      return;
    }
    if (!values.isFree && !(Number(values.priceInr) > 0)) {
      setError("Paid events must have a price greater than zero.");
      return;
    }
    setPending(true);
    const result = await onSubmit({
      title: values.title,
      description: values.description || undefined,
      startsAt: values.startsAt,
      endsAt: values.endsAt,
      location: values.isOnline ? undefined : values.location || undefined,
      isOnline: values.isOnline,
      capacity: values.capacity ? Number(values.capacity) : null,
      isFree: values.isFree,
      priceInr: values.isFree ? 0 : Number(values.priceInr),
      modules: values.modules as EventFormInput["modules"],
    });
    setPending(false);
    if (result.error) setError(result.error);
    if (result.success) setSuccess(result.success);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircleIcon className="h-4.5 w-4.5" /> {success}
        </p>
      ) : null}

      <div>
        <label htmlFor="event-title" className="text-sm font-medium text-slate-700">Event title</label>
        <input id="event-title" required minLength={3} maxLength={200} value={values.title}
          onChange={(e) => set("title", e.target.value)} placeholder="e.g. Innovate 2026 Tech Symposium"
          className={inputClass} />
      </div>

      <div>
        <label htmlFor="event-description" className="text-sm font-medium text-slate-700">Description</label>
        <textarea id="event-description" rows={4} maxLength={10000} value={values.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What is this event about? Who should attend?"
          className={inputClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event-starts" className="text-sm font-medium text-slate-700">Starts</label>
          <input id="event-starts" type="datetime-local" required value={values.startsAt}
            onChange={(e) => set("startsAt", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor="event-ends" className="text-sm font-medium text-slate-700">Ends</label>
          <input id="event-ends" type="datetime-local" required value={values.endsAt}
            onChange={(e) => set("endsAt", e.target.value)} className={inputClass} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="event-location" className="text-sm font-medium text-slate-700">Location</label>
          <input id="event-location" maxLength={500} disabled={values.isOnline} value={values.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder={values.isOnline ? "Online event" : "e.g. Main Auditorium, Campus"}
            className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-400`} />
          <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={values.isOnline}
              onChange={(e) => set("isOnline", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-indigo-600" />
            This is an online event
          </label>
        </div>
        <div>
          <label htmlFor="event-capacity" className="text-sm font-medium text-slate-700">
            Capacity <span className="font-normal text-slate-400">(blank = unlimited)</span>
          </label>
          <input id="event-capacity" type="number" min={1} max={1000000} value={values.capacity}
            onChange={(e) => set("capacity", e.target.value)} placeholder="e.g. 300"
            className={inputClass} />
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Ticket type</legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => set("isFree", true)}
            className={`rounded-xl px-4 py-3 text-left text-sm ring-1 transition ${values.isFree ? "bg-indigo-50 font-semibold text-indigo-700 ring-indigo-300" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"}`}>
            Free event
          </button>
          <button type="button" onClick={() => set("isFree", false)}
            className={`rounded-xl px-4 py-3 text-left text-sm ring-1 transition ${!values.isFree ? "bg-indigo-50 font-semibold text-indigo-700 ring-indigo-300" : "bg-white text-slate-600 ring-slate-200 hover:ring-slate-300"}`}>
            Paid event
          </button>
        </div>
        {!values.isFree ? (
          <div className="mt-3">
            <label htmlFor="event-price" className="text-sm font-medium text-slate-700">Price (INR)</label>
            <input id="event-price" type="number" min={1} step="0.01" required value={values.priceInr}
              onChange={(e) => set("priceInr", e.target.value)} placeholder="e.g. 499"
              className={inputClass} />
            <p className="mt-1.5 text-xs text-slate-400">
              Online checkout with PayPal arrives in Phase 4. Paid events can be
              created and published now; registration opens with checkout.
            </p>
          </div>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Modules</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {MODULE_OPTIONS.map((option) => {
            const active = values.modules.includes(option.key);
            return (
              <button key={option.key} type="button" onClick={() => toggleModule(option.key)}
                aria-pressed={active}
                className={`rounded-xl px-4 py-3 text-left ring-1 transition ${active ? "bg-indigo-50 ring-indigo-300" : "bg-white ring-slate-200 hover:ring-slate-300"}`}>
                <span className={`text-sm font-semibold ${active ? "text-indigo-700" : "text-slate-700"}`}>
                  {option.label}
                </span>
                <span className="mt-0.5 block text-xs text-slate-500">{option.description}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <button type="submit" disabled={pending}
        className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6">
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
