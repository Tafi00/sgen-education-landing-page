/**
 * Renderer khối nội dung CMS.
 *
 * Mỗi khối trong `ContentBlock[]` được render thành một section độc lập, dùng lại
 * đúng class CSS đã có của website (`.page-*`, `.story-*`, `.course-grid`, ...).
 * Dữ liệu đọc từ `block.props` luôn được kiểm tra kiểu phòng thủ: thiếu trường thì
 * bỏ qua phần đó, `type` lạ thì không render gì thay vì làm sập trang.
 */
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Info, MapPin, Orbit } from "lucide-react";
import { useCourses, usePosts, useServices, useSiteSettings } from "../../api/hooks";
import type { ContentBlock } from "../../data/defaults/types";
import { ButtonAnchor, ButtonLink } from "../ui/Button";
import { Callout, CardGrid, Faq, FeatureCard, PageHero } from "../ui/Layout";
import { SectionHeading } from "../ui/SectionHeading";

type Props = Record<string, unknown>;

const DARK_STYLE = { "--page-dark-bg": "url(/assets/backgrounds/cosmic-dark-clean.webp)" } as CSSProperties;
const LIGHT_STYLE = { "--page-light-bg": "url(/assets/backgrounds/cosmic-light.webp)" } as CSSProperties;
const FALLBACK_COURSE_COVER = "/assets/illustrations/pythagoras-cosmic.webp";
const FALLBACK_POST_COVER = "/assets/blog/blog-pythagoras-calculation.webp";

function asRecord(value: unknown): Props | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Props) : null;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : "";
}

function limitOf(value: unknown, fallback: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(12, Math.max(1, Math.trunc(parsed)));
}

function itemList(value: unknown): Props[] {
  if (!Array.isArray(value)) return [];
  return value.map(asRecord).filter((item): item is Props => item !== null);
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(text).filter((entry) => entry.length > 0);
}

function formatPrice(value: number) {
  return value > 0 ? `${value.toLocaleString("vi-VN")} đ` : "Liên hệ";
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function Heading({ kicker, heading, body }: { kicker?: string; heading?: string; body?: string; light?: boolean }) {
  if (!kicker && !heading && !body) return null;
  return <SectionHeading eyebrow={kicker} title={heading} description={body} />;
}

function HeroBlock({ props }: { props: Props }) {
  const heading = text(props.heading) || text(props.title);
  const accent = text(props.accent);
  const body = text(props.text) || text(props.description) || stringList(props.paragraphs)[0] || "";
  const primaryLabel = text(props.primaryLabel);
  const primaryHref = text(props.primaryHref);
  if (!heading && !body) return null;

  return (
    <PageHero
      eyebrow={text(props.eyebrow) || text(props.kicker) || undefined}
      eyebrowIcon={Orbit}
      title={heading}
      accent={accent || undefined}
      description={body || undefined}
      actions={
        primaryLabel && primaryHref ? (
          <ButtonLink variant="primary" to={primaryHref}>
            {primaryLabel} <ArrowRight aria-hidden="true" />
          </ButtonLink>
        ) : undefined
      }
    />
  );
}

function RichTextBlock({ props }: { props: Props }) {
  const heading = text(props.heading);
  const paragraphs = stringList(props.paragraphs);
  const bullets = stringList(props.bullets);
  if (!heading && !paragraphs.length && !bullets.length) return null;

  return (
    <section className="page-light-section ux-block" style={LIGHT_STYLE}>
      <div className="container">
        <div className="story-copy">
          <Heading kicker={text(props.eyebrow)} heading={heading} light />
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {bullets.length ? (
            <ul>
              {bullets.map((bullet) => (
                <li key={bullet}>
                  <CheckCircle2 aria-hidden="true" /> {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function StatsBlock({ props }: { props: Props }) {
  const items = itemList(props.items)
    .map((item) => ({ value: text(item.value) || String(item.number ?? ""), label: text(item.label) || text(item.title) }))
    .filter((item) => item.value || item.label);
  if (!items.length) return null;

  return (
    <section className="page-light-section ux-block" style={LIGHT_STYLE}>
      <div className="container">
        <Heading kicker={text(props.eyebrow)} heading={text(props.heading)} light />
        <div className="story-stats">
          {items.map((item, index) => (
            <span key={`${item.label}-${index}`}>
              <strong>{item.value}</strong>
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CardsBlock({ props }: { props: Props }) {
  const items = itemList(props.items)
    .map((item) => ({
      title: text(item.title),
      body: text(item.text) || text(item.body) || text(item.description),
      href: text(item.href),
      hrefLabel: text(item.hrefLabel),
    }))
    .filter((item) => item.title || item.body);
  if (!items.length) return null;

  return (
    <section className="page-light-section ux-block" style={LIGHT_STYLE}>
      <div className="container">
        <Heading kicker={text(props.eyebrow)} heading={text(props.heading)} light />
        <CardGrid>
          {items.map((item, index) => (
            <FeatureCard
              key={`${item.title}-${index}`}
              title={item.title || item.body}
              footer={
                item.href ? (
                  <Link className="card-link" to={item.href}>
                    {item.hrefLabel || "Tìm hiểu"} <ArrowRight aria-hidden="true" />
                  </Link>
                ) : undefined
              }
            >
              {item.title && item.body ? <p>{item.body}</p> : null}
            </FeatureCard>
          ))}
        </CardGrid>
      </div>
    </section>
  );
}

function ValuesBlock({ props }: { props: Props }) {
  const items = itemList(props.items)
    .map((item) => ({ title: text(item.title), body: text(item.text) || text(item.body) }))
    .filter((item) => item.title || item.body);
  if (!items.length) return null;

  return (
    <section className="page-dark-section ux-block" style={DARK_STYLE}>
      <div className="container">
        <Heading kicker={text(props.eyebrow)} heading={text(props.heading)} />
        <CardGrid>
          {items.map((item, index) => (
            <FeatureCard key={`${item.title}-${index}`} title={item.title || item.body}>
              {item.title && item.body ? <p>{item.body}</p> : null}
            </FeatureCard>
          ))}
        </CardGrid>
      </div>
    </section>
  );
}

function TimelineBlock({ props }: { props: Props }) {
  const items = itemList(props.items)
    .map((item) => ({ title: text(item.title), body: text(item.text) || text(item.body) || text(item.details) }))
    .filter((item) => item.title || item.body);
  if (!items.length) return null;

  return (
    <section className="page-light-section ux-block" style={LIGHT_STYLE}>
      <div className="container">
        <Heading kicker={text(props.eyebrow)} heading={text(props.heading)} light />
        <div className="article-list">
          {items.map((item, index) => (
            <article key={`${item.title}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                {item.title ? <h3>{item.title}</h3> : null}
                {item.body ? <p>{item.body}</p> : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqBlock({ props }: { props: Props }) {
  const items = itemList(props.items)
    .map((item) => ({ question: text(item.question) || text(item.title), answer: text(item.answer) || text(item.text) }))
    .filter((item) => item.question && item.answer);
  if (!items.length) return null;

  return (
    <section className="page-light-section ux-block" style={LIGHT_STYLE}>
      <div className="container">
        <Heading kicker={text(props.eyebrow) || "Giải đáp"} heading={text(props.heading)} light />
        <Faq items={items.map((item) => ({ question: item.question, answer: <p>{item.answer}</p> }))} />
      </div>
    </section>
  );
}

function CtaBlock({ props }: { props: Props }) {
  const heading = text(props.heading);
  const body = text(props.text) || text(props.description);
  const primaryLabel = text(props.primaryLabel);
  const primaryHref = text(props.primaryHref);
  const secondaryLabel = text(props.secondaryLabel);
  const secondaryHref = text(props.secondaryHref);
  if (!heading && !body && !primaryHref && !secondaryHref) return null;

  return (
    <section className="page-dark-section ux-block" style={DARK_STYLE}>
      <div className="container">
        <Heading kicker={text(props.eyebrow) || "Bước tiếp theo"} heading={heading} body={body} />
        <div className="admin-page__actions">
          {primaryLabel && primaryHref ? (
            <ButtonLink variant="primary" to={primaryHref}>
              {primaryLabel} <ArrowRight aria-hidden="true" />
            </ButtonLink>
          ) : null}
          {secondaryLabel && secondaryHref ? (
            <ButtonLink variant="secondary" to={secondaryHref}>
              {secondaryLabel} <ArrowRight aria-hidden="true" />
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ContactInfoBlock({ props }: { props: Props }) {
  const { settings } = useSiteSettings();
  const rawPhone = settings.contact.phone || settings.brand.hotline;
  const rows: { label: string; value: string; href?: string }[] = [
    { label: "Hotline tư vấn", value: rawPhone, href: rawPhone ? `tel:${rawPhone.replace(/[^\d+]/g, "")}` : undefined },
    { label: "Điện thoại phụ", value: settings.contact.phoneAlt, href: settings.contact.phoneAlt ? `tel:${settings.contact.phoneAlt.replace(/[^\d+]/g, "")}` : undefined },
    { label: "Email", value: settings.contact.email, href: settings.contact.email ? `mailto:${settings.contact.email}` : undefined },
    { label: "Trụ sở", value: settings.contact.address },
    { label: "Văn phòng", value: settings.contact.officeAddress },
    { label: "Giờ làm việc", value: settings.contact.workingHours },
  ].filter((row) => row.value);

  const seen = new Set(rows.map((row) => row.label));
  for (const item of itemList(props.items)) {
    const label = text(item.label) || text(item.title);
    const value = text(item.value) || text(item.text);
    if (!label || !value || seen.has(label)) continue;
    seen.add(label);
    rows.push({ label, value, href: text(item.href) || undefined });
  }
  if (!rows.length) return null;

  return (
    <section className="page-light-section ux-block" style={LIGHT_STYLE}>
      <div className="container">
        <Heading kicker={text(props.eyebrow) || "Liên hệ"} heading={text(props.heading) || "Thông tin liên hệ"} light />
        <CardGrid>
          {rows.map((row) => (
            <FeatureCard key={row.label} title={row.label}>
              <p>{row.href ? <a href={row.href}>{row.value}</a> : row.value}</p>
            </FeatureCard>
          ))}
        </CardGrid>
        {text(props.note) ? (
          <Callout icon={Info} title="Lưu ý">
            {text(props.note)}
          </Callout>
        ) : null}
      </div>
    </section>
  );
}

function MapBlock({ props }: { props: Props }) {
  const { settings } = useSiteSettings();
  const heading = text(props.heading) || "Bản đồ văn phòng";
  const embed = text(props.embed) || settings.contact.mapEmbed;
  const isMarkup = embed.trim().startsWith("<");
  const address = (text(props.address) || settings.contact.officeAddress || settings.contact.address).trim();

  return (
    <section className="page-light-section ux-block" style={LIGHT_STYLE}>
      <div className="container">
        <Heading kicker={text(props.eyebrow) || "Bản đồ"} heading={heading} light />
        {embed ? (
          isMarkup ? (
            <div dangerouslySetInnerHTML={{ __html: embed }} />
          ) : (
            <iframe src={embed} title={heading} loading="lazy" style={{ width: "100%", minHeight: 420, border: 0, borderRadius: 18 }} />
          )
        ) : (
          <div className="map-placeholder">
            <MapPin aria-hidden="true" />
            <div>
              <strong>Bản đồ đang được cập nhật</strong>
              {address ? <p>{address}</p> : <p>Địa chỉ văn phòng sẽ sớm được cập nhật tại đây.</p>}
              {address ? (
                <ButtonAnchor
                  variant="primary"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Chỉ đường <ArrowRight aria-hidden="true" />
                </ButtonAnchor>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CoursesBlock({ props }: { props: Props }) {
  const limit = limitOf(props.limit ?? props.pageSize, 3);
  const { courses } = useCourses({ category: text(props.category) || undefined, pageSize: limit });
  const visible = courses.slice(0, limit);
  if (!visible.length) {
    return (
      <section className="page-light-section ux-block" style={LIGHT_STYLE}>
        <div className="container">
          <Heading kicker="Khóa học" heading={text(props.heading) || "Khóa học tại SGEN"} light />
          <p className="admin-hint">
            <Info aria-hidden="true" /> Danh sách khóa học đang được cập nhật.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-light-section ux-block" style={LIGHT_STYLE}>
      <div className="container">
        <Heading kicker={text(props.eyebrow) || "Khóa học"} heading={text(props.heading) || "Khóa học tại SGEN"} light />
        <div className="course-grid">
          {visible.map((course) => {
            const duration = course.durationLabel.trim() || (course.sessionCount > 0 ? `${course.sessionCount} buổi` : "");
            return (
              <article key={course.slug}>
                <img src={course.coverImage || FALLBACK_COURSE_COVER} alt="" loading="lazy" />
                <div>
                  <span>{course.level}</span>
                  <h3>{course.title}</h3>
                  <p>{[duration, formatPrice(course.price)].filter(Boolean).join(" · ")}</p>
                  <Link to={`/khoa-hoc/${course.slug}`}>
                    Chi tiết <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
        <ButtonLink variant="primary" to="/khoa-hoc">
          Xem tất cả khóa học <ArrowRight aria-hidden="true" />
        </ButtonLink>
      </div>
    </section>
  );
}

function PostsBlock({ props }: { props: Props }) {
  const limit = limitOf(props.limit ?? props.pageSize, 3);
  const { posts } = usePosts({ category: text(props.category) || undefined, pageSize: limit });
  const visible = posts.slice(0, limit);

  return (
    <section className="page-light-section ux-block" style={LIGHT_STYLE}>
      <div className="container">
        <Heading kicker={text(props.eyebrow) || "Blog"} heading={text(props.heading) || "Bài viết mới"} light />
        {visible.length ? (
          <div className="blog-page-grid">
            {visible.map((post) => (
              <article key={post.slug}>
                <img src={post.cover || FALLBACK_POST_COVER} alt="" loading="lazy" />
                <div>
                  <small>{formatDate(post.publishedAt)}</small>
                  <h2>{post.title}</h2>
                  <p>{post.excerpt}</p>
                  <Link to={`/blog/${post.slug}`}>
                    Đọc tiếp <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="admin-hint">
            <Info aria-hidden="true" /> Chưa có bài viết nào được đăng.
          </p>
        )}
        <ButtonLink variant="primary" to="/blog">
          Xem tất cả bài viết <ArrowRight aria-hidden="true" />
        </ButtonLink>
      </div>
    </section>
  );
}

function ServicesBlock({ props }: { props: Props }) {
  const { services } = useServices();
  if (!services.length) return null;

  return (
    <section className="page-light-section ux-block" style={LIGHT_STYLE}>
      <div className="container">
        <Heading kicker={text(props.eyebrow) || "Dịch vụ"} heading={text(props.heading) || "Gói dịch vụ của SGEN"} light />
        <div className="service-grid">
          {services.map((service) => (
            <article key={service.slug}>
              <h3>{service.name}</h3>
              <p>{service.tagline}</p>
              <p>
                <strong>{formatPrice(service.price)}</strong>
                {service.durationLabel ? ` · ${service.durationLabel}` : ""}
              </p>
              <Link to={`/dich-vu/${service.slug}`}>
                {service.ctaLabel || "Xem chi tiết"} <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Block({ block }: { block: ContentBlock }) {
  const props = asRecord(block.props) ?? {};

  switch (block.type) {
    case "hero":
      return <HeroBlock props={props} />;
    case "richText":
      return <RichTextBlock props={props} />;
    case "stats":
      return <StatsBlock props={props} />;
    case "cards":
      return <CardsBlock props={props} />;
    case "values":
      return <ValuesBlock props={props} />;
    case "timeline":
      return <TimelineBlock props={props} />;
    case "faq":
      return <FaqBlock props={props} />;
    case "cta":
      return <CtaBlock props={props} />;
    case "contactInfo":
      return <ContactInfoBlock props={props} />;
    case "map":
      return <MapBlock props={props} />;
    case "courses":
      return <CoursesBlock props={props} />;
    case "posts":
      return <PostsBlock props={props} />;
    case "services":
      return <ServicesBlock props={props} />;
    default:
      return null;
  }
}

export function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;
  const ordered = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <>
      {ordered.map((block, index) => (
        <Block block={block} key={`${block.type}-${block.order ?? index}-${index}`} />
      ))}
    </>
  );
}

export default BlockRenderer;
