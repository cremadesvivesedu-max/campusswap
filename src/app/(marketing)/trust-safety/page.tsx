import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { trustSignals } from "@/lib/constants";

export default function TrustSafetyPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-16">
      <SectionHeading eyebrow="Trust & Safety" title="CampusSwap is designed to feel safer because safety is visible, not implied." description="Verification, moderation, and post-transaction reviews are treated as product primitives rather than buried policy links." />
      <div className="grid gap-4 md:grid-cols-2">
        {trustSignals.map((signal) => (
          <Card key={signal} className="bg-white">
            <CardHeader><h2 className="font-display text-2xl font-semibold text-slate-950">{signal}</h2></CardHeader>
            <CardContent><p className="text-sm leading-7 text-slate-600">Designed to reduce uncertainty before a message is sent and before a meetup happens.</p></CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-slate-950 text-white"><CardContent className="space-y-3 p-8"><p className="font-display text-2xl font-semibold">Safe meetup guidance</p><p className="text-sm leading-7 text-slate-300">Meet during daylight if possible, prefer campus-adjacent or high-footfall spots, and keep communication in-platform until you are comfortable moving to a meetup.</p></CardContent></Card>
    </div>
  );
}
