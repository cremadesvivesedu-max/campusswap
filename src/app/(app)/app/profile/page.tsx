import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/marketplace/listing-card";
import { ReviewCard } from "@/components/marketplace/review-card";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { SectionHeading } from "@/components/shared/section-heading";
import { StarRating } from "@/components/shared/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  getCurrentUser,
  getListingsForSeller,
  getReviewsForUser,
  getUserById
} from "@/server/queries/marketplace";

export default async function ProfilePage({
  searchParams
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;
  const currentUser = await getCurrentUser();
  const profileUser = userId ? await getUserById(userId) : currentUser;

  if (!profileUser) {
    notFound();
  }

  const isOwnProfile = profileUser.id === currentUser.id;
  const [receivedReviews, sellerListings] = await Promise.all([
    getReviewsForUser(profileUser.id),
    getListingsForSeller(profileUser.id)
  ]);
  const filteredReviews = receivedReviews.filter(
    (review) => review.targetUserId === profileUser.id
  );
  const activeListings = sellerListings.filter((listing) => listing.status === "active");
  const reservedListings = sellerListings.filter((listing) => listing.status === "reserved");
  const soldListings = sellerListings.filter((listing) => listing.status === "sold");
  const archivedListings = sellerListings.filter((listing) => listing.status === "archived");

  return (
    <div className="space-y-10">
      <section className="rounded-[32px] bg-white p-8 shadow-glow">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <ProfileAvatar
              userId={profileUser.id}
              name={profileUser.profile.fullName}
              src={profileUser.avatar}
              className="h-24 w-24 text-2xl"
            />
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-4xl font-semibold text-slate-950">
                  {profileUser.profile.fullName}
                </h1>
                {profileUser.profile.verifiedBadge ? (
                  <Badge className="bg-emerald-100 text-emerald-900">
                    Verified student
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm font-medium text-slate-600">
                {profileUser.profile.university} - {profileUser.profile.neighborhood}
              </p>
              <StarRating
                rating={profileUser.profile.ratingAverage}
                reviewCount={profileUser.profile.reviewCount}
              />
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                {profileUser.profile.bio}
              </p>
            </div>
          </div>
          {isOwnProfile ? (
            <Button asChild>
              <Link href="/app/profile/edit">Edit profile</Link>
            </Button>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-slate-500">Active listings</p>
            <p className="font-display text-2xl font-semibold text-slate-950">
              {activeListings.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-slate-500">Reserved</p>
            <p className="font-display text-2xl font-semibold text-slate-950">
              {reservedListings.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-slate-500">Sold items</p>
            <p className="font-display text-2xl font-semibold text-slate-950">
              {soldListings.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-slate-500">Response rate</p>
            <p className="font-display text-2xl font-semibold text-slate-950">
              {Math.round(profileUser.profile.responseRate * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Active inventory"
          title="Listings currently live on CampusSwap."
          description="These are the items a buyer can still act on right now."
        />
        {activeListings.length ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {activeListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                showMessageAction={!isOwnProfile}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active listings right now"
            description="When this seller publishes new items, they will appear here."
          />
        )}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Reserved"
          title="Items currently on hold."
          description="Reserved listings stay visible so buyers can understand what is already in progress."
        />
        {reservedListings.length ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {reservedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                showMessageAction={!isOwnProfile}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reserved listings"
            description="Nothing is currently marked as reserved for this seller."
          />
        )}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Sold items"
          title="Recent completed exchanges."
          description="Sold listings make seller history more credible and help buyers understand what this profile successfully moves."
        />
        {soldListings.length ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {soldListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No sold items yet"
            description="Completed exchanges will appear here once this seller marks listings as sold."
          />
        )}
      </section>

      {archivedListings.length ? (
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Archived"
            title="Older inventory no longer in circulation."
            description="Archived listings are kept separate so the active profile stays clean."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {archivedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Reviews"
          title="Trust signals from completed exchanges."
          description="Ratings are only collected after a transaction is completed."
        />
        {filteredReviews.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No reviews yet"
            description="Reviews will appear here after completed exchanges."
          />
        )}
      </section>
    </div>
  );
}
