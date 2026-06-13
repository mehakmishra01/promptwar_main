import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDecryptedJournalEntries } from "@/lib/journal/fetch-decrypted-entries";
import type { InsightResponse } from "@/lib/validation/schemas";

/**
 * Encapsulates Mirror Insights fetch and analysis mutations.
 *
 * @param userId - Authenticated user id for journal decryption and cache keys.
 * @returns Insight query state, analyze mutation, and crisis modal controls.
 */
export function useInsightsAnalysis(userId: string) {
  const [crisisOpen, setCrisisOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: insight, isLoading } = useQuery({
    queryKey: ["insights", userId],
    queryFn: async () => {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRefresh: false }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to load insights");
      }
      return (await res.json()) as InsightResponse & { cached?: boolean; crisis?: boolean };
    },
    retry: false,
    enabled: false,
    staleTime: 60 * 60 * 1000,
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const decrypted = await fetchDecryptedJournalEntries(userId, { limit: 14, order: "desc" });
      const entries = decrypted.map((e) => ({
        body: e.body,
        moodScore: e.mood_score,
        date: new Date(e.created_at).toISOString().split("T")[0],
      }));

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRefresh: true, entries }),
      });

      const data = await res.json();
      if (data.crisis) {
        setCrisisOpen(true);
        throw new Error("Crisis detected");
      }
      if (!res.ok) throw new Error(data.error ?? "Analysis failed");
      return data as InsightResponse;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["insights", userId], data);
    },
  });

  return {
    insight,
    isLoading,
    analyzeMutation,
    result: analyzeMutation.data ?? insight,
    crisisOpen,
    setCrisisOpen,
  };
}
