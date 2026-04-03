import Link from "next/link";
import { Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { CategoryLinkCard } from "@/components/marketplace/category-link-card";
import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { faqs, trustSignals } from "@/lib/constants";
import { getAllCategories, getFeaturedListings } from "@/server/queries/marketplace";

const testimonials = [
  "Demo testimonial: I arrived in Maastricht on a Thursday and had a desk, lamp, and bike by Sunday.",
  "Demo testimonial: Selling my studio essentials in one place was much calmer than juggling group chats.",
  "Demo testimonial: The outlet section helped me furnish a room without blowing my first-month budget."
];

export default async function HomePage() {
  const [featured, categories] = await Promise.all([
    getFeaturedListings(),
    getAllCategories()
  ]);

  return (
    <div className="space-y-24 pb-20">
      <section className="bg-hero-grid text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:py-28">
          <div className="space-y-8">
            <Badge className="border-white/20 bg-white/10 text-white">
              Student-first in Maastricht
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-tight sm:text-6xl">
                Buy and sell student essentials in Maastricht without the chaos.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-200">
                CampusSwap gives incoming students a faster setup path, outgoing students
                a faster sell-through path, and everyone a more trustworthy marketplace
                than scattered WhatsApp and Facebook threads.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/featured">Browse items</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/signup">Sell / upload product</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Card className="border-white/10 bg-white/10 text-white">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-200">Student-first trust</p>
                  <p className="mt-2 font-display text-2xl font-semibold">
                    Verification available
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/10 text-white">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-200">Safer exchanges</p>
                  <p className="mt-2 font-display text-2xl font-semibold">
                    Moderated marketplace
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/10 bg-white/10 text-white">
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-200">Affordable and green</p>
                  <p className="mt-2 font-display text-2xl font-semibold">
                    Outlet included
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          <WaitlistForm />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
        <SectionHeading
          eyebrow="Why CampusSwap"
          title="Built around the exact student moment broad marketplaces miss."
          description="Move-in and move-out periods in Maastricht are time-sensitive. CampusSwap keeps the inventory local, the categories organized, and the trust signals visible so students can act quickly."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Incoming students",
              body: "Find bikes, desks, bedding, and kitchen basics before classes start."
            },
            {
              title: "Outgoing students",
              body: "Sell quickly before lease end with urgency and featured tools."
            },
            {
              title: "Budget-focused buyers",
              body: "Use Outlet to find honest discounts on heavily used but useful items."
            },
            {
              title: "Community-minded users",
              body: "Trade within a student network rather than a city-wide free-for-all."
            }
          ].map((item) => (
            <Card key={item.title} className="bg-white">
              <CardHeader>
                <h3 className="font-display text-xl font-semibold text-slate-950">
                  {item.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6">
        <SectionHeading
          eyebrow="How it works"
          title="Fast enough for moving week. Calm enough to trust."
          description="Create an account, browse by what you need, and handle in-person pickup with visible verification status and safe meetup guidance."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Join",
              body: "Create an account with any valid email, then add student verification when you want a stronger trust badge."
            },
            {
              icon: Sparkles,
              title: "Discover",
              body: "Browse featured drops, category pages, outlet deals, and a For You feed shaped by real interactions."
            },
            {
              icon: Leaf,
              title: "Reuse",
              body: "Reserve, meet, and review after completion so more useful items stay in circulation."
            }
          ].map((step) => (
            <Card key={step.title} className="bg-white">
              <CardHeader className="space-y-4">
                <step.icon className="h-9 w-9 text-slate-950" />
                <h3 className="font-display text-2xl font-semibold text-slate-950">
                  {step.title}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">{step.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6">
        <SectionHeading
          eyebrow="Categories"
          title="Furniture, bikes, textbooks, electronics, and the everyday essentials in between."
          description="The category model is tuned for student life in Maastricht, not generic second-hand browsing."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories
            .filter((category) => category.slug !== "outlet")
            .map((category) => (
              <CategoryLinkCard key={category.id} category={category} />
            ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6">
        <SectionHeading
          eyebrow="Featured preview"
          title="Promoted listings and strong inventory, without losing trust."
          description="Featured listings stay clearly labeled, and sellers can boost visibility without making the feed feel deceptive."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {featured.slice(0, 3).map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              showMessageAction
              messageActionMode="signup"
            />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionHeading
          eyebrow="Trust and safety"
          title="Visible trust markers beat vague promises."
          description="Verification, moderation, seller ratings, and safe meetup prompts are woven directly into browsing and messaging."
        />
        <div className="grid gap-4">
          {trustSignals.map((signal) => (
            <Card key={signal} className="bg-white">
              <CardContent className="pt-6">
                <p className="text-sm leading-6 text-slate-700">{signal}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6">
        <SectionHeading
          eyebrow="Affordable and green"
          title="Outlet gives lower-cost items a smarter second life."
          description="Damaged-but-usable and urgent sell-off items deserve a dedicated experience, not a buried filter."
        />
        <Card className="overflow-hidden bg-slate-950 text-white">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <p className="font-display text-3xl font-semibold">
                Outlet helps students save quickly and sustainably.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
                CampusSwap treats Outlet as a strategic differentiator for lower
                budgets, urgent move-outs, and practical reuse. That makes the
                marketplace more useful and more honest.
              </p>
            </div>
            <Button asChild>
              <Link href="/outlet">Explore Outlet</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6">
        <SectionHeading
          eyebrow="Demo testimonials"
          title="Seeded proof points for launch storytelling."
          description="These are demo testimonials included to help shape launch-ready content and layout. Replace them with real student feedback after launch."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial} className="bg-white">
              <CardContent className="pt-6">
                <p className="text-sm leading-7 text-slate-700">{testimonial}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-8 px-6">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions students usually ask before they trust a new marketplace."
          description="The marketing site keeps the core trust and onboarding questions clear, especially for incoming international students."
        />
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.question} className="bg-white">
              <CardHeader>
                <h3 className="font-display text-xl font-semibold text-slate-950">
                  {faq.question}
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-7 text-slate-600">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
