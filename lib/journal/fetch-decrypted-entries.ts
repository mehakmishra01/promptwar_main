import { createClient } from "@/lib/supabase/client";
import { decryptText } from "@/lib/crypto/journal";
import type { JournalEntry } from "@/lib/supabase/types";

export interface FetchJournalOptions {
  /** Maximum entries to return. @default 14 */
  limit?: number;
  /** Sort direction by created_at. @default "desc" */
  order?: "asc" | "desc";
}

export interface DecryptedJournalEntry extends JournalEntry {
  body: string;
}

/**
 * Fetches and decrypts journal entries for a user (client-side).
 *
 * @param userId - Authenticated user id.
 * @param options - Query limit and sort order.
 * @returns Decrypted journal rows with plaintext body.
 */
export async function fetchDecryptedJournalEntries(
  userId: string,
  options: FetchJournalOptions = {},
): Promise<DecryptedJournalEntry[]> {
  const { limit = 14, order = "desc" } = options;
  const supabase = createClient();
  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: order === "asc" })
    .limit(limit);

  if (error) throw error;

  return Promise.all(
    (data ?? []).map(async (entry) => ({
      ...(entry as JournalEntry),
      body: await decryptText(entry.encrypted_body, userId).catch(() => "[encrypted]"),
    })),
  );
}
