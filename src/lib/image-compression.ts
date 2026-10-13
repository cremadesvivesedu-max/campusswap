"use client";

// Phone photos are often 5-10 MB. Shrinking them in the browser before upload keeps
// pages fast and Supabase storage small. Anything the browser cannot decode (HEIC on
// most desktops, for example) is passed through unchanged.

const MAX_EDGE = 1600;
const QUALITY = 0.82;
const SKIP_BELOW_BYTES = 350 * 1024;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= SKIP_BELOW_BYTES) {
    bitmap.close();
    return file;
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    return file;
  }
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY)
  );
  if (!blob || blob.size >= file.size) {
    return file;
  }

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg", lastModified: file.lastModified });
}

export function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file)));
}

/** Replaces the files of an `<input type="file">` with compressed copies, so a normal form submit sends them. */
export async function compressFileInput(input: HTMLInputElement): Promise<void> {
  const original = Array.from(input.files ?? []);
  if (!original.length || typeof DataTransfer === "undefined") {
    return;
  }

  const compressed = await compressImages(original);
  if (compressed.every((file, index) => file === original.at(index))) {
    return;
  }

  const transfer = new DataTransfer();
  compressed.forEach((file) => transfer.items.add(file));
  input.files = transfer.files;
}
