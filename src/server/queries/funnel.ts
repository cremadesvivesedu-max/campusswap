import type { FunnelWeek } from "@/features/funnel/funnel-alert";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/** Newest week first; the first one is the current, unfinished week. */
export async function getFunnelWeeks(weeks = 6): Promise<FunnelWeek[]> {
  const admin = createAdminSupabaseClient();
  if (!admin) return [];
  const { data, error } = await admin.rpc("funnel_weeks", { p_weeks: weeks });
  if (error || !data) return [];
  return (data as Record<string, string | number>[]).map((row) => ({
    weekStart: String(row.week_start),
    visits: Number(row.visits),
    signups: Number(row.signups),
    listings: Number(row.listings),
    sales: Number(row.sales)
  }));
}
