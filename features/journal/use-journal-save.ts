import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { encryptText } from "@/lib/crypto/journal";
import { journalEntrySchema } from "@/lib/validation/schemas";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Encapsulates journal entry persistence with debounced autosave.
 */
export function useJournalSave(userId: string) {
  const queryClient = useQueryClient();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (data: { body: string; moodScore: number }) => {
      const encrypted = await encryptText(data.body, userId);
      const supabase = createClient();
      const { error } = await supabase.from("journal_entries").insert({
        user_id: userId,
        encrypted_body: encrypted,
        mood_score: data.moodScore,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const debouncedSave = useCallback(
    (text: string, mood: number, onStatus: (s: SaveStatus) => void) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const result = journalEntrySchema.safeParse({ body: text, moodScore: mood });
        if (!result.success) return;
        onStatus("saving");
        saveMutation.mutate(
          { body: text, moodScore: mood },
          { onSuccess: () => onStatus("saved"), onError: () => onStatus("error") },
        );
      }, 500);
    },
    [saveMutation],
  );

  const saveNow = useCallback(
    (
      body: string,
      moodScore: number,
      callbacks?: { onSuccess?: () => void; onStatus?: (s: SaveStatus) => void },
    ) => {
      callbacks?.onStatus?.("saving");
      saveMutation.mutate(
        { body, moodScore },
        {
          onSuccess: () => {
            callbacks?.onStatus?.("saved");
            callbacks?.onSuccess?.();
          },
          onError: () => callbacks?.onStatus?.("error"),
        },
      );
    },
    [saveMutation],
  );

  return { saveMutation, debouncedSave, saveNow, debounceRef };
}
