import { describe, expect, it } from "vitest";
import { dictionaries, getLocalizedQuickAction, SELLER_QUICK_ACTIONS, type Dictionary } from "@/lib/i18n-shared";

describe("getLocalizedQuickAction", () => {
  it("shows the same stored message in each reader's language", () => {
    expect(getLocalizedQuickAction((dictionaries.nl as unknown as Dictionary), "Is this available?")).toBe("Is dit nog beschikbaar?");
    expect(getLocalizedQuickAction((dictionaries.es as unknown as Dictionary), SELLER_QUICK_ACTIONS[1])).toContain("reservado");
    expect(getLocalizedQuickAction((dictionaries.en as unknown as Dictionary), SELLER_QUICK_ACTIONS[0])).toBe(SELLER_QUICK_ACTIONS[0]);
  });

  it("leaves anything a person typed alone", () => {
    expect(getLocalizedQuickAction((dictionaries.nl as unknown as Dictionary), "See you at 5")).toBe("See you at 5");
  });
});
