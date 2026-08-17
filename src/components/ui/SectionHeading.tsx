import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionBadge } from "./SectionBadge";

type SectionHeadingProps = {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  icon?: LucideIcon;
  dark?: boolean;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  icon,
  dark = false,
  align = "center",
}: SectionHeadingProps) {
  return (
    <Reveal className={`section-heading section-heading--${align} ${dark ? "section-heading--dark" : ""}`}>
      <SectionBadge icon={icon} dark={dark}>{eyebrow}</SectionBadge>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </Reveal>
  );
}
