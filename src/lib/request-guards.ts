// Small guards for public endpoints that anyone on the internet can call.

type JsonValue = string | number | boolean | null;

export function clip(value: unknown, max: number): string | undefined {
  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }
  return value.length > max ? value.slice(0, max) : value;
}

/** Keeps at most `maxKeys` flat primitive values, with short keys and strings. */
export function sanitizeMetadata(input: unknown, maxKeys = 12): Record<string, JsonValue> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }
  const result: Record<string, JsonValue> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>).slice(0, maxKeys)) {
    const safeKey = key.slice(0, 40);
    if (typeof value === "string") {
      result[safeKey] = value.slice(0, 200);
    } else if (typeof value === "number" && Number.isFinite(value)) {
      result[safeKey] = value;
    } else if (typeof value === "boolean" || value === null) {
      result[safeKey] = value;
    }
  }
  return result;
}

/** Reads a JSON body but refuses anything larger than `maxBytes`. */
export async function readJsonBody(request: Request, maxBytes: number): Promise<unknown | null> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > maxBytes) {
    return null;
  }
  const text = await request.text();
  if (text.length > maxBytes) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

const buckets = new Map<string, { count: number; resetAt: number }>();

/**
 * Best-effort, per-server-instance rate limit (no external store needed).
 * Returns true when the caller is over the limit.
 */
export function isRateLimited(request: Request, scope: string, limit: number, windowMs: number) {
  const ip =
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size > 5000) {
      for (const [k, b] of buckets) {
        if (b.resetAt <= now) buckets.delete(k);
      }
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}
