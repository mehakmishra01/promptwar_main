import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import { OnboardingFlow } from "@/features/onboarding/onboarding-flow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (profile?.onboarding_complete) redirect("/dashboard");

  return <OnboardingFlow />;
}
