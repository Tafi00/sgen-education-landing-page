import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { BriefcaseBusiness, Eye, HeartPulse, Users, Wallet, X } from "lucide-react";
import { getHexagramInfo, type MovingLineDetail } from "../../../shared/menh-thu/metaphysics";
import { ICHING_DOCUMENT_READINGS } from "./iching-document-readings";
import "../../styles/iching-reading.css";

/** Ngũ hành của bát quái, dùng cho cách ghi “(Mộc/Thủy)” trong tài liệu SGEN. */
const TRIGRAM_ELEMENTS: Record<string, string> = {
  "Càn": "Kim", "Đoài": "Kim", "Ly": "Hỏa", "Chấn": "Mộc", "Tốn": "Mộc", "Khảm": "Thủy", "Cấn": "Thổ", "Khôn": "Thổ",
};

export type IChingReadingItem = {
  key: string;
  /** Vai trò của quẻ: “Quẻ Chủ”, “Quẻ Biến”, “Quẻ Tiền Vận”… */
  label: string;
  /** Số quẻ Văn Vương 1–64. */
  number: number;
  /** Các hào (1 = dưới cùng) cần tô đỏ: hào động ở quẻ chủ, hào vừa biến ở quẻ biến. */
  highlightLines?: number[];
  /** Ghi chú cách lập quẻ, hiện trong phần thông tin thêm và trong hộp thoại. */
  note?: string;
  movingDetails?: MovingLineDetail[];
  readingRule?: string;
};

function resolveItem(item: IChingReadingItem) {
  const info = getHexagramInfo(item.number);
  const reading = ICHING_DOCUMENT_READINGS[item.number];
  const name = reading?.name ?? info?.name ?? `Quẻ ${item.number}`;
  const upperElement = info ? TRIGRAM_ELEMENTS[info.upper.name] : "";
  const lowerElement = info ? TRIGRAM_ELEMENTS[info.lower.name] : "";
  // Bit thứ i của khóa bát quái là hào i tính từ dưới lên.
  const lines = info ? `${info.lower.key}${info.upper.key}`.split("").map((bit) => bit === "1") : [];
  return { info, reading, name, upperElement, lowerElement, lines };
}

function HexagramFigure({ lines, highlight = [] }: { lines: boolean[]; highlight?: number[] }) {
  return (
    <div className="iching-figure" aria-hidden="true">
      {[5, 4, 3, 2, 1, 0].map((index) => {
        const active = highlight.includes(index + 1);
        return (
          <div className={`iching-figure__row ${active ? "is-moving" : ""}`} key={index}>
            <small>{index + 1}</small>
            <i className={lines[index] ? "is-yang" : "is-yin"}>{lines[index] ? <em /> : <><em /><em /></>}</i>
          </div>
        );
      })}
    </div>
  );
}

function ReadingCard({ item, onOpen }: { item: IChingReadingItem; onOpen: () => void }) {
  const { info, reading, name, upperElement, lowerElement } = resolveItem(item);
  return (
    <section className="iching-reading-block">
      <header>
        <small>{item.label} · {reading?.pair ?? `Quẻ ${item.number}`}</small>
        <h4>Luận Quẻ {name}</h4>
      </header>
      <div className="iching-reading-table-wrap">
        <table className="iching-reading-table">
          <thead>
            <tr><th scope="col">Ý Nghĩa</th><th scope="col">Tài Chính</th><th scope="col">Sự Nghiệp</th><th scope="col">Sức Khỏe</th><th scope="col">Mối quan hệ</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>{reading?.meaning ?? info?.keyword ?? "—"}</strong></td>
              <td>{reading?.finance ?? "—"}</td>
              <td>{reading?.career ?? "—"}</td>
              <td>{reading?.health ?? "—"}</td>
              <td>{reading?.relationship ?? "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer className="iching-reading-more">
        <dl>
          {info && <div><dt>Thượng quái</dt><dd>{info.upper.symbol} {info.upper.name} · {upperElement}</dd></div>}
          {info && <div><dt>Hạ quái</dt><dd>{info.lower.symbol} {info.lower.name} · {lowerElement}</dd></div>}
          {item.note && <div><dt>Cách lập</dt><dd>{item.note}</dd></div>}
        </dl>
        <button type="button" className="iching-reading-more__btn" onClick={onOpen} aria-haspopup="dialog">
          <Eye size={16} aria-hidden="true" />
          <span>Xem chi tiết</span>
        </button>
      </footer>
    </section>
  );
}

const ASPECTS = [
  { key: "finance", label: "Tài Chính", icon: Wallet },
  { key: "career", label: "Sự Nghiệp", icon: BriefcaseBusiness },
  { key: "health", label: "Sức Khỏe", icon: HeartPulse },
  { key: "relationship", label: "Mối quan hệ", icon: Users },
] as const;

/** Hộp thoại đầy đủ thông tin một quẻ; có thẻ chuyển nhanh giữa các quẻ trong cùng kết quả. */
function HexagramDialog({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: IChingReadingItem[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const item = items[index];
  const { info, reading, name, upperElement, lowerElement, lines } = resolveItem(item);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("iching-dialog-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("iching-dialog-open");
      previous?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [index]);

  const onTabKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const next = (index + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    onIndexChange(next);
    dialogRef.current?.querySelectorAll<HTMLButtonElement>("[role='tab']")[next]?.focus();
  };

  return createPortal(
    <div className="iching-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="iching-dialog" role="dialog" aria-modal="true" aria-labelledby="iching-dialog-title" ref={dialogRef}>
        <header className="iching-dialog__head">
          <div>
            <small>{item.label} · Quẻ số {item.number}{reading ? ` · ${reading.pair}` : ""}</small>
            <h3 id="iching-dialog-title">{name}{upperElement ? ` (${upperElement}/${lowerElement})` : ""}</h3>
          </div>
          <button type="button" ref={closeRef} onClick={onClose} aria-label="Đóng">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        {items.length > 1 && (
          <div className="iching-dialog__tabs" role="tablist" aria-label="Chọn quẻ">
            {items.map((entry, entryIndex) => (
              <button
                type="button"
                role="tab"
                key={entry.key}
                aria-selected={entryIndex === index}
                tabIndex={entryIndex === index ? 0 : -1}
                className={entryIndex === index ? "is-active" : ""}
                onClick={() => onIndexChange(entryIndex)}
                onKeyDown={onTabKey}
              >
                {entry.label}
              </button>
            ))}
          </div>
        )}
        <div className="iching-dialog__body" ref={bodyRef} role="tabpanel" aria-label={`${item.label} ${name}`}>
          <div className="iching-dialog__overview">
            <HexagramFigure lines={lines} highlight={item.highlightLines} />
            <dl>
              {info && <div><dt>Thượng quái</dt><dd>{info.upper.symbol} {info.upper.name} · {info.upper.nature} · hành {upperElement}</dd></div>}
              {info && <div><dt>Hạ quái</dt><dd>{info.lower.symbol} {info.lower.name} · {info.lower.nature} · hành {lowerElement}</dd></div>}
              {info && <div><dt>Từ khóa</dt><dd>{info.keyword}</dd></div>}
              {item.note && <div><dt>Cách lập</dt><dd>{item.note}</dd></div>}
              {item.highlightLines && item.highlightLines.length > 0 && (
                <div><dt>Hào tô đỏ</dt><dd>Hào {item.highlightLines.join(", ")}</dd></div>
              )}
            </dl>
          </div>

          <section className="iching-dialog__section">
            <h4>Ý nghĩa</h4>
            <blockquote>{reading?.meaning ?? info?.keyword ?? "—"}</blockquote>
          </section>

          {reading && (
            <section className="iching-dialog__section">
              <h4>Luận theo bốn phương diện</h4>
              <div className="iching-dialog__aspects">
                {ASPECTS.map(({ key, label, icon: Icon }) => (
                  <article key={key}>
                    <span><Icon size={17} aria-hidden="true" /></span>
                    <div>
                      <b>{label}</b>
                      <p>{reading[key]}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {info && (
            <section className="iching-dialog__section">
              <h4>Tượng quẻ & lời khuyên</h4>
              <p>{info.message}</p>
            </section>
          )}

          {(item.movingDetails?.length || item.readingRule) && (
            <section className="iching-dialog__section">
              <h4>Hào động</h4>
              {item.movingDetails && item.movingDetails.length > 0 && (
                <ul className="iching-dialog__moving">
                  {item.movingDetails.map((line) => (
                    <li key={line.position}>
                      <b>Hào {line.position} · {line.polarity} ({line.change})</b>
                      <p>{line.guidance}</p>
                      <small>Trọng điểm: {line.focus}.</small>
                    </li>
                  ))}
                </ul>
              )}
              {item.readingRule && <p className="iching-dialog__rule">{item.readingRule}</p>}
            </section>
          )}

          <p className="iching-dialog__note">Nội dung luận giải mang tính tham khảo, không thay thế tư vấn chuyên môn về sức khỏe, pháp lý hay tài chính.</p>
        </div>
        <footer className="iching-dialog__foot">
          <button type="button" onClick={onClose}>Đóng</button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

/** Các bảng luận quẻ (Ý nghĩa · Tài chính · Sự nghiệp · Sức khỏe · Mối quan hệ) kèm nút xem chi tiết từng quẻ. */
export function IChingReadingList({ items, className = "" }: { items: IChingReadingItem[]; className?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeDialog = useRef(() => setOpenIndex(null)).current;
  return (
    <div className={`iching-reading-list ${className}`}>
      {items.map((item, index) => <ReadingCard key={item.key} item={item} onOpen={() => setOpenIndex(index)} />)}
      {openIndex !== null && items[openIndex] && (
        <HexagramDialog items={items} index={openIndex} onIndexChange={setOpenIndex} onClose={closeDialog} />
      )}
    </div>
  );
}
