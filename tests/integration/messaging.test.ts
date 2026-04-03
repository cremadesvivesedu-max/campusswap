import { beforeEach, describe, expect, it } from "vitest";
import {
  ensureConversationForListing,
  getConversationById,
  sendConversationMessage
} from "@/features/messaging/demo-messaging-store";

describe("demo messaging store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("reuses an existing listing conversation", async () => {
    const conversation = await ensureConversationForListing(
      "listing-bike-1",
      "user-omar",
      "user-lina"
    );

    expect(conversation.id).toBe("conv-bike");
  });

  it("creates a new listing conversation and appends messages", async () => {
    const conversation = await ensureConversationForListing(
      "listing-monitor-1",
      "user-omar",
      "user-sanne"
    );

    expect(conversation.id).toBe(
      "conv-listing-monitor-1-user-omar-user-sanne"
    );

    await sendConversationMessage(conversation.id, "user-omar", "Still available?");

    const updatedConversation = getConversationById(conversation.id);
    expect(updatedConversation?.messages.at(-1)?.text).toBe("Still available?");
  });
});
