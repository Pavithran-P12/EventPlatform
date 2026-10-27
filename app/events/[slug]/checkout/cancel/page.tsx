import Link from "next/link";
import { Suspense } from "react";

import { cancelPendingOrder, getOrderById } from "@/lib/payments/orders";

async function CancelContent({
  slug,
  orderId,
}: {
  slug: string;
  orderId: string | null;
}) {
  if (orderId) {
    const order = await getOrderById(orderId);
    if (order) await cancelPendingOrder(order);
  }
  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-slate-200/70">
        <p className="text-4xl">↩️</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">
          Checkout cancelled
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          You cancelled the PayPal checkout, so no payment was taken and your
          reserved seat was released. You can register again whenever you are
          ready.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href={`/events/${slug}`}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Back to event
          </Link>
          <Link
            href="/events"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Browse events
          </Link>
        </div>
      </div>
    </main>
  );
}

async function CancelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { slug } = await params;
  const { order } = await searchParams;
  return <CancelContent slug={slug} orderId={order ?? null} />;
}

export default function CheckoutCancelPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-xl px-4 py-16">
          <p className="text-center text-sm text-slate-500">Cancelling…</p>
        </main>
      }
    >
      <CancelPage params={params} searchParams={searchParams} />
    </Suspense>
  );
}
