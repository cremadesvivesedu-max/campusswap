import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDictionaryForRequest } from "@/lib/i18n";

export default async function FaqPage() {
  const dictionary = await getDictionaryForRequest();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow={dictionary.marketing.faq.eyebrow}
        title={dictionary.marketing.faq.title}
        description={dictionary.marketing.faq.description}
      />
      <div className="space-y-4">
        {dictionary.marketing.faq.items.map((faq) => (
          <Card key={faq.question} className="bg-white">
            <CardHeader>
              <h2 className="font-display text-2xl font-semibold text-slate-950">
                {faq.question}
              </h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slate-600">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
