import { describe, expect, it } from "vitest";
import { demoData } from "@/lib/demo-data";
import { arrivalKit, arrivalKitSearchHref, countMatches } from "@/features/listings/arrival-kit";

const item = (id: string) => arrivalKit.flatMap((group) => group.items).find((entry) => entry.id === id)!;

describe("arrival kit", () => {
  it("has a label in every language for every item", () => {
    for (const group of arrivalKit) {
      for (const entry of group.items) {
        expect(entry.label.en && entry.label.es && entry.label.nl).toBeTruthy();
      }
    }
  });

  it("counts only active listings that match a keyword", () => {
    expect(countMatches(item("bike"), demoData.listings)).toBeGreaterThan(0);
    const sold = demoData.listings.map((listing) => ({ ...listing, status: "sold" as const }));
    expect(countMatches(item("bike"), sold)).toBe(0);
  });

  it("links each item to a search", () => {
    expect(arrivalKitSearchHref(item("drying"))).toBe("/app/search?q=drying%20rack");
  });
});
