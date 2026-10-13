// Decides which in-app events also go out by email, and what the email says.
// Pure functions so the rules stay testable; the webhook route does the I/O.

export type EmailPreference =
  | "messages"
  | "listing_updates"
  | "saved_searches"
  | "featured_digest"
  | "promotions";

const notificationTypePreference: Record<string, EmailPreference | null> = {
  message: "messages",
  listing: "listing_updates",
  review: "listing_updates",
  promotion: "promotions",
  // Safety and system notices always go out.
  safety: null,
  system: null
};

/** An empty preference list means the person never opened the settings: treat it as "all on". */
export function wantsEmail(preferences: unknown, preference: EmailPreference | null) {
  if (preference === null) {
    return true;
  }
  if (!Array.isArray(preferences) || preferences.length === 0) {
    return true;
  }
  return preferences.includes(preference);
}

export function preferenceForNotificationType(type: string): EmailPreference | null {
  return type in notificationTypePreference ? notificationTypePreference[type] : "listing_updates";
}

/**
 * One email per conversation burst: only the first unread message triggers it.
 * The `on_message_created` trigger has already bumped the recipient's unread count.
 */
export function shouldEmailForMessage(recipientUnreadCount: number) {
  return recipientUnreadCount <= 1;
}

export function messagePreview(text: string, hasAttachment: boolean) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) {
    return hasAttachment ? "Sent you a photo." : "";
  }
  return clean.length > 160 ? `${clean.slice(0, 157)}…` : clean;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char
  );

export function renderNotificationEmail({
  heading,
  body,
  ctaLabel,
  ctaUrl,
  siteUrl
}: {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  siteUrl: string;
}) {
  const settingsUrl = `${siteUrl}/app/settings`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden">
<tr><td style="background:#203860;padding:18px 24px"><img src="${siteUrl}/brand/campusswap-logo-light.png" alt="CampusSwap" height="36" style="display:block;height:36px"></td></tr>
<tr><td style="padding:28px 24px 8px"><h1 style="margin:0 0 12px;font-size:20px;line-height:1.3">${escapeHtml(heading)}</h1>
<p style="margin:0;font-size:15px;line-height:1.6;color:#334155">${escapeHtml(body)}</p></td></tr>
<tr><td style="padding:20px 24px 28px"><a href="${ctaUrl}" style="display:inline-block;background:#3db070;color:#0f172a;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">${escapeHtml(ctaLabel)}</a></td></tr>
</table>
<p style="max-width:520px;font-size:12px;line-height:1.5;color:#64748b;margin:16px auto 0">You get this email because of your CampusSwap account. Change which emails you receive in <a href="${settingsUrl}" style="color:#64748b">Settings</a>.</p>
</td></tr></table></body></html>`;
  const text = `${heading}\n\n${body}\n\n${ctaLabel}: ${ctaUrl}\n\nChange which emails you receive: ${settingsUrl}`;
  return { html, text };
}
