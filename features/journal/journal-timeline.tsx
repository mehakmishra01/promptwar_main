"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { decryptText } from "@/lib/crypto/journal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOOD_LABELS } from "@/lib/constants";

interface JournalTimelineProps {
  userId: string;
}

export function JournalTimeline({ userId }: JournalTimelineProps) {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["journal-entries", userId],
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(14);

      if (error) throw error;

      const decrypted = await Promise.all(
        (data ?? []).map(async (entry) => ({
          ...entry,
          body: await decryptText(entry.encrypted_body, userId).catch(() => "[encrypted]"),
        })),
      );

      return decrypted;
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading entries…</p>;
  }

  if (!entries?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No entries yet. Write your first reflection above.
      </p>
    );
  }

  return (
    <section aria-label="Recent journal entries">
      <h2 className="mb-4 text-lg font-semibold">Recent Entries</h2>
      <ul className="space-y-3" role="list">
        {entries.map((entry) => {
          const mood = MOOD_LABELS.find((m) => m.score === entry.mood_score);
          return (
            <li key={entry.id}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm font-medium">
                    <time dateTime={entry.created_at}>
                      {new Date(entry.created_at).toLocaleDateString("en-IN", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    <span aria-label={`Mood: ${mood?.label}`}>
                      {mood?.emoji} {mood?.label}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3 text-sm text-muted-foreground">{entry.body}</p>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
