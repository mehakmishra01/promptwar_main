import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoodOrb } from "@/components/mascot/mood-orb";
import { GlassCard } from "@/components/wellness/glass-card";
import { APP_NAME } from "@/lib/constants";
import { BookOpen, MessageCircle, Sparkles } from "lucide-react";

const FEATURES = [
  { icon: BookOpen, label: "Reflective Journal", desc: "Write freely, track mood" },
  { icon: Sparkles, label: "Mirror Insights", desc: "Hidden stress triggers" },
  { icon: MessageCircle, label: "AI Companion", desc: "Always-available support" },
];

export default function HomePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center outline-none"
    >
      <div className="mesh-animate pointer-events-none absolute inset-0 wellness-gradient opacity-50" aria-hidden="true" />

      <section className="relative z-10 max-w-3xl" aria-labelledby="hero-title">
        <MoodOrb moodScore={4} className="mx-auto mb-8 scale-[1.75]" />
        <h1 id="hero-title" className="font-display mb-4 text-5xl font-bold tracking-tight md:text-6xl">
          <span className="text-gradient">{APP_NAME}</span>
        </h1>
        <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
          Standard mood trackers ask 1–5. MindMirror reads between the lines — uncovering hidden
          stress triggers and patterns in your journal, with an empathetic AI companion always by
          your side.
        </p>

        <div className="mb-12 flex flex-wrap justify-center gap-3" role="list" aria-label="Key features">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <GlassCard key={label} className="flex min-w-[140px] flex-col items-center gap-1 px-4 py-3" role="listitem">
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{desc}</span>
            </GlassCard>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" aria-label="Get started with MindMirror">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" aria-label="Sign in to your account">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </section>

      <p className="relative z-10 mt-16 text-xs text-muted-foreground">
        Built for NEET, JEE, CUET, CAT, GATE & UPSC aspirants · Not a substitute for professional
        care
      </p>
    </main>
  );
}
