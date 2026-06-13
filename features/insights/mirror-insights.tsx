"use client";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/wellness/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { CrisisModal } from "@/features/crisis/crisis-modal";
import { useInsightsAnalysis } from "@/features/insights/use-insights-analysis";
import { Sparkles } from "lucide-react";

interface MirrorInsightsProps {
  userId: string;
  examType: string;
}

/** Mirror Insights — the Pattern Engine wow moment. */
export function MirrorInsights({ userId, examType }: MirrorInsightsProps) {
  const {
    analyzeMutation,
    result,
    isLoading,
    crisisOpen,
    setCrisisOpen,
  } = useInsightsAnalysis(userId);

  return (
    <section className="space-y-6" aria-labelledby="insights-title">
      <div className="flex items-center justify-between">
        <div>
          <h1 id="insights-title" className="font-display text-2xl font-bold">
            Mirror Insights
          </h1>
          <p className="text-muted-foreground">
            Hidden patterns your {examType} mood tracker can&apos;t see
          </p>
        </div>
        <Button
          onClick={() => analyzeMutation.mutate()}
          disabled={analyzeMutation.isPending}
          aria-label="Analyze my journal patterns"
          aria-describedby="analyze-status"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {analyzeMutation.isPending ? "Analyzing…" : "Analyze My Mirror"}
        </Button>
      </div>

      <p id="analyze-status" role="status" aria-live="polite" className="sr-only">
        {analyzeMutation.isPending ? "Analyzing your journal entries" : ""}
      </p>

      {analyzeMutation.isPending && (
        <div className="space-y-4" aria-busy="true" aria-label="Loading insights">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {analyzeMutation.isError && !crisisOpen && (
        <p role="alert" className="text-sm text-destructive" aria-label="Insights error">
          {(analyzeMutation.error as Error).message}
        </p>
      )}

      {result && !analyzeMutation.isPending && (
        <div aria-live="polite" className="space-y-4">
          <GlassCard glow aria-labelledby="trigger-title">
            <h2 id="trigger-title" className="text-lg font-semibold text-primary">
              Hidden Trigger Revealed
            </h2>
            <p className="text-sm text-muted-foreground">What standard trackers miss</p>
            <div className="mt-4 space-y-3">
              <p className="font-semibold">{result.triggers[0]?.label}</p>
              <p className="text-sm">{result.triggers[0]?.description}</p>
              <blockquote className="border-l-2 border-primary/50 pl-4 text-sm italic text-muted-foreground">
                &ldquo;{result.triggers[0]?.evidence}&rdquo;
              </blockquote>
              <p className="text-xs text-muted-foreground">
                Confidence: {result.triggers[0]?.confidence}
              </p>
            </div>
          </GlassCard>

          {result.patterns.map((pattern) => (
            <GlassCard key={pattern.label} aria-labelledby={`pattern-${pattern.label}`}>
              <h3 id={`pattern-${pattern.label}`} className="text-base font-semibold">
                {pattern.label}
              </h3>
              <p className="text-sm text-muted-foreground">{pattern.frequency}</p>
              <p className="mt-2 text-sm">{pattern.description}</p>
            </GlassCard>
          ))}

          <GlassCard aria-labelledby="coping-title">
            <h3 id="coping-title" className="mb-2 text-sm font-medium">
              Suggested coping action
            </h3>
            <p className="text-sm text-muted-foreground">{result.copingAction}</p>
            <p className="mt-4 text-sm italic text-accent">{result.encouragement}</p>
          </GlassCard>
        </div>
      )}

      {!result && !analyzeMutation.isPending && !isLoading && (
        <GlassCard>
          <p className="py-8 text-center text-muted-foreground">
            Write a few journal entries, then tap &ldquo;Analyze My Mirror&rdquo; to uncover hidden
            stress patterns.
          </p>
        </GlassCard>
      )}

      <CrisisModal open={crisisOpen} onOpenChange={setCrisisOpen} />
    </section>
  );
}
