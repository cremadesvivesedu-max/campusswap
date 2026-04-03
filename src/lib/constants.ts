import type { ContentBlock, MonetizationModule } from "@/types/domain";

export const siteName = "CampusSwap";
export const siteTagline = "Buy and sell student essentials in Maastricht.";

export const publicNav = [
  { href: "/categories", label: "Categories" },
  { href: "/featured", label: "Featured" },
  { href: "/outlet", label: "Outlet" },
  { href: "/trust-safety", label: "Trust & Safety" },
  { href: "/faq", label: "FAQ" },
  { href: "/join", label: "Join" }
];

export const appNav = [
  { href: "/app", label: "Home" },
  { href: "/app/for-you", label: "For You" },
  { href: "/app/search", label: "Search" },
  { href: "/app/saved", label: "Saved" },
  { href: "/app/messages", label: "Messages" },
  { href: "/app/settings", label: "Settings" }
];

export const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" }
];

export const faqs = [
  {
    question: "Who can use CampusSwap?",
    answer: "CampusSwap is built for students in Maastricht. Public visitors can browse, but selling and messaging are reserved for verified student accounts."
  },
  {
    question: "Do I need a university email?",
    answer: "Yes. Verification rules are managed through approved student-email domains and OTP verification."
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
  "Verified student badges on profiles and listings",
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
    title: "Student-only resale that actually feels organized.",
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
