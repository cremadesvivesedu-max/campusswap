import { describe, expect, it } from "vitest";
import { resolvePickupArea } from "@/lib/maastricht-pickup-areas";

describe("resolvePickupArea", () => {
  it("maps station-side listings to Wyck", () => {
    const area = resolvePickupArea({
      pickupArea: "Station side",
      location: "Wyck"
    });

    expect(area.areaId).toBe("wyck");
  });

  it("uses neighborhood fallback when the pickup area is generic", () => {
    const area = resolvePickupArea({
      pickupArea: "Near bus stop",
      neighborhood: "Sint Pieter"
    });

    expect(area.areaId).toBe("sint-pieter");
  });

  it("falls back to central Maastricht for unknown areas", () => {
    const area = resolvePickupArea({
      pickupArea: "Somewhere nearby"
    });

    expect(area.areaId).toBe("maastricht");
  });
});
