import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EyebrowProps = {
  children: ReactNode;
  icon?: LucideIcon;
  /** `pill`: nhãn viên thuốc ở hero. `text`: chữ nhỏ trên tiêu đề section. */
  variant?: "pill" | "text";
  className?: string;
};

/** Nhãn nhỏ phía trên tiêu đề. Màu tự đổi theo nền sáng/tối của khối cha. */
export function Eyebrow({ children, icon: Icon, variant = "text", className = "" }: EyebrowProps) {
  return (
    <span className={`eyebrow eyebrow--${variant} ${className}`.trim()}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
