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
      <div className="rounded-[36px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.82))] p-6 shadow-sm sm:p-7">
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
