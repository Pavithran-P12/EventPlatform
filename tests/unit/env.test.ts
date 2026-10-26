import { describe, expect, it } from "vitest";

import {
  getPublicEnv,
  getServerEnv,
  isSupabaseConfigured,
} from "@/lib/env";

const validPublic: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
};

describe("environment validation", () => {
  it("accepts a valid public environment", () => {
    expect(getPublicEnv(validPublic).NEXT_PUBLIC_APP_URL).toBe(
      "http://localhost:3000",
    );
  });

  it("rejects a missing Supabase URL", () => {
    expect(() =>
      getPublicEnv({ ...validPublic, NEXT_PUBLIC_SUPABASE_URL: undefined }),
    ).toThrow("Invalid public environment");
  });

  it("defaults the app URL when it is not set", () => {
    expect(
      getPublicEnv({ ...validPublic, NEXT_PUBLIC_APP_URL: undefined })
        .NEXT_PUBLIC_APP_URL,
    ).toBe("http://localhost:3000");
  });

  it("rejects a malformed app URL", () => {
    expect(() =>
      getPublicEnv({ ...validPublic, NEXT_PUBLIC_APP_URL: "not-a-url" }),
    ).toThrow("Invalid public environment");
  });

  it("requires the service-role key only for server env", () => {
    expect(() => getServerEnv(validPublic)).toThrow(
      "Invalid server environment",
    );
    expect(
      getServerEnv({ ...validPublic, SUPABASE_SERVICE_ROLE_KEY: "secret" })
        .PAYPAL_ENV,
    ).toBe("sandbox");
  });

  it("reports unconfigured Supabase without throwing", () => {
    expect(isSupabaseConfigured({} as NodeJS.ProcessEnv)).toBe(false);
    expect(isSupabaseConfigured(validPublic)).toBe(true);
  });
});
