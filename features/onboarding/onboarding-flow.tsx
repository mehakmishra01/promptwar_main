"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EXAM_TYPES, type ExamType } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/wellness/glass-card";
import { Label } from "@/components/ui/label";
import { CRISIS_DISCLAIMER, THERAPY_DISCLAIMER } from "@/features/crisis/helplines";
import { cn } from "@/lib/utils";

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [examType, setExamType] = useState<ExamType>("NEET");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function completeOnboarding() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        exam_type: examType,
        consent_at: new Date().toISOString(),
        onboarding_complete: true,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <GlassCard aria-labelledby="onboarding-title">
        <h1 id="onboarding-title" className="font-display mb-2 text-2xl font-bold">
          Welcome to MindMirror
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Step {step} of 2 — Let&apos;s personalize your experience
        </p>

        {step === 1 && (
          <fieldset>
            <legend className="mb-4 text-sm font-medium">Which exam are you preparing for?</legend>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Exam type selection">
              {EXAM_TYPES.map((exam) => (
                <button
                  key={exam}
                  type="button"
                  role="radio"
                  aria-checked={examType === exam}
                  aria-label={`Select ${exam} exam preparation`}
                  onClick={() => setExamType(exam)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    examType === exam
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted",
                  )}
                >
                  <span className="font-semibold">{exam}</span>
                </button>
              ))}
            </div>
            <Button className="mt-6 w-full" onClick={() => setStep(2)} aria-label="Continue to consent step">
              Continue
            </Button>
          </fieldset>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm">
              <p className="mb-2 font-medium">Privacy & consent</p>
              <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                <li>Your journal is encrypted before storage</li>
                <li>AI analysis uses your entries to find patterns — never sold or shared</li>
                <li>You can delete all your data anytime in Settings</li>
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">{THERAPY_DISCLAIMER}</p>
            <p className="text-sm text-muted-foreground">{CRISIS_DISCLAIMER}</p>
            <div className="flex items-start gap-3">
              <input
                id="consent"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-input"
                aria-describedby="consent-label"
                aria-label="Consent to AI analysis and privacy terms"
              />
              <Label id="consent-label" htmlFor="consent" className="font-normal">
                I understand MindMirror is not a therapist and I consent to AI analysis of my
                encrypted journal entries.
              </Label>
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive" aria-label="Onboarding error">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} aria-label="Go back to exam selection">
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!consent || loading}
                onClick={completeOnboarding}
                aria-label="Complete onboarding and start journey"
              >
                {loading ? "Saving…" : "Start My Journey"}
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
