import { NextResponse } from "next/server";

/**
 * Builds a standardized 429 response for AI rate limiting.
 *
 * @param retryAfterSeconds - Seconds until the client may retry.
 */
export function rateLimitExceededResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Rate limit exceeded" },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds))) },
    },
  );
}
