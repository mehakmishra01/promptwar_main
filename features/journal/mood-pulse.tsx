"use client";

import { useCallback, useEffect, useState } from "react";
import { MOOD_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MoodPulseProps {
  value: number;
  onChange: (score: number) => void;
}

/** Accessible 5-point mood pulse selector. */
export function MoodPulse({ value, onChange }: MoodPulseProps) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium">How are you feeling right now?</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Mood score">
        {MOOD_LABELS.map(({ score, label, emoji }) => (
          <button
            key={score}
            type="button"
            role="radio"
            aria-checked={value === score}
            aria-label={`${label}, ${score} out of 5`}
            onClick={() => onChange(score)}
            className={cn(
              "flex min-w-[4.5rem] flex-col items-center gap-1 rounded-lg border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === score
                ? "border-primary bg-primary/15"
                : "border-border hover:bg-muted",
            )}
          >
            <span aria-hidden="true" className="text-xl">
              {emoji}
            </span>
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
