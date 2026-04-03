import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function MetricCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <Card className="bg-white">
      <CardHeader>
        <p className="text-sm font-medium text-slate-500">{title}</p>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-semibold text-slate-950">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{hint}</p>
      </CardContent>
    </Card>
  );
}
