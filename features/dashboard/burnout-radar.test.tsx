import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BurnoutRadar } from "@/features/dashboard/burnout-radar";

const mockLimit = vi.fn();

vi.mock("@/lib/crypto/journal", () => ({
  decryptText: vi.fn().mockResolvedValue("Long study session today"),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            limit: (...args: unknown[]) => mockLimit(...args),
          }),
        }),
      }),
    }),
  }),
}));

vi.mock("next/dynamic", () => ({
  default: () => {
    const Chart = () => <div role="img" aria-label="Burnout chart" />;
    Chart.displayName = "BurnoutChart";
    return Chart;
  },
}));

describe("BurnoutRadar", () => {
  beforeEach(() => {
    mockLimit.mockReset();
  });

  it("shows empty state when no entries", async () => {
    mockLimit.mockResolvedValue({ data: [] });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <BurnoutRadar userId="u1" />
      </QueryClientProvider>,
    );
    expect(await screen.findByText(/Start journaling/i)).toBeInTheDocument();
  });

  it("renders burnout score when entries exist", async () => {
    mockLimit.mockResolvedValue({
      data: [
        {
          mood_score: 3,
          encrypted_body: "enc",
          created_at: new Date().toISOString(),
        },
      ],
    });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <BurnoutRadar userId="u1" />
      </QueryClientProvider>,
    );
    expect(await screen.findByText(/Burnout Radar/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
