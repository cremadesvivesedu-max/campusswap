import { describe, expect, it } from "vitest";
import { canPromoteListing, getPricingForModule } from "@/server/services/monetization";

describe("monetization", () => {
  it("loads featured pricing", () => {
    expect(getPricingForModule("featured")?.value).toBe(2);
  });

  it("allows active listings to be promoted", () => {
    expect(canPromoteListing("listing-bike-1")).toBe(true);
  });
});
