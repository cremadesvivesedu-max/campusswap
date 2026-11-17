"use client";

import { track } from "@vercel/analytics";

/**
 * Funnel steps sent to Vercel Web Analytics as custom events
 * (visits are its normal page views). No personal data: only the step name.
 * Custom events show up in Vercel only on plans that include them; the
 * source of truth for the weekly alert is the database (funnel_weeks()).
 */
export type FunnelEvent = "signup" | "listing_created" | "sale_completed";

export function trackFunnel(event: FunnelEvent) {
  try {
    track(event);
  } catch {
    // Analytics must never break the page.
  }
}
