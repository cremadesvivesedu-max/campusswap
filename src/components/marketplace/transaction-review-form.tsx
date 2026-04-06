"use client";

import { useActionState } from "react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/shared/star-rating-input";
import { submitTransactionReviewAction } from "@/server/actions/marketplace";

const initialState = {
  success: false,
  message: ""
};

export function TransactionReviewForm({
  transactionId,
  targetUserId
}: {
  transactionId: string;
  targetUserId: string;
}) {
  const { dictionary } = useLocale();
  const [state, formAction, pending] = useActionState(
    submitTransactionReviewAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <input type="hidden" name="transactionId" value={transactionId} />
      <input type="hidden" name="targetUserId" value={targetUserId} />
      <label className="block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {dictionary.reviews.ratingLabel}
        </span>
        <StarRatingInput name="rating" defaultValue={5} />
      </label>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {dictionary.reviews.textLabel}
          </span>
          <span className="text-xs text-slate-400">
            {dictionary.reviews.textOptionalHint}
          </span>
        </div>
        <Textarea
          name="text"
          placeholder={dictionary.reviews.placeholder}
          className="min-h-[110px] border-slate-200 bg-white"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? dictionary.reviews.submitting : dictionary.reviews.leaveReview}
      </Button>
      {state.message ? (
        <p className={`text-xs ${state.success ? "text-emerald-700" : "text-rose-700"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
