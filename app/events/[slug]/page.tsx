import { Suspense } from "react";

import EventDetailClient from "./event-detail-client";

async function EventDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EventDetailClient slug={slug} />;
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted-foreground">
          Loading event…
        </div>
      }
    >
      <EventDetail params={params} />
    </Suspense>
  );
}
