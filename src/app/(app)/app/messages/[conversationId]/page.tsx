import { ConversationThread } from "@/components/marketplace/conversation-thread";
import { SectionHeading } from "@/components/shared/section-heading";
import { getCurrentUser } from "@/server/queries/marketplace";

export default async function ConversationPage({
  params
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Conversation"
        title="Keep pickup details, price questions, and availability in one thread."
        description="Every message stays attached to the listing so both sides can coordinate the meetup without losing context."
      />
      <ConversationThread conversationId={conversationId} currentUserId={user.id} />
    </div>
  );
}
