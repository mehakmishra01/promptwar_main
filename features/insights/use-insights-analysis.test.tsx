import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useInsightsAnalysis } from "@/features/insights/use-insights-analysis";

vi.mock("@/lib/journal/fetch-decrypted-entries", () => ({
  fetchDecryptedJournalEntries: vi.fn().mockResolvedValue([
    {
      id: "e1",
      user_id: "u1",
      mood_score: 2,
      created_at: "2025-06-01T10:00:00Z",
      encrypted_body: "enc",
      body: "Feeling stressed about tomorrow's mock",
    },
  ]),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useInsightsAnalysis", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            triggers: [{ label: "Test", description: "d", evidence: "e", confidence: "high" }],
            patterns: [{ label: "P", description: "d", frequency: "weekly" }],
            burnoutScore: 50,
            copingAction: "Rest",
            encouragement: "You matter",
          }),
      }),
    );
  });

  it("analyzes journal entries via API", async () => {
    const { result } = renderHook(() => useInsightsAnalysis("u1"), { wrapper });
    result.current.analyzeMutation.mutate();
    await waitFor(() => expect(result.current.analyzeMutation.isSuccess).toBe(true));
    expect(result.current.result?.triggers[0]?.label).toBe("Test");
  });

  it("opens crisis modal when API flags crisis", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ crisis: true }),
      }),
    );
    const { result } = renderHook(() => useInsightsAnalysis("u1"), { wrapper });
    result.current.analyzeMutation.mutate();
    await waitFor(() => expect(result.current.crisisOpen).toBe(true));
    expect(result.current.analyzeMutation.isError).toBe(true);
  });
});
