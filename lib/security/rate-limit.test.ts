import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/security/rate-limit";

describe("checkRateLimit", () => {
  it("allows requests within limit", async () => {
    const userId = `test-user-${Date.now()}`;
    const first = await checkRateLimit(userId);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBeGreaterThan(0);
  });

  it("blocks after max requests", async () => {
    const userId = `rate-limit-${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      await checkRateLimit(userId);
    }
    const blocked = await checkRateLimit(userId);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
