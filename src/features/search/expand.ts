// Search across English, Spanish and Dutch, forgiving small typos: "bici", "fiets" and
// "bike" find the same listings, and "escritrio" still finds a desk.

const synonymGroups: string[][] = [
  ["bike", "bicycle", "bici", "bicicleta", "fiets", "ebike", "e-bike"],
  ["lock", "candado", "slot", "fietsslot"],
  ["helmet", "casco", "helm"],
  ["desk", "escritorio", "bureau"],
  ["chair", "silla", "stoel"],
  ["table", "mesa", "tafel"],
  ["sofa", "couch", "sofá", "bank"],
  ["bed", "cama", "bedframe"],
  ["mattress", "colchon", "colchón", "matras"],
  ["wardrobe", "closet", "armario", "kledingkast", "kast"],
  ["shelf", "shelves", "bookcase", "estanteria", "estantería", "boekenkast", "plank"],
  ["lamp", "lampara", "lámpara", "light", "luz"],
  ["mirror", "espejo", "spiegel"],
  ["rug", "carpet", "alfombra", "tapijt", "kleed"],
  ["curtain", "cortina", "gordijn"],
  ["plant", "planta"],
  ["vacuum", "aspiradora", "stofzuiger"],
  ["monitor", "screen", "pantalla", "scherm"],
  ["laptop", "portatil", "portátil", "notebook", "macbook"],
  ["phone", "smartphone", "iphone", "movil", "móvil", "telefono", "teléfono", "telefoon"],
  ["headphones", "earbuds", "auriculares", "cascos", "koptelefoon", "airpods"],
  ["speaker", "altavoz", "luidspreker", "boxen"],
  ["keyboard", "teclado", "toetsenbord"],
  ["mouse", "raton", "ratón", "muis"],
  ["printer", "impresora"],
  ["charger", "cargador", "oplader"],
  ["pan", "sarten", "sartén", "koekenpan"],
  ["pot", "olla", "kookpan"],
  ["kettle", "hervidor", "waterkoker"],
  ["toaster", "tostadora", "broodrooster"],
  ["microwave", "microondas", "magnetron"],
  ["plate", "plato", "bord"],
  ["cutlery", "cubiertos", "bestek"],
  ["mug", "cup", "taza", "mok", "beker"],
  ["duvet", "comforter", "edredon", "edredón", "nordico", "nórdico", "dekbed"],
  ["pillow", "almohada", "kussen"],
  ["sheets", "bedding", "sabanas", "sábanas", "laken", "beddengoed"],
  ["blanket", "manta", "deken"],
  ["towel", "toalla", "handdoek"],
  ["fan", "ventilador", "ventilator"],
  ["heater", "calefactor", "estufa", "kachel"],
  ["iron", "plancha", "strijkijzer"],
  ["book", "textbook", "libro", "boek", "studieboek"],
  ["notes", "summary", "apuntes", "resumen", "samenvatting"],
  ["calculator", "calculadora", "rekenmachine"],
  ["backpack", "mochila", "rugzak"],
  ["bag", "bolso", "tas"],
  ["jacket", "coat", "chaqueta", "abrigo", "jas"],
  ["kitchen", "cocina", "keuken"],
  ["lights", "luces", "lampjes", "verlichting"]
];

const stopWords = new Set([
  "a", "an", "the", "for", "and", "with", "of", "in", "to",
  "el", "la", "los", "las", "un", "una", "de", "del", "y", "con", "para", "en",
  "de", "het", "een", "en", "met", "voor", "van"
]);

export function normalizeWord(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const groupByWord = new Map<string, string[]>();
for (const group of synonymGroups) {
  for (const word of group) {
    groupByWord.set(normalizeWord(word), group);
  }
}
const vocabulary = [...groupByWord.keys()];

/** Edit distance with adjacent swaps (Damerau–Levenshtein, optimal string alignment). */
export function editDistance(a: string, b: string) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const d: number[][] = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

function findGroup(word: string) {
  const exact = groupByWord.get(word) ?? groupByWord.get(word.replace(/(es|s)$/, ""));
  if (exact) return exact;
  if (word.length < 4) return undefined;

  const allowed = word.length >= 7 ? 2 : 1;
  let best: { group: string[]; distance: number } | undefined;
  for (const candidate of vocabulary) {
    if (Math.abs(candidate.length - word.length) > allowed) continue;
    const distance = editDistance(word, candidate);
    if (distance <= allowed && (!best || distance < best.distance)) {
      best = { group: groupByWord.get(candidate)!, distance };
    }
  }
  return best?.group;
}

/**
 * One list of alternatives per word the person typed. A listing matches when, for every
 * word, at least one of its alternatives appears in the title or description.
 */
export function expandSearchQuery(query: string, maxWords = 5): string[][] {
  const words = normalizeWord(query)
    .split(/[^a-z0-9-]+/)
    .filter((word) => word.length >= 2 && !stopWords.has(word))
    .slice(0, maxWords);

  return words.map((word) => {
    const group = findGroup(word);
    const alternatives = new Set<string>([word]);
    for (const term of group ?? []) {
      alternatives.add(term);
      alternatives.add(normalizeWord(term));
    }
    return [...alternatives];
  });
}

/** Text safe to put inside a PostgREST ilike pattern in an or() filter. */
export function sanitizeSearchTerm(term: string) {
  return term.replace(/[,()%_*\\"'.:]/g, "").trim();
}

export function matchesExpandedQuery(text: string, groups: string[][]) {
  const haystack = normalizeWord(text);
  return groups.every((alternatives) => alternatives.some((term) => haystack.includes(normalizeWord(term))));
}
