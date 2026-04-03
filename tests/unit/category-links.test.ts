import { describe, expect, it } from "vitest";
import { getCategoryBrowseHref } from "@/lib/category-links";

describe("getCategoryBrowseHref", () => {
  it("routes standard categories into the app browse experience", () => {
    expect(getCategoryBrowseHref("furniture")).toBe("/app/categories/furniture");
  });

  it("routes outlet to the dedicated outlet experience", () => {
    expect(getCategoryBrowseHref("outlet")).toBe("/outlet");
  });
});
