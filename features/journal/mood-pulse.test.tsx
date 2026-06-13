import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MoodPulse } from "@/features/journal/mood-pulse";

describe("MoodPulse", () => {
  it("selects mood via radio buttons", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MoodPulse value={3} onChange={onChange} />);

    await user.click(screen.getByRole("radio", { name: /great, 5 out of 5/i }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("marks selected mood as checked", () => {
    render(<MoodPulse value={4} onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /good, 4 out of 5/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });
});
