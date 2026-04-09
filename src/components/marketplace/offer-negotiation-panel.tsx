"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/providers/locale-provider";
import {
  acceptOfferAction,
  counterOfferAction,
  rejectOfferAction,
  submitOfferAction,
  withdrawOfferAction
} from "@/server/actions/marketplace";
import { formatCurrency } from "@/lib/utils";
import type { ListingOffer, Transaction } from "@/types/domain";

interface OfferNegotiationPanelProps {
  listingId: string;
  listingPrice: number;
  sellerId: string;
  currentUserId: string;
  latestOffer?: ListingOffer;
  transaction?: Transaction;
  conversationId?: string;
}

function formatEventTime(value?: string) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function OfferNegotiationPanel({
  listingId,
  listingPrice,
  sellerId,
  currentUserId,
  latestOffer,
  transaction,
  conversationId
}: OfferNegotiationPanelProps) {
  const { dictionary } = useLocale();
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offerAmount, setOfferAmount] = useState(listingPrice.toFixed(2));
  const [counterAmount, setCounterAmount] = useState(
    latestOffer?.amount.toFixed(2) ?? listingPrice.toFixed(2)
  );
  const [isPending, startTransition] = useTransition();
  const isSeller = currentUserId === sellerId;
  const isCreator = latestOffer?.createdByUserId === currentUserId;
  const isOpen = latestOffer?.state === "open";
  const isSellerCounter = latestOffer?.createdByUserId === sellerId;
  const exchangeLocked =
    transaction?.state === "completed" || transaction?.state === "cancelled";
  const canSendNewOffer =
    !isSeller &&
    !exchangeLocked &&
    latestOffer?.state !== "accepted" &&
    latestOffer?.state !== "open";
  const canSendFirstOffer = !isSeller && !exchangeLocked && !latestOffer;

  const runAction = (
    action: () => Promise<{ success: boolean; message: string; conversationId?: string }>
  ) => {
    startTransition(async () => {
      try {
        setFeedback(null);
        setError(null);
        const result = await action();

        if (!result.success) {
          setError(result.message);
          return;
        }

        setFeedback(result.message);

        if (result.conversationId && result.conversationId !== conversationId) {
          router.push(`/app/messages/${result.conversationId}`);
        } else {
          router.refresh();
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : dictionary.messages.offers.genericError
        );
      }
    });
  };

  return (
    <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold text-slate-950">
            {dictionary.messages.offers.title}
          </p>
          <p className="text-sm leading-6 text-slate-600">
            {dictionary.messages.offers.description}
          </p>
        </div>
        {latestOffer ? (
          <Badge className="bg-slate-950 text-white">
            {dictionary.messages.offers.states[latestOffer.state]}
          </Badge>
        ) : null}
      </div>

      {latestOffer ? (
        <div className="space-y-2 rounded-[20px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <p className="font-semibold text-slate-950">
            {dictionary.messages.offers.latestOffer}: {formatCurrency(latestOffer.amount)}
          </p>
          <p>
            {latestOffer.createdByUserId === sellerId
              ? dictionary.messages.offers.sentBySeller
              : dictionary.messages.offers.sentByBuyer}
          </p>
          {formatEventTime(latestOffer.createdAt) ? (
            <p>
              {dictionary.messages.offers.sentAt}: {formatEventTime(latestOffer.createdAt)}
            </p>
          ) : null}
          {formatEventTime(latestOffer.respondedAt) ? (
            <p>
              {dictionary.messages.offers.respondedAt}:{" "}
              {formatEventTime(latestOffer.respondedAt)}
            </p>
          ) : null}
          {formatEventTime(latestOffer.expiresAt) ? (
            <p>
              {dictionary.messages.offers.expiresAt}: {formatEventTime(latestOffer.expiresAt)}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="rounded-[20px] border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          {dictionary.messages.offers.noOfferYet}
        </p>
      )}

      {canSendFirstOffer || canSendNewOffer ? (
        <div className="space-y-3 rounded-[20px] border border-slate-200 bg-white px-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {dictionary.messages.offers.offerAmount}
            </label>
            <Input
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              value={offerAmount}
              onChange={(event) => setOfferAmount(event.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={() =>
              runAction(() => submitOfferAction(listingId, Number(offerAmount)))
            }
            disabled={isPending}
          >
            {isPending
              ? dictionary.messages.offers.sendingOffer
              : dictionary.messages.offers.makeOffer}
          </Button>
        </div>
      ) : null}

      {isOpen && isSeller && !isCreator ? (
        <div className="space-y-3 rounded-[20px] border border-slate-200 bg-white px-4 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              onClick={() => runAction(() => acceptOfferAction(latestOffer.id))}
              disabled={isPending}
            >
              {isPending
                ? dictionary.common.actions.updating
                : dictionary.messages.offers.acceptOffer}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => runAction(() => rejectOfferAction(latestOffer.id))}
              disabled={isPending}
            >
              {isPending
                ? dictionary.common.actions.updating
                : dictionary.messages.offers.rejectOffer}
            </Button>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {dictionary.messages.offers.counterAmount}
            </label>
            <Input
              type="number"
              inputMode="decimal"
              min="1"
              step="0.01"
              value={counterAmount}
              onChange={(event) => setCounterAmount(event.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              runAction(() => counterOfferAction(latestOffer.id, Number(counterAmount)))
            }
            disabled={isPending}
          >
            {isPending
              ? dictionary.common.actions.updating
              : dictionary.messages.offers.counterOffer}
          </Button>
        </div>
      ) : null}

      {isOpen && !isSeller && isSellerCounter ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            type="button"
            onClick={() => runAction(() => acceptOfferAction(latestOffer.id))}
            disabled={isPending}
          >
            {isPending
              ? dictionary.common.actions.updating
              : dictionary.messages.offers.acceptCounter}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => runAction(() => rejectOfferAction(latestOffer.id))}
            disabled={isPending}
          >
            {isPending
              ? dictionary.common.actions.updating
              : dictionary.messages.offers.rejectCounter}
          </Button>
        </div>
      ) : null}

      {isOpen && isCreator ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => runAction(() => withdrawOfferAction(latestOffer.id))}
          disabled={isPending}
        >
          {isPending
            ? dictionary.common.actions.updating
            : dictionary.messages.offers.withdrawOffer}
        </Button>
      ) : null}

      {latestOffer?.state === "accepted" ? (
        <p className="text-sm font-medium text-emerald-700">
          {dictionary.messages.offers.acceptedHint}
        </p>
      ) : null}

      {feedback ? <p className="text-sm font-medium text-emerald-700">{feedback}</p> : null}
      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}
