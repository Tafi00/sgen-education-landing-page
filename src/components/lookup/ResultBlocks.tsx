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
    default:
      return null;
  }
}

export type ResultBlocksProps = { payload: LookupResultPayload };

/**
 * Hiển thị đầy đủ một `LookupResultPayload`: tiêu đề, mô tả, toàn bộ block và disclaimer bắt buộc.
 * Không tự render header/footer của site.
 */
export function ResultBlocks({ payload }: ResultBlocksProps) {
  const disclaimer = payload.disclaimer?.trim() || RESULTS_DISCLAIMER;
  return (
    <section className="result-preview section--dark">
      <header>
        <div>
          <small>Kết quả tra cứu</small>
          <h2>{payload.headline}</h2>
          {payload.subhead ? <p>{payload.subhead}</p> : null}
        </div>
      </header>
      <div className="article-content">
        {payload.blocks.map((block, index) => (
          <ResultBlockView block={block} key={index} />
        ))}
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
