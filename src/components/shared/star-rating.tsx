import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  className?: string;
  showValue?: boolean;
}

export function StarRating({ rating, reviewCount, className, showValue = true }: StarRatingProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, index) => {
          const fillLevel = Math.max(0, Math.min(1, rating - index));
          return (
            <span key={index} className="relative inline-flex h-4 w-4">
              <Star className="absolute inset-0 h-4 w-4 text-slate-300" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fillLevel * 100}%` }}>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </span>
            </span>
          );
        })}
      </div>
      {showValue ? (
        <span className="text-sm font-medium text-slate-700">
          {rating.toFixed(1)}
          {typeof reviewCount === "number" ? ` (${reviewCount})` : ""}
        </span>
      ) : null}
    </div>
  );
}
