import { getLatestMoodScore } from "@/lib/supabase/queries";
import { requireOnboardedUser } from "@/lib/auth/require-onboarded-user";
import { AppShell } from "@/components/app-shell";
import { DashboardClient } from "@/features/dashboard/dashboard-client";

export default async function DashboardPage() {
  const { user, profile } = await requireOnboardedUser();
  const latestMood = await getLatestMoodScore(user.id);

  return (
    <AppShell moodScore={latestMood}>
      <DashboardClient
        userId={user.id}
        examType={profile.exam_type}
        latestMood={latestMood ?? null}
      />
    </AppShell>
  );
}
