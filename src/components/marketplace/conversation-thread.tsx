"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { useLocale } from "@/components/providers/locale-provider";
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
import {
  getExchangeStatusLabel,
  getLocalizedQuickAction
} from "@/lib/i18n-shared";
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
  onSend: (text: string, files: File[]) => void;
  error: string | null;
  isPending: boolean;
  supportsAttachments: boolean;
  sidebar: ReactNode;
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
  const { dictionary } = useLocale();
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

  const stateLabel = transaction?.state
    ? getExchangeStatusLabel(dictionary, transaction.state)
    : dictionary.messages.exchange.chatOnly;
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
                ? dictionary.messages.exchange.sellerBody
                : dictionary.messages.exchange.buyerBody}
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
                {isSeller
                  ? `${dictionary.messages.exchange.buyerLabel}: ${counterpart.profile.fullName}`
                  : `${dictionary.messages.exchange.sellerLabel}: ${counterpart.profile.fullName}`}
              </p>
              <StarRating
                rating={counterpart.profile.ratingAverage}
                reviewCount={counterpart.profile.reviewCount}
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-600">
            <p>{dictionary.messages.exchange.listingStatus}: {listingStatus}</p>
            <p>{dictionary.messages.exchange.price}: {transaction ? formatCurrency(transaction.amount) : dictionary.messages.exchange.pricePending}</p>
            <p>{dictionary.messages.exchange.meetupArea}: {transaction?.meetupSpot ?? dictionary.messages.exchange.meetupTbd}</p>
            <p>{dictionary.messages.exchange.meetupWindow}: {transaction?.meetupWindow ?? dictionary.messages.exchange.windowTbd}</p>
            {transaction?.reservedAt ? <p>{dictionary.messages.exchange.reservedAt}: {formatDateTime(transaction.reservedAt)}</p> : null}
            {transaction?.completedAt ? <p>{dictionary.messages.exchange.completedAt}: {formatDateTime(transaction.completedAt)}</p> : null}
            {transaction?.cancelledAt ? <p>{dictionary.messages.exchange.cancelledAt}: {formatDateTime(transaction.cancelledAt)}</p> : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {canReserve ? (
            <Button
              type="button"
              onClick={() => runAction(() => reserveConversationBuyerAction(conversationId))}
              disabled={isPending}
            >
              {isPending ? dictionary.common.actions.updating : dictionary.messages.exchange.reserveForBuyer}
            </Button>
          ) : null}
          {canRelease && transaction ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => runAction(() => releaseReservationAction(transaction.id))}
              disabled={isPending}
            >
              {isPending ? dictionary.common.actions.updating : dictionary.messages.exchange.releaseReservation}
            </Button>
          ) : null}
          {canComplete && transaction ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => runAction(() => completeTransactionAction(transaction.id))}
              disabled={isPending}
            >
              {isPending ? dictionary.common.actions.updating : dictionary.messages.exchange.markSold}
            </Button>
          ) : null}
          {canCancel && transaction ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (!window.confirm(dictionary.messages.exchange.confirmCancel)) {
                  return;
                }

                runAction(() => cancelTransactionAction(transaction.id));
              }}
              disabled={isPending}
            >
              {isPending ? dictionary.common.actions.updating : dictionary.messages.exchange.cancelExchange}
            </Button>
          ) : null}
          {transaction?.conversationId ? (
            <Button asChild type="button" variant="ghost">
              <Link href={`/app/listings/${transaction.listingId}`}>
                {dictionary.common.actions.openListing}
              </Link>
            </Button>
          ) : null}
          {transaction?.state === "completed" ? (
            <Button asChild type="button" variant="outline">
              <Link href="/app/my-purchases">{dictionary.messages.exchange.completedReviewCta}</Link>
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
  const { dictionary } = useLocale();
  const [composerValue, setComposerValue] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const previousMessageCountRef = useRef(0);

  useEffect(() => {
    const container = messageListRef.current;

    if (!container) {
      return;
    }

    const isFirstPaint = previousMessageCountRef.current === 0;
    const distanceToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const shouldStickToBottom = isFirstPaint || distanceToBottom < 120;

    if (shouldStickToBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: isFirstPaint ? "auto" : "smooth"
      });
    }

    previousMessageCountRef.current = messages.length;
  }, [messages.length]);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.72fr)_minmax(300px,0.28fr)]">
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
              <p className="text-sm leading-6 text-slate-500">{listingPickupArea}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden bg-white">
          <div className="flex min-h-[min(78dvh,760px)] flex-col">
            <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {dictionary.messages.thread.liveThread}
                </p>
                <p className="text-xs text-slate-500">{dictionary.messages.thread.autoUpdate}</p>
              </div>
            </div>

            <div
              ref={messageListRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6"
            >
              {messages.map((message) => {
                const isOwnMessage = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-[28px] px-4 py-3 text-sm leading-7 shadow-sm sm:max-w-[78%] ${
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
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {dictionary.messages.thread.quickReplies}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                        onClick={() => onSend(action, [])}
                        disabled={isPending}
                      >
                        {getLocalizedQuickAction(dictionary, action)}
                      </button>
                    ))}
                  </div>
                </div>

                {supportsAttachments && pendingAttachments.length ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <p className="font-medium text-slate-900">
                          {dictionary.messages.thread.attachmentReady}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {pendingAttachments.map((file) => (
                            <span
                              key={`${file.name}-${file.size}`}
                              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700"
                            >
                              {file.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
                        onClick={() => {
                          setPendingAttachments([]);

                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        aria-label="Clear attachments"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-col gap-3">
                  <Textarea
                    value={composerValue}
                    onChange={(event) => setComposerValue(event.target.value)}
                    placeholder={dictionary.messages.thread.messagePlaceholder}
                    className="min-h-[112px] resize-none"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {supportsAttachments ? (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(event) =>
                              setPendingAttachments(
                                Array.from(event.target.files ?? []).filter((file) =>
                                  file.type.startsWith("image/")
                                )
                              )
                            }
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Paperclip className="mr-2 h-4 w-4" />
                            {dictionary.messages.thread.attach}
                          </Button>
                        </>
                      ) : (
                        <Button type="button" variant="outline" disabled>
                          <Paperclip className="mr-2 h-4 w-4" />
                          {dictionary.messages.thread.attachSoon}
                        </Button>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        if (!composerValue.trim() && !pendingAttachments.length) {
                          return;
                        }

                        onSend(composerValue, pendingAttachments);
                        setComposerValue("");
                        setPendingAttachments([]);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      disabled={isPending}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {isPending ? dictionary.messages.thread.sending : dictionary.messages.thread.send}
                    </Button>
                  </div>
                </div>

                {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="bg-white">
          <CardContent className="space-y-3 p-6 text-sm leading-7 text-slate-600">
            <p className="font-display text-xl font-semibold text-slate-950">
              {dictionary.messages.thread.listingContext}
            </p>
            <p>{listingDescription}</p>
            <p>{dictionary.messages.thread.pickupArea}: {listingPickupArea}</p>
          </CardContent>
        </Card>
        {sidebar}
        <Card className="bg-slate-950 text-white">
          <CardContent className="space-y-3 p-6 text-sm leading-7 text-slate-300">
            <p className="font-display text-xl font-semibold text-white">
              {dictionary.messages.thread.meetupSafely}
            </p>
            <p>{dictionary.messages.thread.meetupSafelyBody}</p>
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
  const { dictionary } = useLocale();
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
        title={dictionary.messages.thread.conversationUnavailableTitle}
        description={dictionary.messages.thread.conversationUnavailableDescription}
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
      onSend={(text, files) => {
        startTransition(async () => {
          try {
            setError(null);
            const cleanText = text.trim();

            if (cleanText) {
              await sendConversationMessage(conversation.id, currentUserId, cleanText);
            }

            for (const file of files) {
              const attachment = await createAttachmentFromFile(file);
              await sendConversationMessage(conversation.id, currentUserId, "", attachment);
            }
          } catch (caughtError) {
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : dictionary.messages.inbox.loadErrorTitle
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
              {dictionary.messages.thread.demoExchangeTitle}
            </p>
            <p>{dictionary.messages.thread.demoExchangeDescription}</p>
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
  const { dictionary } = useLocale();
  const { thread, error: threadError } = useLiveConversationThread(
    conversationId,
    currentUserId
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!thread) {
    return (
      <EmptyState
        title={dictionary.messages.thread.conversationUnavailableTitle}
        description={
          threadError ?? dictionary.messages.thread.conversationUnavailableDescription
        }
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
        sentAt: message.sentAt,
        attachmentName: message.attachment?.name,
        attachmentUrl: message.attachment?.url
      }))}
      quickActions={thread.conversation.quickActions}
      currentUserId={currentUserId}
      onSend={(text, files) => {
        startTransition(async () => {
          try {
            setError(null);
            await sendLiveConversationMessage(conversationId, currentUserId, text, files);
          } catch (caughtError) {
            setError(
              caughtError instanceof Error
                ? caughtError.message
                : dictionary.messages.inbox.loadErrorTitle
            );
          }
        });
      }}
      error={error ?? threadError}
      isPending={isPending}
      supportsAttachments
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
