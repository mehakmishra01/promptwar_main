const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the rate-limit window resets. */
  retryAfterSeconds: number;
}

/**
 * Rate limiter for AI endpoints (10 requests per 15 minutes per user).
 * Uses Upstash Redis when configured; falls back to in-memory storage in development.
 *
 * @param userId - Authenticated user id.
 * @returns Whether the request is allowed, remaining quota, and retry delay.
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "15 m"),
      });
      const result = await ratelimit.limit(`ai:${userId}`);
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((result.reset - Date.now()) / 1000),
      );
      return {
        allowed: result.success,
        remaining: result.remaining,
        retryAfterSeconds,
      };
    } catch {
      // fall through to in-memory
    }
  }

  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      retryAfterSeconds: Math.ceil(WINDOW_MS / 1000),
    };
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    retryAfterSeconds,
  };
}
