import Link from "next/link";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
import { activeCampaign, type CampaignId } from "@/features/campaigns/campaigns";

type Copy = Record<CampaignId, { title: string; body: string }>;

/** Seasonal banner (arrival, exams, new semester); nothing outside those weeks. */
export function CampaignBanner({ copy }: { copy: Copy }) {
  const campaign = activeCampaign();
  if (!campaign) {
    return null;
  }
  const text = copy[campaign.id];
  const Icon = campaign.id === "exams" ? BookOpen : Sparkles;

  return (
    <Link
      href={`${campaign.href}?utm_source=campusswap&utm_medium=banner&utm_campaign=${campaign.id}`}
      className="flex items-center gap-3 rounded-2xl bg-emerald-100 p-4 text-emerald-950"
    >
      <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block font-extrabold">{text.title}</span>
        <span className="block truncate text-sm">{text.body}</span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0" aria-hidden="true" />
    </Link>
  );
}
