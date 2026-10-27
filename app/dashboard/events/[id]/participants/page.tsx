import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { getCurrentUser } from "@/lib/auth";
import { getActiveOrganization } from "@/lib/db/org-context";
import { getEventForOrg } from "@/lib/db/queries";
import { getEventRegistrationsWithPayments } from "@/lib/payments/queries";
import { formatMoney } from "@/lib/payments/helpers";
import {
  cancelRegistrationAction,
  refundRegistrationAction,
} from "@/app/dashboard/events/actions";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  pending_payment: "bg-amber-50 text-amber-700 ring-amber-600/20",
  cancelled: "bg-slate-100 text-slate-500 ring-slate-500/20",
  waitlisted: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  captured: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  initiated: "bg-amber-50 text-amber-700 ring-amber-600/20",
  approved: "bg-amber-50 text-amber-700 ring-amber-600/20",
  failed: "bg-red-50 text-red-700 ring-red-600/20",
  refunded: "bg-violet-50 text-violet-700 ring-violet-600/20",
  partially_refunded: "bg-violet-50 text-violet-700 ring-violet-600/20",
  cancelled: "bg-slate-100 text-slate-500 ring-slate-500/20",
};

async function Participants({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const active = await getActiveOrganization(user.id);
  if (!active) redirect("/dashboard/organizations/new");
  const event = await getEventForOrg(active.organization.id, id);
  if (!event) notFound();
  const registrations = await getEventRegistrationsWithPayments(event.id);
  const activeCount = registrations.filter(
    (r) => r.registration_status !== "cancelled",
  ).length;
  const collectedCents = registrations
    .filter((r) => r.order_status === "paid")
    .reduce((sum, r) => sum + (r.amount_cents ?? 0), 0);

  return (
    <div>
      <Link href={`/dashboard/events/${event.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← Back to event
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Participants</h1>
          <p className="mt-1 text-sm text-slate-500">
            {event.title} · {activeCount} active registration{activeCount === 1 ? "" : "s"}
            {event.capacity ? ` · capacity ${event.capacity}` : ""}
            {collectedCents > 0
              ? ` · ${formatMoney(collectedCents, event.currency)} collected`
              : ""}
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-slate-200/70">
        {registrations.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-700">No registrations yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Publish the event and share its public page — registrations will
              appear here in real time.
            </p>
            {event.status === "published" ? (
              <Link href={`/events/${event.slug}`} className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                Open public page
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-semibold">Participant</th>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Registered</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((registration) => {
                  const paymentLabel =
                    registration.payment_status ?? registration.order_status;
                  return (
                  <tr key={registration.registration_id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{registration.full_name}</td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {registration.email}
                      {registration.phone ? <span className="block text-xs">{registration.phone}</span> : null}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${STATUS_STYLES[registration.registration_status]}`}>
                        {registration.registration_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {paymentLabel ? (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset ${PAYMENT_STYLES[paymentLabel] ?? PAYMENT_STYLES.pending}`}>
                          {paymentLabel.replace("_", " ")}
                          {registration.amount_cents !== null && registration.currency
                            ? ` · ${formatMoney(registration.amount_cents, registration.currency)}`
                            : ""}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Free</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(registration.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      {registration.order_status === "paid" ? (
                        <form action={refundRegistrationAction}>
                          <input type="hidden" name="registrationId" value={registration.registration_id} />
                          <input type="hidden" name="eventId" value={event.id} />
                          <button type="submit" className="text-sm font-medium text-violet-600 hover:text-violet-700">
                            Refund
                          </button>
                        </form>
                      ) : registration.registration_status !== "cancelled" ? (
                        <form action={cancelRegistrationAction}>
                          <input type="hidden" name="registrationId" value={registration.registration_id} />
                          <input type="hidden" name="eventId" value={event.id} />
                          <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-700">
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading participants…</p>}>
      <Participants params={params} />
    </Suspense>
  );
}
