import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ArrowUp,
  Bot,
  Check,
  ChevronRight,
  CircleCheck,
  ClipboardCopy,
  Coins,
  Download,
  ExternalLink,
  FileText,
  LibraryBig,
  RotateCcw,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { getHexagram, type HexagramResult } from "../../../shared/menh-thu/metaphysics";
import { ICHING_DOCUMENT_READINGS } from "./iching-document-readings";
import { IChingReadingList } from "./IChingReadingList";
import { LucHaoSheet } from "./LucHaoSheet";
import { buildLucHaoSheet } from "../../../shared/sim/sim-phong-thuy-engine";
import "../../styles/iching-tool.css";
import { Button } from "../ui/Button";

export type FengShuiToolViewProps = {
  /** Câu hỏi gợi ý cho lần gieo đầu tiên. Chỉ dùng làm giá trị khởi tạo. */
  defaultQuestion?: string;
  /** Chế độ gọn: ẩn phần tiêu đề nghi thức và ghi chú phương pháp trong thẻ nhập liệu. */
  compact?: boolean;
};

/** Phụ lục chi tiết 64 quẻ do SGEN biên soạn, phát hành kèm công cụ Gieo quẻ. */
const APPENDIX_PDF = {
  href: "/assets/downloads/phu-luc-64-que-kinh-dich.pdf",
  title: "Phụ lục chi tiết 64 quẻ Kinh Dịch",
  detail: "Tệp PDF · 133 trang · khoảng 4,8 MB",
};

const CAST_PURPOSES = [
  { key: "timing", label: "Thời điểm", scope: "Tiến, lui hay chờ", prompt: "Ví dụ: Đây đã phải thời điểm thích hợp để bắt đầu kế hoạch chưa?", focus: "độ chín của thời cơ và nhịp tiến–lui", counsel: "quan sát điều kiện đã đủ hay mới chỉ có ý muốn", caution: "phân biệt sự trì hoãn do sợ hãi với một khoảng chờ thực sự cần thiết" },
  { key: "love", label: "Tình cảm", scope: "Cảm xúc & tương hợp", prompt: "Ví dụ: Mối quan hệ này cần điều gì để có thể tiến xa hơn?", focus: "sự tương ứng giữa tình cảm, ranh giới và mức độ thành thật", counsel: "đối chiếu lời nói với hành động của cả hai phía", caution: "không dùng quẻ để đoán thay suy nghĩ hay ý chí của người khác" },
  { key: "family", label: "Gia đạo", scope: "Nề nếp & hòa khí", prompt: "Ví dụ: Tôi nên làm gì để tháo gỡ bất đồng đang có trong gia đình?", focus: "vai trò, nề nếp và dòng giao tiếp giữa những người gần gũi", counsel: "sửa từ phần trách nhiệm của mình rồi mới mong người khác chuyển", caution: "tránh biến mong muốn giữ hòa khí thành việc né một vấn đề cần nói rõ" },
  { key: "career", label: "Công danh", scope: "Vị trí & đường tiến", prompt: "Ví dụ: Tôi có nên nhận vị trí mới trong giai đoạn này không?", focus: "vị thế, năng lực thực và con đường phát triển dài hạn", counsel: "xem cơ hội này giúp tích lũy uy tín hay chỉ làm tăng danh vị trước mắt", caution: "đừng đánh đổi nền tảng nghề nghiệp chỉ vì một tín hiệu thuận lợi ngắn hạn" },
  { key: "business", label: "Kinh doanh", scope: "Thế cuộc & vận hành", prompt: "Ví dụ: Kế hoạch mở rộng này đang thiếu điều kiện quan trọng nào?", focus: "thế thị trường, năng lực vận hành và sức chịu đựng của nguồn lực", counsel: "thử ở quy mô đủ nhỏ để thấy điểm nghẽn trước khi mở rộng", caution: "không thay thế thẩm định pháp lý, tài chính và dữ liệu thị trường bằng lời quẻ" },
  { key: "partnership", label: "Hợp tác", scope: "Người & cam kết", prompt: "Ví dụ: Tôi cần xem xét điều gì trước khi đồng hành cùng đối tác này?", focus: "mức độ đồng thuận về mục tiêu, quyền hạn và cách chia sẻ trách nhiệm", counsel: "làm rõ điều khoản khó nói khi quan hệ vẫn còn thuận", caution: "sức hút ban đầu không phải bằng chứng cho một cam kết bền vững" },
  { key: "wealth", label: "Tài chính", scope: "Tích lũy & rủi ro", prompt: "Ví dụ: Tôi nên ưu tiên bảo toàn hay mở rộng nguồn vốn lúc này?", focus: "dòng tiền, mức chịu rủi ro và tính bền của nguồn lợi", counsel: "ưu tiên phương án còn đường lui và có giới hạn tổn thất rõ", caution: "coi quẻ là góc suy xét, không phải khuyến nghị đầu tư hay bảo đảm lợi nhuận" },
  { key: "study", label: "Học tập", scope: "Đường học & thi cử", prompt: "Ví dụ: Tôi nên điều chỉnh cách học thế nào cho kỳ thi sắp tới?", focus: "phương pháp, kỷ luật và phần kiến thức cần bồi đắp", counsel: "chuyển mục tiêu lớn thành nhịp rèn luyện đều và đo được", caution: "đừng để mong cầu kết quả che mất dữ kiện từ quá trình chuẩn bị thực tế" },
  { key: "health", label: "Sức khỏe", scope: "Điều dưỡng & nếp sống", prompt: "Ví dụ: Nếp sống nào đang cần tôi quan tâm và điều chỉnh trước tiên?", focus: "nhịp nghỉ ngơi, khả năng hồi phục và điều đang làm cơ thể hao tổn", counsel: "ưu tiên thay đổi nhỏ có thể duy trì và theo dõi được", caution: "quẻ không chẩn đoán bệnh; triệu chứng bất thường cần được nhân viên y tế đánh giá" },
] as const;

function buildIChingAiPrompt({
  question,
  purpose,
  lines,
  hexagram,
}: {
  question: string;
  purpose: (typeof CAST_PURPOSES)[number];
  lines: number[];
  hexagram: HexagramResult;
}) {
  const lineSummary = lines.map((value, index) => {
    const polarity = value === 7 || value === 9 ? "Dương" : "Âm";
    const movement = value === 6 || value === 9 ? " · động" : " · tĩnh";
    return `Hào ${index + 1}: ${value} · ${polarity}${movement}`;
  }).join("\n");
  const movingSummary = hexagram.movingDetails.length > 0
    ? hexagram.movingDetails.map((line) =>
      `Hào ${line.position} (${line.polarity}, ${line.change}): ${line.guidance} Trọng điểm: ${line.focus}.`,
    ).join("\n")
    : "Không có hào động.";
  const primaryReading = ICHING_DOCUMENT_READINGS[hexagram.primary.number];
  const changedReading = ICHING_DOCUMENT_READINGS[hexagram.changed.number];

  return [
    "Hãy luận giải quẻ Kinh Dịch dưới đây bằng tiếng Việt sáng rõ, thận trọng và có tính ứng dụng.",
    "",
    `CÂU HỎI: ${question.trim() || "Không nêu câu hỏi cụ thể; xin đọc như một thông điệp tổng quát cho hiện tại."}`,
    `CHỦ ĐỀ: ${purpose.label} — ${purpose.scope}`,
    "",
    "DỮ LIỆU LẬP QUẺ (các hào ghi từ dưới lên):",
    lineSummary,
    "",
    `QUẺ CHỦ: ${primaryReading?.pair ?? hexagram.primary.number} — ${primaryReading?.name ?? hexagram.primary.name}`,
    `Ý nghĩa theo tài liệu SGEN: ${primaryReading?.meaning ?? hexagram.primary.keyword}`,
    `Thượng quái: ${hexagram.primary.upper.name} (${hexagram.primary.upper.symbol}) — ${hexagram.primary.upper.nature}`,
    `Hạ quái: ${hexagram.primary.lower.name} (${hexagram.primary.lower.symbol}) — ${hexagram.primary.lower.nature}`,
    `Tượng quẻ tham khảo: ${hexagram.primary.message}`,
    "",
    "HÀO ĐỘNG:",
    movingSummary,
    "",
    `QUẺ BIẾN: ${changedReading?.pair ?? hexagram.changed.number} — ${changedReading?.name ?? hexagram.changed.name}`,
    `Ý nghĩa quẻ biến theo tài liệu SGEN: ${changedReading?.meaning ?? hexagram.changed.keyword}`,
    `Quy tắc đọc: ${hexagram.readingRule}`,
    "",
    "YÊU CẦU:",
    "1. Tóm tắt thế quẻ và trả lời trực diện câu hỏi.",
    "2. Phân tích quẻ chủ, các hào động và quẻ biến theo đúng thứ tự.",
    "3. Nêu điều nên làm, điều nên tránh và một kế hoạch hành động ngắn.",
    "4. Phân biệt rõ dữ kiện của quẻ với phần suy luận; không khẳng định tương lai tuyệt đối.",
    "5. Với vấn đề sức khỏe, pháp lý hoặc tài chính, chỉ đưa góc nhìn tham khảo và nhắc người hỏi kiểm chứng bằng chuyên gia phù hợp.",
  ].join("\n");
}

function ToolIntro({
  icon: Icon,
  title,
  description,
  highlights,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
}) {
  return (
    <header className="tool-intro">
      <span className="tool-intro__icon"><Icon size={27} strokeWidth={1.7} /></span>
      <div className="tool-intro__copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <ul>
        {highlights.map((item) => <li key={item}><Check size={14} strokeWidth={2} />{item}</li>)}
      </ul>
    </header>
  );
}

function MethodNote({
  title,
  points,
  sources,
}: {
  title: string;
  points: string[];
  sources: { label: string; href: string }[];
}) {
  return (
    <details className="method-note">
      <summary><span><ShieldCheck size={19} /><b>{title}</b><small>Quy tắc và nguồn dữ liệu có thể đối chiếu</small></span><span>Đã kiểm chứng <ChevronRight size={17} /></span></summary>
      <div className="method-note__body">
        <div>{points.map((point) => <p key={point}><CircleCheck size={15} />{point}</p>)}</div>
        <nav aria-label="Nguồn phương pháp">{sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer"><LibraryBig size={15} />{source.label}<ExternalLink size={13} /></a>)}</nav>
      </div>
    </details>
  );
}

/**
 * Công cụ gieo quẻ Kinh Dịch bằng ba đồng xu — port trình bày từ Mệnh thư,
 * giữ nguyên thuật toán lập quẻ (getHexagram) và nguồn ngẫu nhiên bảo mật.
 */
export function IChingToolView({ defaultQuestion = "", compact = false }: FengShuiToolViewProps) {
  const [question, setQuestion] = useState(defaultQuestion);
  const [castPurpose, setCastPurpose] = useState<(typeof CAST_PURPOSES)[number]["key"]>("timing");
  const activeCastPurpose = CAST_PURPOSES.find((purpose) => purpose.key === castPurpose) ?? CAST_PURPOSES[0];
  const [coinLines, setCoinLines] = useState<number[]>([]);
  const [coinHistory, setCoinHistory] = useState<boolean[][]>([]);
  const [coinFaces, setCoinFaces] = useState([true, false, true]);
  const [tossing, setTossing] = useState(false);
  const [tossRound, setTossRound] = useState(0);
  const [omenFlash, setOmenFlash] = useState(false);
  const [copiedAi, setCopiedAi] = useState(false);
  const tossTimer = useRef<number | undefined>(undefined);
  const flashTimer = useRef<number | undefined>(undefined);
  const resultRef = useRef<HTMLDivElement>(null);

  const hexagram = useMemo(() => coinLines.length === 6 ? getHexagram(coinLines) : null, [coinLines]);
  /** Lá quẻ Lục Hào an theo thời điểm gieo (Can Chi ngày/tháng quyết định Lục Thú, Vượng Suy, Quý Thần). */
  const lucHao = useMemo(() => {
    if (coinLines.length !== 6) return null;
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    const movingLines = coinLines.flatMap((value, index) => (value === 6 || value === 9 ? [index + 1] : []));
    return {
      movingLines,
      castAt: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
      data: buildLucHaoSheet({
        lines: coinLines.map((value) => (value === 7 || value === 9 ? 1 : 0)),
        movingLines,
        solarDate: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
      }),
    };
  }, [coinLines]);
  const aiPrompt = useMemo(() => hexagram ? buildIChingAiPrompt({
    question,
    purpose: activeCastPurpose,
    lines: coinLines,
    hexagram,
  }) : "", [activeCastPurpose, coinLines, hexagram, question]);

  useEffect(() => {
    if (coinLines.length === 6 && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [coinLines.length]);

  useEffect(() => () => {
    clearTimeout(tossTimer.current);
    clearTimeout(flashTimer.current);
  }, []);

  const secureCoinFace = () => {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const randomByte = new Uint8Array(1);
      crypto.getRandomValues(randomByte);
      return randomByte[0] < 128;
    }
    return Math.random() >= 0.5;
  };

  const tossCoins = () => {
    if (tossing || coinLines.length >= 6) return;
    const faces = Array.from({ length: 3 }, secureCoinFace);
    const value = faces.reduce((sum, heads) => sum + (heads ? 2 : 3), 0);
    setCoinFaces(faces);
    setTossRound((round) => round + 1);
    setTossing(true);
    tossTimer.current = window.setTimeout(() => {
      setCoinLines((lines) => [...lines, value]);
      setCoinHistory((history) => [...history, faces]);
      setTossing(false);
      if (value === 6 || value === 9) {
        setOmenFlash(true);
        flashTimer.current = window.setTimeout(() => setOmenFlash(false), 520);
      }
    }, 1850);
  };

  const resetCoins = () => {
    clearTimeout(tossTimer.current);
    clearTimeout(flashTimer.current);
    setCoinLines([]);
    setCoinHistory([]);
    setCoinFaces([true, false, true]);
    setTossing(false);
    setTossRound(0);
    setOmenFlash(false);
    setCopiedAi(false);
  };

  const copyIChingForAi = async () => {
    if (!aiPrompt) return;
    try {
      await navigator.clipboard.writeText(aiPrompt);
      setCopiedAi(true);
      window.setTimeout(() => setCopiedAi(false), 2500);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <section className="tool-section tool-page iching-section view-panel" id="iching">
      {!compact && (
        <ToolIntro
          icon={Coins}
          title="Gieo quẻ Kinh Dịch"
          description="Giữ tâm ý nhất quán và tung ba đồng xu đúng sáu lần. Mỗi lần tung lập một hào từ dưới lên; đủ sáu hào hệ thống mới mở quẻ chủ, nhận diện hào động và an quẻ biến."
          highlights={["Lập hào từ dưới lên", "Lưu dấu 3 mặt xu mỗi lần", "Chỉ luận khi đủ 6 hào"]}
        />
      )}
      <div className="iching-workspace">
        <div className="ritual-panel">
          <div className="ritual-setup">
            <fieldset className="cast-purpose">
              <legend>Chọn chủ đề</legend>
              <div>{CAST_PURPOSES.map((purpose) => <button type="button" key={purpose.key} className={castPurpose === purpose.key ? "is-selected" : ""} disabled={coinLines.length > 0 || tossing} onClick={() => setCastPurpose(purpose.key)}>{purpose.label}</button>)}</div>
            </fieldset>
            <div className="question-field">
              <div className="question-label"><label htmlFor="question">Điều bạn đang suy xét <span>không bắt buộc</span></label><small>{question.length}/180</small></div>
              <textarea id="question" value={question} maxLength={180} onChange={(event) => setQuestion(event.target.value)} placeholder={activeCastPurpose.prompt} rows={2} />
            </div>
          </div>
          <div className="casting-instruction">
            <strong>Tung 3 đồng xu để lập hào</strong>
            <div className="coin-key" aria-label="Quy ước hai mặt đồng xu">
              <span><i className="mini-coin is-heads">乾</i><b>Mặt ngửa</b><small>2 điểm</small></span>
              <span><i className="mini-coin is-tails">坤</i><b>Mặt sấp</b><small>3 điểm</small></span>
            </div>
          </div>

          <div className="casting-ledger" aria-live="polite" aria-label="Sáu hào của quẻ">
            {[6, 5, 4, 3, 2, 1].map((lineNumber) => {
              const value = coinLines[lineNumber - 1];
              const faces = coinHistory[lineNumber - 1];
              const yang = value === 7 || value === 9;
              const moving = value === 6 || value === 9;
              return (
                <div className={`casting-row ${value ? "is-revealed" : ""} ${moving ? "is-moving" : ""}`} key={lineNumber}>
                  <span>Hào {lineNumber}</span>
                  <div className={`casting-line ${yang ? "is-yang" : "is-yin"} ${!value ? "is-empty" : ""}`}>
                    {yang ? <i /> : <><i /><i /></>}
                    {moving && <b>{value === 9 ? "○" : "×"}</b>}
                  </div>
                  <div className="casting-coins">
                    {faces ? faces.map((heads, index) => <i className={`mini-coin ${heads ? "is-heads" : "is-tails"}`} key={`${lineNumber}-${index}`}>{heads ? "乾" : "坤"}</i>) : [0, 1, 2].map((index) => <i className="mini-coin is-empty" key={`${lineNumber}-${index}`} />)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="toss-status"><span>{coinLines.length < 6 ? `Đang chờ lập hào ${coinLines.length + 1} / 6` : "Quẻ đã thành · có thể xem luận giải"}</span><div>{Array.from({ length: 6 }, (_, index) => <i key={index} className={index < coinLines.length ? "is-filled" : ""} />)}</div></div>
        </div>

        <div className="hexagram-panel" aria-live="polite" ref={resultRef}>
          {hexagram ? (
            <div className="hex-result">
              <div className="iching-result-intro">
                <small>Kết quả gieo quẻ · {activeCastPurpose.label}</small>
                <h3>Quẻ chủ và Quẻ biến</h3>
                <p>{hexagram.moving.length ? `Có ${hexagram.moving.length} hào động: ${hexagram.moving.join(", ")}. Các hào này đổi âm dương để thành quẻ biến.` : "Không có hào động. Quẻ biến giữ nguyên sáu hào của quẻ chủ."}</p>
              </div>
              {(() => {
                const primaryReading = ICHING_DOCUMENT_READINGS[hexagram.primary.number];
                const changedReading = ICHING_DOCUMENT_READINGS[hexagram.changed.number];
                const renderLine = (index: number, changed: boolean) => {
                  const original = coinLines[index];
                  const value = changed ? (original === 6 ? 7 : original === 9 ? 8 : original) : original;
                  const yang = value === 7 || value === 9;
                  const moving = original === 6 || original === 9;
                  return (
                    <span className={`iching-diagram-line ${moving ? "is-moving" : ""}`} key={`${changed ? "b" : "c"}-${index}`}>
                      <i className={yang ? "is-yang" : "is-yin"}>{yang ? <em /> : <><em /><em /></>}</i>
                      <small>{moving ? (original === 9 ? "○" : "×") : ""}</small>
                    </span>
                  );
                };
                return (
                  <>
                    <div className="iching-diagram" aria-label="Sơ đồ Quẻ Chủ và Quẻ Biến">
                      <div className="iching-diagram__head">
                        <span>Hào</span>
                        <strong>Quẻ Chủ</strong>
                        <span className="iching-diagram__trigrams">
                          <b>{hexagram.primary.upper.name} → {hexagram.changed.upper.name}</b>
                          <b>{hexagram.primary.lower.name} → {hexagram.changed.lower.name}</b>
                          <small>{hexagram.moving.length ? `Động hào ${hexagram.moving.join(", ")}` : "Quẻ tĩnh · không hào động"}</small>
                        </span>
                        <strong>Quẻ Biến</strong>
                        <span>Hào</span>
                      </div>
                      {[5, 4, 3, 2, 1, 0].map((index) => {
                        const moving = coinLines[index] === 6 || coinLines[index] === 9;
                        return (
                          <div className={`iching-diagram__row ${moving ? "is-moving" : ""}`} key={index}>
                            <span>{index + 1}</span>
                            {renderLine(index, false)}
                            <i aria-hidden="true" />
                            {renderLine(index, true)}
                            <span>{index + 1}</span>
                          </div>
                        );
                      })}
                      <div className="iching-diagram__foot">
                        <strong>{primaryReading?.pair ?? ""} {primaryReading?.name ?? hexagram.primary.name}</strong>
                        <strong>{changedReading?.pair ?? ""} {changedReading?.name ?? hexagram.changed.name}</strong>
                      </div>
                    </div>
                    <IChingReadingList
                      items={[
                        {
                          key: "primary",
                          label: "Quẻ Chủ",
                          number: hexagram.primary.number,
                          highlightLines: hexagram.moving,
                          note: hexagram.moving.length ? `Động hào ${hexagram.moving.join(", ")}` : "Quẻ tĩnh, không hào động",
                          movingDetails: hexagram.movingDetails,
                          readingRule: hexagram.readingRule,
                        },
                        {
                          key: "changed",
                          label: "Quẻ Biến",
                          number: hexagram.changed.number,
                          highlightLines: hexagram.moving,
                          note: hexagram.moving.length ? `Biến từ hào ${hexagram.moving.join(", ")} của quẻ chủ` : "Giữ nguyên quẻ chủ",
                        },
                      ]}
                    />
                  </>
                );
              })()}
              {question && <div className="question-echo"><small>Câu hỏi đã lập quẻ</small><p>“{question}”</p></div>}
              <section className="iching-ai-panel" aria-labelledby="iching-ai-title">
                <header>
                  <span><Bot size={18} /></span>
                  <div>
                    <small>Gói dữ liệu dành cho AI</small>
                    <h4 id="iching-ai-title">Hỏi sâu hơn về quẻ này</h4>
                    <p>Đã ghép câu hỏi, sáu hào, quẻ chủ, hào động và quẻ biến thành một prompt hoàn chỉnh.</p>
                  </div>
                </header>
                <textarea aria-label="Nội dung câu hỏi và dữ liệu quẻ dành cho AI" readOnly value={aiPrompt} rows={7} />
                <div className="iching-ai-actions">
                  <Button variant="secondary" size="sm" onClick={copyIChingForAi}>
                    <ClipboardCopy size={16} /><span>{copiedAi ? "Đã chép" : "Chép cho AI"}</span>
                  </Button>
                </div>
                <p className="iching-ai-note">AI chỉ hỗ trợ diễn giải và suy xét; không thay thế quyết định chuyên môn hoặc bảo đảm một kết quả tương lai.</p>
              </section>
            </div>
          ) : (
            <div className="hex-empty">
              <span className="hex-empty__chapter">Thiên bàn đang tĩnh</span>
              <div className="hex-empty__seal" aria-hidden="true">易</div>
              <div className="empty-hex-lines"><span /><span /><span /><span /><span /><span /></div>
              <h3>Sáu hào đang chờ được lập</h3>
              <p>Mỗi lần tung sẽ tạo một hào âm, hào dương hoặc hào động. Kết quả chỉ hiện khi đủ sáu lần để không ngắt nhịp tập trung.</p>
              <div className="line-legend"><span><i className="solid-line" /> Dương</span><span><i className="broken-line" /> Âm</span><span><i className="moving-dot" /> Hào động</span></div>
            </div>
          )}
        </div>
      </div>

      <aside className="iching-appendix" aria-label="Tài liệu đính kèm">
        <span className="iching-appendix__icon" aria-hidden="true"><FileText size={26} strokeWidth={1.6} /></span>
        <div className="iching-appendix__copy">
          <small>Tài liệu đính kèm</small>
          <strong>{APPENDIX_PDF.title}</strong>
          <p>Đối chiếu lời luận đầy đủ của từng quẻ sau khi gieo. {APPENDIX_PDF.detail}.</p>
        </div>
        <a className="iching-appendix__link" href={APPENDIX_PDF.href} download="Phu-luc-chi-tiet-64-que-Kinh-Dich.pdf">
          <Download size={17} aria-hidden="true" /><span>Tải PDF</span>
        </a>
      </aside>

      {lucHao && (
        <section className="skd-luc-hao-sheet iching-luc-hao" aria-labelledby="iching-lh-title">
          <header className="skd-lh-section-intro">
            <span>Lá quẻ Lục Hào</span>
            <h3 id="iching-lh-title">Lục Thân · Can Chi · Lục Thú của quẻ vừa gieo</h3>
            <p>An quẻ theo thời điểm gieo ({lucHao.castAt}). Hào 1 ở dưới cùng, hào 6 trên cùng; hào động được đánh dấu màu son.</p>
          </header>
          <LucHaoSheet data={lucHao.data} movingLine={lucHao.movingLines} subject="quẻ vừa gieo" />
        </section>
      )}

      <div className={`casting-dock ${coinLines.length >= 6 ? "is-complete" : ""}`}>
        {coinLines.length < 6 ? <button className="casting-trigger" onClick={tossCoins} disabled={tossing} aria-label={`Tung ba đồng xu để lập hào ${coinLines.length + 1}`}><span className="casting-trigger__coin"><Coins size={21} /></span><span className="casting-trigger__copy"><small>Lập hào {coinLines.length + 1} / 6</small><strong>{tossing ? "Đang tung…" : "Tung 3 đồng xu"}</strong></span><ArrowUp className="casting-trigger__arrow" size={17} /></button> : <button className="casting-reset" onClick={resetCoins}><RotateCcw size={17} /><span><strong>Quẻ mới</strong><small>Gieo lại</small></span></button>}
      </div>

      {tossing && <div className="coin-cast-overlay" role="status" aria-live="assertive">
        <div className="cast-coins" key={tossRound}>
          <div className="casting-vessel casting-vessel--base" aria-hidden="true" />
          {coinFaces.map((heads, index) => (
            <div className="cast-coin-wrap" key={`${tossRound}-${index}`} style={{ "--cast-delay": `${index * 85}ms` } as CSSProperties}>
              <div className={`coin is-tossing ${heads ? "lands-heads" : "lands-tails"}`}>
                <span className="coin-face coin-face--heads"><b>乾</b><i>Ngửa</i></span>
                <span className="coin-face coin-face--tails"><b>坤</b><i>Sấp</i></span>
              </div>
              <span className="cast-shadow" />
            </div>
          ))}
          <div className="casting-vessel casting-vessel--foreground" aria-hidden="true" />
        </div>
        <p><small>Đang lập hào {coinLines.length + 1}</small><strong>Chờ đồng xu dừng hẳn</strong></p>
      </div>}
      {omenFlash && <div className="omen-flash" aria-hidden="true" />}
      {!compact && (
        <MethodNote
          title="Phương pháp lập và đọc quẻ"
          points={[
            "Ba đồng xu có xác suất tự nhiên: lão âm 6 và lão dương 9 cùng 1/8; thiếu âm 8 và thiếu dương 7 cùng 3/8.",
            "Sáu hào được lập từ dưới lên. Quẻ biến chỉ hình thành bằng cách đổi các hào động 6 và 9.",
            "Lời luận 64 quẻ là bản diễn giải tiếng Việt do SGEN biên soạn từ cấu trúc Thoán từ và Đại tượng, không phải lời tiên đoán tuyệt đối.",
          ]}
          sources={[{ label: "Chu Dịch · Chinese Text Project", href: "https://ctext.org/book-of-changes" }]}
        />
      )}
    </section>
  );
}
