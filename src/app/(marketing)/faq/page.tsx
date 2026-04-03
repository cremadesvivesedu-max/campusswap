import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { faqs } from "@/lib/constants";

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <SectionHeading eyebrow="FAQ" title="Answers that remove hesitation before signup." description="The public site keeps the operational details concise so students can quickly understand what CampusSwap is, how trust works, and what is gated by verification." />
      <div className="space-y-4">
        {faqs.map((faq) => (
          <Card key={faq.question} className="bg-white"><CardHeader><h2 className="font-display text-2xl font-semibold text-slate-950">{faq.question}</h2></CardHeader><CardContent><p className="text-sm leading-7 text-slate-600">{faq.answer}</p></CardContent></Card>
        ))}
      </div>
    </div>
  );
}
