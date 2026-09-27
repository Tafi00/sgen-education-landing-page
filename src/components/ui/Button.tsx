import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Link, type LinkProps } from "react-router-dom";

export type ButtonVariant = "primary" | "secondary" | "soft" | "danger";
export type ButtonSize = "md" | "sm" | "icon";

type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Chiếm hết chiều rộng khối cha. */
  block?: boolean;
  className?: string;
};

/** Class chuẩn của nút — dùng khi cần gắn kiểu nút cho phần tử không phải Button/ButtonLink. */
export function buttonClass({ variant = "primary", size = "md", block = false, className = "" }: ButtonStyleProps = {}) {
  return ["btn", `btn--${variant}`, size !== "md" ? `btn--${size}` : "", block ? "btn--block" : "", className]
    .filter(Boolean)
    .join(" ");
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleProps;

export function Button({ variant, size, block, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass({ variant, size, block, className })} {...props} />;
}

type ButtonLinkProps = LinkProps & ButtonStyleProps;

/** Nút điều hướng trong app (react-router). */
export function ButtonLink({ variant, size, block, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass({ variant, size, block, className })} {...props} />;
}

type ButtonAnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & ButtonStyleProps;

/** Nút dạng thẻ <a> cho neo (#id), tel:, mailto: hoặc liên kết ngoài. */
export function ButtonAnchor({ variant, size, block, className, ...props }: ButtonAnchorProps) {
  return <a className={buttonClass({ variant, size, block, className })} {...props} />;
}

/** Hàng nút: khoảng cách, xuống dòng và căn chỉnh thống nhất. */
export function ButtonRow({ children, align = "start", className = "" }: { children: ReactNode; align?: "start" | "center"; className?: string }) {
  return <div className={`btn-row btn-row--${align} ${className}`.trim()}>{children}</div>;
}
