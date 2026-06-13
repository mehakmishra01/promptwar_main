import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MoodOrb } from "@/components/mascot/mood-orb";

describe("MoodOrb", () => {
  it("renders with mood aria label", () => {
    render(<MoodOrb moodScore={4} />);
    expect(screen.getByRole("img", { name: /mood level 4 of 5/i })).toBeInTheDocument();
  });
});
