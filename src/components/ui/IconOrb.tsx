import type { LucideIcon } from "lucide-react";

type IconOrbProps = {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  label?: string;
};

export function IconOrb({ icon: Icon, size = "md", label }: IconOrbProps) {
  return (
    <span className={`icon-orb icon-orb--${size}`} role={label ? "img" : undefined} aria-label={label}>
      <Icon aria-hidden={label ? undefined : "true"} strokeWidth={1.8} />
    </span>
  );
}
