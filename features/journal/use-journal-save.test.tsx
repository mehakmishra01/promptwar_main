import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useJournalSave } from "@/features/journal/use-journal-save";

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
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useJournalSave", () => {
  it("exposes debounced save and saveNow", () => {
    const { result } = renderHook(() => useJournalSave("u1"), { wrapper });
    expect(result.current.debouncedSave).toBeTypeOf("function");
    expect(result.current.saveNow).toBeTypeOf("function");
  });

  it("saveNow persists valid entries", async () => {
    const { result } = renderHook(() => useJournalSave("u1"), { wrapper });
    const onStatus = vi.fn();
    await act(async () => {
      result.current.saveNow("Valid journal entry text here.", 4, { onStatus });
    });
    expect(onStatus).toHaveBeenCalledWith("saved");
  });
});
