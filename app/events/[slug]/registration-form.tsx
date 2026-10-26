"use client";

import { useState } from "react";

import type { PublicEvent, RegistrationFieldRecord } from "@/lib/db/types";
import { seatsLeft } from "@/lib/db/helpers";
import { registerForEventAction } from "@/app/events/actions";
import { CheckCircleIcon } from "@/components/icons";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15";

export default function RegistrationForm({
  event,
  fields,
}: {
  event: PublicEvent;
  fields: RegistrationFieldRecord[];
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const left = seatsLeft(event.capacity, event.registered_count);
  const soldOut = left === 0;

  if (!event.is_free) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
        <h2 className="text-base font-semibold text-slate-900">Paid event</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          Online payment for this event opens soon via secure PayPal checkout.
          Registrations are not open yet — please check back shortly.
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-white p-6 text-center shadow-card ring-1 ring-slate-200/70">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircleIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-3 text-base font-semibold text-slate-900">You&apos;re registered!</h2>
        <p className="mt-1 text-sm text-slate-500">{success}</p>
        <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-100">
          {fullName} · {email}
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) return setError("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setError("Please enter a valid email address.");
    }
    setPending(true);
    const result = await registerForEventAction(event.id, event.slug, {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });
    setPending(false);
    if (result.error) setError(result.error);
    if (result.success) setSuccess(result.success);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70"
      aria-label={`Register for ${event.title}`}
    >
      <h2 className="text-base font-semibold text-slate-900">Register for this event</h2>
      <p className="mt-1 text-sm text-slate-500">
        {soldOut
          ? "This event is fully booked."
          : left !== null
            ? `${left} of ${event.capacity} seats remaining.`
            : "Free registration — no account needed."}
      </p>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
          {error}
        </p>
      ) : null}

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="reg-name" className="text-sm font-medium text-slate-700">Full name</label>
          <input id="reg-name" autoComplete="name" required value={fullName}
            onChange={(e) => setFullName(e.target.value)} placeholder="Your full name"
            disabled={soldOut} className={`${inputClass} disabled:bg-slate-50`} />
        </div>
        <div>
          <label htmlFor="reg-email" className="text-sm font-medium text-slate-700">Email</label>
          <input id="reg-email" type="email" autoComplete="email" required value={email}
            onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            disabled={soldOut} className={`${inputClass} disabled:bg-slate-50`} />
        </div>
        <div>
          <label htmlFor="reg-phone" className="text-sm font-medium text-slate-700">
            Phone <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input id="reg-phone" type="tel" autoComplete="tel" value={phone}
            onChange={(e) => setPhone(e.target.value)} placeholder="+91 …"
            disabled={soldOut} className={`${inputClass} disabled:bg-slate-50`} />
        </div>
        {fields.map((field) => (
          <div key={field.id}>
            <label htmlFor={`reg-field-${field.id}`} className="text-sm font-medium text-slate-700">
              {field.label}
              {field.is_required ? "" : <span className="font-normal text-slate-400"> (optional)</span>}
            </label>
            <input id={`reg-field-${field.id}`} disabled placeholder="Collected at the venue for now"
              className={`${inputClass} bg-slate-50`} />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={soldOut || pending}
        className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {soldOut ? "Sold out" : pending ? "Registering…" : "Register free"}
      </button>
      <p className="mt-3 text-center text-xs text-slate-400">
        Guest registration — no account needed. One registration per email.
      </p>
    </form>
  );
}
