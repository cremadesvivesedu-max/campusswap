import { NextResponse } from "next/server";
import { isLiveMode } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const BOT = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|curl|wget|python|axios/i;

/** Adds 1 to today's visit counter (funnel_daily). Stores nothing about the visitor. */
export async function POST(request: Request) {
  const agent = request.headers.get("user-agent") ?? "";
  if (!isLiveMode || !agent || BOT.test(agent)) {
    return new NextResponse(null, { status: 204 });
  }
  const admin = createAdminSupabaseClient();
  if (admin) {
    await admin.rpc("bump_funnel_visit");
  }
  return new NextResponse(null, { status: 204 });
}
