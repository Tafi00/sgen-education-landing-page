import type { ReactNode } from "react";
import { Eyebrow } from "./Eyebrow";

type SectionHeadingProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** Cấp tiêu đề; mặc định h2. */
  as?: "h1" | "h2" | "h3";
  id?: string;
  className?: string;
};

/** Tiêu đề section chuẩn: eyebrow + tiêu đề + mô tả. Màu theo nền sáng/tối của section chứa nó. */
export function SectionHeading({ eyebrow, title, description, align = "left", as: Tag = "h2", id, className = "" }: SectionHeadingProps) {
  return (
    <header className={`section-head section-head--${align} ${className}`.trim()}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Tag id={id}>{title}</Tag>
      {description ? <p>{description}</p> : null}
    </header>
  );
}
