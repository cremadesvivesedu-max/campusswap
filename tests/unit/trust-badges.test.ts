import { describe, expect, it } from "vitest";
import { formatReplyTime, getTrustBadges } from "@/features/profile/trust-badges";

const base = {
  verificationStatus: "pending",
  joinedAt: "2026-01-01T00:00:00Z",
  salesCount: 0,
  ratingAverage: 0,
  reviewCount: 0,
  responseRate: 0
};
const now = new Date("2026-10-16T12:00:00Z");

describe("trust badges", () => {
  it("gives nothing to a quiet older account", () => {
    expect(getTrustBadges(base, now)).toEqual([]);
  });

  it("rewards good sellers, fast replies and verification", () => {
    const ids = getTrustBadges(
      {
        ...base,
        verificationStatus: "verified",
        university: "Maastricht University",
        salesCount: 4,
        reviewCount: 3,
        ratingAverage: 4.8,
        responseRate: 0.95,
        medianReplyMinutes: 18
      },
      now
    );
    expect(ids).toEqual([
      { id: "trusted-seller" },
      { id: "fast-replier", detail: "20 min" },
      { id: "verified-student", detail: "UM" }
    ]);
  });

  it("marks new members", () => {
    expect(getTrustBadges({ ...base, joinedAt: "2026-10-10T00:00:00Z" }, now)).toEqual([{ id: "new-member" }]);
  });

  it("formats reply times", () => {
    expect(formatReplyTime(3)).toBe("5 min");
    expect(formatReplyTime(95)).toBe("2 h");
    expect(formatReplyTime(3000)).toBe("2 d");
  });
});
