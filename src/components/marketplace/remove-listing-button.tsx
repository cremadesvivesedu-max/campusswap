"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { removeListingAction } from "@/server/actions/marketplace";

export function RemoveListingButton({
  listingId,
  listingTitle,
  className,
  redirectHref
}: {
  listingId: string;
  listingTitle: string;
  className?: string;
  redirectHref?: string;
}) {
  const { dictionary } = useLocale();
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className={className}>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={isPending}
        onClick={() => {
          if (
            !window.confirm(
              `Remove "${listingTitle}" from public browse pages? Existing chat and completed exchange history will stay intact.`
            )
          ) {
            return;
          }

          startTransition(async () => {
            try {
              setFeedback(null);
              setError(null);
              const result = await removeListingAction(listingId);

              if (!result.success) {
                setError(result.message);
                return;
              }

              if (redirectHref) {
                router.push(redirectHref);
                router.refresh();
                return;
              }

              setFeedback(result.message);
              router.refresh();
            } catch (caughtError) {
              setError(
                caughtError instanceof Error
                  ? caughtError.message
                  : "Unable to remove this listing right now."
              );
            }
          });
        }}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        {isPending
          ? dictionary.common.actions.removing
          : dictionary.common.actions.removeListing}
      </Button>
      {feedback ? <p className="mt-2 text-xs font-medium text-emerald-700">{feedback}</p> : null}
      {error ? <p className="mt-2 text-xs font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}
