import type { Notification } from "@/types/domain";

export type NotificationDestinationKind =
  | "listing"
  | "messages"
  | "notifications"
  | "saved"
  | "search"
  | "purchases"
  | "my-listings";

export interface NotificationDestination {
  href: string;
  kind: NotificationDestinationKind;
}

function inferKindFromHref(href: string): NotificationDestinationKind {
  if (href.startsWith("/app/messages")) {
    return "messages";
  }

  if (href.startsWith("/app/my-purchases")) {
    return "purchases";
  }

  if (href.startsWith("/app/my-listings") || href.startsWith("/app/sell")) {
    return "my-listings";
  }

  if (href.startsWith("/app/saved")) {
    return "saved";
  }

  if (href.startsWith("/app/search")) {
    return "search";
  }

  if (href.startsWith("/app/listings/")) {
    return "listing";
  }

  return "notifications";
}

export function resolveNotificationDestination(
  notification: Notification
): NotificationDestination {
  if (notification.destinationHref?.trim()) {
    const href = notification.destinationHref.trim();

    return {
      href,
      kind: inferKindFromHref(href)
    };
  }

  const searchableText = `${notification.title} ${notification.body}`.toLowerCase();

  if (notification.type === "message") {
    return {
      href: "/app/messages",
      kind: "messages"
    };
  }

  if (notification.type === "review") {
    return {
      href: "/app/my-purchases",
      kind: "purchases"
    };
  }

  if (notification.type === "promotion") {
    return {
      href: "/app/my-listings",
      kind: "my-listings"
    };
  }

  if (notification.type === "listing") {
    if (searchableText.includes("shortlist")) {
      return {
        href: "/app/saved",
        kind: "saved"
      };
    }

    if (searchableText.includes("saved search") || searchableText.includes("price drop")) {
      return {
        href: "/app/search",
        kind: "search"
      };
    }

    if (
      searchableText.includes("saved your listing") ||
      searchableText.includes("featured") ||
      searchableText.includes("promotion") ||
      searchableText.includes("listing removed") ||
      searchableText.includes("listing deleted")
    ) {
      return {
        href: "/app/my-listings",
        kind: "my-listings"
      };
    }

    if (
      searchableText.includes("reserved") ||
      searchableText.includes("order") ||
      searchableText.includes("exchange") ||
      searchableText.includes("purchase")
    ) {
      return {
        href: "/app/my-purchases",
        kind: "purchases"
      };
    }
  }

  return {
    href: "/app/notifications",
    kind: "notifications"
  };
}
