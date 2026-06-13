export interface BurnoutInput {
  moodScores: number[];
  entryBodies: string[];
  daysSinceLastEntry: number;
}

const NEGATIVE_KEYWORDS = [
  "exhausted",
  "burnt",
  "burnout",
  "can't focus",
  "hopeless",
  "overwhelmed",
  "anxious",
  "panic",
  "failed",
  "worthless",
  "tired",
  "sleep",
  "pressure",
  "stress",
  "thak",
  "tension",
];

/**
 * Calculate burnout risk score (0-100) from mood data and journal text.
 * Pure function for testability.
 */
export function calculateBurnoutScore(input: BurnoutInput): number {
  const { moodScores, entryBodies, daysSinceLastEntry } = input;

  if (moodScores.length === 0) return 0;

  const avgMood = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
  const moodComponent = Math.max(0, (3 - avgMood) / 2) * 40;

  const variance =
    moodScores.length > 1
      ? moodScores.reduce((sum, m) => sum + Math.pow(m - avgMood, 2), 0) / moodScores.length
      : 0;
  const varianceComponent = Math.min(variance * 15, 20);

  const allText = entryBodies.join(" ").toLowerCase();
  const keywordHits = NEGATIVE_KEYWORDS.filter((kw) => allText.includes(kw)).length;
  const keywordComponent = Math.min(keywordHits * 5, 25);

  const gapComponent = Math.min(daysSinceLastEntry * 3, 15);

  return Math.round(
    Math.min(100, Math.max(0, moodComponent + varianceComponent + keywordComponent + gapComponent)),
  );
}

export type BurnoutRisk = "low" | "moderate" | "high";

/** Map burnout score to risk band with accessible label. */
export function getBurnoutRisk(score: number): BurnoutRisk {
  if (score >= 70) return "high";
  if (score >= 40) return "moderate";
  return "low";
}

export function getBurnoutRiskLabel(risk: BurnoutRisk): string {
  switch (risk) {
    case "high":
      return "High risk — consider rest and support";
    case "moderate":
      return "Moderate risk — watch your energy";
    default:
      return "Low risk — you're managing well";
  }
}
