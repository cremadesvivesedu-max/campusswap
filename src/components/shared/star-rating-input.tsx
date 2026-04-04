"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRatingInput({
  name,
  defaultValue = 5,
  className
}: {
  name: string;
  defaultValue?: number;
  className?: string;
}) {
  const groupId = useId();
  const [value, setValue] = useState(defaultValue);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const activeValue = hoveredValue ?? value;

  return (
    <div className={cn("space-y-2", className)}>
      <input type="hidden" name={name} value={value} />
      <div className="flex items-center gap-2" role="radiogroup" aria-labelledby={groupId}>
        <span id={groupId} className="sr-only">
          Choose a rating
        </span>
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;
          const active = starValue <= activeValue;

          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={value === starValue}
              aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
              onMouseEnter={() => setHoveredValue(starValue)}
              onMouseLeave={() => setHoveredValue(null)}
              onFocus={() => setHoveredValue(starValue)}
              onBlur={() => setHoveredValue(null)}
              onClick={() => setValue(starValue)}
              className="rounded-full p-1 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Star
                className={cn(
                  "h-6 w-6 transition",
                  active ? "fill-amber-400 text-amber-400" : "text-slate-300"
                )}
              />
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-500">{value} / 5</p>
    </div>
  );
}
