"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserX } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { friendlyError } from "@/lib/friendly-error";
import {
  getSoldCandidatesAction,
  markListingSoldAction,
  type SoldCandidate
} from "@/server/actions/marketplace";

/**
 * "Who bought it?" — the seller picks a chat (or "someone outside CampusSwap").
 * Picking a person records the sale and goes straight to rating them.
 */
export function MarkSoldSheet({
  listingId,
  onClose,
  onSold
}: {
  listingId: string;
  onClose: () => void;
  onSold?: () => void;
}) {
  const { dictionary } = useLocale();
  const copy = dictionary.soldFlow;
  const router = useRouter();
  const [candidates, setCandidates] = useState<SoldCandidate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getSoldCandidatesAction(listingId)
      .then((result) => {
        if (!cancelled) setCandidates(result.candidates);
      })
      .catch(() => {
        if (!cancelled) setCandidates([]);
      });
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const choose = (conversationId: string | null) => {
    startTransition(async () => {
      setError(null);
      try {
        const result = await markListingSoldAction(listingId, conversationId);
        if (!result.success) {
          setError(friendlyError(result.message, dictionary));
          return;
        }
        onSold?.();
        if (result.transactionId) {
          router.push(`/app/reviews/new/${result.transactionId}`);
          return;
        }
        onClose();
        router.refresh();
      } catch {
        setError(dictionary.listingRow.error);
      }
    });
  };

  const optionClass =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition hover:bg-slate-50 disabled:opacity-50";

  return (
    <div className="mt-3 space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3">
      <div>
        <p className="font-bold text-slate-950">{copy.title}</p>
        <p className="text-xs text-slate-600">{copy.body}</p>
      </div>
      <div className="space-y-1 rounded-xl bg-white p-1">
        {candidates === null ? (
          <p className="px-3 py-2.5 text-sm text-slate-500">{copy.loading}</p>
        ) : (
          <>
            {candidates.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-500">{copy.noChats}</p>
            ) : null}
            {candidates.map((candidate) => (
              <button
                key={candidate.conversationId}
                type="button"
                disabled={isPending}
                className={optionClass}
                onClick={() => choose(candidate.conversationId)}
              >
                <ProfileAvatar
                  userId={candidate.buyerId}
                  name={candidate.name}
                  src={candidate.avatar}
                  className="h-9 w-9"
                />
                <span className="font-semibold text-slate-900">{candidate.name}</span>
              </button>
            ))}
            <button
              type="button"
              disabled={isPending}
              className={optionClass}
              onClick={() => choose(null)}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <UserX className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-slate-700">{copy.outside}</span>
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="text-xs font-semibold text-slate-500 hover:underline"
      >
        {copy.cancel}
      </button>
      {error ? (
        <p role="alert" className="text-xs text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
