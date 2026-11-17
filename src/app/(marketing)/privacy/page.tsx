import { LegalPage } from "@/components/shared/legal-page";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata("Privacy policy", "How CampusSwap collects and protects your personal data.");

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="CampusSwap handles marketplace data with a practical student-safety mindset."
      description="This policy explains what CampusSwap collects, why it is used, how payment and support data are handled, and how users can contact us about privacy questions."
      lastUpdated="November 17, 2026"
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
            "For the security and running of the service we keep a separate internal log of a small set of in-app events on our own servers (for example sign-up, listing created, checkout completed), linked to your account. These events do not use cookies and are never shared with advertisers. They are not the anonymous counts described below.",
            "We count visits to our website with a simple daily total. When a page loads, your browser asks our server to add one to that day's count. We do not store your IP address, browser details, a cookie or anything on your device, and the count cannot be linked to you. We use these totals to understand how many visitors sign up, list items and complete sales, and to notice problems. Only aggregated totals are ever shared inside our team. Our legal basis for the brief technical processing of the request is our legitimate interest in understanding and improving the service (Article 6(1)(f) GDPR).",
            "We use Vercel Web Analytics to measure page views and a few product events (sign-up, listing created, sale completed). It does not use cookies or store anything on your device, and these events carry no personal details. They are not linked to your account. Vercel processes this data on our behalf. Our legal basis is our legitimate interest in improving the service (Article 6(1)(f) GDPR)."
          ]
        },
        {
          title: "University email verification",
          paragraphs: [
            "If you choose to verify your student status, you enter your university email address (for example @student.maastrichtuniversity.nl, @maastrichtuniversity.nl or @zuyd.nl). We send a one-time six-digit code to that address through Resend. Until you use the code or it expires, we temporarily store your university email address and a protected (hashed) version of the code; the code is valid for 15 minutes and can be tried at most 5 times. Expired codes are deleted automatically.",
            "Once you verify, we keep only a protected, one-way hashed version of your university email address (so the same address cannot verify several accounts), the date of verification, your university and your 'verified' badge. We do not keep the address itself. A hashed email address still counts as personal data, so we treat it as such. Verification is optional. Our legal bases are performance of the service you request (Article 6(1)(b) GDPR) and our legitimate interest in preventing fraud and duplicate accounts (Article 6(1)(f) GDPR). This data is deleted when you delete your account."
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
