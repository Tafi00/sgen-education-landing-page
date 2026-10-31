import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { BAT_CUC_COLUMNS, BAT_CUC_DETAILS, type BatCucDetail } from "../../../shared/sim/bat-cuc-chi-tiet";
import { useStudentUnlock } from "../ui/StudentAccess";

/** `source`: đoạn số gốc tạo ra cặp (gồm cả số 0, 5 bị bỏ qua), vd. cặp 36 từ "306". */
export type BatCucPairItem = { pair: string; source?: string; code: string; name: string; type: "cat" | "hung"; desc: string };

type Active = { index: number; anchor: HTMLElement; pinned: boolean };

/**
 * Các cặp số Bát Cực của SIM: thẻ hiện tên sao (màu theo cát / bình / hung) và cột "Ý nghĩa" của bảng khách;
 * rê chuột (máy có chuột) hoặc bấm (cảm ứng, bàn phím) để xem đủ 5 cột Ý nghĩa · Tài chính · Sự nghiệp · Sức khỏe ·
 * Mối quan hệ. Bấm lần nữa, Esc hoặc bấm ra ngoài để đóng.
 *
 * `locked` (chưa nhập mã học viên): thẻ vẫn hiện tên sao và Ý nghĩa cơ bản; bảng chi tiết không mở, bấm thẻ thì mở hộp
 * nhập mã học viên.
 */
export function BatCucPairs({ items, locked = false }: { items: BatCucPairItem[]; locked?: boolean }) {
  const requestUnlock = useStudentUnlock();
  const [active, setActive] = useState<Active | null>(null);
  const closeTimer = useRef<number | null>(null);
  const hoverCapable = useRef(false);

  useEffect(() => {
    hoverCapable.current = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  const cancelClose = () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const close = useCallback(() => {
    cancelClose();
    setActive(null);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (active.anchor.contains(target) || document.getElementById("skd-bcls-pop")?.contains(target)) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [active, close]);

  useEffect(() => cancelClose, []);

  return (
    <div className="skd-bcls-pair-flow" role="list" aria-label="Các cặp sao Bát Cực trong SIM">
      {items.map((item, index) => {
        const detail = BAT_CUC_DETAILS[item.code];
        const tone = detail?.tone ?? item.type;
        const open = active?.index === index;
        return (
          <div key={`${item.pair}-${index}`} role="listitem">
            <button
              type="button"
              className={`skd-bcls-pair is-${tone}`}
              aria-expanded={locked ? undefined : open}
              aria-controls={open ? "skd-bcls-pop" : undefined}
              aria-haspopup={locked ? "dialog" : undefined}
              onMouseEnter={(event) => {
                if (locked || !hoverCapable.current || !detail) return;
                cancelClose();
                const anchor = event.currentTarget;
                setActive((current) => (current?.pinned ? current : { index, anchor, pinned: false }));
              }}
              onMouseLeave={() => {
                if (locked || !hoverCapable.current) return;
                cancelClose();
                closeTimer.current = window.setTimeout(() => setActive((current) => (current?.pinned ? current : null)), 120);
              }}
              onClick={(event) => {
                if (locked) {
                  requestUnlock();
                  return;
                }
                if (!detail) return;
                const anchor = event.currentTarget;
                setActive((current) => (current?.index === index && current.pinned ? null : { index, anchor, pinned: true }));
              }}
            >
              <span className="skd-bcls-pair__head">
                <strong>
                  {item.pair}
                  {item.source && item.source !== item.pair ? <small className="skd-bcls-pair__source">từ {item.source}</small> : null}
                </strong>
                <span>{index + 1}</span>
              </span>
              <b>{item.name}</b>
              <span className="skd-bcls-pair__meaning">{detail?.meaning ?? item.desc}</span>
            </button>
          </div>
        );
      })}
      {!locked && active && BAT_CUC_DETAILS[items[active.index]?.code] && (
        <BatCucPopover
          detail={BAT_CUC_DETAILS[items[active.index].code]}
          pair={items[active.index].pair}
          anchor={active.anchor}
          pinned={active.pinned}
          onClose={close}
        />
      )}
    </div>
  );
}

function BatCucPopover({ detail, pair, anchor, pinned, onClose }: { detail: BatCucDetail; pair: string; anchor: HTMLElement; pinned: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      const node = ref.current;
      if (!node || !anchor.isConnected) return;
      const rect = anchor.getBoundingClientRect();
      const gap = 8;
      const margin = 8;
      const below = window.innerHeight - rect.bottom;
      const above = rect.top;
      const height = node.offsetHeight;
      const top = below >= height + gap + margin || below >= above ? rect.bottom + gap : rect.top - gap - height;
      const left = Math.min(Math.max(rect.left + rect.width / 2 - node.offsetWidth / 2, margin), window.innerWidth - node.offsetWidth - margin);
      setPlace({ top: Math.max(margin, top), left });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [anchor, detail]);

  return createPortal(
    <div
      ref={ref}
      id="skd-bcls-pop"
      className={`skd-bcls-pop is-${detail.tone}`}
      role="dialog"
      aria-label={`${detail.name} — cặp số ${pair}`}
      style={place ? { top: place.top, left: place.left } : { top: -9999, left: -9999 }}
    >
      <header className="skd-bcls-pop__head">
        <strong>{detail.name}</strong>
        <span className="skd-bcls-pop__score">({detail.score})</span>
        <span className="skd-bcls-pop__pairs">{detail.pairs.join(" - ")}</span>
        {pinned && (
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </header>
      <dl className="skd-bcls-pop__grid">
        {BAT_CUC_COLUMNS.map((column) => (
          <div key={column.key}>
            <dt>{column.label}</dt>
            <dd>{detail[column.key]}</dd>
          </div>
        ))}
      </dl>
    </div>,
    document.body,
  );
}
