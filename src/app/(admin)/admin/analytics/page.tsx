import { MetricCard } from "@/components/admin/metric-card";
import { getAdminMetrics } from "@/server/queries/admin";

export default async function AdminAnalyticsPage() {
  const metrics = await getAdminMetrics();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        title="Verified users"
        value={String(metrics.verifiedUsers)}
        hint="Student-trust baseline"
      />
      <MetricCard
        title="Signups (7d)"
        value={String(metrics.signupsLast7Days)}
        hint="Launch acquisition pulse"
      />
      <MetricCard
        title="Logins (7d)"
        value={String(metrics.loginsLast7Days)}
        hint="Retention heartbeat"
      />
      <MetricCard
        title="Listings created (7d)"
        value={String(metrics.listingsCreatedLast7Days)}
        hint="Supply growth"
      />
      <MetricCard
        title="Conversations started"
        value={String(metrics.conversationsStarted)}
        hint="Marketplace liquidity signal"
      />
      <MetricCard
        title="Checkouts started (7d)"
        value={String(metrics.checkoutsStartedLast7Days)}
        hint="Buyer intent"
      />
      <MetricCard
        title="Checkouts completed (7d)"
        value={String(metrics.checkoutsCompletedLast7Days)}
        hint="Real paid conversions"
      />
      <MetricCard
        title="Support tickets (7d)"
        value={String(metrics.supportTicketsLast7Days)}
        hint="Launch support load"
      />
      <MetricCard
        title="Captured errors (7d)"
        value={String(metrics.capturedErrorsLast7Days)}
        hint="Monitoring readiness"
      />
      <MetricCard
        title="Average rating"
        value={metrics.averageRating.toFixed(2)}
        hint="Post-transaction review average"
      />
      <MetricCard
        title="Top searches"
        value={metrics.topSearchTerms.join(", ")}
        hint="Discovery tuning input"
      />
      <MetricCard
        title="Sponsorship revenue"
        value={`${metrics.sponsorshipRevenue} EUR`}
        hint="Demo monthly target"
      />
      <MetricCard
        title="Response rate"
        value={`${Math.round(metrics.responseRate * 100)}%`}
        hint="Healthy marketplace benchmark"
      />
    </div>
  );
}
