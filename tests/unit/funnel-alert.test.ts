import { findFunnelDrops, type FunnelWeek } from "@/features/funnel/funnel-alert";

function week(visits: number, signups: number, listings: number, sales: number): FunnelWeek {
  return { weekStart: "2027-02-01", visits, signups, listings, sales };
}

const steady = week(400, 40, 20, 10);

describe("funnel drop alert", () => {
  it("stays quiet when rates hold", () => {
    expect(findFunnelDrops([week(50, 5, 2, 1), week(380, 37, 19, 9), steady, steady, steady])).toEqual([]);
  });

  it("flags a step whose rate fell below 60 % of the usual", () => {
    const alerts = findFunnelDrops([week(0, 0, 0, 0), week(400, 15, 8, 4), steady, steady, steady]);
    expect(alerts.map((alert) => alert.step)).toEqual(["visit_signup"]);
    expect(alerts[0].current).toBeCloseTo(0.0375);
    expect(alerts[0].baseline).toBeCloseTo(0.1);
  });

  it("ignores the unfinished current week", () => {
    expect(findFunnelDrops([week(400, 0, 0, 0), steady, steady, steady])).toEqual([]);
  });

  it("does not alarm on tiny numbers", () => {
    const small = week(30, 3, 2, 1);
    expect(findFunnelDrops([small, week(30, 0, 0, 0), small, small, small])).toEqual([]);
  });

  it("needs at least two baseline weeks", () => {
    expect(findFunnelDrops([steady, week(400, 1, 1, 0), steady])).toEqual([]);
  });
});
