"use client";

import { useEffect, useState } from "react";
import { journalEntrySchema } from "@/lib/validation/schemas";
import { detectCrisis } from "@/lib/ai/crisis-detector";
import { useJournalSave, type SaveStatus } from "@/features/journal/use-journal-save";
import { MoodPulse } from "@/features/journal/mood-pulse";
import { CrisisModal } from "@/features/crisis/crisis-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/wellness/glass-card";

interface JournalFormProps {
  userId: string;
}

/** Reflective journaling form with debounced autosave and mood pulse. */
export function JournalForm({ userId }: JournalFormProps) {
  const [body, setBody] = useState("");
  const [moodScore, setMoodScore] = useState(3);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const { saveMutation, debouncedSave, saveNow, debounceRef } = useJournalSave(userId);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [debounceRef]);

  function handleBodyChange(text: string) {
    setBody(text);
    if (text.length >= 10) {
      debouncedSave(text, moodScore, setSaveStatus);
    }
  }

  function handleMoodChange(score: number) {
    setMoodScore(score);
    if (body.length >= 10) {
      debouncedSave(body, score, setSaveStatus);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = journalEntrySchema.safeParse({ body, moodScore });
    if (!result.success) {
      setValidationError(result.error.errors[0]?.message ?? "Invalid entry");
      return;
    }
    setValidationError(null);

    const crisis = detectCrisis(body);
    if (crisis.isCrisis && crisis.severity === "high") {
      setCrisisOpen(true);
    }

    saveNow(body, moodScore, {
      onStatus: setSaveStatus,
      onSuccess: () => {
        setBody("");
        setMoodScore(3);
      },
    });
  }

  return (
    <>
      <GlassCard aria-labelledby="journal-title">
        <h1 id="journal-title" className="font-display mb-1 text-xl font-semibold">
          Today&apos;s Reflection
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Write freely — MindMirror finds patterns standard trackers miss
        </p>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-label="Journal entry form">
          <MoodPulse value={moodScore} onChange={handleMoodChange} />
          <div className="space-y-2">
            <Label htmlFor="journal-body">What&apos;s on your mind?</Label>
            <Textarea
              id="journal-body"
              value={body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder="I studied for 6 hours but couldn't focus during the mock test..."
              aria-label="Journal entry text"
              aria-describedby="char-count save-status"
              rows={6}
              className="border-white/10 bg-background/50"
            />
            <p id="char-count" className="text-xs text-muted-foreground">
              {body.length} / 10,000 characters
            </p>
          </div>
          {validationError && (
            <p role="alert" className="text-sm text-destructive" aria-label="Validation error">
              {validationError}
            </p>
          )}
          <div className="flex items-center justify-between">
            <p
              id="save-status"
              role="status"
              aria-live="polite"
              className="text-xs text-muted-foreground"
            >
              {saveStatus === "saving" && "Saving draft…"}
              {saveStatus === "saved" && "Entry saved"}
              {saveStatus === "error" && "Failed to save — try again"}
            </p>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              aria-label="Save journal entry"
            >
              Save Entry
            </Button>
          </div>
        </form>
      </GlassCard>
      <CrisisModal open={crisisOpen} onOpenChange={setCrisisOpen} />
    </>
  );
}
