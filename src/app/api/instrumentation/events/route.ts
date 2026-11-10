import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { recordAppEvent, type AppEventName } from "@/lib/instrumentation";
import { isRateLimited, readJsonBody, sanitizeMetadata } from "@/lib/request-guards";

// Only events the browser legitimately sends. Everything else (listings,
// checkout, offers…) is recorded on the server, so it can't be faked here.
const clientEvents = new Set<AppEventName>(["signup", "login"]);

export async function POST(request: Request) {
  try {
    if (isRateLimited(request, "events", 30, 60_000)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const payload = (await readJsonBody(request, 4_000)) as {
      eventName?: AppEventName;
      metadata?: unknown;
    } | null;

    if (!payload?.eventName || !clientEvents.has(payload.eventName)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    await recordAppEvent({
      eventName: payload.eventName,
      // Never trust an id sent by the browser: only the signed-in session counts.
      actorUserId: user?.id ?? undefined,
      metadata: sanitizeMetadata(payload.metadata)
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
