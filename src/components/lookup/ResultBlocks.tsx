import { Fragment, type ReactNode, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Callout } from "../ui/Layout";
import { RESULTS_DISCLAIMER, type LookupResultPayload, type ResultBlock, type VerdictTone } from "../../../shared/lookup-types";
import { structureParagraphs } from "../../../shared/report-text";

/** Màu thanh tiến độ / điểm nhấn theo sắc thái verdict do API trả về. */
const TONE_COLOR: Record<VerdictTone, string> = {
  good: "#63d89c",
  warn: "#f0c674",
  bad: "#ff847d",
  neutral: "#b58cff",
};

const TONE_CLASS: Record<VerdictTone, string> = {
  good: "status-badge--good",
  warn: "status-badge--warn",
  bad: "status-badge--bad",
  neutral: "status-badge--neutral",
};

/** Trả về ảnh minh họa cosmic cho giá trị số: ưu tiên số master (11/2, 22/4), còn lại lấy số cuối. */
function numeralAsset(value: string): string | null {
  const parts = value.split("/").map((part) => Number(part.trim()));
  const first = parts[0];
  const last = parts.at(-1);
  const master = first === 11 || first === 22 ? first : null;
  const numeral = master ?? (last && last >= 1 && last <= 9 ? last : null);
  return numeral ? `/assets/illustrations/numeral-${numeral}-cosmic.webp` : null;
}
/** Khối `metrics`: lưới nhãn/giá trị, giá trị dài tự nới rộng ô. */
function MetricsBlock({ block }: { block: Extract<ResultBlock, { kind: "metrics" }> }) {
  return (
    <section>
      {block.heading ? <h2>{block.heading}</h2> : null}
      <div className="report-grid">
        {block.items.map((item, index) => {
          const asset = numeralAsset(item.value);
          return (
            <article key={index}>
              {asset ? (
                <img className="report-grid__numeral" src={asset} alt="" loading="lazy" />
              ) : (
                <span className={item.value.length > 3 ? "is-wide-value" : undefined}>{item.value}</span>
              )}
              <div>
                <strong>{item.label}</strong>
                {item.note ? <small>{item.note}</small> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/** Khối `score`: điểm số kèm thanh tiến độ tô màu theo `tone`. */
function ScoreBlock({ block }: { block: Extract<ResultBlock, { kind: "score" }> }) {
  return (
    <section>
      {block.heading ? <h2>{block.heading}</h2> : null}
      <div className="report-grid">
        {block.items.map((item, index) => {
          const max = item.max && item.max > 0 ? item.max : 100;
          const percent = Math.min(100, Math.max(0, Math.round((item.value / max) * 100)));
          const tone = item.tone ?? "neutral";
          return (
            <article key={index}>
              <span className={String(item.value).length > 3 ? "is-wide-value" : undefined}>
                {item.value}
                {item.max ? `/${item.max}` : ""}
              </span>
              <div>
                <strong>{item.label}</strong>
                <div
                  role="progressbar"
                  aria-label={item.label}
                  aria-valuenow={item.value}
                  aria-valuemin={0}
                  aria-valuemax={max}
                  style={{ height: 8, marginTop: 6, background: "rgba(255,255,255,.12)", borderRadius: 999, overflow: "hidden" }}
                >
                  <i
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${percent}%`,
                      borderRadius: 999,
                      background: TONE_COLOR[tone],
                    }}
                  />
                </div>
                {item.note ? <small>{item.note}</small> : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/** Đoạn văn báo cáo: tách tiêu đề in hoa bị dính trong nội dung gốc thành tiêu đề con thật. */
function ReportProse({ paragraphs, leadFirst = false }: { paragraphs: readonly string[]; leadFirst?: boolean }) {
  const items = structureParagraphs(paragraphs);
  return (
    <div className="report-prose">
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.heading ? <h4 className="report-prose__heading">{item.heading}</h4> : null}
          <p className={leadFirst && index === 0 ? "report-prose__lead" : undefined}>{item.text}</p>
        </Fragment>
      ))}
    </div>
  );
}

/** Khối Thư ngỏ Pythagoras với chân dung phát sáng và phong cách thư trang trọng. */
function PythagorasLetterBlock({ block }: { block: Extract<ResultBlock, { kind: "text" }> }) {
  return (
    <section className="pythagoras-card">
      <div className="pythagoras-card__content">
        <div className="pythagoras-card__badge">
          <span className="pythagoras-card__badge-tag">Triết lý Pythagoras</span>
          <span className="pythagoras-card__badge-sub">Định hướng & Khai mở tiềm năng</span>
        </div>
        <h2>{block.heading}</h2>
        <div className="pythagoras-card__body">
          <ReportProse paragraphs={block.paragraphs} leadFirst />
        </div>
        <div className="pythagoras-card__footer">
          <div className="pythagoras-card__sign">
            <small>Học viện Khai vấn & Số học Ứng dụng</small>
            <strong>SGEN EDUCATION</strong>
          </div>
          <div className="pythagoras-card__quote-mark" aria-hidden="true">“</div>
        </div>
      </div>
      <div className="pythagoras-card__visual">
        <img
          src="/assets/illustrations/pythagoras-cosmic.webp"
          alt="Triết gia Pythagoras"
          className="pythagoras-card__portrait"
          width={200}
          height={221}
          loading="eager"
        />
      </div>
    </section>
  );
}

/** Khối `text`: đoạn văn và/hoặc danh sách gạch đầu dòng. */
function TextBlock({ block }: { block: Extract<ResultBlock, { kind: "text" }> }) {
  if (block.heading && /pythagoras|thư ngỏ/i.test(block.heading)) {
    return <PythagorasLetterBlock block={block} />;
  }
  return (
    <section>
      {block.heading ? <h2>{block.heading}</h2> : null}
      <ReportProse paragraphs={block.paragraphs} />
      {block.bullets?.length ? (
        <ul>
          {block.bullets.map((bullet, index) => (
            <li key={index}>
              <Check aria-hidden="true" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

/** Khối `table`: bảng cuộn ngang khi nhiều cột. */
function TableBlock({ block }: { block: Extract<ResultBlock, { kind: "table" }> }) {
  return (
    <section>
      {block.heading ? <h2>{block.heading}</h2> : null}
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              {block.headings.map((heading, index) => (
                <th key={index} scope="col">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Khối `cards`: lưới card có tiêu đề, mô tả, nhãn sắc thái và ghi chú phụ. */
function CardsBlock({ block }: { block: Extract<ResultBlock, { kind: "cards" }> }) {
  return (
    <section>
      {block.heading ? <h2>{block.heading}</h2> : null}
      <div className="service-grid">
        {block.items.map((card, index) => (
          <article key={index}>
            {card.tone ? <span className={`status-badge ${TONE_CLASS[card.tone]}`}>Gợi ý</span> : null}
            <h3>{card.title}</h3>
            <p>{card.text}</p>
            {card.meta ? <small className="muted">{card.meta}</small> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

/** Khối `badges`: dãy nhãn ngắn. */
function BadgesBlock({ block }: { block: Extract<ResultBlock, { kind: "badges" }> }) {
  return (
    <section>
      {block.heading ? <h2>{block.heading}</h2> : null}
      <div className="category-row">
        {block.items.map((item, index) => (
          <span key={index} className={`status-badge ${TONE_CLASS[item.tone ?? "neutral"]}`}>
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}
/** Khối `section`: vạch chia nhóm nội dung có neo cho thanh điều hướng dính. */
function SectionBlock({ block }: { block: Extract<ResultBlock, { kind: "section" }> }) {
  return (
    <div className="report-section" id={block.id}>
      <span>{block.title}</span>
      {block.description ? <small>{block.description}</small> : null}
    </div>
  );
}

/** Khối `metricDetail`: luận giải đầy đủ cho từng chỉ số (trích từ bộ báo cáo gốc). */
function MetricDetailBlock({ block }: { block: Extract<ResultBlock, { kind: "metricDetail" }> }) {
  return (
    <div className="metric-detail">
      {block.heading ? <h2>{block.heading}</h2> : null}
      {block.intro?.length ? (
        <div className="metric-detail__intro">
          <ReportProse paragraphs={block.intro} />
        </div>
      ) : null}
      {block.items.map((item, index) => {
        const asset = numeralAsset(item.value);
        return (
          <article className="metric-detail__item" key={index}>
            {asset ? <img className="metric-detail__numeral" src={asset} alt="" loading="lazy" /> : null}
            <header>
              <h3>{item.label}</h3>
              <strong>{item.value}</strong>
            </header>
            <ReportProse paragraphs={item.paragraphs} />
          </article>
        );
      })}
    </div>
  );
}

/** Thứ tự ô của biểu đồ 3×3 theo trường phái Pythagoras: hàng trên 3-6-9, giữa 2-5-8, dưới 1-4-7. */
const CHART_CELLS = [3, 6, 9, 2, 5, 8, 1, 4, 7];



/** Ảnh minh họa cho các block biểu đồ đặc thù. */
const BLOCK_ILLUSTRATION: Partial<Record<ResultBlock["kind"], string>> = {
  chart3x3: "/assets/methods/method-pythagoras.webp",
  pinnacles: "/assets/methods/method-life-path.webp",
  ikigai: "/assets/methods/method-ikigai.webp",
};

/** Heading kèm ảnh minh họa nhỏ cho block biểu đồ. */
function IllustratedHeading({ kind, heading }: { kind: ResultBlock["kind"]; heading?: string }) {
  const src = BLOCK_ILLUSTRATION[kind];
  if (!heading) return null;
  return (
    <h2 className="block-heading--illustrated">
      {src ? <img src={src} alt="" loading="lazy" /> : null}
      <span>{heading}</span>
    </h2>
  );
}
function Chart3x3Block({ block }: { block: Extract<ResultBlock, { kind: "chart3x3" }> }) {
  return (
    <section>
      <IllustratedHeading kind="chart3x3" heading={block.heading} />
      <div className="chart3x3-wrapper">
        <div className="chart3x3" role="img" aria-label={block.heading ?? "Biểu đồ 3×3"}>
          {CHART_CELLS.map((cell) => {
            const count = block.counts[String(cell)] ?? 0;
            return (
              <div key={cell} className={count ? "chart3x3__cell is-filled" : "chart3x3__cell"}>
                <span className="chart3x3__digits">{count ? String(cell).repeat(count) : "·"}</span>
                <small>{cell}</small>
              </div>
            );
          })}
        </div>
        <div className="chart3x3-axes" aria-hidden="true">
          <div className="chart3x3-axis">
            <strong>3 · 6 · 9</strong>
            <small>Trục Trí tuệ (Tư duy — Trực giác — Hoài bão)</small>
          </div>
          <div className="chart3x3-axis">
            <strong>2 · 5 · 8</strong>
            <small>Trục Tâm hồn (Cảm xúc — Tự do — Tình yêu thương)</small>
          </div>
          <div className="chart3x3-axis">
            <strong>1 · 4 · 7</strong>
            <small>Trục Thể chất (Cá tính — Thực tế — Trải nghiệm)</small>
          </div>
        </div>
      </div>
      {block.note ? <p className="chart-note">{block.note}</p> : null}
    </section>
  );
}

/** Khối `pinnacles`: bốn đỉnh cao kèm khoảng tuổi phía trên bốn con số gốc. */
function PinnaclesBlock({ block }: { block: Extract<ResultBlock, { kind: "pinnacles" }> }) {
  return (
    <section>
      <IllustratedHeading kind="pinnacles" heading={block.heading} />
      <div className="pinnacle-layout">
        <div className="pinnacle-visual">
          <img
            src="/assets/blog/blog-life-pyramid.webp"
            alt="Mô hình kim tự tháp 4 đỉnh cao"
            loading="lazy"
          />
          <small>Mô hình kim tự tháp 4 đỉnh cao theo chu kỳ 9 năm</small>
        </div>
        <div className="pinnacle-chart">
          <div className="pinnacle-chart__peaks">
            {block.pinnacles.map((pinnacle, index) => (
              <div key={index} className="pinnacle-chart__node pinnacle-chart__node--peak">
                <b>{pinnacle.value}</b>
                {pinnacle.range ? <small>Đỉnh {index + 1} · {pinnacle.range} tuổi</small> : <small>Đỉnh {index + 1}</small>}
              </div>
            ))}
          </div>
          <div className="pinnacle-chart__bases">
            {block.bases.map((base, index) => (
              <div key={index} className="pinnacle-chart__node">
                <b>{base.value}</b>
                <small>{base.label}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Khối `ikigai`: bốn nhóm con số Đam mê — Sứ mệnh — Chuyên môn — Sự nghiệp. */
function IkigaiBlock({ block }: { block: Extract<ResultBlock, { kind: "ikigai" }> }) {
  const groups = [
    { label: "Đam mê", values: block.passion, className: "ikigai__group--passion" },
    { label: "Sứ mệnh", values: [block.mission], className: "ikigai__group--mission" },
    { label: "Chuyên môn", values: block.expertise, className: "ikigai__group--expertise" },
    { label: "Sự nghiệp", values: block.career, className: "ikigai__group--career" },
  ];
  return (
    <section>
      <IllustratedHeading kind="ikigai" heading={block.heading} />
      <div className="ikigai">
        {groups.map((group) => (
          <div key={group.label} className={`ikigai__group ${group.className}`}>
            <small>{group.label}</small>
            <div>
              {group.values.length ? (
                group.values.map((value, index) => <b key={index}>{value}</b>)
              ) : (
                <b className="is-empty">—</b>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


/** Render một `ResultBlock` theo đúng `kind`; tách riêng để trang công cụ chỉ có một block vẫn dùng lại được. */
export function ResultBlockView({ block }: { block: ResultBlock }) {
  switch (block.kind) {
    case "metrics":
      return <MetricsBlock block={block} />;
    case "score":
      return <ScoreBlock block={block} />;
    case "text":
      return <TextBlock block={block} />;
    case "table":
      return <TableBlock block={block} />;
    case "cards":
      return <CardsBlock block={block} />;
    case "badges":
      return <BadgesBlock block={block} />;
    case "section":
      return <SectionBlock block={block} />;
    case "chart3x3":
      return <Chart3x3Block block={block} />;
    case "pinnacles":
      return <PinnaclesBlock block={block} />;
    case "ikigai":
      return <IkigaiBlock block={block} />;
    case "metricDetail":
      return <MetricDetailBlock block={block} />;
    default:
      return null;
  }
}

export type ResultBlocksProps = {
  payload: LookupResultPayload;
  actions?: ReactNode;
  /** Khối kêu gọi (VD "Liên hệ Chuyên Gia") chèn sau phần đầu kết quả, sau mục thứ hai và cuối báo cáo. */
  callout?: ReactNode;
};

/**
 * Hiển thị đầy đủ một `LookupResultPayload`: tiêu đề, mô tả, toàn bộ block và disclaimer bắt buộc.
 * Không tự render header/footer của site.
 */
export function ResultBlocks({ payload, actions, callout }: ResultBlocksProps) {
  const disclaimer = payload.disclaimer?.trim() || RESULTS_DISCLAIMER;
  const navSections = payload.blocks.filter((block): block is Extract<ResultBlock, { kind: "section" }> => block.kind === "section");
  const coreMetric = payload.blocks.find((block): block is Extract<ResultBlock, { kind: "metrics" }> => block.kind === "metrics")?.items[0];
  const coreAsset = coreMetric ? numeralAsset(coreMetric.value) : null;
  const [activeSection, setActiveSection] = useState(navSections[0]?.id ?? "");
  // Chèn khối kêu gọi giữa báo cáo, sau mục thứ hai (chỉ khi còn mục phía sau).
  const midCalloutAfter = navSections.length > 2 ? navSections[1].id : "";

  useEffect(() => {
    const sections = navSections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [payload]);
  return (
    <section className="result-preview section--dark">
      <header className="result-hero">
        <div className="result-hero__info">
          <small>Kết quả tra cứu</small>
          <h2>{payload.headline}</h2>
          {payload.subhead ? <p>{payload.subhead}</p> : null}
        </div>
        {coreMetric ? (
          <div className="result-hero__core">
            {coreAsset ? (
              <img
                className="result-hero__core-orb"
                src={coreAsset}
                alt={`Số chủ đạo ${coreMetric.value}`}
                loading="lazy"
              />
            ) : null}
            <div className="result-hero__core-meta">
              <span>{coreMetric.value}</span>
              <small>{coreMetric.label}</small>
            </div>
          </div>
        ) : null}
      </header>

      {callout}

      <div className="report-layout">
        {navSections.length >= 2 || actions ? (
          <aside className="report-sidebar">
            <div className="report-sidebar__inner">
              {navSections.length >= 2 ? (
                <nav className="report-toc" aria-label="Mục lục kết quả">
                  <small>Mục lục</small>
                  {navSections.map((section, index) => (
                    <a key={section.id} href={`#${section.id}`} data-index={String(index + 1).padStart(2, "0")} data-section={section.id} className={activeSection === section.id ? "is-active" : undefined}>
                      {section.title}
                    </a>
                  ))}
                </nav>
              ) : null}
              {actions ? <div className="report-sidebar__actions">{actions}</div> : null}
            </div>
          </aside>
        ) : null}

        <div className="report-body article-content">
          {payload.blocks.map((block, index) => (
            <Fragment key={index}>
              <ResultBlockView block={block} />
              {callout && block.kind === "section" && block.id === midCalloutAfter ? callout : null}
            </Fragment>
          ))}
          {callout}
        </div>
      </div>

      <Callout title="Lưu ý quan trọng">{disclaimer}</Callout>
    </section>
  );
}
