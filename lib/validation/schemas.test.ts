import { describe, it, expect } from "vitest";
import {
  journalEntrySchema,
  chatRequestSchema,
  insightRequestSchema,
  examTypeSchema,
} from "@/lib/validation/schemas";

describe("validation schemas", () => {
  it("journalEntrySchema rejects short body", () => {
    const result = journalEntrySchema.safeParse({ body: "short", moodScore: 3 });
    expect(result.success).toBe(false);
  });

  it("journalEntrySchema accepts valid entry", () => {
    const result = journalEntrySchema.safeParse({
      body: "Today was a long study day with mixed feelings.",
      moodScore: 4,
    });
    expect(result.success).toBe(true);
  });

  it("chatRequestSchema accepts optional journalSummary", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello",
      journalSummary: "Recent stress about mocks",
    });
    expect(result.success).toBe(true);
  });

  it("insightRequestSchema accepts client entries", () => {
    const result = insightRequestSchema.safeParse({
      forceRefresh: true,
      entries: [{ body: "Feeling anxious", moodScore: 2, date: "2025-06-01" }],
    });
    expect(result.success).toBe(true);
  });

  it("examTypeSchema rejects unknown exam", () => {
    expect(examTypeSchema.safeParse("SAT").success).toBe(false);
  });
});
