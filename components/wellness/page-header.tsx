import { MoodOrb } from "@/components/mascot/mood-orb";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  moodScore?: number;
  id?: string;
}

/** Reusable page header with optional mood orb. */
export function PageHeader({ title, subtitle, moodScore, id = "page-title" }: PageHeaderProps) {
  return (
    <header className="mb-8 flex items-start gap-4" aria-labelledby={id}>
      {moodScore !== undefined && <MoodOrb moodScore={moodScore} />}
      <div>
        <h1 id={id} className="font-display text-3xl font-bold tracking-tight text-gradient">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
    </header>
  );
}
