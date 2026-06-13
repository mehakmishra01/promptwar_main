"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/wellness/glass-card";
import { MoodOrb } from "@/components/mascot/mood-orb";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const redirect = searchParams.get("redirect") || "/dashboard";
    router.push(redirect);
    router.refresh();
  }

  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center px-4 wellness-gradient outline-none">
      <GlassCard className="w-full max-w-md" aria-labelledby="login-title">
        <div className="mb-6 flex flex-col items-center gap-3">
          <MoodOrb moodScore={3} />
          <h1 id="login-title" className="font-display text-2xl font-bold">
            Welcome back to {APP_NAME}
          </h1>
          <p className="text-sm text-muted-foreground">Sign in to continue your wellness journey</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-label="Sign in form">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <input
              id="email"
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
            <Label htmlFor="password">Password</Label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              className="flex h-10 w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive" aria-label="Login error">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading} aria-label="Sign in">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="text-primary underline" aria-label="Go to sign up page">
            Sign up
          </Link>
        </p>
      </GlassCard>
    </main>
  );
}
