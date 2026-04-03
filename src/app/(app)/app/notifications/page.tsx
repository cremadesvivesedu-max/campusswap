import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getNotificationsForUser } from "@/server/queries/marketplace";

export default async function NotificationsPage() {
  const notifications = await getNotificationsForUser();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Notifications"
        title="Messages, promotions, and trust updates in one place."
        description="Notification preferences set the foundation for future saved-search alerts, featured digests, and referral-ready growth loops."
      />
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
    </div>
  );
}
