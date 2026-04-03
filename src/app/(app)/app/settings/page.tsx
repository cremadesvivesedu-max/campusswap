import { LogoutButton } from "@/components/shared/logout-button";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser } from "@/server/queries/marketplace";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Settings"
        title="Control notifications, visibility, and account support paths."
        description="Settings includes the product hooks needed for GDPR requests, account deletion, and verification-aware feature gating."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              Notifications
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
            {user.profile.notificationPreferences.map((preference) => (
              <p key={preference}>{preference}</p>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              Account
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>Request data export</p>
            <p>Request account deletion</p>
            <p>Review verification status and student-trust settings</p>
            <LogoutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
