import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { captureAppError } from "@/lib/instrumentation";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      message?: string;
      stack?: string;
      digest?: string;
      pathname?: string;
      metadata?: Record<string, string | number | boolean | null>;
    };

    if (!payload.message) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    const error = new Error(payload.message);
    error.stack = payload.stack;

    await captureAppError({
      source: "client-global-error",
      error,
      actorUserId: user?.id ?? undefined,
      pathname: payload.pathname,
      digest: payload.digest,
      metadata: payload.metadata ?? {}
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
