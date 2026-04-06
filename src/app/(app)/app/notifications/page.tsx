import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getDictionaryForRequest } from "@/lib/i18n";
import { getNotificationsForUser } from "@/server/queries/marketplace";

export default async function NotificationsPage() {
  const [notifications, dictionary] = await Promise.all([
    getNotificationsForUser(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={dictionary.notifications.eyebrow}
        title={dictionary.notifications.title}
        description={dictionary.notifications.description}
      />
      {notifications.length ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className="bg-white">
              <CardHeader>
                <h2 className="font-display text-2xl font-semibold text-slate-950">
                  {notification.title}
                </h2>
              </CardHeader>
              <CardContent className="space-y-2 text-sm leading-7 text-slate-600">
                <p>{notification.body}</p>
                <p>{notification.createdAt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title={dictionary.notifications.emptyTitle}
          description={dictionary.notifications.emptyDescription}
        />
      )}
    </div>
  );
}
