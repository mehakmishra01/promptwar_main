"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/wellness/glass-card";
import { cn } from "@/lib/utils";

type Phase = "inhale" | "hold" | "exhale" | "idle";

interface BreathingExerciseProps {
  distressLevel?: "moderate" | "high";
  onClose?: () => void;
}

const PATTERNS = {
  moderate: { inhale: 4, hold: 4, exhale: 4, label: "4-4-4 Box Breathing" },
  high: { inhale: 4, hold: 7, exhale: 8, label: "4-7-8 Calming Breath" },
};

/** Adaptive micro-mindfulness breathing exercise. */
export function BreathingExercise({ distressLevel = "moderate", onClose }: BreathingExerciseProps) {
  const pattern = PATTERNS[distressLevel];
  const [phase, setPhase] = useState<Phase>("idle");
  const [active, setActive] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const runCycle = useCallback(() => {
    const phases: Array<{ phase: Phase; duration: number }> = [
      { phase: "inhale", duration: pattern.inhale },
      { phase: "hold", duration: pattern.hold },
      { phase: "exhale", duration: pattern.exhale },
    ];

    let index = 0;
    setPhase(phases[0].phase);
    setCountdown(phases[0].duration);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          index = (index + 1) % phases.length;
          setPhase(phases[index].phase);
          return phases[index].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pattern]);

  useEffect(() => {
    if (!active) return;
    return runCycle();
  }, [active, runCycle]);

  const phaseLabel = {
    idle: "Ready",
    inhale: "Breathe in",
    hold: "Hold",
    exhale: "Breathe out",
  };

  return (
    <GlassCard aria-labelledby="breathing-title">
      <h2 id="breathing-title" className="font-display text-lg font-semibold">
        Micro-Mindfulness
      </h2>
      <p className="text-sm text-muted-foreground">
        {pattern.label} — {distressLevel === "high" ? "for acute distress" : "for moderate stress"}
      </p>
      <div className="mt-6 flex flex-col items-center gap-6">
        {reducedMotion ? (
          <ol className="list-decimal space-y-2 pl-5 text-sm" aria-label="Breathing instructions">
            <li>Inhale slowly for {pattern.inhale} seconds</li>
            <li>Hold for {pattern.hold} seconds</li>
            <li>Exhale slowly for {pattern.exhale} seconds</li>
            <li>Repeat 3 times</li>
          </ol>
        ) : (
          <div
            className={cn(
              "flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-accent/30 motion-safe:transition-transform motion-safe:duration-1000",
              phase === "inhale" && "motion-safe:scale-125",
              phase === "exhale" && "motion-safe:scale-90",
            )}
            role="img"
            aria-label={`Breathing phase: ${phaseLabel[phase]}, ${countdown} seconds remaining`}
          >
            <div className="text-center">
              <p className="text-lg font-medium">{phaseLabel[phase]}</p>
              {active && <p className="text-3xl font-bold">{countdown}</p>}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={() => setActive((a) => !a)}
            aria-pressed={active}
            aria-label={active ? "Pause breathing exercise" : "Start breathing exercise"}
          >
            {active ? "Pause" : "Start"}
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose} aria-label="Close breathing exercise">
              Close
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Press Space to start/pause, Escape to close</p>
      </div>
    </GlassCard>
  );
}
