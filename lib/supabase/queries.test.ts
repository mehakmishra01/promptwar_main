import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSingle = vi.fn();
const mockFrom = vi.fn(() => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: mockSingle,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    from: mockFrom,
  })),
}));

import { getProfile, getLatestMoodScore } from "@/lib/supabase/queries";

describe("supabase queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getProfile returns profile when found", async () => {
    mockSingle.mockResolvedValue({
      data: { id: "u1", exam_type: "NEET", consent_ai: true },
      error: null,
    });
    const profile = await getProfile("u1");
    expect(profile).toEqual({ id: "u1", exam_type: "NEET", consent_ai: true });
  });

  it("getProfile returns null on error", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "not found" } });
    expect(await getProfile("missing")).toBeNull();
  });

  it("getLatestMoodScore returns mood score", async () => {
    mockSingle.mockResolvedValue({ data: { mood_score: 4 }, error: null });
    expect(await getLatestMoodScore("u1")).toBe(4);
  });

  it("getLatestMoodScore returns undefined when no entries", async () => {
    mockSingle.mockResolvedValue({ data: null, error: null });
    expect(await getLatestMoodScore("u1")).toBeUndefined();
  });
});
