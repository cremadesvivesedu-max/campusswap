import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/marketplace/listing-card";
import { ReviewCard } from "@/components/marketplace/review-card";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { SectionHeading } from "@/components/shared/section-heading";
import { StarRating } from "@/components/shared/star-rating";
import { VerificationStatusBadge } from "@/components/shared/verification-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getDictionaryForRequest } from "@/lib/i18n";
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
  const [receivedReviews, sellerListings, dictionary] = await Promise.all([
    getReviewsForUser(profileUser.id),
    getListingsForSeller(profileUser.id),
    getDictionaryForRequest()
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
                <VerificationStatusBadge status={profileUser.verificationStatus} />
              </div>
              <p className="text-sm font-medium text-slate-600">
                {profileUser.profile.university} - {profileUser.profile.neighborhood}
              </p>
              <p className="text-sm leading-6 text-slate-600">
                {profileUser.verificationStatus === "verified"
                  ? "Student verification is visible across listings and messages."
                  : profileUser.verificationStatus === "pending"
                    ? "This account is active while student verification is still pending."
                    : "This account can use CampusSwap normally, but student verification has not been added yet."}
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
            <p className="text-sm text-slate-500">{dictionary.profile.activeListings}</p>
            <p className="font-display text-2xl font-semibold text-slate-950">
              {activeListings.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-slate-500">{dictionary.profile.reserved}</p>
            <p className="font-display text-2xl font-semibold text-slate-950">
              {reservedListings.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-slate-500">{dictionary.profile.soldItems}</p>
            <p className="font-display text-2xl font-semibold text-slate-950">
              {soldListings.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardContent className="space-y-2 p-6">
            <p className="text-sm text-slate-500">{dictionary.profile.responseRate}</p>
            <p className="font-display text-2xl font-semibold text-slate-950">
              {Math.round(profileUser.profile.responseRate * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6">
        <SectionHeading
          eyebrow={dictionary.profile.activeInventoryEyebrow}
          title={dictionary.profile.activeInventoryTitle}
          description={dictionary.profile.activeInventoryDescription}
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
          eyebrow={dictionary.profile.reservedEyebrow}
          title={dictionary.profile.reservedTitle}
          description={dictionary.profile.reservedDescription}
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
          eyebrow={dictionary.profile.soldEyebrow}
          title={dictionary.profile.soldTitle}
          description={dictionary.profile.soldDescription}
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
            eyebrow={dictionary.profile.archivedEyebrow}
            title={dictionary.profile.archivedTitle}
            description={dictionary.profile.archivedDescription}
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
          eyebrow={dictionary.profile.reviewsEyebrow}
          title={dictionary.profile.reviewsTitle}
          description={dictionary.profile.reviewsDescription}
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
