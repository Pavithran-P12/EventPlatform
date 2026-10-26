"use client";

import EventForm, { emptyEventForm } from "@/app/dashboard/events/event-form";
import { createEventAction } from "@/app/dashboard/events/actions";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create event</h1>
      <p className="mt-1 text-sm text-slate-500">
        Events start as drafts. Publish when you are ready for registrations.
      </p>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-200/70">
        <EventForm
          initial={emptyEventForm}
          submitLabel="Create draft event"
          onSubmit={createEventAction}
        />
      </div>
    </div>
  );
}
