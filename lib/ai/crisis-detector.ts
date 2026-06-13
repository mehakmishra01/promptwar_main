export type CrisisSeverity = "none" | "low" | "high";

export interface CrisisResult {
  isCrisis: boolean;
  severity: CrisisSeverity;
  matchedPatterns: string[];
}

const CRISIS_PATTERNS: Array<{ pattern: RegExp; label: string; severity: CrisisSeverity }> = [
  { pattern: /\b(want to die|wish i (was|were) dead|kill myself|end my life)\b/i, label: "suicidal_ideation", severity: "high" },
  { pattern: /\b(suicide|suicidal|self[- ]?harm|cut myself|hurt myself)\b/i, label: "self_harm", severity: "high" },
  { pattern: /\b(end it all|no reason to live|better off dead|can't go on)\b/i, label: "hopelessness", severity: "high" },
  { pattern: /\b(marna chahta|mar jana|jeena nahi|khatam kar)\b/i, label: "hindi_distress", severity: "high" },
  { pattern: /\b(hopeless|worthless|give up on everything)\b/i, label: "severe_distress", severity: "low" },
];

const MAX_SCAN_LENGTH = 50000;

/**
 * Detect acute distress language in user journal or chat text.
 * Pure function — safe to run client- and server-side.
 *
 * @param text - User-authored content to scan.
 * @returns Crisis detection result with severity and matched pattern labels.
 */
export function detectCrisis(text: string): CrisisResult {
  if (!text || text.trim().length === 0) {
    return { isCrisis: false, severity: "none", matchedPatterns: [] };
  }

  const normalized = text.slice(0, MAX_SCAN_LENGTH);
  const matchedPatterns: string[] = [];
  let severity: CrisisSeverity = "none";

  for (const { pattern, label, severity: patternSeverity } of CRISIS_PATTERNS) {
    if (pattern.test(normalized)) {
      matchedPatterns.push(label);
      if (patternSeverity === "high") {
        severity = "high";
      } else if (severity !== "high") {
        severity = "low";
      }
    }
  }

  return {
    isCrisis: matchedPatterns.length > 0,
    severity,
    matchedPatterns,
  };
}
