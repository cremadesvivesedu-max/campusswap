import { updateReportStatusAction } from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getAdminReports } from "@/server/queries/admin";

export default async function AdminReportsPage() {
  const reports = await getAdminReports();

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {report.targetType} report
            </h2>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-7 text-slate-600">
            <p>{report.reason}</p>
            <form action={updateReportStatusAction} className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <input type="hidden" name="reportId" value={report.id} />
              <input type="hidden" name="targetType" value={report.targetType} />
              <input type="hidden" name="targetId" value={report.targetId} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={report.status}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900"
                >
                  <option value="open">Open</option>
                  <option value="in-review">In review</option>
                  <option value="actioned">Actioned</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </label>
              <Textarea
                name="note"
                placeholder="Internal moderation note"
                className="min-h-[96px] border-slate-200 bg-white"
              />
              <Button type="submit">Save moderation update</Button>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
