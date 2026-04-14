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
      <div className="rounded-[32px] border border-slate-200/80 bg-white/75 p-6 shadow-sm">
        <SectionHeading
          eyebrow={dictionary.messages.eyebrow}
          title={dictionary.messages.title}
          description={dictionary.messages.description}
        />
      </div>
      <MessagesInbox currentUserId={user.id} />
    </div>
  );
}
