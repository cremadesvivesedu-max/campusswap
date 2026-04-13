"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitSupportEntryAction } from "@/server/actions/marketplace";
import type { SupportTicketType } from "@/types/domain";

const initialState = {
  success: false,
  message: ""
};

interface SupportEntryFormProps {
  type: SupportTicketType;
  title: string;
  description: string;
  detailsLabel: string;
  detailsPlaceholder: string;
  subjectLabel: string;
  subjectPlaceholder: string;
  submitLabel: string;
  submittingLabel: string;
  contextLabel: string;
  contextSummary?: string;
  listingId?: string;
  conversationId?: string;
  transactionId?: string;
  targetUserId?: string;
}

export function SupportEntryForm({
  type,
  title,
  description,
  detailsLabel,
  detailsPlaceholder,
  subjectLabel,
  subjectPlaceholder,
  submitLabel,
  submittingLabel,
  contextLabel,
  contextSummary,
  listingId,
  conversationId,
  transactionId,
  targetUserId
}: SupportEntryFormProps) {
  const [state, formAction, pending] = useActionState(
    submitSupportEntryAction,
    initialState
  );
  const needsSubject = !type.startsWith("report-");

  return (
    <form action={formAction} className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="type" value={type} />
      {listingId ? <input type="hidden" name="listingId" value={listingId} /> : null}
      {conversationId ? <input type="hidden" name="conversationId" value={conversationId} /> : null}
      {transactionId ? <input type="hidden" name="transactionId" value={transactionId} /> : null}
      {targetUserId ? <input type="hidden" name="targetUserId" value={targetUserId} /> : null}

      <div className="space-y-2">
        <h2 className="font-display text-2xl font-semibold text-slate-950">{title}</h2>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      {contextSummary ? (
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {contextLabel}
          </p>
          <p className="mt-2 font-medium text-slate-950">{contextSummary}</p>
        </div>
      ) : null}

      {needsSubject ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">{subjectLabel}</span>
          <Input
            name="subject"
            placeholder={subjectPlaceholder}
            maxLength={200}
          />
        </label>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-700">{detailsLabel}</span>
        <Textarea
          name="details"
          placeholder={detailsPlaceholder}
          className="min-h-[140px] border-slate-200 bg-white"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? submittingLabel : submitLabel}
        </Button>
        {state.message ? (
          <p className={`text-sm ${state.success ? "text-emerald-700" : "text-rose-700"}`}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
