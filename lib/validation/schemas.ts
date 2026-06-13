import { z } from "zod";
import { EXAM_TYPES } from "@/lib/constants";

export const examTypeSchema = z.enum(EXAM_TYPES);

export const journalEntrySchema = z.object({
  body: z
    .string()
    .min(10, "Write at least 10 characters to capture your thoughts")
    .max(10000, "Entry is too long (max 10,000 characters)"),
  moodScore: z.number().int().min(1).max(5),
});

export const insightRequestSchema = z.object({
  forceRefresh: z.boolean().optional().default(false),
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(5000),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  history: z.array(chatMessageSchema).max(20).optional().default([]),
});

export const triggerSchema = z.object({
  label: z.string(),
  description: z.string(),
  evidence: z.string(),
  confidence: z.enum(["low", "medium", "high"]),
});

export const patternSchema = z.object({
  label: z.string(),
  description: z.string(),
  frequency: z.string(),
});

export const insightResponseSchema = z.object({
  triggers: z.array(triggerSchema).min(1),
  patterns: z.array(patternSchema).min(1),
  burnoutScore: z.number().min(0).max(100),
  copingAction: z.string(),
  encouragement: z.string(),
  crisisFlag: z.boolean().optional().default(false),
});

export type JournalEntryInput = z.infer<typeof journalEntrySchema>;
export type InsightResponse = z.infer<typeof insightResponseSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const profileUpdateSchema = z.object({
  examType: examTypeSchema,
  consentAccepted: z.literal(true),
});
