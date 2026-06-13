import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { detectCrisis } from "@/lib/ai/crisis-detector";
import { buildCompanionSystemPrompt } from "@/lib/ai/prompts/companion-chat";
import { chatRequestSchema } from "@/lib/validation/schemas";
import { HELPLINES, THERAPY_DISCLAIMER } from "@/features/crisis/helplines";
import type { ExamType } from "@/lib/constants";

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
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429, headers: { "Retry-After": "900" } },
      );
    }

    const body: unknown = await request.json();
    const parsed = chatRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { message, history } = parsed.data;
    const crisis = detectCrisis(message);

    if (crisis.isCrisis && crisis.severity === "high") {
      const crisisResponse = `I hear you, and I'm really glad you shared this. ${THERAPY_DISCLAIMER}

What you're feeling matters, and you deserve real support right now. Please reach out to:
- Tele-MANAS: 14416 (24/7)
- iCall: 9152987821
- AASRA: 9820466726

You don't have to go through this alone. Is there someone you trust who you could talk to today?`;

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: crisisResponse, crisis: true, helplines: HELPLINES })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const profile = await getProfile(user.id);
    const examType = (profile?.exam_type ?? "NEET") as ExamType;

    const { data: recentEntries } = await supabase
      .from("journal_entries")
      .select("mood_score")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(7);

    const moodScores =
      (recentEntries as Array<{ mood_score: number }> | null)?.map((e) => e.mood_score) ?? [];
    const recentMoodAvg =
      moodScores.length > 0
        ? moodScores.reduce((a, b) => a + b, 0) / moodScores.length
        : null;

    const journalSummary =
      (body as { journalSummary?: string }).journalSummary ?? "Recent journaling activity";

    const systemPrompt = buildCompanionSystemPrompt({
      examType,
      recentMoodAvg,
      journalSummary,
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return streamDemoResponse(examType, message);
    }

    const anthropic = new Anthropic({ apiKey });

    const messages = [
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      stream: true,
      system: systemPrompt,
      messages,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`),
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {
          controller.error(new Error("Stream error"));
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}

function streamDemoResponse(examType: string, message: string) {
  const demoText = `I hear you — preparing for ${examType} can feel overwhelming, especially when ${message.toLowerCase().includes("anxious") ? "anxiety creeps in before big moments" : "focus feels impossible"}.

Here's something that might help right now: try the 4-7-8 breath — inhale for 4 counts, hold for 7, exhale for 8. Do this three times.

Remember, mock tests are feedback, not verdicts on your future. Every ${examType} topper has had days exactly like this.

What's one small thing you could do in the next 30 minutes to feel even slightly better?`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: demoText })}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
