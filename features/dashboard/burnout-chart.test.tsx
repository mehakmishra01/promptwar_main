import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BurnoutChart } from "@/features/dashboard/burnout-chart";

describe("BurnoutChart", () => {
  it("renders chart with accessible label", () => {
    render(
      <BurnoutChart
        burnoutScore={62}
        data={[
          { date: "Jun 1", mood: 3 },
          { date: "Jun 2", mood: 4 },
        ]}
      />,
    );
    expect(screen.getByRole("img", { name: /mood trend over 2 days/i })).toBeInTheDocument();
  });
});
