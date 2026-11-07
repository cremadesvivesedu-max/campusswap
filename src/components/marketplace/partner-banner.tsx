import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Partner } from "@/features/partners/partners";
import { partnerCopy } from "@/features/partners/partners";
import type { AppLocale } from "@/lib/i18n-shared";
import { cn } from "@/lib/utils";

// Partner banner in the shop's own colour: both logos, the deal and the promo code
// as a tear-off coupon. Used on the home page, /partners and the arrival kit.
export function PartnerBanner({ partner, locale, className }: { partner: Partner; locale: AppLocale; className?: string }) {
  const copy = partnerCopy[locale];

  return (
    <Link
      href={`/partners/${partner.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl text-white shadow-sm transition hover:shadow-lg sm:flex-row",
        className
      )}
      style={{ backgroundColor: partner.brandColor }}
    >
      {/* soft diagonal stripes, like a shop awning */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, #fff 0 14px, transparent 14px 28px)" }}
      />
      <div className="relative flex flex-1 flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-white p-2 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/campusswap-symbol.png" alt="CampusSwap" className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
          <span aria-hidden className="text-lg font-bold text-slate-400">×</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={partner.logo} alt={partner.name} className="h-10 w-10 rounded-lg sm:h-12 sm:w-12" />
        </div>
        <div className="min-w-0 space-y-1">
          <p className="inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide">
            {copy.bannerLabel} · {partner.name.replace(" Maastricht", "")}
          </p>
          <p className="text-lg font-extrabold leading-snug sm:text-xl">{partner.headline[locale]}</p>
          <p className="text-sm text-white/85">{partner.address}</p>
        </div>
      </div>
      <div className="relative flex items-center justify-between gap-4 border-t-2 border-dashed border-white/50 bg-black/10 px-5 py-4 sm:w-60 sm:flex-col sm:justify-center sm:border-l-2 sm:border-t-0 sm:text-center">
        <div>
          <p className="text-xs font-semibold text-white/80">{copy.codeLabel}</p>
          <p className="font-mono text-2xl font-bold tracking-[0.18em]">{partner.promoCode}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 transition group-hover:gap-2">
          {copy.seeDeal}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
