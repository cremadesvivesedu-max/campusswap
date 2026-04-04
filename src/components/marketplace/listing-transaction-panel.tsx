"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { StarRating } from "@/components/shared/star-rating";
import {
  cancelTransactionAction,
  completeTransactionAction,
  releaseReservationAction,
  reserveConversationBuyerAction,
  startPurchaseIntentAction
} from "@/server/actions/marketplace";
import { formatCurrency } from "@/lib/utils";
import type { ListingTransactionContext, ListingStatus, User } from "@/types/domain";

function formatTransactionState(state?: string) {
  switch (state) {
    case "active":
      return "Available";
    case "sold":
      return "Sold";
    case "archived":
      return "Archived";
    case "hidden":
      return "Removed";
    case "pending-review":
      return "Pending review";
    case "inquiry":
      return "Conversation open";
    case "negotiating":
      return "Purchase requested";
    case "reserved":
      return "Reserved";
    case "completed":
      return "Sold";
    case "cancelled":
      return "Cancelled";
    default:
      return "Available";
  }
}

function formatEventTime(value?: string) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function ListingTransactionPanel({
  listingId,
  listingTitle,
  listingPrice,
  listingStatus,
  currentUserId,
  seller,
  context,
  isOwnListing
}: {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingStatus: ListingStatus;
  currentUserId: string;
  seller: User;
  context: ListingTransactionContext;
  isOwnListing: boolean;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const transaction = context.viewerTransaction ?? context.activeTransaction;
  const buyer = context.buyer;

  const runAction = (
    action: () => Promise<{ success: boolean; message: string; conversationId?: string }>
  ) => {
    startTransition(async () => {
      try {
        setFeedback(null);
        setError(null);
        const result = await action();

        if (!result.success) {
          setError(result.message);
          return;
        }

        if (result.conversationId) {
          router.push(`/app/messages/${result.conversationId}`);
          router.refresh();
          return;
        }

        setFeedback(result.message);
        router.refresh();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to update the purchase flow right now."
        );
      }
    });
  };

  if (isOwnListing) {
    const canReserve =
      !!transaction?.conversationId && ["inquiry", "negotiating"].includes(transaction.state);
    const canRelease = transaction?.state === "reserved";
    const canComplete =
      !!transaction && ["inquiry", "negotiating", "reserved"].includes(transaction.state);

    return (
      <Card className="bg-white">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              Seller controls
            </h2>
            <Badge className="bg-slate-950 text-white">
              {formatTransactionState(transaction?.state ?? listingStatus)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
          {buyer ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <ProfileAvatar
                  userId={buyer.id}
                  name={buyer.profile.fullName}
                  src={buyer.avatar}
                  className="h-12 w-12"
                />
                <div>
                  <p className="font-semibold text-slate-950">{buyer.profile.fullName}</p>
                  <StarRating
                    rating={buyer.profile.ratingAverage}
                    reviewCount={buyer.profile.reviewCount}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-3 grid gap-1">
                <p>Offer value: {formatCurrency(transaction?.amount ?? listingPrice)}</p>
                <p>Meetup area: {transaction?.meetupSpot ?? "To be agreed in chat"}</p>
                <p>Meetup window: {transaction?.meetupWindow ?? "To be scheduled"}</p>
                {transaction?.reservedAt ? (
                  <p>Reserved at: {formatEventTime(transaction.reservedAt)}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No buyer is linked yet. When someone starts a purchase request, it will appear here.
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {transaction?.conversationId ? (
              <Button asChild type="button" variant="secondary">
                <Link href={`/app/messages/${transaction.conversationId}`}>Open buyer chat</Link>
              </Button>
            ) : null}
            {canReserve && transaction?.conversationId ? (
              <Button
                type="button"
                onClick={() =>
                  runAction(() => reserveConversationBuyerAction(transaction.conversationId!))
                }
                disabled={isPending}
              >
                {isPending ? "Updating..." : "Reserve for buyer"}
              </Button>
            ) : null}
            {canRelease && transaction ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => runAction(() => releaseReservationAction(transaction.id))}
                disabled={isPending}
              >
                {isPending ? "Updating..." : "Release reservation"}
              </Button>
            ) : null}
            {canComplete && transaction ? (
              <Button
                type="button"
                onClick={() => runAction(() => completeTransactionAction(transaction.id))}
                disabled={isPending}
              >
                {isPending ? "Updating..." : "Mark sold"}
              </Button>
            ) : null}
            {transaction ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (
                    !window.confirm(
                      "Cancel this exchange? The listing will reopen for other buyers if it was reserved."
                    )
                  ) {
                    return;
                  }

                  runAction(() => cancelTransactionAction(transaction.id));
                }}
                disabled={isPending}
              >
                {isPending ? "Updating..." : "Cancel exchange"}
              </Button>
            ) : null}
          </div>

          <p className="text-xs text-slate-500">
            Removal is a soft hide for safety. Chats, completed reviews, and audit history stay intact.
          </p>
          {feedback ? <p className="text-sm font-medium text-emerald-700">{feedback}</p> : null}
          {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
        </CardContent>
      </Card>
    );
  }

  const canStartPurchase =
    listingStatus === "active" && !context.viewerTransaction && !context.reservedForOtherBuyer;
  const canCancelOwnExchange =
    !!context.viewerTransaction &&
    context.viewerTransaction.state !== "completed" &&
    context.viewerTransaction.state !== "cancelled";

  return (
    <Card className="bg-white">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-semibold text-slate-950">Purchase flow</h2>
          <Badge className="bg-slate-950 text-white">
            {formatTransactionState(
              context.viewerTransaction?.state ??
                context.activeTransaction?.state ??
                listingStatus
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              userId={seller.id}
              name={seller.profile.fullName}
              src={seller.avatar}
              className="h-12 w-12"
            />
            <div>
              <p className="font-semibold text-slate-950">{seller.profile.fullName}</p>
              <StarRating
                rating={seller.profile.ratingAverage}
                reviewCount={seller.profile.reviewCount}
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-3 grid gap-1">
            <p>Listing price: {formatCurrency(context.viewerTransaction?.amount ?? listingPrice)}</p>
            <p>Meetup area: {context.viewerTransaction?.meetupSpot ?? "To be agreed in chat"}</p>
            <p>Meetup window: {context.viewerTransaction?.meetupWindow ?? "To be scheduled"}</p>
          </div>
        </div>

        {context.reservedForOtherBuyer ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This item is currently reserved for another buyer. You can still browse the listing, but you cannot start a new purchase request until it is released.
          </div>
        ) : null}

        {listingStatus === "sold" || context.activeTransaction?.state === "completed" ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            This listing has already been completed. Reviews unlock only for the buyer and seller involved in the finished exchange.
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {canStartPurchase ? (
            <Button
              type="button"
              onClick={() => runAction(() => startPurchaseIntentAction(listingId))}
              disabled={isPending}
            >
              {isPending ? "Starting..." : "Buy now / request reservation"}
            </Button>
          ) : null}
          {context.viewerTransaction?.conversationId ? (
            <Button asChild type="button" variant="secondary">
              <Link href={`/app/messages/${context.viewerTransaction.conversationId}`}>
                Open purchase chat
              </Link>
            </Button>
          ) : null}
          {canCancelOwnExchange && context.viewerTransaction ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!window.confirm(`Cancel your purchase request for "${listingTitle}"?`)) {
                  return;
                }

                runAction(() => cancelTransactionAction(context.viewerTransaction!.id));
              }}
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Cancel request"}
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-slate-500">
          No online payment is collected yet. CampusSwap records purchase intent, reservation, and completion so both sides can coordinate the meetup clearly.
        </p>
        {feedback ? <p className="text-sm font-medium text-emerald-700">{feedback}</p> : null}
        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
