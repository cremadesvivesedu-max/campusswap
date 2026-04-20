import { SettingsStripeConnectCard } from "@/components/forms/settings-stripe-connect-card";
import { SettingsNotificationPreferencesForm } from "@/components/forms/settings-notification-preferences-form";
import { LogoutButton } from "@/components/shared/logout-button";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getDictionaryForRequest } from "@/lib/i18n";
import {
  getCurrentUser,
  getSellerStripeConnectStatusForUser
} from "@/server/queries/marketplace";

export default async function SettingsPage({
  searchParams
}: {
  searchParams?: Promise<{ stripe?: string | string[] }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const stripeState =
    typeof resolvedSearchParams?.stripe === "string"
      ? resolvedSearchParams.stripe
      : undefined;

  const [user, dictionary, sellerStripeStatus] = await Promise.all([
    getCurrentUser(),
    getDictionaryForRequest(),
    getSellerStripeConnectStatusForUser()
  ]);

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow={dictionary.settings.eyebrow}
        title={dictionary.settings.title}
        description={dictionary.settings.description}
      />
      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {dictionary.settings.notificationsTitle}
            </h2>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-slate-600">
            <SettingsNotificationPreferencesForm
              initialPreferences={user.profile.notificationPreferences}
            />
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
        <Card className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {dictionary.settings.payoutsTitle}
            </h2>
          </CardHeader>
          <CardContent className="text-sm leading-7 text-slate-600">
            <SettingsStripeConnectCard
              status={sellerStripeStatus}
              stripeState={stripeState}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
