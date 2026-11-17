import { IMAGENET_CLASSES } from "@tensorflow-models/mobilenet/dist/imagenet_classes";
import { kinds, proposeFromPredictions } from "@/features/listings/photo-recognition";

const categories = [
  "bikes",
  "furniture",
  "electronics",
  "kitchen-equipment",
  "textbooks-study-materials",
  "household-items",
  "essentials-daily-living"
];

describe("photo recognition", () => {
  it("only matches names the model can actually output", () => {
    const names = new Set(
      Object.values(IMAGENET_CLASSES as Record<number, string>).flatMap((className) =>
        className.split(",").map((part) => part.trim().toLowerCase())
      )
    );
    const unknown = kinds.flatMap((kind) => kind.match).filter((match) => !names.has(match.toLowerCase()));
    expect(unknown).toEqual([]);
  });

  it("proposes a title in the seller's language and a category", () => {
    const proposal = proposeFromPredictions(
      [
        { className: "desk", probability: 0.4 },
        { className: "dining table, board", probability: 0.1 }
      ],
      "es",
      categories
    );
    expect(proposal).toMatchObject({ title: "Escritorio", category: "furniture" });
  });

  it("adds up guesses that agree on the same item", () => {
    const proposal = proposeFromPredictions(
      [
        { className: "laptop, laptop computer", probability: 0.2 },
        { className: "notebook, notebook computer", probability: 0.2 },
        { className: "desk", probability: 0.3 }
      ],
      "nl",
      categories
    );
    expect(proposal).toMatchObject({ title: "Laptop", category: "electronics" });
  });

  it("stays quiet when unsure or when the item is not something students sell", () => {
    expect(proposeFromPredictions([{ className: "desk", probability: 0.05 }], "en", categories)).toBeNull();
    expect(proposeFromPredictions([{ className: "tabby, tabby cat", probability: 0.9 }], "en", categories)).toBeNull();
  });

  it("ignores categories the marketplace does not have", () => {
    expect(proposeFromPredictions([{ className: "mountain bike, all-terrain bike", probability: 0.9 }], "en", ["furniture"])).toBeNull();
  });
});
