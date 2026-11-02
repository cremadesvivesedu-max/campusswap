import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { listedPartners, partnerCopy } from "@/features/partners/partners";
import { getRequestLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata(
  "Student deals in Maastricht",
  "Local shops in Maastricht that give CampusSwap students a deal."
);

export default async function PartnersPage() {
  const locale = await getRequestLocale();
  const copy = partnerCopy[locale];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      {listedPartners.length === 0 ? <p className="text-sm text-slate-600">{copy.empty}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {listedPartners.map((partner) => (
          <Card key={partner.slug} className="bg-white">
            <CardHeader>
              <p className="text-sm font-semibold text-slate-500">{partner.category[locale]}</p>
              <h2 className="font-display text-2xl font-semibold text-slate-950">{partner.name}</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-7 text-slate-600">{partner.headline[locale]}</p>
              <Link href={`/partners/${partner.slug}`} className="text-sm font-semibold text-emerald-700 hover:underline">
                {copy.seeDeal}
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
