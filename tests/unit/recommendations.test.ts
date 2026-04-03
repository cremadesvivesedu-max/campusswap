import { describe, expect, it } from "vitest";
import { demoCurrentUserId } from "@/lib/demo-data";
import { recommendListingsForUser } from "@/server/services/recommendations";

describe("recommendListingsForUser", () => {
  it("returns active listings ranked by score", () => {
    const results = recommendListingsForUser(demoCurrentUserId);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.breakdown.score).toBeGreaterThan(results[results.length - 1]?.breakdown.score ?? 0);
  });
});
