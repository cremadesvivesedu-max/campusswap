import { MessagesInbox } from "@/components/marketplace/messages-inbox";
import { SectionHeading } from "@/components/shared/section-heading";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getCurrentUser } from "@/server/queries/marketplace";

export default async function MessagesPage() {
  const [user, dictionary] = await Promise.all([
    getCurrentUser(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={dictionary.messages.eyebrow}
        title={dictionary.messages.title}
        description={dictionary.messages.description}
      />
      <MessagesInbox currentUserId={user.id} />
    </div>
  );
}
