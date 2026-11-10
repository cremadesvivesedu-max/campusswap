import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { captureAppError } from "@/lib/instrumentation";
import { clip, isRateLimited, readJsonBody, sanitizeMetadata } from "@/lib/request-guards";

export async function POST(request: Request) {
  try {
    if (isRateLimited(request, "client-errors", 20, 60_000)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const payload = (await readJsonBody(request, 16_000)) as {
      message?: unknown;
      stack?: unknown;
      digest?: unknown;
      pathname?: unknown;
      metadata?: unknown;
    } | null;

    const message = clip(payload?.message, 500);
    if (!payload || !message) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    const error = new Error(message);
    error.stack = clip(payload.stack, 4_000);

    await captureAppError({
      source: "client-global-error",
      error,
      actorUserId: user?.id ?? undefined,
      pathname: clip(payload.pathname, 300),
      digest: clip(payload.digest, 100) ?? null,
      metadata: sanitizeMetadata(payload.metadata)
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
