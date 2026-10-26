"use client";

import EventForm, { type EventFormValues } from "@/app/dashboard/events/event-form";
import { updateEventAction } from "@/app/dashboard/events/actions";

export default function EditEventForm({
  eventId,
  initial,
}: {
  eventId: string;
  initial: EventFormValues;
}) {
  return (
    <EventForm
      initial={initial}
      submitLabel="Save changes"
      onSubmit={(input) => updateEventAction(eventId, input)}
    />
  );
}
