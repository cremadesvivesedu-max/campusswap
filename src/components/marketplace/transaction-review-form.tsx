"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
          Rating
        </span>
        <select
          name="rating"
          defaultValue="5"
          className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900"
        >
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>
      </label>
      <Textarea
        name="text"
        placeholder="Describe the handoff, communication, and whether the item matched the listing."
        className="min-h-[110px] border-slate-200 bg-white"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Leave review"}
      </Button>
      {state.message ? (
        <p className={`text-xs ${state.success ? "text-emerald-700" : "text-rose-700"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
