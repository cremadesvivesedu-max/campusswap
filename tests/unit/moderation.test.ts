import { describe, expect, it } from "vitest";
import { assessListingRisk, findSuspiciousKeywords, shouldModerateListing } from "@/server/services/moderation";

describe("moderation", () => {
  it("finds suspicious terms", () => {
    expect(findSuspiciousKeywords("wire transfer only")).toContain("wire transfer");
  });

  it("flags risky listings", () => {
    expect(shouldModerateListing("Cheap bike", "Deposit first and I will hold it")).toBe(true);
  });
});

describe("listing risk checks", () => {
  it("lets ordinary listings through", () => {
    expect(assessListingRisk({ title: "IKEA desk", description: "White, 120 cm, pickup in Wyck", price: 30 })).toEqual({
      level: "ok",
      reasons: []
    });
  });

  it("holds bait prices on expensive items", () => {
    const result = assessListingRisk({ title: "iPhone 14 Pro", description: "Like new", price: 15 });
    expect(result.level).toBe("review");
    expect(result.reasons[0]).toContain("too good to be true");
  });

  it("holds scam wording in Spanish and Dutch", () => {
    expect(assessListingRisk({ title: "Bici", description: "Pago por adelantado y te la envío", price: 50 }).level).toBe("review");
    expect(assessListingRisk({ title: "Fiets", description: "Eerst betalen via tikkie vooraf", price: 50 }).level).toBe("review");
  });

  it("only notes contact details", () => {
    const result = assessListingRisk({ title: "Lamp", description: "WhatsApp me on +31 6 1234 5678", price: 10 });
    expect(result.level).toBe("note");
  });

  it("holds external links", () => {
    expect(assessListingRisk({ title: "Sofa", description: "More photos at www.example.com", price: 40 }).level).toBe("review");
  });
});
