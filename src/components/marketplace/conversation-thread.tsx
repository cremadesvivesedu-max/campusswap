"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { Paperclip, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingImage } from "@/components/marketplace/listing-image";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { StarRating } from "@/components/shared/star-rating";
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
import { formatCurrency } from "@/lib/utils";
import { isLiveClientMode } from "@/lib/public-env";
import {
  cancelTransactionAction,
  completeTransactionAction,
  releaseReservationAction,
  reserveConversationBuyerAction
} from "@/server/actions/marketplace";
import type { Transaction, User } from "@/types/domain";

interface ConversationThreadProps {
  conversationId: string;
  currentUserId: string;
}

interface ConversationShellProps {
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
  sidebar: ReactNode;
}

function formatTransactionState(state?: string) {
  switch (state) {
    case "hidden":
      return "Removed";
    case "sold":
      return "Sold";
    case "archived":
      return "Archived";
    case "pending-review":
      return "Pending review";
    case "inquiry":
      return "Conversation started";
    case "negotiating":
      return "Purchase requested";
    case "reserved":
      return "Reserved";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "reported":
      return "Reported";
    default:
      return "Chat only";
  }
}

function formatDateTime(value?: string) {
  if (!value) {
    return undefined;
  }

  return new Date(value).toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function ExchangePanel({
  conversationId,
  currentUserId,
  listingStatus,
  transaction,
  buyer,
  seller
}: {
  conversationId: string;
  currentUserId: string;
  listingStatus: string;
  transaction?: Transaction;
  buyer: User;
  seller: User;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isSeller = seller.id === currentUserId;
  const counterpart = isSeller ? buyer : seller;

  const runAction = (action: () => Promise<{ success: boolean; message: string }>) => {
    startTransition(async () => {
      try {
        setActionError(null);
        setFeedback(null);
        const result = await action();

        if (!result.success) {
          setActionError(result.message);
          return;
        }

        setFeedback(result.message);
        router.refresh();
      } catch (error) {
        setActionError(
          error instanceof Error ? error.message : "Unable to update the exchange right now."
        );
      }
    });
  };

  const stateLabel = formatTransactionState(transaction?.state);
  const canReserve = isSeller && (!transaction || ["inquiry", "negotiating"].includes(transaction.state));
  const canRelease = isSeller && transaction?.state === "reserved";
  const canComplete = isSeller && !!transaction && ["inquiry", "negotiating", "reserved"].includes(transaction.state);
  const canCancel = !!transaction && transaction.state !== "completed" && transaction.state !== "cancelled";

  return (
    <Card className="bg-white">
      <CardContent className="space-y-4 p-6 text-sm leading-7 text-slate-600">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl font-semibold text-slate-950">Exchange status</p>
            <p className="text-sm text-slate-500">
              {isSeller
                ? "Reserve this item for the buyer in this thread, then mark it sold after the meetup."
                : "Use this thread to confirm the meetup. Online payment is not taken in this MVP."}
            </p>
          </div>
          <Badge className="bg-slate-950 text-white">{stateLabel}</Badge>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              userId={counterpart.id}
              name={counterpart.profile.fullName}
              src={counterpart.avatar}
              className="h-12 w-12"
            />
            <div>
              <p className="font-medium text-slate-950">
                {isSeller ? `Buyer: ${counterpart.profile.fullName}` : `Seller: ${counterpart.profile.fullName}`}
              </p>
              <StarRating
                rating={counterpart.profile.ratingAverage}
                reviewCount={counterpart.profile.reviewCount}
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <p>Listing status: {listingStatus}</p>
            <p>Price: {transaction ? formatCurrency(transaction.amount) : "Pending confirmation"}</p>
            <p>Meetup area: {transaction?.meetupSpot ?? "To be agreed in chat"}</p>
            <p>Meetup window: {transaction?.meetupWindow ?? "To be scheduled"}</p>
            {transaction?.reservedAt ? <p>Reserved at: {formatDateTime(transaction.reservedAt)}</p> : null}
            {transaction?.completedAt ? <p>Completed at: {formatDateTime(transaction.completedAt)}</p> : null}
            {transaction?.cancelledAt ? <p>Cancelled at: {formatDateTime(transaction.cancelledAt)}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canReserve ? (
            <Button
              type="button"
              onClick={() => runAction(() => reserveConversationBuyerAction(conversationId))}
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Reserve for this buyer"}
            </Button>
          ) : null}
          {canRelease && transaction ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => runAction(() => releaseReservationAction(transaction.id))}
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Release reservation"}
            </Button>
          ) : null}
          {canComplete && transaction ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => runAction(() => completeTransactionAction(transaction.id))}
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Mark sold"}
            </Button>
          ) : null}
          {canCancel && transaction ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!window.confirm("Cancel this exchange and reopen the listing if needed?")) {
                  return;
                }

                runAction(() => cancelTransactionAction(transaction.id));
              }}
              disabled={isPending}
            >
              {isPending ? "Updating..." : "Cancel exchange"}
            </Button>
          ) : null}
          {transaction?.conversationId ? (
            <Button asChild type="button" variant="ghost">
              <Link href={`/app/listings/${transaction.listingId}`}>Open listing</Link>
            </Button>
          ) : null}
        </div>

        {feedback ? <p className="text-sm font-medium text-emerald-700">{feedback}</p> : null}
        {actionError ? <p className="text-sm font-medium text-rose-700">{actionError}</p> : null}
      </CardContent>
    </Card>
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
  supportsAttachments,
  sidebar
}: ConversationShellProps) {
  const [composerValue, setComposerValue] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

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
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Live thread
              </p>
              <p className="text-xs text-slate-500">
                New messages appear here automatically.
              </p>
            </div>

            <div className="max-h-[58vh] space-y-4 overflow-y-auto pr-1">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[28px] px-4 py-3 text-sm leading-7 shadow-sm ${
                        isOwnMessage
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-slate-100 text-slate-700"
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
              <div ref={messagesBottomRef} />
            </div>
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
                  ) : (
                    <Button type="button" variant="outline" disabled>
                      <Paperclip className="mr-2 h-4 w-4" />
                      Attach coming soon
                    </Button>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (!composerValue.trim() && !pendingAttachment) {
                      return;
                    }

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
        {sidebar}
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
      sidebar={
        <Card className="bg-white">
          <CardContent className="space-y-3 p-6 text-sm leading-7 text-slate-600">
            <p className="font-display text-xl font-semibold text-slate-950">
              Demo exchange state
            </p>
            <p>
              Switch to live mode to persist reservation, sold state, and mutual
              review eligibility inside this conversation.
            </p>
          </CardContent>
        </Card>
      }
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
      sidebar={
        <ExchangePanel
          conversationId={conversationId}
          currentUserId={currentUserId}
          listingStatus={thread.listing.status}
          transaction={thread.transaction}
          buyer={thread.buyer}
          seller={thread.seller}
        />
      }
    />
  );
}
