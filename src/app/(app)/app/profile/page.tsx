import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/marketplace/listing-card";
import { ReviewCard } from "@/components/marketplace/review-card";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { StarRating } from "@/components/shared/star-rating";
import { VerificationStatusBadge } from "@/components/shared/verification-status-badge";
import { TrustBadges } from "@/components/shared/trust-badges";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { getDictionaryForRequest, getRequestLocale } from "@/lib/i18n";
import {
  getCurrentUser,
  getListingsForSeller,
  getReviewsForUser,
  getUserById
} from "@/server/queries/marketplace";

type Tab = "sale" | "sold" | "reviews";

// Profile in marketplace style: who they are in one block, then tabs for what they
// sell, what they sold and what people say about them.
export default async function ProfilePage({
  searchParams
}: {
  searchParams: Promise<{ userId?: string; tab?: string }>;
}) {
  const { userId, tab: rawTab } = await searchParams;
  const tab: Tab = rawTab === "sold" || rawTab === "reviews" ? rawTab : "sale";
  const [currentUser, dictionary, locale] = await Promise.all([
    getCurrentUser(),
    getDictionaryForRequest(),
    getRequestLocale()
  ]);
  const profileUser = userId && userId !== currentUser.id ? await getUserById(userId) : currentUser;

  if (!profileUser) {
    notFound();
  }

  const isOwnProfile = profileUser.id === currentUser.id;
  const copy = dictionary.profilePage;
  const [receivedReviews, sellerListings] = await Promise.all([
    getReviewsForUser(profileUser.id),
    getListingsForSeller(profileUser.id)
  ]);
  const reviews = receivedReviews.filter((review) => review.targetUserId === profileUser.id);
  const onSale = sellerListings.filter(
    (listing) => listing.status === "active" || listing.status === "reserved"
  );
  const sold = sellerListings.filter((listing) => listing.status === "sold");
  const paused = isOwnProfile ? sellerListings.filter((listing) => listing.status === "archived") : [];
  const memberSince = new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(
    new Date(profileUser.joinedAt)
  );
  const responseRate = Math.round(
    (profileUser.sellerMetrics?.responseRate ?? profileUser.profile.responseRate) * 100
  );
  const tabHref = (next: Tab) => {
    const params = new URLSearchParams();
    if (!isOwnProfile) {
      params.set("userId", profileUser.id);
    }
    if (next !== "sale") {
      params.set("tab", next);
    }
    const query = params.toString();
    return `/app/profile${query ? `?${query}` : ""}`;
  };
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "sale", label: copy.onSale, count: onSale.length },
    { id: "sold", label: copy.sold, count: sold.length },
    { id: "reviews", label: copy.reviews, count: reviews.length }
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-3xl bg-white p-5 sm:p-7">
        <div className="flex items-center gap-4">
          <ProfileAvatar
            userId={profileUser.id}
            name={profileUser.profile.fullName}
            src={profileUser.avatar}
            className="h-20 w-20 shrink-0 text-xl sm:h-24 sm:w-24"
          />
          <div className="min-w-0 space-y-1">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
              <span className="truncate">{profileUser.profile.fullName}</span>
              <VerificationStatusBadge status={profileUser.verificationStatus} />
            </h1>
            <StarRating
              rating={profileUser.profile.ratingAverage}
              reviewCount={profileUser.profile.reviewCount}
            />
            <p className="text-sm text-slate-500">
              {profileUser.profile.university} · {profileUser.profile.neighborhood}
            </p>
          </div>
        </div>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
          <span>
            <strong className="text-slate-950">{profileUser.sellerMetrics?.salesCount ?? 0}</strong>{" "}
            {copy.sales}
          </span>
          <span>
            {copy.responds} <strong className="text-slate-950">{responseRate}%</strong>
          </span>
          <span>
            {copy.memberSince} <strong className="text-slate-950">{memberSince}</strong>
          </span>
        </p>
        <TrustBadges user={profileUser} labels={dictionary.trustBadges} />
        {profileUser.profile.bio ? (
          <p className="text-sm leading-6 text-slate-600">{profileUser.profile.bio}</p>
        ) : null}
        {isOwnProfile ? (
          // On phones the bottom bar has no Settings or My listings, so the profile
          // (reached from the avatar) is the way in.
          <div className="grid grid-cols-3 gap-2">
            <Button asChild size="sm">
              <Link href="/app/profile/edit">{copy.edit}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/app/my-listings">{copy.myListings}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/app/settings">{copy.settings}</Link>
            </Button>
          </div>
        ) : null}
        {isOwnProfile ? (
          <Link
            href="/app/invite"
            className="flex items-center justify-between rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 hover:bg-amber-100"
          >
            🎁 {dictionary.invite.entry}
            <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </section>

      <nav aria-label={copy.onSale} className="flex border-b border-slate-200">
        {tabs.map((item) => (
          <Link
            key={item.id}
            href={tabHref(item.id)}
            scroll={false}
            aria-current={tab === item.id ? "page" : undefined}
            className={`flex-1 border-b-2 px-2 pb-3 text-center text-sm font-bold transition ${
              tab === item.id
                ? "border-emerald-600 text-slate-950"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {item.label} <span className="font-semibold text-slate-400">{item.count}</span>
          </Link>
        ))}
      </nav>

      {tab === "sale" ? (
        onSale.length || paused.length ? (
          <div className="space-y-6">
            {onSale.length ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
                {onSale.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : null}
            {paused.length ? (
              <section className="space-y-3">
                <h2 className="text-base font-bold text-slate-500">{copy.paused}</h2>
                <div className="grid grid-cols-2 gap-x-3 gap-y-6 opacity-70 sm:grid-cols-3 lg:grid-cols-4">
                  {paused.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <EmptyState
            title={dictionary.profile.emptyStates.activeTitle}
            description={dictionary.profile.emptyStates.activeDescription}
          />
        )
      ) : null}

      {tab === "sold" ? (
        sold.length ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
            {sold.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={dictionary.profile.emptyStates.soldTitle}
            description={dictionary.profile.emptyStates.soldDescription}
          />
        )
      ) : null}

      {tab === "reviews" ? (
        reviews.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={dictionary.profile.emptyStates.reviewsTitle}
            description={dictionary.profile.emptyStates.reviewsDescription}
          />
        )
      ) : null}

      {!isOwnProfile ? (
        <p className="px-1 text-xs">
          <Link
            href={`/app/support?type=report-user&targetUserId=${profileUser.id}`}
            className="text-slate-500 underline-offset-2 hover:text-rose-700 hover:underline"
          >
            {copy.report}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
