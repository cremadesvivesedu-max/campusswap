import webpush from "web-push";
import { env } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

// Web push to every device a person allowed notifications on. Does nothing until the
// VAPID keys are set (NEXT_PUBLIC_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY).

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  /** Same tag replaces the previous notification instead of stacking (one per chat). */
  tag?: string;
}

let configured = false;

export function isPushConfigured() {
  return Boolean(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY);
}

function ensureConfigured() {
  if (!configured && isPushConfigured()) {
    webpush.setVapidDetails(env.VAPID_SUBJECT, env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, env.VAPID_PRIVATE_KEY!);
    configured = true;
  }
  return configured;
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  const admin = createAdminSupabaseClient();
  if (!admin || !ensureConfigured()) {
    return { sent: 0, skipped: "push-not-configured" as const };
  }

  const { data, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);
  if (error || !data?.length) {
    return { sent: 0 };
  }

  let sent = 0;
  const expired: string[] = [];
  await Promise.all(
    data.map(async (row) => {
      try {
        await webpush.sendNotification(
          { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60 * 24 }
        );
        sent += 1;
      } catch (pushError) {
        const status = (pushError as { statusCode?: number }).statusCode;
        // 404/410: the browser unsubscribed or the phone was reset; forget it.
        if (status === 404 || status === 410) {
          expired.push(row.id);
        } else {
          console.error("push failed", status, (pushError as Error).message);
        }
      }
    })
  );

  if (expired.length) {
    await admin.from("push_subscriptions").delete().in("id", expired);
  }
  if (sent) {
    await admin
      .from("push_subscriptions")
      .update({ last_used_at: new Date().toISOString() })
      .eq("user_id", userId);
  }

  return { sent };
}
