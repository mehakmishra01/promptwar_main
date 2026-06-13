import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

const supabaseMocks = vi.hoisted(() => ({
  updateError: null as { message: string } | null,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMocks,
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    from: () => ({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockImplementation(() => Promise.resolve({ error: supabaseMocks.updateError })),
      }),
    }),
  }),
}));

describe("OnboardingFlow", () => {
  beforeEach(() => {
    supabaseMocks.updateError = null;
    routerMocks.push.mockClear();
  });
  it("requires consent before completing", async () => {
    const user = userEvent.setup();
    render(<OnboardingFlow />);
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    const startBtn = screen.getByRole("button", { name: /complete onboarding/i });
    expect(startBtn).toBeDisabled();
    await user.click(screen.getByLabelText(/consent to ai analysis/i));
    expect(startBtn).toBeEnabled();
  });

  it("allows exam selection", async () => {
    const user = userEvent.setup();
    render(<OnboardingFlow />);
    await user.click(screen.getByRole("radio", { name: /Select JEE/i }));
    expect(screen.getByRole("radio", { name: /Select JEE/i })).toHaveAttribute("aria-checked", "true");
  });

  it("completes onboarding when exam and consent are set", async () => {
    const user = userEvent.setup();
    render(<OnboardingFlow />);
    await user.click(screen.getByRole("radio", { name: /Select NEET/i }));
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.click(screen.getByLabelText(/consent to ai analysis/i));
    await user.click(screen.getByRole("button", { name: /complete onboarding/i }));
    await waitFor(() => expect(routerMocks.push).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows error when profile update fails", async () => {
    supabaseMocks.updateError = { message: "Database unavailable" };
    const user = userEvent.setup();
    render(<OnboardingFlow />);
    await user.click(screen.getByRole("button", { name: /Continue/i }));
    await user.click(screen.getByLabelText(/consent to ai analysis/i));
    await user.click(screen.getByRole("button", { name: /complete onboarding/i }));
    await waitFor(() =>
      expect(screen.getByRole("alert", { name: /onboarding error/i })).toHaveTextContent(
        "Database unavailable",
      ),
    );
  });
});
