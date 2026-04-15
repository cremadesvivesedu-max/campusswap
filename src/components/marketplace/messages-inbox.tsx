"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { MessagePreview } from "@/components/marketplace/message-preview";
import { useLocale } from "@/components/providers/locale-provider";
import { useDemoConversations } from "@/features/messaging/demo-messaging-store";
import { useLiveConversationPreviews } from "@/features/messaging/live-messaging";
import { demoData } from "@/lib/demo-data";
import { isLiveClientMode } from "@/lib/public-env";
import type { ConversationPreview } from "@/types/domain";

function isRenderablePreview(
  preview: ConversationPreview | undefined | null
): preview is ConversationPreview {
  return Boolean(
    preview?.conversation?.id &&
      preview?.listing?.id &&
      preview?.counterpart?.id &&
      preview?.counterpart?.profile?.fullName
  );
}

export function MessagesInbox({ currentUserId }: { currentUserId: string }) {
  if (isLiveClientMode) {
    return <LiveMessagesInbox currentUserId={currentUserId} />;
  }

  return <DemoMessagesInbox currentUserId={currentUserId} />;
}

function DemoMessagesInbox({ currentUserId }: { currentUserId: string }) {
  const { dictionary } = useLocale();
  const conversations = useDemoConversations(currentUserId);
  const previews = conversations
    .map((conversation) => {
      const listing = demoData.listings.find(
        (candidate) => candidate.id === conversation.listingId
      );
      const counterpartId =
        conversation.sellerId === currentUserId
          ? conversation.buyerId
          : conversation.sellerId;
      const counterpart = demoData.users.find((candidate) => candidate.id === counterpartId);

      if (!listing || !counterpart) {
        return undefined;
      }

      return {
        conversation,
        listing,
        counterpart,
        latestMessage: conversation.messages[conversation.messages.length - 1],
        unreadCount: conversation.unreadCount
      };
    })
    .filter(isRenderablePreview);

  if (!previews.length) {
    return (
      <EmptyState
        title={dictionary.messages.inbox.emptyTitle}
        description={dictionary.messages.inbox.emptyDescription}
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {previews.map((preview) =>
        preview ? <MessagePreview key={preview.conversation.id} preview={preview} /> : null
      )}
    </div>
  );
}

function LiveMessagesInbox({ currentUserId }: { currentUserId: string }) {
  const { dictionary } = useLocale();
  const { previews, error } = useLiveConversationPreviews(currentUserId);
  const safePreviews = previews.filter(isRenderablePreview);

  if (error) {
    return (
      <EmptyState
        title={dictionary.messages.inbox.loadErrorTitle}
        description={error}
      />
    );
  }

  if (!safePreviews.length) {
    return (
      <EmptyState
        title={dictionary.messages.inbox.emptyTitle}
        description={dictionary.messages.inbox.emptyDescription}
      />
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {safePreviews.map((preview) => (
        <MessagePreview key={preview.conversation.id} preview={preview} />
      ))}
    </div>
  );
}
