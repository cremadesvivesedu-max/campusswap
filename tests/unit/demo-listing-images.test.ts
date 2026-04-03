import { describe, expect, it } from "vitest";
import { demoData } from "@/lib/demo-data";

describe("demo listing images", () => {
  it("uses realistic remote photo assets for all seeded listing images", () => {
    expect(
      demoData.listings.every((listing) =>
        listing.images.every((image) => image.url.startsWith("https://images.unsplash.com/"))
      )
    ).toBe(true);
  });
});
