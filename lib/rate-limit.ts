import { headers } from "next/headers";

type RateLimitEntry = {
  tokens: number;
  lastRefill: number;
};

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 10;

const globalForRateLimit = global as unknown as {
  rateLimitMap?: Map<string, RateLimitEntry>;
};

const rateLimitMap =
  globalForRateLimit.rateLimitMap ?? new Map<string, RateLimitEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.rateLimitMap = rateLimitMap;
}

export async function rateLimit() {
  const h = await headers();

  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, {
      tokens: MAX_REQUESTS - 1,
      lastRefill: now,
    });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  const elapsed = now - entry.lastRefill;

  if (elapsed >= RATE_LIMIT_WINDOW) {
    entry.tokens = MAX_REQUESTS - 1;
    entry.lastRefill = now;
    return { success: true, remaining: entry.tokens };
  }

  if (entry.tokens <= 0) {
    return { success: false, remaining: 0 };
  }

  entry.tokens -= 1;
  rateLimitMap.set(ip, entry);

  return { success: true, remaining: entry.tokens };
}

