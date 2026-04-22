"use client";

import { useEffect, useMemo, useState } from "react";
import { demoData } from "@/lib/demo-data";
import { isLiveClientMode } from "@/lib/public-env";
import { createClient } from "@/lib/supabase/client";
import type { Notification } from "@/types/domain";

interface LiveNotificationsOptions {
  enabled?: boolean;
  limit?: number;
}

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

async function fetchNotifications(currentUserId: string, limit = 24) {
  const supabase = createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, body, destination_href, read, created_at")
    .eq("user_id", currentUserId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error?.code === "42703" || error?.message.includes("destination_href")) {
    const fallback = await supabase
      .from("notifications")
      .select("id, user_id, type, title, body, read, created_at")
      .eq("user_id", currentUserId)
      .order("created_at", { ascending: false })
      .limit(limit);

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

async function fetchUnreadNotificationCount(currentUserId: string) {
  const supabase = createClient();

  if (!supabase) {
    return 0;
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", currentUserId)
    .eq("read", false);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export function useLiveNotifications(
  currentUserId: string,
  options: LiveNotificationsOptions = {}
) {
  const { enabled = true, limit = 24 } = options;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
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
    let syncTimeout: ReturnType<typeof setTimeout> | null = null;

    const sync = async () => {
      try {
        if (active) {
          setIsLoading(true);
        }

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
            setIsLoading(false);
          }

          return;
        }

        const nextNotifications = await fetchNotifications(currentUserId, limit);

        if (active) {
          setNotifications(nextNotifications);
          setError(null);
          setIsLoading(false);
        }
      } catch (syncError) {
        if (active) {
          setError(
            syncError instanceof Error
              ? syncError.message
              : "Unable to load notifications."
          );
          setIsLoading(false);
        }
      }
    };

    const scheduleSync = () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }

      syncTimeout = setTimeout(() => {
        syncTimeout = null;
        void sync();
      }, 120);
    };

    if (!enabled) {
      setIsLoading(false);

      return () => {
        active = false;

        if (syncTimeout) {
          clearTimeout(syncTimeout);
        }
      };
    }

    void sync();

    if (!isLiveClientMode || !supabase) {
      return () => {
        active = false;

        if (syncTimeout) {
          clearTimeout(syncTimeout);
        }
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
        scheduleSync
      )
      .subscribe();

    return () => {
      active = false;

      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }

      void channel.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, enabled, limit, supabase]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markNotificationReadLocally,
    markAllNotificationsReadLocally
  };
}

export function useLiveUnreadNotificationCount(currentUserId: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const markOneNotificationReadLocally = () => {
    setUnreadCount((current) => Math.max(0, current - 1));
  };

  const markAllNotificationsReadLocally = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    let active = true;
    let syncTimeout: ReturnType<typeof setTimeout> | null = null;

    const sync = async () => {
      try {
        if (!isLiveClientMode || !supabase) {
          const nextUnreadCount = demoData.notifications.filter(
            (notification) => notification.userId === currentUserId && !notification.read
          ).length;

          if (active) {
            setUnreadCount(nextUnreadCount);
            setError(null);
          }

          return;
        }

        const nextUnreadCount = await fetchUnreadNotificationCount(currentUserId);

        if (active) {
          setUnreadCount(nextUnreadCount);
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

    const scheduleSync = () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }

      syncTimeout = setTimeout(() => {
        syncTimeout = null;
        void sync();
      }, 120);
    };

    void sync();

    if (!isLiveClientMode || !supabase) {
      return () => {
        active = false;

        if (syncTimeout) {
          clearTimeout(syncTimeout);
        }
      };
    }

    const channel = supabase
      .channel(createRealtimeChannelName(`notification-count-${currentUserId}`))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`
        },
        scheduleSync
      )
      .subscribe();

    return () => {
      active = false;

      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }

      void channel.unsubscribe();
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, supabase]);

  return {
    unreadCount,
    error,
    markOneNotificationReadLocally,
    markAllNotificationsReadLocally
  };
}
