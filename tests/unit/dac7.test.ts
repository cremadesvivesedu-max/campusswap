import { describe, expect, it } from "vitest";
import { dac7Status, summarizeDac7, type Dac7Sale } from "@/server/services/dac7";

const sale = (sellerId: string, completedAt: string, amount: number, platformFee = 0): Dac7Sale => ({
  sellerId,
  completedAt,
  amount,
  platformFee
});

describe("dac7", () => {
  it("excludes sellers under 30 sales and under 2,000 euros", () => {
    expect(dac7Status(10, 500)).toBe("exempt");
    expect(dac7Status(29, 1999.99)).toBe("close");
    expect(dac7Status(23, 100)).toBe("close");
    expect(dac7Status(5, 1500)).toBe("close");
    expect(dac7Status(30, 10)).toBe("reportable");
    expect(dac7Status(1, 2000)).toBe("reportable");
  });

  it("groups by seller, year and quarter", () => {
    const rows = summarizeDac7(
      [
        sale("ana", "2026-01-15T10:00:00Z", 1200, 12),
        sale("ana", "2026-05-02T10:00:00Z", 900.5, 9),
        sale("ana", "2025-12-31T23:00:00Z", 5000),
        sale("bo", "2026-11-20T10:00:00Z", 20)
      ],
      2026
    );
    expect(rows.map((r) => r.sellerId)).toEqual(["ana", "bo"]);
    expect(rows[0]).toMatchObject({ sales: 2, consideration: 2100.5, fees: 21, status: "reportable" });
    expect(rows[0].quarters[0]).toEqual({ sales: 1, consideration: 1200, fees: 12 });
    expect(rows[0].quarters[1]).toEqual({ sales: 1, consideration: 900.5, fees: 9 });
    expect(rows[1].quarters[3].sales).toBe(1);
    expect(rows[1].status).toBe("exempt");
  });
});
