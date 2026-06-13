import { describe, it, expect } from "vitest";
import { buildInsightSystemPrompt, buildInsightUserMessage } from "@/lib/ai/prompts/insight-analysis";
import { buildCompanionSystemPrompt, buildChatMessages } from "@/lib/ai/prompts/companion-chat";

describe("buildInsightSystemPrompt", () => {
  it("includes exam type in prompt", () => {
    const prompt = buildInsightSystemPrompt("NEET");
    expect(prompt).toContain("NEET");
    expect(prompt).toContain("hidden");
    expect(prompt).toContain("<user_journal_data>");
  });

  it("includes safety rules", () => {
    const prompt = buildInsightSystemPrompt("JEE");
    expect(prompt).toContain("NOT a therapist");
    expect(prompt).toContain("crisisFlag");
  });
});

describe("buildInsightUserMessage", () => {
  it("wraps journal bodies in data tags", () => {
    const msg = buildInsightUserMessage([
      { date: "2026-06-01", moodScore: 3, body: "Test entry content" },
    ]);
    expect(msg).toContain("<user_journal_data>");
    expect(msg).toContain("Test entry content");
    expect(msg).toContain("</user_journal_data>");
  });
});

describe("buildCompanionSystemPrompt", () => {
  it("includes exam context and crisis helplines", () => {
    const prompt = buildCompanionSystemPrompt({
      examType: "UPSC",
      recentMoodAvg: 2.5,
      journalSummary: "Feeling stressed about prelims",
    });
    expect(prompt).toContain("UPSC");
    expect(prompt).toContain("14416");
    expect(prompt).toContain("Feeling stressed about prelims");
  });
});

describe("buildChatMessages", () => {
  it("appends new message and trims empty content", () => {
    const result = buildChatMessages("system", [{ role: "user", content: "Hi" }], "Hello");
    expect(result).toHaveLength(2);
    expect(result[1].content).toBe("Hello");
  });
});
