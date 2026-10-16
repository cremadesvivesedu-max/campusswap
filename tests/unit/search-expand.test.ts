import { describe, expect, it } from "vitest";
import { editDistance, expandSearchQuery, matchesExpandedQuery, sanitizeSearchTerm } from "@/features/search/expand";

describe("multilingual search", () => {
  it("finds English listings from Spanish and Dutch words", () => {
    expect(matchesExpandedQuery("Gazelle city bike with lock", expandSearchQuery("bici"))).toBe(true);
    expect(matchesExpandedQuery("Gazelle city bike with lock", expandSearchQuery("fiets"))).toBe(true);
    expect(matchesExpandedQuery("Escritorio blanco IKEA", expandSearchQuery("desk"))).toBe(true);
  });

  it("forgives small typos", () => {
    expect(matchesExpandedQuery("White desk 120 cm", expandSearchQuery("escritrio"))).toBe(true);
    expect(matchesExpandedQuery("Warm duvet 140x200", expandSearchQuery("duvt"))).toBe(true);
    expect(matchesExpandedQuery("Office chair", expandSearchQuery("chiar"))).toBe(true);
  });

  it("needs every word to match", () => {
    expect(matchesExpandedQuery("Desk lamp, warm light", expandSearchQuery("lámpara escritorio"))).toBe(true);
    expect(matchesExpandedQuery("Desk lamp", expandSearchQuery("bike lamp"))).toBe(false);
  });

  it("drops filler words and keeps unknown words as they are", () => {
    expect(expandSearchQuery("una bici para la uni").map((group) => group[0])).toEqual(["bici", "uni"]);
    expect(expandSearchQuery("gazelle")).toEqual([["gazelle"]]);
  });

  it("measures typos including swapped letters", () => {
    expect(editDistance("chiar", "chair")).toBe(1);
    expect(editDistance("bike", "bike")).toBe(0);
  });

  it("strips characters that would break the database filter", () => {
    expect(sanitizeSearchTerm("desk),title.eq.x")).toBe("desktitleeqx");
  });
});
