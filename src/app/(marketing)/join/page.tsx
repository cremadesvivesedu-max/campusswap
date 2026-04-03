import { WaitlistForm } from "@/components/forms/waitlist-form";
import { SectionHeading } from "@/components/shared/section-heading";

export default function JoinPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1fr_0.8fr]">
      <SectionHeading eyebrow="Join CampusSwap" title="Get launch updates, featured drops, and student-focused resale alerts." description="This waitlist architecture supports launch signups, featured digests, saved-search alerts, and referral-ready email flows later on." />
      <WaitlistForm />
    </div>
  );
}
