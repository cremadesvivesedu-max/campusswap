import { findSuspiciousKeywords } from "@/server/services/moderation";

// Normal in a listing, but in a chat they are how payment scams start.
const chatPaymentPhrases = [
  // English
  "payment link", "payment request", "bank details", "my iban", "verification code",
  // Spanish
  "enlace de pago", "datos bancarios", "mi iban", "código de verificación", "codigo de verificacion", "bizum",
  // Dutch
  "tikkie", "betaalverzoek", "betaallink", "bankgegevens", "mijn iban", "verificatiecode"
];

/** True when an incoming chat message talks about paying in a way worth a gentle warning. */
export function needsPaymentWarning(text: string) {
  const lowered = text.toLowerCase();
  return chatPaymentPhrases.some((phrase) => lowered.includes(phrase)) || findSuspiciousKeywords(text).length > 0;
}
