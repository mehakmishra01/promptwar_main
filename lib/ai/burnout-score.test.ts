import { describe, it, expect } from "vitest";
import {
  calculateBurnoutScore,
  getBurnoutRisk,
  getBurnoutRiskLabel,
} from "@/lib/ai/burnout-score";

describe("calculateBurnoutScore", () => {
  it("returns 0 for empty mood scores", () => {
    expect(
      calculateBurnoutScore({ moodScores: [], entryBodies: [], daysSinceLastEntry: 0 }),
    ).toBe(0);
  });

  it("returns higher score for low moods", () => {
    const low = calculateBurnoutScore({
      moodScores: [1, 2, 1, 2],
      entryBodies: ["exhausted and anxious"],
      daysSinceLastEntry: 0,
    });
    const high = calculateBurnoutScore({
      moodScores: [4, 5, 4, 5],
      entryBodies: ["feeling good today"],
      daysSinceLastEntry: 0,
    });
    expect(low).toBeGreaterThan(high);
  });

  it("increases score with negative keywords", () => {
    const withKeywords = calculateBurnoutScore({
      moodScores: [3],
      entryBodies: ["exhausted burnout anxious panic pressure stress"],
      daysSinceLastEntry: 0,
    });
    const without = calculateBurnoutScore({
      moodScores: [3],
      entryBodies: ["studied well today"],
      daysSinceLastEntry: 0,
    });
    expect(withKeywords).toBeGreaterThan(without);
  });

  it("caps score at 100", () => {
    const score = calculateBurnoutScore({
      moodScores: [1, 1, 1, 1, 1],
      entryBodies: ["exhausted burnout anxious panic hopeless worthless stress pressure"],
      daysSinceLastEntry: 10,
    });
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("getBurnoutRisk", () => {
  it("returns correct risk bands", () => {
    expect(getBurnoutRisk(20)).toBe("low");
    expect(getBurnoutRisk(50)).toBe("moderate");
    expect(getBurnoutRisk(80)).toBe("high");
  });
});

describe("getBurnoutRiskLabel", () => {
  it("returns accessible text labels", () => {
    expect(getBurnoutRiskLabel("low")).toContain("Low risk");
    expect(getBurnoutRiskLabel("moderate")).toContain("Moderate");
    expect(getBurnoutRiskLabel("high")).toContain("High risk");
  });
});
