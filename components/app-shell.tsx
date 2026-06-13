"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { MoodOrb } from "@/components/mascot/mood-orb";
import { BookOpen, LayoutDashboard, MessageCircle, Sparkles, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/chat", label: "Companion", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppShellProps {
  children: React.ReactNode;
  moodScore?: number;
}

export function AppShell({ children, moodScore }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-24 pt-6 md:pb-8 md:pt-8">
      <div className="glass-card mb-8 flex items-center justify-between rounded-xl px-4 py-3" role="region" aria-label="App header">
        <div className="flex items-center gap-3">
          <MoodOrb moodScore={moodScore} />
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">{APP_NAME}</p>
            <p className="text-sm text-muted-foreground">Your reflective wellness companion</p>
          </div>
        </div>
      </div>

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <nav
        className="glass-card fixed bottom-0 left-0 right-0 border-t border-white/10 md:static md:mt-8 md:rounded-xl md:border"
        aria-label="Main navigation"
      >
        <ul className="mx-auto flex max-w-5xl justify-around gap-1 px-2 py-2 md:justify-start md:gap-2 md:px-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex-row md:text-sm",
                    active
                      ? "bg-primary/20 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                  aria-label={`Go to ${label}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <footer className="mt-8 hidden text-center text-xs text-muted-foreground md:block" aria-label="Crisis footer">
        <p>
          In crisis? Call Tele-MANAS{" "}
          <a href="tel:14416" className="text-primary underline" aria-label="Call Tele-MANAS at 14416">
            14416
          </a>{" "}
          — 24/7 support
        </p>
      </footer>
    </div>
  );
}
