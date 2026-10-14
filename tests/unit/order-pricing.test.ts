import { describe, expect, it } from "vitest";
import {
  calculatePlatformFee,
  createOrderBreakdown,
  isFreeLaunchPeriod
} from "@/lib/payments/order-pricing";

const duringLaunch = new Date("2027-03-01T12:00:00Z");
const afterLaunch = new Date("2027-09-01T12:00:00Z");

describe("order pricing", () => {
  it("charges nothing during the free launch period", () => {
    expect(isFreeLaunchPeriod(duringLaunch)).toBe(true);
    expect(calculatePlatformFee(40, duringLaunch)).toBe(0);
  });

  it("charges 5% + €0.50 once the free period ends", () => {
    expect(isFreeLaunchPeriod(afterLaunch)).toBe(false);
    expect(calculatePlatformFee(40, afterLaunch)).toBe(2.5);
    expect(calculatePlatformFee(9.99, afterLaunch)).toBe(1);
  });

  it("never charges a fee on a free item", () => {
    expect(calculatePlatformFee(0, afterLaunch)).toBe(0);
  });

  it("adds shipping and the fee to the buyer total; the seller keeps item + shipping", () => {
    const breakdown = createOrderBreakdown({ itemAmount: 40, shippingAmount: 5, now: afterLaunch });
    expect(breakdown).toMatchObject({
      platform_fee: 2.5,
      seller_net_amount: 45,
      total_amount: 47.5
    });
  });
});
