import dynamic from "next/dynamic";
import { requireOnboardedUser } from "@/lib/auth/require-onboarded-user";
import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

const MirrorInsights = dynamic(
  () => import("@/features/insights/mirror-insights").then((m) => m.MirrorInsights),
  {
    loading: () => (
      <Skeleton className="h-64 w-full" role="status" aria-label="Loading mirror insights" />
    ),
  },
);

export default async function InsightsPage() {
  const { user, profile } = await requireOnboardedUser();

  return (
    <AppShell>
      <MirrorInsights userId={user.id} examType={profile.exam_type} />
    </AppShell>
  );
}
