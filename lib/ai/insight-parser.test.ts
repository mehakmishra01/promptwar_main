import { describe, it, expect } from "vitest";
import { parseInsightResponse } from "@/lib/ai/insight-parser";

describe("parseInsightResponse", () => {
  it("parses valid JSON from AI response", () => {
    const raw = `Here is the analysis:
    {
      "triggers": [{"label": "Test", "description": "Desc", "evidence": "Ev", "confidence": "high"}],
      "patterns": [{"label": "Pattern", "description": "Desc", "frequency": "3/7"}],
      "burnoutScore": 55,
      "copingAction": "Take a break",
      "encouragement": "You got this"
    }`;

    const result = parseInsightResponse(raw);
    expect(result.triggers[0].label).toBe("Test");
    expect(result.burnoutScore).toBe(55);
  });

  it("throws on malformed JSON", () => {
    expect(() => parseInsightResponse("no json here")).toThrow();
  });

  it("throws on partial fields", () => {
    expect(() => parseInsightResponse('{"triggers": []}')).toThrow();
  });
});
