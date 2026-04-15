import Link from "next/link";
import { ArrowUpRight, Megaphone } from "lucide-react";
import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDictionaryForRequest } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  getActiveSponsoredPlacements,
  getBecauseYouViewedFeed,
  getCurrentUser,
  getFeaturedListings,
  getForYouFeed,
  getHomeFeed,
  getLastChanceFeed,
  getMostPopularInAreaFeed,
  getOutletListings,
  getNewTodayFeed
} from "@/server/queries/marketplace";

export default async function AppHomePage() {
  const [
    user,
    feed,
    featuredListings,
    sponsors,
    forYouFeed,
    becauseYouViewed,
    popularInArea,
    newToday,
    outletListings,
    lastChanceFeed,
    dictionary
  ] = await Promise.all([
    getCurrentUser(),
    getHomeFeed(),
    getFeaturedListings(),
    getActiveSponsoredPlacements("Home feed"),
    getForYouFeed(),
    getBecauseYouViewedFeed(),
    getMostPopularInAreaFeed(),
    getNewTodayFeed(),
    getOutletListings(),
    getLastChanceFeed(),
    getDictionaryForRequest()
  ]);
  const sponsor = sponsors[0];

  return (
    <div className="space-y-14">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden border-slate-900 bg-[radial-gradient(circle_at_top_left,_rgba(148,163,184,0.28),_transparent_38%),linear-gradient(135deg,_#020617,_#0f172a_62%,_#1e293b)] text-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
          <CardContent className="space-y-8 p-8 sm:p-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                {dictionary.appHome.featuredEyebrow}
              </p>
              <p className="font-display text-4xl font-semibold tracking-tight sm:text-[2.8rem]">
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
        <div className="grid auto-rows-fr gap-6">
          {sponsor ? (
            <Card className="border-slate-200/80 bg-white/92 shadow-sm">
              <CardHeader>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {sponsor.label}
                </p>
                <h2 className="font-display text-2xl font-semibold text-slate-950">
                  {sponsor.name}
                </h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-7 text-slate-600">{sponsor.copy}</p>
                <p className="text-sm font-semibold text-slate-950">
                  Placement: {sponsor.location}
                </p>
              </CardContent>
            </Card>
          ) : null}
          <Card className="border-slate-200/80 bg-white/92 shadow-sm">
            <CardContent className="flex items-center justify-between gap-4 p-6">
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
                <Link href="/app/sell">
                  <Megaphone className="mr-2 h-4 w-4" />
                  {dictionary.common.actions.startSelling}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <HomeSection tone="featured">
        <SectionHeading
          eyebrow={dictionary.appHome.featuredEyebrow}
          title={dictionary.appHome.featuredTitle}
          description={dictionary.appHome.featuredDescription}
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredListings.slice(0, 3).map((listing) => (
            <ListingCard key={listing.id} listing={listing} showMessageAction />
          ))}
        </div>
      </HomeSection>

      {forYouFeed.length ? (
        <HomeSection>
          <SectionHeading
            eyebrow={dictionary.appHome.forYouEyebrow}
            title={dictionary.appHome.forYouTitle}
            description={dictionary.appHome.forYouDescription}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {forYouFeed.slice(0, 3).map((entry) => (
              <ListingCard
                key={entry.listing.id}
                listing={entry.listing}
                reason={entry.breakdown.reasons}
                showMessageAction
              />
            ))}
          </div>
        </HomeSection>
      ) : null}

      {becauseYouViewed.length ? (
        <HomeSection>
          <SectionHeading
            eyebrow={dictionary.appHome.becauseViewedEyebrow}
            title={dictionary.appHome.becauseViewedTitle}
            description={dictionary.appHome.becauseViewedDescription}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {becauseYouViewed.slice(0, 3).map((entry) => (
              <ListingCard
                key={entry.listing.id}
                listing={entry.listing}
                reason={entry.reasons}
                showMessageAction
              />
            ))}
          </div>
        </HomeSection>
      ) : null}

      {popularInArea.length ? (
        <HomeSection>
          <SectionHeading
            eyebrow={dictionary.appHome.popularAreaEyebrow}
            title={dictionary.appHome.popularAreaTitle.replace(
              "{area}",
              user.profile.neighborhood
            )}
            description={dictionary.appHome.popularAreaDescription}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {popularInArea.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} showMessageAction />
            ))}
          </div>
        </HomeSection>
      ) : null}

      {newToday.length ? (
        <HomeSection>
          <SectionHeading
            eyebrow={dictionary.appHome.newTodayEyebrow}
            title={dictionary.appHome.newTodayTitle}
            description={dictionary.appHome.newTodayDescription}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {newToday.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} showMessageAction />
            ))}
          </div>
        </HomeSection>
      ) : null}

      {outletListings.length ? (
        <HomeSection>
          <SectionHeading
            eyebrow={dictionary.appHome.outletEyebrow}
            title={dictionary.appHome.outletTitle}
            description={dictionary.appHome.outletDescription}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {outletListings.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} showMessageAction />
            ))}
          </div>
        </HomeSection>
      ) : null}

      {lastChanceFeed.length ? (
        <HomeSection>
          <SectionHeading
            eyebrow={dictionary.appHome.lastChanceEyebrow}
            title={dictionary.appHome.lastChanceTitle}
            description={dictionary.appHome.lastChanceDescription}
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {lastChanceFeed.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} showMessageAction />
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
        <div className="grid gap-6 lg:grid-cols-3">
          {feed.slice(0, 6).map((listing) => (
            <ListingCard key={listing.id} listing={listing} showMessageAction />
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
        "space-y-7 rounded-[34px] border p-6 shadow-sm backdrop-blur-sm sm:p-8",
        tone === "featured"
          ? "border-amber-200/70 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,255,255,0.96))]"
          : "border-slate-200/80 bg-white/76"
      )}
    >
      {children}
    </section>
  );
}
