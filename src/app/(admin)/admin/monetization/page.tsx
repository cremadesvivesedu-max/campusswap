import { updatePricingSettingAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAdminPricingSettings } from "@/server/queries/admin";

export default async function AdminMonetizationPage() {
  const settings = await getAdminPricingSettings();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {settings.map((setting) => (
        <Card key={setting.id} className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {setting.label}
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
            <p>Module: {setting.module}</p>
            <form action={updatePricingSettingAction} className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <input type="hidden" name="settingId" value={setting.id} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Price
                </span>
                <Input
                  type="number"
                  step="0.01"
                  name="value"
                  defaultValue={String(setting.value)}
                />
              </label>
              <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={setting.active}
                  className="mr-2"
                />
                Active
              </label>
              <Button type="submit">Save pricing</Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
