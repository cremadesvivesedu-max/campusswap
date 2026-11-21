"use client";

// Photo tools for listings, run on the seller's device (the photo is not uploaded for this):
//  · enhancePhoto: auto levels per channel, a little more colour, square framing.
//  · rotatePhoto: quarter turn.
//  · removeBackground: the seller taps the item and MediaPipe's interactive segmenter
//    (Apache 2.0, self-hosted in /public/vendor/mediapipe and /public/models/magic-touch)
//    keeps it on a white background, like a shop photo.

const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.9;

async function toCanvas(file: File) {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("canvas");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { canvas, context };
}

function toFile(canvas: HTMLCanvasElement, name: string) {
  return new Promise<File>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(new File([blob], name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" })) : reject(new Error("blob"))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

/** White square around the content: long items (a bike, a sofa) are padded, never cut. */
function squareOnWhite(source: HTMLCanvasElement, box = { x: 0, y: 0, w: source.width, h: source.height }, margin = 0) {
  const side = Math.round(Math.max(box.w, box.h) * (1 + margin * 2));
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("canvas");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, side, side);
  context.drawImage(source, box.x, box.y, box.w, box.h, Math.round((side - box.w) / 2), Math.round((side - box.h) / 2), box.w, box.h);
  return canvas;
}

/** Stretch each channel between its 1st and 99th percentile, add ~10 % saturation. */
export async function enhancePhoto(file: File): Promise<File> {
  const { canvas, context } = await toCanvas(file);
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const histograms = [new Uint32Array(256), new Uint32Array(256), new Uint32Array(256)];
  for (let i = 0; i < data.length; i += 16) {
    histograms[0][data[i]]++;
    histograms[1][data[i + 1]]++;
    histograms[2][data[i + 2]]++;
  }
  const samples = Math.ceil(data.length / 16);
  const limits = histograms.map((histogram) => {
    let low = 0;
    let high = 255;
    for (let sum = 0; low < 255 && (sum += histogram[low]) < samples * 0.01; low++);
    for (let sum = 0; high > 0 && (sum += histogram[high]) < samples * 0.01; high--);
    // Do not over-stretch photos that are already fine (or nearly flat).
    if (high - low < 40) return [0, 255];
    return [Math.min(low, 60), Math.max(high, 195)];
  });
  const tables = limits.map(([low, high]) => {
    const table = new Uint8ClampedArray(256);
    for (let value = 0; value < 256; value++) table[value] = ((value - low) * 255) / (high - low);
    return table;
  });
  for (let i = 0; i < data.length; i += 4) {
    const r = tables[0][data[i]];
    const g = tables[1][data[i + 1]];
    const b = tables[2][data[i + 2]];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = gray + (r - gray) * 1.1;
    data[i + 1] = gray + (g - gray) * 1.1;
    data[i + 2] = gray + (b - gray) * 1.1;
  }
  context.putImageData(image, 0, 0);
  return toFile(squareOnWhite(canvas), file.name);
}

export async function rotatePhoto(file: File): Promise<File> {
  const { canvas } = await toCanvas(file);
  const turned = document.createElement("canvas");
  turned.width = canvas.height;
  turned.height = canvas.width;
  const context = turned.getContext("2d");
  if (!context) throw new Error("canvas");
  context.translate(turned.width, 0);
  context.rotate(Math.PI / 2);
  context.drawImage(canvas, 0, 0);
  return toFile(turned, file.name);
}

// ── Background removal ───────────────────────────────────────────────────────
type Segmenter = {
  segment: (
    image: HTMLCanvasElement,
    roi: { keypoint: { x: number; y: number } },
    callback: (result: { confidenceMasks?: { getAsFloat32Array: () => Float32Array; width: number; height: number }[] }) => void
  ) => void;
};

let segmenterPromise: Promise<Segmenter> | null = null;

async function loadSegmenter(): Promise<Segmenter> {
  const url = "/vendor/mediapipe/vision_bundle.mjs";
  const vision = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url);
  const fileset = await vision.FilesetResolver.forVisionTasks("/vendor/mediapipe/wasm");
  const options = (delegate: "GPU" | "CPU") => ({
    baseOptions: { modelAssetPath: "/models/magic-touch/magic_touch.tflite", delegate },
    outputCategoryMask: false,
    outputConfidenceMasks: true
  });
  // The magic_touch model runs on the "Legacy" segmenter in tasks-vision 1.x (the new class
  // expects a different, multi-file model bundle).
  const Segmenter = vision.InteractiveSegmenterLegacy ?? vision.InteractiveSegmenter;
  try {
    return await Segmenter.createFromOptions(fileset, options("GPU"));
  } catch {
    return Segmenter.createFromOptions(fileset, options("CPU"));
  }
}

/** Starts loading the model early (when the seller opens the tool), so the tap feels quick. */
export function preloadBackgroundRemoval() {
  segmenterPromise ??= loadSegmenter().catch((error) => {
    segmenterPromise = null;
    throw error;
  });
  return segmenterPromise;
}

/** x, y: where the seller tapped, from 0 to 1 across the photo. */
export async function removeBackground(file: File, x: number, y: number): Promise<File> {
  const [segmenter, { canvas, context }] = await Promise.all([preloadBackgroundRemoval(), toCanvas(file)]);
  const mask = await new Promise<{ values: Float32Array; width: number; height: number }>((resolve, reject) => {
    segmenter.segment(canvas, { keypoint: { x, y } }, (result) => {
      const first = result.confidenceMasks?.[0];
      if (!first) return reject(new Error("mask"));
      // The mask only lives inside this callback: copy it.
      resolve({ values: new Float32Array(first.getAsFloat32Array()), width: first.width, height: first.height });
    });
  });

  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  let minX = canvas.width;
  let minY = canvas.height;
  let maxX = 0;
  let maxY = 0;
  let kept = 0;
  for (let py = 0; py < canvas.height; py++) {
    const my = Math.min(mask.height - 1, Math.floor((py * mask.height) / canvas.height));
    for (let px = 0; px < canvas.width; px++) {
      const mx = Math.min(mask.width - 1, Math.floor((px * mask.width) / canvas.width));
      // Soft edge: fade between 0.35 and 0.65 confidence instead of a hard cut.
      const alpha = Math.min(1, Math.max(0, (mask.values[my * mask.width + mx] - 0.35) / 0.3));
      const i = (py * canvas.width + px) * 4;
      data[i] = data[i] * alpha + 255 * (1 - alpha);
      data[i + 1] = data[i + 1] * alpha + 255 * (1 - alpha);
      data[i + 2] = data[i + 2] * alpha + 255 * (1 - alpha);
      if (alpha > 0.5) {
        kept++;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    }
  }
  // Nothing (or almost everything) selected: the tap missed. Better to say so than to ruin the photo.
  const share = kept / (canvas.width * canvas.height);
  if (share < 0.01 || share > 0.97) throw new Error("missed");
  context.putImageData(image, 0, 0);
  const box = { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
  return toFile(squareOnWhite(canvas, box, 0.08), file.name);
}
