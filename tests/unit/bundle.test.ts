import { describe, expect, it } from "vitest";
import { buildBundleMessage, suggestBundlePrice } from "@/features/listings/bundle";

describe("bundles", () => {
  it("opens with about 10% off", () => {
    expect(suggestBundlePrice(53)).toBe(50);
    expect(suggestBundlePrice(12)).toBe(11);
    expect(suggestBundlePrice(0)).toBe(0);
  });

  it("lists every item with its link and the offer", () => {
    const message = buildBundleMessage(
      [
        { id: "a", title: "Desk", price: 30 },
        { id: "b", title: "Lamp", price: 8 }
      ],
      34,
      "https://campusswap.example"
    );
    expect(message).toContain("📦 Bundle (2)");
    expect(message).toContain("• Desk — €30");
    expect(message).toContain("https://campusswap.example/app/listings/b");
    expect(message).toContain("Σ €38 → 💬 €34?");
  });
});
