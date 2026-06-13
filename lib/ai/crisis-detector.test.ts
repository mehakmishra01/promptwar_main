import { describe, it, expect } from "vitest";
import { detectCrisis } from "@/lib/ai/crisis-detector";

describe("detectCrisis", () => {
  it("returns no crisis for empty text", () => {
    expect(detectCrisis("")).toEqual({
      isCrisis: false,
      severity: "none",
      matchedPatterns: [],
    });
  });

  it("returns no crisis for normal journal entry", () => {
    const result = detectCrisis("Had a tough mock test today but I'll study harder tomorrow.");
    expect(result.isCrisis).toBe(false);
  });

  it("detects high severity suicidal ideation", () => {
    const result = detectCrisis("I want to die, nothing matters anymore");
    expect(result.isCrisis).toBe(true);
    expect(result.severity).toBe("high");
    expect(result.matchedPatterns).toContain("suicidal_ideation");
  });

  it("detects self-harm language", () => {
    const result = detectCrisis("I've been thinking about self-harm lately");
    expect(result.isCrisis).toBe(true);
    expect(result.severity).toBe("high");
  });

  it("detects Hindi distress phrases", () => {
    const result = detectCrisis("mujhe jeena nahi chahta ab");
    expect(result.isCrisis).toBe(true);
    expect(result.matchedPatterns).toContain("hindi_distress");
  });

  it("handles very long entries by truncating scan", () => {
    const longText = "kill myself " + "a".repeat(60000);
    const result = detectCrisis(longText);
    expect(result.isCrisis).toBe(true);
  });

  it("detects low severity distress", () => {
    const result = detectCrisis("I feel hopeless about my preparation");
    expect(result.isCrisis).toBe(true);
    expect(result.severity).toBe("low");
  });
});
