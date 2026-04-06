"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLocale } from "@/components/providers/locale-provider";
import { getExchangeStatusLabel, getListingStatusLabel } from "@/lib/i18n-shared";
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
  const { dictionary } = useLocale();
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
            : dictionary.messages.inbox.loadErrorTitle
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
              {dictionary.listing.seller}
            </h2>
            <Badge className="bg-slate-950 text-white">
              {transaction?.state
                ? getExchangeStatusLabel(dictionary, transaction.state)
                : getListingStatusLabel(dictionary, listingStatus)}
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
                <p>{dictionary.messages.exchange.price}: {formatCurrency(transaction?.amount ?? listingPrice)}</p>
                <p>{dictionary.messages.exchange.meetupArea}: {transaction?.meetupSpot ?? dictionary.messages.exchange.meetupTbd}</p>
                <p>{dictionary.messages.exchange.meetupWindow}: {transaction?.meetupWindow ?? dictionary.messages.exchange.windowTbd}</p>
                {transaction?.reservedAt ? (
                  <p>{dictionary.messages.exchange.reservedAt}: {formatEventTime(transaction.reservedAt)}</p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {dictionary.messages.exchange.noBuyerLinked}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {transaction?.conversationId ? (
              <Button asChild type="button" variant="secondary">
                <Link href={`/app/messages/${transaction.conversationId}`}>
                  {dictionary.common.actions.openBuyerChat}
                </Link>
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
                {isPending ? dictionary.common.actions.updating : dictionary.messages.exchange.reserveForBuyer}
              </Button>
            ) : null}
            {canRelease && transaction ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => runAction(() => releaseReservationAction(transaction.id))}
                disabled={isPending}
              >
                {isPending ? dictionary.common.actions.updating : dictionary.messages.exchange.releaseReservation}
              </Button>
            ) : null}
            {canComplete && transaction ? (
              <Button
                type="button"
                onClick={() => runAction(() => completeTransactionAction(transaction.id))}
                disabled={isPending}
              >
                {isPending ? dictionary.common.actions.updating : dictionary.messages.exchange.markSold}
              </Button>
            ) : null}
            {transaction ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (
                    !window.confirm(
                      dictionary.messages.exchange.confirmCancel
                    )
                  ) {
                    return;
                  }

                  runAction(() => cancelTransactionAction(transaction.id));
                }}
                disabled={isPending}
              >
                {isPending ? dictionary.common.actions.updating : dictionary.messages.exchange.cancelExchange}
              </Button>
            ) : null}
          </div>

          <p className="text-xs text-slate-500">
            {dictionary.messages.thread.meetupSafelyBody}
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
          <h2 className="font-display text-2xl font-semibold text-slate-950">
            {dictionary.messages.exchange.title}
          </h2>
          <Badge className="bg-slate-950 text-white">
            {context.viewerTransaction?.state
              ? getExchangeStatusLabel(dictionary, context.viewerTransaction.state)
              : context.activeTransaction?.state
                ? getExchangeStatusLabel(dictionary, context.activeTransaction.state)
                : getListingStatusLabel(dictionary, listingStatus)}
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
            <p>{dictionary.messages.exchange.price}: {formatCurrency(context.viewerTransaction?.amount ?? listingPrice)}</p>
            <p>{dictionary.messages.exchange.meetupArea}: {context.viewerTransaction?.meetupSpot ?? dictionary.messages.exchange.meetupTbd}</p>
            <p>{dictionary.messages.exchange.meetupWindow}: {context.viewerTransaction?.meetupWindow ?? dictionary.messages.exchange.windowTbd}</p>
          </div>
        </div>

        {context.reservedForOtherBuyer ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {dictionary.messages.exchange.reservedForOtherBuyer}
          </div>
        ) : null}

        {listingStatus === "sold" || context.activeTransaction?.state === "completed" ? (
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {dictionary.messages.exchange.completedReviewInfo}
            <div className="mt-3">
              <Button asChild size="sm" variant="outline">
                <Link href="/app/my-purchases">{dictionary.messages.exchange.completedReviewCta}</Link>
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {canStartPurchase ? (
            <Button
              type="button"
              onClick={() => runAction(() => startPurchaseIntentAction(listingId))}
              disabled={isPending}
            >
              {isPending
                ? dictionary.messages.exchange.startingPurchase
                : dictionary.messages.exchange.startPurchase}
            </Button>
          ) : null}
          {context.viewerTransaction?.conversationId ? (
            <Button asChild type="button" variant="secondary">
              <Link href={`/app/messages/${context.viewerTransaction.conversationId}`}>
                {dictionary.common.actions.openPurchaseChat}
              </Link>
            </Button>
          ) : null}
          {canCancelOwnExchange && context.viewerTransaction ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!window.confirm(dictionary.messages.exchange.confirmBuyerCancel)) {
                  return;
                }

                runAction(() => cancelTransactionAction(context.viewerTransaction!.id));
              }}
              disabled={isPending}
            >
              {isPending ? dictionary.common.actions.updating : dictionary.messages.exchange.cancelRequest}
            </Button>
          ) : null}
        </div>

        <p className="text-xs text-slate-500">
          {dictionary.messages.exchange.noOnlinePayment}
        </p>
        {feedback ? <p className="text-sm font-medium text-emerald-700">{feedback}</p> : null}
        {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
