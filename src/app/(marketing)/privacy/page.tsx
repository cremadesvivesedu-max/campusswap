import { LegalPage } from "@/components/shared/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="CampusSwap handles marketplace data with a practical student-safety mindset."
      description="This policy explains what CampusSwap collects, why it is used, how payment and support data are handled, and how users can contact us about privacy questions."
      lastUpdated="April 22, 2026"
      quickLinks={[
        { href: "/terms", label: "Terms" },
        { href: "/refund-policy", label: "Refunds & disputes" },
        { href: "/contact", label: "Contact" }
      ]}
      sections={[
        {
          title: "What data we collect",
          paragraphs: [
            "CampusSwap collects the information needed to operate a student marketplace. That includes account details such as your name, email address, profile information, campus-related verification details, language or notification preferences, and the content you add to your account.",
            "We also collect listing and order information such as product titles, descriptions, prices, photos, pickup or shipping options, order totals, order states, reviews, saved items, and support or moderation history linked to marketplace activity.",
            "If you use chat, we store conversation messages and attachments you choose to send inside the app so buyers and sellers can safely complete a transaction and so support can review serious issues when needed."
          ]
        },
        {
          title: "How we use marketplace, order, and message data",
          paragraphs: [
            "CampusSwap uses account, listing, message, order, and support data to run the product, show relevant marketplace surfaces, help users buy and sell items, prevent abuse, and keep a record of important order or moderation events.",
            "We may use marketplace activity to power helpful product features such as saved items, recommendations, notification delivery, fraud prevention checks, listing ranking, dispute review, and seller or buyer trust signals.",
            "We do not use private shipping details or support reports as public profile content. Sensitive order and report information stays restricted to the people who need it for the relevant transaction, support case, or safety review."
          ]
        },
        {
          title: "How payment-related data is handled",
          paragraphs: [
            "CampusSwap uses Stripe for payment processing, buyer checkout, seller payout onboarding, and payment-related verification. We do not store full card numbers or full payment instrument details on our own servers.",
            "We do store the operational payment information we need to keep orders coherent, such as transaction ids, paid state, totals, platform fees, payout readiness, connected account state, and limited Stripe references needed for support, reconciliation, and dispute review.",
            "If a payment, refund, or payout issue occurs, CampusSwap and Stripe may process the information needed to investigate and resolve that issue."
          ]
        },
        {
          title: "Support, reports, moderation, and safety",
          paragraphs: [
            "If you report a user, report a listing, open a dispute, or contact support, CampusSwap stores the details you submit together with any relevant listing, conversation, order, or account context. This helps us review the issue fairly and keep a record of actions taken.",
            "Moderation and safety records may be retained longer than ordinary browsing data when necessary to investigate abuse, repeat misconduct, payment risk, chargebacks, fraud, or community safety concerns."
          ]
        },
        {
          title: "Your choices and contact point",
          paragraphs: [
            "You can update profile details, preferences, and much of your marketplace content from inside the product. If you want to ask about access, correction, deletion, or another privacy-related request, please contact CampusSwap through the support center or the contact details on the contact page.",
            "Because CampusSwap is a live marketplace, some records may need to be kept for legal, payment, dispute, safety, fraud-prevention, or transaction-history reasons even after a listing is removed or an account stops using the service."
          ]
        }
      ]}
    />
  );
}
