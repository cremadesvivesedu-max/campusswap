import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { trustSignals } from "@/lib/constants";

export default function TrustSafetyPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow="Trust & Safety"
        title="CampusSwap is designed to feel safer because safety is visible, not implied."
        description="Verification, moderation, and post-transaction reviews are treated as product primitives rather than buried policy links."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {trustSignals.map((signal) => (
          <Card key={signal} className="bg-white">
            <CardHeader>
              <h2 className="font-display text-2xl font-semibold text-slate-950">{signal}</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slate-600">
                Designed to reduce uncertainty before a message is sent and before a meetup happens.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-slate-200/80 bg-white/95">
        <CardContent className="flex flex-col gap-4 p-8 text-sm leading-7 text-slate-600 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="font-display text-2xl font-semibold text-slate-950">Policies and help, in one place</p>
            <p>Read how CampusSwap handles privacy, disputes, and support before you buy, sell, or escalate an issue.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/privacy" className="font-medium text-slate-700 underline-offset-4 hover:text-slate-950 hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="font-medium text-slate-700 underline-offset-4 hover:text-slate-950 hover:underline">
              Terms
            </Link>
            <Link href="/refund-policy" className="font-medium text-slate-700 underline-offset-4 hover:text-slate-950 hover:underline">
              Refunds & disputes
            </Link>
            <Link href="/contact" className="font-medium text-slate-700 underline-offset-4 hover:text-slate-950 hover:underline">
              Contact
            </Link>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-950 text-white">
        <CardContent className="space-y-3 p-8">
          <p className="font-display text-2xl font-semibold">Safe meetup guidance</p>
          <p className="text-sm leading-7 text-slate-300">
            Meet during daylight if possible, prefer campus-adjacent or high-footfall spots, and keep communication in-platform until you are comfortable moving to a meetup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
