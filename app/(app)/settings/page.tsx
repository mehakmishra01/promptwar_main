import { requireOnboardedUser } from "@/lib/auth/require-onboarded-user";
import { AppShell } from "@/components/app-shell";
import { SettingsContent } from "@/features/settings/settings-content";

export default async function SettingsPage() {
  const { user, profile } = await requireOnboardedUser();

  return (
    <AppShell>
      <SettingsContent userId={user.id} examType={profile.exam_type} />
    </AppShell>
  );
}
