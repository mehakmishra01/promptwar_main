import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JournalTimeline } from "@/features/journal/journal-timeline";

vi.mock("@/lib/journal/fetch-decrypted-entries", () => ({
  fetchDecryptedJournalEntries: vi.fn().mockResolvedValue([
    {
      id: "e1",
      user_id: "u1",
      mood_score: 4,
      created_at: "2025-06-01T10:00:00Z",
      encrypted_body: "enc",
      body: "Feeling okay about mocks",
    },
  ]),
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
