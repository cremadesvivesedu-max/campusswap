import { describe, expect, it } from "vitest";
import { searchListings } from "@/server/services/search";

describe("searchListings", () => {
  it("filters by category", () => {
    const results = searchListings({ categorySlug: "bikes" });
    expect(results.every((listing) => listing.categorySlug === "bikes")).toBe(true);
  });

  it("sorts by low price", () => {
    const results = searchListings({ sort: "price-low-high" });
    expect(results[0]?.price).toBeLessThanOrEqual(results[1]?.price ?? Number.MAX_SAFE_INTEGER);
  });
});
