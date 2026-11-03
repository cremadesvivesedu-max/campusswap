import { describe, expect, it } from "vitest";
import { buildBundleMessage, suggestBundlePrice } from "@/features/listings/bundle";
import { parseAwayUntil, parseBundleDiscount } from "@/features/profile/seller-preferences";

const now = new Date("2026-11-03T12:00:00Z");

describe("seller preferences", () => {
  it("only accepts the offered discounts", () => {
    expect(parseBundleDiscount("15")).toBe(15);
    expect(parseBundleDiscount(30)).toBe(30);
    for (const bad of ["", "7", 95, -10, null, undefined, "abc", {}]) {
      expect(parseBundleDiscount(bad)).toBeNull();
    }
  });

  it("treats a seller as away only until the return date", () => {
    expect(parseAwayUntil("2026-11-10", now)).toBe("2026-11-10");
    expect(parseAwayUntil("2026-11-04", now)).toBe("2026-11-04");
    expect(parseAwayUntil("2026-11-03", now)).toBeNull();
    expect(parseAwayUntil("2026-11-02", now)).toBeNull();
    expect(parseAwayUntil("2028-01-01", now)).toBeNull();
    expect(parseAwayUntil("<b>soon</b>", now)).toBeNull();
  });

  it("applies the seller's exact discount to a bundle", () => {
    expect(suggestBundlePrice(53, 15)).toBe(45.05);
    expect(suggestBundlePrice(100, 30)).toBe(70);
    expect(suggestBundlePrice(53, null)).toBe(50);
  });

  it("shows the discount in the message only when it was applied", () => {
    const items = [{ id: "a", title: "Desk", price: 100 }];
    expect(buildBundleMessage(items, 85, "https://x", 15)).toContain("€85? (−15%)");
    expect(buildBundleMessage(items, 80, "https://x", null)).not.toContain("%");
  });
});
