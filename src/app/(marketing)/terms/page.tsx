import { SectionHeading } from "@/components/shared/section-heading";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-6 py-16">
      <SectionHeading eyebrow="Terms" title="Marketplace use should stay student-safe, local, and honest." description="CampusSwap terms are written to support student verification, accurate listing information, and a respectful in-person exchange flow." />
      <Card className="bg-white"><CardContent className="space-y-4 p-8 text-sm leading-7 text-slate-600"><p>Sellers must accurately describe item condition, pickup expectations, and known defects.</p><p>Buyers and sellers should keep communication respectful and follow meetup guidance in-app.</p><p>CampusSwap may hide, remove, or review listings and accounts that appear deceptive, unsafe, or outside the community trust and safety rules.</p></CardContent></Card>
    </div>
  );
}
