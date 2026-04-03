import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <SectionHeading eyebrow="Privacy" title="GDPR-aware by design." description="CampusSwap collects only the information needed for student verification, marketplace activity, moderation, and support." />
      <Card className="bg-white"><CardContent className="space-y-4 p-8 text-sm leading-7 text-slate-600"><p>Personal data includes account details, profile fields, listing data, messages, moderation logs, and transaction-review history.</p><p>Users can request deletion, review reports, and access their profile settings to manage notifications and account preferences.</p><p>Operational logs are retained for moderation integrity, fraud prevention, and marketplace safety.</p></CardContent></Card>
    </div>
  );
}
