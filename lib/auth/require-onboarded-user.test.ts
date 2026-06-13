import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("@/lib/supabase/queries", () => ({
  getProfile: vi.fn(),
}));

import { getProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { requireOnboardedUser } from "@/lib/auth/require-onboarded-user";

describe("requireOnboardedUser", () => {
  it("redirects to login when unauthenticated", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    await expect(requireOnboardedUser()).rejects.toThrow("REDIRECT:/login");
  });

  it("redirects to onboarding when incomplete", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
    } as never);
    vi.mocked(getProfile).mockResolvedValue({
      id: "u1",
      exam_type: "NEET",
      onboarding_complete: false,
      consent_at: null,
    });

    await expect(requireOnboardedUser()).rejects.toThrow("REDIRECT:/onboarding");
  });

  it("returns user and profile when session is valid", async () => {
    const profile = {
      id: "u1",
      exam_type: "JEE",
      onboarding_complete: true,
      consent_at: "2025-01-01",
    };
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
    } as never);
    vi.mocked(getProfile).mockResolvedValue(profile);

    const session = await requireOnboardedUser();
    expect(session.user.id).toBe("u1");
    expect(session.profile.exam_type).toBe("JEE");
  });
});
