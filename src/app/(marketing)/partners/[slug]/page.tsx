import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, ExternalLink, MapPin, Navigation } from "lucide-react";
import { CopyCodeButton } from "@/components/marketplace/copy-code-button";
import { Card, CardContent } from "@/components/ui/card";
import { getPartner, partnerCopy } from "@/features/partners/partners";
import { getRequestLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const partner = getPartner(slug);

  if (!partner) {
    return {};
  }

  return {
    ...buildMetadata(`${partner.name} student deal`, partner.headline.en),
    robots: partner.listed ? undefined : { index: false, follow: false }
  };
}

export default async function PartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = getPartner(slug);

  if (!partner) {
    notFound();
  }

  const locale = await getRequestLocale();
  const copy = partnerCopy[locale];

  return (
    <div className="pb-16">
      {/* Hero in the shop's colour, with both logos */}
      <header className="relative overflow-hidden text-white" style={{ backgroundColor: partner.brandColor }}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "repeating-linear-gradient(135deg, #fff 0 16px, transparent 16px 32px)" }}
        />
        <div className="relative mx-auto max-w-4xl space-y-5 px-6 pb-20 pt-10 sm:pt-14">
          {partner.listed ? (
            <Link href="/partners" className="inline-flex items-center gap-1 text-sm font-semibold text-white/85 hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {copy.all}
            </Link>
          ) : null}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2.5 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/campusswap-symbol.png" alt="CampusSwap" className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
              <span aria-hidden className="text-xl font-bold text-slate-400">×</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={partner.logo} alt={partner.name} className="h-12 w-12 rounded-xl sm:h-14 sm:w-14" />
            </div>
            <p className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              <BadgeCheck className="h-4 w-4" aria-hidden />
              {copy.badge}
            </p>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold sm:text-5xl">{partner.name}</h1>
            <p className="text-sm font-medium text-white/85">{partner.category[locale]}</p>
            <p className="max-w-2xl text-xl font-bold leading-snug sm:text-2xl">{partner.headline[locale]}</p>
          </div>
        </div>
      </header>

      <div className="relative mx-auto -mt-12 grid max-w-4xl gap-6 px-6 md:grid-cols-[1.1fr_1fr]">
        {/* The code, as a coupon */}
        <div className="relative overflow-hidden rounded-3xl bg-[#203860] px-6 py-7 text-center text-white shadow-lg md:order-2">
          <span aria-hidden className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[var(--background)]" />
          <span aria-hidden className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-[var(--background)]" />
          <p className="text-sm font-semibold text-slate-300">{copy.codeLabel}</p>
          <p className="mt-2 font-mono text-4xl font-bold tracking-[0.2em] sm:text-5xl">{partner.promoCode}</p>
          <div className="mx-auto my-5 border-t-2 border-dashed border-white/25" />
          <p className="text-sm text-slate-300">{copy.howTo}</p>
          <div className="mt-4">
            <CopyCodeButton code={partner.promoCode} label={copy.copy} copiedLabel={copy.copied} />
          </div>
        </div>

        <Card className="bg-white shadow-lg md:order-1">
          <CardContent className="space-y-3 pt-6">
            {partner.perks.map((perk) => (
              <p key={perk.en} className="flex gap-3 text-base leading-7 text-slate-800">
                <Check className="mt-1 h-5 w-5 shrink-0" style={{ color: partner.brandColor }} aria-hidden />
                {perk[locale]}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="mx-auto mt-6 grid max-w-4xl gap-6 px-6 md:grid-cols-2">
        <Card className="bg-white">
          <CardContent className="space-y-4 pt-6">
            <h2 className="font-semibold text-slate-950">{copy.stepsTitle}</h2>
            <ol className="space-y-3">
              {copy.steps.map((step, index) => (
                <li key={step} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: partner.brandColor }}
                  >
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="space-y-3 pt-6">
            <h2 className="font-semibold text-slate-950">{copy.visit}</h2>
            <p className="flex gap-2 text-sm leading-6 text-slate-700">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden />
              {partner.address}
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href={partner.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-white hover:opacity-90"
                style={{ backgroundColor: partner.brandColor }}
              >
                <Navigation className="h-4 w-4" aria-hidden />
                {copy.directions}
              </a>
              <a
                href={partner.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-50"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                {copy.website}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
