import { MessagesInbox } from "@/components/marketplace/messages-inbox";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCurrentUser } from "@/server/queries/marketplace";

export default async function MessagesPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Messages"
        title="Listing-linked chat keeps the meetup context intact."
        description="Quick actions send instantly, new threads open from listing cards and detail pages, and every conversation keeps the listing and seller context visible."
      />
      <MessagesInbox currentUserId={user.id} />
    </div>
  );
}
