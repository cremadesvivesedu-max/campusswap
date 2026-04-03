import { Badge } from "@/components/ui/badge";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl space-y-4">
      {eyebrow ? <Badge className="bg-slate-950 text-white">{eyebrow}</Badge> : null}
      <div className="space-y-3">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
        <p className="text-base leading-7 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
