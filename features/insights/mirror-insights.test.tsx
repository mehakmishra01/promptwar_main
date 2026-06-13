import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MirrorInsights } from "@/features/insights/mirror-insights";

const mockInsight = {
  triggers: [
    {
      label: "Mock test anxiety",
      description: "Stress spikes before mocks",
      evidence: "I always feel worse the night before",
      confidence: "high",
    },
  ],
  patterns: [
    {
      label: "Sunday slump",
      frequency: "Weekly",
      description: "Mood dips after long study blocks",
    },
  ],
  copingAction: "Try a 10-minute walk before bed",
  encouragement: "Your awareness is already a strength.",
};

vi.mock("@/lib/crypto/journal", () => ({
  decryptText: vi.fn().mockResolvedValue("Feeling stressed about tomorrow's mock"),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [
                {
                  encrypted_body: "enc",
                  mood_score: 2,
                  created_at: "2025-06-01T10:00:00Z",
                },
              ],
            }),
          }),
        }),
      }),
    }),
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  );
}

describe("MirrorInsights", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockInsight),
      }),
    );
  });

  it("renders analyze button with aria label", () => {
    render(<MirrorInsights userId="u1" examType="NEET" />, { wrapper });
    expect(screen.getByLabelText(/Analyze my journal patterns/i)).toBeInTheDocument();
  });

  it("shows hidden trigger after successful analysis", async () => {
    const user = userEvent.setup();
    render(<MirrorInsights userId="u1" examType="NEET" />, { wrapper });
    await user.click(screen.getByLabelText(/Analyze my journal patterns/i));
    expect(await screen.findByText(/Hidden Trigger Revealed/i)).toBeInTheDocument();
    expect(screen.getByText(/Mock test anxiety/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/Sunday slump/i)).toBeInTheDocument();
    });
  });
});
