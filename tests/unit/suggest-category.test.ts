import { describe, expect, it } from "vitest";
import { parsePriceRange, suggestCategory } from "@/features/listings/suggest-category";

const slugs = [
  "furniture",
  "bikes",
  "electronics",
  "kitchen-equipment",
  "household-items",
  "essentials-daily-living",
  "textbooks-study-materials",
  "outlet"
];

describe("suggestCategory", () => {
  it("recognises titles in English, Spanish and Dutch", () => {
    expect(suggestCategory("Blue city bike with lock", slugs)).toBe("bikes");
    expect(suggestCategory("Bicicleta de paseo", slugs)).toBe("bikes");
    expect(suggestCategory("Escritorio blanco IKEA", slugs)).toBe("furniture");
    expect(suggestCategory("Lámpara de mesa", slugs)).toBe("household-items");
    expect(suggestCategory("Oude fiets", slugs)).toBe("bikes");
    expect(suggestCategory("Koptelefoon Sony", slugs)).toBe("electronics");
  });

  it("matches plurals and whole words only", () => {
    expect(suggestCategory("Two desks", slugs)).toBe("furniture");
    expect(suggestCategory("Panasonic thing", slugs)).toBeNull();
  });

  it("prefers the longer, more specific keyword", () => {
    expect(suggestCategory("Mini rice cooker", slugs)).toBe("kitchen-equipment");
  });

  it("only suggests categories that exist", () => {
    expect(suggestCategory("City bike", ["furniture"])).toBeNull();
    expect(suggestCategory("", slugs)).toBeNull();
  });
});

describe("parsePriceRange", () => {
  it("reads the category price range", () => {
    expect(parsePriceRange("60-220")).toEqual({ min: 60, max: 220 });
    expect(parsePriceRange("anything")).toBeNull();
    expect(parsePriceRange(undefined)).toBeNull();
  });
});
