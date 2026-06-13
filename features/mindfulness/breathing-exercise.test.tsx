import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BreathingExercise } from "@/features/mindfulness/breathing-exercise";

describe("BreathingExercise", () => {
  it("renders with accessible start control", () => {
    render(<BreathingExercise distressLevel="moderate" />);
    expect(screen.getByLabelText(/Start breathing exercise/i)).toBeInTheDocument();
  });

  it("toggles active state when start is pressed", async () => {
    const user = userEvent.setup();
    render(<BreathingExercise distressLevel="moderate" />);
    const start = screen.getByLabelText(/Start breathing exercise/i);
    expect(start).toHaveAttribute("aria-pressed", "false");
    await user.click(start);
    expect(start).toHaveAttribute("aria-pressed", "true");
  });

  it("shows static instructions when reduced motion preferred", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    render(<BreathingExercise distressLevel="high" />);
    expect(screen.getByLabelText(/Breathing instructions/i)).toBeInTheDocument();
  });
});
