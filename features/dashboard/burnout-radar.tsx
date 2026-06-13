"use client";

import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { decryptText } from "@/lib/crypto/journal";
import {
  calculateBurnoutScore,
  getBurnoutRisk,
  getBurnoutRiskLabel,
} from "@/lib/ai/burnout-score";
import { GlassCard } from "@/components/wellness/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const BurnoutChart = dynamic(() => import("@/features/dashboard/burnout-chart").then((m) => m.BurnoutChart), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" role="status" aria-label="Loading burnout chart" />,
});

interface BurnoutRadarProps {
  userId: string;
}

export function BurnoutRadar({ userId }: BurnoutRadarProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", userId],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data: entries } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(14);

      const decrypted = await Promise.all(
        (entries ?? []).map(async (e) => ({
          mood: e.mood_score,
          body: await decryptText(e.encrypted_body, userId).catch(() => ""),
          date: new Date(e.created_at).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          createdAt: e.created_at,
        })),
      );

      const moodScores = decrypted.map((d) => d.mood);
      const lastEntry = decrypted[decrypted.length - 1];
      const daysSinceLast = lastEntry
        ? Math.floor(
            (Date.now() - new Date(lastEntry.createdAt).getTime()) / (1000 * 60 * 60 * 24),
          )
        : 0;

      const burnoutScore = calculateBurnoutScore({
        moodScores,
        entryBodies: decrypted.map((d) => d.body),
        daysSinceLastEntry: daysSinceLast,
      });

      const risk = getBurnoutRisk(burnoutScore);

      return { chartData: decrypted, burnoutScore, risk };
    },
  });

  if (isLoading) {
    return <Skeleton className="h-80 w-full" role="status" aria-label="Loading burnout radar" />;
  }

  if (!data?.chartData.length) {
    return (
      <GlassCard aria-label="Burnout radar empty state">
        <p className="py-8 text-center text-muted-foreground">
          Start journaling to see your Burnout Radar
        </p>
      </GlassCard>
    );
  }

  const riskColors = {
    low: "text-emerald-400 border-emerald-400/30",
    moderate: "text-amber-400 border-amber-400/30",
    high: "text-rose-400 border-rose-400/30",
  };

  return (
    <section aria-labelledby="burnout-radar-title">
      <GlassCard>
        <h2 id="burnout-radar-title" className="font-display text-lg font-semibold">
          Burnout Radar
        </h2>
        <p className="text-sm text-muted-foreground">Your emotional trend over recent entries</p>
        <div className="mt-6 space-y-6">
          <div
            className={cn("rounded-lg border p-4", riskColors[data.risk])}
            role="status"
            aria-label={`Burnout risk: ${getBurnoutRiskLabel(data.risk)}. Score ${data.burnoutScore} out of 100.`}
          >
            <p className="text-3xl font-bold">{data.burnoutScore}</p>
            <p className="text-sm">{getBurnoutRiskLabel(data.risk)}</p>
          </div>

          <BurnoutChart data={data.chartData} burnoutScore={data.burnoutScore} />

          <table className="sr-only" aria-label="Mood data table">
            <caption>Mood scores over time</caption>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Mood</th>
              </tr>
            </thead>
            <tbody>
              {data.chartData.map((row) => (
                <tr key={row.date}>
                  <td>{row.date}</td>
                  <td>{row.mood} out of 5</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </section>
  );
}
