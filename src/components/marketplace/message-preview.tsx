"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { useLocale } from "@/components/providers/locale-provider";
import { getListingStatusLabel } from "@/lib/i18n-shared";
import type { ConversationPreview } from "@/types/domain";

function formatPreviewTimestamp(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const parsed = Date.parse(value);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return new Date(parsed).toLocaleString("en-GB", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function MessagePreview({ preview }: { preview: ConversationPreview }) {
  const router = useRouter();
  const { dictionary } = useLocale();
  const latest = preview.latestMessage;
  const listingTitle = preview.listing.title?.trim() || "CampusSwap listing";
  const counterpartName =
    preview.counterpart.profile?.fullName?.trim() || "CampusSwap student";
  const latestSummary = latest?.text
    ? latest.text
    : latest?.attachment
      ? dictionary.messages.actions.photoAttachment
      : dictionary.messages.actions.noMessagesYet;
  const latestLabel = formatPreviewTimestamp(
    latest?.sentAt,
    dictionary.messages.actions.noMessagesYet
  );

  return (
    <button
      type="button"
      onClick={() => router.push(`/app/messages/${preview.conversation.id}`)}
      className="block rounded-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
    >
      <Card className="bg-white transition hover:-translate-y-0.5 hover:shadow-glow">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <ProfileAvatar
              userId={preview.counterpart.id}
              name={counterpartName}
              src={preview.counterpart.avatar}
              className="h-12 w-12"
            />
            <div>
              <p className="font-display text-lg font-semibold text-slate-950">
                {listingTitle}
              </p>
              <p className="text-sm text-slate-500">
                {counterpartName} - {latestLabel}
              </p>
            </div>
          </div>
          {preview.unreadCount ? (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-slate-950">
              {preview.unreadCount} {dictionary.messages.actions.unread}
            </span>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {preview.listing.status !== "active" ? (
              <Badge className="bg-slate-950 text-white">
                {getListingStatusLabel(dictionary, preview.listing.status)}
              </Badge>
            ) : null}
            {preview.listing.outlet ? (
              <Badge className="bg-rose-100 text-rose-900">{dictionary.listing.outlet}</Badge>
            ) : null}
            {preview.listing.featured ? (
              <Badge className="bg-amber-200 text-slate-900">{dictionary.listing.featured}</Badge>
            ) : null}
          </div>
          <div className="flex items-start gap-3">
            {latest?.attachment?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={latest.attachment.url}
                alt={latest.attachment.name}
                className="h-14 w-14 shrink-0 rounded-2xl object-cover"
              />
            ) : null}
            <p className="line-clamp-2 text-sm leading-6 text-slate-600">
              {latestSummary}
            </p>
          </div>
          <p className="text-sm font-semibold text-slate-950">
            {dictionary.messages.actions.openConversation}
          </p>
        </CardContent>
      </Card>
    </button>
  );
}
