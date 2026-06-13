import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

const MirrorInsights = dynamic(
  () => import("@/features/insights/mirror-insights").then((m) => m.MirrorInsights),
  {
    loading: () => <Skeleton className="h-64 w-full" aria-label="Loading mirror insights" />,
  },
);

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.onboarding_complete) redirect("/onboarding");

  return (
    <AppShell>
      <MirrorInsights userId={user.id} examType={profile.exam_type} />
    </AppShell>
  );
}
