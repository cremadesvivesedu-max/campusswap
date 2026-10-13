import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { resend } from "@/lib/email/resend";
import { getSiteUrl } from "@/lib/site-url";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import {
  messagePreview,
  preferenceForNotificationType,
  renderNotificationEmail,
  shouldEmailForMessage,
  wantsEmail
} from "@/server/services/email-notifications";
import { sendPushToUser } from "@/server/services/push";

// Called by two Supabase database webhooks (INSERT on public.messages and on
// public.notifications). Sends a push notification to the person's devices (if they
// turned it on) and the matching email through Resend.

export const runtime = "nodejs";

type WebhookPayload = {
  type?: string;
  table?: string;
  record?: Record<string, unknown> | null;
};

function isAuthorized(request: Request) {
  const expected = env.NOTIFY_WEBHOOK_SECRET;
  const received = request.headers.get("x-webhook-secret");
  if (!expected || !received) {
    return false;
  }
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function loadRecipient(admin: NonNullable<ReturnType<typeof createAdminSupabaseClient>>, userId: string) {
  const [{ data: user }, { data: profile }] = await Promise.all([
    admin.from("users").select("email").eq("id", userId).maybeSingle(),
    admin.from("profiles").select("full_name, notification_preferences").eq("user_id", userId).maybeSingle()
  ]);
  return {
    email: (user?.email as string | undefined) ?? null,
    name: (profile?.full_name as string | undefined) ?? "",
    preferences: profile?.notification_preferences ?? []
  };
}

async function send(to: string, subject: string, email: { html: string; text: string }) {
  if (!resend) {
    return { skipped: "resend-not-configured" };
  }
  const { error } = await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html: email.html, text: email.text });
  if (error) {
    throw new Error(error.message);
  }
  return { sent: true };
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminSupabaseClient();
  if (!admin) {
    return NextResponse.json({ skipped: "supabase-admin-not-configured" });
  }

  const payload = (await request.json().catch(() => ({}))) as WebhookPayload;
  const record = payload.record ?? {};
  const siteUrl = getSiteUrl();

  try {
    if (payload.type === "INSERT" && payload.table === "messages") {
      const { data: conversation } = await admin
        .from("conversations")
        .select("id, listing_id, buyer_id, seller_id, buyer_unread_count, seller_unread_count")
        .eq("id", String(record.conversation_id ?? ""))
        .maybeSingle();
      if (!conversation) {
        return NextResponse.json({ skipped: "conversation-not-found" });
      }

      const senderId = String(record.sender_id ?? "");
      const recipientIsSeller = senderId === conversation.buyer_id;
      const recipientId = String(recipientIsSeller ? conversation.seller_id : conversation.buyer_id);
      const unread = Number(recipientIsSeller ? conversation.seller_unread_count : conversation.buyer_unread_count) || 0;

      const recipient = await loadRecipient(admin, recipientId);
      if (!wantsEmail(recipient.preferences, "messages")) {
        return NextResponse.json({ skipped: "opted-out" });
      }

      const [{ data: listing }, sender] = await Promise.all([
        admin.from("listings").select("title").eq("id", conversation.listing_id).maybeSingle(),
        loadRecipient(admin, senderId)
      ]);
      const senderName = sender.name.split(" ")[0] || "Someone";
      const listingTitle = (listing?.title as string | undefined) ?? "your listing";
      const preview = messagePreview(String(record.text ?? ""), Boolean(record.attachment_url));

      // Push goes out for every message (one notification per chat, replaced in place);
      // email only for the first unread message of a burst.
      const push = await sendPushToUser(recipientId, {
        title: `${senderName} · ${listingTitle}`,
        body: preview || "Sent you a message.",
        url: `/app/messages/${conversation.id}`,
        tag: `conversation-${conversation.id}`
      });
      if (!recipient.email || !shouldEmailForMessage(unread)) {
        return NextResponse.json({ push, email: "skipped" });
      }

      const email = renderNotificationEmail({
        heading: `${senderName} sent you a message about ${listingTitle}`,
        body: preview || "Open the chat to read it.",
        ctaLabel: "Reply on CampusSwap",
        ctaUrl: `${siteUrl}/app/messages/${conversation.id}`,
        siteUrl
      });
      return NextResponse.json({ push, email: await send(recipient.email, `New message about ${listingTitle}`, email) });
    }

    if (payload.type === "INSERT" && payload.table === "notifications") {
      const recipient = await loadRecipient(admin, String(record.user_id ?? ""));
      const preference = preferenceForNotificationType(
        String(record.type ?? ""),
        String(record.title ?? "")
      );
      if (!wantsEmail(recipient.preferences, preference)) {
        return NextResponse.json({ skipped: "opted-out" });
      }

      const title = String(record.title ?? "CampusSwap update");
      const href = String(record.destination_href ?? "") || "/app/notifications";
      const push = await sendPushToUser(String(record.user_id ?? ""), {
        title,
        body: String(record.body ?? ""),
        url: href.startsWith("/") ? href : "/app/notifications"
      });
      if (!recipient.email) {
        return NextResponse.json({ push, email: "skipped" });
      }
      const email = renderNotificationEmail({
        heading: title,
        body: String(record.body ?? ""),
        ctaLabel: "Open CampusSwap",
        ctaUrl: href.startsWith("/") ? `${siteUrl}${href}` : `${siteUrl}/app/notifications`,
        siteUrl
      });
      return NextResponse.json({ push, email: await send(recipient.email, title, email) });
    }

    return NextResponse.json({ skipped: "ignored-event" });
  } catch (error) {
    console.error("notify-email failed", error);
    return NextResponse.json({ error: "send-failed" }, { status: 500 });
  }
}
