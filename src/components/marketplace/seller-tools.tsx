"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { CLEARANCE_DISCOUNTS, timeLeft } from "@/features/impact/seller-tools";
import { formatCurrency } from "@/lib/utils";
import {
  getAutoAcceptAction,
  saveAutoAcceptAction,
  startBumpCheckoutAction,
  startClearanceAction
} from "@/server/actions/seller-tools";
import type { Dictionary } from "@/lib/i18n-shared";

const MENU_ITEM = "block w-full px-4 py-2.5 text-left hover:bg-slate-50";

function bumpMessage(dictionary: Dictionary, code: string) {
  const copy = dictionary.innov.bump;
  return code === "too-soon" ? copy.tooSoon : code === "demo" ? copy.demo : dictionary.listingRow.error;
}

/** Menu entry: pay EUR 0.99 in Stripe and the listing goes back to the top. */
export function BumpMenuItem({ listingId, onError }: { listingId: string; onError: (text: string) => void }) {
  const { dictionary } = useLocale();
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      className={MENU_ITEM}
      onClick={(event) => {
        event.currentTarget.closest("details")?.removeAttribute("open");
        startTransition(async () => {
          const result = await startBumpCheckoutAction(listingId);
          if (result.success && result.url) window.location.assign(result.url);
          else onError(bumpMessage(dictionary, result.message));
        });
      }}
    >
      {dictionary.innov.bump.menu}
    </button>
  );
}

/** Hidden minimum price: offers that reach it are accepted on their own. */
export function MinPricePanel({ listingId, price, onClose }: { listingId: string; price: number; onClose: () => void }) {
  const { dictionary } = useLocale();
  const copy = dictionary.innov.minPrice;
  const [value, setValue] = useState("");
  const [current, setCurrent] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void getAutoAcceptAction(listingId).then((minimum) => {
      setCurrent(minimum);
      if (minimum) setValue(String(minimum));
    });
  }, [listingId]);

  const save = (amount: number | null) =>
    startTransition(async () => {
      const result = await saveAutoAcceptAction(listingId, amount);
      if (!result.success) {
        setMessage({ text: copy.invalid, ok: false });
        return;
      }
      setCurrent(amount);
      setMessage({ text: amount === null ? copy.removed : copy.saved.replace("{price}", formatCurrency(amount)), ok: true });
    });

  return (
    <form
      className="mt-3 space-y-2 rounded-2xl bg-slate-50 p-3"
      onSubmit={(event) => {
        event.preventDefault();
        const amount = Number(value.replace(",", "."));
        if (!(amount > 0 && amount < price)) {
          setMessage({ text: copy.invalid, ok: false });
          return;
        }
        save(Math.round(amount * 100) / 100);
      }}
    >
      <p className="text-sm font-semibold text-slate-950">{copy.title}</p>
      <p className="text-xs text-slate-600">{copy.help}</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor={`min-${listingId}`}>{copy.title}</label>
        <input
          id={`min-${listingId}`}
          inputMode="decimal"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={copy.placeholder}
          className="h-10 w-28 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-950"
        />
        <span className="text-sm text-slate-500">€</span>
        <button type="submit" disabled={isPending} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
          {copy.save}
        </button>
        {current ? (
          <button type="button" disabled={isPending} onClick={() => save(null)} className="text-sm font-semibold text-rose-700 hover:underline">
            {copy.remove}
          </button>
        ) : null}
        <button type="button" onClick={onClose} className="ml-auto text-sm text-slate-500 hover:underline">
          {dictionary.innov.photo.cancel}
        </button>
      </div>
      {message ? (
        <p className={`text-xs ${message.ok ? "text-emerald-700" : "text-rose-700"}`} role="status">{message.text}</p>
      ) : null}
    </form>
  );
}

/** Moving out: cut every listing at once for 48 hours, with a countdown for buyers. */
export function ClearanceCard() {
  const { dictionary } = useLocale();
  const copy = dictionary.innov.clearance;
  const router = useRouter();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();
  return (
    <section className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950">
        <Timer className="h-5 w-5 text-amber-700" aria-hidden="true" /> {copy.title}
      </h2>
      <p className="mt-1 text-sm text-slate-700">{copy.body}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {CLEARANCE_DISCOUNTS.map((percent) => (
          <button
            key={percent}
            type="button"
            disabled={isPending}
            className="rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-100 disabled:opacity-60"
            onClick={() => {
              if (!window.confirm(copy.confirm.replace("{percent}", String(percent)))) return;
              startTransition(async () => {
                const result = await startClearanceAction(percent);
                setMessage(
                  result.success
                    ? { text: copy.started.replace("{count}", String(result.count ?? 0)), ok: true }
                    : { text: copy.nothing, ok: false }
                );
                router.refresh();
              });
            }}
          >
            {copy.start.replace("{percent}", String(percent))}
          </button>
        ))}
      </div>
      {message ? (
        <p className={`mt-2 text-sm ${message.ok ? "text-emerald-800" : "text-slate-700"}`} role="status">{message.text}</p>
      ) : null}
    </section>
  );
}

function formatLeft(dictionary: Dictionary, until: string, now: number) {
  const left = timeLeft(until, now);
  if (!left) return null;
  const t = dictionary.innov.time;
  if (left.days) return t.dh.replace("{d}", String(left.days)).replace("{h}", String(left.hours));
  if (left.hours) return t.hm.replace("{h}", String(left.hours)).replace("{m}", String(left.minutes));
  return t.m.replace("{m}", String(Math.max(1, left.minutes)));
}

/** "Clearance · ends in 1 d 6 h" + old price crossed out. Ticks once a minute. */
export function ClearanceTag({ until, originalPrice, compact = false }: { until: string; originalPrice?: number; compact?: boolean }) {
  const { dictionary } = useLocale();
  const copy = dictionary.innov.clearance;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const left = formatLeft(dictionary, until, now);
  if (!left) return null;
  return (
    <span className={`inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 ${compact ? "text-xs" : "text-sm"}`}>
      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
        {copy.badge} · {copy.endsIn.replace("{time}", left)}
      </span>
      {originalPrice ? (
        <span className="text-slate-500 line-through" aria-label={copy.was.replace("{price}", formatCurrency(originalPrice))}>
          {formatCurrency(originalPrice)}
        </span>
      ) : null}
    </span>
  );
}
