import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/ai/chat/route";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getProfile } from "@/lib/supabase/queries";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/security/rate-limit", () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock("@/lib/supabase/queries", () => ({
  getProfile: vi.fn(),
}));

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/ai/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const res = await POST(jsonRequest({ message: "Hello there", history: [] }));
    expect(res.status).toBe(401);
  });

  it("returns 429 with Retry-After when rate limited", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: false,
      remaining: 0,
      retryAfterSeconds: 120,
    });

    const res = await POST(jsonRequest({ message: "Hello there", history: [] }));
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBe("120");
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

    const res = await POST(jsonRequest({ message: "", history: [] }));
    expect(res.status).toBe(400);
  });

  it("streams crisis response for high-severity distress", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);
    vi.mocked(checkRateLimit).mockResolvedValue({
      allowed: true,
      remaining: 9,
      retryAfterSeconds: 900,
    });
    vi.mocked(getProfile).mockResolvedValue({
      exam_type: "NEET",
      onboarding_complete: true,
    } as never);

    const res = await POST(
      jsonRequest({ message: "I want to kill myself tonight", history: [] }),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/event-stream");
    const text = await res.text();
    expect(text).toContain("crisis");
  });
});
