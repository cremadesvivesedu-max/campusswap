interface MaastrichtPickupArea {
  id: string;
  label: string;
  keywords: string[];
  markerX: number;
  markerY: number;
  meetupNote: string;
  publicMeetupPointLabel: string;
  publicMeetupPointDescription: string;
}

export interface PickupAreaResolution {
  areaId: string;
  areaLabel: string;
  areaSourceLabel: string;
  markerX: number;
  markerY: number;
  meetupNote: string;
  privacyNote: string;
  publicMeetupPointLabel: string;
  publicMeetupPointDescription: string;
}

export const maastrichtPickupAreas: MaastrichtPickupArea[] = [
  {
    id: "binnenstad",
    label: "Binnenstad",
    keywords: ["binnenstad", "university library", "law faculty", "library"],
    markerX: 47,
    markerY: 31,
    meetupNote: "Best for central faculty or library-adjacent handoffs.",
    publicMeetupPointLabel: "Vrijthof public meetup point",
    publicMeetupPointDescription:
      "A busy central square with clear foot traffic and easy access from multiple faculties."
  },
  {
    id: "jekerkwartier",
    label: "Jekerkwartier",
    keywords: ["jekerkwartier", "helpoort", "tongersestraat"],
    markerX: 36,
    markerY: 45,
    meetupNote: "Suitable for calm public pickup near Helpoort or Tongersestraat.",
    publicMeetupPointLabel: "Helpoort public meetup point",
    publicMeetupPointDescription:
      "A recognizable historic landmark that works well for calmer public handoffs."
  },
  {
    id: "wyck",
    label: "Wyck",
    keywords: ["wyck", "station side", "station", "coffeelovers"],
    markerX: 69,
    markerY: 42,
    meetupNote: "Best for station-side or bridge-adjacent public meetups.",
    publicMeetupPointLabel: "Station forecourt meetup point",
    publicMeetupPointDescription:
      "Easy to find for arriving students and useful for quick, visible station-side exchanges."
  },
  {
    id: "randwyck",
    label: "Randwyck",
    keywords: ["randwyck", "um sports", "student residence"],
    markerX: 73,
    markerY: 74,
    meetupNote: "Works well for residence, campus-edge, or sports-area pickup.",
    publicMeetupPointLabel: "Randwyck station / MECC side",
    publicMeetupPointDescription:
      "A practical public point for residence and campus-edge meetups with clear pedestrian access."
  },
  {
    id: "sint-pieter",
    label: "Sint Pieter",
    keywords: ["sint pieter", "sint-pieter", "near bus stop"],
    markerX: 26,
    markerY: 72,
    meetupNote: "Keep the meetup close to the bus stop or another visible public point.",
    publicMeetupPointLabel: "Sint Pieter public bus stop area",
    publicMeetupPointDescription:
      "A visible transit-adjacent handoff point that avoids sharing a private residential address."
  },
  {
    id: "maastricht",
    label: "Central Maastricht",
    keywords: ["maastricht"],
    markerX: 53,
    markerY: 50,
    meetupNote: "Share the exact public handoff point in chat after both sides agree.",
    publicMeetupPointLabel: "Central Maastricht meetup point",
    publicMeetupPointDescription:
      "A central public fallback that keeps the handoff zone broad until both sides confirm details in chat."
  }
];

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

export function resolvePickupArea(input: {
  pickupArea?: string;
  location?: string;
  neighborhood?: string;
}): PickupAreaResolution {
  const candidates = [input.pickupArea, input.location, input.neighborhood]
    .map(normalize)
    .filter(Boolean);

  const area =
    maastrichtPickupAreas.find((candidate) =>
      candidate.keywords.some((keyword) =>
        candidates.some((value) => value.includes(keyword))
      )
    ) ?? maastrichtPickupAreas[maastrichtPickupAreas.length - 1];

  return {
    areaId: area.id,
    areaLabel: area.label,
    areaSourceLabel:
      input.pickupArea?.trim() ||
      input.neighborhood?.trim() ||
      input.location?.trim() ||
      "Maastricht",
    markerX: area.markerX,
    markerY: area.markerY,
    meetupNote: area.meetupNote,
    privacyNote:
      "CampusSwap shows neighborhood-level meetup zones only. Exact addresses stay private until both sides confirm details in chat.",
    publicMeetupPointLabel: area.publicMeetupPointLabel,
    publicMeetupPointDescription: area.publicMeetupPointDescription
  };
}
