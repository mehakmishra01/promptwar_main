import dynamic from "next/dynamic";
import { requireOnboardedUser } from "@/lib/auth/require-onboarded-user";
import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

const CompanionChat = dynamic(
  () => import("@/features/chat/companion-chat").then((m) => m.CompanionChat),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-96 w-full" role="status" aria-label="Loading companion chat" />
    ),
  },
);

export default async function ChatPage() {
  const { user, profile } = await requireOnboardedUser();

  return (
    <AppShell>
      <CompanionChat examType={profile.exam_type} />
    </AppShell>
  );
}
