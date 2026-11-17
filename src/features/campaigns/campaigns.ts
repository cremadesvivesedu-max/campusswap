// Seasonal campaigns tied to the Maastricht student year (UM and Zuyd).
// Each one shows a banner in the app and on the home page while it runs.
// Dates are month/day windows so they repeat every year; check them against the
// faculty calendars each summer (exam weeks move a few days between years).
// The marketing kit (posts, stories, emails) lives in material/campanas.

export type CampaignId = "arrival" | "exams" | "new-semester";

interface Window {
  /** Inclusive, as [month (1-12), day]. */
  from: [number, number];
  to: [number, number];
}

export interface Campaign {
  id: CampaignId;
  href: string;
  windows: Window[];
}

export const CAMPAIGNS: Campaign[] = [
  // INKOM (mid-August) and the start of period 1 (end of August).
  { id: "arrival", href: "/app/kit", windows: [{ from: [8, 1], to: [9, 20] }] },
  // Second semester and February intake: period 4 starts at the end of January.
  { id: "new-semester", href: "/app/kit", windows: [{ from: [1, 26], to: [2, 14] }] },
  // Exam weeks: October, December, end of January, June.
  {
    id: "exams",
    href: "/app/categories/textbooks-study-materials",
    windows: [
      { from: [10, 10], to: [10, 23] },
      { from: [12, 5], to: [12, 18] },
      { from: [1, 11], to: [1, 25] },
      { from: [6, 1], to: [6, 19] }
    ]
  }
];

function inWindow(window: Window, month: number, day: number) {
  const value = month * 100 + day;
  return value >= window.from[0] * 100 + window.from[1] && value <= window.to[0] * 100 + window.to[1];
}

/** The campaign running on this date (Amsterdam time), if any. */
export function activeCampaign(now = new Date()): Campaign | null {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", month: "numeric", day: "numeric" })
    .formatToParts(now);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  return CAMPAIGNS.find((campaign) => campaign.windows.some((window) => inWindow(window, month, day))) ?? null;
}
