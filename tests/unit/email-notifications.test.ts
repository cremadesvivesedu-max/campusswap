import {
  messagePreview,
  preferenceForNotificationType,
  renderNotificationEmail,
  shouldEmailForMessage,
  wantsEmail
} from "@/server/services/email-notifications";

describe("email notifications", () => {
  it("emails only the first unread message of a burst", () => {
    expect(shouldEmailForMessage(1)).toBe(true);
    expect(shouldEmailForMessage(2)).toBe(false);
  });

  it("treats an empty preference list as everything on", () => {
    expect(wantsEmail([], "messages")).toBe(true);
    expect(wantsEmail(["promotions"], "messages")).toBe(false);
    expect(wantsEmail(["messages"], "messages")).toBe(true);
  });

  it("always sends safety and system notices", () => {
    expect(preferenceForNotificationType("safety")).toBeNull();
    expect(wantsEmail(["promotions"], preferenceForNotificationType("system"))).toBe(true);
  });

  it("maps listing activity to listing updates", () => {
    expect(preferenceForNotificationType("listing")).toBe("listing_updates");
    expect(preferenceForNotificationType("promotion")).toBe("promotions");
  });

  it("shortens long previews and describes photo-only messages", () => {
    expect(messagePreview("a".repeat(200), false)).toHaveLength(158);
    expect(messagePreview("  ", true)).toBe("Sent you a photo.");
  });

  it("escapes user text in the email", () => {
    const { html, text } = renderNotificationEmail({
      heading: "New message",
      body: "<script>alert(1)</script>",
      ctaLabel: "Reply",
      ctaUrl: "https://example.com/app/messages/1",
      siteUrl: "https://example.com"
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(text).toContain("https://example.com/app/messages/1");
  });
});
