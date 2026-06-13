import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompanionChat } from "@/features/chat/companion-chat";

vi.mock("@/lib/security/sanitize", () => ({
  sanitizeAiOutput: (s: string) => s,
}));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      body: {
        getReader: () => ({
          read: vi
            .fn()
            .mockResolvedValueOnce({
              done: false,
              value: new TextEncoder().encode('data: {"text":"I hear you."}\n\n'),
            })
            .mockResolvedValueOnce({ done: true, value: undefined }),
        }),
      },
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CompanionChat", () => {
  it("renders exam-aware header", () => {
    render(<CompanionChat examType="NEET" />);
    expect(screen.getByText(/Your NEET Companion/i)).toBeInTheDocument();
  });

  it("shows crisis modal on distress message before send", async () => {
    const user = userEvent.setup();
    render(<CompanionChat examType="JEE" />);

    const input = screen.getByRole("textbox", { name: /chat message/i });
    await user.type(input, "I want to die");
    await user.click(screen.getByLabelText(/send message/i));

    expect(screen.getByText(/You matter/i)).toBeInTheDocument();
  });

  it("renders quick chips", () => {
    render(<CompanionChat examType="CAT" />);
    expect(screen.getByRole("button", { name: /anxious about tomorrow/i })).toBeInTheDocument();
  });
});
