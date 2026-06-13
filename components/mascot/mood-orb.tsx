"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";

interface MoodOrbProps {
  moodScore?: number;
  className?: string;
}

const MOOD_COLORS: Record<number, string> = {
  1: "from-rose-500/60 to-purple-900/40",
  2: "from-orange-400/50 to-indigo-900/40",
  3: "from-indigo-400/50 to-slate-800/40",
  4: "from-teal-400/50 to-indigo-800/40",
  5: "from-emerald-400/60 to-teal-800/40",
};

/** Animated mascot orb that reflects the user's current mood. */
export const MoodOrb = memo(function MoodOrb({ moodScore = 3, className }: MoodOrbProps) {
  const score = Math.min(5, Math.max(1, moodScore));
  const gradient = MOOD_COLORS[score] ?? MOOD_COLORS[3];

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      role="img"
      aria-label={`MindMirror companion orb reflecting mood level ${score} of 5`}
    >
      <div
        className={cn(
          "h-16 w-16 rounded-full bg-gradient-to-br shadow-lg motion-safe:animate-pulse-soft",
          gradient,
        )}
      />
      <div
        className={cn(
          "absolute h-20 w-20 rounded-full bg-gradient-to-br opacity-30 blur-xl motion-safe:animate-breathe",
          gradient,
        )}
        aria-hidden="true"
      />
    </div>
  );
});

MoodOrb.displayName = "MoodOrb";
