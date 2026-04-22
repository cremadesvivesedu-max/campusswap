import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { recordAppEvent, type AppEventName } from "@/lib/instrumentation";

const allowedEvents = new Set<AppEventName>([
  "signup",
  "login",
  "listing_created",
  "listing_saved",
  "message_started",
  "offer_sent",
  "checkout_started",
  "checkout_cancelled",
  "checkout_completed",
  "support_ticket_created"
]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      eventName?: AppEventName;
      actorUserId?: string;
      listingId?: string;
      conversationId?: string;
      transactionId?: string;
      supportTicketId?: string;
      metadata?: Record<string, string | number | boolean | null>;
    };

    if (!payload.eventName || !allowedEvents.has(payload.eventName)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

    await recordAppEvent({
      eventName: payload.eventName,
      actorUserId: user?.id ?? payload.actorUserId,
      listingId: payload.listingId,
      conversationId: payload.conversationId,
      transactionId: payload.transactionId,
      supportTicketId: payload.supportTicketId,
      metadata: payload.metadata ?? {}
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
