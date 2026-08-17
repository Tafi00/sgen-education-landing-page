import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type SectionBadgeProps = {
  children: ReactNode;
  icon?: LucideIcon;
  dark?: boolean;
};

export function SectionBadge({ children, icon: Icon, dark = false }: SectionBadgeProps) {
  return (
    <span className={`section-badge ${dark ? "section-badge--dark" : ""}`}>
      {Icon ? <Icon aria-hidden="true" size={17} strokeWidth={2.1} /> : null}
      {children}
    </span>
  );
}
