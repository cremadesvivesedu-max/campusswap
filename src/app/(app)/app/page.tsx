import Link from "next/link";
import { ArrowUpRight, Megaphone } from "lucide-react";
import { ListingCard } from "@/components/marketplace/listing-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  getActiveSponsoredPlacements,
  getCurrentUser,
  getFeaturedListings,
  getHomeFeed
} from "@/server/queries/marketplace";

export default async function AppHomePage() {
  const [user, feed, featuredListings, sponsors] = await Promise.all([
    getCurrentUser(),
    getHomeFeed(),
    getFeaturedListings(),
    getActiveSponsoredPlacements("Home feed")
  ]);
  const sponsor = sponsors[0];

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="bg-slate-950 text-white">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-3">
              <p className="font-display text-4xl font-semibold">
                Welcome back, {user.profile.fullName.split(" ")[0]}.
              </p>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
                Your feed prioritizes bikes, furniture, kitchen equipment, and fast
                pickup listings based on your profile, saved items, and recent searches.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/app/sell">Sell / upload product</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/app/search">Search all listings</Link>
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
                  Seller momentum
                </p>
                <p className="font-display text-2xl font-semibold text-slate-950">
                  Need to sell before moving out?
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  Launch your listing, mark it urgent, and promote it if timing is tight.
                </p>
              </div>
              <Button asChild variant="secondary">
                <Link href="/app/sell">
                  <Megaphone className="mr-2 h-4 w-4" />
                  Start selling
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Featured right now"
          title="High-intent inventory across the city."
          description="A mix of boosted, fast-moving, and student-relevant listings from across Maastricht."
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {featuredListings.slice(0, 3).map((listing) => (
            <ListingCard key={listing.id} listing={listing} showMessageAction />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Home feed"
            title="What is moving now."
            description="Fresh listings, practical essentials, and value-oriented items that tend to convert quickly."
          />
          <Button asChild variant="outline">
            <Link href="/app/search">
              Browse every category
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
