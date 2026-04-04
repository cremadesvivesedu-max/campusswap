"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateListingStatusAction } from "@/server/actions/marketplace";
import type { ListingStatus, SellerListingTransaction } from "@/types/domain";

const statusOptions: { value: ListingStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archive" }
];

export function ListingStatusActions({
  listingId,
  currentStatus,
  transaction
}: {
  listingId: string;
  currentStatus: ListingStatus;
  transaction?: SellerListingTransaction;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<ListingStatus | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-3 rounded-[24px] border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        Listing status
      </p>
      <p className="text-sm leading-6 text-slate-600">
        Active and archived states are managed here. Reservation and sold status now come from buyer-linked exchange flows.
      </p>
      {transaction ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-slate-950 text-white">{transaction.transaction.state}</Badge>
            <span>Buyer: {transaction.buyer.profile.fullName}</span>
          </div>
          {transaction.transaction.conversationId ? (
            <Link
              href={`/app/messages/${transaction.transaction.conversationId}`}
              className="mt-2 inline-flex text-sm font-semibold text-slate-950 underline-offset-4 hover:underline"
            >
              Open exchange chat
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
              ? "Updating..."
              : option.label}
          </Button>
        ))}
      </div>
      {feedback ? <p className="text-xs text-slate-500">{feedback}</p> : null}
    </div>
  );
}
