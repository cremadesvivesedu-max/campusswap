// Small trust signals shown on profiles and next to the seller on a listing.

export type TrustBadgeId = "trusted-seller" | "fast-replier" | "verified-student" | "new-member";

export interface TrustBadgeInput {
  verificationStatus: string;
  university?: string;
  joinedAt: string;
  salesCount: number;
  ratingAverage: number;
  reviewCount: number;
  responseRate: number;
  medianReplyMinutes?: number;
}

export interface TrustBadge {
  id: TrustBadgeId;
  /** Extra detail for the label, e.g. the university or the reply time. */
  detail?: string;
}

export function formatReplyTime(minutes: number) {
  if (minutes < 60) return `${Math.max(5, Math.round(minutes / 5) * 5)} min`;
  if (minutes < 24 * 60) return `${Math.round(minutes / 60)} h`;
  return `${Math.round(minutes / (24 * 60))} d`;
}

export function getTrustBadges(input: TrustBadgeInput, now = new Date()): TrustBadge[] {
  const badges: TrustBadge[] = [];

  if (input.salesCount >= 3 && input.reviewCount >= 2 && input.ratingAverage >= 4.5) {
    badges.push({ id: "trusted-seller" });
  }

  if (
    input.medianReplyMinutes !== undefined &&
    input.medianReplyMinutes <= 180 &&
    input.responseRate >= 0.8
  ) {
    badges.push({ id: "fast-replier", detail: formatReplyTime(input.medianReplyMinutes) });
  }

  if (input.verificationStatus === "verified") {
    badges.push({ id: "verified-student", detail: shortUniversity(input.university) });
  }

  if (now.getTime() - Date.parse(input.joinedAt) < 30 * 24 * 60 * 60 * 1000) {
    badges.push({ id: "new-member" });
  }

  return badges;
}

function shortUniversity(name?: string) {
  if (!name) return undefined;
  if (/maastricht university/i.test(name)) return "UM";
  if (/zuyd/i.test(name)) return "Zuyd";
  return name;
}
