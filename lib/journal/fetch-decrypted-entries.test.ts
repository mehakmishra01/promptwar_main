import { describe, it, expect, vi } from "vitest";

const mockFrom = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ from: mockFrom }),
}));

vi.mock("@/lib/crypto/journal", () => ({
  decryptText: vi.fn().mockResolvedValue("Decrypted body"),
}));

import { fetchDecryptedJournalEntries } from "@/lib/journal/fetch-decrypted-entries";

describe("fetchDecryptedJournalEntries", () => {
  it("returns decrypted rows", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: "e1",
            user_id: "u1",
            encrypted_body: "enc",
            mood_score: 3,
            created_at: "2025-06-01",
          },
        ],
        error: null,
      }),
    });

    const entries = await fetchDecryptedJournalEntries("u1");
    expect(entries[0]?.body).toBe("Decrypted body");
  });
});
