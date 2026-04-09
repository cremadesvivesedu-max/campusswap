"use client";

import { useTransition } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useLocale } from "@/components/providers/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getNotificationTypeLabel
} from "@/lib/i18n-shared";
import { cn } from "@/lib/utils";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction
} from "@/server/actions/marketplace";
import { useLiveNotifications } from "@/features/notifications/live-notifications";
import type { Notification } from "@/types/domain";

function formatNotificationDate(value: string) {
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

export function NotificationsFeed({
  currentUserId
}: {
  currentUserId: string;
}) {
  const { dictionary } = useLocale();
  const { notifications, unreadCount, error } = useLiveNotifications(currentUserId);
  const [isPending, startTransition] = useTransition();

  if (!notifications.length && !error) {
    return (
      <EmptyState
        title={dictionary.notifications.emptyTitle}
        description={dictionary.notifications.emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-950 p-2 text-white">
            <Bell className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-950">
              {dictionary.notifications.recentTitle}
            </p>
            <p className="text-sm text-slate-500">
              {unreadCount
                ? `${unreadCount} ${dictionary.notifications.unreadLabel.toLowerCase()}`
                : dictionary.notifications.readLabel}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            startTransition(async () => {
              await markAllNotificationsReadAction();
            })
          }
          disabled={isPending || !unreadCount}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          {dictionary.notifications.markAllRead}
        </Button>
      </div>

      {error ? (
        <p className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="space-y-4">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={cn(
              "rounded-[28px] border px-5 py-5 transition",
              notification.read
                ? "border-slate-200 bg-white"
                : "border-emerald-200 bg-emerald-50/60"
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={notificationTone(notification.type)}>
                    {getNotificationTypeLabel(dictionary, notification.type)}
                  </Badge>
                  <Badge
                    className={
                      notification.read
                        ? "bg-slate-100 text-slate-700"
                        : "bg-emerald-200 text-emerald-950"
                    }
                  >
                    {notification.read
                      ? dictionary.notifications.readLabel
                      : dictionary.notifications.unreadLabel}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h2 className="font-display text-2xl font-semibold text-slate-950">
                    {notification.title}
                  </h2>
                  <p className="text-sm leading-7 text-slate-600">
                    {notification.body}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 sm:items-end">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {formatNotificationDate(notification.createdAt)}
                </p>
                {!notification.read ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      startTransition(async () => {
                        await markNotificationReadAction(notification.id);
                      })
                    }
                    disabled={isPending}
                  >
                    {dictionary.notifications.markRead}
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
