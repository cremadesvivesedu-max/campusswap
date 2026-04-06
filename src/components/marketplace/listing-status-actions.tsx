"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/providers/locale-provider";
import { getExchangeStatusLabel } from "@/lib/i18n-shared";
import { updateListingStatusAction } from "@/server/actions/marketplace";
import type { ListingStatus, SellerListingTransaction } from "@/types/domain";

export function ListingStatusActions({
  listingId,
  currentStatus,
  transaction
}: {
  listingId: string;
  currentStatus: ListingStatus;
  transaction?: SellerListingTransaction;
}) {
  const { dictionary } = useLocale();
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<ListingStatus | null>(null);
  const [isPending, startTransition] = useTransition();
  const statusOptions: { value: ListingStatus; label: string }[] = [
    { value: "active", label: dictionary.myListings.statusOptions.active },
    { value: "archived", label: dictionary.myListings.statusOptions.archived }
  ];

  return (
    <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {dictionary.myListings.statusTitle}
      </p>
      <p className="text-sm leading-6 text-slate-600">
        {dictionary.myListings.statusDescription}
      </p>
      {transaction ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-slate-950 text-white">
              {getExchangeStatusLabel(dictionary, transaction.transaction.state)}
            </Badge>
            <span>
              {dictionary.myListings.buyerLabel}: {transaction.buyer.profile.fullName}
            </span>
          </div>
          {transaction.transaction.conversationId ? (
            <Link
              href={`/app/messages/${transaction.transaction.conversationId}`}
              className="mt-2 inline-flex text-sm font-semibold text-slate-950 underline-offset-4 hover:underline"
            >
              {dictionary.myListings.openExchangeChat}
            </Link>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={currentStatus === option.value ? "primary" : "outline"}
            disabled={isPending && pendingStatus === option.value}
            onClick={() => {
              startTransition(async () => {
                setPendingStatus(option.value);
                const result = await updateListingStatusAction(listingId, option.value);
                setFeedback(result.message);

                if (result.success) {
                  router.refresh();
                }

                setPendingStatus(null);
              });
            }}
          >
            {isPending && pendingStatus === option.value
              ? dictionary.common.actions.updating
              : option.label}
          </Button>
        ))}
      </div>
      {feedback ? <p className="text-xs text-slate-500">{feedback}</p> : null}
    </div>
  );
}
