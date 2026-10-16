// Public pages people find on Google ("second hand bike Maastricht"). Written in English
// because that is what international students search in.

export interface CategoryLanding {
  slug: string;
  categorySlug: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  tips: string[];
  faq: { question: string; answer: string }[];
}

export const categoryLandings: CategoryLanding[] = [
  {
    slug: "second-hand-bikes",
    categorySlug: "bikes",
    title: "Second-hand bikes in Maastricht for students",
    h1: "Second-hand bikes in Maastricht",
    description:
      "Cheap used bikes from students leaving Maastricht. City bikes, locks and helmets — chat with the seller and meet at a safe public spot.",
    intro:
      "A bike is the first thing most students need in Maastricht. Students who are leaving sell theirs here, usually with a lock, for a fraction of the price of a new one.",
    tips: [
      "Ask for the frame number and check it on stopheling.nl (the Dutch stolen-bike register) before you pay.",
      "Test the brakes, the lights and the gears — Dutch police fine bikes without lights after dark.",
      "Two locks are normal in Maastricht: a frame lock plus a chain to fix the bike to something."
    ],
    faq: [
      {
        question: "How much does a second-hand bike cost in Maastricht?",
        answer: "Most student city bikes sell for €50–€120, depending on the brand, the gears and whether a good lock is included."
      },
      {
        question: "Where should we meet to hand over a bike?",
        answer: "A busy public place like Vrijthof, Markt or the station square. You can propose one in the CampusSwap chat in one tap."
      }
    ]
  },
  {
    slug: "second-hand-furniture",
    categorySlug: "furniture",
    title: "Cheap second-hand furniture in Maastricht",
    h1: "Second-hand furniture in Maastricht",
    description:
      "Desks, chairs, beds and shelves from students moving out of Maastricht. Furnish your student room for less and pick up nearby.",
    intro:
      "Every summer and winter students leave Maastricht with rooms full of furniture they cannot take home. Desks, chairs, bed frames and shelves end up here for a few euros.",
    tips: [
      "Measure your room and the stairs first — Maastricht student houses are known for narrow staircases.",
      "Ask whether the seller can help carry it down or knows a friend with a car or bakfiets.",
      "Moving-out sales are best in late June, July and January: that is when most rooms empty."
    ],
    faq: [
      {
        question: "How do I move furniture without a car?",
        answer: "Many students borrow a bakfiets (cargo bike) or rent a van for a few hours. Ask the seller — they often know someone."
      },
      {
        question: "Is it cheaper than IKEA?",
        answer: "Usually by 50–80%. A student desk that costs €80 new often sells for €15–€30 here."
      }
    ]
  },
  {
    slug: "second-hand-electronics",
    categorySlug: "electronics",
    title: "Used electronics in Maastricht: monitors, laptops, headphones",
    h1: "Used electronics in Maastricht",
    description:
      "Monitors, laptops, headphones and chargers from other students in Maastricht. Test before you buy at a safe meetup spot.",
    intro:
      "Study setups change every year: monitors, keyboards and headphones get sold when people graduate or upgrade.",
    tips: [
      "Always test the device at the meetup — switch it on, check the screen and the charger.",
      "Be careful with prices that look far too low for phones or laptops: that is how most scams start.",
      "Never pay in advance or by bank transfer to someone you have not met. Pay in person or through CampusSwap."
    ],
    faq: [
      {
        question: "How do I avoid scams when buying a phone or laptop?",
        answer: "Meet in a public place, test it, and do not pay before you have seen it. CampusSwap holds back listings with suspicious prices for a check."
      },
      {
        question: "Can I get it shipped?",
        answer: "Some sellers offer shipping. Paying through CampusSwap keeps the money safe until you confirm the parcel arrived."
      }
    ]
  },
  {
    slug: "student-kitchen-essentials",
    categorySlug: "kitchen-equipment",
    title: "Second-hand kitchen stuff for students in Maastricht",
    h1: "Kitchen essentials for your student room",
    description:
      "Pans, pots, kettles, plates and cutlery from students leaving Maastricht. Start cooking in your first week for a few euros.",
    intro:
      "Shared kitchens in Maastricht rarely come equipped. Departing students sell complete starter sets so you do not have to buy everything new.",
    tips: [
      "Look for bundles — a pan, a pot, plates and cutlery together is cheaper than buying one by one.",
      "Check whether your house already shares a kettle, toaster or microwave before buying one.",
      "Wash second-hand kitchenware once before use and you are good to go."
    ],
    faq: [
      {
        question: "What do I need for a student kitchen?",
        answer: "A frying pan, a pot, a chopping board, a sharp knife, two plates, two bowls, cutlery and a mug. That covers the first month."
      }
    ]
  },
  {
    slug: "student-room-essentials",
    categorySlug: "essentials-daily-living",
    title: "Duvets, bedding and room essentials in Maastricht",
    h1: "Bedding and room essentials in Maastricht",
    description:
      "Duvets, pillows, lamps, fans and heaters for your student room in Maastricht, from students who are moving out.",
    intro:
      "Arriving with one suitcase? Duvets, pillows, lamps and heaters are the things every new student needs on night one.",
    tips: [
      "Duvets in the Netherlands come in 140×200 (single) and 200×200 (double) — check your bed size.",
      "Winters are damp: a small heater or a good duvet makes a big difference in older houses.",
      "Ask the seller whether bedding was washed — most students say so in the listing."
    ],
    faq: [
      {
        question: "What size duvet do I need in the Netherlands?",
        answer: "Most student beds are 90×200, which takes a 140×200 single duvet."
      }
    ]
  },
  {
    slug: "used-textbooks",
    categorySlug: "textbooks-study-materials",
    title: "Used textbooks and study materials in Maastricht",
    h1: "Used textbooks in Maastricht",
    description:
      "Course books, summaries and calculators from Maastricht University and Zuyd students. Buy last year's books for much less.",
    intro:
      "Course books are expensive and often used for one period. Students from the year above sell theirs, sometimes with notes and summaries.",
    tips: [
      "Check the edition your course asks for — older editions are often fine but not always.",
      "Search by course code as well as title; many sellers include it.",
      "Sell your books right after the exam, when the next group is buying."
    ],
    faq: [
      {
        question: "Can I sell my summaries?",
        answer: "Your own notes and summaries are fine to sell. Do not sell copies of copyrighted books or course material."
      }
    ]
  }
];

export function getCategoryLanding(slug: string) {
  return categoryLandings.find((landing) => landing.slug === slug);
}
