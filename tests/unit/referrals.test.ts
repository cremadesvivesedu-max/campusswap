import { describe, expect, it } from "vitest";
import { isReferralCode, referralCodeFor, shortName } from "@/features/referrals/code";

describe("referrals", () => {
  it("derives the same 8-character code as the database column", () => {
    expect(referralCodeFor("3F2A9C1B-0d4e-4c1a-9a1b-123456789abc")).toBe("3f2a9c1b");
  });

  it("accepts only well-formed codes", () => {
    expect(isReferralCode("3f2a9c1b")).toBe(true);
    expect(isReferralCode("3f2a9c1")).toBe(false);
    expect(isReferralCode("<script>")).toBe(false);
    expect(isReferralCode(null)).toBe(false);
  });

  it("shows only first name and initial on the leaderboard", () => {
    expect(shortName("Lina Vermeer")).toBe("Lina V.");
    expect(shortName("Omar El Hadi")).toBe("Omar H.");
    expect(shortName("Mila")).toBe("Mila");
  });
});
