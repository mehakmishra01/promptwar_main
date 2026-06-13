import { LucideIcon } from "lucide-react";

interface AccessibleIconProps {
  icon: LucideIcon;
  label: string;
  className?: string;
}

/** Icon with aria-hidden; parent must provide aria-label. */
export function AccessibleIcon({ icon: Icon, label, className }: AccessibleIconProps) {
  return <Icon className={className} aria-hidden="true" aria-label={label} />;
}
