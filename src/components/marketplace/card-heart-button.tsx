"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { useOptionalCurrentUser } from "@/components/providers/current-user-provider";
import { toggleFavoriteAction } from "@/server/actions/marketplace";
import { cn } from "@/lib/utils";

/** Heart on a listing card: saves in one tap, optimistically; logged-out visitors go to login. */
export function CardHeartButton({
  listingId,
  initialSaved = false,
  className
}: {
  listingId: string;
  initialSaved?: boolean;
  className?: string;
}) {
  const { dictionary } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const currentUser = useOptionalCurrentUser();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? dictionary.favorites.remove : dictionary.favorites.save}
      disabled={isPending}
      onClick={() => {
        if (!currentUser) {
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
          return;
        }
        const previous = saved;
        setSaved(!previous);
        startTransition(async () => {
          try {
            const result = await toggleFavoriteAction(listingId);
            setSaved(result.success ? result.isSaved : previous);
          } catch {
            setSaved(previous);
          }
        });
      }}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md transition active:scale-90",
        className
      )}
    >
      <Heart
        className={cn("h-[18px] w-[18px] transition", saved ? "fill-rose-500 text-rose-500" : "text-slate-700")}
        aria-hidden="true"
      />
    </button>
  );
}
