import type { createAdminSupabaseClient } from "@/lib/supabase/admin";

type AdminClient = NonNullable<ReturnType<typeof createAdminSupabaseClient>>;

export interface WeekMetrics {
  /** Monday 00:00 UTC of the week, ISO string. */
  weekStart: string;
  newUsers: number;
  newListings: number;
  newChats: number;
  messages: number;
  sales: number;
  salesVolume: number;
  reviews: number;
  averageRating: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Monday 00:00 UTC of the week containing `date`. */
export function startOfWeek(date: Date) {
  const day = date.getUTCDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // days since Monday
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - diff));
}

/** The last `weeks` week starts, most recent first (the current, unfinished week included). */
export function getWeekStarts(now: Date, weeks: number) {
  const current = startOfWeek(now);
  return Array.from({ length: weeks }, (_, index) => new Date(current.getTime() - index * 7 * DAY_MS));
}

/** "+25%", "-10%", "=" — or "nuevo" when last week was zero. */
export function formatChange(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? "=" : "nuevo";
  }
  const change = Math.round(((current - previous) / previous) * 100);
  return change === 0 ? "=" : `${change > 0 ? "+" : ""}${change}%`;
}

async function countBetween(
  admin: AdminClient,
  table: string,
  column: string,
  from: Date,
  to: Date
) {
  const { count, error } = await admin
    .from(table)
    .select("*", { count: "exact", head: true })
    .gte(column, from.toISOString())
    .lt(column, to.toISOString());

  if (error) {
    console.error(`Weekly count failed for ${table}:`, error.message);
    return 0;
  }

  return count ?? 0;
}

/** Counts per week straight from the database (head-only counts, so no row limits apply). */
export async function loadWeeklyMetrics(admin: AdminClient, weeks = 8, now = new Date()) {
  const starts = getWeekStarts(now, weeks);
  const oldest = starts[starts.length - 1];

  const [completed, reviewRows] = await Promise.all([
    admin
      .from("transactions")
      .select("completed_at, amount")
      .eq("state", "completed")
      .gte("completed_at", oldest.toISOString())
      .limit(5000),
    admin
      .from("reviews")
      .select("created_at, rating")
      .gte("created_at", oldest.toISOString())
      .limit(5000)
  ]);
  const sales = (completed.data as { completed_at: string; amount: number | string | null }[] | null) ?? [];
  const ratings = (reviewRows.data as { created_at: string; rating: number }[] | null) ?? [];

  return Promise.all(
    starts.map(async (start): Promise<WeekMetrics> => {
      const end = new Date(start.getTime() + 7 * DAY_MS);
      const inWeek = (value: string) => {
        const time = Date.parse(value);
        return time >= start.getTime() && time < end.getTime();
      };
      const [newUsers, newListings, newChats, messages] = await Promise.all([
        countBetween(admin, "users", "joined_at", start, end),
        countBetween(admin, "listings", "created_at", start, end),
        countBetween(admin, "conversations", "created_at", start, end),
        countBetween(admin, "messages", "sent_at", start, end)
      ]);
      const weekSales = sales.filter((row) => row.completed_at && inWeek(row.completed_at));
      const weekRatings = ratings.filter((row) => inWeek(row.created_at));

      return {
        weekStart: start.toISOString(),
        newUsers,
        newListings,
        newChats,
        messages,
        sales: weekSales.length,
        salesVolume: Math.round(weekSales.reduce((sum, row) => sum + Number(row.amount ?? 0), 0) * 100) / 100,
        reviews: weekRatings.length,
        averageRating: weekRatings.length
          ? Math.round((weekRatings.reduce((sum, row) => sum + row.rating, 0) / weekRatings.length) * 10) / 10
          : null
      };
    })
  );
}

/** One line for the Monday push: last full week against the week before. */
export function formatMondaySummary(lastWeek: WeekMetrics, weekBefore: WeekMetrics) {
  const part = (label: string, current: number, previous: number) =>
    `${label} ${current} (${formatChange(current, previous)})`;

  return [
    part("Usuarios", lastWeek.newUsers, weekBefore.newUsers),
    part("Anuncios", lastWeek.newListings, weekBefore.newListings),
    part("Chats", lastWeek.newChats, weekBefore.newChats),
    `Ventas ${lastWeek.sales} (€${lastWeek.salesVolume.toFixed(0)})`
  ].join(" · ");
}
