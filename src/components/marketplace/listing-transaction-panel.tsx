"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLocale } from "@/components/providers/locale-provider";
import { OfferNegotiationPanel } from "@/components/marketplace/offer-negotiation-panel";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { StarRating } from "@/components/shared/star-rating";
import {
  cancelTransactionAction,
  completeTransactionAction,
  markTransactionDeliveredAction,
  markTransactionPaidAction,
  markTransactionReadyForPickupAction,
  markTransactionShippedAction,
  releaseReservationAction,
  reserveConversationBuyerAction,
  startPurchaseIntentAction
} from "@/server/actions/marketplace";
import {
  getExchangeStatusLabel,
  getListingStatusLabel
} from "@/lib/i18n-shared";
import { formatCurrency } from "@/lib/utils";
import type {
  FulfillmentMethod,
  ListingStatus,
  ListingTransactionContext,
  Transaction,
  User
} from "@/types/domain";

type LocaleDictionary = ReturnType<typeof useLocale>["dictionary"];

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

function getDefaultFulfillmentMethod(
  pickupAvailable: boolean,
  shippingAvailable: boolean
): FulfillmentMethod {
  if (!pickupAvailable && shippingAvailable) {
    return "shipping";
  }

  return "pickup";
}

function getFulfillmentLabel(
  dictionary: LocaleDictionary,
  method: FulfillmentMethod | undefined,
  pickupAvailable: boolean,
  shippingAvailable: boolean
) {
  const resolvedMethod =
    method ?? getDefaultFulfillmentMethod(pickupAvailable, shippingAvailable);

  if (pickupAvailable && shippingAvailable) {
    return resolvedMethod === "shipping"
      ? dictionary.messages.exchange.shippingOption
      : dictionary.messages.exchange.pickupOption;
  }

  return pickupAvailable
    ? dictionary.messages.exchange.pickupOnly
    : dictionary.messages.exchange.shippingOnly;
}

function OrderSummary({
  dictionary,
  transaction,
  listingPrice,
  listingShippingCost,
  pickupArea
}: {
  dictionary: LocaleDictionary;
  transaction?: Transaction;
  listingPrice: number;
  listingShippingCost: number;
  pickupArea: string;
}) {
  const itemAmount = transaction?.amount ?? listingPrice;
  const shippingAmount = transaction?.shippingAmount ?? 0;
  const platformFee = transaction?.platformFee ?? 0;
  const totalAmount =
    transaction?.totalAmount ?? itemAmount + shippingAmount + platformFee;

  const timelineRows = [
    {
      label: dictionary.messages.exchange.reservedAt,
      value: formatEventTime(transaction?.reservedAt)
    },
    {
      label: dictionary.messages.exchange.paidAt,
      value: formatEventTime(transaction?.paidAt)
    },
    {
      label: dictionary.messages.exchange.readyAt,
      value: formatEventTime(transaction?.readyAt)
    },
    {
      label: dictionary.messages.exchange.shippedAt,
      value: formatEventTime(transaction?.shippedAt)
    },
    {
      label: dictionary.messages.exchange.deliveredAt,
      value: formatEventTime(transaction?.deliveredAt)
    },
    {
      label: dictionary.messages.exchange.completedAt,
      value: formatEventTime(transaction?.completedAt)
    },
    {
      label: dictionary.messages.exchange.cancelledAt,
      value: formatEventTime(transaction?.cancelledAt)
    }
  ].filter((entry) => entry.value);

  return (
    <div className="space-y-4 rounded-[26px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.92))] p-5 shadow-sm">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {dictionary.messages.exchange.orderBreakdownTitle}
        </p>
        <div className="grid gap-2 text-sm text-slate-600">
          <div className="flex items-center justify-between gap-3">
            <span>{dictionary.messages.exchange.itemPrice}</span>
            <span className="font-medium text-slate-950">{formatCurrency(itemAmount)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>{dictionary.messages.exchange.shippingCost}</span>
            <span className="font-medium text-slate-950">
              {formatCurrency(transaction ? shippingAmount : listingShippingCost)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>{dictionary.messages.exchange.platformFee}</span>
            <span className="font-medium text-slate-950">{formatCurrency(platformFee)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2">
            <span className="font-semibold text-slate-950">
              {dictionary.messages.exchange.totalAmount}
            </span>
            <span className="font-semibold text-slate-950">
              {formatCurrency(transaction ? totalAmount : listingPrice + listingShippingCost)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-2 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>{dictionary.messages.exchange.fulfillmentMethod}</span>
          <span className="font-medium text-slate-950">
            {transaction?.fulfillmentMethod === "shipping"
              ? dictionary.messages.exchange.shippingOption
              : dictionary.messages.exchange.pickupOption}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>{dictionary.messages.exchange.meetupArea}</span>
          <span className="font-medium text-slate-950">
            {transaction?.fulfillmentMethod === "shipping"
              ? dictionary.messages.exchange.shippingOption
              : pickupArea}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>{dictionary.messages.exchange.meetupWindow}</span>
          <span className="font-medium text-slate-950">
            {transaction?.meetupWindow ?? dictionary.messages.exchange.windowTbd}
          </span>
        </div>
      </div>

      {timelineRows.length ? (
        <div className="grid gap-1 border-t border-slate-200 pt-3 text-xs text-slate-500">
          {timelineRows.map((entry) => (
            <div key={entry.label} className="flex items-center justify-between gap-3">
              <span>{entry.label}</span>
              <span>{entry.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ListingTransactionPanel({
  listingId,
  listingPrice,
  listingStatus,
  listingPickupArea,
  listingPickupAvailable,
  listingShippingAvailable,
  listingShippingCost,
  currentUserId,
  seller,
  context,
  isOwnListing
}: {
  listingId: string;
  listingPrice: number;
  listingStatus: ListingStatus;
  listingPickupArea: string;
  listingPickupAvailable: boolean;
  listingShippingAvailable: boolean;
  listingShippingCost: number;
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
  const viewerTransaction = context.viewerTransaction;
  const buyer = context.buyer;
  const currentFulfillment =
    transaction?.fulfillmentMethod ??
    getDefaultFulfillmentMethod(listingPickupAvailable, listingShippingAvailable);

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
    const transactionState = transaction?.state;
    const transactionId = transaction?.id;
    const canReserve =
      Boolean(transaction?.conversationId) && transactionState === "pending";
    const canRelease = transactionState === "reserved";
    const canMarkPaid =
      transactionState ? ["pending", "reserved"].includes(transactionState) : false;
    const canMarkReadyForPickup =
      Boolean(transactionState) &&
      currentFulfillment === "pickup" &&
      (transactionState ? ["reserved", "paid"].includes(transactionState) : false);
    const canMarkShipped =
      Boolean(transactionState) &&
      currentFulfillment === "shipping" &&
      (transactionState ? ["reserved", "paid"].includes(transactionState) : false);
    const canMarkDelivered =
      Boolean(transactionState) &&
      currentFulfillment === "shipping" &&
      transactionState === "shipped";
    const canComplete =
      Boolean(transactionState) &&
      (transactionState
        ? ["ready-for-pickup", "delivered"].includes(transactionState)
        : false);

    return (
      <Card className="border-slate-200/80 bg-white shadow-sm">
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
            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4">
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
            </div>
          ) : (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {dictionary.messages.exchange.noBuyerLinked}
            </div>
          )}

          <OrderSummary
            dictionary={dictionary}
            transaction={transaction}
            listingPrice={listingPrice}
            listingShippingCost={listingShippingCost}
            pickupArea={listingPickupArea}
          />

          <div className="flex flex-wrap gap-2 rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-3">
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
                {isPending
                  ? dictionary.common.actions.updating
                  : dictionary.messages.exchange.reserveForBuyer}
              </Button>
            ) : null}
            {canMarkPaid && transaction ? (
              <Button
                type="button"
                onClick={() => runAction(() => markTransactionPaidAction(transactionId!))}
                disabled={isPending}
              >
                {isPending
                  ? dictionary.common.actions.updating
                  : dictionary.messages.exchange.markPaid}
              </Button>
            ) : null}
            {canMarkReadyForPickup && transaction ? (
              <Button
                type="button"
                onClick={() =>
                  runAction(() => markTransactionReadyForPickupAction(transactionId!))
                }
                disabled={isPending}
              >
                {isPending
                  ? dictionary.common.actions.updating
                  : dictionary.messages.exchange.markReadyForPickup}
              </Button>
            ) : null}
            {canMarkShipped && transaction ? (
              <Button
                type="button"
                onClick={() => runAction(() => markTransactionShippedAction(transactionId!))}
                disabled={isPending}
              >
                {isPending
                  ? dictionary.common.actions.updating
                  : dictionary.messages.exchange.markShipped}
              </Button>
            ) : null}
            {canMarkDelivered && transaction ? (
              <Button
                type="button"
                onClick={() => runAction(() => markTransactionDeliveredAction(transactionId!))}
                disabled={isPending}
              >
                {isPending
                  ? dictionary.common.actions.updating
                  : dictionary.messages.exchange.markDelivered}
              </Button>
            ) : null}
            {canRelease && transaction ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => runAction(() => releaseReservationAction(transactionId!))}
                disabled={isPending}
              >
                {isPending
                  ? dictionary.common.actions.updating
                  : dictionary.messages.exchange.releaseReservation}
              </Button>
            ) : null}
            {canComplete && transaction ? (
              <Button
                type="button"
                onClick={() => runAction(() => completeTransactionAction(transaction.id))}
                disabled={isPending}
              >
                {isPending
                  ? dictionary.common.actions.updating
                  : dictionary.messages.exchange.completeOrder}
              </Button>
            ) : null}
            {transaction ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!window.confirm(dictionary.messages.exchange.confirmCancel)) {
                    return;
                  }

                  runAction(() => cancelTransactionAction(transaction.id));
                }}
                disabled={isPending}
              >
                {isPending
                  ? dictionary.common.actions.updating
                  : dictionary.messages.exchange.cancelExchange}
              </Button>
            ) : null}
          </div>

          <p className="rounded-[20px] bg-slate-50/70 px-4 py-3 text-xs text-slate-500">
            {dictionary.messages.thread.meetupSafelyBody}
          </p>
          <OfferNegotiationPanel
            listingId={listingId}
            listingPrice={listingPrice}
            sellerId={seller.id}
            currentUserId={currentUserId}
            latestOffer={context.latestOffer}
            transaction={transaction}
            conversationId={transaction?.conversationId}
          />
          {feedback ? (
            <p className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {feedback}
            </p>
          ) : null}
          {error ? (
            <p className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const canStartPurchase =
    listingStatus === "active" && !viewerTransaction && !context.reservedForOtherBuyer;
  const viewerTransactionState = viewerTransaction?.state;
  const canCancelOwnExchange =
    Boolean(viewerTransactionState) &&
    !(viewerTransactionState
      ? ["completed", "cancelled"].includes(viewerTransactionState)
      : false);
  const canCompletePickupOrder =
    Boolean(viewerTransaction) &&
    currentFulfillment === "pickup" &&
    viewerTransaction?.state === "ready-for-pickup";
  const canConfirmDelivered =
    Boolean(viewerTransaction) &&
    currentFulfillment === "shipping" &&
    viewerTransaction?.state === "shipped";
  const canCompleteDeliveredOrder =
    Boolean(viewerTransaction) &&
    currentFulfillment === "shipping" &&
    viewerTransaction?.state === "delivered";

  return (
    <Card className="border-slate-200/80 bg-white shadow-sm">
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
        <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4">
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
        </div>

        <OrderSummary
          dictionary={dictionary}
          transaction={context.viewerTransaction ?? context.activeTransaction}
          listingPrice={listingPrice}
          listingShippingCost={listingShippingCost}
          pickupArea={listingPickupArea}
        />

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
                <Link href="/app/my-purchases">
                  {dictionary.messages.exchange.completedReviewCta}
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-3">
          {canStartPurchase && listingPickupAvailable && listingShippingAvailable ? (
            <>
              <Button
                type="button"
                onClick={() =>
                  runAction(() => startPurchaseIntentAction(listingId, "pickup"))
                }
                disabled={isPending}
              >
                {isPending
                  ? dictionary.messages.exchange.startingPurchase
                  : `${dictionary.messages.exchange.startPurchase} - ${dictionary.messages.exchange.pickupOption}`}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  runAction(() => startPurchaseIntentAction(listingId, "shipping"))
                }
                disabled={isPending}
              >
                {isPending
                  ? dictionary.messages.exchange.startingPurchase
                  : `${dictionary.messages.exchange.startPurchase} - ${dictionary.messages.exchange.shippingOption}`}
              </Button>
            </>
          ) : null}
          {canStartPurchase && !(listingPickupAvailable && listingShippingAvailable) ? (
            <Button
              type="button"
              onClick={() =>
                runAction(() =>
                  startPurchaseIntentAction(
                    listingId,
                    getDefaultFulfillmentMethod(
                      listingPickupAvailable,
                      listingShippingAvailable
                    )
                  )
                )
              }
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
          {canConfirmDelivered && context.viewerTransaction ? (
            <Button
              type="button"
              onClick={() =>
                runAction(() => markTransactionDeliveredAction(context.viewerTransaction!.id))
              }
              disabled={isPending}
            >
              {isPending
                ? dictionary.common.actions.updating
                : dictionary.messages.exchange.markDelivered}
            </Button>
          ) : null}
          {(canCompletePickupOrder || canCompleteDeliveredOrder) && context.viewerTransaction ? (
            <Button
              type="button"
              onClick={() => runAction(() => completeTransactionAction(context.viewerTransaction!.id))}
              disabled={isPending}
            >
              {isPending
                ? dictionary.common.actions.updating
                : dictionary.messages.exchange.completeOrder}
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
              {isPending
                ? dictionary.common.actions.updating
                : dictionary.messages.exchange.cancelRequest}
            </Button>
          ) : null}
        </div>

        <p className="rounded-[20px] bg-slate-50/70 px-4 py-3 text-xs text-slate-500">
          {dictionary.messages.exchange.noOnlinePayment}
        </p>
        <OfferNegotiationPanel
          listingId={listingId}
          listingPrice={listingPrice}
          sellerId={seller.id}
          currentUserId={currentUserId}
          latestOffer={context.latestOffer}
          transaction={viewerTransaction ?? context.activeTransaction}
          conversationId={viewerTransaction?.conversationId}
        />
        {feedback ? (
          <p className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {feedback}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
