import { MetricCard } from "@/components/admin/metric-card";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAdminMetrics } from "@/server/queries/admin";

export default async function AdminDashboardPage() {
  const metrics = await getAdminMetrics();

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total users"
          value={String(metrics.totalUsers)}
          hint={`${metrics.verifiedUsers} verified students`}
        />
        <MetricCard
          title="Active listings"
          value={String(metrics.activeListings)}
          hint={`${metrics.featuredListings} featured and ${metrics.outletListings} outlet`}
        />
        <MetricCard
          title="Promoted revenue"
          value={`${metrics.promotedRevenue} EUR`}
          hint="Stripe-ready promoted listing flow"
        />
        <MetricCard
          title="GMV estimate"
          value={`${metrics.gmvEstimate} EUR`}
          hint="Meetup-first MVP with payment-ready architecture"
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              Top categories
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            {metrics.topCategories.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-white">
          <CardHeader>
            <h2 className="font-display text-2xl font-semibold text-slate-950">
              Conversion funnel
            </h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>Landing to signup: {Math.round(metrics.landingToSignup * 100)}%</p>
            <p>Signup to listing: {Math.round(metrics.signupToListing * 100)}%</p>
            <p>
              Listing to completed exchange:{" "}
              {Math.round(metrics.listingToCompletedExchange * 100)}%
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
