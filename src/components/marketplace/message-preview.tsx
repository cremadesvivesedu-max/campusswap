import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import type { ConversationPreview } from "@/types/domain";

export function MessagePreview({ preview }: { preview: ConversationPreview }) {
  const latest = preview.latestMessage;
  const latestLabel = latest?.sentAt
    ? new Date(latest.sentAt).toLocaleString("en-GB", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "No messages yet";

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            userId={preview.counterpart.id}
            name={preview.counterpart.profile.fullName}
            src={preview.counterpart.avatar}
            className="h-12 w-12"
          />
          <div>
            <p className="font-display text-lg font-semibold text-slate-950">
              {preview.listing.title}
            </p>
            <p className="text-sm text-slate-500">
              {preview.counterpart.profile.fullName} - {latestLabel}
            </p>
          </div>
        </div>
        {preview.unreadCount ? (
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-slate-950">
            {preview.unreadCount} unread
          </span>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {preview.listing.status !== "active" ? (
            <Badge className="bg-slate-950 text-white">{preview.listing.status}</Badge>
          ) : null}
          {preview.listing.outlet ? (
            <Badge className="bg-rose-100 text-rose-900">Outlet</Badge>
          ) : null}
          {preview.listing.featured ? (
            <Badge className="bg-amber-200 text-slate-900">Featured</Badge>
          ) : null}
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-slate-600">
          {latest?.text || "No messages yet."}
        </p>
        <Link
          href={`/app/messages/${preview.conversation.id}`}
          className="text-sm font-semibold text-slate-950"
        >
          Open conversation
        </Link>
      </CardContent>
    </Card>
  );
}
