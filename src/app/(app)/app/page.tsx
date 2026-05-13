import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getDictionaryForRequest } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  getCurrentUser,
  getFeaturedListings,
  getHomeFeed
} from "@/server/queries/marketplace";

export default async function AppHomePage() {
  const [
    user,
    dictionary,
    feed,
    featuredListings
  ] = await Promise.all([
    getCurrentUser(),
    getDictionaryForRequest(),
    getHomeFeed(4),
    getFeaturedListings(2)
  ]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden border-slate-900 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.28),_transparent_38%),linear-gradient(135deg,_#020617,_#0f172a_62%,_#1e293b)] text-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
          <CardContent className="space-y-6 p-5 sm:space-y-7 sm:p-9">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                {dictionary.appHome.featuredEyebrow}
              </p>
              <p className="font-display text-3xl font-semibold leading-tight sm:text-[2.7rem]">
                {dictionary.appHome.welcomeBack}, {user.profile.fullName.split(" ")[0]}.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {dictionary.appHome.feedDescription}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/app/sell">{dictionary.appHome.sellUpload}</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full sm:w-auto">
                <Link href="/app/search">{dictionary.appHome.searchAllListings}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 bg-white/92 shadow-sm">
          <CardContent className="flex h-full flex-col justify-between gap-5 p-5 sm:p-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {dictionary.appHome.sellerMomentumEyebrow}
              </p>
              <p className="font-display text-2xl font-semibold text-slate-950">
                {dictionary.appHome.sellerMomentumTitle}
              </p>
              <p className="text-sm leading-6 text-slate-600">
                {dictionary.appHome.sellerMomentumDescription}
              </p>
            </div>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href="/app/sell">{dictionary.common.actions.startSelling}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <HomeSection>
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {dictionary.appHome.firstUseEyebrow}
            </p>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {dictionary.appHome.firstUseTitle}
            </h2>
            <p className="text-sm leading-7 text-slate-600">
              {dictionary.appHome.firstUseDescription}
            </p>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/app/support">{dictionary.appHome.feedbackCta}</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {dictionary.appHome.firstUseSteps.map((step) => (
              <Link
                key={step.href}
                href={step.href}
                className="rounded-[24px] border border-slate-200 bg-white/90 p-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
              >
                <p className="font-semibold text-slate-950">{step.title}</p>
                <p className="mt-2 leading-6 text-slate-600">{step.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </HomeSection>

      {featuredListings.length ? (
        <HomeSection tone="featured">
          <SectionHeading
            eyebrow={dictionary.appHome.featuredEyebrow}
            title={dictionary.appHome.featuredTitle}
            description={dictionary.appHome.featuredDescription}
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} compact />
            ))}
          </div>
        </HomeSection>
      ) : null}

      <HomeSection>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow={dictionary.appHome.homeFeedEyebrow}
            title={dictionary.appHome.homeFeedTitle}
            description={dictionary.appHome.homeFeedDescription}
          />
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/app/search">
              {dictionary.common.actions.browseEveryCategory}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-5 lg:grid-cols-4">
          {feed.map((listing) => (
            <ListingCard key={listing.id} listing={listing} compact />
          ))}
        </div>
      </HomeSection>
    </div>
  );
}

function HomeSection({
  children,
  tone = "default"
}: {
  children: React.ReactNode;
  tone?: "default" | "featured";
}) {
  return (
    <section
      className={cn(
        "space-y-5 rounded-[24px] border p-4 shadow-sm backdrop-blur-sm sm:space-y-6 sm:rounded-[28px] sm:p-6",
        tone === "featured"
          ? "border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))]"
          : "border-slate-200/80 bg-white/76"
      )}
    >
      {children}
    </section>
  );
}
