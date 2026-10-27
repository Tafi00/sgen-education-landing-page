import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, ChevronUp, X } from "lucide-react";

export type AppendixDocument = {
  title: string;
  /**
   * Gốc đường dẫn ảnh trang: `${pagesDir}/trang-001.webp` … (ảnh sinh bằng `scripts/render_phu_luc_64_que.py`; Phụ lục
   * 64 quẻ do máy chủ trả qua /api/hoc-vien/phu-luc cho học viên đã nhập mã).
   */
  pagesDir: string;
  pageCount: number;
  /** Số trang in trên trang đầu tiên — tài liệu là phần trích nên bắt đầu từ "Trang 49", khớp cột "Trang" trong bảng tra. */
  firstPrintedPage: number;
  pageWidth: number;
  pageHeight: number;
};

const pageSrc = (doc: AppendixDocument, index: number) => `${doc.pagesDir}/trang-${String(index + 1).padStart(3, "0")}.webp`;

/**
 * Trình xem tài liệu chỉ để đọc: hiển thị ảnh từng trang (không phát hành file PDF), không có nút tải,
 * chặn menu chuột phải / kéo thả ảnh. Ảnh tải dần khi cuộn tới để không phải tải cả ~12 MB một lúc.
 */
export function AppendixReader({ doc, onClose }: { doc: AppendixDocument; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [jump, setJump] = useState("");
  const lastPrinted = doc.firstPrintedPage + doc.pageCount - 1;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input, [tabindex]:not([tabindex='-1'])");
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

  // Mọi trang cùng khổ nên trang hiện tại suy ra trực tiếp từ vị trí cuộn.
  const onScroll = () => {
    const body = bodyRef.current;
    const first = body?.querySelector<HTMLElement>(".appendix-reader__page");
    const second = first?.nextElementSibling as HTMLElement | null;
    if (!body || !first) return;
    const step = second ? second.offsetTop - first.offsetTop : first.offsetHeight;
    const index = Math.floor((body.scrollTop - first.offsetTop + body.clientHeight / 3) / step);
    setCurrent(Math.min(doc.pageCount - 1, Math.max(0, index)));
  };

  const goTo = (index: number) => {
    const target = bodyRef.current?.querySelectorAll<HTMLElement>(".appendix-reader__page")[index];
    if (target && bodyRef.current) bodyRef.current.scrollTo({ top: target.offsetTop - 12 });
  };

  const onJump = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const printed = Number(jump);
    if (!Number.isInteger(printed) || printed < doc.firstPrintedPage || printed > lastPrinted) return;
    goTo(printed - doc.firstPrintedPage);
    setJump("");
  };

  return createPortal(
    <div className="iching-dialog-backdrop appendix-reader-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div
        className="appendix-reader"
        role="dialog"
        aria-modal="true"
        aria-labelledby="appendix-reader-title"
        ref={dialogRef}
        onContextMenu={(event) => event.preventDefault()}
      >
        <header className="appendix-reader__head">
          <div>
            <small>Tài liệu chỉ xem trực tuyến</small>
            <h3 id="appendix-reader-title">{doc.title}</h3>
          </div>
          <button type="button" ref={closeRef} onClick={onClose} aria-label="Đóng tài liệu">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="appendix-reader__bar">
          <span className="appendix-reader__status" aria-live="polite">
            Trang <b>{doc.firstPrintedPage + current}</b> <small>({current + 1}/{doc.pageCount})</small>
          </span>
          <div className="appendix-reader__nav">
            <button type="button" onClick={() => goTo(current - 1)} disabled={current === 0} aria-label="Trang trước">
              <ChevronUp size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => goTo(current + 1)} disabled={current >= doc.pageCount - 1} aria-label="Trang sau">
              <ChevronDown size={18} aria-hidden="true" />
            </button>
          </div>
          <form className="appendix-reader__jump" onSubmit={onJump}>
            <label htmlFor="appendix-reader-jump">Đến trang</label>
            <input
              id="appendix-reader-jump"
              type="number"
              inputMode="numeric"
              min={doc.firstPrintedPage}
              max={lastPrinted}
              placeholder={`${doc.firstPrintedPage}–${lastPrinted}`}
              value={jump}
              onChange={(event) => setJump(event.target.value)}
            />
            <button type="submit">Xem</button>
          </form>
        </div>
        <div className="appendix-reader__body" ref={bodyRef} onScroll={onScroll}>
          {Array.from({ length: doc.pageCount }, (_, index) => (
            <figure className="appendix-reader__page" key={index}>
              <img
                src={pageSrc(doc, index)}
                width={doc.pageWidth}
                height={doc.pageHeight}
                alt={`${doc.title} — trang ${doc.firstPrintedPage + index}`}
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
              />
            </figure>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
