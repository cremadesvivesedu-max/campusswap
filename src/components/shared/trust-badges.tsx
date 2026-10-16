import { Award, GraduationCap, Sparkles, Zap } from "lucide-react";
import { getTrustBadges, type TrustBadge } from "@/features/profile/trust-badges";
import type { User } from "@/types/domain";

interface Labels {
  trustedSeller: string;
  fastReplier: string;
  verifiedStudent: string;
  verifiedAt: string;
  newMember: string;
}

const styles: Record<TrustBadge["id"], { icon: typeof Award; tone: string }> = {
  "trusted-seller": { icon: Award, tone: "bg-amber-50 text-amber-800" },
  "fast-replier": { icon: Zap, tone: "bg-sky-50 text-sky-800" },
  "verified-student": { icon: GraduationCap, tone: "bg-emerald-50 text-emerald-800" },
  "new-member": { icon: Sparkles, tone: "bg-slate-100 text-slate-600" }
};

function label(badge: TrustBadge, labels: Labels) {
  switch (badge.id) {
    case "trusted-seller":
      return labels.trustedSeller;
    case "fast-replier":
      return labels.fastReplier.replace("{time}", badge.detail ?? "");
    case "verified-student":
      return badge.detail ? labels.verifiedAt.replace("{uni}", badge.detail) : labels.verifiedStudent;
    default:
      return labels.newMember;
  }
}

/** Trusted seller · Replies in ~20 min · Verified UM · New — whichever apply. */
export function TrustBadges({
  user,
  labels,
  hide = [],
  className = ""
}: {
  user: User;
  labels: Labels;
  /** e.g. hide the verified badge where a verification badge is already shown. */
  hide?: TrustBadge["id"][];
  className?: string;
}) {
  const badges = getTrustBadges({
    verificationStatus: user.verificationStatus,
    university: user.profile.university,
    joinedAt: user.joinedAt,
    salesCount: user.sellerMetrics?.salesCount ?? 0,
    ratingAverage: user.sellerMetrics?.averageRating ?? user.profile.ratingAverage,
    reviewCount: user.sellerMetrics?.reviewCount ?? user.profile.reviewCount,
    responseRate: user.sellerMetrics?.responseRate ?? user.profile.responseRate,
    medianReplyMinutes: user.sellerMetrics?.medianReplyMinutes
  }).filter((badge) => !hide.includes(badge.id));

  if (!badges.length) return null;

  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {badges.map((badge) => {
        const { icon: Icon, tone } = styles[badge.id];
        return (
          <li key={badge.id} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {label(badge, labels)}
          </li>
        );
      })}
    </ul>
  );
}
