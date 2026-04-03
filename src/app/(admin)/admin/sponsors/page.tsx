import { updateSponsorPlacementAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getAdminSponsors } from "@/server/queries/admin";

export default async function AdminSponsorsPage() {
  const sponsors = await getAdminSponsors();

  return (
    <div className="space-y-4">
      {sponsors.map((sponsor) => (
        <Card key={sponsor.id} className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {sponsor.name}
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
            <form action={updateSponsorPlacementAction} className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <input type="hidden" name="sponsorId" value={sponsor.id} />
              <Input name="name" defaultValue={sponsor.name} />
              <Input name="label" defaultValue={sponsor.label} />
              <Input name="location" defaultValue={sponsor.location} />
              <Input name="cta" defaultValue={sponsor.cta} />
              <Input name="href" defaultValue={sponsor.href} />
              <Textarea
                name="copy"
                defaultValue={sponsor.copy}
                className="min-h-[110px] border-slate-200 bg-white"
              />
              <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked={sponsor.active}
                  className="mr-2"
                />
                Active placement
              </label>
              <Button type="submit">Save sponsor placement</Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
