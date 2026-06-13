import { getLatestMoodScore } from "@/lib/supabase/queries";
import { requireOnboardedUser } from "@/lib/auth/require-onboarded-user";
import { AppShell } from "@/components/app-shell";
import { JournalForm } from "@/features/journal/journal-form";
import { JournalTimeline } from "@/features/journal/journal-timeline";

export default async function JournalPage() {
  const { user, profile } = await requireOnboardedUser();
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
