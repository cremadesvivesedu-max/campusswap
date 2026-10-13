import { LegalPage } from "@/components/shared/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="CampusSwap handles marketplace data with a practical student-safety mindset."
      description="This policy explains what CampusSwap collects, why it is used, how payment and support data are handled, and how users can contact us about privacy questions."
      lastUpdated="October 13, 2026"
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
          title: "Emails we send",
          paragraphs: [
            "CampusSwap sends account emails (sign-up confirmation, password reset) and activity emails when something needs your attention: the first new message in a conversation, an offer, a sale, or an update about your listing or order. Email delivery is handled by Resend.",
            "You can switch activity emails off per type in Settings. Safety and account notices are always sent."
          ]
        },
        {
          title: "Cookies and similar technologies",
          paragraphs: [
            "CampusSwap only uses cookies that the service needs to work: a login session cookie so you stay signed in, and a language cookie that is set when you choose a language. We do not use advertising or third-party tracking cookies, so there is no cookie banner.",
            "To improve the product we record a small set of in-app events on our own servers (for example sign-up, listing created, checkout completed), linked to your account. These events do not use cookies and are never shared with advertisers."
          ]
        },
        {
          title: "Who processes data for us",
          paragraphs: [
            "CampusSwap relies on a few service providers that process data on our behalf: Supabase (database, login and file storage), Vercel (website hosting), Stripe (payments and seller payouts) and Resend (email delivery). Each only receives what it needs to provide its part of the service."
          ]
        },
        {
          title: "Anti-abuse protection",
          paragraphs: [
            "To keep the marketplace free of spam, CampusSwap limits how many messages, listings, offers and reports one account can create in a short period. These limits are checked automatically and are not used for anything else."
          ]
        },
        {
          title: "Your rights, downloads and account deletion",
          paragraphs: [
            "You can download a copy of your data and delete your account yourself in Settings. Deleting your account erases your name, email address, photo and bio, takes your listings offline and ends your access. Messages you already sent stay in the other person's chat history without your name, and order records are kept where the law or open disputes require it.",
            "You also have the right to ask for access, correction, restriction or objection, and to complain to the Dutch Data Protection Authority (Autoriteit Persoonsgegevens)."
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
