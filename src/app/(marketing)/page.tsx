import Link from "next/link";
import { Leaf, ShieldCheck, Sparkles } from "lucide-react";
import { WaitlistForm } from "@/components/forms/waitlist-form";
import { CategoryLinkCard } from "@/components/marketplace/category-link-card";
import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getAllCategories, getFeaturedListings } from "@/server/queries/marketplace";

export default async function HomePage() {
  const [featured, categories, dictionary] = await Promise.all([
    getFeaturedListings(),
    getAllCategories(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="space-y-28 pb-24">
      <section className="mx-auto max-w-7xl px-6 pt-8">
        <div className="grid gap-12 overflow-hidden rounded-[44px] bg-hero-grid px-8 py-14 text-white shadow-[0_34px_90px_rgba(15,23,42,0.22)] lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-16">
          <div className="space-y-8">
            <Badge className="border-white/20 bg-white/10 text-white">
              {dictionary.marketing.home.heroBadge}
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-display text-5xl font-semibold tracking-tight sm:text-6xl">
                {dictionary.marketing.home.heroTitle}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-200">
                {dictionary.marketing.home.heroBody}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button asChild>
                <Link href="/featured">{dictionary.marketing.home.browseItems}</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/signup">{dictionary.marketing.home.sellUpload}</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {dictionary.marketing.home.valueCards.map((card) => (
                <Card
                  key={card.title}
                  className="border-white/10 bg-white/10 text-white shadow-none"
                >
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-200">{card.eyebrow}</p>
                    <p className="mt-2 font-display text-2xl font-semibold">
                      {card.title}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <WaitlistForm />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2">
        <SectionHeading
          eyebrow={dictionary.marketing.home.whyEyebrow}
          title={dictionary.marketing.home.whyTitle}
          description={dictionary.marketing.home.whyDescription}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {dictionary.marketing.home.audiences.map((item) => (
            <Card key={item.title} className="bg-white/96">
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
          eyebrow={dictionary.marketing.home.howEyebrow}
          title={dictionary.marketing.home.howTitle}
          description={dictionary.marketing.home.howDescription}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: ShieldCheck, ...dictionary.marketing.home.steps[0] },
            { icon: Sparkles, ...dictionary.marketing.home.steps[1] },
            { icon: Leaf, ...dictionary.marketing.home.steps[2] }
          ].map((step) => (
            <Card key={step.title} className="bg-white/96">
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
          eyebrow={dictionary.marketing.home.categoriesEyebrow}
          title={dictionary.marketing.home.categoriesTitle}
          description={dictionary.marketing.home.categoriesDescription}
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
          eyebrow={dictionary.marketing.home.featuredEyebrow}
          title={dictionary.marketing.home.featuredTitle}
          description={dictionary.marketing.home.featuredDescription}
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
          eyebrow={dictionary.marketing.home.trustEyebrow}
          title={dictionary.marketing.home.trustTitle}
          description={dictionary.marketing.home.trustDescription}
        />
        <div className="grid gap-4">
          {dictionary.marketing.home.trustSignals.map((signal) => (
            <Card key={signal} className="bg-white/96">
              <CardContent className="pt-6">
                <p className="text-sm leading-6 text-slate-700">{signal}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6">
        <SectionHeading
          eyebrow={dictionary.marketing.home.outletEyebrow}
          title={dictionary.marketing.home.outletTitle}
          description={dictionary.marketing.home.outletDescription}
        />
        <Card className="overflow-hidden border-slate-900 bg-slate-950 text-white">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <p className="font-display text-3xl font-semibold">
                {dictionary.marketing.home.outletTitle}
              </p>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
                {dictionary.marketing.home.outletBody}
              </p>
            </div>
            <Button asChild>
              <Link href="/outlet">{dictionary.marketing.home.outletCta}</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl space-y-8 px-6">
        <SectionHeading
          eyebrow={dictionary.marketing.home.testimonialsEyebrow}
          title={dictionary.marketing.home.testimonialsTitle}
          description={dictionary.marketing.home.testimonialsDescription}
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {dictionary.marketing.home.testimonials.map((testimonial) => (
            <Card key={testimonial} className="bg-white/96">
              <CardContent className="pt-6">
                <p className="text-sm leading-7 text-slate-700">{testimonial}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-8 px-6">
        <SectionHeading
          eyebrow={dictionary.marketing.home.faqEyebrow}
          title={dictionary.marketing.home.faqTitle}
          description={dictionary.marketing.home.faqDescription}
        />
        <div className="space-y-4">
          {dictionary.marketing.faq.items.map((faq) => (
            <Card key={faq.question} className="bg-white/96">
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
