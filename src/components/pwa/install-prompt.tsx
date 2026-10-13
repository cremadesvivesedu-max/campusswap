"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

// Chrome/Android fire `beforeinstallprompt`; iPhone Safari has no prompt, so we show
// the "Share → Add to Home Screen" hint instead. Dismissed for 30 days per device.

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "campusswap-install-dismissed-at";
const DISMISS_MS = 30 * 24 * 60 * 60 * 1000;

function recentlyDismissed() {
  try {
    const at = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    return Date.now() - at < DISMISS_MS;
  } catch {
    return false;
  }
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const { dictionary } = useLocale();
  const copy = dictionary.pwa;
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) {
      return;
    }

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    if (isIos && isSafari) {
      setShowIosHint(true);
      setHidden(false);
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || (!deferred && !showIosHint)) {
    return null;
  }

  const dismiss = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Private mode: it will just show again next visit.
    }
  };

  return (
    <aside
      aria-label={copy.installTitle}
      className="fixed inset-x-3 bottom-24 z-40 mx-auto max-w-md rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)] sm:bottom-6"
    >
      <div className="flex items-start gap-3">
        <Download className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-semibold text-slate-950">{copy.installTitle}</p>
          <p className="text-sm leading-6 text-slate-600">
            {showIosHint && !deferred ? copy.iosInstallBody : copy.installBody}
          </p>
          {deferred ? (
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  await deferred.prompt();
                  await deferred.userChoice;
                  setDeferred(null);
                  setHidden(true);
                }}
              >
                {copy.installButton}
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={dismiss}>
                {copy.dismiss}
              </Button>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={copy.dismiss}
          className="rounded-full p-1 text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
