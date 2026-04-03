import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StarRating } from "@/components/shared/star-rating";
import type { Review } from "@/types/domain";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <StarRating rating={review.rating} />
          <p className="text-xs text-slate-500">{review.createdAt.slice(0, 10)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">{review.text}</p>
      </CardContent>
    </Card>
  );
}
