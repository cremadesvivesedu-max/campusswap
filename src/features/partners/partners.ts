// Local shops that give CampusSwap students a deal. A partner stays out of the
// site navigation and search engines until `listed` is true, but its page still
// opens from a direct link, so the shop can check it before going live.
import type { AppLocale } from "@/lib/i18n-shared";

type Localized = Record<AppLocale, string>;

export interface Partner {
  slug: string;
  name: string;
  listed: boolean;
  promoCode: string;
  category: Localized;
  headline: Localized;
  perks: Localized[];
  address: string;
  mapsUrl: string;
  websiteUrl: string;
  // Logo in /public and the shop's own brand colour, used for its banner.
  logo: string;
  brandColor: string;
}

export const partners: Partner[] = [
  {
    slug: "thephonelab",
    name: "ThePhoneLab Maastricht",
    // Riny confirmed the offer on 3/11/2026.
    listed: true,
    promoCode: "CAMPUSLAB",
    category: {
      en: "Phone, tablet and laptop repair",
      es: "Reparación de móviles, tablets y portátiles",
      nl: "Reparatie van telefoons, tablets en laptops"
    },
    headline: {
      en: "A free screen protector and €20 off your repair",
      es: "Protector de pantalla gratis y 20 € de descuento en tu reparación",
      nl: "Gratis screenprotector en €20 korting op je reparatie"
    },
    perks: [
      {
        en: "Free mobile skin / screen protector, worth €35, with your repair",
        es: "Protector de pantalla gratis, valorado en 35 €, con tu reparación",
        nl: "Gratis mobile skin / screenprotector, t.w.v. €35, bij je reparatie"
      },
      {
        en: "€20 student discount on the repair, for example a new battery",
        es: "20 € de descuento para estudiantes en la reparación, por ejemplo una batería nueva",
        nl: "€20 studentenkorting op de reparatie, bijvoorbeeld een nieuwe batterij"
      }
    ],
    address: "Wycker Brugstraat 58, 6221 ED Maastricht",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Wycker+Brugstraat+58+Maastricht",
    websiteUrl: "https://www.thephonelab.nl/",
    // Official logo from thephonelab.nl (the agreement includes showing it in the app).
    logo: "/partners/thephonelab.svg",
    brandColor: "#E82429"
  }
];

export const partnerCopy: Record<
  AppLocale,
  {
    eyebrow: string;
    title: string;
    description: string;
    empty: string;
    seeDeal: string;
    codeLabel: string;
    howTo: string;
    visit: string;
    website: string;
    directions: string;
    all: string;
    badge: string;
    copy: string;
    copied: string;
    stepsTitle: string;
    steps: [string, string, string];
    bannerLabel: string;
  }
> = {
  en: {
    eyebrow: "Student deals",
    title: "Local deals for CampusSwap students",
    description: "Shops in Maastricht that give you something extra. Show the code in store.",
    empty: "The first deals are coming soon.",
    seeDeal: "See the deal",
    codeLabel: "Your code",
    howTo: "Show this code in store before you pay.",
    visit: "Where to go",
    website: "Website",
    directions: "Directions",
    all: "All student deals",
    badge: "Official partner",
    copy: "Copy code",
    copied: "Copied",
    stepsTitle: "How it works",
    steps: [
      "Go to the shop with your phone, tablet or laptop.",
      "Show the code before you pay.",
      "Get the deal on your repair."
    ],
    bannerLabel: "New partner"
  },
  es: {
    eyebrow: "Ofertas para estudiantes",
    title: "Ofertas locales para estudiantes de CampusSwap",
    description: "Tiendas de Maastricht que te dan algo extra. Enseña el código en la tienda.",
    empty: "Las primeras ofertas llegan pronto.",
    seeDeal: "Ver la oferta",
    codeLabel: "Tu código",
    howTo: "Enseña este código en la tienda antes de pagar.",
    visit: "Dónde está",
    website: "Web",
    directions: "Cómo llegar",
    all: "Todas las ofertas",
    badge: "Partner oficial",
    copy: "Copiar código",
    copied: "Copiado",
    stepsTitle: "Cómo funciona",
    steps: [
      "Ve a la tienda con tu móvil, tablet o portátil.",
      "Enseña el código antes de pagar.",
      "Llévate la oferta con tu reparación."
    ],
    bannerLabel: "Nuevo partner"
  },
  nl: {
    eyebrow: "Studentendeals",
    title: "Lokale deals voor CampusSwap-studenten",
    description: "Winkels in Maastricht die je iets extra's geven. Laat de code zien in de winkel.",
    empty: "De eerste deals komen eraan.",
    seeDeal: "Bekijk de deal",
    codeLabel: "Jouw code",
    howTo: "Laat deze code zien in de winkel voordat je betaalt.",
    visit: "Waar je moet zijn",
    website: "Website",
    directions: "Routebeschrijving",
    all: "Alle studentendeals",
    badge: "Officiële partner",
    copy: "Code kopiëren",
    copied: "Gekopieerd",
    stepsTitle: "Zo werkt het",
    steps: [
      "Ga naar de winkel met je telefoon, tablet of laptop.",
      "Laat de code zien voordat je betaalt.",
      "Krijg de deal bij je reparatie."
    ],
    bannerLabel: "Nieuwe partner"
  }
};

export const listedPartners = partners.filter((partner) => partner.listed);

export function getPartner(slug: string) {
  return partners.find((partner) => partner.slug === slug);
}
