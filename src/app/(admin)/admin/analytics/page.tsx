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
        title="Conversations started"
        value={String(metrics.conversationsStarted)}
        hint="Marketplace liquidity signal"
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
