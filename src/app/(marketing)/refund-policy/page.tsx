import { LegalPage } from "@/components/shared/legal-page";

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Refund & Dispute Policy"
      title="CampusSwap reviews payment and order issues seriously, but not every case is automatically refundable."
      description="This policy explains the difference between featured promotion purchases and buyer listing purchases, when manual review is required, and how disputes should be opened."
      lastUpdated="April 22, 2026"
      quickLinks={[
        { href: "/contact", label: "Contact" },
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" }
      ]}
      sections={[
        {
          title: "Featured promotion purchases",
          paragraphs: [
            "Featured listing purchases are promotional services for additional placement in the product. If payment succeeds and the promotion is activated as described, it is generally not automatically refundable simply because a listing did not receive the outcome a seller hoped for.",
            "If a featured purchase was charged incorrectly, failed to activate correctly, or involved a technical error on CampusSwap's side, the seller should open a payment or support ticket so the case can be reviewed manually."
          ]
        },
        {
          title: "Listing purchases and buyer disputes",
          paragraphs: [
            "Listing purchases cover transactions between buyers and sellers on CampusSwap. Because CampusSwap is a marketplace platform and not the seller of the item, not every complaint leads to an automatic refund. Cases such as item mismatch, non-delivery, payment confusion, or serious seller misconduct may require manual review.",
            "Buyers should open a support or dispute ticket as soon as an issue becomes clear and include the order context, what happened, and any useful evidence from the conversation or handover."
          ]
        },
        {
          title: "Payments, payouts, and manual review",
          paragraphs: [
            "CampusSwap uses Stripe for buyer payments and seller payout readiness. Some payment, chargeback, refund, and payout issues require manual review because the platform needs to consider the order state, seller conduct, shipping details, support history, and Stripe-side payment information together.",
            "CampusSwap may pause or review a case before giving a final answer if there is a risk of fraud, abuse, duplicate claims, or conflicting evidence."
          ]
        },
        {
          title: "How to get help quickly",
          paragraphs: [
            "For disputes, payment help, or shipping issues, the fastest path is the in-app support center. Use the category that best matches the problem so your request is linked to the correct listing, order, or conversation.",
            "If you cannot access the app or need a general contact path, use the Contact page and include enough detail for the team to identify the relevant account or transaction."
          ]
        }
      ]}
    />
  );
}
