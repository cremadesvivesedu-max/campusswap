import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingImage } from "@/components/marketplace/listing-image";
import { ReviewRequestForm } from "@/components/marketplace/review-request-form";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { Button } from "@/components/ui/button";
import { getDictionaryForRequest } from "@/lib/i18n";
import {
  getCurrentUser,
  getListingById,
  getReviewsForUser,
  getTransactionsForUser,
  getUserById
} from "@/server/queries/marketplace";

// Landing page for the "How did it go? ⭐" notification: who, what, and five big stars.
export default async function NewReviewPage({
  params
}: {
  params: Promise<{ transactionId: string }>;
}) {
  const { transactionId } = await params;
  const user = await getCurrentUser();
  const [transactions, reviews, dictionary] = await Promise.all([
    getTransactionsForUser(user.id),
    getReviewsForUser(user.id),
    getDictionaryForRequest()
  ]);
  const transaction = transactions.find((item) => item.id === transactionId);

  if (!transaction) {
    notFound();
  }

  const copy = dictionary.reviewFlow;
  const isBuyer = transaction.buyerId === user.id;
  const counterpartId = isBuyer ? transaction.sellerId : transaction.buyerId;
  const [listing, counterpart] = await Promise.all([
    getListingById(transaction.listingId, { includeRemoved: true }),
    getUserById(counterpartId)
  ]);
  const alreadyReviewed = reviews.some(
    (review) => review.transactionId === transaction.id && review.authorId === user.id
  );
  const cover = listing?.images.find((image) => image.isPrimary) ?? listing?.images[0];
  const name = counterpart?.profile.fullName ?? "CampusSwap";

  return (
    <div className="mx-auto max-w-md space-y-6 py-4">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-extrabold text-slate-950">{copy.title}</h1>
        <div className="flex items-center justify-center gap-3">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-slate-100">
            <ListingImage src={cover?.url} alt={cover?.alt ?? listing?.title ?? ""} sizes="64px" />
          </div>
          {counterpart ? (
            <ProfileAvatar
              userId={counterpart.id}
              name={name}
              src={counterpart.avatar}
              className="h-16 w-16"
            />
          ) : null}
        </div>
        <p className="text-sm text-slate-600">
          {isBuyer ? copy.asBuyer : copy.asSeller} <span className="font-semibold text-slate-950">{name}</span>
          {listing ? <> · {listing.title}</> : null}
        </p>
      </div>

      {transaction.state !== "completed" ? (
        <Notice title={copy.notReadyTitle} body={copy.notReadyBody} cta={copy.backHome} />
      ) : alreadyReviewed ? (
        <Notice title={copy.alreadyTitle} body={copy.alreadyBody} cta={copy.backHome} />
      ) : (
        <div className="rounded-3xl bg-white p-5">
          <ReviewRequestForm transactionId={transaction.id} targetUserId={counterpartId} />
        </div>
      )}
    </div>
  );
}

function Notice({ title, body, cta }: { title: string; body: string; cta: string }) {
  return (
    <div className="space-y-3 rounded-3xl bg-white p-6 text-center">
      <p className="font-bold text-slate-950">{title}</p>
      <p className="text-sm text-slate-600">{body}</p>
      <Button asChild variant="outline">
        <Link href="/app">{cta}</Link>
      </Button>
    </div>
  );
}
