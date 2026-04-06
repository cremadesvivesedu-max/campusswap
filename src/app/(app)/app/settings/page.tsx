import { LogoutButton } from "@/components/shared/logout-button";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  getDictionaryForRequest,
  getNotificationPreferenceLabel
} from "@/lib/i18n";
import { getCurrentUser } from "@/server/queries/marketplace";

export default async function SettingsPage() {
  const [user, dictionary] = await Promise.all([
    getCurrentUser(),
    getDictionaryForRequest()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={dictionary.settings.eyebrow}
        title={dictionary.settings.title}
        description={dictionary.settings.description}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {dictionary.settings.notificationsTitle}
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
            {user.profile.notificationPreferences.length ? (
              user.profile.notificationPreferences.map((preference) => (
                <p key={preference}>
                  {getNotificationPreferenceLabel(dictionary, preference)}
                </p>
              ))
            ) : (
              <p>{dictionary.settings.noPreferences}</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {dictionary.settings.accountTitle}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-600">
            <p>{dictionary.settings.requestDataExport}</p>
            <p>{dictionary.settings.requestAccountDeletion}</p>
            <p>{dictionary.settings.reviewVerification}</p>
            <LogoutButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
