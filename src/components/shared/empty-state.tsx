import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-slate-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.92))]">
      <CardHeader className="pb-4">
        <h3 className="font-display text-2xl font-semibold text-slate-950">{title}</h3>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}
