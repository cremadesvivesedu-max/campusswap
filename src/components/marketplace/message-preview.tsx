"use client";

import { memo } from "react";
import Link from "next/link";
import { Camera } from "lucide-react";
import { ListingImage } from "@/components/marketplace/listing-image";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { useLocale } from "@/components/providers/locale-provider";
import { getListingStatusLabel } from "@/lib/i18n-shared";
import type { ConversationPreview } from "@/types/domain";

/** Time today, weekday this week, otherwise a short date (like chat apps). */
function formatPreviewTime(value: string | undefined, locale: string) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const withinWeek = now.getTime() - date.getTime() < 6 * 24 * 60 * 60 * 1000;
  return date.toLocaleString(
    locale,
    sameDay
      ? { hour: "2-digit", minute: "2-digit" }
      : withinWeek
        ? { weekday: "short" }
        : { day: "numeric", month: "short" }
  );
}

// One chat per row, inbox style: listing photo, who, last message, time, unread dot.
function MessagePreviewComponent({ preview }: { preview: ConversationPreview }) {
  const { dictionary, locale } = useLocale();
  const latest = preview.latestMessage;
  const listingTitle = preview.listing.title?.trim() || "CampusSwap";
  const counterpartName = preview.counterpart.profile?.fullName?.trim() || "CampusSwap";
  const cover = preview.listing.images?.[0];
  const unread = preview.unreadCount > 0;
  const time = formatPreviewTime(latest?.sentAt, locale);

  return (
    <li>
      <Link
        href={`/app/messages/${preview.conversation.id}`}
        className="flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
      >
        <div className="relative h-14 w-14 shrink-0">
          <div className="h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
            <ListingImage src={cover?.url} alt={cover?.alt ?? listingTitle} sizes="56px" />
          </div>
          <ProfileAvatar
            userId={preview.counterpart.id}
            name={counterpartName}
            src={preview.counterpart.avatar}
            className="absolute -bottom-1 -right-1 h-6 w-6 ring-2 ring-[#f7f4ee]"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={`truncate text-[15px] ${unread ? "font-extrabold" : "font-semibold"} text-slate-950`}>
              {counterpartName}
            </p>
            {/* Relative time depends on the viewer's clock and time zone. */}
            <span
              suppressHydrationWarning
              className={`shrink-0 text-xs ${unread ? "font-bold text-emerald-700" : "text-slate-400"}`}
            >
              {time}
            </span>
          </div>
          <p className="truncate text-xs text-slate-500">
            {listingTitle}
            {preview.listing.status !== "active"
              ? ` · ${getListingStatusLabel(dictionary, preview.listing.status)}`
              : ""}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className={`flex min-w-0 items-center gap-1 truncate text-sm ${unread ? "font-semibold text-slate-900" : "text-slate-500"}`}>
              {!latest?.text && latest?.attachment ? (
                <>
                  <Camera className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {dictionary.messages.actions.photoAttachment}
                </>
              ) : (
                <span className="truncate">
                  {latest?.text || dictionary.messages.actions.noMessagesYet}
                </span>
              )}
            </p>
            {unread ? (
              <span
                className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[11px] font-bold text-white"
                aria-label={`${preview.unreadCount} ${dictionary.messages.actions.unread}`}
              >
                {preview.unreadCount}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}

export const MessagePreview = memo(MessagePreviewComponent);
