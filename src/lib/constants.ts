import type { ContentBlock, MonetizationModule } from "@/types/domain";

export const siteName = "CampusSwap";
export const siteTagline = "Buy and sell student essentials in Maastricht.";

export const publicNav = [
  { href: "/categories", key: "categories" },
  { href: "/featured", key: "featured" },
  { href: "/outlet", key: "outlet" },
  { href: "/trust-safety", key: "trustSafety" },
  { href: "/faq", key: "faq" },
  { href: "/join", key: "join" }
] as const;

export const appNav = [
  { href: "/app", key: "home" },
  { href: "/app/for-you", key: "forYou" },
  { href: "/app/search", key: "search" },
  { href: "/app/messages", key: "messages" },
  { href: "/app/support", key: "support" },
  { href: "/app/settings", key: "settings" }
] as const;

export const adminNav = [
  { href: "/admin", key: "dashboard" },
  { href: "/admin/users", key: "users" },
  { href: "/admin/listings", key: "listings" },
  { href: "/admin/reports", key: "reports" },
  { href: "/admin/analytics", key: "analytics" },
  { href: "/admin/settings", key: "settings" }
] as const;

export const faqs = [
  {
    question: "Who can use CampusSwap?",
    answer: "CampusSwap is built for student life in Maastricht. Any user can create an account and browse, while student verification adds stronger trust signals across the marketplace."
  },
  {
    question: "Do I need a university email?",
    answer: "No. Any valid email can create an account. Supported university domains unlock verified or pending student status for additional trust."
  },
  {
    question: "How do payments work?",
    answer: "Most exchanges happen in person. Promoted listings are paid online, while item handoff stays meetup-first in the MVP."
  },
  {
    question: "What is Outlet?",
    answer: "Outlet highlights urgent, heavily used, and budget-friendly items that still help students settle in affordably."
  }
];

export const trustSignals = [
  "Visible verification status on profiles, listings, and messages",
  "Moderation queue for suspicious listings and reports",
  "Safe meetup prompts near every conversation and exchange",
  "Ratings only unlock after a completed transaction"
];

export const monetizationModuleLabels: Record<MonetizationModule, string> = {
  "promoted-listings": "Promoted listings",
  "seller-boost": "Seller boost",
  "sponsor-cards": "Sponsored placements",
  "commission-ready": "Commission-ready architecture"
};

export const defaultContentBlocks: ContentBlock[] = [
  {
    id: "block-hero",
    key: "hero",
    type: "hero",
    title: "Student-first resale that actually feels organized.",
    body: "CampusSwap helps students arriving in Maastricht set up quickly, and students leaving sell fast without drowning in group chats.",
    cta: "Browse listings"
  },
  {
    id: "block-trust",
    key: "trust",
    type: "trust",
    title: "Safety built into every exchange.",
    body: "Verification, moderation, meetup prompts, and visible trust markers turn a chaotic resale moment into a calmer one."
  }
];
