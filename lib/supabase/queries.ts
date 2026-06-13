import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

/** Fetch the authenticated user's profile. */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error || !data) return null;
  return data as Profile;
}

/** Fetch the user's most recent mood score. */
export async function getLatestMoodScore(userId: string): Promise<number | undefined> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("mood_score")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return (data as { mood_score: number } | null)?.mood_score;
}
