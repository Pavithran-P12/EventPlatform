import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { RegistrationWithPayment } from "@/lib/payments/types";

type JoinedRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  created_at: string;
  orders: {
    status: RegistrationWithPayment["order_status"];
    amount_cents: number;
    currency: string;
    payments: { status: RegistrationWithPayment["payment_status"] }[];
  } | null;
};

export async function getEventRegistrationsWithPayments(
  eventId: string,
): Promise<RegistrationWithPayment[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, full_name, email, phone, status, created_at, orders(status, amount_cents, currency, payments(status))",
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as JoinedRow[]).map((row) => ({
    registration_id: row.id,
    full_name: row.full_name,
    email: row.email,
    phone: row.phone,
    registration_status: row.status,
    created_at: row.created_at,
    order_status: row.orders?.status ?? null,
    payment_status: row.orders?.payments?.[0]?.status ?? null,
    amount_cents: row.orders?.amount_cents ?? null,
    currency: row.orders?.currency ?? null,
  }));
}
