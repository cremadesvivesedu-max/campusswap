import { NextResponse } from "next/server";
import { z } from "zod";
import { isLiveMode } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Saves or removes this browser's push subscription for the signed-in person.
// RLS (push_subscriptions_owner_access) keeps people to their own rows.

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(2000),
  keys: z.object({ p256dh: z.string().min(1).max(500), auth: z.string().min(1).max(200) })
});

async function requireUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return null;
  }
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user ? { supabase, user } : null;
}

export async function POST(request: Request) {
  if (!isLiveMode) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const context = await requireUser();
  if (!context) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = subscriptionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid-subscription" }, { status: 400 });
  }

  // The endpoint is unique per browser. If someone else used to be signed in on this
  // device, the row moves to the current person, so use the service-role client.
  const writer = createAdminSupabaseClient() ?? context.supabase;
  const { error } = await writer.from("push_subscriptions").upsert(
    {
      user_id: context.user.id,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
      user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!isLiveMode) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const context = await requireUser();
  if (!context) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { endpoint?: string } | null;
  if (!body?.endpoint) {
    return NextResponse.json({ error: "missing-endpoint" }, { status: 400 });
  }

  await context.supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", body.endpoint)
    .eq("user_id", context.user.id);
  return NextResponse.json({ ok: true });
}
