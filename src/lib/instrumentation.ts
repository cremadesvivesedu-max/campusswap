import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export type AppEventName =
  | "signup"
  | "login"
  | "listing_created"
  | "listing_saved"
  | "message_started"
  | "offer_sent"
  | "checkout_started"
  | "checkout_cancelled"
  | "checkout_completed"
  | "support_ticket_created";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type JsonRecord = Record<string, JsonValue>;

function createInstrumentationClient() {
  return createAdminSupabaseClient();
}

export async function recordAppEvent(input: {
  eventName: AppEventName;
  actorUserId?: string;
  listingId?: string;
  conversationId?: string;
  transactionId?: string;
  supportTicketId?: string;
  metadata?: JsonRecord;
}) {
  const client = createInstrumentationClient();

  if (!client) {
    return;
  }

  const { error } = await client.from("app_events").insert({
    event_name: input.eventName,
    actor_user_id: input.actorUserId ?? null,
    listing_id: input.listingId ?? null,
    conversation_id: input.conversationId ?? null,
    transaction_id: input.transactionId ?? null,
    support_ticket_id: input.supportTicketId ?? null,
    metadata: input.metadata ?? {}
  });

  if (error) {
    console.error("App event insert failed:", error.message);
  }
}

export async function captureAppError(input: {
  source: string;
  error: unknown;
  actorUserId?: string;
  pathname?: string;
  metadata?: JsonRecord;
  digest?: string | null;
}) {
  const client = createInstrumentationClient();
  const resolvedError = input.error instanceof Error ? input.error : new Error(String(input.error));

  if (!client) {
    console.error("App error captured without instrumentation client:", resolvedError);
    return;
  }

  const { error } = await client.from("app_error_logs").insert({
    source: input.source,
    message: resolvedError.message,
    digest: input.digest ?? null,
    stack: resolvedError.stack ?? null,
    pathname: input.pathname ?? null,
    actor_user_id: input.actorUserId ?? null,
    metadata: input.metadata ?? {}
  });

  if (error) {
    console.error("App error insert failed:", error.message);
    return;
  }

  console.error("CampusSwap captured error:", resolvedError);
}
