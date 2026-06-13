import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile, getLatestMoodScore } from "@/lib/supabase/queries";
import { AppShell } from "@/components/app-shell";
import { DashboardClient } from "@/features/dashboard/dashboard-client";

export default async function DashboardPage() {
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
      <DashboardClient
        userId={user.id}
        examType={profile.exam_type}
        latestMood={latestMood ?? null}
      />
    </AppShell>
  );
}
