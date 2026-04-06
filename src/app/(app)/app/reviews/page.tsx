import { ReviewCard } from "@/components/marketplace/review-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getCurrentUser, getReviewsForUser } from "@/server/queries/marketplace";

export default async function ReviewsPage() {
  const user = await getCurrentUser();
  const [reviews, dictionary] = await Promise.all([
    getReviewsForUser(user.id),
    getDictionaryForRequest()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={dictionary.reviews.eyebrow}
        title={dictionary.reviews.title}
        description={dictionary.reviews.description}
      />
      {reviews.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={dictionary.reviews.noReviewsTitle}
          description={dictionary.reviews.noReviewsDescription}
        />
      )}
    </div>
  );
}
