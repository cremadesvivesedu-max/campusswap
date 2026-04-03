import { ReviewCard } from "@/components/marketplace/review-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCurrentUser, getReviewsForUser } from "@/server/queries/marketplace";

export default async function ReviewsPage() {
  const user = await getCurrentUser();
  const reviews = await getReviewsForUser(user.id);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Reviews"
        title="Ratings only appear after completed exchanges."
        description="The review system is designed to reward reliability and discourage premature feedback before a handoff actually happens."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
