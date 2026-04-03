"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOptionalCurrentUser } from "@/components/providers/current-user-provider";
import { getVerificationStatusLabel } from "@/lib/verification";
import { cn } from "@/lib/utils";
import { isLiveClientMode } from "@/lib/public-env";
import { ensureConversationForListing } from "@/features/messaging/demo-messaging-store";
import { ensureLiveConversationForListing } from "@/features/messaging/live-messaging";
import type { ListingStatus } from "@/types/domain";

interface MessageSellerButtonProps {
  listingId: string;
  sellerId: string;
  listingStatus?: ListingStatus;
  mode?: "chat" | "signup";
  className?: string;
}

function getUnavailableLabel(status?: ListingStatus) {
  if (status === "sold") {
    return "Item sold";
  }

  if (status && status !== "active" && status !== "reserved") {
    return "Listing unavailable";
  }

  return null;
}

export function MessageSellerButton({
  listingId,
  sellerId,
  listingStatus,
  mode = "chat",
  className
}: MessageSellerButtonProps) {
  const router = useRouter();
  const currentUser = useOptionalCurrentUser();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const unavailableLabel = mode === "chat" ? getUnavailableLabel(listingStatus) : null;
  const currentUserId = currentUser?.id;
  const verificationNotice =
    mode === "chat" && currentUser && currentUser.verificationStatus !== "verified"
      ? `You are messaging as ${getVerificationStatusLabel(currentUser.verificationStatus).toLowerCase()}. Verification is optional, but it adds a stronger trust signal.`
      : null;

  if (mode === "chat" && currentUserId === sellerId) {
    return (
      <div className={cn("space-y-2", className)}>
        <Button className="w-full" type="button" variant="outline" disabled>
          Your listing
        </Button>
      </div>
    );
  }

  if (unavailableLabel) {
    return (
      <div className={cn("space-y-2", className)}>
        <Button className="w-full" type="button" variant="outline" disabled>
          {unavailableLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Button
        className="w-full"
        type="button"
        variant="outline"
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              if (mode === "signup" || !currentUserId) {
                router.push(`/signup?next=/app/listings/${listingId}`);
                return;
              }

              const conversation = isLiveClientMode
                ? await ensureLiveConversationForListing(listingId, currentUserId, sellerId)
                : await ensureConversationForListing(listingId, currentUserId, sellerId);

              router.push(`/app/messages/${conversation.id}`);
            } catch (caughtError) {
              setError(
                caughtError instanceof Error
                  ? caughtError.message
                  : "Unable to open the conversation right now."
              );
            }
          });
        }}
        disabled={isPending}
      >
        <MessageCircleMore className="mr-2 h-4 w-4" />
        {isPending
          ? "Opening..."
          : mode === "signup"
            ? "Sign up to message"
            : "Message seller"}
      </Button>
      {verificationNotice ? (
        <p className="text-xs font-medium text-slate-600">{verificationNotice}</p>
      ) : null}
      {error ? <p className="text-xs font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}
