import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function migration(name: string): string {
  return readFileSync(path.join(root, "supabase", "migrations", name), "utf8");
}

describe("database security invariants", () => {
  it("keeps webhook events service-role only", () => {
    const sql = migration("20261027000003_payments.sql");
    expect(sql).toContain("alter table public.payment_webhook_events enable row level security");
    expect(sql).toContain("payment_webhook_events: no policies");
    expect(sql).toContain("unique (provider, provider_event_id)");
  });

  it("keeps public seat counts aggregate-only", () => {
    const sql = migration("20261027000004_public_counts.sql");
    expect(sql).toContain("security definer");
    expect(sql).toContain("count(*)::bigint as registered_count");
    expect(sql).toContain("e.status = 'published'");
    expect(sql).toContain("e.is_public");
    expect(sql).not.toContain("r.email");
    expect(sql).not.toContain("full_name");
  });

  it("expires only stale pending payments", () => {
    const sql = migration("20261027000005_payment_expiry.sql");
    expect(sql).toContain("where status = 'pending'");
    expect(sql).toContain("status = 'pending_payment'");
    expect(sql).toContain("revoke all on function public.expire_stale_pending_payments");
    expect(sql).not.toContain("status = 'paid'");
    const lockdown = migration("20261027000006_expiry_access.sql");
    expect(lockdown).toContain("from anon, authenticated");
  });

  it("enforces paid registration capacity and duplicates in the database", () => {
    const sql = migration("20261027000003_payments.sql");
    expect(sql).toContain("raise exception 'ALREADY_REGISTERED'");
    expect(sql).toContain("raise exception 'EVENT_FULL'");
    expect(sql).toContain("for update");
  });
});
