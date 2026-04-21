"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  useTransition,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  resumeTransactionCheckoutAction,
  reserveConversationBuyerAction,
  startPurchaseIntentAction
} from "@/server/actions/marketplace";
import {
  getExchangeStatusLabel,
  getListingStatusLabel
} from "@/lib/i18n-shared";
import { createOrderBreakdown } from "@/lib/payments/order-pricing";
import { formatCurrency } from "@/lib/utils";
import type {
  FulfillmentMethod,
  ListingStatus,
  ListingTransactionContext,
  ShippingAddressDetails,
  SellerStripeConnectStatus,
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

function isStripeCheckoutOrder(transaction?: Transaction) {
  return Boolean(
    transaction?.checkoutStatus ||
      transaction?.stripeCheckoutSessionId ||
      transaction?.stripePaymentIntentId
  );
}

function hasStripePaymentRecorded(transaction?: Transaction) {
  return transaction?.checkoutStatus === "paid" || Boolean(transaction?.paidAt);
}

function getSellerPayoutStatusLabel(
  dictionary: LocaleDictionary,
  status: Transaction["sellerPayoutStatus"] | undefined
) {
  switch (status) {
    case "paid_to_connected_account":
      return dictionary.messages.exchange.payoutTransferred;
    case "ready":
      return dictionary.messages.exchange.payoutReady;
    case "blocked":
    default:
      return dictionary.messages.exchange.payoutBlocked;
  }
}

interface ShippingAddressDraft {
  recipientFullName: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
}

function createShippingAddressDraft(
  value?: ShippingAddressDetails
): ShippingAddressDraft {
  return {
    recipientFullName: value?.recipientFullName ?? "",
    addressLine1: value?.addressLine1 ?? "",
    addressLine2: value?.addressLine2 ?? "",
    postalCode: value?.postalCode ?? "",
    city: value?.city ?? "",
    country: value?.country ?? "",
    phone: value?.phone ?? ""
  };
}

function isShippingDraftComplete(value: ShippingAddressDraft) {
  return Boolean(
    value.recipientFullName.trim() &&
      value.addressLine1.trim() &&
      value.postalCode.trim() &&
      value.city.trim() &&
      value.country.trim()
  );
}

function ShippingAddressCard({
  dictionary,
  shippingAddress
}: {
  dictionary: LocaleDictionary;
  shippingAddress: ShippingAddressDetails;
}) {
  return (
    <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {dictionary.messages.exchange.shippingAddressTitle}
      </p>
      <div className="mt-3 space-y-1 text-sm text-slate-700">
        <p className="font-semibold text-slate-950">{shippingAddress.recipientFullName}</p>
        <p>{shippingAddress.addressLine1}</p>
        {shippingAddress.addressLine2 ? <p>{shippingAddress.addressLine2}</p> : null}
        <p>{`${shippingAddress.postalCode} ${shippingAddress.city}`}</p>
        <p>{shippingAddress.country}</p>
        {shippingAddress.phone ? <p>{shippingAddress.phone}</p> : null}
      </div>
      <p className="mt-3 text-xs leading-6 text-slate-500">
        {dictionary.messages.exchange.shippingAddressDescription}
      </p>
    </div>
  );
}

function ShippingAddressForm({
  dictionary,
  shippingDraft,
  setShippingDraft
}: {
  dictionary: LocaleDictionary;
  shippingDraft: ShippingAddressDraft;
  setShippingDraft: Dispatch<SetStateAction<ShippingAddressDraft>>;
}) {
  const updateField =
    (field: keyof ShippingAddressDraft) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setShippingDraft((current) => ({
        ...current,
        [field]: value
      }));
    };

  return (
    <div className="rounded-[26px] border border-slate-200/80 bg-slate-50/80 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {dictionary.messages.exchange.shippingAddressTitle}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-xs font-medium text-slate-600">
            {dictionary.messages.exchange.recipientFullName}
          </span>
          <Input
            value={shippingDraft.recipientFullName}
            onChange={updateField("recipientFullName")}
            placeholder={dictionary.messages.exchange.recipientFullName}
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-xs font-medium text-slate-600">
            {dictionary.messages.exchange.addressLine1}
          </span>
          <Input
            value={shippingDraft.addressLine1}
            onChange={updateField("addressLine1")}
            placeholder={dictionary.messages.exchange.addressLine1}
          />
        </label>
        <label className="space-y-2 sm:col-span-2">
          <span className="text-xs font-medium text-slate-600">
            {dictionary.messages.exchange.addressLine2}
          </span>
          <Input
            value={shippingDraft.addressLine2}
            onChange={updateField("addressLine2")}
            placeholder={dictionary.messages.exchange.addressLine2}
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-600">
            {dictionary.messages.exchange.postalCode}
          </span>
          <Input
            value={shippingDraft.postalCode}
            onChange={updateField("postalCode")}
            placeholder={dictionary.messages.exchange.postalCode}
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-600">
            {dictionary.messages.exchange.city}
          </span>
          <Input
            value={shippingDraft.city}
            onChange={updateField("city")}
            placeholder={dictionary.messages.exchange.city}
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-600">
            {dictionary.messages.exchange.country}
          </span>
          <Input
            value={shippingDraft.country}
            onChange={updateField("country")}
            placeholder={dictionary.messages.exchange.country}
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-medium text-slate-600">
            {dictionary.messages.exchange.phoneOptional}
          </span>
          <Input
            value={shippingDraft.phone}
            onChange={updateField("phone")}
            placeholder={dictionary.messages.exchange.phoneOptional}
          />
        </label>
      </div>
    </div>
  );
}

function OrderSummary({
  dictionary,
  transaction,
  listingPrice,
  listingShippingCost,
  pickupArea,
  defaultFulfillmentMethod
}: {
  dictionary: LocaleDictionary;
  transaction?: Transaction;
  listingPrice: number;
  listingShippingCost: number;
  pickupArea: string;
  defaultFulfillmentMethod: FulfillmentMethod;
}) {
  const breakdown = createOrderBreakdown({
    itemAmount: transaction?.amount ?? listingPrice,
    shippingAmount:
      transaction?.shippingAmount ??
      (defaultFulfillmentMethod === "shipping" ? listingShippingCost : 0),
    platformFee:
      transaction && transaction.platformFee > 0
        ? transaction.platformFee
        : undefined
  });
  const itemAmount = transaction?.amount ?? breakdown.amount;
  const shippingAmount = transaction?.shippingAmount ?? breakdown.shipping_amount;
  const platformFee =
    transaction && transaction.platformFee > 0
      ? transaction.platformFee
      : breakdown.platform_fee;
  const sellerNetAmount =
    transaction && transaction.sellerNetAmount > 0
      ? transaction.sellerNetAmount
      : breakdown.seller_net_amount;
  const totalAmount =
    transaction && transaction.totalAmount > 0
      ? transaction.totalAmount
      : breakdown.total_amount;

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
              {formatCurrency(shippingAmount)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>{dictionary.messages.exchange.platformFee}</span>
            <span className="font-medium text-slate-950">{formatCurrency(platformFee)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>{dictionary.messages.exchange.sellerNetAmount}</span>
            <span className="font-medium text-slate-950">
              {formatCurrency(sellerNetAmount)}
            </span>
          </div>
          {transaction ? (
            <div className="flex items-center justify-between gap-3">
              <span>{dictionary.messages.exchange.payoutStatus}</span>
              <span className="font-medium text-slate-950">
                {getSellerPayoutStatusLabel(
                  dictionary,
                  transaction.sellerPayoutStatus
                )}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2">
            <span className="font-semibold text-slate-950">
              {dictionary.messages.exchange.totalAmount}
            </span>
            <span className="font-semibold text-slate-950">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-2 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>{dictionary.messages.exchange.fulfillmentMethod}</span>
          <span className="font-medium text-slate-950">
            {(transaction?.fulfillmentMethod ?? defaultFulfillmentMethod) === "shipping"
              ? dictionary.messages.exchange.shippingOption
              : dictionary.messages.exchange.pickupOption}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span>{dictionary.messages.exchange.meetupArea}</span>
          <span className="font-medium text-slate-950">
            {(transaction?.fulfillmentMethod ?? defaultFulfillmentMethod) === "shipping"
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
  sellerStripeStatus,
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
  sellerStripeStatus: SellerStripeConnectStatus;
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
  const defaultFulfillment = getDefaultFulfillmentMethod(
    listingPickupAvailable,
    listingShippingAvailable
  );
  const transactionFulfillment = transaction?.fulfillmentMethod ?? defaultFulfillment;
  const viewerFulfillment = viewerTransaction?.fulfillmentMethod ?? defaultFulfillment;
  const viewerShippingAddress = viewerTransaction?.shippingAddress;
  const [shippingDraft, setShippingDraft] = useState<ShippingAddressDraft>(
    createShippingAddressDraft(viewerShippingAddress)
  );
  const [showShippingForm, setShowShippingForm] = useState(
    listingShippingAvailable && !listingPickupAvailable && !viewerShippingAddress
  );
  const shippingDraftComplete = isShippingDraftComplete(shippingDraft);
  const buyerDisplayFulfillment =
    viewerTransaction?.fulfillmentMethod ??
    (showShippingForm && listingShippingAvailable ? "shipping" : defaultFulfillment);

  useEffect(() => {
    setShippingDraft(createShippingAddressDraft(viewerShippingAddress));
    if (viewerShippingAddress) {
      setShowShippingForm(false);
    }
  }, [viewerShippingAddress]);

  const runAction = (
    action: () => Promise<{
      success: boolean;
      message: string;
      conversationId?: string;
      checkoutUrl?: string;
    }>
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

        if (result.checkoutUrl) {
          window.location.assign(result.checkoutUrl);
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
    const stripeCheckoutOrder = isStripeCheckoutOrder(transaction);
    const stripePaymentRecorded = hasStripePaymentRecorded(transaction);
    const canReserve =
      Boolean(transaction?.conversationId) && transactionState === "pending";
    const canRelease = transactionState === "reserved";
    const canMarkPaid =
      transactionState
        ? ["pending", "reserved"].includes(transactionState) && !stripeCheckoutOrder
        : false;
    const canMarkReadyForPickup =
      Boolean(transactionState) &&
      transactionFulfillment === "pickup" &&
      (!stripeCheckoutOrder || stripePaymentRecorded) &&
      (transactionState ? ["reserved", "paid"].includes(transactionState) : false);
    const canMarkShipped =
      Boolean(transactionState) &&
      transactionFulfillment === "shipping" &&
      (!stripeCheckoutOrder || stripePaymentRecorded) &&
      (transactionState ? ["reserved", "paid"].includes(transactionState) : false);
    const canMarkDelivered =
      Boolean(transactionState) &&
      transactionFulfillment === "shipping" &&
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
            defaultFulfillmentMethod={transactionFulfillment}
          />

          {transaction?.fulfillmentMethod === "shipping" && transaction.shippingAddress ? (
            <ShippingAddressCard
              dictionary={dictionary}
              shippingAddress={transaction.shippingAddress}
            />
          ) : null}

          {!sellerStripeStatus.onboardingComplete ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
              <p>{dictionary.messages.exchange.completeSellerPayoutSetup}</p>
              <div className="mt-3">
                <Button asChild type="button" variant="outline">
                  <Link href="/app/settings">
                    {dictionary.messages.exchange.completeSellerPayoutSetupCta}
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}

          {stripeCheckoutOrder && !stripePaymentRecorded ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {dictionary.messages.exchange.paymentPendingSeller}
            </div>
          ) : null}

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
    listingStatus === "active" &&
    !viewerTransaction &&
    !context.reservedForOtherBuyer &&
    sellerStripeStatus.onboardingComplete;
  const viewerTransactionState = viewerTransaction?.state;
  const viewerStripeCheckoutOrder = isStripeCheckoutOrder(viewerTransaction);
  const viewerStripePaymentRecorded = hasStripePaymentRecorded(viewerTransaction);
  const canRetryCheckout =
    Boolean(viewerTransaction) &&
    viewerStripeCheckoutOrder &&
    !viewerStripePaymentRecorded &&
    viewerTransactionState !== "cancelled";
  const shippingAddressMissingForCheckout =
    viewerTransaction?.fulfillmentMethod === "shipping" && !viewerShippingAddress;
  const canCancelOwnExchange =
    Boolean(viewerTransactionState) &&
    !viewerStripePaymentRecorded &&
    !(viewerTransactionState
      ? ["completed", "cancelled"].includes(viewerTransactionState)
      : false);
  const canCompletePickupOrder =
    Boolean(viewerTransaction) &&
    viewerFulfillment === "pickup" &&
    viewerTransaction?.state === "ready-for-pickup";
  const canConfirmDelivered =
    Boolean(viewerTransaction) &&
    viewerFulfillment === "shipping" &&
    viewerTransaction?.state === "shipped";
  const canCompleteDeliveredOrder =
    Boolean(viewerTransaction) &&
    viewerFulfillment === "shipping" &&
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
          defaultFulfillmentMethod={buyerDisplayFulfillment}
        />

        {buyerDisplayFulfillment === "shipping" && viewerShippingAddress ? (
          <ShippingAddressCard
            dictionary={dictionary}
            shippingAddress={viewerShippingAddress}
          />
        ) : null}

        {listingShippingAvailable &&
        showShippingForm &&
        (canStartPurchase ||
          viewerTransaction?.fulfillmentMethod === "shipping") ? (
          <div className="space-y-3">
            <ShippingAddressForm
              dictionary={dictionary}
              shippingDraft={shippingDraft}
              setShippingDraft={setShippingDraft}
            />
            <Button
              type="button"
              onClick={() =>
                runAction(() =>
                  viewerTransaction?.fulfillmentMethod === "shipping"
                    ? resumeTransactionCheckoutAction({
                        transactionId: viewerTransaction.id,
                        shippingAddress: shippingDraft
                      })
                    : startPurchaseIntentAction({
                        listingId,
                        requestedFulfillmentMethod: "shipping",
                        shippingAddress: shippingDraft
                      })
                )
              }
              disabled={isPending || !shippingDraftComplete}
            >
              {isPending
                ? dictionary.messages.exchange.stripeRedirecting
                : viewerTransaction
                  ? dictionary.messages.exchange.continueShippingCheckout
                  : dictionary.messages.exchange.continueToStripe}
            </Button>
          </div>
        ) : null}

        {!sellerStripeStatus.onboardingComplete ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            {dictionary.messages.exchange.sellerPayoutsUnavailable}
          </div>
        ) : null}

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

        {viewerTransaction && viewerStripeCheckoutOrder && !viewerStripePaymentRecorded ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
            <p>
              {viewerTransaction.checkoutStatus === "cancelled"
                ? dictionary.messages.exchange.paymentCancelledBuyer
                : dictionary.messages.exchange.paymentPendingBuyer}
            </p>
            {shippingAddressMissingForCheckout ? (
              <p className="mt-2 text-sm text-amber-900">
                {dictionary.messages.exchange.shippingAddressMissing}
              </p>
            ) : null}
            {canRetryCheckout ? (
              <div className="mt-3">
                {shippingAddressMissingForCheckout || showShippingForm ? null : (
                  <Button
                    type="button"
                    onClick={() =>
                      runAction(() =>
                        resumeTransactionCheckoutAction({
                          transactionId: viewerTransaction.id
                        })
                      )
                    }
                    disabled={isPending}
                  >
                    {isPending
                      ? dictionary.messages.exchange.stripeRedirecting
                      : viewerTransaction.checkoutStatus === "cancelled"
                        ? dictionary.messages.exchange.retryPayment
                        : dictionary.messages.exchange.continueToStripe}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {viewerTransaction && viewerStripePaymentRecorded ? (
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {dictionary.messages.exchange.paymentPaidBuyer}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-3">
          {canStartPurchase && listingPickupAvailable && listingShippingAvailable ? (
            <>
              <Button
                type="button"
                onClick={() => {
                  setShowShippingForm(false);
                  runAction(() =>
                    startPurchaseIntentAction({
                      listingId,
                      requestedFulfillmentMethod: "pickup"
                    })
                  );
                }}
                disabled={isPending}
              >
                {isPending
                  ? dictionary.messages.exchange.startingPurchase
                  : `${dictionary.messages.exchange.startPurchase} - ${dictionary.messages.exchange.pickupOption}`}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowShippingForm(true)}
                disabled={isPending}
              >
                {`${dictionary.messages.exchange.startPurchase} - ${dictionary.messages.exchange.shippingOption}`}
              </Button>
            </>
          ) : null}
          {canStartPurchase && !(listingPickupAvailable && listingShippingAvailable) ? (
            <>
              {defaultFulfillment === "pickup" ? (
                <Button
                  type="button"
                  onClick={() =>
                    runAction(() =>
                      startPurchaseIntentAction({
                        listingId,
                        requestedFulfillmentMethod: "pickup"
                      })
                    )
                  }
                  disabled={isPending}
                >
                  {isPending
                    ? dictionary.messages.exchange.startingPurchase
                    : dictionary.messages.exchange.startPurchase}
                </Button>
              ) : null}
              {defaultFulfillment === "shipping" && !showShippingForm ? (
                <Button
                  type="button"
                  onClick={() => setShowShippingForm(true)}
                  disabled={isPending}
                >
                  {dictionary.messages.exchange.addShippingAddress}
                </Button>
              ) : null}
            </>
          ) : null}
          {viewerTransaction?.fulfillmentMethod === "shipping" &&
          viewerShippingAddress &&
          !viewerStripePaymentRecorded ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowShippingForm((current) => !current)}
              disabled={isPending}
            >
              {dictionary.messages.exchange.editShippingAddress}
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
