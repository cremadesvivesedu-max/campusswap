import type { DemoDataBundle } from "@/types/domain";

export const demoData: DemoDataBundle = {
  universities: [
    { id: "uni-um", name: "Maastricht University", city: "Maastricht", domains: ["student.maastrichtuniversity.nl", "maastrichtuniversity.nl"], isTarget: true },
    { id: "uni-zuyd", name: "Zuyd University of Applied Sciences", city: "Maastricht", domains: ["zuyd.nl"], isTarget: true }
  ],
  allowedEmailDomains: [
    { id: "domain-um", domain: "student.maastrichtuniversity.nl", universityId: "uni-um", autoVerify: true },
    { id: "domain-zuyd", domain: "zuyd.nl", universityId: "uni-zuyd", autoVerify: true }
  ],
  verificationRules: [
    { id: "rule-um", universityId: "uni-um", requireEmailOtp: true, blockPostingUntilVerified: false, blockMessagingUntilVerified: false, notes: "Verification boosts trust, but access stays open for launch." },
    { id: "rule-zuyd", universityId: "uni-zuyd", requireEmailOtp: true, blockPostingUntilVerified: false, blockMessagingUntilVerified: false, notes: "Soft verification during launch and testing." }
  ],
  users: [
    {
      id: "user-lina",
      email: "lina@student.maastrichtuniversity.nl",
      role: "student",
      verificationStatus: "verified",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      joinedAt: "2026-01-11T09:00:00.000Z",
      lastSeenAt: "2026-04-01T18:00:00.000Z",
      profile: { userId: "user-lina", fullName: "Lina Vermeer", university: "Maastricht University", studentStatus: "outgoing", neighborhood: "Wyck", bio: "Leaving Maastricht soon and selling apartment essentials.", preferredCategories: ["furniture", "household-items", "electronics"], buyerIntent: false, sellerIntent: true, notificationPreferences: ["messages", "listing_updates", "promotions"], ratingAverage: 4.9, reviewCount: 18, responseRate: 0.97, verifiedBadge: true }
    },
    {
      id: "user-omar",
      email: "omar@student.maastrichtuniversity.nl",
      role: "student",
      verificationStatus: "verified",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      joinedAt: "2026-02-01T09:00:00.000Z",
      lastSeenAt: "2026-04-01T20:00:00.000Z",
      profile: { userId: "user-omar", fullName: "Omar El Hadi", university: "Maastricht University", studentStatus: "incoming", neighborhood: "Randwyck", bio: "Moving into Maastricht next month and saving practical listings.", preferredCategories: ["bikes", "furniture", "kitchen-equipment", "electronics"], buyerIntent: true, sellerIntent: false, notificationPreferences: ["messages", "saved_searches", "featured_digest"], ratingAverage: 4.7, reviewCount: 6, responseRate: 0.91, verifiedBadge: true }
    },
    {
      id: "user-sanne",
      email: "sanne@zuyd.nl",
      role: "student",
      verificationStatus: "verified",
      avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80",
      joinedAt: "2026-01-24T09:00:00.000Z",
      lastSeenAt: "2026-04-01T12:00:00.000Z",
      profile: { userId: "user-sanne", fullName: "Sanne Jacobs", university: "Zuyd University of Applied Sciences", studentStatus: "current", neighborhood: "Jekerkwartier", bio: "Design student flipping practical home items and the occasional monitor.", preferredCategories: ["electronics", "household-items", "essentials-daily-living"], buyerIntent: true, sellerIntent: true, notificationPreferences: ["messages", "price_drops"], ratingAverage: 4.8, reviewCount: 11, responseRate: 0.95, verifiedBadge: true }
    },
    {
      id: "user-mila",
      email: "mila@student.maastrichtuniversity.nl",
      role: "student",
      verificationStatus: "pending",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
      joinedAt: "2026-03-28T09:00:00.000Z",
      lastSeenAt: "2026-04-01T15:00:00.000Z",
      profile: { userId: "user-mila", fullName: "Mila Foster", university: "Maastricht University", studentStatus: "incoming", neighborhood: "Sint Pieter", bio: "Arriving from Dublin and building a first apartment on a budget.", preferredCategories: ["furniture", "textbooks-study-materials", "kitchen-equipment"], buyerIntent: true, sellerIntent: false, notificationPreferences: ["saved_searches", "featured_digest"], ratingAverage: 0, reviewCount: 0, responseRate: 0, verifiedBadge: false }
    },
    {
      id: "user-admin",
      email: "ops@campusswap.app",
      role: "admin",
      verificationStatus: "verified",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
      joinedAt: "2025-12-15T09:00:00.000Z",
      lastSeenAt: "2026-04-01T21:00:00.000Z",
      profile: { userId: "user-admin", fullName: "CampusSwap Ops", university: "CampusSwap", studentStatus: "graduated", neighborhood: "Maastricht", bio: "Runs moderation, trust, growth, and content operations.", preferredCategories: ["furniture", "bikes"], buyerIntent: false, sellerIntent: false, notificationPreferences: ["system"], ratingAverage: 5, reviewCount: 1, responseRate: 1, verifiedBadge: true }
    }
  ],
  categories: [
    { id: "cat-furniture", slug: "furniture", name: "Furniture", shortDescription: "Desks, chairs, storage, and room essentials.", heroDescription: "Set up a room without paying new-furniture prices.", color: "#A7F3D0", typicalPriceRange: "20-180" },
    { id: "cat-bikes", slug: "bikes", name: "Bikes", shortDescription: "Reliable student transport.", heroDescription: "Find a practical city bike before classes start.", color: "#FDE68A", typicalPriceRange: "60-220" },
    { id: "cat-textbooks", slug: "textbooks-study-materials", name: "Textbooks / Study Materials", shortDescription: "Course books and study bundles.", heroDescription: "Skip expensive new editions.", color: "#BFDBFE", typicalPriceRange: "10-60" },
    { id: "cat-electronics", slug: "electronics", name: "Electronics", shortDescription: "Monitors, headphones, routers, and tech.", heroDescription: "Get desk setup essentials without retail prices.", color: "#DDD6FE", typicalPriceRange: "15-240" },
    { id: "cat-kitchen", slug: "kitchen-equipment", name: "Kitchen Equipment", shortDescription: "Pans, kettles, cutlery, and more.", heroDescription: "Move in and cook on day one.", color: "#FDBA74", typicalPriceRange: "5-70" },
    { id: "cat-household", slug: "household-items", name: "Household Items", shortDescription: "Lighting, storage, decor, and cleaning.", heroDescription: "Finish the apartment with the things everyone forgets.", color: "#FCA5A5", typicalPriceRange: "5-80" },
    { id: "cat-essentials", slug: "essentials-daily-living", name: "Essentials / Daily Living", shortDescription: "Bedding and daily setup gear.", heroDescription: "The practical things that make a room livable immediately.", color: "#93C5FD", typicalPriceRange: "5-60" },
    { id: "cat-outlet", slug: "outlet", name: "Outlet", shortDescription: "Urgent, heavily used, or discounted deals.", heroDescription: "Maximum savings with honest condition notes.", color: "#FCA5A5", typicalPriceRange: "0-50" }
  ],
  listings: [
    { id: "listing-bike-1", title: "Gazelle city bike with lock", description: "Reliable student bike with working lights, basket, and two keys.", categorySlug: "bikes", condition: "good", price: 110, negotiable: true, location: "Wyck", pickupArea: "Station side", pickupAvailable: true, shippingAvailable: false, shippingCost: 0, outlet: false, featured: true, urgent: true, status: "active", createdAt: "2026-04-01T08:00:00.000Z", freshnessLabel: "Listed 5h ago", sellerId: "user-lina", sellerRating: 4.9, sellerResponseRate: 0.97, viewCount: 142, saveCount: 29, tags: ["lock included", "lights work", "station pickup"], images: [{ id: "img-bike-1", url: "https://images.unsplash.com/photo-1770191351771-7e9d8cfc8fe9?auto=format&fit=crop&w=1200&q=80", alt: "Gazelle city bike with basket and lock", isPrimary: true }] },
    { id: "listing-desk-1", title: "Compact wooden desk for small student room", description: "Fits a laptop and monitor without taking over the room.", categorySlug: "furniture", condition: "like-new", price: 65, negotiable: false, location: "Jekerkwartier", pickupArea: "Helpoort side", pickupAvailable: true, shippingAvailable: false, shippingCost: 0, outlet: false, featured: true, urgent: false, status: "active", createdAt: "2026-03-31T16:00:00.000Z", freshnessLabel: "Listed yesterday", sellerId: "user-sanne", sellerRating: 4.8, sellerResponseRate: 0.95, viewCount: 88, saveCount: 18, tags: ["study setup", "easy pickup"], images: [{ id: "img-desk-1", url: "https://images.unsplash.com/photo-1759986452774-be47f7db2362?auto=format&fit=crop&w=1200&q=80", alt: "Compact wooden study desk", isPrimary: true }] },
    { id: "listing-chair-1", title: "Desk chair with lumbar support", description: "Comfortable enough for long study days. A few marks on the arms.", categorySlug: "furniture", condition: "good", price: 35, negotiable: true, location: "Randwyck", pickupArea: "UM sports area", pickupAvailable: true, shippingAvailable: false, shippingCost: 0, outlet: false, featured: false, urgent: false, status: "reserved", createdAt: "2026-03-30T12:00:00.000Z", freshnessLabel: "Reserved today", sellerId: "user-lina", sellerRating: 4.9, sellerResponseRate: 0.97, viewCount: 61, saveCount: 13, tags: ["study chair", "reserved"], images: [{ id: "img-chair-1", url: "https://images.unsplash.com/photo-1761446812511-d976288e33e9?auto=format&fit=crop&w=1200&q=80", alt: "Desk chair with lumbar support", isPrimary: true }] },
    { id: "listing-textbook-1", title: "European Law textbook + summary notes", description: "Current edition with clean highlights and a separate summary booklet.", categorySlug: "textbooks-study-materials", condition: "good", price: 22, negotiable: false, location: "Binnenstad", pickupArea: "University library", pickupAvailable: true, shippingAvailable: true, shippingCost: 4, outlet: false, featured: false, urgent: false, status: "active", createdAt: "2026-03-29T11:00:00.000Z", freshnessLabel: "Listed 3 days ago", sellerId: "user-lina", sellerRating: 4.9, sellerResponseRate: 0.97, viewCount: 74, saveCount: 20, tags: ["notes included", "course-ready"], images: [{ id: "img-textbook-1", url: "https://images.unsplash.com/photo-1769987935943-a430236f7b00?auto=format&fit=crop&w=1200&q=80", alt: "European law textbook and summary notes", isPrimary: true }] },
    { id: "listing-monitor-1", title: "24 inch monitor with HDMI cable", description: "Perfect second screen for study sessions. No dead pixels.", categorySlug: "electronics", condition: "like-new", price: 85, negotiable: true, location: "Jekerkwartier", pickupArea: "Tongersestraat", pickupAvailable: true, shippingAvailable: false, shippingCost: 0, outlet: false, featured: true, urgent: false, status: "active", createdAt: "2026-04-01T06:30:00.000Z", freshnessLabel: "Listed this morning", sellerId: "user-sanne", sellerRating: 4.8, sellerResponseRate: 0.95, viewCount: 133, saveCount: 26, tags: ["hdmi included", "study desk"], images: [{ id: "img-monitor-1", url: "https://images.unsplash.com/photo-1639506059089-298ac4b48c4f?auto=format&fit=crop&w=1200&q=80", alt: "24 inch monitor with HDMI cable", isPrimary: true }] },
    { id: "listing-kitchen-1", title: "Starter kitchen set for one student", description: "Pan, pot, plates, bowls, cutlery, and chopping board.", categorySlug: "kitchen-equipment", condition: "good", price: 28, negotiable: false, location: "Randwyck", pickupArea: "Student residence lobby", pickupAvailable: true, shippingAvailable: true, shippingCost: 6, outlet: false, featured: false, urgent: true, status: "active", createdAt: "2026-04-01T10:30:00.000Z", freshnessLabel: "Listed 2h ago", sellerId: "user-lina", sellerRating: 4.9, sellerResponseRate: 0.97, viewCount: 57, saveCount: 10, tags: ["move-in", "bundle", "fast pickup"], images: [{ id: "img-kitchen-1", url: "https://images.unsplash.com/photo-1760269734155-b6bb8c41dad6?auto=format&fit=crop&w=1200&q=80", alt: "Starter kitchen set with pan, pot, and tableware", isPrimary: true }] },
    { id: "listing-lamp-1", title: "Warm desk lamp", description: "Simple metal lamp with adjustable neck for small rooms.", categorySlug: "household-items", condition: "good", price: 12, negotiable: true, location: "Wyck", pickupArea: "Coffeelovers side street", pickupAvailable: true, shippingAvailable: true, shippingCost: 3, outlet: false, featured: false, urgent: false, status: "active", createdAt: "2026-03-28T11:30:00.000Z", freshnessLabel: "Listed 4 days ago", sellerId: "user-lina", sellerRating: 4.9, sellerResponseRate: 0.97, viewCount: 32, saveCount: 7, tags: ["lighting", "small room"], images: [{ id: "img-lamp-1", url: "https://images.unsplash.com/photo-1763478959023-8528a9d44a59?auto=format&fit=crop&w=1200&q=80", alt: "Warm desk lamp for a student room", isPrimary: true }] },
    { id: "listing-bedding-1", title: "Single duvet + cover set", description: "Freshly washed duvet, cover, and pillowcase.", categorySlug: "essentials-daily-living", condition: "good", price: 18, negotiable: false, location: "Sint Pieter", pickupArea: "Near bus stop", pickupAvailable: true, shippingAvailable: true, shippingCost: 5, outlet: false, featured: false, urgent: false, status: "active", createdAt: "2026-03-31T18:00:00.000Z", freshnessLabel: "Listed yesterday", sellerId: "user-sanne", sellerRating: 4.8, sellerResponseRate: 0.95, viewCount: 43, saveCount: 12, tags: ["move-in essential", "washed"], images: [{ id: "img-bedding-1", url: "https://images.unsplash.com/photo-1642026391740-fa9c57090831?auto=format&fit=crop&w=1200&q=80", alt: "Single duvet and cover set", isPrimary: true }] },
    { id: "listing-headphones-1", title: "Noise-isolating study headphones", description: "Wired headphones with cosmetic wear only. Cheap because of an upgrade.", categorySlug: "electronics", condition: "fair", price: 15, negotiable: true, location: "Binnenstad", pickupArea: "Law faculty entrance", pickupAvailable: true, shippingAvailable: true, shippingCost: 4, outlet: true, featured: false, urgent: true, status: "active", createdAt: "2026-04-01T09:20:00.000Z", freshnessLabel: "Outlet drop today", sellerId: "user-sanne", sellerRating: 4.8, sellerResponseRate: 0.95, viewCount: 68, saveCount: 15, tags: ["outlet", "cheap tech", "study"], images: [{ id: "img-headphones-1", url: "https://images.unsplash.com/photo-1726250527490-4682532a8481?auto=format&fit=crop&w=1200&q=80", alt: "Noise-isolating study headphones", isPrimary: true }] },
    { id: "listing-storage-1", title: "Rolling storage unit with one damaged wheel", description: "Still usable under a desk or next to a bed. Wheel drags slightly.", categorySlug: "outlet", condition: "needs-love", price: 8, negotiable: false, location: "Wyck", pickupArea: "Station side", pickupAvailable: true, shippingAvailable: false, shippingCost: 0, outlet: true, featured: true, urgent: true, status: "active", createdAt: "2026-04-01T07:50:00.000Z", freshnessLabel: "Outlet drop today", sellerId: "user-lina", sellerRating: 4.9, sellerResponseRate: 0.97, viewCount: 109, saveCount: 22, tags: ["outlet", "urgent sale", "storage"], images: [{ id: "img-storage-1", url: "https://images.unsplash.com/photo-1750306956000-fef886f30dbf?auto=format&fit=crop&w=1200&q=80", alt: "Rolling storage unit with one damaged wheel", isPrimary: true }] },
    { id: "listing-appliance-1", title: "Mini rice cooker", description: "Ideal for student meals, works perfectly, tiny scratch on the lid.", categorySlug: "kitchen-equipment", condition: "fair", price: 14, negotiable: true, location: "Randwyck", pickupArea: "UM sports area", pickupAvailable: true, shippingAvailable: true, shippingCost: 5, outlet: true, featured: false, urgent: true, status: "active", createdAt: "2026-03-31T07:00:00.000Z", freshnessLabel: "Outlet this week", sellerId: "user-lina", sellerRating: 4.9, sellerResponseRate: 0.97, viewCount: 48, saveCount: 8, tags: ["outlet", "kitchen essential"], images: [{ id: "img-appliance-1", url: "https://images.unsplash.com/photo-1615196345808-e93bdc71b1d2?auto=format&fit=crop&w=1200&q=80", alt: "Mini rice cooker for student meals", isPrimary: true }] },
    { id: "listing-bookcase-1", title: "Narrow bookcase for hallway or room corner", description: "A few scratches but sturdy. Great for textbooks or folded clothes.", categorySlug: "household-items", condition: "fair", price: 20, negotiable: true, location: "Sint Pieter", pickupArea: "Near bus stop", pickupAvailable: true, shippingAvailable: false, shippingCost: 0, outlet: false, featured: false, urgent: false, status: "sold", createdAt: "2026-03-25T10:00:00.000Z", freshnessLabel: "Sold this week", sellerId: "user-sanne", sellerRating: 4.8, sellerResponseRate: 0.95, viewCount: 121, saveCount: 19, tags: ["sold", "storage"], images: [{ id: "img-bookcase-1", url: "https://images.unsplash.com/photo-1753103337633-20133e6f80f0?auto=format&fit=crop&w=1200&q=80", alt: "Narrow bookcase for hallway or room corner", isPrimary: true }] }
  ],
  favorites: [
    { userId: "user-omar", listingId: "listing-bike-1" },
    { userId: "user-omar", listingId: "listing-monitor-1" },
    { userId: "user-omar", listingId: "listing-kitchen-1" },
    { userId: "user-mila", listingId: "listing-desk-1" },
    { userId: "user-mila", listingId: "listing-textbook-1" }
  ],
  viewEvents: [
    { userId: "user-omar", listingId: "listing-bike-1", viewedAt: "2026-04-01T18:00:00.000Z" },
    { userId: "user-omar", listingId: "listing-monitor-1", viewedAt: "2026-04-01T18:20:00.000Z" },
    { userId: "user-omar", listingId: "listing-storage-1", viewedAt: "2026-04-01T18:45:00.000Z" },
    { userId: "user-mila", listingId: "listing-desk-1", viewedAt: "2026-04-01T10:00:00.000Z" },
    { userId: "user-mila", listingId: "listing-bedding-1", viewedAt: "2026-04-01T11:00:00.000Z" }
  ],
  searchEvents: [
    { userId: "user-omar", query: "bike with lock", categorySlug: "bikes", createdAt: "2026-04-01T18:15:00.000Z" },
    { userId: "user-omar", query: "monitor desk setup", categorySlug: "electronics", createdAt: "2026-04-01T18:30:00.000Z" },
    { userId: "user-mila", query: "small desk", categorySlug: "furniture", createdAt: "2026-04-01T09:30:00.000Z" },
    { userId: "user-mila", query: "bedding set", categorySlug: "essentials-daily-living", createdAt: "2026-04-01T10:30:00.000Z" }
  ],
  recommendationEvents: [],
  conversations: [
    {
      id: "conv-bike",
      listingId: "listing-bike-1",
      buyerId: "user-omar",
      sellerId: "user-lina",
      unreadCount: 1,
      quickActions: ["Is this available?", "Can you reserve it?", "Can we meet on campus?", "Is the price negotiable?"],
      messages: [
        { id: "msg-1", conversationId: "conv-bike", senderId: "user-omar", text: "Hi Lina, is the Gazelle still available this week?", sentAt: "2026-04-01T18:05:00.000Z", read: true },
        { id: "msg-2", conversationId: "conv-bike", senderId: "user-lina", text: "Yes, still available. I can meet near the station tomorrow afternoon.", sentAt: "2026-04-01T18:10:00.000Z", read: true },
        { id: "msg-3", conversationId: "conv-bike", senderId: "user-omar", text: "Perfect. Could you reserve it until tomorrow at 16:00?", sentAt: "2026-04-01T18:13:00.000Z", read: false }
      ]
    },
    {
      id: "conv-desk",
      listingId: "listing-desk-1",
      buyerId: "user-mila",
      sellerId: "user-sanne",
      unreadCount: 0,
      quickActions: ["Is this available?", "Can you reserve it?"],
      messages: [
        { id: "msg-4", conversationId: "conv-desk", senderId: "user-mila", text: "Would this desk fit a 24 inch monitor and laptop stand?", sentAt: "2026-04-01T09:45:00.000Z", read: true },
        { id: "msg-5", conversationId: "conv-desk", senderId: "user-sanne", text: "Yes, I used it with exactly that setup.", sentAt: "2026-04-01T09:49:00.000Z", read: true }
      ]
    }
  ],
  transactions: [
    { id: "txn-bookcase", listingId: "listing-bookcase-1", buyerId: "user-omar", sellerId: "user-sanne", state: "completed", amount: 30, fulfillmentMethod: "pickup", shippingAmount: 0, platformFee: 0, totalAmount: 30, meetupSpot: "University Library front steps", meetupWindow: "March 30, 18:00", createdAt: "2026-03-29T15:00:00.000Z", updatedAt: "2026-03-30T18:30:00.000Z", completedAt: "2026-03-30T18:30:00.000Z" },
    { id: "txn-chair", listingId: "listing-chair-1", buyerId: "user-omar", sellerId: "user-lina", state: "reserved", amount: 18, fulfillmentMethod: "pickup", shippingAmount: 0, platformFee: 0, totalAmount: 18, meetupSpot: "UM Sports entrance", meetupWindow: "April 3, 14:00", createdAt: "2026-04-02T10:15:00.000Z", updatedAt: "2026-04-03T12:00:00.000Z", reservedAt: "2026-04-03T12:00:00.000Z" }
  ],
  reviews: [
    { id: "review-1", transactionId: "txn-bookcase", authorId: "user-omar", targetUserId: "user-sanne", rating: 5, text: "Fast replies, clear photos, and exactly as described.", createdAt: "2026-03-30T19:00:00.000Z" },
    { id: "review-2", transactionId: "txn-bookcase", authorId: "user-sanne", targetUserId: "user-omar", rating: 5, text: "Easy meetup, on time, and very clear communication.", createdAt: "2026-03-30T19:10:00.000Z" }
  ],
  reports: [
      { id: "report-1", reporterId: "user-omar", targetType: "listing", targetId: "listing-headphones-1", status: "in-review", reason: "Condition looks more worn than photos suggest.", createdAt: "2026-04-01T18:55:00.000Z" }
    ],
    supportTickets: [
      {
        id: "support-1",
        userId: "user-omar",
        type: "purchase-dispute",
        status: "open",
        subject: "Need help confirming a delayed pickup",
        details: "The seller asked to postpone twice and I want to know whether I should cancel or wait.",
        listingId: "listing-chair-1",
        transactionId: "txn-chair",
        targetUserId: "user-lina",
        createdAt: "2026-04-03T13:20:00.000Z",
        updatedAt: "2026-04-03T13:20:00.000Z"
      }
    ],
    moderationActions: [
      { id: "mod-1", reportId: "report-1", actorId: "user-admin", action: "Requested refreshed photos from seller.", createdAt: "2026-04-01T19:10:00.000Z" }
    ],
  sponsoredPlacements: [
    { id: "sponsor-1", name: "Maas Laundry Club", label: "Demo sponsor", location: "Home feed", copy: "Student laundry pickup near Wyck. Demo sponsor card only.", cta: "See offer", href: "/join", active: true },
    { id: "sponsor-2", name: "Cycle Fix Maastricht", label: "Demo sponsor", location: "Bike category", copy: "Affordable same-day puncture fixes. Demo placement.", cta: "Book repair", href: "/trust-safety", active: true }
  ],
  promotionPurchases: [
    { id: "promo-1", listingId: "listing-bike-1", sellerId: "user-lina", type: "featured", amount: 2, status: "paid", active: true, createdAt: "2026-04-01T08:05:00.000Z", updatedAt: "2026-04-01T08:06:00.000Z", paidAt: "2026-04-01T08:06:00.000Z" },
    { id: "promo-2", listingId: "listing-monitor-1", sellerId: "user-sanne", type: "seller-boost", amount: 5, status: "paid", active: true, createdAt: "2026-04-01T06:35:00.000Z", updatedAt: "2026-04-01T06:35:00.000Z", paidAt: "2026-04-01T06:35:00.000Z" }
  ],
  notifications: [
    { id: "notif-1", userId: "user-omar", type: "message", title: "Lina replied about the Gazelle bike", body: "She can meet near the station tomorrow afternoon.", read: false, createdAt: "2026-04-01T18:11:00.000Z" },
    { id: "notif-2", userId: "user-lina", type: "promotion", title: "Your featured listing is live", body: "The Gazelle bike is now boosted across featured placements.", read: true, createdAt: "2026-04-01T08:06:00.000Z" }
  ],
  waitlistLeads: [
    { id: "lead-1", email: "future@student.maastrichtuniversity.nl", intent: "both", createdAt: "2026-03-22T12:00:00.000Z" }
  ],
  contentBlocks: [
    { id: "content-1", key: "hero", type: "hero", title: "Buy and sell student essentials in Maastricht.", body: "A student-first marketplace for bikes, furniture, textbooks, electronics, and everything in between.", cta: "Browse the marketplace" },
    { id: "content-2", key: "waitlist", type: "seo", title: "Join the CampusSwap community", body: "Get launch updates, featured drops, and student-first resale tips for Maastricht." }
  ],
  pricingSettings: [
    { id: "price-1", module: "promoted-listings", label: "Featured listing price", value: 2, unit: "EUR", active: true },
    { id: "price-2", module: "seller-boost", label: "Seller boost price", value: 5, unit: "EUR", active: true },
    { id: "price-3", module: "commission-ready", label: "Target commission rate", value: 12, unit: "%", active: false }
  ],
  auditLogs: [
    { id: "audit-1", actorId: "user-admin", entity: "report", entityId: "report-1", action: "marked_in_review", createdAt: "2026-04-01T19:10:00.000Z" }
  ]
};

export const demoCurrentUserId = "user-omar";
export const demoAdminUserId = "user-admin";
