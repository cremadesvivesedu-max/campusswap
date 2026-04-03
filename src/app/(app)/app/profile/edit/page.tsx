import { ProfileAvatarForm } from "@/components/forms/profile-avatar-form";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/server/queries/marketplace";

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Edit profile"
        title="Keep your identity and trust markers current."
        description="Profile photos now persist through Supabase Storage so your account chip, profile page, and messaging surfaces stay in sync."
      />
      <div className="grid gap-6 lg:grid-cols-[0.7fr_0.3fr]">
        <ProfileAvatarForm user={user} />
        <Card className="bg-white">
          <CardContent className="space-y-4 p-6 text-sm leading-7 text-slate-600">
            <p className="font-display text-xl font-semibold text-slate-950">
              What saves now
            </p>
            <p>
              Uploading or resetting your photo updates the profile page, the message
              surfaces, and the top-right identity chip through Supabase-backed profile
              persistence.
            </p>
            <p>
              The rest of the profile fields are moving to live persistence alongside
              onboarding and seller data, so this page stays focused on the parts that
              are already real end to end.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
