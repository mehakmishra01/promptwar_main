import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JournalForm } from "@/features/journal/journal-form";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    from: () => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  }),
}));

vi.mock("@/lib/crypto/journal", () => ({
  encryptText: vi.fn().mockResolvedValue("encrypted"),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("JournalForm", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows validation error for short entry on submit", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<JournalForm userId="test-user" />, { wrapper });

    await user.click(screen.getByRole("button", { name: /save journal entry/i }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("allows mood selection", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<JournalForm userId="test-user" />, { wrapper });

    await user.click(screen.getByRole("radio", { name: /great, 5 out of 5/i }));
    expect(screen.getByRole("radio", { name: /great, 5 out of 5/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("autosaves after debounce when entry is long enough", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<JournalForm userId="test-user" />, { wrapper });

    await user.type(screen.getByLabelText(/what's on your mind/i), "This is a valid journal entry text");
    vi.advanceTimersByTime(600);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(/saved/i);
    });
  });
});
