// Moving sale: a seller sets the day they leave Maastricht and shares one link with
// all their listings. The date lives in the Supabase auth user metadata, so no schema
// change is needed.

export const MOVE_OUT_METADATA_KEY = "move_out_date";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS_AHEAD = 366;

function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Accepts "YYYY-MM-DD" between today and a year from now; anything else is null. */
export function parseMoveOutDate(value: unknown, now = new Date()) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return null;
  }

  const days = Math.round((parsed.getTime() - startOfUtcDay(now)) / DAY_MS);
  return days >= 0 && days <= MAX_DAYS_AHEAD ? value : null;
}

/** Whole days from today until the moving day; null once it has passed. */
export function daysUntilMoveOut(value: string | null | undefined, now = new Date()) {
  if (!value) {
    return null;
  }

  const target = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(target)) {
    return null;
  }

  const days = Math.round((target - startOfUtcDay(now)) / DAY_MS);
  return days >= 0 ? days : null;
}

export function formatMoveOutCountdown(
  days: number,
  copy: { daysLeft: string; oneDayLeft: string; today: string }
) {
  if (days === 0) {
    return copy.today;
  }
  return days === 1 ? copy.oneDayLeft : copy.daysLeft.replace("{days}", String(days));
}
