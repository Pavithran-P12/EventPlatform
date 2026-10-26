import { describe, expect, it } from "vitest";

import {
  formatPrice,
  gradientForKey,
  parseRegistrationError,
  seatsLeft,
  slugify,
  uniqueSlug,
} from "@/lib/db/helpers";

describe("slugify", () => {
  it("creates url-safe slugs", () => {
    expect(slugify("Innovate 2026 — Tech Symposium!")).toBe(
      "innovate-2026-tech-symposium",
    );
  });

  it("guarantees a minimum length", () => {
    expect(slugify("AI")).toBe("ai-event");
  });
});

describe("uniqueSlug", () => {
  it("returns the base when free", () => {
    expect(uniqueSlug("my-event", new Set())).toBe("my-event");
  });

  it("appends a suffix when taken", () => {
    expect(uniqueSlug("my-event", new Set(["my-event", "my-event-2"]))).toBe(
      "my-event-3",
    );
  });
});

describe("registration errors", () => {
  it("maps database codes to stable app codes", () => {
    expect(parseRegistrationError("error: EVENT_FULL")).toBe("EVENT_FULL");
    expect(parseRegistrationError("ALREADY_REGISTERED")).toBe(
      "ALREADY_REGISTERED",
    );
    expect(parseRegistrationError("something else")).toBe("UNKNOWN");
  });
});

describe("capacity helpers", () => {
  it("computes seats left and clamps at zero", () => {
    expect(seatsLeft(100, 40)).toBe(60);
    expect(seatsLeft(100, 120)).toBe(0);
    expect(seatsLeft(null, 10)).toBeNull();
  });

  it("formats INR and free prices", () => {
    expect(formatPrice({ is_free: true, price_cents: 0, currency: "INR" })).toBe(
      "Free",
    );
    expect(
      formatPrice({ is_free: false, price_cents: 49900, currency: "INR" }),
    ).toBe("₹499");
  });

  it("picks a stable gradient per key", () => {
    expect(gradientForKey("innovate-2026")).toBe(gradientForKey("innovate-2026"));
  });
});
