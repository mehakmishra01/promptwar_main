import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    from: () => ({
      update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
    }),
  }),
}));

describe("OnboardingFlow", () => {
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
});
