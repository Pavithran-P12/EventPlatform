import Link from "next/link";
import { Suspense } from "react";

import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@/components/icons";
import { getPublicEventBySlug } from "@/lib/db/queries";
import {
  applyVerifiedPayment,
  getOrderById,
} from "@/lib/payments/orders";
import { capturePayPalOrder, getPayPalOrder } from "@/lib/payments/paypal";

async function ReturnContent({
  slug,
  orderId,
}: {
  slug: string;
  orderId: string | null;
}) {
  const event = await getPublicEventBySlug(slug);
  let status: "paid" | "pending" | "failed" | "unknown" = "unknown";

  if (orderId) {
    const order = await getOrderById(orderId);
    if (order?.provider_order_id) {
      try {
        if (order.status === "pending") {
          const captured = await capturePayPalOrder(order.provider_order_id);
          const result = await applyVerifiedPayment({
            order,
            providerPayload: captured,
            source: "capture",
          });
          status =
            result === "paid" ? "paid" : result === "failed" ? "failed" : "pending";
        } else if (order.status === "paid") {
          status = "paid";
        } else {
          const current = await getPayPalOrder(order.provider_order_id);
          const result = await applyVerifiedPayment({
            order,
            providerPayload: current,
            source: "capture",
          });
          status =
            result === "paid" ? "paid" : result === "failed" ? "failed" : "pending";
        }
      } catch {
        status = order.status === "paid" ? "paid" : "pending";
      }
    } else if (order) {
      status = order.status === "paid" ? "paid" : "pending";
    }
  }

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-slate-200/70">
        {status === "paid" ? (
          <>
            <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              Payment confirmed
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Your registration{event ? ` for ${event.title}` : ""} is
              confirmed. A receipt was sent by PayPal to your email.
            </p>
          </>
        ) : status === "failed" ? (
          <>
            <AlertCircleIcon className="mx-auto h-12 w-12 text-amber-500" />
            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              Payment did not complete
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Your payment was declined or could not be verified. No charge
              was confirmed — please try registering again.
            </p>
          </>
        ) : (
          <>
            <ClockIcon className="mx-auto h-12 w-12 text-indigo-500" />
            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              Payment processing
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              We are confirming your payment with PayPal. This usually takes
              a few seconds — your registration is confirmed only after
              PayPal verifies the payment, and the organiser will see it in
              their dashboard.
            </p>
          </>
        )}
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

async function ReturnPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { slug } = await params;
  const { order } = await searchParams;
  return <ReturnContent slug={slug} orderId={order ?? null} />;
}

export default function CheckoutReturnPage({
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
          <p className="text-center text-sm text-slate-500">
            Confirming your payment with PayPal…
          </p>
        </main>
      }
    >
      <ReturnPage params={params} searchParams={searchParams} />
    </Suspense>
  );
}
