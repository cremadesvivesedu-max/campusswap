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
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200/80 bg-white/75 p-6 shadow-sm">
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
