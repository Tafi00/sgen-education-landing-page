import { Children, type CSSProperties, type ReactNode, type Ref } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { Eyebrow } from "./Eyebrow";

const DARK_BG = "url(/assets/backgrounds/cosmic-dark-clean.webp)";

/* ---------------------------------------------------------------------------
   PageHero — hero chuẩn của mọi trang con.
   --------------------------------------------------------------------------- */
type PageHeroProps = {
  eyebrow?: ReactNode;
  eyebrowIcon?: LucideIcon;
  title: ReactNode;
  /** Dòng thứ hai của tiêu đề, tô màu nhấn. */
  accent?: ReactNode;
  description?: ReactNode;
  /** Hàng nút (thường là ButtonRow). */
  actions?: ReactNode;
  /** Nội dung phụ phía trên eyebrow, ví dụ breadcrumb. */
  before?: ReactNode;
  /** Nội dung bổ sung dưới mô tả (meta, tag…). */
  children?: ReactNode;
  align?: "left" | "center";
  background?: string;
  className?: string;
  ref?: Ref<HTMLElement>;
};

export function PageHero({
  eyebrow,
  eyebrowIcon,
  title,
  accent,
  description,
  actions,
  before,
  children,
  align = "left",
  background = DARK_BG,
  className = "",
  ref,
}: PageHeroProps) {
  return (
    <section ref={ref} className={`page-banner page-banner--${align} tone-dark ${className}`.trim()} style={{ "--banner-bg": background } as CSSProperties}>
      <div className="container page-banner__inner">
        {before}
        {eyebrow ? <Eyebrow variant="pill" icon={eyebrowIcon}>{eyebrow}</Eyebrow> : null}
        <h1>
          <span>{title}</span>
          {accent ? <em>{accent}</em> : null}
        </h1>
        {description ? <p className="page-banner__lead">{description}</p> : null}
        {children}
        {actions ? <div className="page-banner__actions">{actions}</div> : null}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Section — khoảng đệm và nền chuẩn cho mỗi khối nội dung.
   --------------------------------------------------------------------------- */
type SectionProps = {
  tone?: "light" | "dark" | "plain";
  id?: string;
  className?: string;
  children: ReactNode;
  /** Thu nhỏ khoảng đệm trên/dưới (khối phụ nối tiếp khối trước). */
  compact?: boolean;
};

export function Section({ tone = "light", id, className = "", children, compact = false }: SectionProps) {
  return (
    <section id={id} className={`ds-section ds-section--${tone} tone-${tone === "dark" ? "dark" : "light"} ${compact ? "ds-section--compact" : ""} ${className}`.trim()}>
      <div className="container">{children}</div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   CardGrid + FeatureCard — lưới card tự chia cột theo số lượng, hàng lẻ căn giữa.
   --------------------------------------------------------------------------- */
export function CardGrid({ children, columns, className = "" }: { children: ReactNode; columns?: 2 | 3 | 4; className?: string }) {
  const count = Children.toArray(children).length;
  const cols = columns ?? (count === 4 ? 4 : count === 2 ? 2 : count === 1 ? 1 : 3);
  return (
    <div className={`card-grid ${className}`.trim()} style={{ "--cols": cols } as CSSProperties}>
      {children}
    </div>
  );
}

type FeatureCardProps = {
  icon?: LucideIcon;
  title: ReactNode;
  children?: ReactNode;
  /** Liên kết cuối card; phần tử <a>/<Link> đã dựng sẵn. */
  footer?: ReactNode;
  className?: string;
};

export function FeatureCard({ icon: Icon, title, children, footer, className = "" }: FeatureCardProps) {
  return (
    <article className={`feature-card ${className}`.trim()}>
      {Icon ? (
        <span className="feature-card__icon">
          <Icon aria-hidden="true" />
        </span>
      ) : null}
      <h3>{title}</h3>
      {children ? <div className="feature-card__body">{children}</div> : null}
      {footer ? <div className="feature-card__footer">{footer}</div> : null}
    </article>
  );
}

/* ---------------------------------------------------------------------------
   Steps — quy trình có thứ tự thật (số bước mang ý nghĩa).
   --------------------------------------------------------------------------- */
export function Steps({ title, steps, className = "" }: { title?: ReactNode; steps: ReactNode[]; className?: string }) {
  return (
    <div className={`steps ${className}`.trim()}>
      {title ? <h3 className="steps__title">{title}</h3> : null}
      <ol className="steps__list">
        {steps.map((step, index) => (
          <li key={index}>
            <span className="steps__num" aria-hidden="true">{index + 1}</span>
            <span className="steps__text">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Faq — accordion câu hỏi thường gặp, một kiểu duy nhất cho toàn site.
   --------------------------------------------------------------------------- */
export type FaqItem = { question: ReactNode; answer: ReactNode };

export function Faq({ items, className = "" }: { items: FaqItem[]; className?: string }) {
  return (
    <div className={`faq ${className}`.trim()}>
      {items.map((item, index) => (
        <details className="faq__item" key={index}>
          <summary>
            <span>{item.question}</span>
            <ChevronDown aria-hidden="true" />
          </summary>
          <div className="faq__answer">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Callout — hộp ghi chú / lưu ý / miễn trừ.
   --------------------------------------------------------------------------- */
type CalloutProps = {
  icon?: LucideIcon;
  title?: ReactNode;
  children: ReactNode;
  tone?: "info" | "warning";
  className?: string;
  /** Dùng role="alert" cho thông báo lỗi của form. */
  role?: "alert" | "status" | "note";
};

export function Callout({ icon: Icon = ShieldCheck, title, children, tone = "info", className = "", role = "note" }: CalloutProps) {
  const Tag = role === "note" ? "aside" : "div";
  return (
    <Tag className={`callout callout--${tone} ${className}`.trim()} role={role === "note" ? undefined : role}>
      <Icon aria-hidden="true" />
      <div>
        {title ? <strong>{title}</strong> : null}
        <div className="callout__body">{children}</div>
      </div>
    </Tag>
  );
}

/* ---------------------------------------------------------------------------
   ToolHeader — đầu trang của các công cụ (tra cứu, trắc nghiệm, phong thủy):
   căn giữa, nằm ngay trên khung công cụ trong cùng một nền tối.
   --------------------------------------------------------------------------- */
type ToolHeaderProps = {
  eyebrow: ReactNode;
  eyebrowIcon?: LucideIcon;
  title: ReactNode;
  accent?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function ToolHeader({ eyebrow, eyebrowIcon, title, accent, description, children, className = "" }: ToolHeaderProps) {
  return (
    <header className={`tool-header tone-dark ${className}`.trim()}>
      <Eyebrow variant="pill" icon={eyebrowIcon}>{eyebrow}</Eyebrow>
      <h1>
        {title} {accent ? <em>{accent}</em> : null}
      </h1>
      {description ? <p className="tool-header__lead">{description}</p> : null}
      {children}
    </header>
  );
}
