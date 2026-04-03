"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateListingStatusAction } from "@/server/actions/marketplace";
import type { ListingStatus } from "@/types/domain";

const statusOptions: { value: ListingStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "reserved", label: "Reserve" },
  { value: "sold", label: "Sold" },
  { value: "archived", label: "Archive" }
];

export function ListingStatusActions({
  listingId,
  currentStatus
}: {
  listingId: string;
  currentStatus: ListingStatus;
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
