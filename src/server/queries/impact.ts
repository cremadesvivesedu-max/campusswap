import { isLiveMode } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/** Below this the number says more about how new we are than about reuse. */
export const IMPACT_MIN_ITEMS = 25;

/** Items really handed over: completed sales only, never an estimate. */
export async function getReusedItemsCount() {
  const admin = isLiveMode ? createAdminSupabaseClient() : null;
  if (!admin) {
    return 0;
  }

  const { count } = await admin
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("state", "completed");
  return count ?? 0;
}
