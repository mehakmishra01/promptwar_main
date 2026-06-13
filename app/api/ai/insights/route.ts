import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { detectCrisis } from "@/lib/ai/crisis-detector";
import { buildInsightSystemPrompt, buildInsightUserMessage } from "@/lib/ai/prompts/insight-analysis";
import { parseInsightResponse } from "@/lib/ai/insight-parser";
import { insightRequestSchema, type InsightResponse } from "@/lib/validation/schemas";
import { HELPLINES } from "@/features/crisis/helplines";
import { rateLimitExceededResponse } from "@/lib/security/rate-limit-response";
import type { ExamType } from "@/lib/constants";

/**
 * Mirror Insights analysis for authenticated users.
 *
 * @authenticated Requires valid Supabase session cookie.
 * @ratelimit 10 requests per 15 minutes per user; returns 429 with dynamic Retry-After.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.retryAfterSeconds);
    }

    const body: unknown = await request.json();
    const parsed = insightRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { forceRefresh, entries: clientEntries } = parsed.data;

    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from("insights")
        .select("*")
        .eq("user_id", user.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .single();

      const cachedInsight = cached as {
        triggers: InsightResponse["triggers"];
        patterns: InsightResponse["patterns"];
        burnout_score: number;
        coping_action: string;
        encouragement: string;
      } | null;

      if (cachedInsight) {
        return NextResponse.json({
          triggers: cachedInsight.triggers,
          patterns: cachedInsight.patterns,
          burnoutScore: cachedInsight.burnout_score,
          copingAction: cachedInsight.coping_action,
          encouragement: cachedInsight.encouragement,
          cached: true,
        });
      }
    }

    const profile = await getProfile(user.id);
    const examType = (profile?.exam_type ?? "NEET") as ExamType;

    const { data: entries } = await supabase
      .from("journal_entries")
      .select("encrypted_body, mood_score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(14);

    const typedEntries = entries as Array<{
      encrypted_body: string;
      mood_score: number;
      created_at: string;
    }> | null;
    if (!typedEntries?.length) {
      return NextResponse.json(
        { error: "No journal entries found. Write a few reflections first." },
        { status: 400 },
      );
    }

    const journalForPrompt = clientEntries?.length
      ? clientEntries
      : typedEntries.map((e) => ({
          date: new Date(e.created_at).toISOString().split("T")[0],
          moodScore: e.mood_score,
          body: e.encrypted_body,
        }));

    const allText = journalForPrompt.map((e) => e.body).join(" ");
    const crisis = detectCrisis(allText);

    if (crisis.isCrisis && crisis.severity === "high") {
      return NextResponse.json({
        crisis: true,
        message:
          "We noticed you may be going through something very difficult. Please reach out to a helpline — you don't have to face this alone.",
        helplines: HELPLINES,
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(getDemoInsight(examType));
    }

    const anthropic = new Anthropic({ apiKey });
    const systemPrompt = buildInsightSystemPrompt(examType);
    const userMessage = buildInsightUserMessage(journalForPrompt);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No response from AI" }, { status: 500 });
    }

    const insight = parseInsightResponse(textBlock.text);

    await supabase.from("insights").insert({
      user_id: user.id,
      triggers: insight.triggers,
      patterns: insight.patterns,
      burnout_score: insight.burnoutScore,
      coping_action: insight.copingAction,
      encouragement: insight.encouragement,
    });

    return NextResponse.json({ ...insight, cached: false });
  } catch (error) {
    console.error("Insights API error:", error);
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 });
  }
}

function getDemoInsight(examType: string) {
  return {
    triggers: [
      {
        label: "Pre-mock test anxiety",
        description: `Your stress spikes the night BEFORE ${examType} mock tests, not during the test itself. You write calmly about the exam day but anxious language appears 12-18 hours earlier.`,
        evidence: "Recurring mentions of sleeplessness and 'what if I forget everything' on evenings before scheduled mocks",
        confidence: "high" as const,
      },
    ],
    patterns: [
      {
        label: "Comparison spiral",
        description: "You frequently compare your progress to coaching batchmates, especially after seeing their scores",
        frequency: "4 of last 7 entries",
      },
    ],
    burnoutScore: 62,
    copingAction: "Try a 10-minute wind-down routine the evening before mocks — no syllabus review after 9 PM",
    encouragement: "Noticing this pattern is already a huge step. Your awareness is a superpower most students never develop.",
    crisisFlag: false,
    cached: false,
    demo: true,
  };
}
