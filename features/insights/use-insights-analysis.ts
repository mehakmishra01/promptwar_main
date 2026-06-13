import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { decryptText } from "@/lib/crypto/journal";
import type { InsightResponse } from "@/lib/validation/schemas";

/**
 * Encapsulates Mirror Insights fetch and analysis mutations.
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
      const supabase = createClient();
      const { data: entries } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(14);

      const decrypted = await Promise.all(
        (entries ?? []).map(async (e) => ({
          body: await decryptText(e.encrypted_body, userId),
          moodScore: e.mood_score,
          date: new Date(e.created_at).toISOString().split("T")[0],
        })),
      );

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRefresh: true, entries: decrypted }),
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
