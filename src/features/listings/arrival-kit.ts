// "Arrival kit": what a student moving to Maastricht needs in the first week, each item
// linked to a search. Keywords cover English, Spanish and Dutch titles.
import type { AppLocale } from "@/lib/i18n-shared";
import type { Listing } from "@/types/domain";

type Localized = Record<AppLocale, string>;

export interface ArrivalKitItem {
  id: string;
  label: Localized;
  categorySlug: string;
  /** Search term used for the link (English, most listings are written in English). */
  query: string;
  keywords: string[];
}

export interface ArrivalKitGroup {
  id: string;
  title: Localized;
  items: ArrivalKitItem[];
}

export const arrivalKit: ArrivalKitGroup[] = [
  {
    id: "first-day",
    title: { en: "First day", es: "El primer día", nl: "De eerste dag" },
    items: [
      { id: "bike", label: { en: "Bike", es: "Bici", nl: "Fiets" }, categorySlug: "bikes", query: "bike", keywords: ["bike", "bici", "bicicleta", "fiets"] },
      { id: "lock", label: { en: "Bike lock", es: "Candado", nl: "Fietsslot" }, categorySlug: "bikes", query: "lock", keywords: ["lock", "candado", "slot"] },
      { id: "duvet", label: { en: "Duvet & pillow", es: "Edredón y almohada", nl: "Dekbed en kussen" }, categorySlug: "essentials-daily-living", query: "duvet", keywords: ["duvet", "pillow", "edredón", "nórdico", "almohada", "dekbed", "kussen"] },
      { id: "bedding", label: { en: "Bed sheets", es: "Sábanas", nl: "Lakens" }, categorySlug: "essentials-daily-living", query: "bedding", keywords: ["bedding", "sheets", "sábanas", "laken"] }
    ]
  },
  {
    id: "kitchen",
    title: { en: "Kitchen", es: "Cocina", nl: "Keuken" },
    items: [
      { id: "pan", label: { en: "Pans & pots", es: "Sartén y olla", nl: "Pannen" }, categorySlug: "kitchen-equipment", query: "pan", keywords: ["pan", "pot", "sartén", "olla", "koekenpan"] },
      { id: "dishes", label: { en: "Plates & cutlery", es: "Platos y cubiertos", nl: "Borden en bestek" }, categorySlug: "kitchen-equipment", query: "plates", keywords: ["plates", "cutlery", "bowls", "platos", "cubiertos", "borden", "bestek"] },
      { id: "kettle", label: { en: "Kettle", es: "Hervidor", nl: "Waterkoker" }, categorySlug: "kitchen-equipment", query: "kettle", keywords: ["kettle", "hervidor", "waterkoker"] },
      { id: "cooker", label: { en: "Rice cooker / small appliances", es: "Arrocera y pequeños electrodomésticos", nl: "Rijstkoker en kleine apparaten" }, categorySlug: "kitchen-equipment", query: "cooker", keywords: ["cooker", "toaster", "microwave", "blender", "microondas", "magnetron"] }
    ]
  },
  {
    id: "study",
    title: { en: "Study corner", es: "Para estudiar", nl: "Studeerplek" },
    items: [
      { id: "desk", label: { en: "Desk", es: "Escritorio", nl: "Bureau" }, categorySlug: "furniture", query: "desk", keywords: ["desk", "escritorio", "bureau"] },
      { id: "chair", label: { en: "Desk chair", es: "Silla", nl: "Bureaustoel" }, categorySlug: "furniture", query: "chair", keywords: ["chair", "silla", "stoel"] },
      { id: "lamp", label: { en: "Desk lamp", es: "Lámpara", nl: "Lamp" }, categorySlug: "household-items", query: "lamp", keywords: ["lamp", "lámpara", "light"] },
      { id: "monitor", label: { en: "Monitor", es: "Monitor", nl: "Monitor" }, categorySlug: "electronics", query: "monitor", keywords: ["monitor", "screen", "pantalla", "scherm"] }
    ]
  },
  {
    id: "room",
    title: { en: "Room & home", es: "Habitación y casa", nl: "Kamer en huis" },
    items: [
      { id: "storage", label: { en: "Shelves & storage", es: "Estantería y cajas", nl: "Kast en opslag" }, categorySlug: "furniture", query: "storage", keywords: ["storage", "shelf", "bookcase", "estantería", "kast"] },
      { id: "mirror", label: { en: "Mirror", es: "Espejo", nl: "Spiegel" }, categorySlug: "household-items", query: "mirror", keywords: ["mirror", "espejo", "spiegel"] },
      { id: "drying", label: { en: "Drying rack & hangers", es: "Tendedero y perchas", nl: "Wasrek en hangers" }, categorySlug: "household-items", query: "drying rack", keywords: ["drying", "laundry", "hanger", "tendedero", "percha", "wasrek"] },
      { id: "heater", label: { en: "Fan / heater", es: "Ventilador o calefactor", nl: "Ventilator of kachel" }, categorySlug: "essentials-daily-living", query: "heater", keywords: ["fan", "heater", "ventilador", "calefactor", "kachel", "ventilator"] }
    ]
  }
];

function searchableText(listing: Listing) {
  return `${listing.title} ${listing.description} ${listing.tags.join(" ")}`.toLowerCase();
}

/** How many available listings match an item (by keyword, any language). */
export function countMatches(item: ArrivalKitItem, listings: Listing[]) {
  return listings.filter((listing) => {
    if (listing.status !== "active") {
      return false;
    }
    const text = searchableText(listing);
    return item.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
  }).length;
}

export function arrivalKitSearchHref(item: ArrivalKitItem) {
  return `/app/search?q=${encodeURIComponent(item.query)}`;
}
