import { describe, expect, it } from "vitest";
import {
  formatChange,
  formatMondaySummary,
  getWeekStarts,
  startOfWeek,
  type WeekMetrics
} from "@/server/services/weekly-metrics";

function week(overrides: Partial<WeekMetrics>): WeekMetrics {
  return {
    weekStart: "2027-02-01T00:00:00.000Z",
    newUsers: 0,
    newListings: 0,
    newChats: 0,
    messages: 0,
    sales: 0,
    salesVolume: 0,
    reviews: 0,
    averageRating: null,
    ...overrides
  };
}

describe("weekly metrics", () => {
  it("starts weeks on Monday", () => {
    // Wednesday 10 Feb 2027 -> Monday 8 Feb
    expect(startOfWeek(new Date("2027-02-10T15:00:00Z")).toISOString()).toBe("2027-02-08T00:00:00.000Z");
    // Sunday belongs to the week that started the Monday before
    expect(startOfWeek(new Date("2027-02-14T23:00:00Z")).toISOString()).toBe("2027-02-08T00:00:00.000Z");
    // Monday is its own start
    expect(startOfWeek(new Date("2027-02-15T00:00:00Z")).toISOString()).toBe("2027-02-15T00:00:00.000Z");
  });

  it("lists the most recent weeks first", () => {
    const starts = getWeekStarts(new Date("2027-02-10T12:00:00Z"), 3).map((d) => d.toISOString().slice(0, 10));
    expect(starts).toEqual(["2027-02-08", "2027-02-01", "2027-01-25"]);
  });

  it("formats week-on-week change", () => {
    expect(formatChange(15, 10)).toBe("+50%");
    expect(formatChange(5, 10)).toBe("-50%");
    expect(formatChange(10, 10)).toBe("=");
    expect(formatChange(3, 0)).toBe("nuevo");
    expect(formatChange(0, 0)).toBe("=");
  });

  it("writes the Monday push in one line", () => {
    const summary = formatMondaySummary(
      week({ newUsers: 12, newListings: 20, newChats: 9, sales: 4, salesVolume: 130 }),
      week({ newUsers: 8, newListings: 20, newChats: 0, sales: 2 })
    );
    expect(summary).toBe("Usuarios 12 (+50%) · Anuncios 20 (=) · Chats 9 (nuevo) · Ventas 4 (€130)");
  });
});
