"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingImage } from "@/components/marketplace/listing-image";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import {
  createAttachmentFromFile,
  sendConversationMessage,
  useDemoConversation
} from "@/features/messaging/demo-messaging-store";
import {
  sendLiveConversationMessage,
  useLiveConversationThread
} from "@/features/messaging/live-messaging";
import { demoData } from "@/lib/demo-data";
import { isLiveClientMode } from "@/lib/public-env";

interface ConversationThreadProps {
  conversationId: string;
  currentUserId: string;
}

export function ConversationThread({
  conversationId,
  currentUserId
}: ConversationThreadProps) {
  if (isLiveClientMode) {
    return (
      <LiveConversationThread
        conversationId={conversationId}
        currentUserId={currentUserId}
      />
    );
  }

  return (
    <DemoConversationThread
      conversationId={conversationId}
      currentUserId={currentUserId}
    />
  );
}

function ConversationShell({
  listingHref,
  listingTitle,
  listingDescription,
  listingPickupArea,
  listingImageSrc,
  listingImageAlt,
  sellerName,
  sellerAvatar,
  sellerId,
  messages,
  quickActions,
  currentUserId,
  onSend,
  error,
  isPending,
  supportsAttachments
}: {
  listingHref: string;
  listingTitle: string;
  listingDescription: string;
  listingPickupArea: string;
  listingImageSrc?: string;
  listingImageAlt: string;
  sellerName: string;
  sellerAvatar?: string;
  sellerId: string;
  messages: {
    id: string;
    senderId: string;
    text: string;
    sentAt: string;
    attachmentName?: string;
    attachmentUrl?: string;
  }[];
  quickActions: string[];
  currentUserId: string;
  onSend: (text: string, file?: File) => void;
  error: string | null;
  isPending: boolean;
  supportsAttachments: boolean;
}) {
  const [composerValue, setComposerValue] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.72fr_0.28fr]">
      <div className="space-y-4">
        <Card className="overflow-hidden bg-white">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-full overflow-hidden rounded-3xl bg-slate-100 sm:w-28">
              <ListingImage
                src={listingImageSrc}
                alt={listingImageAlt}
                className="h-full w-full"
                sizes="160px"
              />
            </div>
            <div className="space-y-2">
              <Link
                href={listingHref}
                className="font-display text-2xl font-semibold text-slate-950"
              >
                {listingTitle}
              </Link>
              <Link
                href={`/app/profile?userId=${sellerId}`}
                className="inline-flex items-center gap-3 text-sm text-slate-600"
              >
                <ProfileAvatar
                  userId={sellerId}
                  name={sellerName}
                  src={sellerAvatar}
                  className="h-10 w-10"
                />
                {sellerName}
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="space-y-4 p-4 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Thread
            </p>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[28px] px-4 py-3 text-sm leading-7 ${
                      isOwnMessage
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {message.text ? <p>{message.text}</p> : null}
                    {message.attachmentUrl && message.attachmentName ? (
                      <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={message.attachmentUrl}
                          alt={message.attachmentName}
                          className="max-h-64 w-full object-cover"
                        />
                        <p className="px-3 py-2 text-xs">{message.attachmentName}</p>
                      </div>
                    ) : null}
                    <p
                      className={`mt-2 text-xs ${
                        isOwnMessage ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {new Date(message.sentAt).toLocaleString("en-GB", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="sticky bottom-4 bg-white">
          <CardContent className="space-y-4 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Quick replies
            </p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                  onClick={() => onSend(action)}
                  disabled={isPending}
                >
                  {action}
                </button>
              ))}
            </div>

            {supportsAttachments && pendingAttachment ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Attachment ready: {pendingAttachment.name}
              </div>
            ) : null}

            <div className="flex flex-col gap-3">
              <Textarea
                value={composerValue}
                onChange={(event) => setComposerValue(event.target.value)}
                placeholder="Write a message about timing, price, or pickup details"
                className="min-h-[110px]"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {supportsAttachments ? (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          setPendingAttachment(event.target.files?.[0] ?? null)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Paperclip className="mr-2 h-4 w-4" />
                        Attach
                      </Button>
                    </>
                  ) : null}
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    onSend(composerValue, pendingAttachment ?? undefined);
                    setComposerValue("");
                    setPendingAttachment(null);
                  }}
                  disabled={isPending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {isPending ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>

            {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="bg-white">
          <CardContent className="space-y-3 p-6 text-sm leading-7 text-slate-600">
            <p className="font-display text-xl font-semibold text-slate-950">
              Listing context
            </p>
            <p>{listingDescription}</p>
            <p>Pickup area: {listingPickupArea}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-950 text-white">
          <CardContent className="space-y-3 p-6 text-sm leading-7 text-slate-300">
            <p className="font-display text-xl font-semibold text-white">
              Meetup safely
            </p>
            <p>
              Prefer campus-adjacent or high-footfall pickup spots and keep
              listing-linked chat active until the handoff is done.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DemoConversationThread({
  conversationId,
  currentUserId
}: ConversationThreadProps) {
  const conversation = useDemoConversation(conversationId);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const listing = useMemo(
    () => demoData.listings.find((candidate) => candidate.id === conversation?.listingId),
    [conversation?.listingId]
  );
  const seller = useMemo(
    () => demoData.users.find((candidate) => candidate.id === conversation?.sellerId),
    [conversation?.sellerId]
  );

  if (!conversation || !listing || !seller) {
    return (
      <EmptyState
        title="Conversation unavailable"
        description="The chat context could not be loaded. Try opening the listing again and starting a new message."
      />
    );
  }

  return (
    <ConversationShell
      listingHref={`/app/listings/${listing.id}`}
      listingTitle={listing.title}
      listingDescription={listing.description}
      listingPickupArea={listing.pickupArea}
      listingImageSrc={listing.images[0]?.url}
      listingImageAlt={listing.images[0]?.alt ?? listing.title}
      sellerName={seller.profile.fullName}
      sellerAvatar={seller.avatar}
      sellerId={seller.id}
      messages={conversation.messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        text: message.text,
        sentAt: message.sentAt,
        attachmentName: message.attachment?.name,
        attachmentUrl: message.attachment?.url
      }))}
      quickActions={conversation.quickActions}
      currentUserId={currentUserId}
      onSend={(text, file) => {
        startTransition(async () => {
          try {
            setError(null);
            const attachment = file ? await createAttachmentFromFile(file) : undefined;
            await sendConversationMessage(conversation.id, currentUserId, text, attachment);
          } catch (caughtError) {
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : "Unable to send the message right now."
            );
          }
        });
      }}
      error={error}
      isPending={isPending}
      supportsAttachments
    />
  );
}

function LiveConversationThread({
  conversationId,
  currentUserId
}: ConversationThreadProps) {
  const { thread, error: threadError } = useLiveConversationThread(
    conversationId,
    currentUserId
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!thread) {
    return (
      <EmptyState
        title="Conversation unavailable"
        description={threadError ?? "The conversation is still loading or no longer exists."}
      />
    );
  }

  return (
    <ConversationShell
      listingHref={`/app/listings/${thread.listing.id}`}
      listingTitle={thread.listing.title}
      listingDescription={thread.listing.description}
      listingPickupArea={thread.listing.pickupArea}
      listingImageSrc={thread.listing.images[0]?.url}
      listingImageAlt={thread.listing.images[0]?.alt ?? thread.listing.title}
      sellerName={thread.seller.profile.fullName}
      sellerAvatar={thread.seller.avatar}
      sellerId={thread.seller.id}
      messages={thread.messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        text: message.text,
        sentAt: message.sentAt
      }))}
      quickActions={thread.conversation.quickActions}
      currentUserId={currentUserId}
      onSend={(text) => {
        startTransition(async () => {
          try {
            setError(null);
            await sendLiveConversationMessage(conversationId, currentUserId, text);
          } catch (caughtError) {
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : "Unable to send the message right now."
            );
          }
        });
      }}
      error={error ?? threadError}
      isPending={isPending}
      supportsAttachments={false}
    />
  );
}
