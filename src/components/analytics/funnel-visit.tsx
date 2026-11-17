"use client";

import { useEffect } from "react";

/**
 * Counts one visit per full page load (moving around inside the app does not
 * count again). The server only adds 1 to today's total: no cookie, no id.
 */
export function FunnelVisit() {
  useEffect(() => {
    if (navigator.webdriver) return;
    fetch("/api/funnel/visit", { method: "POST", keepalive: true }).catch(() => undefined);
  }, []);
  return null;
}
