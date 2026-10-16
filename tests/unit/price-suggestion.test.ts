import { describe, expect, it } from "vitest";
import { roundPrice, suggestPrice, titleKeywords } from "@/features/listings/price-suggestion";

const desks = [
  { title: "IKEA desk white", price: 30 },
  { title: "Small desk with drawer", price: 25 },
  { title: "Standing desk", price: 60 },
  { title: "Desk + chair", price: 40 },
  { title: "Office chair", price: 20 },
  { title: "Bookcase", price: 15 }
];

describe("price suggestion", () => {
  it("picks meaningful words from titles", () => {
    expect(titleKeywords("Escritorio IKEA muy bueno, 120 cm")).toEqual(["escritorio", "ikea"]);
  });

  it("uses similar listings when there are enough", () => {
    const suggestion = suggestPrice("Desk for sale", desks);
    expect(suggestion).toMatchObject({ basis: "similar", count: 4, low: 30, high: 45, typical: 35 });
  });

  it("falls back to the whole category", () => {
    const suggestion = suggestPrice("Lamp", desks);
    expect(suggestion?.basis).toBe("category");
    expect(suggestion?.count).toBe(6);
  });

  it("says nothing when there is too little data", () => {
    expect(suggestPrice("Desk", desks.slice(0, 2))).toBeNull();
  });

  it("rounds to everyday prices", () => {
    expect(roundPrice(12.4)).toBe(12);
    expect(roundPrice(37)).toBe(35);
    expect(roundPrice(0.2)).toBe(1);
  });
});

describe("price drop nudges", () => {
  it("suggests about 15% off at an everyday price", async () => {
    const { suggestPriceDrop } = await import("@/features/listings/price-suggestion");
    expect(suggestPriceDrop(20)).toBe(17);
    expect(suggestPriceDrop(100)).toBe(85);
    expect(suggestPriceDrop(5)).toBe(4);
    expect(suggestPriceDrop(3)).toBeNull();
  });

  it("only nudges week-old listings nobody has written about", async () => {
    const { isStaleListing } = await import("@/features/listings/price-suggestion");
    const now = new Date("2027-03-10T12:00:00Z");
    expect(isStaleListing({ createdAt: "2027-03-01T12:00:00Z", chats: 0, status: "active" }, now)).toBe(true);
    expect(isStaleListing({ createdAt: "2027-03-01T12:00:00Z", chats: 2, status: "active" }, now)).toBe(false);
    expect(isStaleListing({ createdAt: "2027-03-08T12:00:00Z", chats: 0, status: "active" }, now)).toBe(false);
    expect(isStaleListing({ createdAt: "2027-03-01T12:00:00Z", chats: 0, status: "sold" }, now)).toBe(false);
  });
});
