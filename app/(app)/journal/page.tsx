import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getLatestMoodScore } from "@/lib/supabase/queries";
import { AppShell } from "@/components/app-shell";
import { JournalForm } from "@/features/journal/journal-form";
import { JournalTimeline } from "@/features/journal/journal-timeline";

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.onboarding_complete) redirect("/onboarding");

  const latestMood = await getLatestMoodScore(user.id);

  return (
    <AppShell moodScore={latestMood}>
      <div className="space-y-8">
        <JournalForm userId={user.id} />
        <JournalTimeline userId={user.id} />
      </div>
    </AppShell>
  );
}
