import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/wellness/page-header";

describe("PageHeader", () => {
  it("renders title and subtitle", () => {
    render(<PageHeader title="Mirror Insights" subtitle="Patterns in your journal" />);
    expect(screen.getByRole("heading", { name: /mirror insights/i })).toBeInTheDocument();
    expect(screen.getByText(/patterns in your journal/i)).toBeInTheDocument();
  });

  it("shows mood orb when score provided", () => {
    render(<PageHeader title="Journal" moodScore={3} />);
    expect(screen.getByRole("img", { name: /mood level 3/i })).toBeInTheDocument();
  });
});
