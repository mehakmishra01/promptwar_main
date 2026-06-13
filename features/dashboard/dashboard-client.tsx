"use client";

import { useState } from "react";
import Link from "next/link";
import { BurnoutRadar } from "@/features/dashboard/burnout-radar";
import { BreathingExercise } from "@/features/mindfulness/breathing-exercise";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/wellness/glass-card";
import { Activity, BookOpen, MessageCircle, Sparkles, Wind } from "lucide-react";

interface DashboardClientProps {
  userId: string;
  examType: string;
  latestMood: number | null;
}

export function DashboardClient({ userId, examType, latestMood }: DashboardClientProps) {
  const [showBreathing, setShowBreathing] = useState(false);
  const distressLevel = latestMood !== null && latestMood <= 2 ? "high" : "moderate";

  return (
    <div className="space-y-8" aria-labelledby="dashboard-title">
      <header>
        <h1 id="dashboard-title" className="font-display text-2xl font-bold">
          Your Wellness Dashboard
        </h1>
        <p className="text-muted-foreground">Tracking your {examType} preparation wellbeing</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard aria-labelledby="quick-actions-title">
          <h2 id="quick-actions-title" className="mb-4 text-base font-semibold">
            Quick Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button asChild aria-label="Go to journal to write entry">
              <Link href="/journal">
                <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                Write Journal
              </Link>
            </Button>
            <Button asChild variant="outline" aria-label="Go to mirror insights">
              <Link href="/insights">
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                Mirror Insights
              </Link>
            </Button>
            <Button asChild variant="outline" aria-label="Go to companion chat">
              <Link href="/chat">
                <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                Talk to Companion
              </Link>
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowBreathing(true)}
              aria-label="Start breathing exercise"
            >
              <Wind className="mr-2 h-4 w-4" aria-hidden="true" />
              Breathe
            </Button>
          </div>
        </GlassCard>

        <GlassCard aria-labelledby="pulse-title">
          <h2 id="pulse-title" className="text-base font-semibold">
            Today&apos;s Pulse
          </h2>
          <p className="text-sm text-muted-foreground">Latest mood check-in</p>
          <div className="mt-4 flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" aria-hidden="true" />
            <p
              className="text-3xl font-bold"
              aria-label={latestMood ? `Mood score ${latestMood} out of 5` : "No mood logged yet"}
            >
              {latestMood ? `${latestMood}/5` : "—"}
            </p>
          </div>
        </GlassCard>
      </div>

      <BurnoutRadar userId={userId} />

      {showBreathing && (
        <BreathingExercise
          distressLevel={distressLevel}
          onClose={() => setShowBreathing(false)}
        />
      )}
    </div>
  );
}
