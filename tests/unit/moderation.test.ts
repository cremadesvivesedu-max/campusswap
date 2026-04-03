import { describe, expect, it } from "vitest";
import { findSuspiciousKeywords, shouldModerateListing } from "@/server/services/moderation";

describe("moderation", () => {
  it("finds suspicious terms", () => {
    expect(findSuspiciousKeywords("wire transfer only")).toContain("wire transfer");
  });

  it("flags risky listings", () => {
    expect(shouldModerateListing("Cheap bike", "Deposit first and I will hold it")).toBe(true);
  });
});
