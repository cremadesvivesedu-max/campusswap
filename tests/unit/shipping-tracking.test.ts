import { describe, expect, it } from "vitest";
import {
  buildTrackingUrl,
  isProtectionWindowOver,
  isValidTrackingNumber,
  normalizeTrackingNumber,
  protectionDaysLeft
} from "@/lib/shipping/tracking";

describe("shipping tracking", () => {
  it("cleans up tracking numbers people paste", () => {
    expect(normalizeTrackingNumber(" 3s abcd-1234 567 ")).toBe("3SABCD1234567");
    expect(isValidTrackingNumber("3S ABCD 1234567")).toBe(true);
    expect(isValidTrackingNumber("123")).toBe(false);
    expect(isValidTrackingNumber("abc$%^123456")).toBe(false);
  });

  it("builds PostNL links with the destination postcode", () => {
    expect(
      buildTrackingUrl("postnl", "3sabc123456", { postalCode: "6211 AB", country: "Netherlands" })
    ).toBe("https://jouw.postnl.nl/track-and-trace/3SABC123456-NL-6211AB");
    expect(buildTrackingUrl("postnl", "3SABC123456", { postalCode: "1000", country: "Belgium" })).toBe(
      "https://jouw.postnl.nl/track-and-trace/3SABC123456-BE-1000"
    );
  });

  it("links the other carriers and gives no link for 'other'", () => {
    expect(buildTrackingUrl("dhl", "JVGL0123456789")).toContain("tracking-id=JVGL0123456789");
    expect(buildTrackingUrl("ups", "1Z999AA10123456784")).toBe(
      "https://www.ups.com/track?tracknum=1Z999AA10123456784"
    );
    expect(buildTrackingUrl("other", "ABC123456")).toBeNull();
  });

  it("releases the payment 14 days after shipping", () => {
    const shippedAt = "2027-03-01T10:00:00Z";
    expect(isProtectionWindowOver(shippedAt, new Date("2027-03-14T10:00:00Z"))).toBe(false);
    expect(isProtectionWindowOver(shippedAt, new Date("2027-03-15T10:00:00Z"))).toBe(true);
    expect(protectionDaysLeft(shippedAt, new Date("2027-03-05T10:00:00Z"))).toBe(10);
    expect(protectionDaysLeft(shippedAt, new Date("2027-04-01T10:00:00Z"))).toBe(0);
  });
});
