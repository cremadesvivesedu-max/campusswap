import { describe, expect, it } from "vitest";
import { translateServerMessage } from "@/lib/server-messages";

describe("server message translation", () => {
  it("translates known messages to Spanish and Dutch", () => {
    expect(translateServerMessage("Offer sent.", "es")).toBe("Oferta enviada.");
    expect(translateServerMessage("Offer sent.", "nl")).toBe("Bod verstuurd.");
  });

  it("keeps English and unknown messages as they are", () => {
    expect(translateServerMessage("Offer sent.", "en")).toBe("Offer sent.");
    expect(translateServerMessage("Something new", "es")).toBe("Something new");
  });
});
