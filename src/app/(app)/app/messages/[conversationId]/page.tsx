import { ConversationThread } from "@/components/marketplace/conversation-thread";
import { SectionHeading } from "@/components/shared/section-heading";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getCurrentUser } from "@/server/queries/marketplace";

export default async function ConversationPage({
  params
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const [user, dictionary] = await Promise.all([
    getCurrentUser(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow={dictionary.messages.conversationEyebrow}
        title={dictionary.messages.conversationTitle}
        description={dictionary.messages.conversationDescription}
      />
      <ConversationThread conversationId={conversationId} currentUserId={user.id} />
    </div>
  );
}
