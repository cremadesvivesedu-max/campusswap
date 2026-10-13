"use client";

import { useActionState, useState } from "react";
import { CalendarClock, Link2, Share2 } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { daysUntilMoveOut, formatMoveOutCountdown } from "@/features/profile/moving-sale";
import { friendlyError } from "@/lib/friendly-error";
import { updateMoveOutDateAction } from "@/server/actions/account";

interface MovingSaleCardProps {
  sellerId: string;
  initialMoveOutDate: string | null;
}

/** "Moving out?" card on My listings: set the moving day and share one link with everything. */
export function MovingSaleCard({ sellerId, initialMoveOutDate }: MovingSaleCardProps) {
  const { dictionary } = useLocale();
  const copy = dictionary.movingSale;
  const [state, action, pending] = useActionState(updateMoveOutDateAction, {
    success: false,
    message: "",
    moveOutDate: initialMoveOutDate
  });
  const [copied, setCopied] = useState(false);
  const moveOutDate = state.success ? state.moveOutDate ?? null : initialMoveOutDate;
  const daysLeft = daysUntilMoveOut(moveOutDate);
  const today = new Date().toISOString().slice(0, 10);

  const shareUrl = () => `${window.location.origin}/m/${sellerId}`;
  const feedback =
    state.message === "saved"
      ? copy.saved
      : state.message === "cleared"
        ? copy.cleared
        : state.message === "invalid-date"
          ? copy.invalidDate
          : state.message
            ? friendlyError(state.message, dictionary)
            : "";

  return (
    <section className="space-y-4 rounded-[24px] border border-sky-200 bg-sky-50/70 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <CalendarClock className="mt-1 h-6 w-6 shrink-0 text-sky-700" aria-hidden="true" />
        <div className="space-y-1">
          <h2 className="font-display text-xl font-semibold text-slate-950">{copy.cardTitle}</h2>
          <p className="text-sm leading-6 text-slate-600">{copy.cardBody}</p>
        </div>
      </div>
      {daysLeft !== null ? (
        <p className="rounded-2xl bg-white px-4 py-3 text-base font-semibold text-sky-900">
          {formatMoveOutCountdown(daysLeft, copy)}
        </p>
      ) : null}
      <form action={action} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 space-y-1 text-sm font-medium text-slate-700">
          <span>{copy.dateLabel}</span>
          <Input
            type="date"
            name="moveOutDate"
            min={today}
            defaultValue={moveOutDate ?? ""}
            required
          />
        </label>
        <Button type="submit" disabled={pending}>
          {copy.save}
        </Button>
        {moveOutDate ? (
          <Button
            type="submit"
            name="intent"
            value="clear"
            variant="outline"
            disabled={pending}
            formNoValidate
          >
            {copy.clear}
          </Button>
        ) : null}
      </form>
      {feedback ? (
        <p
          role="status"
          className={`text-sm ${state.success ? "text-emerald-700" : "text-rose-700"}`}
        >
          {feedback}
        </p>
      ) : null}
      {moveOutDate ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {copy.shareTitle}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white"
              onClick={async () => {
                if (navigator.share) {
                  try {
                    await navigator.share({ title: copy.pageEyebrow, text: copy.shareText, url: shareUrl() });
                    return;
                  } catch {
                    // Cancelled or unsupported: fall back to WhatsApp.
                  }
                }
                window.open(
                  `https://wa.me/?text=${encodeURIComponent(`${copy.shareText} ${shareUrl()}`)}`,
                  "_blank",
                  "noopener"
                );
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              {dictionary.sharePage.shareWhatsapp}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  window.prompt(dictionary.sharePage.copyLink, shareUrl());
                }
              }}
            >
              <Link2 className="mr-2 h-4 w-4" />
              {copied ? dictionary.sharePage.copied : dictionary.sharePage.copyLink}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
