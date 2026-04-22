"use client";

import type { AppEventName } from "@/lib/instrumentation";

function sendPayload(path: string, payload: object) {
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    const accepted = navigator.sendBeacon(path, blob);

    if (accepted) {
      return;
    }
  }

  void fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body,
    keepalive: true
  });
}

export function trackClientEvent(input: {
  eventName: AppEventName;
  actorUserId?: string;
  listingId?: string;
  conversationId?: string;
  transactionId?: string;
  supportTicketId?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}) {
  sendPayload("/api/instrumentation/events", input);
}

export function reportClientError(input: {
  error: Error;
  digest?: string;
  pathname?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
}) {
  sendPayload("/api/instrumentation/error", {
    message: input.error.message,
    stack: input.error.stack,
    digest: input.digest,
    pathname: input.pathname,
    metadata: input.metadata ?? {}
  });
}
