import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JournalTimeline } from "@/features/journal/journal-timeline";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: "e1",
            mood_score: 4,
            created_at: "2025-06-01T10:00:00Z",
            encrypted_body: "enc",
          },
        ],
        error: null,
      }),
    }),
  }),
}));

vi.mock("@/lib/crypto/journal", () => ({
  decryptText: vi.fn().mockResolvedValue("Feeling okay about mocks"),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("JournalTimeline", () => {
  it("renders decrypted entries", async () => {
    render(<JournalTimeline userId="u1" />, { wrapper });
    expect(await screen.findByText(/feeling okay about mocks/i)).toBeInTheDocument();
  });
});
