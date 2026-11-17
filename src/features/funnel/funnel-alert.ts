// Weekly funnel: visit → sign-up → listing → sale.
// Compares last full week with the average of the weeks before and flags a
// step whose conversion rate fell clearly. The n8n flow «CampusSwap: alerta
// del embudo» runs the same rules (keep both in sync if you change them).

export interface FunnelWeek {
  weekStart: string;
  visits: number;
  signups: number;
  listings: number;
  sales: number;
}

export interface FunnelStep {
  key: "visit_signup" | "signup_listing" | "listing_sale";
  label: string;
  from: keyof Omit<FunnelWeek, "weekStart">;
  to: keyof Omit<FunnelWeek, "weekStart">;
  /** Ignore the step when the earlier weeks had fewer than this many people at its start. */
  minBase: number;
}

export const FUNNEL_STEPS: FunnelStep[] = [
  { key: "visit_signup", label: "Visita → registro", from: "visits", to: "signups", minBase: 100 },
  { key: "signup_listing", label: "Registro → anuncio", from: "signups", to: "listings", minBase: 10 },
  { key: "listing_sale", label: "Anuncio → venta", from: "listings", to: "sales", minBase: 10 }
];

/** A rate counts as a clear drop when it is below 60 % of its usual value. */
export const DROP_THRESHOLD = 0.6;

export interface FunnelAlert {
  step: FunnelStep["key"];
  label: string;
  current: number;
  baseline: number;
}

export function rate(to: number, from: number) {
  return from > 0 ? to / from : 0;
}

/**
 * @param weeks newest first; weeks[0] is the current (unfinished) week and is skipped,
 *              weeks[1] is the week being judged, the rest are the baseline.
 */
export function findFunnelDrops(weeks: FunnelWeek[], threshold = DROP_THRESHOLD): FunnelAlert[] {
  const [, judged, ...history] = weeks;
  if (!judged || history.length < 2) return [];

  const alerts: FunnelAlert[] = [];
  for (const step of FUNNEL_STEPS) {
    const baseFrom = history.reduce((sum, week) => sum + week[step.from], 0);
    const baseTo = history.reduce((sum, week) => sum + week[step.to], 0);
    if (baseFrom / history.length < step.minBase || judged[step.from] < step.minBase / 2) continue;

    const baseline = rate(baseTo, baseFrom);
    const current = rate(judged[step.to], judged[step.from]);
    if (baseline > 0 && current < baseline * threshold) {
      alerts.push({ step: step.key, label: step.label, current, baseline });
    }
  }
  return alerts;
}
