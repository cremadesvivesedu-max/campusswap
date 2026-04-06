"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StarRating } from "@/components/shared/star-rating";
import { useLocale } from "@/components/providers/locale-provider";
import type { Review } from "@/types/domain";

export function ReviewCard({ review }: { review: Review }) {
  const { dictionary } = useLocale();

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <StarRating rating={review.rating} />
          <p className="text-xs text-slate-500">
            {dictionary.reviews.createdOn} {review.createdAt.slice(0, 10)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">
          {review.text || dictionary.reviews.textOptionalHint}
        </p>
      </CardContent>
    </Card>
  );
}
