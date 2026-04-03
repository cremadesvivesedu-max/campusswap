import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const steps = [
  { title: "Create your account", body: "Any valid email can enter CampusSwap. Supported Maastricht student domains unlock verified or pending student-trust status when available." },
  { title: "Browse or list fast", body: "Use categories, featured inventory, outlet, and For You recommendations, or create a listing with urgency, negotiable, and promoted controls." },
  { title: "Arrange a meetup", body: "Messaging stays linked to the listing, quick actions reduce friction, and safe meetup prompts keep in-person exchanges front and center." },
  { title: "Close the loop", body: "Reserve items, mark the exchange complete, and leave reviews once the handoff is done." }
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-16">
      <SectionHeading eyebrow="How it works" title="A simpler, safer resale loop for student life in Maastricht." description="Every step is designed to reduce friction when timing matters: move-in weeks, lease endings, semester changes, and tight budgets." />
      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((step, index) => (
          <Card key={step.title} className="bg-white">
            <CardHeader><p className="text-sm font-semibold text-slate-400">Step {index + 1}</p><h2 className="font-display text-2xl font-semibold text-slate-950">{step.title}</h2></CardHeader>
            <CardContent><p className="text-sm leading-7 text-slate-600">{step.body}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
