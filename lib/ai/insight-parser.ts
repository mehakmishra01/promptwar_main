import { insightResponseSchema, type InsightResponse } from "@/lib/validation/schemas";

/**
 * Parse and validate Claude's insight JSON response.
 */
export function parseInsightResponse(raw: string): InsightResponse {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in AI response");
  }

  const parsed: unknown = JSON.parse(jsonMatch[0]);
  return insightResponseSchema.parse(parsed);
}
