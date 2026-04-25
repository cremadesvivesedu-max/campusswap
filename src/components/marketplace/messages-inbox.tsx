"use client";

import { useMemo } from "react";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
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
  const { previews, isLoading, error } = useLiveConversationPreviews(currentUserId, {
    limit: 12
  });
  const safePreviews = useMemo(
    () => previews.filter(isRenderablePreview),
    [previews]
  );

  if (error) {
    return (
      <EmptyState
        title={dictionary.messages.inbox.loadErrorTitle}
        description={error}
      />
    );
  }

  if (isLoading && !safePreviews.length) {
    return (
      <Card className="border-dashed border-slate-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.92))]">
        <CardContent className="space-y-2 p-6">
          <p className="font-display text-2xl font-semibold text-slate-950">
            {dictionary.messages.inbox.recentTitle}
          </p>
          <p className="max-w-2xl text-sm leading-7 text-slate-600">
            {dictionary.messages.description}
          </p>
        </CardContent>
      </Card>
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
