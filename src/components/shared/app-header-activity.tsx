"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { Bell, CheckCheck, Heart, MessageSquare } from "lucide-react";
import { useCurrentUser } from "@/components/providers/current-user-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { resolveNotificationDestination } from "@/features/notifications/destinations";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLiveNotifications } from "@/features/notifications/live-notifications";
import { useLiveConversationPreviews } from "@/features/messaging/live-messaging";
import { getNotificationTypeLabel } from "@/lib/i18n-shared";
import { cn } from "@/lib/utils";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction
} from "@/server/actions/marketplace";
import type { Notification } from "@/types/domain";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function notificationTone(type: Notification["type"]) {
  switch (type) {
    case "promotion":
      return "bg-amber-100 text-amber-900";
    case "review":
      return "bg-emerald-100 text-emerald-900";
    case "listing":
      return "bg-sky-100 text-sky-900";
    case "message":
      return "bg-violet-100 text-violet-900";
    case "safety":
      return "bg-rose-100 text-rose-900";
    default:
      return "bg-slate-100 text-slate-900";
  }
}

export function AppHeaderActivity() {
  const user = useCurrentUser();
  const { dictionary } = useLocale();
  const pathname = usePathname();
  const {
    notifications,
    unreadCount,
    error: notificationsError,
    markNotificationReadLocally,
    markAllNotificationsReadLocally
  } = useLiveNotifications(user.id);
  const { previews, error: messagesError } = useLiveConversationPreviews(user.id);
  const [isPending, startTransition] = useTransition();
  const [openPanel, setOpenPanel] = useState<"notifications" | "messages" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const unreadMessages = useMemo(
    () => previews.reduce((sum, preview) => sum + preview.unreadCount, 0),
    [previews]
  );
  const recentPreviews = useMemo(() => previews.slice(0, 4), [previews]);
  const recentNotifications = useMemo(
    () =>
      notifications.slice(0, 4).map((notification) => ({
        notification,
        destination: resolveNotificationDestination(notification)
      })),
    [notifications]
  );

  useEffect(() => {
    setOpenPanel(null);
    setActionError(null);
  }, [pathname]);

  const navigateFromPanel = (href: string) => {
    setOpenPanel(null);
    setActionError(null);

    if (typeof window !== "undefined") {
      window.location.assign(href);
    }
  };

  const openNotificationDestination = (
    notification?: Notification,
    hrefOverride?: string
  ) => {
    const href = hrefOverride ?? (
      notification
        ? resolveNotificationDestination(notification).href
        : "/app/notifications"
    );

    if (notification) {
      if (!notification.read) {
        markNotificationReadLocally(notification.id);

        startTransition(async () => {
          const result = await markNotificationReadAction(notification.id);

          if (!result.success) {
            setActionError(result.message);
          }
        });
      }

      navigateFromPanel(href);
      return;
    }

    navigateFromPanel(href);
  };

  const openMessagesPage = () => navigateFromPanel("/app/messages");
  const openConversation = (conversationId: string) =>
    navigateFromPanel(`/app/messages/${conversationId}`);

  const markNotificationAsRead = (notificationId: string) => {
    setActionError(null);

    startTransition(async () => {
      const result = await markNotificationReadAction(notificationId);

      if (!result.success) {
        setActionError(result.message);
        return;
      }

      markNotificationReadLocally(notificationId);
    });
  };

  return (
    <>
      {openPanel ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-20"
          onClick={() => setOpenPanel(null)}
        />
      ) : null}

      <div className="relative z-30 flex items-center gap-2">
        <HeaderIconButton
          count={0}
          icon={<Heart className="h-4 w-4" />}
          label={dictionary.nav.app.saved}
          onClick={() => navigateFromPanel("/app/saved")}
        />
        <HeaderIconButton
          count={unreadMessages}
          icon={<MessageSquare className="h-4 w-4" />}
          label={dictionary.messages.inbox.recentTitle}
          onClick={() =>
            setOpenPanel((current) => (current === "messages" ? null : "messages"))
          }
        />
        <HeaderIconButton
          count={unreadCount}
          icon={<Bell className="h-4 w-4" />}
          label={dictionary.notifications.recentTitle}
          onClick={() =>
            setOpenPanel((current) =>
              current === "notifications" ? null : "notifications"
            )
          }
        />

        {openPanel === "messages" ? (
          <div className="absolute right-12 top-14 z-30 w-[min(24rem,calc(100vw-2rem))] rounded-[28px] border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl font-semibold text-slate-950">
                  {dictionary.messages.inbox.recentTitle}
                </p>
                <p className="text-sm text-slate-500">
                  {unreadMessages
                    ? `${unreadMessages} ${dictionary.messages.actions.unread}`
                    : dictionary.messages.actions.noMessagesYet}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={openMessagesPage}
              >
                {dictionary.messages.inbox.openAll}
              </Button>
            </div>

            {messagesError ? (
              <p className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {messagesError}
              </p>
            ) : previews.length ? (
              <div className="space-y-3">
                {recentPreviews.map((preview) => {
                  const latestSummary = preview.latestMessage?.text
                    ? preview.latestMessage.text
                    : preview.latestMessage?.attachment
                      ? dictionary.messages.actions.photoAttachment
                      : dictionary.messages.actions.noMessagesYet;

                  return (
                    <button
                      type="button"
                      key={preview.conversation.id}
                      onClick={() => openConversation(preview.conversation.id)}
                      className="block w-full rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <ProfileAvatar
                            userId={preview.counterpart.id}
                            name={preview.counterpart.profile.fullName}
                            src={preview.counterpart.avatar}
                            className="h-10 w-10"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950">
                              {preview.listing.title}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {preview.counterpart.profile.fullName}
                            </p>
                          </div>
                        </div>
                        {preview.unreadCount ? (
                          <Badge className="bg-primary text-slate-950">
                            {preview.unreadCount}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                        {latestSummary}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-[20px] border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                {dictionary.messages.inbox.emptyDescription}
              </p>
            )}
          </div>
        ) : null}

        {openPanel === "notifications" ? (
          <div className="absolute right-0 top-14 z-30 w-[min(24rem,calc(100vw-2rem))] rounded-[28px] border border-slate-200 bg-white p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-display text-xl font-semibold text-slate-950">
                  {dictionary.notifications.recentTitle}
                </p>
                <p className="text-sm text-slate-500">
                  {unreadCount
                    ? `${unreadCount} ${dictionary.notifications.unreadLabel.toLowerCase()}`
                    : dictionary.notifications.readLabel}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    startTransition(async () => {
                      setActionError(null);
                      const result = await markAllNotificationsReadAction();

                      if (!result.success) {
                        setActionError(result.message);
                        return;
                      }

                      markAllNotificationsReadLocally();
                    })
                  }
                  disabled={isPending || !unreadCount}
                >
                  <CheckCheck className="mr-2 h-3.5 w-3.5" />
                  {dictionary.notifications.markAllRead}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openNotificationDestination()}
                >
                  {dictionary.notifications.openAll}
                </Button>
              </div>
            </div>

            {notificationsError || actionError ? (
              <p className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {actionError ?? notificationsError}
              </p>
            ) : notifications.length ? (
              <div className="space-y-3">
                {recentNotifications.map(({ notification, destination }) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "rounded-[22px] border px-4 py-3 transition",
                      notification.read
                        ? "border-slate-200 bg-slate-50 hover:bg-white"
                        : "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        openNotificationDestination(notification, destination.href)
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <Badge className={notificationTone(notification.type)}>
                          {getNotificationTypeLabel(dictionary, notification.type)}
                        </Badge>
                        {!notification.read ? (
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-950">
                        {notification.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                        {notification.body}
                      </p>
                    </button>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-500">
                        {formatTimestamp(notification.createdAt)}
                      </p>
                      {!notification.read ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="px-0 text-xs text-slate-700 hover:bg-transparent hover:text-slate-950"
                          onClick={() => markNotificationAsRead(notification.id)}
                          disabled={isPending}
                        >
                          {dictionary.notifications.markRead}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-[20px] border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
                {dictionary.notifications.emptyDescription}
              </p>
            )}
          </div>
        ) : null}
      </div>
    </>
  );
}

function HeaderIconButton({
  icon,
  count,
  label,
  onClick
}: {
  icon: ReactNode;
  count: number;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
    >
      {icon}
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-slate-950 px-1.5 py-0.5 text-center text-[11px] font-semibold text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </button>
  );
}
