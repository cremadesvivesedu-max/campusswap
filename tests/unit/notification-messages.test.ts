import { describe, expect, it } from "vitest";
import { translateNotificationText } from "@/lib/notification-messages";

describe("notification translations", () => {
  it("translates fixed titles", () => {
    expect(translateNotificationText("Order shipped", "es")).toBe("Pedido enviado");
    expect(translateNotificationText("How did it go? ⭐", "nl")).toBe("Hoe ging het? ⭐");
  });

  it("keeps listing titles and amounts inside templates", () => {
    expect(translateNotificationText("Gazelle bike is now visible on CampusSwap.", "es")).toBe(
      "Gazelle bike ya se ve en CampusSwap."
    );
    expect(translateNotificationText("Desk dropped from EUR 40.00 to EUR 30.00.", "es")).toBe(
      "Desk ha bajado de 40.00 € a 30.00 €."
    );
    expect(translateNotificationText("Lina Vermeer wants to buy Desk with shipping.", "nl")).toBe(
      "Lina Vermeer wil Desk kopen met verzending."
    );
  });

  it("leaves English and unknown text alone", () => {
    expect(translateNotificationText("Order shipped", "en")).toBe("Order shipped");
    expect(translateNotificationText("Something new", "es")).toBe("Something new");
  });
});
