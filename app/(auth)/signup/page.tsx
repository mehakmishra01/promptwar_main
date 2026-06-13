"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/wellness/glass-card";
import { MoodOrb } from "@/components/mascot/mood-orb";
import { APP_NAME } from "@/lib/constants";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center px-4 wellness-gradient outline-none">
      <GlassCard className="w-full max-w-md" aria-labelledby="signup-title">
        <div className="mb-6 flex flex-col items-center gap-3">
          <MoodOrb moodScore={4} />
          <h1 id="signup-title" className="font-display text-2xl font-bold">
            Join {APP_NAME}
          </h1>
          <p className="text-sm text-muted-foreground">Start your reflective wellness journey</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Sign up form">
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
              className="flex h-10 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password, minimum 6 characters"
              className="flex h-10 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive" aria-label="Sign up error">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading} aria-label="Create account">
            {loading ? "Creating account…" : "Sign Up"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline" aria-label="Go to sign in page">
            Sign in
          </Link>
        </p>
      </GlassCard>
    </main>
  );
}
