import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUp, Coins, LoaderCircle, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { getHexagram } from "../../../shared/menh-thu/metaphysics";

export type FengShuiToolViewProps = {
  /** Câu hỏi gợi ý cho lần gieo đầu tiên. Chỉ dùng làm giá trị khởi tạo. */
  defaultQuestion?: string;
  /** Chế độ gọn: ẩn phần tiêu đề nghi thức và ghi chú phương pháp trong thẻ nhập liệu. */
  compact?: boolean;
};

function HexagramLines({ values }: { values: number[] }) {
  return (
    <div className="fengshui-hex-lines" aria-label="Sáu hào, trình bày từ trên xuống">
      {[...values].reverse().map((value, reverseIndex) => {
        const position = values.length - reverseIndex;
        const yang = value === 7 || value === 9;
        const moving = value === 6 || value === 9;
        return (
          <div className={`${yang ? "is-yang" : "is-yin"} ${moving ? "is-moving" : ""}`} key={`${position}-${value}`}>
            <small>Hào {position}</small>
            <span>{yang ? <i /> : <><i /><i /></>}</span>
            <b>{value}{moving ? " · động" : ""}</b>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Công cụ gieo quẻ Kinh Dịch bằng ba đồng xu, tách từ `FengShuiTools` để dùng độc lập
 * trên trang `/cong-cu-phong-thuy/gieo-que-kinh-dich`. Giữ nguyên thuật toán lập quẻ
 * và cách trình bày kết quả của bản gốc.
 */
export function IChingToolView({ defaultQuestion = "", compact = false }: FengShuiToolViewProps) {
  const [question, setQuestion] = useState(defaultQuestion);
  const [lines, setLines] = useState<number[]>([]);
  const [faces, setFaces] = useState<boolean[]>([]);
  const [casting, setCasting] = useState(false);
  const result = useMemo(() => lines.length === 6 ? getHexagram(lines) : null, [lines]);
  const topRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Đủ sáu hào thì đưa người dùng tới khối kết quả (bù chiều cao header bằng scroll-margin-top).
  useEffect(() => {
    if (compact || lines.length !== 6) return;
    const node = resultRef.current;
    if (!node) return;
    const timer = window.setTimeout(() => node.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    return () => window.clearTimeout(timer);
  }, [compact, lines.length]);

  const secureCoinFace = () => {
    if (globalThis.crypto?.getRandomValues) {
      const value = new Uint8Array(1);
      globalThis.crypto.getRandomValues(value);
      return value[0] < 128;
    }
    return Math.random() >= 0.5;
  };

  const cast = () => {
    if (casting || lines.length >= 6) return;
    const nextFaces = Array.from({ length: 3 }, secureCoinFace);
    const nextValue = nextFaces.reduce((sum, isHead) => sum + (isHead ? 2 : 3), 0);
    setFaces(nextFaces);
    setCasting(true);
    window.setTimeout(() => {
      setLines((current) => [...current, nextValue]);
      setCasting(false);
    }, 540);
  };

  const reset = () => {
    setLines([]);
    setFaces([]);
    setCasting(false);
  };

  return (
    <div className="fengshui-tool-layout fengshui-tool-layout--iching" ref={topRef}>
      <div className="fengshui-form-card">
        {!compact && <span className="fengshui-kicker"><Coins /> Nghi thức lập quẻ</span>}
        {!compact && <h3>Giữ một câu hỏi, gieo đủ sáu hào</h3>}
        <label>
          <span>Điều bạn muốn suy xét <em>(không bắt buộc)</em></span>
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ví dụ: Đây đã phải thời điểm phù hợp để bắt đầu kế hoạch chưa?" rows={3} />
        </label>
        <div className="coin-stage" aria-live="polite">
          {[0, 1, 2].map((index) => (
            <span className={`${casting ? "is-casting" : ""} ${faces[index] ? "is-head" : "is-tail"}`} key={index}>
              {faces.length ? (faces[index] ? "Ngửa" : "Sấp") : "☯"}
            </span>
          ))}
        </div>
        <button className="fengshui-primary-action" type="button" onClick={cast} disabled={casting || lines.length >= 6}>
          {casting ? <LoaderCircle className="is-spinning" /> : <Coins />}
          {lines.length >= 6 ? "Đã đủ sáu hào" : `Gieo lần ${lines.length + 1} / 6`}
        </button>
        <button className="fengshui-reset" type="button" onClick={reset} disabled={!lines.length && !faces.length}>
          <RotateCcw /> Gieo lại từ đầu
        </button>
        {!compact && <p className="fengshui-method-note"><ShieldCheck /> Mỗi lần gieo dùng số ngẫu nhiên bảo mật của trình duyệt; hào được lập từ dưới lên.</p>}
      </div>

      <div className="fengshui-result-card" id="iching-ket-qua" ref={resultRef}>
        <div className="fengshui-result-card__heading">
          <div><small>Kết quả lập quẻ</small><h3>{result ? `${result.primary.name} · Quẻ ${result.primary.number}` : "Thiên bàn đang tĩnh"}</h3></div>
          <span>{lines.length}/6 hào</span>
        </div>

        {lines.length ? <HexagramLines values={lines} /> : <div className="fengshui-empty"><Coins /><p>Hào đầu tiên sẽ xuất hiện sau lần gieo thứ nhất.</p></div>}

        {result && (
          <div className="iching-reading">
            {question && <blockquote>“{question}”</blockquote>}
            <div className="iching-reading__pair">
              <article>
                <small>Quẻ chủ · {result.primary.upper.symbol} trên {result.primary.lower.symbol} dưới</small>
                <h4>{result.primary.name}</h4>
                <b>{result.primary.keyword}</b>
                <p>{result.primary.message}</p>
              </article>
              <ArrowRight aria-hidden="true" />
              <article>
                <small>Quẻ biến · {result.changed.upper.symbol} trên {result.changed.lower.symbol} dưới</small>
                <h4>{result.changed.name}</h4>
                <b>{result.changed.keyword}</b>
                <p>{result.changed.message}</p>
              </article>
            </div>
            <p className="iching-reading__rule"><Sparkles /> {result.readingRule}</p>
            {result.movingDetails.length > 0 && <div className="moving-lines">
              {result.movingDetails.map((line) => <article key={line.position}><b>Hào {line.position} · {line.polarity}</b><span>{line.guidance}</span></article>)}
            </div>}
            <button
              type="button"
              className="fengshui-back-to-top"
              onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            >
              <ArrowUp aria-hidden="true" /> Về đầu công cụ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
