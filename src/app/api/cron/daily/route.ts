import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { runDailyOrderJobs } from "@/server/services/order-protection";
import { formatMondaySummary, loadWeeklyMetrics } from "@/server/services/weekly-metrics";

// Runs once a day from Vercel Cron (see vercel.json). Vercel sends
// "Authorization: Bearer <CRON_SECRET>" when the CRON_SECRET env var is set.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request) {
  const expected = env.CRON_SECRET;
  const received = request.headers.get("authorization");
  if (!expected || !received) {
    return false;
  }
  const a = Buffer.from(`Bearer ${expected}`);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();

  if (!admin) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
  }

  const now = new Date();
  const orders = await runDailyOrderJobs(admin, now);
  let mondaySummary: string | null = null;

  // Monday morning: last week's numbers to every admin (push + in-app notification).
  if (now.getUTCDay() === 1) {
    const [, lastWeek, weekBefore] = await loadWeeklyMetrics(admin, 3, now);
    mondaySummary = formatMondaySummary(lastWeek, weekBefore);
    const { data: admins } = await admin.from("users").select("id").eq("role", "admin");
    const weekKey = lastWeek.weekStart.slice(0, 10);

    for (const row of (admins as { id: string }[] | null) ?? []) {
      const { error } = await admin.from("notification_events").insert({
        user_id: row.id,
        dedupe_key: `weekly-metrics:${weekKey}`,
        notification_type: "system"
      });

      if (!error) {
        await admin.from("notifications").insert({
          user_id: row.id,
          type: "system",
          title: "📊 Tus métricas de la semana",
          body: mondaySummary,
          destination_href: "/admin"
        });
      }
    }
  }

  return NextResponse.json({ ok: true, orders, mondaySummary });
}
