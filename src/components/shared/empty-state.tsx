import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card className="border-dashed bg-slate-50">
      <CardHeader>
        <h3 className="font-display text-xl font-semibold text-slate-950">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
