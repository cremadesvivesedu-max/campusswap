import { NotificationsFeed } from "@/components/shared/notifications-feed";
import { SectionHeading } from "@/components/shared/section-heading";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getCurrentUser } from "@/server/queries/marketplace";

export default async function NotificationsPage() {
  const [user, dictionary] = await Promise.all([
    getCurrentUser(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.82))] p-4 shadow-sm sm:rounded-[36px] sm:p-7">
        <SectionHeading
          eyebrow={dictionary.notifications.eyebrow}
          title={dictionary.notifications.title}
          description={dictionary.notifications.description}
        />
      </div>
      <NotificationsFeed currentUserId={user.id} />
    </div>
  );
}
