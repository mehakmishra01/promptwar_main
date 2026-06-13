import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import { AppShell } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

const CompanionChat = dynamic(
  () => import("@/features/chat/companion-chat").then((m) => m.CompanionChat),
  {
    ssr: false,
    loading: () => <Skeleton className="h-96 w-full" aria-label="Loading companion chat" />,
  },
);

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.onboarding_complete) redirect("/onboarding");

  return (
    <AppShell>
      <CompanionChat examType={profile.exam_type} />
    </AppShell>
  );
}
