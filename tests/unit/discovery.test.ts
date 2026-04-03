import { describe, expect, it } from "vitest";
import { demoData } from "@/lib/demo-data";
import { filterListings } from "@/features/search/discovery";

describe("filterListings", () => {
  it("filters down to a category subcategory combination", () => {
    const results = filterListings(demoData.listings, {
      query: "",
      categorySlug: "furniture",
      subcategorySlug: "desks",
      conditions: [],
      outletOnly: false,
      featuredOnly: false,
      sort: "recommended"
    });

    expect(results.map((listing) => listing.id)).toContain("listing-desk-1");
    expect(results.every((listing) => listing.categorySlug === "furniture")).toBe(true);
  });

  it("keeps sold listings out of discovery results", () => {
    const results = filterListings(demoData.listings, {
      query: "",
      conditions: [],
      outletOnly: false,
      featuredOnly: false,
      sort: "recommended"
    });

    expect(results.some((listing) => listing.status === "sold")).toBe(false);
  });
});
