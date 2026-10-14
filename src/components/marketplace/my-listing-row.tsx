"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Heart, MessageCircle, MoreHorizontal } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { ListingImage } from "@/components/marketplace/listing-image";
import { Button } from "@/components/ui/button";
import { getExchangeStatusLabel, getListingStatusLabel } from "@/lib/i18n-shared";
import { formatCurrency } from "@/lib/utils";
import { removeListingAction, updateListingStatusAction } from "@/server/actions/marketplace";
import type { Listing, SellerListingTransaction } from "@/types/domain";
import { friendlyError } from "@/lib/friendly-error";
import { MarkSoldSheet } from "@/components/marketplace/mark-sold-sheet";

const statusTone: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  reserved: "bg-amber-100 text-amber-900",
  sold: "bg-slate-900 text-white",
  archived: "bg-slate-200 text-slate-700",
  "pending-review": "bg-sky-100 text-sky-900",
  hidden: "bg-slate-200 text-slate-700"
};

/** One compact row per listing on My listings: the essentials, with actions in a menu. */
export function MyListingRow({
  listing,
  transaction
}: {
  listing: Listing;
  transaction?: SellerListingTransaction;
}) {
  const { dictionary } = useLocale();
  const copy = dictionary.listingRow;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [removed, setRemoved] = useState(false);
  const [showSold, setShowSold] = useState(false);
  const cover = listing.images.find((image) => image.isPrimary) ?? listing.images[0];

  if (removed) {
    return (
      <li className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
        {copy.removed}
      </li>
    );
  }

  const run = (task: () => Promise<{ success: boolean; message: string }>, onSuccess?: () => void) => {
    startTransition(async () => {
      setMessage(null);
      try {
        const result = await task();
        if (!result.success) {
          setMessage({ text: friendlyError(result.message, dictionary), ok: false });
          return;
        }
        onSuccess?.();
        router.refresh();
      } catch {
        setMessage({ text: copy.error, ok: false });
      }
    });
  };

  const canToggle = listing.status === "active" || listing.status === "archived";
  const canMarkSold = ["active", "reserved", "archived"].includes(listing.status);

  return (
    <li className={`rounded-2xl border border-slate-200 bg-white p-3 ${isPending ? "opacity-60" : ""}`}>
      <div className="flex gap-3">
        <Link
          href={`/app/listings/${listing.id}`}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100"
        >
          <ListingImage src={cover?.url} alt={cover?.alt ?? listing.title} sizes="80px" />
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-lg font-extrabold leading-6 text-slate-950">
              {formatCurrency(listing.price)}
            </p>
            <details className="relative">
              <summary
                aria-label={copy.moreActions}
                className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 [&::-webkit-details-marker]:hidden"
              >
                <MoreHorizontal className="h-5 w-5" />
              </summary>
              <div className="absolute right-0 z-30 mt-1 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 text-sm shadow-lg">
                <Link href={`/app/listings/${listing.id}`} className="block px-4 py-2.5 hover:bg-slate-50">
                  {dictionary.common.actions.viewListing}
                </Link>
                {canMarkSold ? (
                  <button
                    type="button"
                    disabled={isPending}
                    className="block w-full px-4 py-2.5 text-left font-semibold text-emerald-700 hover:bg-emerald-50"
                    onClick={(event) => {
                      event.currentTarget.closest("details")?.removeAttribute("open");
                      setShowSold(true);
                    }}
                  >
                    {dictionary.soldFlow.markSold}
                  </button>
                ) : null}
                {canToggle ? (
                  <button
                    type="button"
                    disabled={isPending}
                    className="block w-full px-4 py-2.5 text-left hover:bg-slate-50"
                    onClick={() =>
                      run(() =>
                        updateListingStatusAction(
                          listing.id,
                          listing.status === "active" ? "archived" : "active"
                        )
                      )
                    }
                  >
                    {listing.status === "active" ? copy.archive : copy.activate}
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={isPending}
                  className="block w-full px-4 py-2.5 text-left font-semibold text-rose-700 hover:bg-rose-50"
                  onClick={() => {
                    if (!window.confirm(copy.confirmRemove.replace("{title}", listing.title))) {
                      return;
                    }
                    run(() => removeListingAction(listing.id), () => setRemoved(true));
                  }}
                >
                  {dictionary.common.actions.removeListing}
                </button>
              </div>
            </details>
          </div>
          <p className="truncate text-sm text-slate-700">{listing.title}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className={`rounded-full px-2 py-0.5 font-semibold ${statusTone[listing.status] ?? statusTone.hidden}`}>
              {getListingStatusLabel(dictionary, listing.status)}
            </span>
            <span className="inline-flex items-center gap-1" title={copy.views}>
              <Eye className="h-3.5 w-3.5" aria-hidden="true" /> {listing.viewCount}
              <span className="sr-only">{copy.views}</span>
            </span>
            <span className="inline-flex items-center gap-1" title={copy.saves}>
              <Heart className="h-3.5 w-3.5" aria-hidden="true" /> {listing.saveCount}
              <span className="sr-only">{copy.saves}</span>
            </span>
            <span className="inline-flex items-center gap-1" title={copy.chats}>
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />{" "}
              {listing.analytics?.messagesReceived ?? 0}
              <span className="sr-only">{copy.chats}</span>
            </span>
          </div>
        </div>
      </div>
      {transaction ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
          <span>
            <span className="font-semibold text-slate-900">
              {getExchangeStatusLabel(dictionary, transaction.transaction.state)}
            </span>{" "}
            · {dictionary.myListings.buyerLabel}: {transaction.buyer.profile.fullName}
          </span>
          {transaction.transaction.conversationId ? (
            <Link
              href={`/app/messages/${transaction.transaction.conversationId}`}
              className="font-semibold text-emerald-700 hover:underline"
            >
              {dictionary.myListings.openExchangeChat}
            </Link>
          ) : null}
        </div>
      ) : null}
      {showSold ? (
        <MarkSoldSheet listingId={listing.id} onClose={() => setShowSold(false)} />
      ) : null}
      <div className="mt-3">
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link href={`/app/sell?listingId=${listing.id}`}>{dictionary.myListings.editListing}</Link>
        </Button>
      </div>
      {message ? (
        <p role="alert" className={`mt-2 text-xs ${message.ok ? "text-emerald-700" : "text-rose-700"}`}>
          {message.text}
        </p>
      ) : null}
    </li>
  );
}
