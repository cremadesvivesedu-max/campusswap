"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import {
  beginSellerStripeOnboardingAction,
  openSellerStripeDashboardAction
} from "@/server/actions/marketplace";
import type { SellerStripeConnectStatus } from "@/types/domain";

function getReturnMessage(
  stripeState: string | undefined,
  dictionary: ReturnType<typeof useLocale>["dictionary"]
) {
  switch (stripeState) {
    case "ready":
      return dictionary.settings.stripeReturnReady;
    case "incomplete":
      return dictionary.settings.stripeReturnIncomplete;
    case "missing":
      return dictionary.settings.stripeReturnMissing;
    case "error":
      return dictionary.settings.stripeReturnError;
    default:
      return null;
  }
}

export function SettingsStripeConnectCard({
  status,
  stripeState
}: {
  status: SellerStripeConnectStatus;
  stripeState?: string;
}) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const onboardingMessage = useMemo(
    () => getReturnMessage(stripeState, dictionary),
    [dictionary, stripeState]
  );

  const statusCopy = status.onboardingComplete
    ? dictionary.settings.payoutsReady
    : status.connected
      ? dictionary.settings.payoutsIncomplete
      : dictionary.settings.payoutsNotConnected;

  const runAction = (
    action: () => Promise<{ success: boolean; message: string; url?: string }>
  ) => {
    startTransition(async () => {
      setFeedback(null);
      setError(null);

      try {
        const result = await action();

        if (!result.success) {
          setError(result.message);
          return;
        }

        if (result.url) {
          window.location.assign(result.url);
          return;
        }

        setFeedback(result.message);
        router.refresh();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : dictionary.settings.stripeReturnError
        );
      }
    });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm leading-7 text-slate-600">
        {dictionary.settings.payoutsDescription}
      </p>

      {onboardingMessage ? (
        <p
          className={`rounded-[20px] px-4 py-3 text-sm font-medium ${
            stripeState === "ready"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : stripeState === "error"
                ? "border border-rose-200 bg-rose-50 text-rose-700"
                : "border border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          {onboardingMessage}
        </p>
      ) : null}

      <div
        className={`rounded-[24px] border p-5 ${
          status.onboardingComplete
            ? "border-emerald-200 bg-emerald-50/80"
            : status.connected
              ? "border-amber-200 bg-amber-50/80"
              : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Stripe Connect
            </p>
            <p className="text-sm leading-7 text-slate-700">{statusCopy}</p>
          </div>
          <Badge
            className={
              status.onboardingComplete
                ? "bg-emerald-600 text-white"
                : status.connected
                  ? "bg-amber-500 text-white"
                  : "bg-slate-950 text-white"
            }
          >
            {status.onboardingComplete
              ? dictionary.settings.payoutsBadgeReady
              : status.connected
                ? dictionary.settings.payoutsBadgeActionNeeded
                : dictionary.settings.payoutsBadgeNotConnected}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {status.onboardingComplete ? (
            <Button
              type="button"
              onClick={() => runAction(() => openSellerStripeDashboardAction())}
              disabled={isPending}
            >
              {isPending
                ? dictionary.common.actions.opening
                : dictionary.settings.openStripeDashboard}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => runAction(() => beginSellerStripeOnboardingAction())}
              disabled={isPending}
            >
              {isPending
                ? dictionary.common.actions.opening
                : status.connected
                  ? dictionary.settings.continuePayoutSetup
                  : dictionary.settings.startPayoutSetup}
            </Button>
          )}
        </div>
      </div>

      {feedback ? (
        <p className="rounded-[20px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
