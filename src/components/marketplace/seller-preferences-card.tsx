"use client";

import { useActionState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BUNDLE_DISCOUNT_OPTIONS, type SellerPreferences } from "@/features/profile/seller-preferences";
import { friendlyError } from "@/lib/friendly-error";
import { updateSellerPreferencesAction } from "@/server/actions/seller-preferences";

/** Bundle discount and away date, on My listings. */
export function SellerPreferencesCard({ initial }: { initial: SellerPreferences }) {
  const { dictionary } = useLocale();
  const copy = dictionary.sellerPrefs;
  const [state, action, pending] = useActionState(updateSellerPreferencesAction, {
    success: false,
    message: ""
  });
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const feedback =
    state.message === "saved"
      ? copy.saved
      : state.message === "invalid-date"
        ? copy.invalidDate
        : state.message
          ? friendlyError(state.message, dictionary)
          : "";

  return (
    <section className="space-y-4 rounded-[24px] border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <SlidersHorizontal className="h-6 w-6 shrink-0 text-slate-600" aria-hidden="true" />
        <h2 className="font-display text-xl font-semibold text-slate-950">{copy.cardTitle}</h2>
      </div>
      <form action={action} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>{copy.discountLabel}</span>
            <select
              name="bundleDiscount"
              defaultValue={initial.bundleDiscount ?? ""}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900"
            >
              <option value="">{copy.discountNone}</option>
              {BUNDLE_DISCOUNT_OPTIONS.map((percent) => (
                <option key={percent} value={percent}>
                  {percent}%
                </option>
              ))}
            </select>
            <span className="block text-xs font-normal leading-5 text-slate-500">{copy.discountHelp}</span>
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>{copy.awayLabel}</span>
            <Input type="date" name="awayUntil" min={tomorrow} defaultValue={initial.awayUntil ?? ""} />
            <span className="block text-xs font-normal leading-5 text-slate-500">{copy.awayHelp}</span>
          </label>
        </div>
        <Button type="submit" disabled={pending}>
          {copy.save}
        </Button>
      </form>
      {feedback ? (
        <p role="status" className={`text-sm ${state.success ? "text-emerald-700" : "text-rose-700"}`}>
          {feedback}
        </p>
      ) : null}
    </section>
  );
}
