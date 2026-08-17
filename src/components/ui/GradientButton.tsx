import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type GradientButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  icon?: LucideIcon;
  href?: string;
  variant?: "gradient" | "outline" | "ghost";
};

export function GradientButton({
  children,
  icon: Icon = ArrowRight,
  href,
  variant = "gradient",
  className = "",
  ...props
}: GradientButtonProps) {
  const content = (
    <>
      <span>{children}</span>
      <Icon aria-hidden="true" size={19} strokeWidth={2.2} />
    </>
  );
  const classes = `action-button action-button--${variant} ${className}`;

  if (href) {
    return <a className={classes} href={href}>{content}</a>;
  }

  return <button className={classes} {...props}>{content}</button>;
}

export function SparkleButton(props: Omit<GradientButtonProps, "icon">) {
  return <GradientButton {...props} icon={ArrowRight} />;
}
