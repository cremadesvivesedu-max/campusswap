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
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden border-slate-900 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.28),_transparent_38%),linear-gradient(135deg,_#020617,_#0f172a_62%,_#1e293b)] text-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
          <CardContent className="space-y-7 p-7 sm:p-9">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                {dictionary.appHome.featuredEyebrow}
              </p>
              <p className="font-display text-4xl font-semibold sm:text-[2.7rem]">
                {dictionary.appHome.welcomeBack}, {user.profile.fullName.split(" ")[0]}.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {dictionary.appHome.feedDescription}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/app/sell">{dictionary.appHome.sellUpload}</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/app/search">{dictionary.appHome.searchAllListings}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 bg-white/92 shadow-sm">
          <CardContent className="flex h-full flex-col justify-between gap-5 p-6">
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
            <Button asChild variant="secondary">
              <Link href="/app/sell">{dictionary.common.actions.startSelling}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

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
          <Button asChild variant="outline">
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
        "space-y-6 rounded-[28px] border p-5 shadow-sm backdrop-blur-sm sm:p-6",
        tone === "featured"
          ? "border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))]"
          : "border-slate-200/80 bg-white/76"
      )}
    >
      {children}
    </section>
  );
}
