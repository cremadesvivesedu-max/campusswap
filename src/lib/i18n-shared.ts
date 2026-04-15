import type {
  ExchangeStatus,
  ListingCondition,
  ListingStatus,
  NotificationType,
  OfferStatus
} from "@/types/domain";

export const localeCookieName = "campusswap-locale";
export const supportedLocales = ["en", "es", "nl"] as const;
export type AppLocale = (typeof supportedLocales)[number];

export const dictionaries = {
  en: {
    localeLabel: "English",
    languageSwitcher: { label: "Language" },
    nav: {
      public: { categories: "Categories", featured: "Featured", outlet: "Outlet", trustSafety: "Trust & Safety", faq: "FAQ", join: "Join" },
      app: { home: "Home", forYou: "For You", search: "Search", saved: "Saved", messages: "Messages", support: "Support", settings: "Settings" },
      admin: { dashboard: "Dashboard", users: "Users", listings: "Listings", reports: "Reports", analytics: "Analytics", settings: "Settings" }
    },
    site: {
      publicTagline: "Student-first marketplace for Maastricht",
      adminTagline: "Moderation, growth, and monetization control center",
      adminLabel: "Admin",
      logIn: "Log in",
      sellItem: "Sell an item"
    },
    support: {
      eyebrow: "Support center",
      title: "Resolve marketplace issues without leaving CampusSwap.",
      description: "Report suspicious activity, ask for help, and keep every issue tied to the real listing, seller, or order context.",
      chooseCategory: "Choose the issue type that best matches what happened.",
      contactFallback: "For urgent issues outside the app, you can also reach CampusSwap at {email}.",
      contextRequiredListing: "Open this flow from a listing so CampusSwap knows which listing to review.",
      contextRequiredUser: "Open this flow from a seller profile so CampusSwap knows who you are reporting.",
      openForm: "Open form",
      openListing: "Open listing",
      openConversation: "Open conversation",
      openPurchases: "Open purchases",
      openProfile: "Open profile",
      reportListingCta: "Report listing",
      reportUserCta: "Report user",
      purchaseDisputeCta: "Open dispute",
      paymentHelpCta: "Payment help",
      shippingHelpCta: "Shipping help",
      orderHelpTitle: "Need help with this order?",
      cards: {
        reportUserTitle: "Report user",
        reportUserDescription: "Flag suspicious, unsafe, or misleading seller behavior for moderation review.",
        reportListingTitle: "Report listing",
        reportListingDescription: "Report inaccurate, suspicious, or unsafe listing details from the live listing context.",
        purchaseDisputeTitle: "Purchase dispute",
        purchaseDisputeDescription: "Get help when the meetup, handoff, or item condition does not match what was agreed.",
        paymentHelpTitle: "Payment help",
        paymentHelpDescription: "Ask for help with featured payments, payment confirmations, or billing confusion.",
        shippingHelpTitle: "Shipping help",
        shippingHelpDescription: "Get help with shipping delays, shipping expectations, or delivery confusion."
      },
      form: {
        contextLabel: "Attached context",
        subjectLabel: "Subject",
        subjectPlaceholder: "Short summary of what you need help with",
        reportSubjectHidden: "",
        submit: "Send request",
        submitting: "Sending...",
        detailsLabel: "What happened",
        reportUserPlaceholder: "Tell CampusSwap what happened with this user and why it feels unsafe, misleading, or inappropriate.",
        reportListingPlaceholder: "Tell CampusSwap what feels inaccurate, unsafe, or suspicious about this listing.",
        purchaseDisputePlaceholder: "Explain what happened with the order, meetup, or item condition so CampusSwap can review the dispute.",
        paymentHelpPlaceholder: "Describe the payment or promotion issue you need help with.",
        shippingHelpPlaceholder: "Describe the shipping issue, delay, or delivery problem you need help with."
      },
      yourTicketsEyebrow: "Support tickets",
      yourTicketsTitle: "Your active support requests",
      yourTicketsDescription: "Track dispute, payment, and shipping requests without losing listing context.",
      noTicketsTitle: "No support tickets yet",
      noTicketsDescription: "When you ask CampusSwap for help, your requests will appear here with their latest status.",
      yourReportsEyebrow: "Reports",
      yourReportsTitle: "Your safety reports",
      yourReportsDescription: "Marketplace reports stay visible here while moderation reviews them.",
      noReportsTitle: "No reports yet",
      noReportsDescription: "When you report a listing or user, CampusSwap will track it here.",
      ticketStatusLabels: { open: "Open", inReview: "In review", resolved: "Resolved", closed: "Closed" },
      reportStatusLabels: { open: "Open", inReview: "In review", actioned: "Actioned", dismissed: "Dismissed" },
      targetLabels: { listing: "Listing", user: "User", conversation: "Conversation", transaction: "Transaction" }
    },
    common: {
      actions: {
        editListing: "Edit listing",
        viewListing: "View listing",
        openListing: "Open listing",
        openConversation: "Open conversation",
        openPurchaseChat: "Open purchase chat",
        openBuyerChat: "Open buyer chat",
        browseEveryCategory: "Browse every category",
        browseCategory: "Browse category",
        exploreOutlet: "Explore Outlet",
        searchAllListings: "Search all listings",
        startSelling: "Start selling",
        publishListing: "Publish listing",
        saveChanges: "Save changes",
        cancel: "Cancel",
        updating: "Updating...",
        opening: "Opening...",
        removing: "Removing...",
        removeListing: "Remove listing",
        clearAll: "Clear all filters"
      },
      typicalRange: "Typical range",
      conditionLabels: { new: "New", "like-new": "Like new", good: "Good", fair: "Fair", "needs-love": "Needs love" },
      listingStatusLabels: { active: "Active", reserved: "Reserved", sold: "Sold", archived: "Archived", "pending-review": "Pending review", hidden: "Removed" },
      exchangeStatusLabels: {
        inquiry: "Conversation started",
        negotiating: "Purchase requested",
        pending: "Pending",
        reserved: "Reserved",
        paid: "Paid",
        "ready-for-pickup": "Ready for pickup",
        shipped: "Shipped",
        delivered: "Delivered",
        completed: "Completed",
        cancelled: "Cancelled",
        reported: "Reported"
      },
      notificationPreferenceLabels: { messages: "Messages", listingUpdates: "Listing updates", savedSearches: "Saved search alerts", featuredDigest: "Featured digest", promotions: "Promotion updates" }
    },
    auth: {
      signup: {
        eyebrow: "Create account",
        title: "Create your CampusSwap account and enter the marketplace right away.",
        description: "Any valid email can create an account. Student verification stays available as an optional trust layer for stronger badges and safer meetup signaling.",
        namePlaceholder: "Full name",
        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "Choose a password",
        submit: "Create account",
        submitting: "Creating account...",
        domainHint: "Any valid email can sign up. Supported student domains for faster trust status:"
      },
      login: {
        eyebrow: "Login",
        title: "Welcome back to CampusSwap.",
        description: "Log in with your email and password to pick up where you left off with saved listings, messages, and meetup planning.",
        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "Password",
        submit: "Log in",
        submitting: "Logging in...",
        noAccount: "No account yet?",
        createOne: "Create one",
        forgotPassword: "Forgot password?"
      },
      onboarding: {
        eyebrow: "Onboarding",
        title: "Shape your feed around what you actually need in Maastricht.",
        description: "Category preferences, student status, and pickup areas help CampusSwap build a more useful home feed from day one. Student verification stays optional and can be handled separately.",
        notice: "You can finish onboarding and enter the marketplace right away. Student verification is a separate trust signal, not a blocker for using CampusSwap.",
        fullName: "Your full name",
        neighborhood: "Preferred pickup area",
        bio: "Tell buyers and sellers what you are looking for",
        preferredCategories: "Preferred categories",
        buyerIntent: "Buyer intent",
        sellerIntent: "Seller intent",
        notifications: "Notifications",
        save: "Save onboarding",
        status: { incoming: "Incoming", current: "Current", outgoing: "Outgoing", graduated: "Graduated" },
        notificationOptions: { messages: "Message updates", listingUpdates: "Listing updates", savedSearches: "Saved-search alerts", featuredDigest: "Featured digest" }
      },
      verifyEmail: {
        eyebrow: "Verify email",
        title: "Student verification is optional, but it strengthens trust.",
        description: "You can already enter CampusSwap. Supported university domains can auto-verify or move into a pending-review trust state without blocking the rest of the app.",
        rules: [
          "Any valid email can create and access a CampusSwap account.",
          "Supported student domains can unlock a verified badge or a pending-verification trust state.",
          "Verification stays visible on your profile, listings, and conversations, but it does not block basic app access."
        ],
        supportedDomains: "Supported student domains",
        accountEmail: "Account email",
        openApp: "Open the app",
        continueIntoApp: "Continue into CampusSwap"
      },
      forgotPassword: {
        eyebrow: "Password reset",
        title: "Send yourself a reset link.",
        description: "Enter the email you use on CampusSwap and we will send you a secure password reset link.",
        emailPlaceholder: "you@example.com",
        submit: "Send reset email",
        submitting: "Sending...",
        success: "Reset email sent. Check your inbox and spam folder for the secure link.",
        backToLogin: "Back to login"
      },
      resetPassword: {
        eyebrow: "Set a new password",
        title: "Choose a new password for your CampusSwap account.",
        description: "Once the reset link is validated, you can set a new password and continue into the app.",
        passwordPlaceholder: "New password",
        confirmPasswordPlaceholder: "Confirm new password",
        submit: "Update password",
        submitting: "Updating password...",
        invalidLink: "This reset link is missing, expired, or no longer valid. Request a new one from login.",
        success: "Password updated. You can now log in with your new password.",
        backToLogin: "Back to login",
        mismatch: "Passwords do not match."
      }
    },
    search: {
      eyebrow: "Search & discovery",
      title: "Fast browsing for when you need to decide quickly.",
      description: "Search, filters, subcategories, and sorting all update the result set in real time so buyers can compare options without friction.",
      controls: "Discovery controls",
      query: "Search",
      queryPlaceholder: "Search bikes, desks, bedding, or monitors",
      categories: "Categories",
      subcategories: "Subcategories",
      minPrice: "Min price",
      maxPrice: "Max price",
      condition: "Condition",
      outletOnly: "Outlet only",
      featuredOnly: "Featured only",
      minimumSellerRating: "Minimum seller rating",
      sort: "Sort",
      sortOptions: { recommended: "Recommended", relevance: "Relevance", newest: "Newest", priceLowHigh: "Price low-high", priceHighLow: "Price high-low" },
      trending: "Trending",
      recent: "Recent",
      results: "results",
      resultsDescription: "Discovery updates instantly as filters change, so buyers can move faster during move-in and move-out weeks.",
      recommendationPrefix: "Why you are seeing this",
      clearAll: "Clear all filters",
      emptyTitle: "No listings match these filters yet",
      emptyDescription: "Try widening the price range, clearing a condition filter, or switching off featured-only to surface more CampusSwap inventory.",
      filterLabels: { search: "Search", category: "Category", subcategory: "Subcategory", min: "Min EUR", max: "Max EUR", condition: "Condition", sellerRating: "Seller rating", sort: "Sort" }
    },
    messages: {
      eyebrow: "Messages",
      title: "Listing-linked chat keeps the meetup context intact.",
      description: "Quick actions send instantly, new threads open from listing cards and detail pages, and every conversation keeps the listing and seller context visible.",
      conversationEyebrow: "Conversation",
      conversationTitle: "Keep pickup details, price questions, and availability in one thread.",
      conversationDescription: "Every message stays attached to the listing so both sides can coordinate the meetup without losing context.",
      actions: {
        yourListing: "Your listing",
        itemSold: "Item sold",
        listingUnavailable: "Listing unavailable",
        photoAttachment: "Photo attachment",
        signUpToMessage: "Sign up to message",
        messageSeller: "Message seller",
        verificationNoticePrefix: "You are messaging as",
        verificationNoticeSuffix: "Verification is optional, but it adds a stronger trust signal.",
        openConversation: "Open conversation",
        noMessagesYet: "No messages yet",
        unread: "unread"
      },
      thread: {
        liveThread: "Live thread",
        autoUpdate: "New messages appear here automatically.",
        quickReplies: "Quick replies",
        attachmentReady: "Attachment ready",
        messagePlaceholder: "Write a message about timing, price, or pickup details",
        attach: "Attach",
        attachSoon: "Attach coming soon",
        send: "Send",
        sending: "Sending...",
        listingContext: "Listing context",
        pickupArea: "Pickup area",
        meetupSafely: "Meet up safely",
        meetupSafelyBody: "Prefer campus-adjacent or high-footfall pickup spots and keep listing-linked chat active until the handoff is done.",
        conversationUnavailableTitle: "Conversation unavailable",
        conversationUnavailableDescription: "The chat context could not be loaded. Try opening the listing again and starting a new message.",
        demoExchangeTitle: "Demo exchange state",
        demoExchangeDescription: "Switch to live mode to persist reservation, sold state, and mutual review eligibility inside this conversation."
      },
      exchange: {
        title: "Exchange status",
        sellerBody: "Use this thread to coordinate the handoff. Only move the order forward after CampusSwap records payment.",
        buyerBody: "Use this thread to confirm details. The order only counts as paid after Stripe Checkout succeeds.",
        buyerLabel: "Buyer",
        sellerLabel: "Seller",
        listingStatus: "Listing status",
        price: "Price",
        meetupArea: "Meetup area",
        meetupWindow: "Meetup window",
        fulfillmentMethod: "Fulfillment",
        chooseFulfillment: "Choose fulfillment",
        pickupOption: "Pickup",
        shippingOption: "Shipping",
        pickupOnly: "Pickup only",
        shippingOnly: "Shipping only",
        orderBreakdownTitle: "Order breakdown",
        itemPrice: "Item price",
        shippingCost: "Shipping",
        platformFee: "Platform fee",
        totalAmount: "Total",
        reservedAt: "Reserved at",
        paidAt: "Paid at",
        readyAt: "Ready for pickup at",
        shippedAt: "Shipped at",
        deliveredAt: "Delivered at",
        completedAt: "Completed at",
        cancelledAt: "Cancelled at",
        pricePending: "Pending confirmation",
        meetupTbd: "To be agreed in chat",
        windowTbd: "To be scheduled",
        chatOnly: "Chat only",
        noBuyerLinked: "No buyer is linked yet. When someone starts a purchase request, it will appear here.",
        reservedForOtherBuyer: "This item is currently reserved for another buyer. You can still browse the listing, but you cannot start a new purchase request until it is released.",
        completedReviewInfo: "This listing has already been completed. Reviews unlock only for the buyer and seller involved in the finished exchange.",
        reserveForBuyer: "Reserve for this buyer",
        releaseReservation: "Release reservation",
        markPaid: "Mark paid",
        markReadyForPickup: "Mark ready for pickup",
        markShipped: "Mark shipped",
        markDelivered: "Confirm delivered",
        completeOrder: "Complete order",
        markSold: "Mark sold",
        cancelExchange: "Cancel exchange",
        cancelRequest: "Cancel request",
        startPurchase: "Buy now / request reservation",
        startingPurchase: "Starting...",
        stripeRedirecting: "Opening Stripe...",
        continueToStripe: "Continue to Stripe",
        retryPayment: "Retry payment",
        paymentPendingBuyer:
          "Your order is ready, but payment is still pending. Complete Stripe Checkout to secure it.",
        paymentCancelledBuyer:
          "Stripe Checkout was cancelled before payment finished. Retry when you are ready.",
        paymentPaidBuyer:
          "Payment confirmed. The seller can now move this order forward.",
        paymentPendingSeller:
          "The buyer has not completed Stripe payment yet. Wait for payment before preparing pickup or shipping.",
        openListing: "Open listing",
        confirmCancel: "Cancel this exchange and reopen the listing if needed?",
        confirmBuyerCancel: "Cancel your purchase request for this listing?",
        completedReviewCta: "Leave your review in Purchases",
        noOnlinePayment: "Online payment is not collected yet in this MVP."
      },
      quickActions: { available: "Is this available?", reserve: "Can you reserve it?", campusMeet: "Can we meet on campus?", negotiable: "Is the price negotiable?" },
      inbox: {
        recentTitle: "Recent messages",
        openAll: "Open messages",
        emptyTitle: "No conversations yet",
        emptyDescription: "When you message a seller from a listing, the thread will appear here with the listing context attached.",
        loadErrorTitle: "Unable to load messages"
      }
    },
    myListings: {
      eyebrow: "My listings",
      title: "Manage availability, urgency, and sell-through.",
      description: "Listing lifecycle controls support available, reserved, sold, archived, relist, urgent, and promotion-ready states.",
      editListing: "Edit listing",
      statusTitle: "Listing status",
      statusDescription: "Active and archived states are managed here. Reservation and sold status now come from buyer-linked exchange flows.",
      openExchangeChat: "Open exchange chat",
      buyerLabel: "Buyer",
      analyticsTitle: "Listing performance",
      views: "Views",
      saves: "Saves",
      messagesReceived: "Messages",
      offersReceived: "Offers",
      fulfillmentSummary: "Fulfillment",
      pickupLabel: "Pickup",
      shippingLabel: "Shipping",
      statusOptions: { active: "Active", archived: "Archive" }
    },
    myPurchases: {
      eyebrow: "Purchases & exchanges",
      title: "Meetup-first transaction tracking for student resale.",
      description: "The MVP keeps handoff in person, but transaction data, review gating, and seller history now persist in Supabase.",
      sellerLabel: "Seller",
      buyerLabel: "Buyer",
      recordedValue: "Recorded value",
      fulfillmentMethod: "Fulfillment",
      meetupSpot: "Meetup spot",
      meetupWindow: "Meetup window",
      orderBreakdown: "Order breakdown",
      shippingAmount: "Shipping",
      platformFee: "Platform fee",
      totalAmount: "Total",
      reservedAt: "Reserved at",
      paidAt: "Paid at",
      readyAt: "Ready for pickup at",
      shippedAt: "Shipped at",
      deliveredAt: "Delivered at",
      completedAt: "Completed at",
      openConversation: "Open conversation",
      alreadyReviewed: "You already reviewed this exchange.",
      reviewsUnlock: "Reviews unlock once the exchange is marked completed.",
      emptyTitle: "No exchanges yet",
      emptyDescription: "Once you start conversations and complete handoffs, they will appear here with review status."
    },
    reviews: {
      eyebrow: "Reviews",
      title: "Ratings only appear after completed exchanges.",
      description: "The review system is designed to reward reliability and discourage premature feedback before a handoff actually happens.",
      leaveReview: "Leave review",
      submitting: "Submitting...",
      ratingLabel: "Rating",
      textLabel: "Review",
      textOptionalHint: "Optional",
      placeholder: "Describe the handoff, communication, and whether the item matched the listing.",
      submitted: "Review submitted.",
      noReviewsTitle: "No reviews yet",
      noReviewsDescription: "Reviews will appear here after completed exchanges.",
      yourReview: "Your review",
      receivedReview: "Received review",
      createdOn: "Created on"
    },
    profile: {
      activeListings: "Active listings",
      reserved: "Reserved",
      soldItems: "Sold items",
      responseRate: "Response rate",
      activeInventoryEyebrow: "Active inventory",
      activeInventoryTitle: "Listings currently live on CampusSwap.",
      activeInventoryDescription: "These are the items a buyer can still act on right now.",
      reservedEyebrow: "Reserved",
      reservedTitle: "Items currently on hold.",
      reservedDescription: "Reserved listings stay visible so buyers can understand what is already in progress.",
      soldEyebrow: "Sold items",
      soldTitle: "Recent completed exchanges.",
      soldDescription: "Sold listings make seller history more credible and help buyers understand what this profile successfully moves.",
      archivedEyebrow: "Archived",
      archivedTitle: "Older inventory no longer in circulation.",
      archivedDescription: "Archived listings are kept separate so the active profile stays clean.",
      reviewsEyebrow: "Reviews",
      reviewsTitle: "Trust signals from completed exchanges.",
      reviewsDescription: "Ratings are only collected after a transaction is completed.",
      editProfile: "Edit profile",
      verificationDescriptions: {
        verified: "Student verification is visible across listings and messages.",
        pending: "This account is active while student verification is still pending.",
        unverified: "This account can use CampusSwap normally, but student verification has not been added yet."
      },
      emptyStates: {
        activeTitle: "No active listings right now",
        activeDescription: "When this seller publishes new items, they will appear here.",
        reservedTitle: "No reserved listings",
        reservedDescription: "Nothing is currently marked as reserved for this seller.",
        soldTitle: "No sold items yet",
        soldDescription: "Completed exchanges will appear here once this seller marks listings as sold.",
        reviewsTitle: "No reviews yet",
        reviewsDescription: "Reviews will appear here after completed exchanges."
      }
    },
    listing: {
      seller: "Seller",
      safeMeetup: "Safe meetup guidance",
      ownListing: "This is your listing. Purchase and reservation state now stay linked to real exchange records instead of manual status toggles.",
      pickupArea: "Pickup area",
      fulfillmentTitle: "Fulfillment",
      pickupAvailable: "Pickup available",
      shippingAvailable: "Shipping available",
      shippingCost: "Shipping cost",
      responseRate: "Response rate",
      reservedForOther: "This item is currently reserved for another buyer. You can still follow the listing, but a new purchase request cannot start until the seller releases the reservation.",
      hiddenOwn: "This listing is hidden from public browse pages. You can relist it from My listings or keep it removed while preserving past chat and review history.",
      editListing: "Edit listing",
      featured: "Featured",
      outlet: "Outlet",
      urgent: "Urgent",
      reportReason: "Report listing",
      meetupTips: [
        "Prefer daylight and campus-adjacent pickup spots.",
        "Keep listing-linked chat active until the meetup is confirmed.",
        "Only mark the exchange complete after the handoff is done."
      ]
    },
    settings: {
      eyebrow: "Settings",
      title: "Control notifications, visibility, and account support paths.",
      description: "Settings includes the product hooks needed for GDPR requests, account deletion, and verification-aware feature gating.",
      notificationsTitle: "Notifications",
      notificationsDescription: "Choose which updates should reach you first so CampusSwap stays helpful without becoming noisy.",
      notificationsSaved: "Notification preferences saved.",
      savePreferences: "Save notification preferences",
      savingPreferences: "Saving preferences...",
      accountTitle: "Account",
      noPreferences: "No notification preferences selected yet.",
      requestDataExport: "Request data export",
      requestAccountDeletion: "Request account deletion",
      reviewVerification: "Review verification status and student-trust settings",
      notificationDescriptions: {
        messages: "Instant updates when buyers or sellers reply in listing-linked chat.",
        listingUpdates: "Status changes for your listings, reservations, and moderation review.",
        savedSearches: "Alerts when new inventory matches what you have been watching.",
        featuredDigest: "A digest of promoted and fast-moving listings across Maastricht.",
        promotions: "Payment, approval, and expiry updates for featured listing requests."
      }
    },
    notifications: {
      eyebrow: "Notifications",
      title: "Messages, promotions, and trust updates in one place.",
      description: "Notification preferences set the foundation for future saved-search alerts, featured digests, and referral-ready growth loops.",
      recentTitle: "Recent notifications",
      openAll: "Open notifications",
      openContext: "Open context",
      markRead: "Mark as read",
      markAllRead: "Mark all as read",
      unreadLabel: "Unread",
      readLabel: "Read",
      typeLabels: {
        message: "Message",
        promotion: "Promotion",
        review: "Review",
        listing: "Listing",
        safety: "Safety",
        system: "System"
      },
      emptyTitle: "No notifications yet",
      emptyDescription: "Messages, promotion updates, and trust notifications will appear here as you use CampusSwap."
    },
    listingForm: {
      eyebrow: "Sell",
      createTitle: "List quickly, promote when needed, and keep the pickup story clear.",
      createDescription: "The seller flow is optimized for fast move-out windows with support for negotiable pricing, urgency, outlet, and future promotion checkout.",
      editTitle: "Update your listing without losing chat or exchange context.",
      editDescription: "Edit the core listing details buyers rely on, then save changes back into the live marketplace.",
      requirementsBody: "Required fields: title, description, category, condition, price, image gallery, and pickup area.",
      optionalControlsBody: "Optional controls: negotiable, outlet, urgent, and future bumping or promotion purchases.",
      moderationBody: "Suspicious phrases automatically route listings into moderation review.",
      verificationOptionalTitle: "Student verification is optional.",
      verificationOptionalBody: "You can publish listings now. Because your account is not student-verified yet, new listings may go through a quick trust review before they appear publicly.",
      titlePlaceholder: "Title",
      descriptionPlaceholder: "Describe condition, pickup timing, and what is included",
      pricePlaceholder: "Price",
      pickupAreaPlaceholder: "Pickup area",
      fulfillmentTitle: "Fulfillment options",
      pickupAvailable: "Local pickup available",
      shippingAvailable: "Shipping available",
      shippingCostPlaceholder: "Shipping cost",
      fulfillmentHelp:
        "Choose at least one fulfillment option. Buyers can choose between pickup and shipping when both are available.",
      currentPhotos: "Current photos",
      addMorePhotos: "Add more photos",
      listingPhotos: "Listing photos",
      replaceGallery: "Replace current gallery with these uploads",
      negotiable: "Negotiable",
      outlet: "Outlet",
      urgent: "Urgent",
      publishListing: "Publish listing",
      saveChanges: "Save changes",
      featuredRequestLabel: "Highlight this listing for EUR 2",
      featuredRequestHelp: "We will record a promotion request now. If payment is not completed yet, the request stays pending and the listing is not marked featured automatically.",
      featuredPendingNote: "Payment is still pending. This listing will stay non-featured until checkout is completed.",
      featuredActiveNote: "This listing is already featured in discovery surfaces.",
      featuredCancelledNote: "The previous payment attempt did not complete. You can start checkout again whenever you are ready.",
      featuredCheckoutButton: "Pay EUR 2 and feature this listing",
      featuredPaymentUnavailable: "Stripe payment is not configured yet. The request stays pending until checkout is available.",
      featuredProcessingBanner: "Stripe is confirming your payment. The listing will turn featured as soon as the webhook marks it paid.",
      featuredPaidBanner: "Payment received. This listing is now active in featured discovery surfaces.",
      featuredCancelledBanner: "Payment was cancelled. The listing stayed non-featured and the request is saved as not completed.",
      featuredCheckoutError: "We could not start Stripe Checkout for this listing right now. Please try again."
    },
    appHome: {
      welcomeBack: "Welcome back",
      feedDescription: "Your feed prioritizes bikes, furniture, kitchen equipment, and fast pickup listings based on your profile, saved items, and recent searches.",
      sellUpload: "Sell / upload product",
      searchAllListings: "Search all listings",
      sellerMomentumEyebrow: "Seller momentum",
      sellerMomentumTitle: "Need to sell before moving out?",
      sellerMomentumDescription: "Launch your listing, mark it urgent, and promote it if timing is tight.",
      featuredEyebrow: "Featured right now",
      featuredTitle: "High-intent inventory across the city.",
      featuredDescription: "A mix of boosted, fast-moving, and student-relevant listings from across Maastricht.",
      homeFeedEyebrow: "Home feed",
      homeFeedTitle: "What is moving now.",
      homeFeedDescription: "Fresh listings, practical essentials, and value-oriented items that tend to convert quickly."
    },
    marketing: {
      home: {
        heroBadge: "Student-first in Maastricht",
        heroTitle: "Buy and sell student essentials in Maastricht without the chaos.",
        heroBody: "CampusSwap gives incoming students a faster setup path, outgoing students a faster sell-through path, and everyone a more trustworthy marketplace than scattered WhatsApp and Facebook threads.",
        browseItems: "Browse items",
        sellUpload: "Sell / upload product",
        valueCards: [
          { eyebrow: "Student-first trust", title: "Verification available" },
          { eyebrow: "Safer exchanges", title: "Moderated marketplace" },
          { eyebrow: "Affordable and green", title: "Outlet included" }
        ],
        whyEyebrow: "Why CampusSwap",
        whyTitle: "Built around the exact student moment broad marketplaces miss.",
        whyDescription: "Move-in and move-out periods in Maastricht are time-sensitive. CampusSwap keeps the inventory local, the categories organized, and the trust signals visible so students can act quickly.",
        audiences: [
          { title: "Incoming students", body: "Find bikes, desks, bedding, and kitchen basics before classes start." },
          { title: "Outgoing students", body: "Sell quickly before lease end with urgency and featured tools." },
          { title: "Budget-focused buyers", body: "Use Outlet to find honest discounts on heavily used but useful items." },
          { title: "Community-minded users", body: "Trade within a student network rather than a city-wide free-for-all." }
        ],
        howEyebrow: "How it works",
        howTitle: "Fast enough for moving week. Calm enough to trust.",
        howDescription: "Create an account, browse by what you need, and handle in-person pickup with visible verification status and safe meetup guidance.",
        steps: [
          { title: "Join", body: "Create an account with any valid email, then add student verification when you want a stronger trust badge." },
          { title: "Discover", body: "Browse featured drops, category pages, outlet deals, and a For You feed shaped by real interactions." },
          { title: "Reuse", body: "Reserve, meet, and review after completion so more useful items stay in circulation." }
        ],
        categoriesEyebrow: "Categories",
        categoriesTitle: "Furniture, bikes, textbooks, electronics, and the everyday essentials in between.",
        categoriesDescription: "The category model is tuned for student life in Maastricht, not generic second-hand browsing.",
        featuredEyebrow: "Featured preview",
        featuredTitle: "Promoted listings and strong inventory, without losing trust.",
        featuredDescription: "Featured listings stay clearly labeled, and sellers can boost visibility without making the feed feel deceptive.",
        trustEyebrow: "Trust and safety",
        trustTitle: "Visible trust markers beat vague promises.",
        trustDescription: "Verification, moderation, seller ratings, and safe meetup prompts are woven directly into browsing and messaging.",
        outletEyebrow: "Affordable and green",
        outletTitle: "Outlet gives lower-cost items a smarter second life.",
        outletDescription: "Damaged-but-usable and urgent sell-off items deserve a dedicated experience, not a buried filter.",
        outletBody: "CampusSwap treats Outlet as a strategic differentiator for lower budgets, urgent move-outs, and practical reuse. That makes the marketplace more useful and more honest.",
        outletCta: "Explore Outlet",
        testimonialsEyebrow: "Demo testimonials",
        testimonialsTitle: "Seeded proof points for launch storytelling.",
        testimonialsDescription: "These are demo testimonials included to help shape launch-ready content and layout. Replace them with real student feedback after launch.",
        testimonials: [
          "Demo testimonial: I arrived in Maastricht on a Thursday and had a desk, lamp, and bike by Sunday.",
          "Demo testimonial: Selling my studio essentials in one place was much calmer than juggling group chats.",
          "Demo testimonial: The outlet section helped me furnish a room without blowing my first-month budget."
        ],
        faqEyebrow: "FAQ",
        faqTitle: "Questions students usually ask before they trust a new marketplace.",
        faqDescription: "The marketing site keeps the core trust and onboarding questions clear, especially for incoming international students.",
        trustSignals: [
          "Visible verification status on profiles, listings, and messages",
          "Moderation queue for suspicious listings and reports",
          "Safe meetup prompts near every conversation and exchange",
          "Ratings only unlock after a completed transaction"
        ],
        waitlist: {
          emailPlaceholder: "student@maastrichtuniversity.nl",
          both: "Buying and selling",
          buyer: "Mostly buying",
          seller: "Mostly selling",
          submit: "Join waitlist"
        }
      },
      featured: {
        eyebrow: "Featured",
        title: "Boosted inventory stays clearly marked and student-relevant.",
        description: "Promoted listings appear across home, category, and search surfaces with transparent labeling and no fake scarcity."
      },
      outlet: {
        eyebrow: "Outlet",
        title: "The lower-price, urgent, and imperfect items that still solve real student problems.",
        description: "Outlet is not hidden. It is a core experience for affordability, fast clear-outs, and sustainability-minded reuse."
      },
      categories: {
        eyebrow: "Browse by category",
        title: "Organized around how students actually shop in Maastricht.",
        description: "From first-week essentials to fast move-out clearances, category entry points now route directly into the correct browse experience."
      },
      faq: {
        eyebrow: "FAQ",
        title: "Answers that remove hesitation before signup.",
        description: "The public site keeps the operational details concise so students can quickly understand what CampusSwap is, how trust works, and what is gated by verification.",
        items: [
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
        ]
      }
    },
    map: {
      eyebrow: "Approximate meetup area",
      title: "Privacy-safe pickup area",
      description: "CampusSwap shows an approximate neighbourhood-level meetup zone instead of a private address.",
      approximateZone: "Approximate zone only",
      cityLabel: "Maastricht",
      meetupArea: "Meetup area",
      publicPointTitle: "Suggested public meetup point",
      listingContext: "Listing context",
      guidanceTitle: "Suggested meetup guidance",
      privacyTitle: "Privacy protected",
      privacyBody: "Exact addresses should only be shared privately in chat once both sides agree on timing and the public handoff point."
    }
  },
  es: {} as never,
  nl: {} as never
} as const;

type WidenPrimitive<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T;

type DeepWiden<T> = T extends readonly (infer U)[]
  ? readonly DeepWiden<U>[]
  : T extends object
    ? { [K in keyof T]: DeepWiden<T[K]> }
    : WidenPrimitive<T>;

type DictionaryExtensions = {
  appHome: DeepWiden<typeof dictionaries.en.appHome> & {
    forYouEyebrow: string;
    forYouTitle: string;
    forYouDescription: string;
    becauseViewedEyebrow: string;
    becauseViewedTitle: string;
    becauseViewedDescription: string;
    popularAreaEyebrow: string;
    popularAreaTitle: string;
    popularAreaDescription: string;
    newTodayEyebrow: string;
    newTodayTitle: string;
    newTodayDescription: string;
    outletEyebrow: string;
    outletTitle: string;
    outletDescription: string;
    lastChanceEyebrow: string;
    lastChanceTitle: string;
    lastChanceDescription: string;
  };
  messages: DeepWiden<typeof dictionaries.en.messages> & {
    offers: {
      title: string;
      description: string;
      noOfferYet: string;
      latestOffer: string;
      sentByBuyer: string;
      sentBySeller: string;
      sentAt: string;
      respondedAt: string;
      expiresAt: string;
      offerAmount: string;
      counterAmount: string;
      makeOffer: string;
      sendingOffer: string;
      counterOffer: string;
      acceptOffer: string;
      rejectOffer: string;
      acceptCounter: string;
      rejectCounter: string;
      withdrawOffer: string;
      acceptedHint: string;
      genericError: string;
      states: Record<OfferStatus, string>;
    };
  };
  search: {
    pickupArea: string;
    anyArea: string;
    distance: string;
    distanceOptions: {
      sameArea: string;
      nearby: string;
      citywide: string;
    };
    saveCurrentSearch: string;
    savingSearch: string;
    savedSearchesTitle: string;
    savedSearchesDescription: string;
    savedSearchRun: string;
    savedSearchDelete: string;
    filterLabels: DeepWiden<typeof dictionaries.en.search.filterLabels> & {
      area: string;
      distance: string;
    };
  };
  saved: {
    eyebrow: string;
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    compareLabel: string;
    compareLimit: string;
    addToCompare: string;
    removeFromCompare: string;
    compareTitle: string;
    compareDescription: string;
    compareFields: {
      price: string;
      condition: string;
      pickupArea: string;
      sellerRating: string;
      salesCount: string;
      featured: string;
      negotiable: string;
      status: string;
    };
    compareValues: {
      yes: string;
      no: string;
    };
  };
  profile: DeepWiden<typeof dictionaries.en.profile> & {
    memberSince: string;
    salesCount: string;
    averageRating: string;
  };
  listing: DeepWiden<typeof dictionaries.en.listing> & {
    campusSwapSeller: string;
    memberSince: string;
    salesCount: string;
    averageRating: string;
  };
  support: DeepWiden<typeof dictionaries.en.support>;
};

export type Dictionary = DeepWiden<typeof dictionaries.en> & DictionaryExtensions;

const mutableDictionaries = dictionaries as unknown as Record<AppLocale, Dictionary>;

mutableDictionaries.es = {
  ...mutableDictionaries.en,
  localeLabel: "Espanol",
  languageSwitcher: { label: "Idioma" },
  nav: {
    ...mutableDictionaries.en.nav,
    public: { ...mutableDictionaries.en.nav.public, categories: "Categorias", featured: "Destacados", trustSafety: "Confianza y seguridad", join: "Unirse" },
    app: { ...mutableDictionaries.en.nav.app, home: "Inicio", forYou: "Para ti", search: "Buscar", saved: "Guardados", messages: "Mensajes", settings: "Ajustes" },
    admin: { ...mutableDictionaries.en.nav.admin, dashboard: "Panel", users: "Usuarios", listings: "Anuncios", reports: "Reportes", analytics: "Analitica", settings: "Ajustes" }
  },
  site: { ...mutableDictionaries.en.site, publicTagline: "Marketplace estudiantil para Maastricht", adminTagline: "Centro de control de moderacion, crecimiento y monetizacion", logIn: "Entrar", sellItem: "Vender un articulo" },
  common: {
    ...mutableDictionaries.en.common,
    actions: { ...mutableDictionaries.en.common.actions, editListing: "Editar anuncio", viewListing: "Ver anuncio", openListing: "Abrir anuncio", openConversation: "Abrir conversacion", openPurchaseChat: "Abrir chat de compra", openBuyerChat: "Abrir chat con comprador", browseEveryCategory: "Explorar todas las categorias", browseCategory: "Explorar categoria", exploreOutlet: "Explorar Outlet", searchAllListings: "Buscar todos los anuncios", startSelling: "Empezar a vender", publishListing: "Publicar anuncio", saveChanges: "Guardar cambios", cancel: "Cancelar", updating: "Actualizando...", opening: "Abriendo...", removing: "Eliminando...", removeListing: "Eliminar anuncio", clearAll: "Limpiar filtros" },
    typicalRange: "Rango habitual",
    conditionLabels: { new: "Nuevo", "like-new": "Como nuevo", good: "Bueno", fair: "Aceptable", "needs-love": "Necesita arreglo" },
    listingStatusLabels: { active: "Activo", reserved: "Reservado", sold: "Vendido", archived: "Archivado", "pending-review": "Pendiente de revision", hidden: "Retirado" },
    exchangeStatusLabels: {
      inquiry: "Conversacion iniciada",
      negotiating: "Compra solicitada",
      pending: "Pendiente",
      reserved: "Reservado",
      paid: "Pagado",
      "ready-for-pickup": "Listo para recoger",
      shipped: "Enviado",
      delivered: "Entregado",
      completed: "Completado",
      cancelled: "Cancelado",
      reported: "Reportado"
    },
    notificationPreferenceLabels: { messages: "Mensajes", listingUpdates: "Actualizaciones de anuncios", savedSearches: "Alertas de busquedas guardadas", featuredDigest: "Resumen de destacados", promotions: "Actualizaciones de promocion" }
  },
  auth: {
    ...mutableDictionaries.en.auth,
    signup: { ...mutableDictionaries.en.auth.signup, eyebrow: "Crear cuenta", title: "Crea tu cuenta de CampusSwap y entra al marketplace al instante.", description: "Cualquier email valido puede crear una cuenta. La verificacion estudiantil sigue disponible como una capa de confianza opcional.", namePlaceholder: "Nombre completo", emailPlaceholder: "tu@email.com", passwordPlaceholder: "Elige una contrasena", submit: "Crear cuenta", submitting: "Creando cuenta...", domainHint: "Cualquier email valido puede registrarse. Dominios estudiantiles compatibles:" },
    login: { ...mutableDictionaries.en.auth.login, eyebrow: "Acceso", title: "Bienvenido de nuevo a CampusSwap.", description: "Inicia sesion con tu email y contrasena para continuar con tus guardados, mensajes y planes de recogida.", emailPlaceholder: "tu@email.com", passwordPlaceholder: "Contrasena", submit: "Entrar", submitting: "Entrando...", noAccount: "Aun no tienes cuenta?", createOne: "Crea una", forgotPassword: "Olvidaste tu contrasena?" },
    verifyEmail: { ...mutableDictionaries.en.auth.verifyEmail, eyebrow: "Verificar email", title: "La verificacion estudiantil es opcional, pero aporta mas confianza.", description: "Ya puedes entrar en CampusSwap. Los dominios universitarios compatibles pueden activar o dejar pendiente la confianza estudiantil sin bloquear el resto de la app.", supportedDomains: "Dominios estudiantiles compatibles", accountEmail: "Email de la cuenta", openApp: "Abrir la app", continueIntoApp: "Continuar a CampusSwap", rules: ["Cualquier email valido puede crear y usar una cuenta de CampusSwap.", "Los dominios estudiantiles compatibles pueden desbloquear una insignia verificada o un estado pendiente.", "La verificacion sigue visible en tu perfil, anuncios y conversaciones, pero no bloquea el acceso basico."] },
    forgotPassword: { ...mutableDictionaries.en.auth.forgotPassword, eyebrow: "Restablecer contrasena", title: "Enviate un enlace de restablecimiento.", description: "Introduce el email que usas en CampusSwap y te enviaremos un enlace seguro para cambiar tu contrasena.", emailPlaceholder: "tu@email.com", submit: "Enviar email de restablecimiento", submitting: "Enviando...", success: "Email enviado. Revisa tu bandeja de entrada y spam.", backToLogin: "Volver al acceso" },
    resetPassword: { ...mutableDictionaries.en.auth.resetPassword, eyebrow: "Nueva contrasena", title: "Elige una nueva contrasena para tu cuenta de CampusSwap.", description: "Cuando el enlace de recuperacion sea valido, podras guardar una nueva contrasena y seguir a la app.", passwordPlaceholder: "Nueva contrasena", confirmPasswordPlaceholder: "Confirma la nueva contrasena", submit: "Actualizar contrasena", submitting: "Actualizando contrasena...", invalidLink: "Este enlace es invalido o ha caducado. Solicita uno nuevo desde acceso.", success: "Contrasena actualizada. Ya puedes iniciar sesion con la nueva.", backToLogin: "Volver al acceso", mismatch: "Las contrasenas no coinciden." }
  },
  search: { ...mutableDictionaries.en.search, eyebrow: "Busqueda y descubrimiento", title: "Explora rapido cuando necesitas decidir enseguida.", description: "La busqueda, los filtros, las subcategorias y el orden actualizan los resultados en tiempo real.", controls: "Controles de descubrimiento", query: "Buscar", queryPlaceholder: "Busca bicis, escritorios, ropa de cama o monitores", categories: "Categorias", subcategories: "Subcategorias", minPrice: "Precio minimo", maxPrice: "Precio maximo", condition: "Estado", outletOnly: "Solo outlet", featuredOnly: "Solo destacados", minimumSellerRating: "Valoracion minima del vendedor", sort: "Ordenar", sortOptions: { recommended: "Recomendado", relevance: "Relevancia", newest: "Mas reciente", priceLowHigh: "Precio ascendente", priceHighLow: "Precio descendente" }, trending: "Tendencias", recent: "Recientes", results: "resultados", resultsDescription: "El descubrimiento se actualiza al instante cuando cambian los filtros.", recommendationPrefix: "Por que ves esto", clearAll: "Limpiar filtros", emptyTitle: "Ningun anuncio coincide con estos filtros", emptyDescription: "Prueba un rango de precio mas amplio o desactiva filtros para ver mas inventario.", filterLabels: { search: "Busqueda", category: "Categoria", subcategory: "Subcategoria", min: "Min EUR", max: "Max EUR", condition: "Estado", sellerRating: "Valoracion", sort: "Orden", area: "Zona", distance: "Distancia" } },
  settings: {
    ...mutableDictionaries.en.settings,
    eyebrow: "Ajustes",
    title: "Controla notificaciones, visibilidad y soporte de cuenta.",
    description: "Ajustes reúne los puntos del producto para solicitudes GDPR, eliminación de cuenta y confianza estudiantil.",
    notificationsTitle: "Notificaciones",
    notificationsDescription: "Elige qué avisos quieres priorizar para que CampusSwap te resulte útil sin volverse ruidoso.",
    notificationsSaved: "Preferencias de notificación guardadas.",
    savePreferences: "Guardar preferencias de notificación",
    savingPreferences: "Guardando preferencias...",
    accountTitle: "Cuenta",
    noPreferences: "Aún no has seleccionado preferencias de notificación.",
    requestDataExport: "Solicitar exportación de datos",
    requestAccountDeletion: "Solicitar eliminación de cuenta",
    reviewVerification: "Revisar verificación y opciones de confianza estudiantil",
    notificationDescriptions: {
      messages: "Actualizaciones inmediatas cuando compradores o vendedores responden en el chat del anuncio.",
      listingUpdates: "Cambios de estado en tus anuncios, reservas y revisiones de moderación.",
      savedSearches: "Avisos cuando aparece inventario nuevo que coincide con lo que sigues.",
      featuredDigest: "Un resumen de anuncios destacados y movimientos rápidos en Maastricht.",
      promotions: "Actualizaciones de pago, aprobación y vencimiento para solicitudes de promoción."
    }
  },
  reviews: { ...mutableDictionaries.en.reviews, eyebrow: "Resenas", title: "Las valoraciones solo aparecen tras intercambios completados.", description: "El sistema de resenas recompensa entregas fiables y solo se activa tras una transaccion real completada.", leaveReview: "Dejar resena", submitting: "Enviando...", ratingLabel: "Valoracion", textLabel: "Resena", textOptionalHint: "Opcional", placeholder: "Describe la entrega, la comunicacion y si el articulo coincidia con el anuncio.", submitted: "Resena enviada.", noReviewsTitle: "Aun no hay resenas", noReviewsDescription: "Las resenas apareceran aqui tras intercambios completados.", yourReview: "Tu resena", receivedReview: "Resena recibida", createdOn: "Creada el" },
  messages: {
    ...mutableDictionaries.en.messages,
    eyebrow: "Mensajes",
    title: "El chat ligado al anuncio mantiene el contexto de la recogida.",
    description: "Las acciones rapidas se envian al instante, los hilos se abren desde el anuncio y cada conversacion conserva el contexto del producto y del vendedor.",
    actions: {
      ...mutableDictionaries.en.messages.actions,
      yourListing: "Tu anuncio",
      itemSold: "Articulo vendido",
      listingUnavailable: "Anuncio no disponible",
      photoAttachment: "Foto adjunta",
      signUpToMessage: "Registrate para escribir",
      messageSeller: "Escribir al vendedor",
      verificationNoticePrefix: "Estas escribiendo como",
      verificationNoticeSuffix: "La verificacion es opcional, pero mejora la confianza.",
      openConversation: "Abrir conversacion",
      noMessagesYet: "Aun no hay mensajes",
      unread: "sin leer"
    },
    thread: {
      ...mutableDictionaries.en.messages.thread,
      liveThread: "Chat en directo",
      autoUpdate: "Los mensajes nuevos aparecen aqui automaticamente.",
      quickReplies: "Respuestas rapidas",
      attachmentReady: "Adjunto listo",
      messagePlaceholder: "Escribe sobre horario, precio o recogida",
      attach: "Adjuntar",
      attachSoon: "Adjuntos pronto",
      send: "Enviar",
      sending: "Enviando...",
      listingContext: "Contexto del anuncio",
      pickupArea: "Zona de recogida",
      meetupSafely: "Queda con seguridad",
      meetupSafelyBody: "Prioriza puntos cercanos al campus o zonas transitadas y mantén el chat del anuncio activo hasta terminar la entrega.",
      conversationUnavailableTitle: "Conversacion no disponible",
      conversationUnavailableDescription: "No se pudo cargar el contexto del chat. Vuelve al anuncio e intentalo de nuevo.",
      demoExchangeTitle: "Estado demo del intercambio",
      demoExchangeDescription: "Activa el modo live para guardar reservas, ventas y elegibilidad de resenas dentro de esta conversacion."
    },
    exchange: {
      ...mutableDictionaries.en.messages.exchange,
      title: "Estado del intercambio",
      sellerBody: "Usa este chat para coordinar la entrega. Solo avances el pedido cuando CampusSwap registre el pago.",
      buyerBody: "Usa este chat para confirmar los detalles. El pedido solo cuenta como pagado cuando Stripe Checkout se completa.",
      buyerLabel: "Comprador",
      sellerLabel: "Vendedor",
      listingStatus: "Estado del anuncio",
      price: "Precio",
      meetupArea: "Zona de encuentro",
      meetupWindow: "Franja de encuentro",
      reservedAt: "Reservado el",
      completedAt: "Completado el",
      cancelledAt: "Cancelado el",
      pricePending: "Pendiente de confirmar",
      meetupTbd: "Se acordara en el chat",
      windowTbd: "Por concretar",
      chatOnly: "Solo chat",
      noBuyerLinked: "Todavia no hay un comprador vinculado. Cuando alguien inicie una solicitud de compra, aparecera aqui.",
      reservedForOtherBuyer: "Este articulo esta reservado para otro comprador. Puedes seguir viendo el anuncio, pero no iniciar una nueva solicitud hasta que se libere.",
      completedReviewInfo: "Este anuncio ya se completo. Las resenas solo se desbloquean para el comprador y el vendedor de esa operacion.",
      reserveForBuyer: "Reservar para este comprador",
      releaseReservation: "Liberar reserva",
      markSold: "Marcar como vendido",
      cancelExchange: "Cancelar intercambio",
      cancelRequest: "Cancelar solicitud",
      startPurchase: "Comprar ahora / pedir reserva",
      startingPurchase: "Iniciando...",
      stripeRedirecting: "Abriendo Stripe...",
      continueToStripe: "Continuar en Stripe",
      retryPayment: "Reintentar pago",
      paymentPendingBuyer:
        "Tu pedido esta listo, pero el pago sigue pendiente. Completa Stripe Checkout para asegurarlo.",
      paymentCancelledBuyer:
        "Stripe Checkout se cancelo antes de terminar el pago. Reintentalo cuando quieras.",
      paymentPaidBuyer:
        "Pago confirmado. Ahora el vendedor puede avanzar con el pedido.",
      paymentPendingSeller:
        "El comprador todavia no ha completado el pago en Stripe. Espera al pago antes de preparar la recogida o el envio.",
      openListing: "Abrir anuncio",
      confirmCancel: "Cancelar este intercambio y reabrir el anuncio si hace falta?",
      confirmBuyerCancel: "Cancelar tu solicitud de compra de este anuncio?",
      completedReviewCta: "Deja tu resena en Compras",
      noOnlinePayment: "Todavia no se cobra pago online en este MVP."
    },
    inbox: {
      ...mutableDictionaries.en.messages.inbox,
      recentTitle: "Mensajes recientes",
      openAll: "Abrir mensajes",
      emptyTitle: "Aun no hay conversaciones",
      emptyDescription: "Cuando escribas a un vendedor desde un anuncio, el hilo aparecera aqui con todo el contexto.",
      loadErrorTitle: "No se pudieron cargar los mensajes"
    }
  },
  myListings: {
    ...mutableDictionaries.en.myListings,
    eyebrow: "Mis anuncios",
    title: "Gestiona disponibilidad, urgencia y ritmo de venta.",
    description: "Los controles del ciclo del anuncio cubren disponible, reservado, vendido, archivado y promocion listo.",
    editListing: "Editar anuncio",
    statusTitle: "Estado del anuncio",
    statusDescription: "Los estados activo y archivado se gestionan aqui. Reserva y vendido ahora dependen del flujo real de intercambio.",
    openExchangeChat: "Abrir chat del intercambio",
    buyerLabel: "Comprador",
    statusOptions: { active: "Activo", archived: "Archivar" }
  },
  myPurchases: {
    ...mutableDictionaries.en.myPurchases,
    eyebrow: "Compras e intercambios",
    title: "Seguimiento de operaciones centrado en la entrega en persona.",
    description: "El MVP mantiene la entrega en persona, pero ya guarda transacciones, elegibilidad de resenas e historial del vendedor en Supabase.",
    sellerLabel: "Vendedor",
    buyerLabel: "Comprador",
    recordedValue: "Importe registrado",
    meetupSpot: "Punto de encuentro",
    meetupWindow: "Franja de encuentro",
    reservedAt: "Reservado el",
    completedAt: "Completado el",
    openConversation: "Abrir conversacion",
    alreadyReviewed: "Ya has dejado una resena para este intercambio.",
    reviewsUnlock: "Las resenas se activan cuando el intercambio se marca como completado.",
    emptyTitle: "Todavia no hay intercambios",
    emptyDescription: "Cuando empieces conversaciones y cierres entregas, apareceran aqui con su estado de resena."
  },
  profile: {
    ...mutableDictionaries.en.profile,
    activeListings: "Anuncios activos",
    reserved: "Reservados",
    soldItems: "Articulos vendidos",
    responseRate: "Tasa de respuesta",
    activeInventoryEyebrow: "Inventario activo",
    activeInventoryTitle: "Anuncios actualmente visibles en CampusSwap.",
    activeInventoryDescription: "Estos son los articulos sobre los que un comprador todavia puede actuar.",
    reservedEyebrow: "Reservados",
    reservedTitle: "Articulos actualmente apartados.",
    reservedDescription: "Los anuncios reservados siguen visibles para que se entienda que ya hay una operacion en curso.",
    soldEyebrow: "Vendidos",
    soldTitle: "Intercambios completados recientes.",
    soldDescription: "Los articulos vendidos hacen que el historial del vendedor sea mas creible.",
    archivedEyebrow: "Archivados",
    archivedTitle: "Inventario antiguo que ya no circula.",
    archivedDescription: "Los anuncios archivados se separan para mantener limpio el perfil activo.",
    reviewsEyebrow: "Resenas",
    reviewsTitle: "Senales de confianza de intercambios completados.",
    reviewsDescription: "Las valoraciones solo se recogen despues de una transaccion completada.",
    editProfile: "Editar perfil",
    verificationDescriptions: {
      verified: "La verificacion estudiantil es visible en anuncios y mensajes.",
      pending: "Esta cuenta esta activa mientras la verificacion estudiantil sigue pendiente.",
      unverified: "Esta cuenta puede usar CampusSwap con normalidad, pero aun no ha anadido verificacion estudiantil."
    },
    emptyStates: {
      activeTitle: "Ahora mismo no hay anuncios activos",
      activeDescription: "Cuando este vendedor publique nuevos articulos, apareceran aqui.",
      reservedTitle: "No hay anuncios reservados",
      reservedDescription: "Nada esta reservado ahora mismo para este vendedor.",
      soldTitle: "Aun no hay articulos vendidos",
      soldDescription: "Los intercambios completados apareceran aqui cuando este vendedor marque un articulo como vendido.",
      reviewsTitle: "Aun no hay resenas",
      reviewsDescription: "Las resenas apareceran aqui tras intercambios completados."
    }
  },
  listing: {
    ...mutableDictionaries.en.listing,
    seller: "Vendedor",
    safeMeetup: "Consejos para una entrega segura",
    ownListing: "Este es tu anuncio. El estado de compra y reserva se vincula ahora a intercambios reales en vez de cambios manuales.",
    pickupArea: "Zona de recogida",
    responseRate: "Tasa de respuesta",
    reservedForOther: "Este articulo esta reservado para otro comprador. Puedes seguirlo, pero no iniciar una nueva compra hasta que se libere.",
    hiddenOwn: "Este anuncio esta oculto del browse publico. Puedes volver a publicarlo desde Mis anuncios o mantenerlo oculto sin perder chats ni resenas.",
    editListing: "Editar anuncio",
    featured: "Destacado",
    outlet: "Outlet",
    urgent: "Urgente",
    meetupTips: [
      "Prioriza puntos de encuentro con luz de dia y cerca del campus.",
      "Mantén el chat del anuncio activo hasta confirmar la entrega.",
      "Marca el intercambio como completado solo cuando la entrega haya terminado."
    ]
  },
  notifications: {
    ...mutableDictionaries.en.notifications,
    eyebrow: "Notificaciones",
    title: "Mensajes, promociones y confianza en un solo lugar.",
    description: "Tus preferencias de notificacion preparan la base para alertas guardadas, destacados y futuras palancas de crecimiento.",
    recentTitle: "Notificaciones recientes",
    openAll: "Abrir notificaciones",
    openContext: "Abrir contexto",
    markRead: "Marcar como leida",
    markAllRead: "Marcar todas como leidas",
    unreadLabel: "Sin leer",
    readLabel: "Leida",
    typeLabels: {
      message: "Mensaje",
      promotion: "Promocion",
      review: "Resena",
      listing: "Anuncio",
      safety: "Seguridad",
      system: "Sistema"
    },
    emptyTitle: "Todavia no hay notificaciones",
    emptyDescription: "Los mensajes, promociones y avisos de confianza apareceran aqui segun uses CampusSwap."
  },
  listingForm: {
    ...mutableDictionaries.en.listingForm,
    eyebrow: "Vender",
    createTitle: "Publica rapido, promociona si hace falta y deja clara la historia de recogida.",
    createDescription: "El flujo de vendedor esta optimizado para salidas rapidas con precio negociable, urgencia, outlet y futura promocion.",
    editTitle: "Actualiza tu anuncio sin perder el contexto del chat ni del intercambio.",
    editDescription: "Edita los datos clave del anuncio y guarda los cambios en el marketplace en vivo.",
    requirementsBody: "Campos obligatorios: titulo, descripcion, categoria, estado, precio, galeria de imagenes y zona de recogida.",
    optionalControlsBody: "Controles opcionales: negociable, outlet, urgente y futuras compras de promocion.",
    moderationBody: "Las frases sospechosas envian automaticamente el anuncio a moderacion.",
    verificationOptionalTitle: "La verificacion estudiantil es opcional.",
    verificationOptionalBody: "Puedes publicar anuncios ya. Como tu cuenta no esta verificada como estudiante, algunos anuncios pueden pasar por una revision rapida de confianza antes de hacerse publicos.",
    titlePlaceholder: "Titulo",
    descriptionPlaceholder: "Describe el estado, el horario de recogida y que incluye",
    pricePlaceholder: "Precio",
    pickupAreaPlaceholder: "Zona de recogida",
    currentPhotos: "Fotos actuales",
    addMorePhotos: "Anadir mas fotos",
    listingPhotos: "Fotos del anuncio",
    replaceGallery: "Sustituir la galeria actual por estas imagenes",
    negotiable: "Negociable",
    outlet: "Outlet",
    urgent: "Urgente",
    publishListing: "Publicar anuncio",
    saveChanges: "Guardar cambios",
    featuredRequestLabel: "Destacar este anuncio por EUR 2",
    featuredRequestHelp: "Registraremos ahora la solicitud de promocion. Si el pago no esta completado, seguira pendiente y el anuncio no se marcara como destacado automaticamente.",
    featuredPendingNote: "El pago sigue pendiente. Este anuncio no se destacara hasta que completes el checkout.",
    featuredActiveNote: "Este anuncio ya aparece como destacado.",
    featuredCancelledNote: "El intento de pago anterior no se completo. Puedes iniciar el checkout otra vez cuando quieras.",
    featuredCheckoutButton: "Pagar EUR 2 y destacar este anuncio",
    featuredPaymentUnavailable: "Stripe todavia no esta configurado. La solicitud seguira pendiente hasta que el pago este disponible.",
    featuredProcessingBanner: "Stripe esta confirmando tu pago. El anuncio se marcara como destacado en cuanto el webhook lo deje como pagado.",
    featuredPaidBanner: "Pago recibido. Este anuncio ya esta activo en las superficies destacadas.",
    featuredCancelledBanner: "El pago se cancelo. El anuncio sigue sin destacarse y la solicitud queda marcada como no completada.",
    featuredCheckoutError: "No hemos podido iniciar Stripe Checkout para este anuncio ahora mismo. Vuelve a intentarlo."
  },
  appHome: {
    ...mutableDictionaries.en.appHome,
    welcomeBack: "Bienvenido de nuevo",
    feedDescription: "Tu feed prioriza bicis, muebles, cocina y anuncios de recogida rapida segun tu perfil, guardados y busquedas recientes.",
    sellUpload: "Vender / subir producto",
    searchAllListings: "Buscar todos los anuncios",
    sellerMomentumEyebrow: "Impulso de vendedor",
    sellerMomentumTitle: "Necesitas vender antes de mudarte?",
    sellerMomentumDescription: "Publica tu anuncio, marcala como urgente y solicita promocion si vas justo de tiempo.",
    featuredEyebrow: "Destacado ahora",
    featuredTitle: "Inventario de alta intencion en toda la ciudad.",
    featuredDescription: "Una mezcla de anuncios impulsados, rapidos y relevantes para estudiantes.",
    homeFeedEyebrow: "Feed principal",
    homeFeedTitle: "Lo mas util para tu semana en Maastricht.",
    homeFeedDescription: "CampusSwap combina relevancia, frescura, precio y confianza para ordenar mejor el feed."
  },
  marketing: {
    ...mutableDictionaries.en.marketing,
    home: {
      ...mutableDictionaries.en.marketing.home,
      heroBadge: "Pensado para estudiantes en Maastricht",
      heroTitle: "Compra y vende esenciales de estudiante en Maastricht sin el caos.",
      heroBody: "CampusSwap da a los estudiantes que llegan una forma mas rapida de instalarse, a los que se van una forma mas rapida de vender, y a todos un marketplace mas fiable que los grupos dispersos.",
      browseItems: "Explorar articulos",
      sellUpload: "Vender / subir producto",
      valueCards: [
        { eyebrow: "Confianza pensada para estudiantes", title: "Verificacion disponible" },
        { eyebrow: "Intercambios mas seguros", title: "Marketplace moderado" },
        { eyebrow: "Asequible y sostenible", title: "Outlet incluido" }
      ],
      whyEyebrow: "Por que CampusSwap",
      whyTitle: "Construido alrededor del momento exacto que los marketplaces generales no entienden.",
      whyDescription: "Las semanas de llegada y salida en Maastricht son sensibles al tiempo. CampusSwap mantiene el inventario local, las categorias ordenadas y las senales de confianza visibles.",
      audiences: [
        { title: "Estudiantes que llegan", body: "Encuentra bicis, escritorios, ropa de cama y cocina antes de que empiecen las clases." },
        { title: "Estudiantes que se van", body: "Vende rapido antes de terminar el alquiler con urgencia y herramientas destacadas." },
        { title: "Compradores con presupuesto ajustado", body: "Usa Outlet para encontrar descuentos honestos en articulos muy usados pero utiles." },
        { title: "Usuarios con mentalidad de comunidad", body: "Intercambia dentro de una red estudiantil en lugar de un mercado caotico de toda la ciudad." }
      ],
      howEyebrow: "Como funciona",
      howTitle: "Lo bastante rapido para semana de mudanza. Lo bastante claro para confiar.",
      howDescription: "Crea una cuenta, explora lo que necesitas y coordina la recogida en persona con verificacion visible y consejos de seguridad.",
      steps: [
        { title: "Unete", body: "Crea una cuenta con cualquier email valido y anade la verificacion estudiantil cuando quieras una insignia de mayor confianza." },
        { title: "Descubre", body: "Explora destacados, categorias, ofertas de outlet y un feed Para ti basado en interacciones reales." },
        { title: "Reutiliza", body: "Reserva, queda y deja una resena despues para que mas articulos sigan en circulacion." }
      ],
      categoriesEyebrow: "Categorias",
      categoriesTitle: "Muebles, bicis, libros, electronica y los esenciales de cada dia.",
      categoriesDescription: "El modelo de categorias esta pensado para la vida estudiantil en Maastricht.",
      featuredEyebrow: "Vista previa destacada",
      featuredTitle: "Anuncios promocionados e inventario potente sin perder confianza.",
      featuredDescription: "Los anuncios destacados siguen claramente etiquetados y el feed no finge escasez.",
      trustEyebrow: "Confianza y seguridad",
      trustTitle: "Las senales visibles de confianza valen mas que promesas vagas.",
      trustDescription: "Verificacion, moderacion, valoraciones y consejos de encuentro seguro estan integrados en el browse y la mensajeria.",
      outletEyebrow: "Asequible y sostenible",
      outletTitle: "Outlet da una segunda vida mas inteligente a los articulos de menor precio.",
      outletDescription: "Los articulos urgentes o muy usados merecen una experiencia propia, no un filtro escondido.",
      outletBody: "CampusSwap trata Outlet como un diferenciador real para presupuestos bajos, mudanzas urgentes y reutilizacion practica.",
      outletCta: "Explorar Outlet",
      testimonialsEyebrow: "Testimonios demo",
      testimonialsTitle: "Pruebas sembradas para la narrativa de lanzamiento.",
      testimonialsDescription: "Estos testimonios son demo y ayudan a preparar contenido y estructura de lanzamiento. Sustituyelos por opiniones reales tras el lanzamiento.",
      testimonials: [
        "Testimonio demo: llegue a Maastricht un jueves y el domingo ya tenia escritorio, lampara y bici.",
        "Testimonio demo: vender lo de mi estudio en un solo sitio fue mucho mas tranquilo que saltar entre grupos.",
        "Testimonio demo: la seccion outlet me ayudo a amueblar una habitacion sin disparar el presupuesto del primer mes."
      ],
      faqEyebrow: "FAQ",
      faqTitle: "Preguntas que los estudiantes suelen hacer antes de confiar en un marketplace nuevo.",
      faqDescription: "La web publica deja claras las preguntas clave de confianza y onboarding para estudiantes locales e internacionales.",
      trustSignals: [
        "Estado de verificacion visible en perfiles, anuncios y mensajes",
        "Cola de moderacion para anuncios y reportes sospechosos",
        "Recordatorios de encuentro seguro junto a cada intercambio",
        "Las valoraciones solo se desbloquean tras una transaccion completada"
      ],
      waitlist: {
        emailPlaceholder: "estudiante@maastrichtuniversity.nl",
        both: "Comprar y vender",
        buyer: "Principalmente comprar",
        seller: "Principalmente vender",
        submit: "Unirme a la lista"
      }
    },
    featured: {
      ...mutableDictionaries.en.marketing.featured,
      eyebrow: "Destacados",
      title: "El inventario impulsado sigue claramente marcado y relevante para estudiantes.",
      description: "Los anuncios promocionados aparecen en home, categorias y busqueda con etiquetado transparente."
    },
    outlet: {
      ...mutableDictionaries.en.marketing.outlet,
      eyebrow: "Outlet",
      title: "Los articulos mas baratos, urgentes o imperfectos que siguen resolviendo problemas reales.",
      description: "Outlet es una experiencia principal para asequibilidad, liquidaciones rapidas y reutilizacion."
    },
    categories: {
      ...mutableDictionaries.en.marketing.categories,
      eyebrow: "Explorar por categoria",
      title: "Organizado como realmente compran los estudiantes en Maastricht.",
      description: "Desde esenciales para la primera semana hasta liquidaciones rapidas de salida, cada entrada lleva al browse correcto."
    },
    faq: {
      ...mutableDictionaries.en.marketing.faq,
      eyebrow: "FAQ",
      title: "Respuestas que quitan friccion antes del registro.",
      description: "La web publica resume lo esencial para entender que es CampusSwap, como funciona la confianza y que no depende de la verificacion.",
      items: [
        {
          question: "Quien puede usar CampusSwap?",
          answer: "CampusSwap esta pensado para la vida estudiantil en Maastricht. Cualquier persona puede crear una cuenta y explorar, mientras que la verificacion estudiantil aporta mas confianza."
        },
        {
          question: "Necesito un email universitario?",
          answer: "No. Cualquier email valido puede crear una cuenta. Los dominios universitarios compatibles desbloquean estado verificado o pendiente."
        },
        {
          question: "Como funcionan los pagos?",
          answer: "La mayoria de intercambios ocurren en persona. Los anuncios promocionados pueden pagarse online mas adelante, pero la entrega del articulo sigue siendo presencial en el MVP."
        },
        {
          question: "Que es Outlet?",
          answer: "Outlet destaca articulos urgentes, muy usados y economicos que siguen ayudando a estudiantes a instalarse con menos gasto."
        }
      ]
    }
  },
  map: {
    ...mutableDictionaries.en.map,
    eyebrow: "Zona aproximada de encuentro",
    title: "Zona de recogida con privacidad",
    description: "CampusSwap muestra una zona aproximada por barrio en vez de una direccion privada.",
    approximateZone: "Solo zona aproximada",
    meetupArea: "Zona de encuentro",
    publicPointTitle: "Punto publico sugerido",
    listingContext: "Contexto del anuncio",
    guidanceTitle: "Sugerencia para el encuentro",
    privacyTitle: "Privacidad protegida",
    privacyBody: "Las direcciones exactas solo deberian compartirse en el chat privado cuando ambas partes acuerden horario y punto publico."
  }
};

mutableDictionaries.nl = {
  ...mutableDictionaries.en,
  localeLabel: "Nederlands",
  languageSwitcher: { label: "Taal" },
  nav: {
    ...mutableDictionaries.en.nav,
    public: { ...mutableDictionaries.en.nav.public, categories: "Categorieen", featured: "Uitgelicht", trustSafety: "Vertrouwen en veiligheid", join: "Meedoen" },
    app: { ...mutableDictionaries.en.nav.app, forYou: "Voor jou", search: "Zoeken", saved: "Opgeslagen", messages: "Berichten", settings: "Instellingen" },
    admin: { ...mutableDictionaries.en.nav.admin, users: "Gebruikers", listings: "Advertenties", reports: "Meldingen", settings: "Instellingen" }
  },
  site: { ...mutableDictionaries.en.site, publicTagline: "Studentgerichte marktplaats voor Maastricht", adminTagline: "Controlecentrum voor moderatie, groei en monetisatie", logIn: "Inloggen", sellItem: "Artikel verkopen" },
  common: {
    ...mutableDictionaries.en.common,
    actions: { ...mutableDictionaries.en.common.actions, editListing: "Advertentie bewerken", viewListing: "Advertentie bekijken", openListing: "Advertentie openen", openConversation: "Conversatie openen", openPurchaseChat: "Koopchat openen", openBuyerChat: "Chat met koper openen", browseEveryCategory: "Alle categorieen bekijken", browseCategory: "Categorie bekijken", exploreOutlet: "Bekijk Outlet", searchAllListings: "Alle advertenties zoeken", startSelling: "Start met verkopen", publishListing: "Advertentie publiceren", saveChanges: "Wijzigingen opslaan", cancel: "Annuleren", updating: "Bezig met bijwerken...", opening: "Bezig met openen...", removing: "Bezig met verwijderen...", removeListing: "Advertentie verwijderen", clearAll: "Alle filters wissen" },
    typicalRange: "Typische prijsklasse",
    conditionLabels: { new: "Nieuw", "like-new": "Zo goed als nieuw", good: "Goed", fair: "Redelijk", "needs-love": "Heeft wat werk nodig" },
    listingStatusLabels: { active: "Actief", reserved: "Gereserveerd", sold: "Verkocht", archived: "Gearchiveerd", "pending-review": "Wacht op review", hidden: "Verwijderd" },
    exchangeStatusLabels: {
      inquiry: "Conversatie gestart",
      negotiating: "Koopverzoek",
      pending: "In afwachting",
      reserved: "Gereserveerd",
      paid: "Betaald",
      "ready-for-pickup": "Klaar voor afhalen",
      shipped: "Verzonden",
      delivered: "Bezorgd",
      completed: "Afgerond",
      cancelled: "Geannuleerd",
      reported: "Gemeld"
    },
    notificationPreferenceLabels: { messages: "Berichten", listingUpdates: "Advertentie-updates", savedSearches: "Meldingen voor opgeslagen zoekopdrachten", featuredDigest: "Uitgelichte digest", promotions: "Promotie-updates" }
  },
  auth: {
    ...mutableDictionaries.en.auth,
    signup: { ...mutableDictionaries.en.auth.signup, eyebrow: "Account maken", title: "Maak je CampusSwap-account aan en ga direct de marktplaats op.", description: "Elk geldig e-mailadres kan een account aanmaken. Studentenverificatie blijft beschikbaar als optionele vertrouwenslaag.", namePlaceholder: "Volledige naam", emailPlaceholder: "jij@voorbeeld.com", passwordPlaceholder: "Kies een wachtwoord", submit: "Account maken", submitting: "Account wordt gemaakt...", domainHint: "Elk geldig e-mailadres kan zich aanmelden. Ondersteunde studentdomeinen:" },
    login: { ...mutableDictionaries.en.auth.login, eyebrow: "Inloggen", title: "Welkom terug bij CampusSwap.", description: "Log in met je e-mailadres en wachtwoord om verder te gaan met opgeslagen advertenties, berichten en afspraken.", emailPlaceholder: "jij@voorbeeld.com", passwordPlaceholder: "Wachtwoord", submit: "Inloggen", submitting: "Bezig met inloggen...", noAccount: "Nog geen account?", createOne: "Maak er een", forgotPassword: "Wachtwoord vergeten?" },
    verifyEmail: { ...mutableDictionaries.en.auth.verifyEmail, eyebrow: "E-mail verifieren", title: "Studentenverificatie is optioneel, maar versterkt vertrouwen.", description: "Je kunt CampusSwap al gebruiken. Ondersteunde universiteitsdomeinen kunnen automatisch verifieren of een pending-status geven zonder de rest van de app te blokkeren.", supportedDomains: "Ondersteunde studentdomeinen", accountEmail: "Account e-mail", openApp: "Open de app", continueIntoApp: "Ga verder naar CampusSwap", rules: ["Elk geldig e-mailadres kan een CampusSwap-account maken en gebruiken.", "Ondersteunde studentdomeinen kunnen een verified badge of pending trust-status geven.", "Verificatie blijft zichtbaar op je profiel, advertenties en gesprekken, maar blokkeert basisgebruik niet."] },
    forgotPassword: { ...mutableDictionaries.en.auth.forgotPassword, eyebrow: "Wachtwoord resetten", title: "Stuur jezelf een resetlink.", description: "Voer het e-mailadres van je CampusSwap-account in en we sturen een veilige resetlink.", emailPlaceholder: "jij@voorbeeld.com", submit: "Resetmail versturen", submitting: "Bezig met verzenden...", success: "Resetmail verzonden. Controleer je inbox en spammap.", backToLogin: "Terug naar inloggen" },
    resetPassword: { ...mutableDictionaries.en.auth.resetPassword, eyebrow: "Nieuw wachtwoord", title: "Kies een nieuw wachtwoord voor je CampusSwap-account.", description: "Zodra de resetlink geldig is, kun je een nieuw wachtwoord instellen en verdergaan naar de app.", passwordPlaceholder: "Nieuw wachtwoord", confirmPasswordPlaceholder: "Bevestig nieuw wachtwoord", submit: "Wachtwoord bijwerken", submitting: "Wachtwoord wordt bijgewerkt...", invalidLink: "Deze resetlink is ongeldig of verlopen. Vraag een nieuwe aan vanuit inloggen.", success: "Wachtwoord bijgewerkt. Je kunt nu inloggen met je nieuwe wachtwoord.", backToLogin: "Terug naar inloggen", mismatch: "Wachtwoorden komen niet overeen." }
  },
  search: { ...mutableDictionaries.en.search, eyebrow: "Zoeken en ontdekken", title: "Snel browsen wanneer je snel moet beslissen.", description: "Zoeken, filters, subcategorieen en sorteren werken de resultaten direct bij.", controls: "Ontdekkingsfilters", query: "Zoeken", queryPlaceholder: "Zoek fietsen, bureaus, beddengoed of monitoren", categories: "Categorieen", subcategories: "Subcategorieen", minPrice: "Min prijs", maxPrice: "Max prijs", condition: "Conditie", outletOnly: "Alleen outlet", featuredOnly: "Alleen uitgelicht", minimumSellerRating: "Minimale verkopersscore", sort: "Sorteren", sortOptions: { recommended: "Aanbevolen", relevance: "Relevantie", newest: "Nieuwste", priceLowHigh: "Prijs laag-hoog", priceHighLow: "Prijs hoog-laag" }, trending: "Trending", recent: "Recent", results: "resultaten", resultsDescription: "Ontdekking werkt direct bij wanneer filters veranderen.", recommendationPrefix: "Waarom je dit ziet", clearAll: "Alle filters wissen", emptyTitle: "Geen advertenties die bij deze filters passen", emptyDescription: "Probeer een ruimer prijsbereik of schakel filters uit om meer aanbod te zien.", filterLabels: { search: "Zoekterm", category: "Categorie", subcategory: "Subcategorie", min: "Min EUR", max: "Max EUR", condition: "Conditie", sellerRating: "Verkopersscore", sort: "Sortering", area: "Gebied", distance: "Afstand" } },
  settings: {
    ...mutableDictionaries.en.settings,
    eyebrow: "Instellingen",
    title: "Beheer meldingen, zichtbaarheid en accountondersteuning.",
    description: "Instellingen bevat de productpaden voor GDPR-verzoeken, accountverwijdering en vertrouwensinstellingen.",
    notificationsTitle: "Meldingen",
    notificationsDescription: "Kies welke updates voorrang krijgen zodat CampusSwap nuttig blijft zonder te veel ruis.",
    notificationsSaved: "Meldingsvoorkeuren opgeslagen.",
    savePreferences: "Meldingsvoorkeuren opslaan",
    savingPreferences: "Voorkeuren worden opgeslagen...",
    accountTitle: "Account",
    noPreferences: "Nog geen meldingsvoorkeuren gekozen.",
    requestDataExport: "Gegevens export aanvragen",
    requestAccountDeletion: "Accountverwijdering aanvragen",
    reviewVerification: "Verificatie en studentvertrouwensinstellingen bekijken",
    notificationDescriptions: {
      messages: "Directe updates wanneer kopers of verkopers reageren in advertentiegekoppelde chat.",
      listingUpdates: "Statuswijzigingen voor je advertenties, reserveringen en moderatiereviews.",
      savedSearches: "Meldingen wanneer nieuw aanbod overeenkomt met wat je volgt.",
      featuredDigest: "Een overzicht van uitgelichte en snel bewegende advertenties in Maastricht.",
      promotions: "Betalings-, goedkeurings- en afloopupdates voor promotieverzoeken."
    }
  },
  reviews: { ...mutableDictionaries.en.reviews, title: "Beoordelingen verschijnen alleen na afgeronde uitwisselingen.", description: "Het reviewsysteem beloont betrouwbare overdrachten en wordt pas geactiveerd na een echte afgeronde transactie.", leaveReview: "Review achterlaten", submitting: "Verzenden...", ratingLabel: "Beoordeling", textLabel: "Review", textOptionalHint: "Optioneel", placeholder: "Beschrijf de overdracht, communicatie en of het item overeenkwam met de advertentie.", submitted: "Review verzonden.", noReviewsTitle: "Nog geen reviews", noReviewsDescription: "Reviews verschijnen hier na afgeronde uitwisselingen.", yourReview: "Jouw review", receivedReview: "Ontvangen review", createdOn: "Gemaakt op" },
  messages: {
    ...mutableDictionaries.en.messages,
    eyebrow: "Berichten",
    title: "Advertentiegekoppelde chat houdt de afhaalcontext intact.",
    description: "Snelle acties versturen direct, nieuwe threads openen vanuit advertenties en elke conversatie bewaart de context van item en verkoper.",
    actions: {
      ...mutableDictionaries.en.messages.actions,
      yourListing: "Jouw advertentie",
      itemSold: "Item verkocht",
      listingUnavailable: "Advertentie niet beschikbaar",
      photoAttachment: "Foto bijgevoegd",
      signUpToMessage: "Meld je aan om te berichten",
      messageSeller: "Bericht verkoper",
      verificationNoticePrefix: "Je bericht als",
      verificationNoticeSuffix: "Verificatie is optioneel, maar geeft een sterker vertrouwenssignaal.",
      openConversation: "Conversatie openen",
      noMessagesYet: "Nog geen berichten",
      unread: "ongelezen"
    },
    thread: {
      ...mutableDictionaries.en.messages.thread,
      liveThread: "Live chat",
      autoUpdate: "Nieuwe berichten verschijnen hier automatisch.",
      quickReplies: "Snelle antwoorden",
      attachmentReady: "Bijlage klaar",
      messagePlaceholder: "Schrijf over timing, prijs of afhalen",
      attach: "Bijvoegen",
      attachSoon: "Bijlagen binnenkort",
      send: "Versturen",
      sending: "Versturen...",
      listingContext: "Advertentiecontext",
      pickupArea: "Afhaalgebied",
      meetupSafely: "Veilig afspreken",
      meetupSafelyBody: "Kies bij voorkeur campusnabije of drukke plekken en houd de advertentiechat actief tot de overdracht rond is.",
      conversationUnavailableTitle: "Conversatie niet beschikbaar",
      conversationUnavailableDescription: "De chatcontext kon niet worden geladen. Open de advertentie opnieuw en probeer het nog eens.",
      demoExchangeTitle: "Demo-uitwisselingsstatus",
      demoExchangeDescription: "Schakel live mode in om reserveringen, verkocht-status en reviewgeschiktheid in deze conversatie op te slaan."
    },
    exchange: {
      ...mutableDictionaries.en.messages.exchange,
      title: "Uitwisselingsstatus",
      sellerBody: "Gebruik deze chat om de overdracht af te stemmen. Werk de bestelling pas verder af zodra CampusSwap de betaling heeft geregistreerd.",
      buyerBody: "Gebruik deze chat om de details te bevestigen. De bestelling telt pas als betaald zodra Stripe Checkout is afgerond.",
      buyerLabel: "Koper",
      sellerLabel: "Verkoper",
      listingStatus: "Advertentiestatus",
      price: "Prijs",
      meetupArea: "Ontmoetingsgebied",
      meetupWindow: "Afspraakvenster",
      reservedAt: "Gereserveerd op",
      completedAt: "Voltooid op",
      cancelledAt: "Geannuleerd op",
      pricePending: "Nog te bevestigen",
      meetupTbd: "Wordt in de chat afgesproken",
      windowTbd: "Nog in te plannen",
      chatOnly: "Alleen chat",
      noBuyerLinked: "Er is nog geen koper gekoppeld. Zodra iemand een koopverzoek start, verschijnt dat hier.",
      reservedForOtherBuyer: "Dit item is momenteel gereserveerd voor een andere koper. Je kunt de advertentie nog bekijken, maar nog geen nieuw koopverzoek starten.",
      completedReviewInfo: "Deze advertentie is al afgerond. Reviews zijn alleen beschikbaar voor koper en verkoper van deze transactie.",
      reserveForBuyer: "Reserveer voor deze koper",
      releaseReservation: "Reservering vrijgeven",
      markSold: "Markeer als verkocht",
      cancelExchange: "Uitwisseling annuleren",
      cancelRequest: "Verzoek annuleren",
      startPurchase: "Nu kopen / reservering aanvragen",
      startingPurchase: "Bezig met starten...",
      stripeRedirecting: "Stripe wordt geopend...",
      continueToStripe: "Verder naar Stripe",
      retryPayment: "Betaling opnieuw proberen",
      paymentPendingBuyer:
        "Je bestelling staat klaar, maar de betaling is nog niet afgerond. Rond Stripe Checkout af om het item vast te zetten.",
      paymentCancelledBuyer:
        "Stripe Checkout is geannuleerd voordat de betaling klaar was. Probeer het opnieuw wanneer het uitkomt.",
      paymentPaidBuyer:
        "Betaling bevestigd. De verkoper kan deze bestelling nu verder afhandelen.",
      paymentPendingSeller:
        "De koper heeft de Stripe-betaling nog niet afgerond. Wacht met voorbereiden totdat de betaling bevestigd is.",
      openListing: "Advertentie openen",
      confirmCancel: "Deze uitwisseling annuleren en de advertentie indien nodig heropenen?",
      confirmBuyerCancel: "Je koopverzoek voor deze advertentie annuleren?",
      completedReviewCta: "Laat je review achter in Aankopen",
      noOnlinePayment: "Online betaling wordt in deze MVP nog niet verwerkt."
    },
    inbox: {
      ...mutableDictionaries.en.messages.inbox,
      recentTitle: "Recente berichten",
      openAll: "Berichten openen",
      emptyTitle: "Nog geen conversaties",
      emptyDescription: "Wanneer je vanuit een advertentie een verkoper bericht, verschijnt de thread hier met de advertentiecontext.",
      loadErrorTitle: "Berichten konden niet worden geladen"
    }
  },
  myListings: {
    ...mutableDictionaries.en.myListings,
    eyebrow: "Mijn advertenties",
    title: "Beheer beschikbaarheid, urgentie en verkoopsnelheid.",
    description: "Advertentiecontroles ondersteunen actief, gereserveerd, verkocht, gearchiveerd en promotieklare statussen.",
    editListing: "Advertentie bewerken",
    statusTitle: "Advertentiestatus",
    statusDescription: "Actieve en gearchiveerde staten beheer je hier. Reservering en verkocht komen nu uit echte uitwisselingsflows.",
    openExchangeChat: "Uitwisselingschat openen",
    buyerLabel: "Koper",
    statusOptions: { active: "Actief", archived: "Archiveren" }
  },
  myPurchases: {
    ...mutableDictionaries.en.myPurchases,
    eyebrow: "Aankopen en uitwisselingen",
    title: "Transactieoverzicht met fysieke overdracht als basis.",
    description: "De MVP houdt de overdracht in persoon, maar transactiedata, review-gating en verkopershistorie worden nu in Supabase opgeslagen.",
    sellerLabel: "Verkoper",
    buyerLabel: "Koper",
    recordedValue: "Geregistreerde waarde",
    meetupSpot: "Afspraakplek",
    meetupWindow: "Afspraakvenster",
    reservedAt: "Gereserveerd op",
    completedAt: "Voltooid op",
    openConversation: "Conversatie openen",
    alreadyReviewed: "Je hebt deze uitwisseling al beoordeeld.",
    reviewsUnlock: "Reviews komen vrij zodra de uitwisseling als voltooid is gemarkeerd.",
    emptyTitle: "Nog geen uitwisselingen",
    emptyDescription: "Zodra je gesprekken start en overdrachten afrondt, verschijnen ze hier met reviewstatus."
  },
  profile: {
    ...mutableDictionaries.en.profile,
    activeListings: "Actieve advertenties",
    reserved: "Gereserveerd",
    soldItems: "Verkochte items",
    responseRate: "Reactiesnelheid",
    activeInventoryEyebrow: "Actieve voorraad",
    activeInventoryTitle: "Advertenties die nu live staan op CampusSwap.",
    activeInventoryDescription: "Dit zijn de items waarop een koper nu nog kan reageren.",
    reservedEyebrow: "Gereserveerd",
    reservedTitle: "Items die momenteel vastgehouden worden.",
    reservedDescription: "Gereserveerde advertenties blijven zichtbaar zodat duidelijk is wat al in behandeling is.",
    soldEyebrow: "Verkochte items",
    soldTitle: "Recente afgeronde uitwisselingen.",
    soldDescription: "Verkochte advertenties maken de geschiedenis van de verkoper geloofwaardiger.",
    archivedEyebrow: "Gearchiveerd",
    archivedTitle: "Oudere voorraad die niet meer in omloop is.",
    archivedDescription: "Gearchiveerde advertenties blijven apart zodat het actieve profiel schoon blijft.",
    reviewsEyebrow: "Reviews",
    reviewsTitle: "Vertrouwenssignalen uit afgeronde uitwisselingen.",
    reviewsDescription: "Beoordelingen worden alleen verzameld na een afgeronde transactie.",
    editProfile: "Profiel bewerken",
    verificationDescriptions: {
      verified: "Studentenverificatie is zichtbaar op advertenties en berichten.",
      pending: "Dit account is actief terwijl studentenverificatie nog in behandeling is.",
      unverified: "Dit account kan CampusSwap normaal gebruiken, maar heeft nog geen studentenverificatie toegevoegd."
    },
    emptyStates: {
      activeTitle: "Nu geen actieve advertenties",
      activeDescription: "Wanneer deze verkoper nieuwe items publiceert, verschijnen ze hier.",
      reservedTitle: "Geen gereserveerde advertenties",
      reservedDescription: "Er is momenteel niets gereserveerd voor deze verkoper.",
      soldTitle: "Nog geen verkochte items",
      soldDescription: "Afgeronde uitwisselingen verschijnen hier zodra deze verkoper items als verkocht markeert.",
      reviewsTitle: "Nog geen reviews",
      reviewsDescription: "Reviews verschijnen hier na afgeronde uitwisselingen."
    }
  },
  listing: {
    ...mutableDictionaries.en.listing,
    seller: "Verkoper",
    safeMeetup: "Veilige afspraaktips",
    ownListing: "Dit is jouw advertentie. Koop- en reserveringsstatus blijven nu gekoppeld aan echte uitwisselingsrecords in plaats van handmatige toggles.",
    pickupArea: "Afhaalgebied",
    responseRate: "Reactiesnelheid",
    reservedForOther: "Dit item is gereserveerd voor een andere koper. Je kunt het nog volgen, maar geen nieuw koopverzoek starten tot het wordt vrijgegeven.",
    hiddenOwn: "Deze advertentie is verborgen uit publieke browsepagina's. Je kunt hem opnieuw publiceren vanuit Mijn advertenties of verborgen houden zonder chat- en reviewgeschiedenis te verliezen.",
    editListing: "Advertentie bewerken",
    featured: "Uitgelicht",
    outlet: "Outlet",
    urgent: "Urgent",
    meetupTips: [
      "Kies bij voorkeur afspraakplekken overdag en dicht bij de campus.",
      "Houd de advertentiechat actief tot de overdracht bevestigd is.",
      "Markeer de uitwisseling pas als voltooid wanneer de overdracht echt klaar is."
    ]
  },
  notifications: {
    ...mutableDictionaries.en.notifications,
    eyebrow: "Meldingen",
    title: "Berichten, promoties en vertrouwensupdates op een plek.",
    description: "Meldingsvoorkeuren leggen de basis voor opgeslagen zoekalerts, featured digests en toekomstige groeiloops.",
    recentTitle: "Recente meldingen",
    openAll: "Meldingen openen",
    openContext: "Context openen",
    markRead: "Markeer als gelezen",
    markAllRead: "Markeer alles als gelezen",
    unreadLabel: "Ongelezen",
    readLabel: "Gelezen",
    typeLabels: {
      message: "Bericht",
      promotion: "Promotie",
      review: "Review",
      listing: "Advertentie",
      safety: "Veiligheid",
      system: "Systeem"
    },
    emptyTitle: "Nog geen meldingen",
    emptyDescription: "Berichten, promotie-updates en vertrouwensmeldingen verschijnen hier terwijl je CampusSwap gebruikt."
  },
  listingForm: {
    ...mutableDictionaries.en.listingForm,
    eyebrow: "Verkopen",
    createTitle: "Plaats snel, promoot indien nodig en houd het afhaalverhaal helder.",
    createDescription: "De verkopersflow is geoptimaliseerd voor snelle move-out momenten met steun voor onderhandelbare prijs, urgentie, outlet en toekomstige promotie.",
    editTitle: "Werk je advertentie bij zonder chat- of uitwisselingscontext te verliezen.",
    editDescription: "Pas de kerngegevens van de advertentie aan en sla de wijzigingen terug op in de live marktplaats.",
    requirementsBody: "Verplichte velden: titel, beschrijving, categorie, conditie, prijs, fotogalerij en afhaalgebied.",
    optionalControlsBody: "Optionele controles: onderhandelbaar, outlet, urgent en toekomstige promotie-aankopen.",
    moderationBody: "Verdachte formuleringen sturen advertenties automatisch naar moderatie.",
    verificationOptionalTitle: "Studentenverificatie is optioneel.",
    verificationOptionalBody: "Je kunt nu al advertenties publiceren. Omdat je account nog niet student-geverifieerd is, kunnen nieuwe advertenties eerst door een snelle vertrouwensreview gaan.",
    titlePlaceholder: "Titel",
    descriptionPlaceholder: "Beschrijf conditie, afhaalmoment en wat inbegrepen is",
    pricePlaceholder: "Prijs",
    pickupAreaPlaceholder: "Afhaalgebied",
    currentPhotos: "Huidige foto's",
    addMorePhotos: "Meer foto's toevoegen",
    listingPhotos: "Advertentiefoto's",
    replaceGallery: "Vervang de huidige galerij door deze uploads",
    negotiable: "Onderhandelbaar",
    outlet: "Outlet",
    urgent: "Urgent",
    publishListing: "Advertentie publiceren",
    saveChanges: "Wijzigingen opslaan",
    featuredRequestLabel: "Deze advertentie uitlichten voor EUR 2",
    featuredRequestHelp: "We registreren nu een promotieverzoek. Als de betaling nog niet is afgerond, blijft het verzoek in behandeling en wordt de advertentie niet automatisch uitgelicht.",
    featuredPendingNote: "De betaling staat nog open. Deze advertentie blijft niet-uitgelicht tot Checkout is afgerond.",
    featuredActiveNote: "Deze advertentie is al uitgelicht in discovery.",
    featuredCancelledNote: "De vorige betaalpoging is niet afgerond. Je kunt Checkout opnieuw starten wanneer je wilt.",
    featuredCheckoutButton: "Betaal EUR 2 en licht deze advertentie uit",
    featuredPaymentUnavailable: "Stripe-betaling is nog niet geconfigureerd. Het verzoek blijft in behandeling tot Checkout beschikbaar is.",
    featuredProcessingBanner: "Stripe bevestigt je betaling. De advertentie wordt uitgelicht zodra de webhook de betaling als voltooid markeert.",
    featuredPaidBanner: "Betaling ontvangen. Deze advertentie is nu actief in uitgelichte discovery-oppervlakken.",
    featuredCancelledBanner: "De betaling is geannuleerd. De advertentie blijft niet-uitgelicht en het verzoek staat als niet voltooid.",
    featuredCheckoutError: "We konden Stripe Checkout voor deze advertentie nu niet starten. Probeer het opnieuw."
  },
  appHome: {
    ...mutableDictionaries.en.appHome,
    welcomeBack: "Welkom terug",
    feedDescription: "Je feed geeft voorrang aan fietsen, meubels, keukenitems en snelle afhaaladvertenties op basis van je profiel, opgeslagen items en recente zoekopdrachten.",
    sellUpload: "Verkoop / upload product",
    searchAllListings: "Zoek alle advertenties",
    sellerMomentumEyebrow: "Verkoopmomentum",
    sellerMomentumTitle: "Moet je verkopen voor je verhuist?",
    sellerMomentumDescription: "Plaats je advertentie, markeer hem als urgent en vraag promotie aan als de timing krap is.",
    featuredEyebrow: "Nu uitgelicht",
    featuredTitle: "Voorraad met hoge intentie door de hele stad.",
    featuredDescription: "Een mix van gebooste, snel bewegende en studentrelevante advertenties.",
    homeFeedEyebrow: "Homefeed",
    homeFeedTitle: "Het nuttigste voor jouw week in Maastricht.",
    homeFeedDescription: "CampusSwap combineert relevantie, versheid, prijs en vertrouwen om de feed slimmer te rangschikken."
  },
  marketing: {
    ...mutableDictionaries.en.marketing,
    home: {
      ...mutableDictionaries.en.marketing.home,
      heroBadge: "Studentgericht in Maastricht",
      heroTitle: "Koop en verkoop studentenspullen in Maastricht zonder de chaos.",
      heroBody: "CampusSwap geeft aankomende studenten een snellere start, vertrekkende studenten een snellere verkoop en iedereen een betrouwbaardere marktplaats dan losse groepschats.",
      browseItems: "Items bekijken",
      sellUpload: "Verkoop / upload product",
      valueCards: [
        { eyebrow: "Studentgericht vertrouwen", title: "Verificatie beschikbaar" },
        { eyebrow: "Veiligere uitwisselingen", title: "Gemodereerde marktplaats" },
        { eyebrow: "Betaalbaar en groen", title: "Outlet inbegrepen" }
      ],
      whyEyebrow: "Waarom CampusSwap",
      whyTitle: "Gebouwd rond precies het studentenmoment dat brede marktplaatsen missen.",
      whyDescription: "Verhuisperiodes in Maastricht zijn tijdgevoelig. CampusSwap houdt aanbod lokaal, categorieen geordend en vertrouwenssignalen zichtbaar zodat studenten snel kunnen handelen.",
      audiences: [
        { title: "Aankomende studenten", body: "Vind fietsen, bureaus, beddengoed en keukenspullen voordat de colleges beginnen." },
        { title: "Vertrekkende studenten", body: "Verkoop snel voor je huur afloopt met urgentie en featured tools." },
        { title: "Budgetgerichte kopers", body: "Gebruik Outlet voor eerlijke kortingen op zwaar gebruikte maar nuttige items." },
        { title: "Communitygerichte gebruikers", body: "Ruil binnen een studentennetwerk in plaats van een stadsbrede chaos." }
      ],
      howEyebrow: "Hoe het werkt",
      howTitle: "Snel genoeg voor verhuisweek. Rustig genoeg om te vertrouwen.",
      howDescription: "Maak een account aan, browse wat je nodig hebt en regel fysieke afhaling met zichtbare verificatiestatus en veilige afspraakrichtlijnen.",
      steps: [
        { title: "Meld je aan", body: "Maak een account aan met elk geldig e-mailadres en voeg studentenverificatie toe wanneer je een sterker vertrouwenslabel wilt." },
        { title: "Ontdek", body: "Browse featured drops, categoriepagina's, outletdeals en een Voor jou-feed op basis van echte interacties." },
        { title: "Hergebruik", body: "Reserveer, spreek af en laat na afloop een review achter zodat meer nuttige items in omloop blijven." }
      ],
      categoriesEyebrow: "Categorieen",
      categoriesTitle: "Meubels, fietsen, studieboeken, elektronica en alle dagelijkse essentials daartussenin.",
      categoriesDescription: "Het categoriemodel is afgestemd op het studentenleven in Maastricht.",
      featuredEyebrow: "Uitgelichte preview",
      featuredTitle: "Gepromote advertenties en sterk aanbod, zonder vertrouwen te verliezen.",
      featuredDescription: "Uitgelichte advertenties blijven duidelijk gemarkeerd en het aanbod voelt nooit misleidend aan.",
      trustEyebrow: "Vertrouwen en veiligheid",
      trustTitle: "Zichtbare vertrouwenssignalen werken beter dan vage beloftes.",
      trustDescription: "Verificatie, moderatie, verkopersscores en veilige afspraakprompts zijn verweven in browse en berichten.",
      outletEyebrow: "Betaalbaar en groen",
      outletTitle: "Outlet geeft goedkopere items een slimmere tweede leven.",
      outletDescription: "Beschadigde maar bruikbare en urgente uitverkoopitems verdienen een eigen ervaring, geen verborgen filter.",
      outletBody: "CampusSwap behandelt Outlet als een echte onderscheidende laag voor lage budgetten, snelle uitverkoop en praktische hergebruik.",
      outletCta: "Bekijk Outlet",
      testimonialsEyebrow: "Demo-testimonials",
      testimonialsTitle: "Gezaaide proof points voor launchverhaal.",
      testimonialsDescription: "Deze testimonials zijn demo-content om de launchstructuur te helpen vormgeven. Vervang ze na launch door echte studentfeedback.",
      testimonials: [
        "Demo-testimonial: ik kwam donderdag in Maastricht aan en had zondag al een bureau, lamp en fiets.",
        "Demo-testimonial: mijn studio-spullen op een plek verkopen was veel rustiger dan schakelen tussen groepschats.",
        "Demo-testimonial: de outlet-sectie hielp me een kamer inrichten zonder mijn eerste-maandbudget op te blazen."
      ],
      faqEyebrow: "FAQ",
      faqTitle: "Vragen die studenten meestal stellen voordat ze een nieuwe marktplaats vertrouwen.",
      faqDescription: "De publieke site houdt de kernvragen over vertrouwen en onboarding helder, vooral voor internationale studenten.",
      trustSignals: [
        "Zichtbare verificatiestatus op profielen, advertenties en berichten",
        "Moderatiequeue voor verdachte advertenties en meldingen",
        "Veilige afspraakprompts bij elk gesprek en elke uitwisseling",
        "Beoordelingen komen pas vrij na een afgeronde transactie"
      ],
      waitlist: {
        emailPlaceholder: "student@maastrichtuniversity.nl",
        both: "Kopen en verkopen",
        buyer: "Voornamelijk kopen",
        seller: "Voornamelijk verkopen",
        submit: "Op de wachtlijst"
      }
    },
    featured: {
      ...mutableDictionaries.en.marketing.featured,
      eyebrow: "Uitgelicht",
      title: "Geboost aanbod blijft duidelijk gemarkeerd en studentrelevant.",
      description: "Gepromote advertenties verschijnen op home, categorie- en zoekoppervlakken met transparante labels."
    },
    outlet: {
      ...mutableDictionaries.en.marketing.outlet,
      eyebrow: "Outlet",
      title: "De goedkopere, urgente en imperfecte items die nog steeds echte studentenproblemen oplossen.",
      description: "Outlet is een kernervaring voor betaalbaarheid, snelle clear-outs en duurzaam hergebruik."
    },
    categories: {
      ...mutableDictionaries.en.marketing.categories,
      eyebrow: "Browse per categorie",
      title: "Georganiseerd rond hoe studenten in Maastricht echt winkelen.",
      description: "Van first-week essentials tot snelle move-out opruimingen: elke ingang leidt direct naar de juiste browse-ervaring."
    },
    faq: {
      ...mutableDictionaries.en.marketing.faq,
      eyebrow: "FAQ",
      title: "Antwoorden die twijfel voor signup wegnemen.",
      description: "De publieke site houdt de operationele details kort zodat studenten snel begrijpen wat CampusSwap is, hoe vertrouwen werkt en wat verificatie wel of niet beperkt.",
      items: [
        {
          question: "Wie kan CampusSwap gebruiken?",
          answer: "CampusSwap is gebouwd voor het studentenleven in Maastricht. Iedereen kan een account maken en browsen, terwijl studentenverificatie extra vertrouwenssignalen toevoegt."
        },
        {
          question: "Heb ik een universiteitsmail nodig?",
          answer: "Nee. Elk geldig e-mailadres kan een account maken. Ondersteunde studentdomeinen geven een verified of pending status voor extra vertrouwen."
        },
        {
          question: "Hoe werken betalingen?",
          answer: "De meeste uitwisselingen gebeuren persoonlijk. Gepromote advertenties kunnen later online worden afgerekend, terwijl de itemoverdracht in de MVP meetup-first blijft."
        },
        {
          question: "Wat is Outlet?",
          answer: "Outlet benadrukt urgente, zwaar gebruikte en budgetvriendelijke items die studenten nog steeds helpen om zich betaalbaar te vestigen."
        }
      ]
    }
  },
  map: {
    ...mutableDictionaries.en.map,
    eyebrow: "Benaderde ontmoetingszone",
    title: "Privacyveilige afhaalzone",
    description: "CampusSwap toont een benaderde buurtzone in plaats van een privéadres.",
    approximateZone: "Alleen benaderde zone",
    meetupArea: "Ontmoetingsgebied",
    publicPointTitle: "Voorgesteld openbaar afspreekpunt",
    listingContext: "Advertentiecontext",
    guidanceTitle: "Voorgestelde afspraaktip",
    privacyTitle: "Privacy beschermd",
    privacyBody: "Exacte adressen deel je pas privé in de chat wanneer beide kanten akkoord zijn met tijd en openbare overdrachtplek.",
  }
};

function normalizeLocaleDictionary<T>(
  value: T,
  normalizeText: (input: string) => string
): T {
  if (typeof value === "string") {
    return normalizeText(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeLocaleDictionary(entry, normalizeText)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        normalizeLocaleDictionary(entry, normalizeText)
      ])
    ) as T;
  }

  return value;
}

function normalizeSpanishTypography(input: string) {
  const replacements: [RegExp, string][] = [
    [/Ã¡/g, "á"],
    [/Ã©/g, "é"],
    [/Ã­/g, "í"],
    [/Ã³/g, "ó"],
    [/Ãº/g, "ú"],
    [/Ã±/g, "ñ"],
    [/\bEspanol\b/g, "Español"],
    [/\bCategorias\b/g, "Categorías"],
    [/\bcategorias\b/g, "categorías"],
    [/\bAnalitica\b/g, "Analítica"],
    [/\bcontrasena\b/g, "contraseña"],
    [/\bContrasena\b/g, "Contraseña"],
    [/\bresena\b/g, "reseña"],
    [/\bResena\b/g, "Reseña"],
    [/\bresenas\b/g, "reseñas"],
    [/\bResenas\b/g, "Reseñas"],
    [/\bsenal\b/g, "señal"],
    [/\bSenal\b/g, "Señal"],
    [/\bsenales\b/g, "señales"],
    [/\bSenales\b/g, "Señales"],
    [/\banade\b/g, "añade"],
    [/\bAnade\b/g, "Añade"],
    [/\bAun\b/g, "Aún"],
    [/\baun\b/g, "aún"],
    [/\bTodavia\b/g, "Todavía"],
    [/\btodavia\b/g, "todavía"],
    [/\bPor que\b/g, "Por qué"],
    [/\bpor que\b/g, "por qué"],
    [/\bQuien\b/g, "Quién"],
    [/\bquien\b/g, "quién"],
    [/\bdireccion\b/g, "dirección"],
    [/\bDireccion\b/g, "Dirección"],
    [/\bpublico\b/g, "público"],
    [/\bPublico\b/g, "Público"],
    [/\bbusqueda\b/g, "búsqueda"],
    [/\bBusqueda\b/g, "Búsqueda"],
    [/\bbusquedas\b/g, "búsquedas"],
    [/\bBusquedas\b/g, "Búsquedas"],
    [/\bsesion\b/g, "sesión"],
    [/\bSesion\b/g, "Sesión"],
    [/\bverificacion\b/g, "verificación"],
    [/\bVerificacion\b/g, "Verificación"],
    [/\btransaccion\b/g, "transacción"],
    [/\bTransaccion\b/g, "Transacción"],
    [/\bcomunicacion\b/g, "comunicación"],
    [/\bComunicacion\b/g, "Comunicación"],
    [/\boperacion\b/g, "operación"],
    [/\bOperacion\b/g, "Operación"],
    [/\barticulo\b/g, "artículo"],
    [/\bArticulo\b/g, "Artículo"],
    [/\barticulos\b/g, "artículos"],
    [/\bArticulos\b/g, "Artículos"],
    [/\bmaximo\b/g, "máximo"],
    [/\bMaximo\b/g, "Máximo"],
    [/\bminimo\b/g, "mínimo"],
    [/\bMinimo\b/g, "Mínimo"],
    [/\brevision\b/g, "revisión"],
    [/\bRevision\b/g, "Revisión"],
    [/\bpromocion\b/g, "promoción"],
    [/\bPromocion\b/g, "Promoción"],
    [/\bgaleria\b/g, "galería"],
    [/\bGaleria\b/g, "Galería"],
    [/\binvalido\b/g, "inválido"],
    [/\bInvalido\b/g, "Inválido"],
    [/\brapida\b/g, "rápida"],
    [/\bRapida\b/g, "Rápida"],
    [/\bmas\b/g, "más"],
    [/\bMas\b/g, "Más"]
  ];

  return replacements.reduce(
    (output, [pattern, replacement]) => output.replace(pattern, replacement),
    input
  );
}

function normalizeSpanishTypographySafe(input: string) {
  const replacements: [RegExp, string][] = [
    [/\bEspanol\b/g, "Espa\u00f1ol"],
    [/\bCategorias\b/g, "Categor\u00edas"],
    [/\bcategorias\b/g, "categor\u00edas"],
    [/\bAnalitica\b/g, "Anal\u00edtica"],
    [/\bcontrasena\b/g, "contrase\u00f1a"],
    [/\bContrasena\b/g, "Contrase\u00f1a"],
    [/\bresena\b/g, "rese\u00f1a"],
    [/\bResena\b/g, "Rese\u00f1a"],
    [/\bresenas\b/g, "rese\u00f1as"],
    [/\bResenas\b/g, "Rese\u00f1as"],
    [/\bsenal\b/g, "se\u00f1al"],
    [/\bSenal\b/g, "Se\u00f1al"],
    [/\bsenales\b/g, "se\u00f1ales"],
    [/\bSenales\b/g, "Se\u00f1ales"],
    [/\banade\b/g, "a\u00f1ade"],
    [/\bAnade\b/g, "A\u00f1ade"],
    [/\bAun\b/g, "A\u00fan"],
    [/\baun\b/g, "a\u00fan"],
    [/\bTodavia\b/g, "Todav\u00eda"],
    [/\btodavia\b/g, "todav\u00eda"],
    [/\bPor que\b/g, "Por qu\u00e9"],
    [/\bpor que\b/g, "por qu\u00e9"],
    [/\bQuien\b/g, "Qui\u00e9n"],
    [/\bquien\b/g, "qui\u00e9n"],
    [/\bdireccion\b/g, "direcci\u00f3n"],
    [/\bDireccion\b/g, "Direcci\u00f3n"],
    [/\bpublico\b/g, "p\u00fablico"],
    [/\bPublico\b/g, "P\u00fablico"],
    [/\bbusqueda\b/g, "b\u00fasqueda"],
    [/\bBusqueda\b/g, "B\u00fasqueda"],
    [/\bbusquedas\b/g, "b\u00fasquedas"],
    [/\bBusquedas\b/g, "B\u00fasquedas"],
    [/\bsesion\b/g, "sesi\u00f3n"],
    [/\bSesion\b/g, "Sesi\u00f3n"],
    [/\bverificacion\b/g, "verificaci\u00f3n"],
    [/\bVerificacion\b/g, "Verificaci\u00f3n"],
    [/\btransaccion\b/g, "transacci\u00f3n"],
    [/\bTransaccion\b/g, "Transacci\u00f3n"],
    [/\bcomunicacion\b/g, "comunicaci\u00f3n"],
    [/\bComunicacion\b/g, "Comunicaci\u00f3n"],
    [/\boperacion\b/g, "operaci\u00f3n"],
    [/\bOperacion\b/g, "Operaci\u00f3n"],
    [/\barticulo\b/g, "art\u00edculo"],
    [/\bArticulo\b/g, "Art\u00edculo"],
    [/\barticulos\b/g, "art\u00edculos"],
    [/\bArticulos\b/g, "Art\u00edculos"],
    [/\bmaximo\b/g, "m\u00e1ximo"],
    [/\bMaximo\b/g, "M\u00e1ximo"],
    [/\bminimo\b/g, "m\u00ednimo"],
    [/\bMinimo\b/g, "M\u00ednimo"],
    [/\brevision\b/g, "revisi\u00f3n"],
    [/\bRevision\b/g, "Revisi\u00f3n"],
    [/\bpromocion\b/g, "promoci\u00f3n"],
    [/\bPromocion\b/g, "Promoci\u00f3n"],
    [/\bgaleria\b/g, "galer\u00eda"],
    [/\bGaleria\b/g, "Galer\u00eda"],
    [/\binvalido\b/g, "inv\u00e1lido"],
    [/\bInvalido\b/g, "Inv\u00e1lido"],
    [/\brapida\b/g, "r\u00e1pida"],
    [/\bRapida\b/g, "R\u00e1pida"],
    [/\bmas\b/g, "m\u00e1s"],
    [/\bMas\b/g, "M\u00e1s"]
  ];

  return replacements.reduce(
    (output, [pattern, replacement]) => output.replace(pattern, replacement),
    input
  );
}

mutableDictionaries.es = normalizeLocaleDictionary(
  mutableDictionaries.es,
  (value) => normalizeSpanishTypographySafe(normalizeSpanishTypography(value))
);
(mutableDictionaries.nl.map as any).description =
  "CampusSwap toont een benaderde buurtzone in plaats van een privéadres.";
(mutableDictionaries.nl.map as any).privacyBody =
  "Exacte adressen deel je pas privé in de chat wanneer beide kanten akkoord zijn met tijd en openbare overdrachtplek.";

mutableDictionaries.nl = {
  ...mutableDictionaries.nl,
  map: {
    ...mutableDictionaries.nl.map,
    description:
      "CampusSwap toont een benaderde buurtzone in plaats van een priv\u00e9adres.",
    privacyBody:
      "Exacte adressen deel je pas priv\u00e9 in de chat wanneer beide kanten akkoord zijn met tijd en openbare overdrachtplek."
  }
};

mutableDictionaries.en = {
  ...mutableDictionaries.en,
  search: {
    ...mutableDictionaries.en.search,
    pickupArea: "Pickup area",
    anyArea: "Any area",
    distance: "Distance",
    distanceOptions: {
      sameArea: "Same area only",
      nearby: "Nearby areas",
      citywide: "Anywhere in Maastricht"
    },
    saveCurrentSearch: "Save current search",
    savingSearch: "Saving search...",
    savedSearchesTitle: "Saved searches",
    savedSearchesDescription:
      "Re-open the exact filters you care about and let CampusSwap watch for new matching stock.",
    savedSearchRun: "Run search",
    savedSearchDelete: "Delete",
    filterLabels: {
      ...mutableDictionaries.en.search.filterLabels,
      area: "Area",
      distance: "Distance"
    }
  },
  saved: {
    eyebrow: "Saved",
    title: "Keep high-intent listings close while you compare options.",
    description:
      "Saved listings stay ready for side-by-side comparison, fast re-checks, and quicker move-in decisions.",
    emptyTitle: "No saved listings yet",
    emptyDescription:
      "Once you save a listing, it will appear here so you can compare prices, pickup zones, and seller trust signals.",
    compareLabel: "Compare",
    compareLimit: "Select up to {count} listings",
    addToCompare: "Add",
    removeFromCompare: "Remove",
    compareTitle: "Compare saved listings",
    compareDescription:
      "Use this side-by-side view to narrow down which saved option deserves the next message.",
    compareFields: {
      price: "Price",
      condition: "Condition",
      pickupArea: "Pickup area",
      sellerRating: "Seller rating",
      salesCount: "Sales count",
      featured: "Featured",
      negotiable: "Negotiable",
      status: "Status"
    },
    compareValues: {
      yes: "Yes",
      no: "No"
    }
  },
  profile: {
    ...mutableDictionaries.en.profile,
    memberSince: "Member since",
    salesCount: "Sales count",
    averageRating: "Average rating"
  },
  listing: {
    ...mutableDictionaries.en.listing,
    campusSwapSeller: "CampusSwap seller",
    memberSince: "Member since",
    salesCount: "Sales count",
    averageRating: "Average rating"
  }
};

  mutableDictionaries.es = {
    ...mutableDictionaries.es,
  search: {
    ...mutableDictionaries.es.search,
    pickupArea: "Zona de recogida",
    anyArea: "Cualquier zona",
    distance: "Distancia",
    distanceOptions: {
      sameArea: "Solo la misma zona",
      nearby: "Zonas cercanas",
      citywide: "Cualquier zona de Maastricht"
    },
    saveCurrentSearch: "Guardar búsqueda actual",
    savingSearch: "Guardando búsqueda...",
    savedSearchesTitle: "Búsquedas guardadas",
    savedSearchesDescription:
      "Vuelve a abrir los filtros que te importan y deja que CampusSwap vigile nuevos anuncios compatibles.",
    savedSearchRun: "Abrir búsqueda",
    savedSearchDelete: "Eliminar",
    filterLabels: {
      ...mutableDictionaries.es.search.filterLabels,
      area: "Zona",
      distance: "Distancia"
    }
  },
  saved: {
    eyebrow: "Guardados",
    title: "Mantén cerca los anuncios con más intención mientras comparas opciones.",
    description:
      "Tus guardados sirven para comparar lado a lado, revisar rápido y decidir mejor antes de escribir.",
    emptyTitle: "Aún no tienes anuncios guardados",
    emptyDescription:
      "Cuando guardes un anuncio, aparecerá aquí para comparar precio, zona de recogida y señales de confianza del vendedor.",
    compareLabel: "Comparar",
    compareLimit: "Selecciona hasta {count} anuncios",
    addToCompare: "Añadir",
    removeFromCompare: "Quitar",
    compareTitle: "Comparar anuncios guardados",
    compareDescription:
      "Usa esta vista para decidir qué anuncio merece tu siguiente mensaje.",
    compareFields: {
      price: "Precio",
      condition: "Estado",
      pickupArea: "Zona de recogida",
      sellerRating: "Valoración del vendedor",
      salesCount: "Ventas",
      featured: "Destacado",
      negotiable: "Negociable",
      status: "Estado"
    },
    compareValues: {
      yes: "Sí",
      no: "No"
    }
  },
  profile: {
    ...mutableDictionaries.es.profile,
    memberSince: "En CampusSwap desde",
    salesCount: "Ventas",
    averageRating: "Valoración media"
  },
  listing: {
    ...mutableDictionaries.es.listing,
    campusSwapSeller: "Vendedor de CampusSwap",
    memberSince: "En CampusSwap desde",
    salesCount: "Ventas",
    averageRating: "Valoración media"
  }
};

mutableDictionaries.nl = {
  ...mutableDictionaries.nl,
  appHome: {
    ...mutableDictionaries.nl.appHome,
    forYouEyebrow: "Voor jou",
    forYouTitle: "Gebaseerd op wat je al volgt.",
    forYouDescription:
      "Voorkeurscategorieën, opgeslagen items en recente signalen sturen deze shortlist.",
    becauseViewedEyebrow: "Omdat je dit bekeek",
    becauseViewedTitle: "Vergelijkbare match met je recente views.",
    becauseViewedDescription:
      "Deze picks volgen dezelfde categorie, prijsklasse of meetup-zone als recente advertenties die je opende.",
    popularAreaEyebrow: "Populair in jouw zone",
    popularAreaTitle: "Meest populair rond {area}.",
    popularAreaDescription:
      "CampusSwap combineert saves, views en verkoperstrust om lokale momentum te tonen.",
    newTodayEyebrow: "Nieuw vandaag",
    newTodayTitle: "Verse listings die vandaag live gingen.",
    newTodayDescription:
      "Nieuwe actieve voorraad die nog vroeg in de ontdekkingcyclus zit."
  },
  messages: {
    ...mutableDictionaries.nl.messages,
    offers: {
      title: "Biedingen",
      description:
        "Onderhandel hier zonder de echte listing- en transactiestatus kwijt te raken.",
      noOfferYet: "Nog geen bod in deze uitwisseling.",
      latestOffer: "Laatste bod",
      sentByBuyer: "Verstuurd door koper",
      sentBySeller: "Verstuurd door verkoper",
      sentAt: "Verstuurd",
      respondedAt: "Beantwoord",
      expiresAt: "Verloopt",
      offerAmount: "Bodbedrag",
      counterAmount: "Tegenbod",
      makeOffer: "Bod sturen",
      sendingOffer: "Bod sturen...",
      counterOffer: "Tegenbod sturen",
      acceptOffer: "Bod accepteren",
      rejectOffer: "Bod afwijzen",
      acceptCounter: "Tegenbod accepteren",
      rejectCounter: "Tegenbod afwijzen",
      withdrawOffer: "Bod intrekken",
      acceptedHint:
        "Het afgesproken bedrag zit nu in deze uitwisseling. Reserveer of rond daarna de meetup af.",
      genericError: "Kan het bod nu niet bijwerken.",
      states: {
        open: "Open",
        countered: "Tegengeboden",
        accepted: "Geaccepteerd",
        rejected: "Afgewezen",
        expired: "Verlopen",
        withdrawn: "Ingetrokken"
      }
    }
  },
  search: {
    ...mutableDictionaries.nl.search,
    pickupArea: "Afhaalgebied",
    anyArea: "Elk gebied",
    distance: "Afstand",
    distanceOptions: {
      sameArea: "Alleen hetzelfde gebied",
      nearby: "Nabije zones",
      citywide: "Overal in Maastricht"
    },
    saveCurrentSearch: "Huidige zoekopdracht opslaan",
    savingSearch: "Zoekopdracht opslaan...",
    savedSearchesTitle: "Opgeslagen zoekopdrachten",
    savedSearchesDescription:
      "Open je belangrijkste filters opnieuw en laat CampusSwap nieuwe passende advertenties signaleren.",
    savedSearchRun: "Zoekopdracht openen",
    savedSearchDelete: "Verwijderen",
    filterLabels: {
      ...mutableDictionaries.nl.search.filterLabels,
      area: "Gebied",
      distance: "Afstand"
    }
  },
  saved: {
    eyebrow: "Opgeslagen",
    title: "Houd interessante advertenties dichtbij terwijl je opties vergelijkt.",
    description:
      "Opgeslagen advertenties blijven klaar voor vergelijking, snelle checks en snellere beslissingen.",
    emptyTitle: "Nog geen opgeslagen advertenties",
    emptyDescription:
      "Zodra je een advertentie opslaat, verschijnt die hier zodat je prijs, afhaalgebied en verkopersvertrouwen kunt vergelijken.",
    compareLabel: "Vergelijken",
    compareLimit: "Selecteer maximaal {count} advertenties",
    addToCompare: "Toevoegen",
    removeFromCompare: "Verwijderen",
    compareTitle: "Opgeslagen advertenties vergelijken",
    compareDescription:
      "Gebruik dit overzicht om te bepalen welke advertentie jouw volgende bericht waard is.",
    compareFields: {
      price: "Prijs",
      condition: "Conditie",
      pickupArea: "Afhaalgebied",
      sellerRating: "Verkopersscore",
      salesCount: "Aantal verkopen",
      featured: "Uitgelicht",
      negotiable: "Onderhandelbaar",
      status: "Status"
    },
    compareValues: {
      yes: "Ja",
      no: "Nee"
    }
  },
  profile: {
    ...mutableDictionaries.nl.profile,
    memberSince: "Lid sinds",
    salesCount: "Aantal verkopen",
    averageRating: "Gemiddelde beoordeling"
  },
  listing: {
    ...mutableDictionaries.nl.listing,
    campusSwapSeller: "CampusSwap-verkoper",
    memberSince: "Lid sinds",
    salesCount: "Aantal verkopen",
    averageRating: "Gemiddelde beoordeling"
  }
};

mutableDictionaries.en = {
  ...mutableDictionaries.en,
  appHome: {
    ...mutableDictionaries.en.appHome,
    forYouEyebrow: "For you",
    forYouTitle: "Driven by what you already interact with.",
    forYouDescription:
      "Preferred categories, saved items, and recent searches shape this shortlist.",
    becauseViewedEyebrow: "Because you viewed this",
    becauseViewedTitle: "Similar listings to what you opened recently.",
    becauseViewedDescription:
      "These picks stay close to the categories, price band, and meetup areas you viewed most recently.",
    popularAreaEyebrow: "Popular in your area",
    popularAreaTitle: "Most popular around {area}.",
    popularAreaDescription:
      "CampusSwap combines saves, views, and seller trust to surface local momentum.",
    newTodayEyebrow: "New today",
    newTodayTitle: "Fresh listings that just went live.",
    newTodayDescription:
      "New active inventory that is still early in its discovery cycle."
  },
  messages: {
    ...mutableDictionaries.en.messages,
    offers: {
      title: "Offers",
      description:
        "Negotiate here without losing the real listing and exchange context.",
      noOfferYet: "No offer has been sent in this exchange yet.",
      latestOffer: "Latest offer",
      sentByBuyer: "Sent by buyer",
      sentBySeller: "Sent by seller",
      sentAt: "Sent",
      respondedAt: "Responded",
      expiresAt: "Expires",
      offerAmount: "Offer amount",
      counterAmount: "Counteroffer amount",
      makeOffer: "Make offer",
      sendingOffer: "Sending offer...",
      counterOffer: "Send counteroffer",
      acceptOffer: "Accept offer",
      rejectOffer: "Reject offer",
      acceptCounter: "Accept counteroffer",
      rejectCounter: "Reject counteroffer",
      withdrawOffer: "Withdraw offer",
      acceptedHint:
        "The agreed price is now tied to this exchange. You can reserve or complete the sale next.",
      genericError: "Unable to update the offer right now.",
      states: {
        open: "Open",
        countered: "Countered",
        accepted: "Accepted",
        rejected: "Rejected",
        expired: "Expired",
        withdrawn: "Withdrawn"
      }
    }
  }
};

mutableDictionaries.es = {
  ...mutableDictionaries.es,
  appHome: {
    ...mutableDictionaries.es.appHome,
    forYouEyebrow: "Para ti",
    forYouTitle: "Basado en lo que ya te interesa.",
    forYouDescription:
      "Tus categorías preferidas, guardados y búsquedas recientes dan forma a esta selección.",
    becauseViewedEyebrow: "Porque viste esto",
    becauseViewedTitle: "Anuncios parecidos a lo que abriste hace poco.",
    becauseViewedDescription:
      "Estas sugerencias siguen categorías, rango de precio y zonas de recogida similares a tus vistas recientes.",
    popularAreaEyebrow: "Popular en tu zona",
    popularAreaTitle: "Lo más popular cerca de {area}.",
    popularAreaDescription:
      "CampusSwap combina guardados, vistas y confianza del vendedor para mostrar el impulso local.",
    newTodayEyebrow: "Nuevo hoy",
    newTodayTitle: "Anuncios recientes que acaban de salir.",
    newTodayDescription:
      "Inventario activo nuevo que todavía está empezando su ciclo de descubrimiento."
  },
  messages: {
    ...mutableDictionaries.es.messages,
    offers: {
      title: "Ofertas",
      description:
        "Negocia aquí sin perder el contexto real del anuncio y del intercambio.",
      noOfferYet: "Todavía no se ha enviado ninguna oferta en este intercambio.",
      latestOffer: "Última oferta",
      sentByBuyer: "Enviada por el comprador",
      sentBySeller: "Enviada por el vendedor",
      sentAt: "Enviada",
      respondedAt: "Respondida",
      expiresAt: "Caduca",
      offerAmount: "Importe de la oferta",
      counterAmount: "Importe de la contraoferta",
      makeOffer: "Hacer oferta",
      sendingOffer: "Enviando oferta...",
      counterOffer: "Enviar contraoferta",
      acceptOffer: "Aceptar oferta",
      rejectOffer: "Rechazar oferta",
      acceptCounter: "Aceptar contraoferta",
      rejectCounter: "Rechazar contraoferta",
      withdrawOffer: "Retirar oferta",
      acceptedHint:
        "El precio acordado ya está vinculado a este intercambio. Ahora puedes reservar o cerrar la venta.",
      genericError: "No se puede actualizar la oferta ahora mismo.",
      states: {
        open: "Abierta",
        countered: "Contraofertada",
        accepted: "Aceptada",
        rejected: "Rechazada",
        expired: "Caducada",
        withdrawn: "Retirada"
      }
    }
  }
};

mutableDictionaries.nl = {
  ...mutableDictionaries.nl,
  common: {
    ...mutableDictionaries.nl.common,
    exchangeStatusLabels: {
      ...mutableDictionaries.nl.common.exchangeStatusLabels,
      pending: "In afwachting",
      paid: "Betaald",
      "ready-for-pickup": "Klaar voor afhalen",
      shipped: "Verzonden",
      delivered: "Bezorgd"
    }
  },
  messages: {
    ...mutableDictionaries.nl.messages,
    exchange: {
      ...mutableDictionaries.nl.messages.exchange,
      fulfillmentMethod: "Levering",
      chooseFulfillment: "Kies levering",
      pickupOption: "Afhalen",
      shippingOption: "Verzending",
      pickupOnly: "Alleen afhalen",
      shippingOnly: "Alleen verzending",
      orderBreakdownTitle: "Besteloverzicht",
      itemPrice: "Itemprijs",
      shippingCost: "Verzending",
      platformFee: "Platformkosten",
      totalAmount: "Totaal",
      paidAt: "Betaald op",
      readyAt: "Klaar voor afhalen op",
      shippedAt: "Verzonden op",
      deliveredAt: "Bezorgd op",
      markPaid: "Markeer als betaald",
      markReadyForPickup: "Markeer als klaar voor afhalen",
      markShipped: "Markeer als verzonden",
      markDelivered: "Bevestig bezorgd",
      completeOrder: "Bestelling afronden"
    }
  },
  myListings: {
    ...mutableDictionaries.nl.myListings,
    analyticsTitle: "Advertentieprestaties",
    views: "Weergaven",
    saves: "Opslagen",
    messagesReceived: "Berichten",
    offersReceived: "Biedingen",
    fulfillmentSummary: "Levering",
    pickupLabel: "Afhalen",
    shippingLabel: "Verzending"
  },
  myPurchases: {
    ...mutableDictionaries.nl.myPurchases,
    fulfillmentMethod: "Levering",
    orderBreakdown: "Besteloverzicht",
    shippingAmount: "Verzending",
    platformFee: "Platformkosten",
    totalAmount: "Totaal",
    paidAt: "Betaald op",
    readyAt: "Klaar voor afhalen op",
    shippedAt: "Verzonden op",
    deliveredAt: "Bezorgd op"
  },
  listing: {
    ...mutableDictionaries.nl.listing,
    fulfillmentTitle: "Levering",
    pickupAvailable: "Afhalen beschikbaar",
    shippingAvailable: "Verzending beschikbaar",
    shippingCost: "Verzendkosten"
  },
  listingForm: {
    ...mutableDictionaries.nl.listingForm,
    fulfillmentTitle: "Leveringsopties",
    pickupAvailable: "Lokaal afhalen beschikbaar",
    shippingAvailable: "Verzending beschikbaar",
    shippingCostPlaceholder: "Verzendkosten",
    fulfillmentHelp:
      "Kies minstens een leveringsoptie. Kopers kunnen tussen afhalen en verzending kiezen wanneer beide beschikbaar zijn."
  }
};

mutableDictionaries.en = {
  ...mutableDictionaries.en,
  common: {
    ...mutableDictionaries.en.common,
    exchangeStatusLabels: {
      ...mutableDictionaries.en.common.exchangeStatusLabels,
      pending: "Pending",
      paid: "Paid",
      "ready-for-pickup": "Ready for pickup",
      shipped: "Shipped",
      delivered: "Delivered"
    }
  },
  messages: {
    ...mutableDictionaries.en.messages,
    exchange: {
      ...mutableDictionaries.en.messages.exchange,
      fulfillmentMethod: "Fulfillment",
      chooseFulfillment: "Choose fulfillment",
      pickupOption: "Pickup",
      shippingOption: "Shipping",
      pickupOnly: "Pickup only",
      shippingOnly: "Shipping only",
      orderBreakdownTitle: "Order breakdown",
      itemPrice: "Item price",
      shippingCost: "Shipping",
      platformFee: "Platform fee",
      totalAmount: "Total",
      paidAt: "Paid at",
      readyAt: "Ready for pickup at",
      shippedAt: "Shipped at",
      deliveredAt: "Delivered at",
      markPaid: "Mark paid",
      markReadyForPickup: "Mark ready for pickup",
      markShipped: "Mark shipped",
      markDelivered: "Confirm delivered",
      completeOrder: "Complete order"
    }
  },
  myListings: {
    ...mutableDictionaries.en.myListings,
    analyticsTitle: "Listing performance",
    views: "Views",
    saves: "Saves",
    messagesReceived: "Messages",
    offersReceived: "Offers",
    fulfillmentSummary: "Fulfillment",
    pickupLabel: "Pickup",
    shippingLabel: "Shipping"
  },
  myPurchases: {
    ...mutableDictionaries.en.myPurchases,
    fulfillmentMethod: "Fulfillment",
    orderBreakdown: "Order breakdown",
    shippingAmount: "Shipping",
    platformFee: "Platform fee",
    totalAmount: "Total",
    paidAt: "Paid at",
    readyAt: "Ready for pickup at",
    shippedAt: "Shipped at",
    deliveredAt: "Delivered at"
  },
  listing: {
    ...mutableDictionaries.en.listing,
    fulfillmentTitle: "Fulfillment",
    pickupAvailable: "Pickup available",
    shippingAvailable: "Shipping available",
    shippingCost: "Shipping cost"
  },
  listingForm: {
    ...mutableDictionaries.en.listingForm,
    fulfillmentTitle: "Fulfillment options",
    pickupAvailable: "Local pickup available",
    shippingAvailable: "Shipping available",
    shippingCostPlaceholder: "Shipping cost",
    fulfillmentHelp:
      "Choose at least one fulfillment option. Buyers can choose between pickup and shipping when both are available."
  }
};

mutableDictionaries.es = {
  ...mutableDictionaries.es,
  common: {
    ...mutableDictionaries.es.common,
    exchangeStatusLabels: {
      ...mutableDictionaries.es.common.exchangeStatusLabels,
      pending: "Pendiente",
      paid: "Pagado",
      "ready-for-pickup": "Listo para recoger",
      shipped: "Enviado",
      delivered: "Entregado"
    }
  },
  messages: {
    ...mutableDictionaries.es.messages,
    exchange: {
      ...mutableDictionaries.es.messages.exchange,
      fulfillmentMethod: "Entrega",
      chooseFulfillment: "Elegir entrega",
      pickupOption: "Recogida",
      shippingOption: "Env\u00edo",
      pickupOnly: "Solo recogida",
      shippingOnly: "Solo env\u00edo",
      orderBreakdownTitle: "Resumen del pedido",
      itemPrice: "Precio del art\u00edculo",
      shippingCost: "Env\u00edo",
      platformFee: "Tarifa de plataforma",
      totalAmount: "Total",
      paidAt: "Pagado el",
      readyAt: "Listo para recoger el",
      shippedAt: "Enviado el",
      deliveredAt: "Entregado el",
      markPaid: "Marcar como pagado",
      markReadyForPickup: "Marcar listo para recoger",
      markShipped: "Marcar como enviado",
      markDelivered: "Confirmar entrega",
      completeOrder: "Completar pedido"
    }
  },
  myListings: {
    ...mutableDictionaries.es.myListings,
    analyticsTitle: "Rendimiento del anuncio",
    views: "Vistas",
    saves: "Guardados",
    messagesReceived: "Mensajes",
    offersReceived: "Ofertas",
    fulfillmentSummary: "Entrega",
    pickupLabel: "Recogida",
    shippingLabel: "Env\u00edo"
  },
  myPurchases: {
    ...mutableDictionaries.es.myPurchases,
    fulfillmentMethod: "Entrega",
    orderBreakdown: "Resumen del pedido",
    shippingAmount: "Env\u00edo",
    platformFee: "Tarifa de plataforma",
    totalAmount: "Total",
    paidAt: "Pagado el",
    readyAt: "Listo para recoger el",
    shippedAt: "Enviado el",
    deliveredAt: "Entregado el"
  },
  listing: {
    ...mutableDictionaries.es.listing,
    fulfillmentTitle: "Entrega",
    pickupAvailable: "Recogida disponible",
    shippingAvailable: "Env\u00edo disponible",
    shippingCost: "Coste de env\u00edo"
  },
    listingForm: {
      ...mutableDictionaries.es.listingForm,
      fulfillmentTitle: "Opciones de entrega",
      pickupAvailable: "Recogida local disponible",
      shippingAvailable: "Env\u00edo disponible",
      shippingCostPlaceholder: "Coste de env\u00edo",
      fulfillmentHelp:
        "Elige al menos una opci\u00f3n de entrega. Si ambas est\u00e1n disponibles, el comprador podr\u00e1 elegir entre recogida y env\u00edo."
    }
  };

  mutableDictionaries.en = {
    ...mutableDictionaries.en,
    nav: {
      ...mutableDictionaries.en.nav,
      app: {
        ...mutableDictionaries.en.nav.app,
        support: "Support"
      }
    },
    appHome: {
      ...mutableDictionaries.en.appHome,
      featuredTitle: "Paid featured listings",
      featuredDescription:
        "Only paid and active featured placements surface here first.",
      popularAreaEyebrow: "Trending nearby",
      popularAreaTitle: "Trending around {area}.",
      popularAreaDescription:
        "Real saves, views, offers, and seller trust highlight what students nearby are acting on.",
      newTodayEyebrow: "New near you",
      newTodayTitle: "Fresh listings close to your meetup zones.",
      newTodayDescription:
        "New live inventory near your preferred area, with a wider recent fallback when today is quiet.",
      outletEyebrow: "Outlet",
      outletTitle: "Budget-friendly outlet picks.",
      outletDescription:
        "Urgent, discounted, and honest-condition listings for faster move-ins and move-outs.",
      lastChanceEyebrow: "Last chance",
      lastChanceTitle: "Latest opportunities that may move fast.",
      lastChanceDescription:
        "Urgent and high-momentum listings that deserve a quick look before they are gone."
    },
    support: {
      eyebrow: "Support center",
      title: "Resolve marketplace issues without leaving CampusSwap.",
      description:
        "Report suspicious activity, ask for help, and keep every issue tied to the real listing, seller, or order context.",
      chooseCategory: "Choose the issue type that best matches what happened.",
      contactFallback:
        "For urgent issues outside the app, you can also reach CampusSwap at {email}.",
      contextRequiredListing:
        "Open this flow from a listing so CampusSwap knows which listing to review.",
      contextRequiredUser:
        "Open this flow from a seller profile so CampusSwap knows who you are reporting.",
      openForm: "Open form",
      openListing: "Open listing",
      openConversation: "Open conversation",
      openPurchases: "Open purchases",
      openProfile: "Open profile",
      reportListingCta: "Report listing",
      reportUserCta: "Report user",
      purchaseDisputeCta: "Open dispute",
      paymentHelpCta: "Payment help",
      shippingHelpCta: "Shipping help",
      orderHelpTitle: "Need help with this order?",
      cards: {
        reportUserTitle: "Report user",
        reportUserDescription:
          "Flag suspicious, unsafe, or misleading seller behavior for moderation review.",
        reportListingTitle: "Report listing",
        reportListingDescription:
          "Report inaccurate, suspicious, or unsafe listing details from the live listing context.",
        purchaseDisputeTitle: "Purchase dispute",
        purchaseDisputeDescription:
          "Get help when the meetup, handoff, or item condition does not match what was agreed.",
        paymentHelpTitle: "Payment help",
        paymentHelpDescription:
          "Ask for help with featured payments, payment confirmations, or billing confusion.",
        shippingHelpTitle: "Shipping help",
        shippingHelpDescription:
          "Get help with shipping delays, shipping expectations, or delivery confusion."
      },
      form: {
        contextLabel: "Attached context",
        subjectLabel: "Subject",
        subjectPlaceholder: "Short summary of what you need help with",
        reportSubjectHidden: "",
        submit: "Send request",
        submitting: "Sending...",
        detailsLabel: "What happened",
        reportUserPlaceholder:
          "Tell CampusSwap what happened with this user and why it feels unsafe, misleading, or inappropriate.",
        reportListingPlaceholder:
          "Tell CampusSwap what feels inaccurate, unsafe, or suspicious about this listing.",
        purchaseDisputePlaceholder:
          "Explain what happened with the order, meetup, or item condition so CampusSwap can review the dispute.",
        paymentHelpPlaceholder:
          "Describe the payment or promotion issue you need help with.",
        shippingHelpPlaceholder:
          "Describe the shipping issue, delay, or delivery problem you need help with."
      },
      yourTicketsEyebrow: "Support tickets",
      yourTicketsTitle: "Your active support requests",
      yourTicketsDescription:
        "Track dispute, payment, and shipping requests without losing listing context.",
      noTicketsTitle: "No support tickets yet",
      noTicketsDescription:
        "When you ask CampusSwap for help, your requests will appear here with their latest status.",
      yourReportsEyebrow: "Reports",
      yourReportsTitle: "Your safety reports",
      yourReportsDescription:
        "Marketplace reports stay visible here while moderation reviews them.",
      noReportsTitle: "No reports yet",
      noReportsDescription:
        "When you report a listing or user, CampusSwap will track it here.",
      ticketStatusLabels: {
        open: "Open",
        inReview: "In review",
        resolved: "Resolved",
        closed: "Closed"
      },
      reportStatusLabels: {
        open: "Open",
        inReview: "In review",
        actioned: "Actioned",
        dismissed: "Dismissed"
      },
      targetLabels: {
        listing: "Listing",
        user: "User",
        conversation: "Conversation",
        transaction: "Transaction"
      }
    }
  };

  mutableDictionaries.es = {
    ...mutableDictionaries.es,
    nav: {
      ...mutableDictionaries.es.nav,
      app: {
        ...mutableDictionaries.es.nav.app,
        support: "Soporte"
      }
    },
    appHome: {
      ...mutableDictionaries.es.appHome,
      featuredTitle: "Anuncios destacados de pago",
      featuredDescription:
        "Aqu\u00ed solo aparecen primero los anuncios destacados realmente pagados y activos.",
      popularAreaEyebrow: "Tendencia cerca de ti",
      popularAreaTitle: "Tendencia en {area}.",
      popularAreaDescription:
        "Guardados, vistas, ofertas y confianza del vendedor muestran qu\u00e9 est\u00e1 movi\u00e9ndose de verdad en tu zona.",
      newTodayEyebrow: "Nuevo cerca de ti",
      newTodayTitle: "Anuncios recientes cerca de tus zonas de recogida.",
      newTodayDescription:
        "Inventario nuevo y activo cerca de tu zona preferida, con un respaldo reciente m\u00e1s amplio cuando hoy hay poco movimiento.",
      outletEyebrow: "Outlet",
      outletTitle: "Picks outlet para ahorrar m\u00e1s.",
      outletDescription:
        "Anuncios urgentes, rebajados y con condici\u00f3n descrita con honestidad para entrar o salir de piso m\u00e1s r\u00e1pido.",
      lastChanceEyebrow: "\u00daltima oportunidad",
      lastChanceTitle: "Oportunidades recientes que pueden volar.",
      lastChanceDescription:
        "Anuncios urgentes y con mucho movimiento que merece la pena revisar antes de que desaparezcan."
    },
    support: {
      eyebrow: "Centro de soporte",
      title: "Resuelve problemas del marketplace sin salir de CampusSwap.",
      description:
        "Denuncia actividad sospechosa, pide ayuda y mant\u00e9n cada incidencia vinculada al anuncio, vendedor o pedido real.",
      chooseCategory: "Elige el tipo de problema que mejor encaja con lo ocurrido.",
      contactFallback:
        "Si el problema es urgente fuera de la app, tambi\u00e9n puedes escribir a CampusSwap en {email}.",
      contextRequiredListing:
        "Abre este flujo desde un anuncio para que CampusSwap sepa qu\u00e9 anuncio revisar.",
      contextRequiredUser:
        "Abre este flujo desde un perfil de vendedor para que CampusSwap sepa a qui\u00e9n est\u00e1s denunciando.",
      openForm: "Abrir formulario",
      openListing: "Abrir anuncio",
      openConversation: "Abrir conversaci\u00f3n",
      openPurchases: "Abrir compras",
      openProfile: "Abrir perfil",
      reportListingCta: "Denunciar anuncio",
      reportUserCta: "Denunciar usuario",
      purchaseDisputeCta: "Abrir disputa",
      paymentHelpCta: "Ayuda con pago",
      shippingHelpCta: "Ayuda con env\u00edo",
      orderHelpTitle: "\u00bfNecesitas ayuda con este pedido?",
      cards: {
        reportUserTitle: "Denunciar usuario",
        reportUserDescription:
          "Se\u00f1ala comportamiento sospechoso, inseguro o enga\u00f1oso para que moderaci\u00f3n lo revise.",
        reportListingTitle: "Denunciar anuncio",
        reportListingDescription:
          "Denuncia detalles inexactos, sospechosos o inseguros desde el contexto real del anuncio.",
        purchaseDisputeTitle: "Disputa de compra",
        purchaseDisputeDescription:
          "Pide ayuda cuando la entrega, el meetup o el estado del producto no coincide con lo acordado.",
        paymentHelpTitle: "Ayuda con pago",
        paymentHelpDescription:
          "Pide ayuda con pagos de destacados, confirmaciones de pago o dudas de cobro.",
        shippingHelpTitle: "Ayuda con env\u00edo",
        shippingHelpDescription:
          "Pide ayuda con retrasos, expectativas de env\u00edo o confusi\u00f3n en la entrega."
      },
      form: {
        contextLabel: "Contexto vinculado",
        subjectLabel: "Asunto",
        subjectPlaceholder: "Resumen corto de lo que necesitas",
        reportSubjectHidden: "",
        submit: "Enviar solicitud",
        submitting: "Enviando...",
        detailsLabel: "Qu\u00e9 ha pasado",
        reportUserPlaceholder:
          "Cuenta a CampusSwap qu\u00e9 ha pasado con este usuario y por qu\u00e9 te parece inseguro, enga\u00f1oso o inapropiado.",
        reportListingPlaceholder:
          "Cuenta a CampusSwap qu\u00e9 te parece inexacto, inseguro o sospechoso en este anuncio.",
        purchaseDisputePlaceholder:
          "Explica qu\u00e9 ocurri\u00f3 con el pedido, el meetup o el estado del producto para que CampusSwap pueda revisar la disputa.",
        paymentHelpPlaceholder:
          "Describe el problema de pago o promoci\u00f3n con el que necesitas ayuda.",
        shippingHelpPlaceholder:
          "Describe el problema de env\u00edo, retraso o entrega con el que necesitas ayuda."
      },
      yourTicketsEyebrow: "Tickets de soporte",
      yourTicketsTitle: "Tus solicitudes activas",
      yourTicketsDescription:
        "Sigue disputas, incidencias de pago y problemas de env\u00edo sin perder el contexto del anuncio.",
      noTicketsTitle: "Todav\u00eda no hay tickets de soporte",
      noTicketsDescription:
        "Cuando pidas ayuda a CampusSwap, tus solicitudes aparecer\u00e1n aqu\u00ed con su estado m\u00e1s reciente.",
      yourReportsEyebrow: "Denuncias",
      yourReportsTitle: "Tus denuncias de seguridad",
      yourReportsDescription:
        "Las denuncias del marketplace siguen visibles aqu\u00ed mientras moderaci\u00f3n las revisa.",
      noReportsTitle: "Todav\u00eda no hay denuncias",
      noReportsDescription:
        "Cuando denuncies un anuncio o un usuario, CampusSwap lo seguir\u00e1 aqu\u00ed.",
      ticketStatusLabels: {
        open: "Abierto",
        inReview: "En revisi\u00f3n",
        resolved: "Resuelto",
        closed: "Cerrado"
      },
      reportStatusLabels: {
        open: "Abierto",
        inReview: "En revisi\u00f3n",
        actioned: "Actuado",
        dismissed: "Descartado"
      },
      targetLabels: {
        listing: "Anuncio",
        user: "Usuario",
        conversation: "Conversaci\u00f3n",
        transaction: "Transacci\u00f3n"
      }
    }
  };

  mutableDictionaries.nl = {
    ...mutableDictionaries.nl,
    nav: {
      ...mutableDictionaries.nl.nav,
      app: {
        ...mutableDictionaries.nl.nav.app,
        support: "Support"
      }
    },
    appHome: {
      ...mutableDictionaries.nl.appHome,
      featuredTitle: "Betaalde uitgelichte advertenties",
      featuredDescription:
        "Alleen echt betaalde en actieve uitgelichte advertenties komen hier eerst naar voren.",
      popularAreaEyebrow: "Trending dichtbij",
      popularAreaTitle: "Trending rond {area}.",
      popularAreaDescription:
        "Opslagen, weergaven, biedingen en verkopervertrouwen laten zien wat lokaal echt beweegt.",
      newTodayEyebrow: "Nieuw bij jou in de buurt",
      newTodayTitle: "Verse advertenties dicht bij jouw afhaalzones.",
      newTodayDescription:
        "Nieuwe actieve voorraad dicht bij jouw voorkeursgebied, met een bredere recente fallback als het vandaag rustig is.",
      outletEyebrow: "Outlet",
      outletTitle: "Outletkeuzes voor een lager budget.",
      outletDescription:
        "Dringende, afgeprijsde en eerlijk beschreven advertenties voor snellere verhuis- en vertrekmomenten.",
      lastChanceEyebrow: "Laatste kans",
      lastChanceTitle: "Recente kansen die snel kunnen verdwijnen.",
      lastChanceDescription:
        "Dringende advertenties met veel momentum die een snelle blik waard zijn."
    },
    support: {
      eyebrow: "Supportcentrum",
      title: "Los marketplaceproblemen op zonder CampusSwap te verlaten.",
      description:
        "Meld verdachte activiteit, vraag hulp en houd elke kwestie gekoppeld aan de echte advertentie, verkoper of bestelling.",
      chooseCategory: "Kies het type probleem dat het beste past bij wat er is gebeurd.",
      contactFallback:
        "Voor urgente problemen buiten de app kun je CampusSwap ook bereiken via {email}.",
      contextRequiredListing:
        "Open deze flow vanuit een advertentie zodat CampusSwap weet welke advertentie moet worden bekeken.",
      contextRequiredUser:
        "Open deze flow vanuit een verkopersprofiel zodat CampusSwap weet wie je meldt.",
      openForm: "Formulier openen",
      openListing: "Advertentie openen",
      openConversation: "Gesprek openen",
      openPurchases: "Aankopen openen",
      openProfile: "Profiel openen",
      reportListingCta: "Advertentie melden",
      reportUserCta: "Gebruiker melden",
      purchaseDisputeCta: "Geschil openen",
      paymentHelpCta: "Hulp bij betaling",
      shippingHelpCta: "Hulp bij verzending",
      orderHelpTitle: "Hulp nodig bij deze bestelling?",
      cards: {
        reportUserTitle: "Gebruiker melden",
        reportUserDescription:
          "Meld verdacht, onveilig of misleidend gedrag zodat moderatie het kan bekijken.",
        reportListingTitle: "Advertentie melden",
        reportListingDescription:
          "Meld onjuiste, verdachte of onveilige advertentiedetails vanuit de live advertentiecontext.",
        purchaseDisputeTitle: "Aankoopgeschil",
        purchaseDisputeDescription:
          "Vraag hulp wanneer de meetup, overdracht of staat van het item niet overeenkomt met wat was afgesproken.",
        paymentHelpTitle: "Hulp bij betaling",
        paymentHelpDescription:
          "Vraag hulp bij uitgelichte betalingen, betaalbevestigingen of factuurverwarring.",
        shippingHelpTitle: "Hulp bij verzending",
        shippingHelpDescription:
          "Vraag hulp bij verzendvertragingen, verzendverwachtingen of onduidelijkheid rond levering."
      },
      form: {
        contextLabel: "Gekoppelde context",
        subjectLabel: "Onderwerp",
        subjectPlaceholder: "Korte samenvatting van je hulpvraag",
        reportSubjectHidden: "",
        submit: "Verzoek versturen",
        submitting: "Versturen...",
        detailsLabel: "Wat is er gebeurd",
        reportUserPlaceholder:
          "Vertel CampusSwap wat er met deze gebruiker is gebeurd en waarom het onveilig, misleidend of ongepast voelt.",
        reportListingPlaceholder:
          "Vertel CampusSwap wat er onjuist, onveilig of verdacht voelt aan deze advertentie.",
        purchaseDisputePlaceholder:
          "Leg uit wat er is gebeurd met de bestelling, meetup of staat van het item zodat CampusSwap het geschil kan beoordelen.",
        paymentHelpPlaceholder:
          "Beschrijf het betaal- of promotieprobleem waar je hulp bij nodig hebt.",
        shippingHelpPlaceholder:
          "Beschrijf het verzendprobleem, de vertraging of de leveringskwestie waar je hulp bij nodig hebt."
      },
      yourTicketsEyebrow: "Supporttickets",
      yourTicketsTitle: "Jouw actieve supportverzoeken",
      yourTicketsDescription:
        "Volg geschillen, betaalvragen en verzendproblemen zonder de advertentiecontext kwijt te raken.",
      noTicketsTitle: "Nog geen supporttickets",
      noTicketsDescription:
        "Wanneer je CampusSwap om hulp vraagt, verschijnen je verzoeken hier met hun laatste status.",
      yourReportsEyebrow: "Meldingen",
      yourReportsTitle: "Jouw veiligheidsmeldingen",
      yourReportsDescription:
        "Marketplace-meldingen blijven hier zichtbaar terwijl moderatie ze bekijkt.",
      noReportsTitle: "Nog geen meldingen",
      noReportsDescription:
        "Wanneer je een advertentie of gebruiker meldt, volgt CampusSwap dat hier op.",
      ticketStatusLabels: {
        open: "Open",
        inReview: "In beoordeling",
        resolved: "Opgelost",
        closed: "Gesloten"
      },
      reportStatusLabels: {
        open: "Open",
        inReview: "In beoordeling",
        actioned: "Afgehandeld",
        dismissed: "Afgesloten"
      },
      targetLabels: {
        listing: "Advertentie",
        user: "Gebruiker",
        conversation: "Gesprek",
        transaction: "Transactie"
      }
    }
  };

  export function getConditionLabel(dictionary: Dictionary, condition: ListingCondition) {
  return dictionary.common.conditionLabels[condition] ?? condition;
}

export function getListingStatusLabel(dictionary: Dictionary, status: ListingStatus) {
  return dictionary.common.listingStatusLabels[status] ?? status;
}

export function getExchangeStatusLabel(dictionary: Dictionary, status: ExchangeStatus) {
  return dictionary.common.exchangeStatusLabels[status] ?? status;
}

function normalizePreferenceKey(value: string) {
  return value.toLowerCase().replace(/[^a-z]/g, "");
}

export function getNotificationPreferenceLabel(dictionary: Dictionary, value: string) {
  switch (normalizePreferenceKey(value)) {
    case "messages":
      return dictionary.common.notificationPreferenceLabels.messages;
    case "listingupdates":
      return dictionary.common.notificationPreferenceLabels.listingUpdates;
    case "savedsearches":
      return dictionary.common.notificationPreferenceLabels.savedSearches;
    case "featureddigest":
      return dictionary.common.notificationPreferenceLabels.featuredDigest;
    case "promotions":
      return dictionary.common.notificationPreferenceLabels.promotions;
    default:
      return value;
  }
}

export function getNotificationPreferenceDescription(
  dictionary: Dictionary,
  value: string
) {
  switch (normalizePreferenceKey(value)) {
    case "messages":
      return dictionary.settings.notificationDescriptions.messages;
    case "listingupdates":
      return dictionary.settings.notificationDescriptions.listingUpdates;
    case "savedsearches":
      return dictionary.settings.notificationDescriptions.savedSearches;
    case "featureddigest":
      return dictionary.settings.notificationDescriptions.featuredDigest;
    case "promotions":
      return dictionary.settings.notificationDescriptions.promotions;
    default:
      return "";
  }
}

export function getNotificationTypeLabel(
  dictionary: Dictionary,
  type: NotificationType
) {
  return dictionary.notifications.typeLabels[type] ?? type;
}

export function getLocalizedQuickAction(dictionary: Dictionary, value: string) {
  switch (value) {
    case "Is this available?":
      return dictionary.messages.quickActions.available;
    case "Can you reserve it?":
      return dictionary.messages.quickActions.reserve;
    case "Can we meet on campus?":
      return dictionary.messages.quickActions.campusMeet;
    case "Is the price negotiable?":
      return dictionary.messages.quickActions.negotiable;
    default:
      return value;
  }
}
