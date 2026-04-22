import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { env } from "@/lib/env";

const contactCards = [
  {
    title: "Account, listings, and safety",
    description:
      "Use this path for report user, report listing, moderation, or account-safety issues."
  },
  {
    title: "Orders, payments, and disputes",
    description:
      "Use this path for buyer checkout issues, featured promotion billing, payout questions, shipping issues, and order disputes."
  },
  {
    title: "General product support",
    description:
      "Use this path for login trouble, product questions, or help understanding how CampusSwap works."
  }
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <SectionHeading
        eyebrow="Contact & Support"
        title="Help should feel reachable when a marketplace issue becomes real."
        description="CampusSwap offers in-app support for signed-in users and a direct contact route for broader support, privacy, and trust questions."
      />

      <Card className="border-slate-200/80 bg-white/95 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
        <CardContent className="flex flex-col gap-5 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Support email</p>
            <a
              href={`mailto:${env.SUPPORT_EMAIL}`}
              className="font-display text-2xl font-semibold text-slate-950 underline-offset-4 hover:underline"
            >
              {env.SUPPORT_EMAIL}
            </a>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Include the relevant listing, order, conversation, or account context when possible so the team can review your case faster.
            </p>
          </div>
          <Button asChild>
            <Link href="/app/support">Open in-app support</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {contactCards.map((card) => (
          <Card
            key={card.title}
            className="border-slate-200/80 bg-white/95 shadow-[0_18px_44px_rgba(15,23,42,0.05)]"
          >
            <CardContent className="space-y-3 p-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-950">
                {card.title}
              </h2>
              <p className="text-sm leading-7 text-slate-600">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 bg-slate-950 text-white">
        <CardContent className="space-y-4 p-8">
          <p className="font-display text-2xl font-semibold">Where to go for the right issue</p>
          <div className="space-y-3 text-sm leading-7 text-slate-300">
            <p>
              Signed-in users should prefer the in-app support center for disputes, payment help, shipping issues, or reporting a user or listing, because CampusSwap can attach that ticket to the correct order or conversation.
            </p>
            <p>
              For privacy or legal questions, contact us by email and mention whether your request relates to account data, marketplace activity, support history, or payment records.
            </p>
            <p>
              If there is an urgent safety concern, use local emergency or campus safety services first and then notify CampusSwap so we can review the relevant account or listing activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/refund-policy" className="font-medium text-white underline-offset-4 hover:underline">
              Refunds & disputes
            </Link>
            <Link href="/privacy" className="font-medium text-white underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="font-medium text-white underline-offset-4 hover:underline">
              Terms of Service
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
