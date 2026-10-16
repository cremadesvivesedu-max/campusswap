import { isLiveMode } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { shortName } from "@/features/referrals/code";

export interface InviteStats {
  invitedTotal: number;
  invitedThisMonth: number;
  leaderboard: { userId: string; name: string; count: number }[];
  rank?: number;
}

/** The person's own invites plus this month's top 10 inviters (first name + initial only). */
export async function getInviteStats(userId: string, now = new Date()): Promise<InviteStats> {
  if (!isLiveMode) {
    return {
      invitedTotal: 2,
      invitedThisMonth: 1,
      leaderboard: [
        { userId: "user-lina", name: "Lina V.", count: 7 },
        { userId: "user-sanne", name: "Sanne J.", count: 4 },
        { userId: "user-omar", name: "Omar E.", count: 1 }
      ],
      rank: 3
    };
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return { invitedTotal: 0, invitedThisMonth: 0, leaderboard: [] };
  }

  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const [{ count: total }, { data: monthRows, error }] = await Promise.all([
    admin.from("referrals").select("referred_id", { count: "exact", head: true }).eq("referrer_id", userId),
    admin.from("referrals").select("referrer_id").gte("created_at", monthStart).limit(10000)
  ]);

  if (error) {
    return { invitedTotal: 0, invitedThisMonth: 0, leaderboard: [] };
  }

  const counts = new Map<string, number>();
  for (const row of (monthRows as { referrer_id: string }[] | null) ?? []) {
    counts.set(row.referrer_id, (counts.get(row.referrer_id) ?? 0) + 1);
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 10);
  const { data: profiles } = top.length
    ? await admin.from("profiles").select("user_id, full_name").in("user_id", top.map(([id]) => id))
    : { data: [] };
  const names = new Map(
    ((profiles as { user_id: string; full_name: string | null }[] | null) ?? []).map((row) => [row.user_id, row.full_name ?? ""])
  );
  const position = ranked.findIndex(([id]) => id === userId);

  return {
    invitedTotal: total ?? 0,
    invitedThisMonth: counts.get(userId) ?? 0,
    leaderboard: top.map(([id, count]) => ({ userId: id, name: shortName(names.get(id) || "Student"), count })),
    rank: position >= 0 ? position + 1 : undefined
  };
}
