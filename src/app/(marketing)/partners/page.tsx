import { PartnerBanner } from "@/components/marketplace/partner-banner";
import { SectionHeading } from "@/components/shared/section-heading";
import { listedPartners, partnerCopy } from "@/features/partners/partners";
import { getRequestLocale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export const metadata = {
  ...buildMetadata("Student deals in Maastricht", "Local shops in Maastricht that give CampusSwap students a deal."),
  robots: listedPartners.length > 0 ? undefined : { index: false, follow: false }
};

export default async function PartnersPage() {
  const locale = await getRequestLocale();
  const copy = partnerCopy[locale];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      {listedPartners.length === 0 ? <p className="text-sm text-slate-600">{copy.empty}</p> : null}
      <div className="space-y-4">
        {listedPartners.map((partner) => (
          <PartnerBanner key={partner.slug} partner={partner} locale={locale} />
        ))}
      </div>
    </div>
  );
}
