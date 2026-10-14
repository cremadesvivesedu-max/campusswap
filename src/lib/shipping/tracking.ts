// Carriers students actually use from Maastricht, with their public tracking pages.
export const shippingCarriers = ["postnl", "dhl", "dpd", "ups", "gls", "other"] as const;
export type ShippingCarrier = (typeof shippingCarriers)[number];

export const carrierLabels: Record<ShippingCarrier, string> = {
  postnl: "PostNL",
  dhl: "DHL",
  dpd: "DPD",
  ups: "UPS",
  gls: "GLS",
  other: "Other"
};

/** After shipping, the buyer has this many days to confirm or report a problem before the seller is paid anyway. */
export const BUYER_PROTECTION_DAYS = 14;

export function isShippingCarrier(value: string): value is ShippingCarrier {
  return (shippingCarriers as readonly string[]).includes(value);
}

/** Uppercase, no spaces or dashes: "3s abc 123-45" -> "3SABC12345". */
export function normalizeTrackingNumber(value: string) {
  return value.replace(/[\s-]+/g, "").toUpperCase();
}

export function isValidTrackingNumber(value: string) {
  return /^[A-Z0-9]{6,40}$/.test(normalizeTrackingNumber(value));
}

export function buildTrackingUrl(
  carrier: ShippingCarrier,
  trackingNumber: string,
  destination?: { postalCode?: string; country?: string }
) {
  const code = encodeURIComponent(normalizeTrackingNumber(trackingNumber));

  switch (carrier) {
    case "postnl": {
      const postalCode = destination?.postalCode?.replace(/\s+/g, "").toUpperCase();
      const country = toCountryCode(destination?.country);
      return postalCode
        ? `https://jouw.postnl.nl/track-and-trace/${code}-${country}-${encodeURIComponent(postalCode)}`
        : `https://jouw.postnl.nl/track-and-trace/${code}`;
    }
    case "dhl":
      return `https://www.dhl.com/nl-en/home/tracking/tracking-parcel.html?submit=1&tracking-id=${code}`;
    case "dpd":
      return `https://tracking.dpd.de/status/en_US/parcel/${code}`;
    case "ups":
      return `https://www.ups.com/track?tracknum=${code}`;
    case "gls":
      return `https://gls-group.com/NL/en/parcel-tracking?match=${code}`;
    default:
      return null;
  }
}

function toCountryCode(country?: string) {
  const value = (country ?? "").trim().toLowerCase();
  const known: Record<string, string> = {
    netherlands: "NL",
    nederland: "NL",
    "the netherlands": "NL",
    "países bajos": "NL",
    belgium: "BE",
    "belgië": "BE",
    belgique: "BE",
    "bélgica": "BE",
    germany: "DE",
    deutschland: "DE",
    duitsland: "DE",
    alemania: "DE"
  };

  if (known[value]) {
    return known[value];
  }

  return /^[a-z]{2}$/.test(value) ? value.toUpperCase() : "NL";
}

export function protectionEndsAt(shippedAt: string | Date) {
  const start = typeof shippedAt === "string" ? new Date(shippedAt) : shippedAt;
  return new Date(start.getTime() + BUYER_PROTECTION_DAYS * 24 * 60 * 60 * 1000);
}

export function isProtectionWindowOver(shippedAt: string | Date, now = new Date()) {
  return protectionEndsAt(shippedAt).getTime() <= now.getTime();
}

/** Whole days left before the payment is released automatically (never negative). */
export function protectionDaysLeft(shippedAt: string | Date, now = new Date()) {
  const ms = protectionEndsAt(shippedAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}
