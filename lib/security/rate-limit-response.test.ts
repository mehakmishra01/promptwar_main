import { describe, it, expect } from "vitest";
import { rateLimitExceededResponse } from "@/lib/security/rate-limit-response";

describe("rateLimitExceededResponse", () => {
  it("returns 429 with Retry-After header", async () => {
    const res = rateLimitExceededResponse(120);
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("120");
    const body = await res.json();
    expect(body.error).toMatch(/rate limit/i);
  });

  it("never returns zero Retry-After", () => {
    const res = rateLimitExceededResponse(0);
    expect(res.headers.get("Retry-After")).toBe("1");
  });
});
