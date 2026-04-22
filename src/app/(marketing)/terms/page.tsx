import { LegalPage } from "@/components/shared/legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of Service"
      title="CampusSwap is a marketplace platform, not the seller of goods."
      description="These terms set out the basic rules for using CampusSwap responsibly, listing items honestly, paying through the platform, and participating in a safer student marketplace."
      lastUpdated="April 22, 2026"
      quickLinks={[
        { href: "/privacy", label: "Privacy" },
        { href: "/refund-policy", label: "Refunds & disputes" },
        { href: "/trust-safety", label: "Trust & Safety" }
      ]}
      sections={[
        {
          title: "Marketplace role and user responsibility",
          paragraphs: [
            "CampusSwap provides marketplace software that helps buyers and sellers connect, communicate, pay, and handle support issues. Unless we clearly say otherwise, CampusSwap is not the owner, reseller, or direct seller of items listed by users.",
            "Users are responsible for the accuracy of their listings, the legality of the items they offer, the truthfulness of messages and offers, and the way they behave during pickup, shipping, payment, and post-sale communication."
          ]
        },
        {
          title: "Listing and content rules",
          paragraphs: [
            "Sellers must describe items honestly, including condition, defects, included accessories, delivery options, and whether the item is still available. Photos and descriptions should reflect the actual item being offered.",
            "Users may not post illegal items, counterfeit goods, unsafe products, stolen goods, deceptive listings, abusive content, or anything intended to bypass CampusSwap payments, moderation, or marketplace safety systems."
          ]
        },
        {
          title: "Payments, orders, and platform fees",
          paragraphs: [
            "CampusSwap may offer buyer checkout, seller payout onboarding, platform fees, featured listing purchases, and other paid marketplace features through Stripe or another payment partner. Order totals, shipping amounts, and platform fees are shown in the app before checkout where supported.",
            "Buyers and sellers should use the in-app payment and support flows when available. Attempting to manipulate payment records, dispute outcomes, chargebacks, or payout setup may lead to account review, order intervention, or suspension."
          ]
        },
        {
          title: "Meetups, shipping, and trust expectations",
          paragraphs: [
            "Users should favor safe, public, campus-adjacent meetup locations when arranging handovers. If shipping is offered, buyers should provide accurate delivery details and sellers should ship only after the order state and payment state make that appropriate.",
            "CampusSwap can surface trust information, support tools, moderation actions, and order status updates, but users still need to exercise reasonable judgment and communicate honestly."
          ]
        },
        {
          title: "Moderation, suspension, and platform limits",
          paragraphs: [
            "CampusSwap may hide listings, remove content, delay payouts, restrict access, or suspend accounts when there are concerns about safety, policy violations, fraud, abuse, spam, payment manipulation, or repeated community trust issues.",
            "CampusSwap works to provide a reliable platform, but it cannot guarantee every listing, seller, buyer, message, shipment, or meetup outcome. To the extent allowed by law, CampusSwap's liability is limited to the platform service it provides and not the underlying quality or legality of user-listed goods."
          ]
        }
      ]}
    />
  );
}
