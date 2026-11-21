import { describe, expect, it } from "vitest";
import {
  ambassadorLevel,
  canBump,
  clearancePrice,
  co2ForCategory,
  invitesToNextLevel,
  rankResidences,
  shouldAutoAccept,
  timeLeft,
  validMinimum
} from "@/features/impact/seller-tools";

describe("CO2 by category", () => {
  it("uses the category figure or a small default", () => {
    expect(co2ForCategory("bikes")).toBe(96);
    expect(co2ForCategory("unknown")).toBe(8);
    expect(co2ForCategory(null)).toBe(8);
  });
});

describe("residence ranking", () => {
  it("sorts by CO2, hides 'other', unknown slugs and residences with too few items", () => {
    const rows = [
      { residence: "the-ed", items: 4, kg: 120 },
      { residence: "randwyck", items: 9, kg: 300 },
      { residence: "other", items: 50, kg: 900 },
      { residence: "nowhere", items: 10, kg: 500 },
      { residence: "wyck", items: 2, kg: 400 }
    ];
    expect(rankResidences(rows).map((row) => row.residence)).toEqual(["randwyck", "the-ed"]);
  });
});

describe("ambassadors", () => {
  it("gives levels at 5 and 15 invites", () => {
    expect(ambassadorLevel(4)).toBeNull();
    expect(ambassadorLevel(5)).toBe("ambassador");
    expect(ambassadorLevel(15)).toBe("gold");
    expect(invitesToNextLevel(3)).toBe(2);
    expect(invitesToNextLevel(7)).toBe(8);
    expect(invitesToNextLevel(20)).toBe(0);
  });
});

describe("clearance", () => {
  it("cuts the price, rounds to 50 cents and never goes below 1 euro", () => {
    expect(clearancePrice(45, 20)).toBe(36);
    expect(clearancePrice(19.99, 30)).toBe(14);
    expect(clearancePrice(1.5, 50)).toBe(1);
    expect(clearancePrice(40, 15)).toBeNull();
    expect(clearancePrice(0, 20)).toBeNull();
  });
  it("counts down and stops at the end", () => {
    const now = Date.parse("2026-11-21T10:00:00Z");
    expect(timeLeft("2026-11-23T10:00:00Z", now)).toEqual({ days: 2, hours: 0, minutes: 0 });
    expect(timeLeft("2026-11-21T15:30:00Z", now)).toEqual({ days: 0, hours: 5, minutes: 30 });
    expect(timeLeft("2026-11-21T09:00:00Z", now)).toBeNull();
  });
});

describe("hidden minimum and bump", () => {
  it("accepts only offers that reach the minimum", () => {
    expect(validMinimum(30, 40)).toBe(true);
    expect(validMinimum(40, 40)).toBe(false);
    expect(shouldAutoAccept(30, 30)).toBe(true);
    expect(shouldAutoAccept(29.5, 30)).toBe(false);
    expect(shouldAutoAccept(100, null)).toBe(false);
  });
  it("allows one bump a day", () => {
    const now = Date.parse("2026-11-21T10:00:00Z");
    expect(canBump(null, now)).toBe(true);
    expect(canBump("2026-11-21T00:00:00Z", now)).toBe(false);
    expect(canBump("2026-11-20T09:00:00Z", now)).toBe(true);
  });
});
