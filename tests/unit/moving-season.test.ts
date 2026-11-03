import { describe, expect, it } from "vitest";
import { isMovingSeason } from "@/features/profile/moving-sale";

describe("moving season", () => {
  it("is on in January and June only", () => {
    expect(isMovingSeason(new Date("2027-01-15T12:00:00Z"))).toBe(true);
    expect(isMovingSeason(new Date("2027-06-30T12:00:00Z"))).toBe(true);
    expect(isMovingSeason(new Date("2027-02-01T12:00:00Z"))).toBe(false);
    expect(isMovingSeason(new Date("2026-11-03T12:00:00Z"))).toBe(false);
  });
});
