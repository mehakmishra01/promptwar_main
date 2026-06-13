import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import { AppShell } from "@/components/app-shell";
import { SettingsContent } from "@/features/settings/settings-content";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.onboarding_complete) redirect("/onboarding");

  return (
    <AppShell>
      <SettingsContent userId={user.id} examType={profile.exam_type} />
    </AppShell>
  );
}
