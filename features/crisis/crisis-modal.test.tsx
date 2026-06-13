import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CrisisModal } from "@/features/crisis/crisis-modal";

describe("CrisisModal", () => {
  it("renders verified helplines when open", () => {
    render(<CrisisModal open onOpenChange={() => {}} />);
    expect(screen.getByLabelText(/Call Tele-MANAS/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Call iCall/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Call AASRA/i)).toBeInTheDocument();
  });
});
