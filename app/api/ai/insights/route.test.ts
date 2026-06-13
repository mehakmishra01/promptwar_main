import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/insights/route";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/ai/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/insights", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const res = await POST(jsonRequest({ forceRefresh: false }));
    expect(res.status).toBe(401);
  });

  it("returns 429 with Retry-After when rate limited", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 60,
    });

    const res = await POST(jsonRequest({ forceRefresh: false }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("60");
  });

  it("returns 400 for invalid request body", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 9,
      retryAfterSeconds: 900,
    });

    const res = await POST(jsonRequest({ forceRefresh: "yes" }));
    expect(res.status).toBe(400);
  });

  it("returns cached insight when available", async () => {
    const cachedInsight = {
      triggers: [],
      patterns: [],
      burnout_score: 40,
      coping_action: "Rest",
      encouragement: "Keep going",
      generated_at: "2025-06-01T00:00:00Z",
    };

    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: cachedInsight }),
              }),
            }),
          }),
        }),
      }),
    } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 9,
      retryAfterSeconds: 900,
    });

    const res = await POST(jsonRequest({ forceRefresh: false }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cached).toBe(true);
    expect(body.copingAction).toBe("Rest");
  });
});
