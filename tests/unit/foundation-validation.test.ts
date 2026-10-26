import { describe, expect, it } from "vitest";

import {
  eventInputSchema,
  organizationInputSchema,
} from "@/lib/validation/foundation";

const validEvent = {
  title: "Community Workshop",
  slug: "community-workshop",
  startsAt: "2026-11-01T09:00:00.000Z",
  endsAt: "2026-11-01T12:00:00.000Z",
};

describe("organization input", () => {
  it("accepts a valid organization", () => {
    expect(
      organizationInputSchema.safeParse({
        name: "Tech Club",
        slug: "tech-club",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid slug", () => {
    expect(
      organizationInputSchema.safeParse({
        name: "Tech Club",
        slug: "Tech Club!",
      }).success,
    ).toBe(false);
  });
});

describe("event input", () => {
  it("accepts a valid free event with defaults", () => {
    const result = eventInputSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isFree).toBe(true);
      expect(result.data.currency).toBe("USD");
    }
  });

  it("rejects an event ending before it starts", () => {
    expect(
      eventInputSchema.safeParse({
        ...validEvent,
        endsAt: "2026-11-01T08:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  it("rejects a paid event with zero price", () => {
    expect(
      eventInputSchema.safeParse({
        ...validEvent,
        isFree: false,
        priceCents: 0,
      }).success,
    ).toBe(false);
  });

  it("accepts a paid event and normalizes currency", () => {
    const result = eventInputSchema.safeParse({
      ...validEvent,
      isFree: false,
      priceCents: 1500,
      currency: "usd",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe("USD");
    }
  });
});
