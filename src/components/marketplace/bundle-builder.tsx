"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { ListingImage } from "@/components/marketplace/listing-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildBundleMessage, suggestBundlePrice } from "@/features/listings/bundle";
import { ensureConversationForListing, sendConversationMessage } from "@/features/messaging/demo-messaging-store";
import { ensureLiveConversationForListing, sendLiveConversationMessage } from "@/features/messaging/live-messaging";
import { friendlyError } from "@/lib/friendly-error";
import { isLiveClientMode } from "@/lib/public-env";
import { formatCurrency } from "@/lib/utils";
import type { Listing } from "@/types/domain";

/** Pick several items from one seller and send a single bundle offer in the chat. */
export function BundleBuilder({
  listings,
  sellerId,
  currentUserId,
  siteUrl,
  preselectedId
}: {
  listings: Listing[];
  sellerId: string;
  currentUserId: string;
  siteUrl: string;
  preselectedId?: string;
}) {
  const { dictionary } = useLocale();
  const copy = dictionary.bundle;
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(preselectedId && listings.some((listing) => listing.id === preselectedId) ? [preselectedId] : [])
  );
  const [offerText, setOfferText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const chosen = listings.filter((listing) => selected.has(listing.id));
  const total = chosen.reduce((sum, listing) => sum + listing.price, 0);
  const suggested = suggestBundlePrice(total);
  const offer = Number(offerText) > 0 ? Number(offerText) : suggested;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const send = () =>
    startTransition(async () => {
      setError(null);
      try {
        const first = chosen[0];
        const text = buildBundleMessage(
          chosen.map((listing) => ({ id: listing.id, title: listing.title, price: listing.price })),
          offer,
          siteUrl
        );
        const conversation = isLiveClientMode
          ? await ensureLiveConversationForListing(first.id, currentUserId, sellerId)
          : await ensureConversationForListing(first.id, currentUserId, sellerId);
        if (isLiveClientMode) {
          await sendLiveConversationMessage(conversation.id, currentUserId, text);
        } else {
          await sendConversationMessage(conversation.id, currentUserId, text);
        }
        router.push(`/app/messages/${conversation.id}`);
      } catch (caught) {
        setError(friendlyError(caught instanceof Error ? caught.message : copy.error, dictionary));
      }
    });

  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {listings.map((listing) => {
          const isOn = selected.has(listing.id);
          const cover = listing.images.find((image) => image.isPrimary) ?? listing.images[0];
          return (
            <li key={listing.id}>
              <button
                type="button"
                aria-pressed={isOn}
                onClick={() => toggle(listing.id)}
                className={`block w-full overflow-hidden rounded-2xl border-2 bg-white text-left transition ${isOn ? "border-emerald-500" : "border-transparent"}`}
              >
                <span className="relative block aspect-square bg-slate-100">
                  <ListingImage src={cover?.url} alt={cover?.alt ?? listing.title} sizes="(max-width: 640px) 50vw, 33vw" />
                  <span
                    className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 ${isOn ? "border-emerald-500 bg-emerald-500 text-white" : "border-white bg-white/80"}`}
                  >
                    {isOn ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
                  </span>
                </span>
                <span className="block px-2 py-2">
                  <span className="block font-extrabold text-slate-950">{formatCurrency(listing.price)}</span>
                  <span className="block truncate text-sm text-slate-700">{listing.title}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-20 space-y-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-lg lg:bottom-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">{copy.selected.replace("{count}", String(chosen.length))}</span>
          <span className="font-semibold text-slate-950">
            {copy.total} {formatCurrency(total)}
          </span>
        </div>
        {chosen.length >= 2 ? (
          <label className="flex items-center gap-3 text-sm">
            <span className="shrink-0 text-slate-600">{copy.yourOffer}</span>
            <Input
              type="number"
              inputMode="decimal"
              min="1"
              value={offerText}
              placeholder={String(suggested)}
              onChange={(event) => setOfferText(event.target.value)}
            />
          </label>
        ) : (
          <p className="text-xs text-slate-500">{copy.pickTwo}</p>
        )}
        <Button type="button" className="w-full" disabled={chosen.length < 2 || isPending} onClick={send}>
          {isPending ? copy.sending : copy.send.replace("{price}", String(offer))}
        </Button>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      </div>
    </div>
  );
}
