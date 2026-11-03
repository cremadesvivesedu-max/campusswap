import { describe, expect, it } from "vitest";
import { needsPaymentWarning } from "@/features/messaging/chat-safety";

describe("needsPaymentWarning", () => {
  it("catches payment talk in all three languages", () => {
    expect(needsPaymentWarning("I'll send you a payment link")).toBe(true);
    expect(needsPaymentWarning("Pásame tus datos bancarios")).toBe(true);
    expect(needsPaymentWarning("Ik stuur je een Tikkie")).toBe(true);
    expect(needsPaymentWarning("Please pay a deposit first")).toBe(true);
  });

  it("leaves normal messages alone", () => {
    expect(needsPaymentWarning("Is it still available? I can come at 5")).toBe(false);
    // "iban" alone is also a Spanish verb.
    expect(needsPaymentWarning("Mis amigos iban a venir también")).toBe(false);
  });
});
