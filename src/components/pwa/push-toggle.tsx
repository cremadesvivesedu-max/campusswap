"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { Button } from "@/components/ui/button";

type Status = "loading" | "unsupported" | "blocked" | "off" | "on";

function urlBase64ToUint8Array(base64: string) {
  const padded = `${base64}${"=".repeat((4 - (base64.length % 4)) % 4)}`.replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(padded);
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

/** "Notifications on this device": subscribes this browser to web push for new messages. */
export function PushToggle({ vapidPublicKey }: { vapidPublicKey: string }) {
  const { dictionary } = useLocale();
  const copy = dictionary.pwa;
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setStatus("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setStatus("blocked");
      return;
    }
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => setStatus(subscription ? "on" : "off"))
      .catch(() => setStatus("unsupported"));
  }, []);

  async function turnOn() {
    setBusy(true);
    setError(false);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "blocked" : "off");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
        }));
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(subscription.toJSON())
      });
      if (!response.ok) {
        throw new Error(String(response.status));
      }
      setStatus("on");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    setError(false);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
        await subscription.unsubscribe();
      }
      setStatus("off");
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <BellRing className="mt-1 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-950">{copy.pushTitle}</p>
          <p className="text-sm leading-6 text-slate-600">{copy.pushBody}</p>
        </div>
      </div>
      {status === "unsupported" ? <p className="text-sm text-slate-600">{copy.pushUnsupported}</p> : null}
      {status === "blocked" ? <p className="text-sm text-amber-800">{copy.pushBlocked}</p> : null}
      {status === "on" ? (
        <div className="space-y-2">
          <p role="status" className="text-sm font-medium text-emerald-700">
            {copy.pushEnabled}
          </p>
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={turnOff}>
            {copy.pushDisable}
          </Button>
        </div>
      ) : null}
      {status === "off" ? (
        <Button type="button" disabled={busy} onClick={turnOn}>
          {copy.pushEnable}
        </Button>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-rose-700">
          {copy.pushError}
        </p>
      ) : null}
    </div>
  );
}
