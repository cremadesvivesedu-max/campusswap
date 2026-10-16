// Automatic checks before a listing goes live. "review" holds the listing for an admin
// (status pending-review); "note" lets it through but tells the admins.

const scamPhrases = [
  // English
  "deposit first", "pay a deposit", "send money first", "pay in advance", "advance payment",
  "western union", "moneygram", "gift card", "wire transfer", "crypto only", "bitcoin", "usdt",
  "paypal friends", "friends and family", "too good to be true", "shipping only no meetup",
  // Spanish
  "pago por adelantado", "pagar por adelantado", "fianza primero", "señal primero", "tarjeta regalo",
  "transferencia primero", "solo envío sin quedar",
  // Dutch
  "eerst betalen", "vooruitbetalen", "aanbetaling eerst", "cadeaukaart", "tikkie vooraf"
];

// Things that are never this cheap second-hand; a lower price is a classic bait listing.
const highValueItems: { words: string[]; minimum: number }[] = [
  { words: ["iphone", "macbook", "ipad pro", "playstation 5", "ps5", "xbox series", "steam deck"], minimum: 40 },
  { words: ["laptop", "portatil", "portátil", "nintendo switch", "airpods", "e-bike", "ebike", "elektrische fiets"], minimum: 25 }
];

const contactPattern = /(whats\s?app|telegram|signal me|call me|bel me|llámame|llamame|\+?\d[\d\s-]{8,}\d|[\w.+-]+@[\w-]+\.[a-z]{2,})/i;
const linkPattern = /(https?:\/\/|www\.)/i;

export interface ListingRiskResult {
  level: "ok" | "note" | "review";
  reasons: string[];
}

export function findSuspiciousKeywords(input: string) {
  const lowered = input.toLowerCase();
  return scamPhrases.filter((term) => lowered.includes(term));
}

export function assessListingRisk(input: { title: string; description: string; price: number }): ListingRiskResult {
  const text = `${input.title} ${input.description}`;
  const lowered = text.toLowerCase();
  const review: string[] = [];
  const notes: string[] = [];

  const phrases = findSuspiciousKeywords(text);
  if (phrases.length) {
    review.push(`suspicious wording (${phrases.join(", ")})`);
  }

  for (const group of highValueItems) {
    const hit = group.words.find((word) => lowered.includes(word));
    if (hit && input.price > 0 && input.price < group.minimum) {
      review.push(`price looks too good to be true (${hit} for €${input.price})`);
      break;
    }
  }

  if (linkPattern.test(input.description)) {
    review.push("external link in the description");
  }

  if (contactPattern.test(text)) {
    notes.push("contact details outside the chat");
  }

  if (review.length) return { level: "review", reasons: [...review, ...notes] };
  if (notes.length) return { level: "note", reasons: notes };
  return { level: "ok", reasons: [] };
}

export function shouldModerateListing(title: string, description: string, price = 0) {
  return assessListingRisk({ title, description, price }).level === "review";
}
