"use client";

import { useEffect, useMemo, useState } from "react";
import { demoData } from "@/lib/demo-data";
import { isLiveClientMode } from "@/lib/public-env";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types/domain";

interface DbNotificationRow {
  id: string;
  user_id: string;
  type: Notification["type"];
  title: string;
  body: string;
  destination_href?: string | null;
  read: boolean;
  created_at: string;
}

let realtimeChannelSequence = 0;

function createRealtimeChannelName(prefix: string) {
  realtimeChannelSequence += 1;
  return `${prefix}-${Date.now()}-${realtimeChannelSequence}`;
}

function mapNotification(row: DbNotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    destinationHref: row.destination_href ?? undefined,
    read: row.read,
    createdAt: row.created_at
  };
}

async function fetchNotifications(currentUserId: string) {
  const supabase = createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, body, destination_href, read, created_at")
    .eq("user_id", currentUserId)
    .order("created_at", { ascending: false })
    .limit(24);

  if (error?.code === "42703" || error?.message.includes("destination_href")) {
    const fallback = await supabase
      .from("notifications")
      .select("id, user_id, type, title, body, read, created_at")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false })
      .limit(24);

    if (fallback.error) {
      throw new Error(fallback.error.message);
    }

    return ((fallback.data as DbNotificationRow[] | null) ?? []).map(mapNotification);
  }

  if (error) {
    throw new Error(error.message);
  }

  return ((data as DbNotificationRow[] | null) ?? []).map(mapNotification);
}

export function useLiveNotifications(currentUserId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const unreadCount = useMemo(
    () => notifications.reduce((count, notification) => count + (notification.read ? 0 : 1), 0),
    [notifications]
  );

  const markNotificationReadLocally = (notificationId: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? {
              ...notification,
              read: true
            }
          : notification
      )
    );
  };

  const markAllNotificationsReadLocally = () => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.read
          ? notification
          : {
              ...notification,
              read: true
            }
      )
    );
  };

  useEffect(() => {
    let active = true;

    const sync = async () => {
      try {
        if (!isLiveClientMode || !supabase) {
          const nextNotifications = [...demoData.notifications]
            .filter((notification) => notification.userId === currentUserId)
            .sort(
              (left, right) =>
                Date.parse(right.createdAt) - Date.parse(left.createdAt)
            );

          if (active) {
            setNotifications(nextNotifications);
            setError(null);
          }

          return;
        }

        const nextNotifications = await fetchNotifications(currentUserId);

        if (active) {
          setNotifications(nextNotifications);
          setError(null);
        }
      } catch (syncError) {
        if (active) {
          setError(
            syncError instanceof Error
              ? syncError.message
              : "Unable to load notifications."
          );
        }
      }
    };

    void sync();

    if (!isLiveClientMode || !supabase) {
      return () => {
        active = false;
      };
    }

    const channel = supabase
      .channel(createRealtimeChannelName(`notifications-${currentUserId}`))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`
        },
        () => {
          void sync();
        }
      )
      .subscribe();

    return () => {
      active = false;
      void channel.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

  return {
    notifications,
    unreadCount,
    error,
    markNotificationReadLocally,
    markAllNotificationsReadLocally
  };
}
