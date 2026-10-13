// Guesses a category from the listing title so sellers rarely have to pick one.
// Keywords cover the three app languages (English, Spanish, Dutch).

const categoryKeywords: Record<string, string[]> = {
  bikes: ["bike", "bicycle", "fiets", "bici", "bicicleta", "e-bike", "helmet", "casco", "helm", "bike lock", "fietsslot"],
  furniture: [
    "desk", "chair", "table", "sofa", "couch", "bed", "mattress", "wardrobe", "closet", "shelf", "bookcase",
    "escritorio", "silla", "mesa", "sofá", "cama", "colchón", "armario", "estantería",
    "bureau", "stoel", "tafel", "bank", "matras", "kast", "boekenkast"
  ],
  electronics: [
    "monitor", "screen", "laptop", "macbook", "ipad", "tablet", "phone", "iphone", "headphones", "earbuds",
    "speaker", "keyboard", "mouse", "printer", "router", "camera", "charger", "hdmi", "tv",
    "pantalla", "portátil", "portatil", "auriculares", "altavoz", "teclado", "ratón", "impresora", "cargador",
    "scherm", "koptelefoon", "toetsenbord", "muis", "oplader"
  ],
  "kitchen-equipment": [
    "pan", "pot", "kettle", "toaster", "microwave", "rice cooker", "blender", "cutlery", "plates", "mug", "kitchen",
    "sartén", "olla", "hervidor", "tostadora", "microondas", "cubiertos", "platos", "taza", "cocina",
    "koekenpan", "waterkoker", "magnetron", "bestek", "borden", "keuken"
  ],
  "textbooks-study-materials": [
    "book", "textbook", "notes", "summary", "course", "calculator",
    "libro", "apuntes", "resumen", "calculadora",
    "boek", "studieboek", "samenvatting", "rekenmachine"
  ],
  "household-items": [
    "lamp", "light", "mirror", "rug", "carpet", "curtain", "plant", "vacuum", "hanger", "laundry", "decor",
    "lámpara", "espejo", "alfombra", "cortina", "planta", "aspiradora", "percha",
    "spiegel", "tapijt", "gordijn", "stofzuiger", "wasrek"
  ],
  "essentials-daily-living": [
    "duvet", "pillow", "bedding", "sheets", "blanket", "towel", "iron", "fan", "heater",
    "edredón", "nórdico", "almohada", "sábanas", "manta", "toalla", "plancha", "ventilador", "calefactor",
    "dekbed", "kussen", "laken", "deken", "handdoek", "strijkijzer", "ventilator", "kachel"
  ]
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Returns the slug of the best-matching category among `availableSlugs`, or null.
 * Longer keyword hits win so "rice cooker" beats a stray "pot".
 */
export function suggestCategory(title: string, availableSlugs: string[]) {
  const text = ` ${normalize(title).replace(/[^a-z0-9\s-]/g, " ")} `;
  if (!text.trim()) {
    return null;
  }

  let best: { slug: string; score: number } | null = null;

  for (const slug of availableSlugs) {
    const keywords = categoryKeywords[slug] ?? [];
    let score = 0;
    for (const keyword of keywords) {
      const needle = normalize(keyword);
      // Whole words, allowing a plural "s"/"es"/"en" ending.
      const pattern = new RegExp(`\\s${needle.replace(/[-]/g, "\\-")}(s|es|en)?\\s`);
      if (pattern.test(text)) {
        score += needle.length;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { slug, score };
    }
  }

  return best?.slug ?? null;
}

/** "60-220" → { min: 60, max: 220 }; anything unparsable → null. */
export function parsePriceRange(range: string | undefined) {
  const match = range?.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  if (!match) {
    return null;
  }
  return { min: Number(match[1]), max: Number(match[2]) };
}
