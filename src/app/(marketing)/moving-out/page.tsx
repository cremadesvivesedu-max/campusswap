import Link from "next/link";
import { Gift, Link2, Truck } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { getDictionaryForRequest } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata(
  "Moving out of Maastricht? Sell your room in one go",
  "Students leaving Maastricht publish everything at once, give away what is left and share one link with a countdown to moving day."
);

export default async function MovingOutPage() {
  const dictionary = await getDictionaryForRequest();
  const copy = dictionary.movingOut;
  const steps = [
    { icon: Truck, title: copy.step1Title, body: copy.step1Body },
    { icon: Gift, title: copy.step2Title, body: copy.step2Body },
    { icon: Link2, title: copy.step3Title, body: copy.step3Body }
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <SectionHeading eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <li key={step.title} className="space-y-2 rounded-3xl bg-white p-5">
            <step.icon className="h-6 w-6 text-emerald-700" aria-hidden="true" />
            <h2 className="font-bold text-slate-950">{step.title}</h2>
            <p className="text-sm leading-6 text-slate-600">{step.body}</p>
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/app/sell/bulk">{copy.ctaSell}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/app/my-listings">{copy.ctaListings}</Link>
        </Button>
      </div>
    </div>
  );
}
