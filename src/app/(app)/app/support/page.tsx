import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/shared/section-heading";
import { EmptyState } from "@/components/shared/empty-state";
import { SupportEntryForm } from "@/components/support/support-entry-form";
import { env } from "@/lib/env";
import { getDictionaryForRequest } from "@/lib/i18n";
import {
  getCurrentUser,
  getListingById,
  getReportsForUser,
  getSupportTicketsForUser,
  getTransactionsForUser,
  getUserById
} from "@/server/queries/marketplace";
import type { Report, SupportTicketType } from "@/types/domain";

const supportTypes = [
  "report-user",
  "report-listing",
  "purchase-dispute",
  "payment-help",
  "shipping-help"
] as const satisfies SupportTicketType[];

function isSupportType(value?: string): value is SupportTicketType {
  return Boolean(value && supportTypes.includes(value as SupportTicketType));
}

function getSupportCardCopy(dictionary: Awaited<ReturnType<typeof getDictionaryForRequest>>, type: SupportTicketType) {
  switch (type) {
    case "report-user":
      return {
        title: dictionary.support.cards.reportUserTitle,
        description: dictionary.support.cards.reportUserDescription
      };
    case "report-listing":
      return {
        title: dictionary.support.cards.reportListingTitle,
        description: dictionary.support.cards.reportListingDescription
      };
    case "purchase-dispute":
      return {
        title: dictionary.support.cards.purchaseDisputeTitle,
        description: dictionary.support.cards.purchaseDisputeDescription
      };
    case "payment-help":
      return {
        title: dictionary.support.cards.paymentHelpTitle,
        description: dictionary.support.cards.paymentHelpDescription
      };
    case "shipping-help":
      return {
        title: dictionary.support.cards.shippingHelpTitle,
        description: dictionary.support.cards.shippingHelpDescription
      };
  }
}

function getSupportTicketStatusLabel(
  dictionary: Awaited<ReturnType<typeof getDictionaryForRequest>>,
  status: "open" | "in-review" | "resolved" | "closed"
) {
  switch (status) {
    case "open":
      return dictionary.support.ticketStatusLabels.open;
    case "in-review":
      return dictionary.support.ticketStatusLabels.inReview;
    case "resolved":
      return dictionary.support.ticketStatusLabels.resolved;
    case "closed":
      return dictionary.support.ticketStatusLabels.closed;
  }
}

function getReportStatusLabel(
  dictionary: Awaited<ReturnType<typeof getDictionaryForRequest>>,
  status: Report["status"]
) {
  switch (status) {
    case "open":
      return dictionary.support.reportStatusLabels.open;
    case "in-review":
      return dictionary.support.reportStatusLabels.inReview;
    case "actioned":
      return dictionary.support.reportStatusLabels.actioned;
    case "dismissed":
      return dictionary.support.reportStatusLabels.dismissed;
  }
}

function getReportTargetLabel(
  dictionary: Awaited<ReturnType<typeof getDictionaryForRequest>>,
  targetType: Report["targetType"]
) {
  switch (targetType) {
    case "listing":
      return dictionary.support.targetLabels.listing;
    case "user":
      return dictionary.support.targetLabels.user;
    case "conversation":
      return dictionary.support.targetLabels.conversation;
  }
}

export default async function SupportPage({
  searchParams
}: {
  searchParams: Promise<{
    type?: string;
    listingId?: string;
    transactionId?: string;
    conversationId?: string;
    targetUserId?: string;
  }>;
}) {
  const params = await searchParams;
  const selectedType = isSupportType(params.type) ? params.type : undefined;

  const [user, dictionary, reports, tickets, transactions] = await Promise.all([
    getCurrentUser(),
    getDictionaryForRequest(),
    getReportsForUser(),
    getSupportTicketsForUser(),
    getTransactionsForUser()
  ]);

  const selectedTransaction = params.transactionId
    ? transactions.find((transaction) => transaction.id === params.transactionId)
    : undefined;
  const [selectedListing, selectedUser] = await Promise.all([
    params.listingId
      ? getListingById(params.listingId, { includeRemoved: true })
      : selectedTransaction
        ? getListingById(selectedTransaction.listingId, { includeRemoved: true })
        : Promise.resolve(undefined),
    params.targetUserId ? getUserById(params.targetUserId) : Promise.resolve(undefined)
  ]);

  const selectedCard = selectedType ? getSupportCardCopy(dictionary, selectedType) : null;
  const subjectRequired = selectedType ? !selectedType.startsWith("report-") : false;
  const contextSummary = selectedTransaction
    ? `${dictionary.support.targetLabels.transaction}: ${selectedListing?.title ?? selectedTransaction.id}`
    : selectedListing
      ? `${dictionary.support.targetLabels.listing}: ${selectedListing.title}`
      : selectedUser
        ? `${dictionary.support.targetLabels.user}: ${selectedUser.profile.fullName}`
        : undefined;

  const detailsPlaceholder =
    selectedType === "report-user"
      ? dictionary.support.form.reportUserPlaceholder
      : selectedType === "report-listing"
        ? dictionary.support.form.reportListingPlaceholder
        : selectedType === "purchase-dispute"
          ? dictionary.support.form.purchaseDisputePlaceholder
          : selectedType === "payment-help"
            ? dictionary.support.form.paymentHelpPlaceholder
            : dictionary.support.form.shippingHelpPlaceholder;

  return (
    <div className="space-y-8">
      <div className="rounded-[36px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,250,252,0.82))] p-6 shadow-sm sm:p-7">
        <SectionHeading
          eyebrow={dictionary.support.eyebrow}
          title={dictionary.support.title}
          description={dictionary.support.description}
        />
      </div>

      <Card className="bg-white/96">
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-950">{dictionary.support.chooseCategory}</p>
            <p className="text-sm leading-6 text-slate-600">
              {dictionary.support.contactFallback.replace("{email}", env.SUPPORT_EMAIL)}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/app/my-purchases">{dictionary.support.openPurchases}</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {supportTypes.map((type) => {
          const card = getSupportCardCopy(dictionary, type);
          const href =
            type === "report-listing"
              ? params.listingId
                ? `/app/support?type=${type}&listingId=${params.listingId}`
                : undefined
              : type === "report-user"
                ? params.targetUserId
                  ? `/app/support?type=${type}&targetUserId=${params.targetUserId}${params.listingId ? `&listingId=${params.listingId}` : ""}`
                  : undefined
                : `/app/support?type=${type}${params.transactionId ? `&transactionId=${params.transactionId}` : ""}${params.listingId ? `&listingId=${params.listingId}` : ""}${params.conversationId ? `&conversationId=${params.conversationId}` : ""}${params.targetUserId ? `&targetUserId=${params.targetUserId}` : ""}`;

          return (
            <Card
              key={type}
              className={`bg-white/96 ${selectedType === type ? "border-slate-900 shadow-[0_18px_44px_rgba(15,23,42,0.08)]" : ""}`}
            >
              <CardContent className="space-y-4 p-5">
                <div className="space-y-2">
                  <p className="font-semibold text-slate-950">{card.title}</p>
                  <p className="text-sm leading-6 text-slate-600">{card.description}</p>
                </div>
                {href ? (
                  <Button asChild variant={selectedType === type ? "secondary" : "outline"} className="w-full">
                    <Link href={href}>{dictionary.support.openForm}</Link>
                  </Button>
                ) : (
                  <p className="text-xs text-slate-500">
                    {type === "report-listing"
                      ? dictionary.support.contextRequiredListing
                      : dictionary.support.contextRequiredUser}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedType && selectedCard ? (
        <SupportEntryForm
          type={selectedType}
          title={selectedCard.title}
          description={selectedCard.description}
          detailsLabel={dictionary.support.form.detailsLabel}
          detailsPlaceholder={detailsPlaceholder}
          subjectLabel={dictionary.support.form.subjectLabel}
          subjectPlaceholder={
            subjectRequired
              ? dictionary.support.form.subjectPlaceholder
              : dictionary.support.form.reportSubjectHidden
          }
          submitLabel={dictionary.support.form.submit}
          submittingLabel={dictionary.support.form.submitting}
          contextLabel={dictionary.support.form.contextLabel}
          contextSummary={contextSummary}
          listingId={params.listingId}
          transactionId={params.transactionId}
          conversationId={params.conversationId}
          targetUserId={params.targetUserId}
        />
      ) : null}

      <section className="space-y-4">
        <SectionHeading
          eyebrow={dictionary.support.yourTicketsEyebrow}
          title={dictionary.support.yourTicketsTitle}
          description={dictionary.support.yourTicketsDescription}
        />
        {tickets.length ? (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="bg-white/96">
                <CardContent className="space-y-3 p-5 text-sm text-slate-600">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-950">{ticket.subject}</p>
                      <p>{getSupportCardCopy(dictionary, ticket.type).title}</p>
                    </div>
                    <Badge>{getSupportTicketStatusLabel(dictionary, ticket.status)}</Badge>
                  </div>
                  <p>{ticket.details}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {ticket.listingId ? (
                      <Link href={`/app/listings/${ticket.listingId}`} className="underline-offset-4 hover:underline">
                        {dictionary.support.openListing}
                      </Link>
                    ) : null}
                    {ticket.conversationId ? (
                      <Link
                        href={`/app/messages/${ticket.conversationId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {dictionary.support.openConversation}
                      </Link>
                    ) : null}
                    {ticket.transactionId ? (
                      <Link href="/app/my-purchases" className="underline-offset-4 hover:underline">
                        {dictionary.support.openPurchases}
                      </Link>
                    ) : null}
                    {ticket.targetUserId ? (
                      <Link
                        href={`/app/profile?userId=${ticket.targetUserId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {dictionary.support.openProfile}
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title={dictionary.support.noTicketsTitle}
            description={dictionary.support.noTicketsDescription}
          />
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading
          eyebrow={dictionary.support.yourReportsEyebrow}
          title={dictionary.support.yourReportsTitle}
          description={dictionary.support.yourReportsDescription}
        />
        {reports.length ? (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="bg-white/96">
                <CardContent className="space-y-3 p-5 text-sm text-slate-600">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-950">
                        {getReportTargetLabel(dictionary, report.targetType)}
                      </p>
                      <p>{report.reason}</p>
                    </div>
                    <Badge>{getReportStatusLabel(dictionary, report.status)}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                    {report.targetType === "listing" ? (
                      <Link
                        href={`/app/listings/${report.targetId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {dictionary.support.openListing}
                      </Link>
                    ) : null}
                    {report.targetType === "user" ? (
                      <Link
                        href={`/app/profile?userId=${report.targetId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {dictionary.support.openProfile}
                      </Link>
                    ) : null}
                    {report.targetType === "conversation" ? (
                      <Link
                        href={`/app/messages/${report.targetId}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {dictionary.support.openConversation}
                      </Link>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title={dictionary.support.noReportsTitle}
            description={dictionary.support.noReportsDescription}
          />
        )}
      </section>
    </div>
  );
}
