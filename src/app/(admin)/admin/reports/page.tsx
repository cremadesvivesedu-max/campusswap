import Link from "next/link";
import {
  updateReportStatusAction,
  updateSupportTicketStatusAction
} from "@/server/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getAdminReports, getAdminSupportTickets } from "@/server/queries/admin";

export default async function AdminReportsPage() {
  const [reports, supportTickets] = await Promise.all([
    getAdminReports(),
    getAdminSupportTickets()
  ]);

  return (
    <div className="space-y-6">
      {supportTickets.length ? (
        <div className="rounded-[32px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84))] p-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Support queue
            </p>
            <h2 className="font-display text-3xl font-semibold text-slate-950">
              Support tickets
            </h2>
          </div>
        </div>
      ) : null}
      {supportTickets.map((ticket) => (
        <Card key={ticket.id} className="bg-white/96">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {ticket.type}
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
            <div className="space-y-1">
              <p className="font-semibold text-slate-950">{ticket.subject}</p>
              <p>{ticket.details}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              {ticket.listingId ? (
                <Link href={`/app/listings/${ticket.listingId}`} className="underline-offset-4 hover:underline">
                  Open listing
                </Link>
              ) : null}
              {ticket.conversationId ? (
                <Link href={`/app/messages/${ticket.conversationId}`} className="underline-offset-4 hover:underline">
                  Open conversation
                </Link>
              ) : null}
              {ticket.transactionId ? (
                <Link href="/app/my-purchases" className="underline-offset-4 hover:underline">
                  Open purchases
                </Link>
              ) : null}
              {ticket.targetUserId ? (
                <Link href={`/app/profile?userId=${ticket.targetUserId}`} className="underline-offset-4 hover:underline">
                  Open user profile
                </Link>
              ) : null}
            </div>
            <form action={updateSupportTicketStatusAction} className="space-y-3 rounded-[26px] border border-slate-200 bg-slate-50/80 p-4">
              <input type="hidden" name="ticketId" value={ticket.id} />
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={ticket.status}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900"
                >
                  <option value="open">Open</option>
                  <option value="in-review">In review</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <Textarea
                name="note"
                defaultValue={ticket.adminNote}
                placeholder="Internal support note"
                className="min-h-[96px] border-slate-200 bg-white"
              />
              <Button type="submit">Save support update</Button>
            </form>
          </CardContent>
        </Card>
      ))}

      {reports.length ? (
        <div className="rounded-[32px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84))] p-6 shadow-sm">
          <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Moderation queue
          </p>
          <h2 className="font-display text-3xl font-semibold text-slate-950">
            Reports
          </h2>
          </div>
        </div>
      ) : null}
      {reports.map((report) => (
        <Card key={report.id} className="bg-white/96">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              {report.targetType} report
            </h2>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-7 text-slate-600">
            <p>{report.reason}</p>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              {report.targetType === "listing" ? (
                <Link href={`/app/listings/${report.targetId}`} className="underline-offset-4 hover:underline">
                  Open listing
                </Link>
              ) : null}
              {report.targetType === "user" ? (
                <Link href={`/app/profile?userId=${report.targetId}`} className="underline-offset-4 hover:underline">
                  Open user profile
                </Link>
              ) : null}
              {report.targetType === "conversation" ? (
                <Link href={`/app/messages/${report.targetId}`} className="underline-offset-4 hover:underline">
                  Open conversation
                </Link>
              ) : null}
            </div>
            <form action={updateReportStatusAction} className="space-y-3 rounded-[26px] border border-slate-200 bg-slate-50/80 p-4">
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
