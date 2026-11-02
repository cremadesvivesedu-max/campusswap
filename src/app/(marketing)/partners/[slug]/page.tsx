import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, MapPin } from "lucide-react";
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
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-12 sm:py-16">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">{copy.eyebrow}</p>
        <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">{partner.name}</h1>
        <p className="text-sm text-slate-500">{partner.category[locale]}</p>
        <p className="text-lg font-semibold leading-7 text-slate-800">{partner.headline[locale]}</p>
      </header>

      <Card className="bg-white">
        <CardContent className="space-y-3 pt-6">
          {partner.perks.map((perk) => (
            <p key={perk.en} className="flex gap-3 text-sm leading-6 text-slate-700">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
              {perk[locale]}
            </p>
          ))}
        </CardContent>
      </Card>

      <div className="rounded-3xl bg-slate-950 px-6 py-8 text-center text-white">
        <p className="text-sm font-semibold text-slate-300">{copy.codeLabel}</p>
        <p className="mt-2 font-mono text-4xl font-bold tracking-widest">{partner.promoCode}</p>
        <p className="mt-3 text-sm text-slate-300">{copy.howTo}</p>
      </div>

      <Card className="bg-white">
        <CardContent className="space-y-2 pt-6">
          <h2 className="font-semibold text-slate-950">{copy.visit}</h2>
          <p className="flex gap-2 text-sm leading-6 text-slate-700">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" aria-hidden />
            {partner.address}
          </p>
          <p className="flex gap-4 text-sm font-semibold text-emerald-700">
            <a href={partner.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {copy.directions}
            </a>
            <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {copy.website}
            </a>
          </p>
        </CardContent>
      </Card>

      {partner.listed ? (
        <Link href="/partners" className="inline-block text-sm font-semibold text-slate-600 hover:underline">
          {copy.all}
        </Link>
      ) : null}
    </div>
  );
}
