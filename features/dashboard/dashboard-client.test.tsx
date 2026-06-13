import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DashboardClient } from "@/features/dashboard/dashboard-client";

vi.mock("@/features/dashboard/burnout-radar", () => ({
  BurnoutRadar: () => <div aria-label="Burnout radar mock">Burnout Radar</div>,
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("DashboardClient", () => {
  it("renders quick actions and opens breathing exercise", async () => {
    const user = userEvent.setup();
    render(<DashboardClient userId="u1" examType="NEET" latestMood={3} />, { wrapper });

    expect(screen.getByRole("heading", { name: /wellness dashboard/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/go to journal/i)).toBeInTheDocument();
    const [breatheButton] = screen.getAllByLabelText(/start breathing exercise/i);
    await user.click(breatheButton);
    expect(screen.getByRole("heading", { name: /micro-mindfulness/i })).toBeInTheDocument();
  });
});
