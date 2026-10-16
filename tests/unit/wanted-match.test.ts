import { describe, expect, it } from "vitest";
import { listingMatchesWanted } from "@/features/wanted/match";

const bike = { title: "Gazelle city bike with lock", categorySlug: "bikes", price: 90 };

describe("wanted matching", () => {
  it("matches on a shared word", () => {
    expect(listingMatchesWanted({ title: "Looking for a bike" }, bike)).toBe(true);
    expect(listingMatchesWanted({ title: "bikes under 100" }, bike)).toBe(true);
  });

  it("respects category and budget", () => {
    expect(listingMatchesWanted({ title: "bike", categorySlug: "furniture" }, bike)).toBe(false);
    expect(listingMatchesWanted({ title: "bike", maxPrice: 60 }, bike)).toBe(false);
    expect(listingMatchesWanted({ title: "bike", maxPrice: 100, categorySlug: "bikes" }, bike)).toBe(true);
  });

  it("ignores unrelated listings", () => {
    expect(listingMatchesWanted({ title: "Desk chair" }, bike)).toBe(false);
  });
});
