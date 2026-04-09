import Link from "next/link";
import { ArrowUpRight, Megaphone } from "lucide-react";
import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDictionaryForRequest } from "@/lib/i18n";
import {
  getActiveSponsoredPlacements,
  getBecauseYouViewedFeed,
  getCurrentUser,
  getFeaturedListings,
  getForYouFeed,
  getHomeFeed,
  getMostPopularInAreaFeed,
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
    getDictionaryForRequest()
  ]);
  const sponsor = sponsors[0];

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-slate-950 text-white">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-3">
              <p className="font-display text-4xl font-semibold">
                {dictionary.appHome.welcomeBack}, {user.profile.fullName.split(" ")[0]}.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
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
        <div className="grid gap-6">
          {sponsor ? (
            <Card className="bg-white">
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
          <Card className="bg-white">
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

      <section className="space-y-6">
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
      </section>

      {forYouFeed.length ? (
        <section className="space-y-6">
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
                showMessageAction
              />
            ))}
          </div>
        </section>
      ) : null}

      {becauseYouViewed.length ? (
        <section className="space-y-6">
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
                showMessageAction
              />
            ))}
          </div>
        </section>
      ) : null}

      {popularInArea.length ? (
        <section className="space-y-6">
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
        </section>
      ) : null}

      {newToday.length ? (
        <section className="space-y-6">
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
        </section>
      ) : null}

      <section className="space-y-6">
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
      </section>
    </div>
  );
}
