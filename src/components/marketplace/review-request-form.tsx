"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/shared/star-rating-input";
import { friendlyError } from "@/lib/friendly-error";
import { submitTransactionReviewAction } from "@/server/actions/marketplace";

const initialState = { success: false, message: "" };

/** The one-screen review people land on from the "How did it go?" notification. */
export function ReviewRequestForm({
  transactionId,
  targetUserId
}: {
  transactionId: string;
  targetUserId: string;
}) {
  const { dictionary } = useLocale();
  const copy = dictionary.reviewFlow;
  const [state, formAction, pending] = useActionState(submitTransactionReviewAction, initialState);

  if (state.success) {
    return (
      <div className="space-y-4 rounded-3xl bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-lg font-extrabold text-slate-950">{copy.thanksTitle}</p>
          <p className="text-sm text-slate-600">{copy.thanksBody}</p>
        </div>
        <Button asChild>
          <Link href="/app">{copy.backHome}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="transactionId" value={transactionId} />
      <input type="hidden" name="targetUserId" value={targetUserId} />
      <StarRatingInput
        name="rating"
        defaultValue={5}
        size="lg"
        labels={copy.stars}
        className="flex flex-col items-center"
      />
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-600">{dictionary.reviews.textLabel}</span>
          <span className="text-slate-400">{dictionary.reviews.textOptionalHint}</span>
        </div>
        <Textarea
          name="text"
          placeholder={dictionary.reviews.placeholder}
          className="min-h-[100px] border-slate-200 bg-white"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? dictionary.reviews.submitting : dictionary.reviews.leaveReview}
      </Button>
      {state.message ? (
        <p role="alert" className="text-center text-sm text-rose-700">
          {friendlyError(state.message, dictionary)}
        </p>
      ) : null}
    </form>
  );
}
