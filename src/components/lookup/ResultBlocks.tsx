import { useEffect, useState, type ReactNode } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { RESULTS_DISCLAIMER, type LookupResultPayload, type ResultBlock, type VerdictTone } from "../../../shared/lookup-types";

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

/** Khối `metrics`: lưới nhãn/giá trị, giá trị dài tự nới rộng ô. */
function MetricsBlock({ block }: { block: Extract<ResultBlock, { kind: "metrics" }> }) {
  return (
    <section>
      {block.heading ? <h2>{block.heading}</h2> : null}
      <div className="report-grid">
        {block.items.map((item, index) => (
          <article key={index}>
            <span className={item.value.length > 3 ? "is-wide-value" : undefined}>{item.value}</span>
            <div>
              <strong>{item.label}</strong>
              {item.note ? <small>{item.note}</small> : null}
            </div>
          </article>
        ))}
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

/** Khối `text`: đoạn văn và/hoặc danh sách gạch đầu dòng. */
function TextBlock({ block }: { block: Extract<ResultBlock, { kind: "text" }> }) {
  return (
    <section>
      {block.heading ? <h2>{block.heading}</h2> : null}
      {block.paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
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
      {block.intro?.map((paragraph, index) => (
        <p className="metric-detail__intro" key={`intro-${index}`}>{paragraph}</p>
      ))}
      {block.items.map((item, index) => (
        <article className="metric-detail__item" key={index}>
          <header>
            <h3>{item.label}</h3>
            <strong>{item.value}</strong>
          </header>
          {item.paragraphs.map((paragraph, paragraphIndex) => (
            <p key={paragraphIndex}>{paragraph}</p>
          ))}
        </article>
      ))}
    </div>
  );
}

/** Thứ tự ô của biểu đồ 3×3 theo trường phái Pythagoras: hàng trên 3-6-9, giữa 2-5-8, dưới 1-4-7. */
const CHART_CELLS = [3, 6, 9, 2, 5, 8, 1, 4, 7];

/** Khối `chart3x3`: lưới chín ô, mỗi ô lặp lại con số theo tần suất xuất hiện. */
function Chart3x3Block({ block }: { block: Extract<ResultBlock, { kind: "chart3x3" }> }) {
  return (
    <section>
      {block.heading ? <h2>{block.heading}</h2> : null}
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
      {block.note ? <p className="chart-note">{block.note}</p> : null}
    </section>
  );
}

/** Khối `pinnacles`: bốn đỉnh cao kèm khoảng tuổi phía trên bốn con số gốc. */
function PinnaclesBlock({ block }: { block: Extract<ResultBlock, { kind: "pinnacles" }> }) {
  return (
    <section>
      {block.heading ? <h2>{block.heading}</h2> : null}
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
      {block.heading ? <h2>{block.heading}</h2> : null}
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

export type ResultBlocksProps = { payload: LookupResultPayload; actions?: ReactNode };

/**
 * Hiển thị đầy đủ một `LookupResultPayload`: tiêu đề, mô tả, toàn bộ block và disclaimer bắt buộc.
 * Không tự render header/footer của site.
 */
export function ResultBlocks({ payload, actions }: ResultBlocksProps) {
  const disclaimer = payload.disclaimer?.trim() || RESULTS_DISCLAIMER;
  const navSections = payload.blocks.filter((block): block is Extract<ResultBlock, { kind: "section" }> => block.kind === "section");
  const coreMetric = payload.blocks.find((block): block is Extract<ResultBlock, { kind: "metrics" }> => block.kind === "metrics")?.items[0];
  const [activeSection, setActiveSection] = useState(navSections[0]?.id ?? "");

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
            <span>{coreMetric.value}</span>
            <small>{coreMetric.label}</small>
          </div>
        ) : null}
      </header>

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
            <ResultBlockView block={block} key={index} />
          ))}
        </div>
      </div>

      <div className="privacy-banner">
        <ShieldCheck aria-hidden="true" />
        <div>
          <strong>Lưu ý quan trọng</strong>
          <span>{disclaimer}</span>
        </div>
      </div>
    </section>
  );
}
