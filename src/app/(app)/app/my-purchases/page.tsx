import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { TransactionReviewForm } from "@/components/marketplace/transaction-review-form";
import { Button } from "@/components/ui/button";
import { getDictionaryForRequest } from "@/lib/i18n";
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
        getListingById(transaction.listingId),
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
                        {transaction.buyerId === user.id ? "Seller" : "Buyer"}:{" "}
                        <Link
                          href={`/app/profile?userId=${counterpart.id}`}
                          className="font-medium text-slate-900 underline-offset-4 hover:underline"
                        >
                          {counterpart.profile.fullName}
                        </Link>
                      </p>
                    ) : null}
                  </div>
                  <Badge>{transaction.state}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
                <div className="grid gap-3 md:grid-cols-2">
                  <p>Recorded value: {formatCurrency(transaction.amount)}</p>
                  <p>Meetup spot: {transaction.meetupSpot}</p>
                  <p>Meetup window: {transaction.meetupWindow}</p>
                  {transaction.reservedAt ? <p>Reserved at: {new Date(transaction.reservedAt).toLocaleString("en-GB")}</p> : null}
                  {transaction.completedAt ? <p>Completed at: {new Date(transaction.completedAt).toLocaleString("en-GB")}</p> : null}
                </div>

                {transaction.conversationId ? (
                  <Button asChild variant="outline">
                    <Link href={`/app/messages/${transaction.conversationId}`}>
                      Open conversation
                    </Link>
                  </Button>
                ) : null}

                {transaction.state === "completed" && counterpart ? (
                  hasAuthoredReview ? (
                    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      You already reviewed this exchange.
                    </div>
                  ) : (
                    <TransactionReviewForm
                      transactionId={transaction.id}
                      targetUserId={counterpart.id}
                    />
                  )
                ) : (
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Reviews unlock once the exchange is marked completed.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No exchanges yet"
          description="Once you start conversations and complete handoffs, they will appear here with review status."
        />
      )}
    </div>
  );
}
