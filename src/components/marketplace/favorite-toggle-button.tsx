"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavoriteAction } from "@/server/actions/marketplace";
import { useOptionalCurrentUser } from "@/components/providers/current-user-provider";
import { cn } from "@/lib/utils";

interface FavoriteToggleButtonProps {
  listingId: string;
  initialSaved?: boolean;
  className?: string;
}

export function FavoriteToggleButton({
  listingId,
  initialSaved = false,
  className
}: FavoriteToggleButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useOptionalCurrentUser();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        type="button"
        variant={isSaved ? "primary" : "outline"}
        className="w-full"
        onClick={() => {
          if (!currentUser) {
            router.push(`/login?next=${encodeURIComponent(pathname)}`);
            return;
          }

          startTransition(async () => {
            const result = await toggleFavoriteAction(listingId);
            setFeedback(result.message);

            if (result.success) {
              setIsSaved(result.isSaved);
              router.refresh();
            }
          });
        }}
        disabled={isPending}
      >
        <Heart className={cn("mr-2 h-4 w-4", isSaved ? "fill-current" : "")} />
        {isPending ? "Saving..." : isSaved ? "Saved" : "Save listing"}
      </Button>
      {feedback ? <p className="text-xs text-slate-500">{feedback}</p> : null}
    </div>
  );
}
