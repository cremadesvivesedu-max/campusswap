"use client";

// Recognises the item in a listing photo on the seller's own device.
// The photo is never uploaded for this: a small MobileNet model (≈8 MB,
// self-hosted in /public/models, cached by the browser after the first use)
// runs in the browser. Everything is loaded lazily so the sell page stays light.

import type { ModelPrediction } from "@/features/listings/photo-recognition";

const MODEL_URL = "/models/mobilenet-v2-050/model.json";

type Classifier = { classify: (image: HTMLImageElement, topk?: number) => Promise<ModelPrediction[]> };

let modelPromise: Promise<Classifier> | null = null;

async function loadModel(): Promise<Classifier> {
  const tf = await import("@tensorflow/tfjs-core");
  await import("@tensorflow/tfjs-backend-webgl");
  await import("@tensorflow/tfjs-backend-cpu");
  try {
    await tf.setBackend("webgl");
  } catch {
    await tf.setBackend("cpu");
  }
  await tf.ready();
  const mobilenet = await import("@tensorflow-models/mobilenet");
  return mobilenet.load({ version: 2, alpha: 0.5, modelUrl: MODEL_URL }) as Promise<Classifier>;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    image.src = url;
  });
}

export async function classifyPhoto(file: File): Promise<ModelPrediction[]> {
  modelPromise ??= loadModel().catch((error) => {
    modelPromise = null;
    throw error;
  });
  const [model, image] = await Promise.all([modelPromise, loadImage(file)]);
  return model.classify(image, 5);
}
