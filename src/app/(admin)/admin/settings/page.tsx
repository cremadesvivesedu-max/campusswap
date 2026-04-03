import {
  updateAllowedDomainAction,
  updateVerificationRuleAction
} from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminSettingsData } from "@/server/queries/admin";

export default async function AdminSettingsPage() {
  const settings = await getAdminSettingsData();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="bg-white">
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold text-slate-950">
            University domains
          </h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
          {settings.domains.map((domain) => (
            <form
              key={domain.id}
              action={updateAllowedDomainAction}
              className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4"
            >
              <input type="hidden" name="domainId" value={domain.id} />
              <Input name="domain" defaultValue={domain.domain} />
              <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <input
                  type="checkbox"
                  name="autoVerify"
                  defaultChecked={domain.autoVerify}
                  className="mr-2"
                />
                Auto-verify matching students
              </label>
              <Button type="submit">Save domain</Button>
            </form>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white">
        <CardHeader>
          <h2 className="font-display text-2xl font-semibold text-slate-950">
            Verification rules
          </h2>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
          {settings.rules.map((rule) => (
            <form
              key={rule.id}
              action={updateVerificationRuleAction}
              className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4"
            >
              <input type="hidden" name="ruleId" value={rule.id} />
              <p className="font-medium text-slate-900">{rule.universityId}</p>
              <div className="grid gap-3">
                <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    name="requireEmailOtp"
                    defaultChecked={rule.requireEmailOtp}
                    className="mr-2"
                  />
                  Require email OTP
                </label>
                <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    name="blockPostingUntilVerified"
                    defaultChecked={rule.blockPostingUntilVerified}
                    className="mr-2"
                  />
                  Block posting until verified
                </label>
                <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    name="blockMessagingUntilVerified"
                    defaultChecked={rule.blockMessagingUntilVerified}
                    className="mr-2"
                  />
                  Block messaging until verified
                </label>
              </div>
              <Textarea
                name="notes"
                defaultValue={rule.notes}
                className="min-h-[110px] border-slate-200 bg-white"
              />
              <Button type="submit">Save verification rule</Button>
            </form>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
