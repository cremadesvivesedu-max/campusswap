"use client";

import { useEffect } from "react";

/** Registers /sw.js once per page load. Pages stay network-first; see public/sw.js. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Not fatal: the site works without it, it just is not installable offline.
    });
  }, []);

  return null;
}
