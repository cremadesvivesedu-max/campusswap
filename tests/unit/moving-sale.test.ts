import { describe, expect, it } from "vitest";
import {
  daysUntilMoveOut,
  formatMoveOutCountdown,
  parseMoveOutDate
} from "@/features/profile/moving-sale";

const now = new Date("2026-10-13T15:00:00Z");
const copy = { daysLeft: "{days} days left", oneDayLeft: "1 day left", today: "Today" };

describe("moving sale", () => {
  it("accepts moving days from today up to a year ahead", () => {
    expect(parseMoveOutDate("2026-10-13", now)).toBe("2026-10-13");
    expect(parseMoveOutDate("2027-06-30", now)).toBe("2027-06-30");
    expect(parseMoveOutDate("2026-10-12", now)).toBeNull();
    expect(parseMoveOutDate("2028-01-01", now)).toBeNull();
  });

  it("rejects malformed or impossible dates", () => {
    expect(parseMoveOutDate("2026-02-30", now)).toBeNull();
    expect(parseMoveOutDate("13/10/2026", now)).toBeNull();
    expect(parseMoveOutDate(null, now)).toBeNull();
  });

  it("counts whole days until moving day and stops after it", () => {
    expect(daysUntilMoveOut("2026-10-13", now)).toBe(0);
    expect(daysUntilMoveOut("2026-10-25", now)).toBe(12);
    expect(daysUntilMoveOut("2026-10-01", now)).toBeNull();
    expect(daysUntilMoveOut(null, now)).toBeNull();
  });

  it("words the countdown", () => {
    expect(formatMoveOutCountdown(0, copy)).toBe("Today");
    expect(formatMoveOutCountdown(1, copy)).toBe("1 day left");
    expect(formatMoveOutCountdown(9, copy)).toBe("9 days left");
  });
});
