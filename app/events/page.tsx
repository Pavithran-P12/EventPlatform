import { Suspense } from "react";

import { getPublicEvents } from "@/lib/db/queries";
import EventsExplorer from "@/app/events/events-explorer";

async function Explorer() {
  const events = await getPublicEvents();
  return <EventsExplorer events={events} />;
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Loading events…
        </div>
      }
    >
      <Explorer />
    </Suspense>
  );
}
