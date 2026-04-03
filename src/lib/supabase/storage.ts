import type { SupabaseClient } from "@supabase/supabase-js";

export const avatarsBucket = "avatars";
export const listingImagesBucket = "listing-images";

function sanitizeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

export async function uploadPublicFile(
  supabase: SupabaseClient,
  bucket: string,
  pathSegments: string[],
  file: File
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = `${pathSegments.join("/")}/${Date.now()}-${sanitizeFileName(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(filePath, buffer, {
    contentType: file.type || undefined,
    upsert: true
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: data.publicUrl
  };
}
