import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

/** Glassmorphism card surface for wellness UI. */
export function GlassCard({ className, glow, children, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-xl border border-white/10 bg-card/60 p-6 shadow-lg backdrop-blur-md",
        glow && "glow-ring",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
