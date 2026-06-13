import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/supabase/queries";
import type { Profile } from "@/lib/supabase/types";
import type { User } from "@supabase/supabase-js";

export interface OnboardedSession {
  user: User;
  profile: Profile;
}

/**
 * Ensures the request has an authenticated user who completed onboarding.
 *
 * @returns The Supabase user and profile when the session is valid.
 * @throws Redirects to `/login` or `/onboarding` when requirements are not met.
 */
export async function requireOnboardedUser(): Promise<OnboardedSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = await getProfile(user.id);
  if (!profile?.onboarding_complete) redirect("/onboarding");

  return { user, profile };
}
