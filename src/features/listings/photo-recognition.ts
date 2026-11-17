// Turns what the on-device image model sees (ImageNet class names) into a
// listing proposal: a short title in the seller's language and a category.
// Pure and testable: the model itself lives in photo-classifier.ts.

export type PhotoLocale = "en" | "es" | "nl";

interface ItemKind {
  // First words of the ImageNet class name ("studio couch, day bed" → "studio couch").
  match: string[];
  category: string;
  title: Record<PhotoLocale, string>;
}

export const kinds: ItemKind[] = [
  // Bikes
  { match: ["mountain bike", "bicycle-built-for-two", "tricycle"], category: "bikes", title: { en: "Bike", es: "Bicicleta", nl: "Fiets" } },
  { match: ["moped", "motor scooter"], category: "bikes", title: { en: "Scooter", es: "Scooter", nl: "Scooter" } },
  { match: ["crash helmet"], category: "bikes", title: { en: "Helmet", es: "Casco", nl: "Helm" } },
  { match: ["padlock", "combination lock"], category: "bikes", title: { en: "Bike lock", es: "Candado de bici", nl: "Fietsslot" } },
  // Furniture
  { match: ["desk"], category: "furniture", title: { en: "Desk", es: "Escritorio", nl: "Bureau" } },
  { match: ["dining table"], category: "furniture", title: { en: "Table", es: "Mesa", nl: "Tafel" } },
  { match: ["folding chair", "rocking chair", "barber chair", "throne"], category: "furniture", title: { en: "Chair", es: "Silla", nl: "Stoel" } },
  { match: ["studio couch"], category: "furniture", title: { en: "Sofa", es: "Sofá", nl: "Bank" } },
  { match: ["four-poster", "cradle", "crib"], category: "furniture", title: { en: "Bed", es: "Cama", nl: "Bed" } },
  { match: ["wardrobe"], category: "furniture", title: { en: "Wardrobe", es: "Armario", nl: "Kledingkast" } },
  { match: ["chiffonier", "file", "china cabinet", "medicine chest"], category: "furniture", title: { en: "Cabinet", es: "Cómoda", nl: "Kast" } },
  { match: ["bookcase", "bookshop"], category: "furniture", title: { en: "Bookcase", es: "Estantería", nl: "Boekenkast" } },
  // Electronics
  { match: ["laptop", "notebook", "hand-held computer"], category: "electronics", title: { en: "Laptop", es: "Portátil", nl: "Laptop" } },
  { match: ["monitor", "screen", "desktop computer"], category: "electronics", title: { en: "Monitor", es: "Monitor", nl: "Monitor" } },
  { match: ["television", "home theater"], category: "electronics", title: { en: "TV", es: "Televisión", nl: "Tv" } },
  { match: ["computer keyboard", "typewriter keyboard"], category: "electronics", title: { en: "Keyboard", es: "Teclado", nl: "Toetsenbord" } },
  { match: ["mouse"], category: "electronics", title: { en: "Mouse", es: "Ratón", nl: "Muis" } },
  { match: ["cellular telephone", "iPod", "dial telephone"], category: "electronics", title: { en: "Phone", es: "Móvil", nl: "Telefoon" } },
  { match: ["printer", "photocopier"], category: "electronics", title: { en: "Printer", es: "Impresora", nl: "Printer" } },
  { match: ["loudspeaker", "radio", "tape player", "CD player", "cassette player"], category: "electronics", title: { en: "Speaker", es: "Altavoz", nl: "Speaker" } },
  { match: ["reflex camera", "Polaroid camera"], category: "electronics", title: { en: "Camera", es: "Cámara", nl: "Camera" } },
  { match: ["projector"], category: "electronics", title: { en: "Projector", es: "Proyector", nl: "Projector" } },
  { match: ["joystick", "remote control"], category: "electronics", title: { en: "Controller", es: "Mando", nl: "Controller" } },
  // Kitchen
  { match: ["microwave"], category: "kitchen-equipment", title: { en: "Microwave", es: "Microondas", nl: "Magnetron" } },
  { match: ["toaster"], category: "kitchen-equipment", title: { en: "Toaster", es: "Tostadora", nl: "Broodrooster" } },
  { match: ["espresso maker", "coffeepot"], category: "kitchen-equipment", title: { en: "Coffee maker", es: "Cafetera", nl: "Koffiezetapparaat" } },
  { match: ["teapot"], category: "kitchen-equipment", title: { en: "Kettle", es: "Hervidor", nl: "Waterkoker" } },
  { match: ["frying pan", "wok", "Dutch oven", "caldron", "Crock Pot"], category: "kitchen-equipment", title: { en: "Pan", es: "Sartén", nl: "Pan" } },
  { match: ["coffee mug", "cup", "plate", "mixing bowl", "soup bowl"], category: "kitchen-equipment", title: { en: "Dishes", es: "Vajilla", nl: "Servies" } },
  { match: ["waffle iron", "rotisserie", "stove"], category: "kitchen-equipment", title: { en: "Kitchen appliance", es: "Electrodoméstico de cocina", nl: "Keukenapparaat" } },
  { match: ["spatula", "ladle", "wooden spoon", "can opener", "corkscrew"], category: "kitchen-equipment", title: { en: "Kitchen utensils", es: "Utensilios de cocina", nl: "Keukengerei" } },
  { match: ["refrigerator", "dishwasher"], category: "kitchen-equipment", title: { en: "Fridge", es: "Nevera", nl: "Koelkast" } },
  // Study
  { match: ["book jacket", "comic book", "binder"], category: "textbooks-study-materials", title: { en: "Book", es: "Libro", nl: "Boek" } },
  { match: ["slide rule", "abacus"], category: "textbooks-study-materials", title: { en: "Calculator", es: "Calculadora", nl: "Rekenmachine" } },
  // Household
  { match: ["table lamp", "lampshade", "spotlight"], category: "household-items", title: { en: "Lamp", es: "Lámpara", nl: "Lamp" } },
  { match: ["vacuum"], category: "household-items", title: { en: "Vacuum cleaner", es: "Aspiradora", nl: "Stofzuiger" } },
  { match: ["pot", "vase"], category: "household-items", title: { en: "Plant pot", es: "Maceta", nl: "Bloempot" } },
  { match: ["wall clock", "analog clock", "digital clock"], category: "household-items", title: { en: "Clock", es: "Reloj", nl: "Klok" } },
  { match: ["shower curtain", "window shade", "theater curtain"], category: "household-items", title: { en: "Curtain", es: "Cortina", nl: "Gordijn" } },
  { match: ["prayer rug", "doormat"], category: "household-items", title: { en: "Rug", es: "Alfombra", nl: "Tapijt" } },
  { match: ["hamper"], category: "household-items", title: { en: "Laundry basket", es: "Cesto de la ropa", nl: "Wasmand" } },
  { match: ["washer"], category: "household-items", title: { en: "Washing machine", es: "Lavadora", nl: "Wasmachine" } },
  { match: ["acoustic guitar", "electric guitar"], category: "household-items", title: { en: "Guitar", es: "Guitarra", nl: "Gitaar" } },
  { match: ["dumbbell", "barbell"], category: "household-items", title: { en: "Weights", es: "Pesas", nl: "Gewichten" } },
  // Essentials
  { match: ["quilt"], category: "essentials-daily-living", title: { en: "Duvet", es: "Edredón", nl: "Dekbed" } },
  { match: ["pillow"], category: "essentials-daily-living", title: { en: "Pillow", es: "Almohada", nl: "Kussen" } },
  { match: ["bath towel"], category: "essentials-daily-living", title: { en: "Towels", es: "Toallas", nl: "Handdoeken" } },
  { match: ["iron"], category: "essentials-daily-living", title: { en: "Iron", es: "Plancha", nl: "Strijkijzer" } },
  { match: ["electric fan"], category: "essentials-daily-living", title: { en: "Fan", es: "Ventilador", nl: "Ventilator" } },
  { match: ["space heater", "radiator"], category: "essentials-daily-living", title: { en: "Heater", es: "Calefactor", nl: "Kachel" } },
  { match: ["backpack", "mailbag", "purse"], category: "essentials-daily-living", title: { en: "Bag", es: "Mochila", nl: "Tas" } },
  { match: ["umbrella"], category: "essentials-daily-living", title: { en: "Umbrella", es: "Paraguas", nl: "Paraplu" } },
  { match: ["sweatshirt", "jersey", "cardigan", "trench coat", "fur coat", "jean", "suit"], category: "essentials-daily-living", title: { en: "Clothes", es: "Ropa", nl: "Kleding" } },
  { match: ["running shoe", "sandal", "Loafer", "cowboy boot"], category: "essentials-daily-living", title: { en: "Shoes", es: "Zapatos", nl: "Schoenen" } }
];

export interface ModelPrediction {
  className: string;
  probability: number;
}

export interface PhotoProposal {
  title: string;
  category: string;
  confidence: number;
}

function namesOf(className: string) {
  return className.split(",").map((part) => part.trim().toLowerCase());
}

function kindFor(className: string) {
  const names = namesOf(className);
  return kinds.find((kind) => kind.match.some((match) => names.includes(match.toLowerCase())));
}

/**
 * Picks the best proposal from the model's top guesses. Probabilities of
 * guesses that land on the same item add up, so "desk" + "dining table"
 * agreeing on furniture beats one stray guess. Returns null when nothing
 * maps to something students sell or the model is too unsure.
 */
export function proposeFromPredictions(
  predictions: ModelPrediction[],
  locale: PhotoLocale,
  availableCategories: string[],
  minimumConfidence = 0.12
): PhotoProposal | null {
  const scores = new Map<ItemKind, number>();
  for (const prediction of predictions) {
    const kind = kindFor(prediction.className);
    if (kind && availableCategories.includes(kind.category)) {
      scores.set(kind, (scores.get(kind) ?? 0) + prediction.probability);
    }
  }

  let best: ItemKind | null = null;
  let bestScore = 0;
  for (const [kind, score] of scores) {
    if (score > bestScore) {
      best = kind;
      bestScore = score;
    }
  }

  if (!best || bestScore < minimumConfidence) {
    return null;
  }

  return { title: best.title[locale], category: best.category, confidence: Math.min(1, bestScore) };
}
