export const localeCookieName = "campusswap-locale";
export const supportedLocales = ["en", "es", "nl"] as const;
export type AppLocale = (typeof supportedLocales)[number];

export const dictionaries = {
  en: {
    localeLabel: "English",
    languageSwitcher: {
      label: "Language"
    },
    nav: {
      public: {
        categories: "Categories",
        featured: "Featured",
        outlet: "Outlet",
        trustSafety: "Trust & Safety",
        faq: "FAQ",
        join: "Join"
      },
      app: {
        home: "Home",
        forYou: "For You",
        search: "Search",
        saved: "Saved",
        messages: "Messages",
        settings: "Settings"
      },
      admin: {
        dashboard: "Dashboard",
        users: "Users",
        listings: "Listings",
        reports: "Reports",
        analytics: "Analytics",
        settings: "Settings"
      }
    },
    site: {
      publicTagline: "Student-first marketplace for Maastricht",
      adminTagline: "Moderation, growth, and monetization control center",
      adminLabel: "Admin",
      logIn: "Log in",
      sellItem: "Sell an item"
    },
    auth: {
      signup: {
        eyebrow: "Create account",
        title: "Create your CampusSwap account and enter the marketplace right away.",
        description:
          "Any valid email can create an account. Student verification stays available as an optional trust layer for stronger badges and safer meetup signaling.",
        namePlaceholder: "Full name",
        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "Choose a password",
        submit: "Create account",
        submitting: "Creating account...",
        domainHint:
          "Any valid email can sign up. Supported student domains for faster trust status:"
      },
      login: {
        eyebrow: "Login",
        title: "Welcome back to CampusSwap.",
        description:
          "Log in with your email and password to pick up where you left off with saved listings, messages, and meetup planning.",
        emailPlaceholder: "you@example.com",
        passwordPlaceholder: "Password",
        submit: "Log in",
        submitting: "Logging in...",
        noAccount: "No account yet?",
        createOne: "Create one"
      },
      onboarding: {
        eyebrow: "Onboarding",
        title: "Shape your feed around what you actually need in Maastricht.",
        description:
          "Category preferences, student status, and pickup areas help CampusSwap build a more useful home feed from day one. Student verification stays optional and can be handled separately.",
        notice:
          "You can finish onboarding and enter the marketplace right away. Student verification is a separate trust signal, not a blocker for using CampusSwap.",
        fullName: "Your full name",
        neighborhood: "Preferred pickup area",
        bio: "Tell buyers and sellers what you are looking for",
        preferredCategories: "Preferred categories",
        buyerIntent: "Buyer intent",
        sellerIntent: "Seller intent",
        notifications: "Notifications",
        save: "Save onboarding",
        status: {
          incoming: "Incoming",
          current: "Current",
          outgoing: "Outgoing",
          graduated: "Graduated"
        },
        notificationOptions: {
          messages: "Message updates",
          listingUpdates: "Listing updates",
          savedSearches: "Saved-search alerts",
          featuredDigest: "Featured digest"
        }
      }
    },
    search: {
      eyebrow: "Search & discovery",
      title: "Fast browsing for when you need to decide quickly.",
      description:
        "Search, filters, subcategories, and sorting all update the result set in real time so buyers can compare options without friction.",
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
      sortOptions: {
        recommended: "Recommended",
        relevance: "Relevance",
        newest: "Newest",
        priceLowHigh: "Price low-high",
        priceHighLow: "Price high-low"
      },
      trending: "Trending",
      recent: "Recent",
      results: "results",
      resultsDescription:
        "Discovery updates instantly as filters change, so buyers can move faster during move-in and move-out weeks.",
      clearAll: "Clear all filters",
      emptyTitle: "No listings match these filters yet",
      emptyDescription:
        "Try widening the price range, clearing a condition filter, or switching off featured-only to surface more CampusSwap inventory."
    },
    messages: {
      eyebrow: "Messages",
      title: "Listing-linked chat keeps the meetup context intact.",
      description:
        "Quick actions send instantly, new threads open from listing cards and detail pages, and every conversation keeps the listing and seller context visible.",
      conversationEyebrow: "Conversation",
      conversationTitle:
        "Keep pickup details, price questions, and availability in one thread.",
      conversationDescription:
        "Every message stays attached to the listing so both sides can coordinate the meetup without losing context."
    },
    myListings: {
      eyebrow: "My listings",
      title: "Manage availability, urgency, and sell-through.",
      description:
        "Listing lifecycle controls support available, reserved, sold, archived, relist, urgent, and promotion-ready states."
    },
    myPurchases: {
      eyebrow: "Purchases & exchanges",
      title: "Meetup-first transaction tracking for student resale.",
      description:
        "The MVP keeps handoff in person, but transaction data, review gating, and seller history now persist in Supabase."
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
      reservedDescription:
        "Reserved listings stay visible so buyers can understand what is already in progress.",
      soldEyebrow: "Sold items",
      soldTitle: "Recent completed exchanges.",
      soldDescription:
        "Sold listings make seller history more credible and help buyers understand what this profile successfully moves.",
      archivedEyebrow: "Archived",
      archivedTitle: "Older inventory no longer in circulation.",
      archivedDescription:
        "Archived listings are kept separate so the active profile stays clean.",
      reviewsEyebrow: "Reviews",
      reviewsTitle: "Trust signals from completed exchanges.",
      reviewsDescription: "Ratings are only collected after a transaction is completed."
    },
    listing: {
      seller: "Seller",
      safeMeetup: "Safe meetup guidance",
      ownListing:
        "This is your listing. Purchase and reservation state now stay linked to real exchange records instead of manual status toggles."
    },
    marketing: {
      home: {
        heroBadge: "Student-first in Maastricht",
        heroTitle: "Buy and sell student essentials in Maastricht without the chaos.",
        heroBody:
          "CampusSwap gives incoming students a faster setup path, outgoing students a faster sell-through path, and everyone a more trustworthy marketplace than scattered WhatsApp and Facebook threads.",
        browseItems: "Browse items",
        sellUpload: "Sell / upload product"
      },
      featured: {
        eyebrow: "Featured",
        title: "Boosted inventory stays clearly marked and student-relevant.",
        description:
          "Promoted listings appear across home, category, and search surfaces with transparent labeling and no fake scarcity."
      },
      outlet: {
        eyebrow: "Outlet",
        title:
          "The lower-price, urgent, and imperfect items that still solve real student problems.",
        description:
          "Outlet is not hidden. It is a core experience for affordability, fast clear-outs, and sustainability-minded reuse."
      },
      categories: {
        eyebrow: "Browse by category",
        title: "Organized around how students actually shop in Maastricht.",
        description:
          "From first-week essentials to fast move-out clearances, category entry points now route directly into the correct browse experience."
      }
    }
  },
  es: {
    localeLabel: "Español",
    languageSwitcher: { label: "Idioma" },
    nav: {
      public: { categories: "Categorías", featured: "Destacados", outlet: "Outlet", trustSafety: "Confianza y seguridad", faq: "Preguntas", join: "Unirse" },
      app: { home: "Inicio", forYou: "Para ti", search: "Buscar", saved: "Guardados", messages: "Mensajes", settings: "Ajustes" },
      admin: { dashboard: "Panel", users: "Usuarios", listings: "Anuncios", reports: "Reportes", analytics: "Analítica", settings: "Ajustes" }
    },
    site: {
      publicTagline: "Marketplace estudiantil para Maastricht",
      adminTagline: "Centro de control de moderación, crecimiento y monetización",
      adminLabel: "Admin",
      logIn: "Entrar",
      sellItem: "Vender un artículo"
    },
    auth: {
      signup: {
        eyebrow: "Crear cuenta",
        title: "Crea tu cuenta de CampusSwap y entra al marketplace al instante.",
        description: "Cualquier email válido puede crear una cuenta. La verificación estudiantil sigue disponible como una capa de confianza opcional.",
        namePlaceholder: "Nombre completo",
        emailPlaceholder: "tu@email.com",
        passwordPlaceholder: "Elige una contraseña",
        submit: "Crear cuenta",
        submitting: "Creando cuenta...",
        domainHint: "Cualquier email válido puede registrarse. Dominios estudiantiles compatibles para una confianza más rápida:"
      },
      login: {
        eyebrow: "Acceso",
        title: "Bienvenido de nuevo a CampusSwap.",
        description: "Inicia sesión con tu email y contraseña para continuar con tus guardados, mensajes y planes de recogida.",
        emailPlaceholder: "tu@email.com",
        passwordPlaceholder: "Contraseña",
        submit: "Entrar",
        submitting: "Entrando...",
        noAccount: "¿Aún no tienes cuenta?",
        createOne: "Crea una"
      },
      onboarding: {
        eyebrow: "Onboarding",
        title: "Ajusta tu feed a lo que realmente necesitas en Maastricht.",
        description: "Las preferencias de categoría, el estado estudiantil y las zonas de recogida ayudan a CampusSwap a construir un feed útil desde el primer día.",
        notice: "Puedes completar el onboarding y entrar al marketplace ahora mismo. La verificación estudiantil es una señal de confianza aparte, no un bloqueo.",
        fullName: "Tu nombre completo",
        neighborhood: "Zona de recogida preferida",
        bio: "Cuéntales a compradores y vendedores qué estás buscando",
        preferredCategories: "Categorías preferidas",
        buyerIntent: "Interés como comprador",
        sellerIntent: "Interés como vendedor",
        notifications: "Notificaciones",
        save: "Guardar onboarding",
        status: { incoming: "Llegando", current: "Actual", outgoing: "Saliendo", graduated: "Graduado" },
        notificationOptions: { messages: "Actualizaciones de mensajes", listingUpdates: "Actualizaciones de anuncios", savedSearches: "Alertas de búsquedas guardadas", featuredDigest: "Resumen de destacados" }
      }
    },
    search: {
      eyebrow: "Búsqueda y descubrimiento",
      title: "Explora rápido cuando necesitas decidir enseguida.",
      description: "La búsqueda, los filtros, las subcategorías y el orden actualizan los resultados en tiempo real.",
      controls: "Controles de descubrimiento",
      query: "Buscar",
      queryPlaceholder: "Busca bicis, escritorios, ropa de cama o monitores",
      categories: "Categorías",
      subcategories: "Subcategorías",
      minPrice: "Precio mínimo",
      maxPrice: "Precio máximo",
      condition: "Estado",
      outletOnly: "Solo outlet",
      featuredOnly: "Solo destacados",
      minimumSellerRating: "Valoración mínima del vendedor",
      sort: "Ordenar",
      sortOptions: { recommended: "Recomendado", relevance: "Relevancia", newest: "Más reciente", priceLowHigh: "Precio ascendente", priceHighLow: "Precio descendente" },
      trending: "Tendencias",
      recent: "Recientes",
      results: "resultados",
      resultsDescription: "El descubrimiento se actualiza al instante cuando cambian los filtros.",
      clearAll: "Limpiar filtros",
      emptyTitle: "Ningún anuncio coincide con estos filtros",
      emptyDescription: "Prueba un rango de precio más amplio o desactiva algunos filtros para ver más inventario."
    },
    messages: {
      eyebrow: "Mensajes",
      title: "El chat vinculado al anuncio mantiene el contexto de la recogida.",
      description: "Las respuestas rápidas se envían al instante y cada conversación conserva el contexto del anuncio.",
      conversationEyebrow: "Conversación",
      conversationTitle: "Mantén los detalles de recogida, precio y disponibilidad en un solo hilo.",
      conversationDescription: "Cada mensaje queda conectado al anuncio para coordinar la entrega sin perder contexto."
    },
    myListings: {
      eyebrow: "Mis anuncios",
      title: "Gestiona disponibilidad, urgencia y venta.",
      description: "Los controles del ciclo de vida admiten activo, reservado, vendido, archivado y relistado."
    },
    myPurchases: {
      eyebrow: "Compras e intercambios",
      title: "Seguimiento de transacciones centrado en recogidas presenciales.",
      description: "El MVP mantiene la entrega en persona, pero los datos de transacción y las reseñas ya persisten en Supabase."
    },
    profile: {
      activeListings: "Anuncios activos",
      reserved: "Reservados",
      soldItems: "Vendidos",
      responseRate: "Tasa de respuesta",
      activeInventoryEyebrow: "Inventario activo",
      activeInventoryTitle: "Anuncios actualmente en vivo en CampusSwap.",
      activeInventoryDescription: "Estos son los artículos en los que un comprador aún puede actuar.",
      reservedEyebrow: "Reservados",
      reservedTitle: "Artículos actualmente apartados.",
      reservedDescription: "Los anuncios reservados siguen visibles para que los compradores entiendan qué ya está en progreso.",
      soldEyebrow: "Artículos vendidos",
      soldTitle: "Intercambios completados recientes.",
      soldDescription: "Los anuncios vendidos dan más credibilidad al historial del vendedor.",
      archivedEyebrow: "Archivados",
      archivedTitle: "Inventario antiguo fuera de circulación.",
      archivedDescription: "Los anuncios archivados se separan para mantener limpio el perfil activo.",
      reviewsEyebrow: "Reseñas",
      reviewsTitle: "Señales de confianza tras intercambios completados.",
      reviewsDescription: "Las valoraciones solo se recogen después de completar una transacción."
    },
    listing: {
      seller: "Vendedor",
      safeMeetup: "Consejos para una recogida segura",
      ownListing: "Este es tu anuncio. La compra y la reserva ahora quedan ligadas a registros reales de intercambio."
    },
    marketing: {
      home: {
        heroBadge: "Pensado para estudiantes en Maastricht",
        heroTitle: "Compra y vende lo esencial para estudiantes en Maastricht sin caos.",
        heroBody: "CampusSwap da a quienes llegan una forma más rápida de instalarse y a quienes se van una forma más rápida de vender.",
        browseItems: "Ver artículos",
        sellUpload: "Vender / subir producto"
      },
      featured: {
        eyebrow: "Destacados",
        title: "El inventario promocionado sigue claramente marcado y relevante.",
        description: "Los anuncios promocionados aparecen con etiquetas transparentes y sin falsa escasez."
      },
      outlet: {
        eyebrow: "Outlet",
        title: "Los artículos más baratos, urgentes o imperfectos que siguen resolviendo necesidades reales.",
        description: "Outlet no está escondido. Es una experiencia central para la asequibilidad y la reutilización."
      },
      categories: {
        eyebrow: "Explorar por categoría",
        title: "Organizado según cómo compran realmente los estudiantes en Maastricht.",
        description: "Desde esenciales para la primera semana hasta vaciados rápidos de mudanza, las categorías llevan al browse correcto."
      }
    }
  },
  nl: {
    localeLabel: "Nederlands",
    languageSwitcher: { label: "Taal" },
    nav: {
      public: { categories: "Categorieën", featured: "Uitgelicht", outlet: "Outlet", trustSafety: "Vertrouwen en veiligheid", faq: "FAQ", join: "Meedoen" },
      app: { home: "Home", forYou: "Voor jou", search: "Zoeken", saved: "Opgeslagen", messages: "Berichten", settings: "Instellingen" },
      admin: { dashboard: "Dashboard", users: "Gebruikers", listings: "Advertenties", reports: "Meldingen", analytics: "Analytics", settings: "Instellingen" }
    },
    site: {
      publicTagline: "Studentgerichte marktplaats voor Maastricht",
      adminTagline: "Controlecentrum voor moderatie, groei en monetisatie",
      adminLabel: "Admin",
      logIn: "Inloggen",
      sellItem: "Artikel verkopen"
    },
    auth: {
      signup: {
        eyebrow: "Account maken",
        title: "Maak je CampusSwap-account aan en ga direct de marktplaats op.",
        description: "Elk geldig e-mailadres kan een account aanmaken. Studentenverificatie blijft beschikbaar als optionele vertrouwenslaag.",
        namePlaceholder: "Volledige naam",
        emailPlaceholder: "jij@voorbeeld.com",
        passwordPlaceholder: "Kies een wachtwoord",
        submit: "Account maken",
        submitting: "Account wordt gemaakt...",
        domainHint: "Elk geldig e-mailadres kan zich aanmelden. Ondersteunde studentdomeinen voor snellere vertrouwensstatus:"
      },
      login: {
        eyebrow: "Inloggen",
        title: "Welkom terug bij CampusSwap.",
        description: "Log in met je e-mailadres en wachtwoord om verder te gaan met opgeslagen advertenties, berichten en afspreken.",
        emailPlaceholder: "jij@voorbeeld.com",
        passwordPlaceholder: "Wachtwoord",
        submit: "Inloggen",
        submitting: "Bezig met inloggen...",
        noAccount: "Nog geen account?",
        createOne: "Maak er een"
      },
      onboarding: {
        eyebrow: "Onboarding",
        title: "Stem je feed af op wat je echt nodig hebt in Maastricht.",
        description: "Categorievoorkeuren, studentenstatus en ophaalzones helpen CampusSwap vanaf dag één nuttiger te zijn.",
        notice: "Je kunt onboarding afronden en meteen de marktplaats in. Studentenverificatie is een aparte vertrouwenslaag, geen blokkade.",
        fullName: "Je volledige naam",
        neighborhood: "Voorkeursophaalgebied",
        bio: "Vertel kopers en verkopers waar je naar zoekt",
        preferredCategories: "Voorkeurscategorieën",
        buyerIntent: "Kopersintentie",
        sellerIntent: "Verkopersintentie",
        notifications: "Meldingen",
        save: "Onboarding opslaan",
        status: { incoming: "Nieuw in Maastricht", current: "Huidig", outgoing: "Vertrekkend", graduated: "Afgestudeerd" },
        notificationOptions: { messages: "Berichtupdates", listingUpdates: "Advertentie-updates", savedSearches: "Meldingen voor opgeslagen zoekopdrachten", featuredDigest: "Uitgelichte digest" }
      }
    },
    search: {
      eyebrow: "Zoeken en ontdekken",
      title: "Snel browsen wanneer je snel moet beslissen.",
      description: "Zoeken, filters, subcategorieën en sorteren werken de resultaten direct bij.",
      controls: "Ontdekkingsfilters",
      query: "Zoeken",
      queryPlaceholder: "Zoek fietsen, bureaus, beddengoed of monitoren",
      categories: "Categorieën",
      subcategories: "Subcategorieën",
      minPrice: "Min. prijs",
      maxPrice: "Max. prijs",
      condition: "Conditie",
      outletOnly: "Alleen outlet",
      featuredOnly: "Alleen uitgelicht",
      minimumSellerRating: "Minimale verkopersscore",
      sort: "Sorteren",
      sortOptions: { recommended: "Aanbevolen", relevance: "Relevantie", newest: "Nieuwste", priceLowHigh: "Prijs laag-hoog", priceHighLow: "Prijs hoog-laag" },
      trending: "Trending",
      recent: "Recent",
      results: "resultaten",
      resultsDescription: "Ontdekking werkt direct bij wanneer filters veranderen.",
      clearAll: "Alle filters wissen",
      emptyTitle: "Geen advertenties die bij deze filters passen",
      emptyDescription: "Probeer een ruimer prijsbereik of schakel een filter uit om meer aanbod te zien."
    },
    messages: {
      eyebrow: "Berichten",
      title: "Advertentiegekoppelde chat houdt de afhaalcontext intact.",
      description: "Snelle antwoorden worden direct verstuurd en elke conversatie bewaart de advertentiecontext.",
      conversationEyebrow: "Conversatie",
      conversationTitle: "Houd afhaalafspraken, prijsvragen en beschikbaarheid in één thread.",
      conversationDescription: "Elk bericht blijft gekoppeld aan de advertentie zodat beide kanten zonder contextverlies kunnen afspreken."
    },
    myListings: {
      eyebrow: "Mijn advertenties",
      title: "Beheer beschikbaarheid, urgentie en verkoop.",
      description: "Levenscycluscontroles ondersteunen actief, gereserveerd, verkocht, gearchiveerd en opnieuw plaatsen."
    },
    myPurchases: {
      eyebrow: "Aankopen en transacties",
      title: "Transactievolging met fysieke overdracht als uitgangspunt.",
      description: "De MVP houdt de overdracht fysiek, maar transactiegegevens en review-gating staan nu in Supabase."
    },
    profile: {
      activeListings: "Actieve advertenties",
      reserved: "Gereserveerd",
      soldItems: "Verkochte items",
      responseRate: "Reactiesnelheid",
      activeInventoryEyebrow: "Actieve voorraad",
      activeInventoryTitle: "Advertenties die nu live staan op CampusSwap.",
      activeInventoryDescription: "Dit zijn de items waar een koper nu nog op kan reageren.",
      reservedEyebrow: "Gereserveerd",
      reservedTitle: "Items die momenteel in de wacht staan.",
      reservedDescription: "Gereserveerde advertenties blijven zichtbaar zodat kopers zien wat al loopt.",
      soldEyebrow: "Verkochte items",
      soldTitle: "Recente afgeronde transacties.",
      soldDescription: "Verkochte advertenties maken het verkopersprofiel geloofwaardiger.",
      archivedEyebrow: "Gearchiveerd",
      archivedTitle: "Oudere voorraad die niet meer circuleert.",
      archivedDescription: "Gearchiveerde advertenties blijven apart zodat het actieve profiel overzichtelijk blijft.",
      reviewsEyebrow: "Reviews",
      reviewsTitle: "Vertrouwenssignalen uit afgeronde transacties.",
      reviewsDescription: "Beoordelingen worden pas verzameld nadat een transactie is afgerond."
    },
    listing: {
      seller: "Verkoper",
      safeMeetup: "Veilige afhaalrichtlijnen",
      ownListing: "Dit is jouw advertentie. Koop- en reserveringsstatus zijn nu gekoppeld aan echte transactieregels."
    },
    marketing: {
      home: {
        heroBadge: "Studentgericht in Maastricht",
        heroTitle: "Koop en verkoop studentenspullen in Maastricht zonder chaos.",
        heroBody: "CampusSwap geeft nieuwe studenten een snellere opstart en vertrekkende studenten een snellere verkoop, met meer vertrouwen dan losse WhatsApp- en Facebook-groepen.",
        browseItems: "Items bekijken",
        sellUpload: "Verkopen / product uploaden"
      },
      featured: {
        eyebrow: "Uitgelicht",
        title: "Gepromoot aanbod blijft duidelijk gelabeld en relevant voor studenten.",
        description: "Gepromote advertenties verschijnen transparant op home-, categorie- en zoekpagina’s."
      },
      outlet: {
        eyebrow: "Outlet",
        title: "Goedkopere, urgente en imperfecte items die nog steeds echte studentproblemen oplossen.",
        description: "Outlet is niet verstopt. Het is een kernervaring voor betaalbaarheid en hergebruik."
      },
      categories: {
        eyebrow: "Bladeren per categorie",
        title: "Georganiseerd rond hoe studenten in Maastricht echt winkelen.",
        description: "Van eerste-week essentials tot snelle verhuizing-opruimingen: categorieën sturen direct naar de juiste browse-ervaring."
      }
    }
  }
} as const;

export type Dictionary = (typeof dictionaries)[AppLocale];
