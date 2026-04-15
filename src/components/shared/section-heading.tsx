import { Badge } from "@/components/ui/badge";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description: string;
}

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-3xl space-y-5">
      {eyebrow ? (
        <Badge className="bg-slate-950 px-3.5 text-white shadow-none">
          {eyebrow}
        </Badge>
      ) : null}
      <div className="space-y-3.5">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.6rem]">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-[1.02rem]">
          {description}
        </p>
      </div>
    </div>
  );
}
