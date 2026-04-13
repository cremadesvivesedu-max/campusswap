import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { TransactionReviewForm } from "@/components/marketplace/transaction-review-form";
import { Button } from "@/components/ui/button";
import {
  getDictionaryForRequest,
  getExchangeStatusLabel
} from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import {
  getCurrentUser,
  getListingById,
  getReviewsForUser,
  getTransactionsForUser,
  getUserById
} from "@/server/queries/marketplace";

export default async function MyPurchasesPage() {
  const user = await getCurrentUser();
  const [transactions, reviews, dictionary] = await Promise.all([
    getTransactionsForUser(user.id),
    getReviewsForUser(user.id),
    getDictionaryForRequest()
  ]);

  const authoredReviewIds = new Set(
    reviews
      .filter((review) => review.authorId === user.id)
      .map((review) => review.transactionId)
  );

  const detailedTransactions = await Promise.all(
    transactions.map(async (transaction) => {
      const counterpartId =
        transaction.buyerId === user.id ? transaction.sellerId : transaction.buyerId;
      const [listing, counterpart] = await Promise.all([
        getListingById(transaction.listingId, { includeRemoved: true }),
        getUserById(counterpartId)
      ]);

      return {
        transaction,
        listing,
        counterpart,
        hasAuthoredReview: authoredReviewIds.has(transaction.id)
      };
    })
  );

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={dictionary.myPurchases.eyebrow}
        title={dictionary.myPurchases.title}
        description={dictionary.myPurchases.description}
      />

      {detailedTransactions.length ? (
        <div className="space-y-4">
          {detailedTransactions.map(({ transaction, listing, counterpart, hasAuthoredReview }) => (
            <Card key={transaction.id} className="bg-white">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="font-display text-2xl font-semibold text-slate-950">
                      {listing?.title ?? transaction.listingId}
                    </h2>
                    {counterpart ? (
                      <p className="text-sm text-slate-600">
                        {transaction.buyerId === user.id
                          ? dictionary.myPurchases.sellerLabel
                          : dictionary.myPurchases.buyerLabel}
                        :{" "}
                        <Link
                          href={`/app/profile?userId=${counterpart.id}`}
                          className="font-medium text-slate-900 underline-offset-4 hover:underline"
                        >
                          {counterpart.profile.fullName}
                        </Link>
                      </p>
                    ) : null}
                  </div>
                  <Badge>{getExchangeStatusLabel(dictionary, transaction.state)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
                <div className="grid gap-3 md:grid-cols-2">
                  <p>
                    {dictionary.myPurchases.recordedValue}:{" "}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p>
                    {dictionary.myPurchases.fulfillmentMethod}:{" "}
                    {transaction.fulfillmentMethod === "shipping"
                      ? dictionary.messages.exchange.shippingOption
                      : dictionary.messages.exchange.pickupOption}
                  </p>
                  <p>
                    {dictionary.myPurchases.meetupSpot}: {transaction.meetupSpot}
                  </p>
                  <p>
                    {dictionary.myPurchases.meetupWindow}: {transaction.meetupWindow}
                  </p>
                  <p>
                    {dictionary.myPurchases.shippingAmount}:{" "}
                    {formatCurrency(transaction.shippingAmount)}
                  </p>
                  <p>
                    {dictionary.myPurchases.totalAmount}:{" "}
                    {formatCurrency(transaction.totalAmount)}
                  </p>
                  {transaction.reservedAt ? (
                    <p>
                      {dictionary.myPurchases.reservedAt}:{" "}
                      {new Date(transaction.reservedAt).toLocaleString("en-GB")}
                    </p>
                  ) : null}
                  {transaction.paidAt ? (
                    <p>
                      {dictionary.myPurchases.paidAt}:{" "}
                      {new Date(transaction.paidAt).toLocaleString("en-GB")}
                    </p>
                  ) : null}
                  {transaction.readyAt ? (
                    <p>
                      {dictionary.myPurchases.readyAt}:{" "}
                      {new Date(transaction.readyAt).toLocaleString("en-GB")}
                    </p>
                  ) : null}
                  {transaction.shippedAt ? (
                    <p>
                      {dictionary.myPurchases.shippedAt}:{" "}
                      {new Date(transaction.shippedAt).toLocaleString("en-GB")}
                    </p>
                  ) : null}
                  {transaction.deliveredAt ? (
                    <p>
                      {dictionary.myPurchases.deliveredAt}:{" "}
                      {new Date(transaction.deliveredAt).toLocaleString("en-GB")}
                    </p>
                  ) : null}
                  {transaction.completedAt ? (
                    <p>
                      {dictionary.myPurchases.completedAt}:{" "}
                      {new Date(transaction.completedAt).toLocaleString("en-GB")}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {dictionary.myPurchases.orderBreakdown}
                  </p>
                  <div className="mt-3 grid gap-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-3">
                      <span>{dictionary.messages.exchange.itemPrice}</span>
                      <span className="font-medium text-slate-950">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>{dictionary.myPurchases.shippingAmount}</span>
                      <span className="font-medium text-slate-950">
                        {formatCurrency(transaction.shippingAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span>{dictionary.myPurchases.platformFee}</span>
                      <span className="font-medium text-slate-950">
                        {formatCurrency(transaction.platformFee)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2">
                      <span className="font-semibold text-slate-950">
                        {dictionary.myPurchases.totalAmount}
                      </span>
                      <span className="font-semibold text-slate-950">
                        {formatCurrency(transaction.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {transaction.conversationId ? (
                  <Button asChild variant="outline">
                    <Link href={`/app/messages/${transaction.conversationId}`}>
                      {dictionary.myPurchases.openConversation}
                    </Link>
                  </Button>
                ) : null}

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {dictionary.support.orderHelpTitle}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/app/support?type=purchase-dispute&transactionId=${transaction.id}${listing ? `&listingId=${listing.id}` : ""}${transaction.conversationId ? `&conversationId=${transaction.conversationId}` : ""}${counterpart ? `&targetUserId=${counterpart.id}` : ""}`}
                      >
                        {dictionary.support.purchaseDisputeCta}
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/app/support?type=payment-help&transactionId=${transaction.id}${listing ? `&listingId=${listing.id}` : ""}${transaction.conversationId ? `&conversationId=${transaction.conversationId}` : ""}${counterpart ? `&targetUserId=${counterpart.id}` : ""}`}
                      >
                        {dictionary.support.paymentHelpCta}
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link
                        href={`/app/support?type=shipping-help&transactionId=${transaction.id}${listing ? `&listingId=${listing.id}` : ""}${transaction.conversationId ? `&conversationId=${transaction.conversationId}` : ""}${counterpart ? `&targetUserId=${counterpart.id}` : ""}`}
                      >
                        {dictionary.support.shippingHelpCta}
                      </Link>
                    </Button>
                  </div>
                </div>

                {transaction.state === "completed" && counterpart ? (
                  hasAuthoredReview ? (
                    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      {dictionary.myPurchases.alreadyReviewed}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700">
                        {dictionary.reviews.leaveReview}:{" "}
                        {transaction.buyerId === user.id
                          ? dictionary.myPurchases.sellerLabel
                          : dictionary.myPurchases.buyerLabel}{" "}
                        {counterpart.profile.fullName}
                      </p>
                      <TransactionReviewForm
                        transactionId={transaction.id}
                        targetUserId={counterpart.id}
                      />
                    </div>
                  )
                ) : (
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {dictionary.myPurchases.reviewsUnlock}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={dictionary.myPurchases.emptyTitle}
          description={dictionary.myPurchases.emptyDescription}
        />
      )}
    </div>
  );
}
