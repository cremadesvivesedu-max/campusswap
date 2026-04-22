import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";

type LegalSection = {
  title: string;
  paragraphs: string[];
};

type LegalLink = {
  href: string;
  label: string;
};

export function LegalPage({
  eyebrow,
  title,
  description,
  lastUpdated,
  sections,
  quickLinks
}: {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
  quickLinks?: LegalLink[];
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <div className="space-y-4">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span>Last updated: {lastUpdated}</span>
          {quickLinks?.length ? (
            <>
              <span className="text-slate-300">|</span>
              <div className="flex flex-wrap gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-medium text-slate-700 underline-offset-4 transition hover:text-slate-950 hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card
            key={section.title}
            className="border-slate-200/80 bg-white/95 shadow-[0_18px_44px_rgba(15,23,42,0.05)]"
          >
            <CardContent className="space-y-4 p-8">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-950">
                {section.title}
              </h2>
              <div className="space-y-3 text-sm leading-7 text-slate-600 sm:text-[15px]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
