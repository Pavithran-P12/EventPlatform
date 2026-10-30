import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const hasSupabaseTestEnv =
  process.env.RUN_INTEGRATION_TESTS === "1" &&
  Boolean(url && anonKey && serviceKey);
const describeIntegration = hasSupabaseTestEnv ? describe : describe.skip;

describeIntegration("Supabase access boundaries", () => {
  it("does not expose registrations to anonymous visitors", async () => {
    const anon = createClient(url!, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await anon
      .from("registrations")
      .select("id,email")
      .limit(1);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("does not expose webhook events to anonymous visitors", async () => {
    const anon = createClient(url!, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await anon
      .from("payment_webhook_events")
      .select("id")
      .limit(1);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("returns aggregate-only public registration counts", async () => {
    const anon = createClient(url!, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await anon.rpc("get_public_registration_counts", {
      target_event_ids: [],
    });
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("keeps stale-payment expiry service-role only", async () => {
    const anon = createClient(url!, anonKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await anon.rpc("expire_stale_pending_payments", {
      stale_after: "30 minutes",
    });
    expect(error).not.toBeNull();
  });
});
