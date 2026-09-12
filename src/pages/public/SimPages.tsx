import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Compass,
  Flame,
  Hash,
  Layers,
  Loader2,
  Phone,
  RefreshCcw,
  Scale,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { TextField } from "../../components/form/Field";
import { ResultBlocks } from "../../components/lookup/ResultBlocks";
import { useToast } from "../../components/ui/Toast";
import { ELEMENTS } from "../../../shared/menh-thu/metaphysics";
import { analyzeSim } from "../../../shared/sim/index";
import type { SimReport as SimEngineReport } from "../../../shared/sim/types";
import type { LookupResultPayload, ResultBlock } from "../../../shared/lookup-types";

/** Số điện thoại tối thiểu 9 và tối đa 11 chữ số theo biểu mẫu của API. */
const PHONE_PATTERN = /^\d{9,11}$/;

/** Header của site là `position: fixed` cao 98px, nên section đầu trang công cụ cần chừa thêm khoảng đệm. */
const FIRST_SECTION_STYLE: CSSProperties = { paddingTop: 140 };

const LAYERS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Hash,
    title: "1. Quẻ Kinh Dịch",
    text: "Sáu chữ số cuối của dãy số được quy thành sáu hào để lập quẻ chủ; hào động và quẻ biến cho biết chiều vận động của dãy số.",
  },
  {
    icon: Layers,
    title: "2. Ngũ hành dãy số",
    text: "Từng chữ số được quy về hành theo bảng Lạc Thư — Hà Đồ, sau đó đếm mức hiện diện và xác định hành vượng, hành khuyết.",
  },
  {
    icon: Scale,
    title: "3. Âm dương",
    text: "Số chẵn thuộc âm, số lẻ thuộc dương. Tỷ lệ âm — dương cho biết dãy số thiên về tĩnh hay động và mức cân bằng.",
  },
  {
    icon: UsersRound,
    title: "4. Quan niệm dân gian",
    text: "Các cặp và cụm số quen thuộc trong cách luận phổ thông được đối chiếu như một lớp tham khảo, có ghi rõ chứ không dùng như kết luận.",
  },
  {
    icon: Compass,
    title: "5. Đối chiếu bản mệnh",
    text: "Nếu bạn nhập ngày giờ sinh, hệ thống xác định Nhật chủ và các hành tương sinh để đo mức phù hợp giữa dãy số và bản mệnh.",
  },
];

const APPROACHES = [
  {
    icon: Star,
    title: "Luận theo cặp số đẹp — xấu",
    text: "Cách phổ biến nhất: tra danh sách cặp số như 39, 68, 86 rồi kết luận nhanh. Ưu điểm là dễ nhớ, nhưng kết quả phụ thuộc bảng tra của từng người và bỏ qua toàn bộ dãy số.",
  },
  {
    icon: Flame,
    title: "Luận theo ngũ hành bản mệnh",
    text: "Chỉ xét hành của các chữ số có tương sinh với mệnh hay không. Cách này có nguyên lý rõ hơn, nhưng thường bỏ qua vai trò của số 0 và vị trí từng chữ số.",
  },
  {
    icon: Hash,
    title: "Luận theo tổng nút và điểm số",
    text: "Cộng toàn bộ chữ số để lấy tổng nút hoặc cho điểm rồi xếp loại. Cách này cho con số dễ so sánh, đổi lại một điểm số không nói được dãy số mạnh hay yếu ở khía cạnh nào.",
  },
  {
    icon: Sparkles,
    title: "Năm lớp của SGEN",
    text: "Công cụ chạy song song quẻ Kinh Dịch, ngũ hành, âm dương, quan niệm dân gian và đối chiếu bản mệnh, sau đó báo cáo từng lớp để bạn tự cân nhắc.",
  },
];

type SimInputs = {
  phone: string;
  birthDate?: string;
  birthTime?: string;
  gender?: "Nam" | "Nữ";
};

type SimReport = LookupResultPayload & { id: string; shareToken?: string };

/** Vẽ sáu hào của quẻ: 7 = dương (liền nét), 8 = âm (đứt khúc); hào 1 (index 0) nằm dưới cùng. */
function HexagramDiagram({ lines }: { lines: number[] }) {
  const width = 120;
  const lineHeight = 12;
  const rowHeight = 18;
  const height = lines.length * rowHeight - (rowHeight - lineHeight);
  const brokenGap = 18;
  return (
    <svg
      className="sim-hexagram__svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Hình sáu hào của quẻ, hào một ở dưới cùng"
      preserveAspectRatio="xMidYMid meet"
    >
      {[...lines].reverse().map((value, index) => {
        const y = index * rowHeight;
        if (value === 7) return <rect key={index} x={0} y={y} width={width} height={lineHeight} rx={2.5} />;
        const half = (width - brokenGap) / 2;
        return (
          <g key={index}>
            <rect x={0} y={y} width={half} height={lineHeight} rx={2.5} />
            <rect x={half + brokenGap} y={y} width={half} height={lineHeight} rx={2.5} />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Khối trực quan cho báo cáo bói sim: hình quẻ, tỷ lệ ngũ hành, âm dương, bảng năm lớp phương pháp
 * và phần đối chiếu bản mệnh. Dữ liệu lấy trực tiếp từ engine `analyzeSim` (thuần, xác định) nên
 * không phụ thuộc nội dung chữ do API trả về.
 */
function SimVisualPanel({ report }: { report: SimEngineReport }) {
  const lines = report.hexagram.lines;
  const maxCount = Math.max(1, ...ELEMENTS.map((element) => report.elements.counts[element]));
  const totalDigits = report.yinYang.yin + report.yinYang.yang || 1;
  const yinPercent = Math.round((report.yinYang.yin / totalDigits) * 100);
  const yangPercent = 100 - yinPercent;

  return (
    <div className="sim-visual">
      <section className="sim-hexagram">
        <h3><Sparkles aria-hidden="true" /> Hình quẻ Kinh Dịch</h3>
        <div className="sim-hexagram__body">
          <div className="sim-hexagram__figure">
            <HexagramDiagram lines={lines} />
            <p>
              Hạ quái: {lines.slice(0, 3).map((value) => (value === 7 ? "dương" : "âm")).join(" · ")}
              <br />
              Thượng quái: {lines.slice(3).map((value) => (value === 7 ? "dương" : "âm")).join(" · ")}
            </p>
          </div>
          <dl className="sim-hexagram__names">
            <div><dt>Quẻ chủ</dt><dd>{report.hexagram.primary}</dd></div>
            <div><dt>Quẻ hỗ</dt><dd>{report.hexagram.mutual}</dd></div>
            <div><dt>Quẻ biến</dt><dd>{report.hexagram.changing}</dd></div>
          </dl>
        </div>
      </section>

      <section className="sim-elements">
        <h3><Layers aria-hidden="true" /> Ngũ hành dãy số</h3>
        <ul>
          {ELEMENTS.map((element) => {
            const count = report.elements.counts[element];
            return (
              <li className={element === report.elements.dominant ? "is-dominant" : undefined} key={element}>
                <span>{element}</span>
                <span className="sim-bar"><i style={{ width: `${(count / maxCount) * 100}%` }} /></span>
                <b>{count}</b>
              </li>
            );
          })}
        </ul>
        <p>
          Hành vượng: <b>{report.elements.dominant}</b>.{" "}
          {report.elements.missing.length ? `Hành khuyết: ${report.elements.missing.join(", ")}.` : "Không khuyết hành nào."}
        </p>
      </section>

      <section className="sim-yinyang">
        <h3><Scale aria-hidden="true" /> Âm dương dãy số</h3>
        <div
          className="sim-yinyang__bar"
          role="img"
          aria-label={`${report.yinYang.yin} chữ số chẵn (âm), ${report.yinYang.yang} chữ số lẻ (dương)`}
        >
          <span className="is-yin" style={{ width: `${yinPercent}%` }}>Âm {report.yinYang.yin}</span>
          <span className="is-yang" style={{ width: `${yangPercent}%` }}>Dương {report.yinYang.yang}</span>
        </div>
        <p>{report.yinYang.note}</p>
      </section>

      <section className="sim-methods">
        <h3><Compass aria-hidden="true" /> Năm lớp phương pháp</h3>
        <ol>
          {report.methods.map((method) => (
            <li className={`is-${method.tone}`} key={method.key}>
              <div><b>{method.name}</b><strong>{method.score}/100</strong></div>
              <p>{method.summary}</p>
            </li>
          ))}
        </ol>
        <p className="sim-notes">{report.notes[report.notes.length - 1]}</p>
      </section>

      <section className={`sim-personal-fit${report.personalFit ? "" : " is-empty"}`}>
        {report.personalFit ? (
          <>
            <h3><UsersRound aria-hidden="true" /> Đối chiếu bản mệnh</h3>
            <p><b>{report.personalFit.matchScore}/100</b> mức hài hoà giữa dãy số và Nhật chủ.</p>
            <p>Hành hỗ trợ: {report.personalFit.supportElements.join(", ")}.</p>
            <p>{report.personalFit.note}</p>
          </>
        ) : (
          <>
            <h3><CalendarDays aria-hidden="true" /> Chưa đối chiếu bản mệnh</h3>
            <p>
              Bạn chưa nhập ngày sinh. Thêm ngày sinh (và giờ sinh nếu có) ở biểu mẫu rồi luận lại để xem mức hài hoà giữa dãy số và Nhật chủ của bạn.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

/** Trang giới thiệu bói sim: giải thích năm lớp phân tích, so sánh cách luận và cảnh báo khác biệt giữa các trường phái. */
export function SimIntroPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <span className="page-kicker">
              <Phone aria-hidden="true" /> Phong thủy sim số điện thoại
            </span>
            <h1>
              Luận sim theo <em>năm lớp phân tích</em>
            </h1>
            <p>
              Thay vì chỉ tra cặp số đẹp, công cụ của SGEN chạy đồng thời năm lớp: quẻ Kinh Dịch, ngũ hành dãy số, âm dương, quan niệm dân gian và đối
              chiếu bản mệnh. Mỗi lớp được báo cáo riêng để bạn thấy dãy số mạnh yếu ở đâu.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="page-primary" to="/sim-phong-thuy/boi-sim">
                <Phone aria-hidden="true" /> Bói sim ngay
              </Link>
              <Link className="action-button action-button--outline" to="/khoa-hoc">
                <Sparkles aria-hidden="true" /> Học cách luận sim
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-light-section">
        <div className="container">
          <div className="page-section-heading page-section-heading--light">
            <span>Năm lớp phân tích</span>
            <h2>Một dãy số, năm góc nhìn độc lập</h2>
            <p>Mỗi lớp có quy tắc riêng và được chấm điểm riêng, sau đó mới tổng hợp thành điểm chung của dãy số.</p>
          </div>
          <div className="service-grid">
            {LAYERS.map((layer, index) => {
              const Icon = layer.icon;
              return (
                <article key={layer.title}>
                  <span className="service-grid__number">{String(index + 1).padStart(2, "0")}</span>
                  <Icon aria-hidden="true" />
                  <h3>{layer.title}</h3>
                  <p>{layer.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-dark-section">
        <div className="container">
          <div className="page-section-heading">
            <span>So sánh cách luận</span>
            <h2>Các cách luận sim phổ biến và điểm khác biệt</h2>
            <p>Không có cách nào là chân lý tuyệt đối. Bảng dưới đây nêu ưu điểm và giới hạn để bạn chọn cách đọc phù hợp nhu cầu.</p>
          </div>
          <div className="value-grid">
            {APPROACHES.map((approach) => {
              const Icon = approach.icon;
              return (
                <article key={approach.title}>
                  <Icon aria-hidden="true" />
                  <h3>{approach.title}</h3>
                  <p>{approach.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-dark-section">
        <div className="container">
          <div className="privacy-banner">
            <CircleAlert aria-hidden="true" />
            <div>
              <strong>Cảnh báo quan trọng: mỗi trường phái luận một khác</strong>
              <span>
                Cùng một số điện thoại, người luận theo cặp số có thể khen đẹp trong khi người luận theo ngũ hành lại thấy chưa hợp mệnh. Kết quả của
                SGEN là một hệ phương pháp có ghi rõ quy tắc, không phải chân lý chung cho mọi trường phái. Hãy xem đây là thông tin tham khảo và
                không dùng để quyết định thay bạn.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="page-light-section">
        <div className="container">
          <div className="page-section-heading page-section-heading--light">
            <span>Nên làm gì tiếp</span>
            <h2>Từ điểm số tới hành động cụ thể</h2>
          </div>
          <div className="service-grid">
            <article>
              <h3>Bói sim miễn phí</h3>
              <p>Nhập số điện thoại để nhận báo cáo đầy đủ năm lớp, kèm gợi ý cách đọc từng chỉ báo.</p>
              <Link to="/sim-phong-thuy/boi-sim">
                Mở công cụ <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article>
              <h3>Học cách luận sim</h3>
              <p>Khóa học Phong thủy sim số hướng dẫn nền tảng ngũ hành, âm dương và cách luận có hệ thống.</p>
              <Link to="/khoa-hoc">
                Xem khóa học <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article>
              <h3>Kết hợp công cụ khác</h3>
              <p>Đối chiếu thêm Tứ Trụ Bát Tự hoặc xem ngày để có bối cảnh rộng hơn cho quyết định của bạn.</p>
              <Link to="/cong-cu-phong-thuy">
                Xem công cụ phong thủy <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}

/** Trang bói sim: thu thập số điện thoại và thông tin tùy chọn, chấm ở API và hiển thị bằng ResultBlocks. */
export function SimToolPage() {
  const toast = useToast();
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [gender, setGender] = useState<"" | "Nam" | "Nữ">("");
  const [agreed, setAgreed] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<LookupResultPayload | null>(null);
  const [engine, setEngine] = useState<SimEngineReport | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const lastInputs = useRef<SimInputs | null>(null);

  // Điểm trung bình của khối `score` đầu tiên (5 lớp phân tích) để làm thanh điểm tổng gọn trên mobile.
  const scoreBlock = payload?.blocks.find((block): block is Extract<ResultBlock, { kind: "score" }> => block.kind === "score");
  const averageScore = scoreBlock?.items.length
    ? Math.round(scoreBlock.items.reduce((total, item) => total + item.value, 0) / scoreBlock.items.length)
    : null;

  const runLookup = async (inputs: SimInputs) => {
    setLoading(true);
    setError("");
    lastInputs.current = inputs;
    try {
      const data = await api.post<{ report: SimReport }>("/api/lookups/sim", {
        inputs,
        save: true,
        source: "/sim-phong-thuy/boi-sim",
      });
      setPayload({
        headline: data.report.headline,
        subhead: data.report.subhead,
        blocks: data.report.blocks ?? [],
        disclaimer: data.report.disclaimer,
      });
      // Engine thuần chạy song song ở client để vẽ hình quẻ, ngũ hành, âm dương và bảng năm lớp.
      setEngine(analyzeSim(inputs));
      setShareUrl(
        data.report.shareToken
          ? `${window.location.origin}/tra-cuu/ket-qua/${data.report.id}?token=${data.report.shareToken}`
          : `${window.location.origin}/tra-cuu/ket-qua/${data.report.id}`,
      );
      toast.success("Đã luận xong dãy số", "Báo cáo năm lớp hiển thị ở khung bên cạnh.");
    } catch (caught) {
      const message = errorMessage(caught);
      setError(message);
      toast.error("Không thể luận sim", message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (!PHONE_PATTERN.test(digits)) {
      setFieldError("Số điện thoại cần từ 9 đến 11 chữ số.");
      toast.error("Số điện thoại chưa hợp lệ", "Vui lòng nhập từ 9 đến 11 chữ số.");
      return;
    }
    setFieldError("");
    if (!agreed) {
      toast.error("Chưa thể luận sim", "Bạn cần đồng ý cho SGEN xử lý dữ liệu cho phiên tra cứu này.");
      return;
    }
    void runLookup({
      phone: digits,
      birthDate: birthDate || undefined,
      birthTime: birthTime || undefined,
      gender: gender || undefined,
    });
  };

  const retry = () => {
    if (lastInputs.current) void runLookup(lastInputs.current);
  };

  return (
    <section className="page-dark-section" style={FIRST_SECTION_STYLE}>
      <div className="container lookup-workspace">
        <header>
          <span className="page-kicker">
            <Phone aria-hidden="true" /> Bói sim phong thủy
          </span>
          <h1>
            Luận dãy số của bạn theo <em>năm lớp phân tích</em>
          </h1>
          <p>
            Nhập số điện thoại cần luận. Ngày sinh, giờ sinh và giới tính là tùy chọn nhưng sẽ giúp phần đối chiếu bản mệnh chính xác hơn. Kết quả
            mang tính tham khảo, không thay thế quyết định của bạn.
          </p>
          <div className="lookup-steps">
            {["Nhập số", "Chọn thông tin", "Luận giải", "Nhận báo cáo"].map((step, index) => (
              <div className={index === 0 || payload ? "is-active" : ""} key={step}>
                <span>{index + 1}</span>
                <small>{step}</small>
              </div>
            ))}
          </div>
        </header>

        <div className="lookup-workspace__grid">
          <form className="page-form-card" onSubmit={handleSubmit} noValidate>
            <div>
              <small>Bước 1</small>
              <h2>Thông tin dãy số</h2>
            </div>
            <TextField
              label="Số điện thoại"
              required
              type="tel"
              inputMode="numeric"
              icon={<Phone aria-hidden="true" />}
              placeholder="Ví dụ: 0901234567"
              value={phone}
              error={fieldError}
              autoComplete="tel"
              onChange={(event) => setPhone(event.target.value)}
            />
            <TextField
              label="Ngày sinh"
              type="date"
              hint="Không bắt buộc — dùng để đối chiếu dãy số với bản mệnh."
              icon={<CalendarDays aria-hidden="true" />}
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
            <TextField
              label="Giờ sinh"
              type="time"
              hint="Không bắt buộc — giúp xác định Nhật chủ chính xác hơn."
              value={birthTime}
              onChange={(event) => setBirthTime(event.target.value)}
            />
            <label>
              <span>Giới tính <em>(không bắt buộc)</em></span>
              <div>
                <UsersRound aria-hidden="true" />
                <select value={gender} onChange={(event) => setGender(event.target.value as "" | "Nam" | "Nữ")}>
                  <option value="">Không chọn</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
            </label>

            <label className="page-check">
              <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
              <span>
                Tôi đồng ý cho SGEN xử lý số điện thoại và thông tin sinh (nếu có) để tạo báo cáo, đồng thời hiểu rằng kết quả chỉ mang tính tham
                khảo.
              </span>
            </label>

            <button type="submit" className="button button--primary" disabled={loading}>
              {loading ? <Loader2 className="spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
              {loading ? "Đang luận giải…" : "Luận sim phong thủy"}
            </button>

            {error ? (
              <div className="privacy-banner" role="alert">
                <AlertTriangle aria-hidden="true" />
                <div>
                  <strong>Không thể luận sim</strong>
                  <span>{error}</span>
                  <button type="button" className="action-button action-button--outline" onClick={retry} disabled={loading}>
                    <RefreshCcw aria-hidden="true" /> Thử lại
                  </button>
                </div>
              </div>
            ) : null}

            <p>
              <ShieldCheck aria-hidden="true" />
              Dữ liệu chỉ được gửi lên máy chủ khi bạn bấm nút luận sim và đã tích đồng ý. Kết quả được lưu tối đa 30 ngày để phục vụ liên kết chia sẻ.
            </p>
          </form>

          <div>
            {payload ? (
              <details className="sim-result" open>
                <summary className="sim-result__band">
                  <span className="sim-result__total">
                    <b>{averageScore ?? "—"}</b>
                    <small>/100 · điểm trung bình 5 lớp</small>
                  </span>
                  <span className="sim-result__toggle">
                    Chi tiết báo cáo <ChevronDown aria-hidden="true" />
                  </span>
                </summary>
                {engine ? <SimVisualPanel report={engine} /> : null}
                <ResultBlocks payload={payload} />
                {shareUrl ? (
                  <p className="sim-result__share">
                    Liên kết chia sẻ: <a href={shareUrl}>{shareUrl}</a>
                  </p>
                ) : null}
              </details>
            ) : (
              <div className="result-preview section--dark">
                <div className="result-preview__empty result-preview__empty--compact">
                  <Phone aria-hidden="true" />
                  <h2>Báo cáo sẽ hiển thị tại đây</h2>
                  <p>Nhập số điện thoại rồi bấm luận sim.</p>
                  <div className="mini-grid">
                    {[6, 8, 9, 1, 5, 3, 7, 2, 4].map((value) => (
                      <span key={value}>{value}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="privacy-banner">
          <Check aria-hidden="true" />
          <div>
            <strong>Mỗi trường phái luận một khác</strong>
            <span>
              Kết quả phản ánh hệ phương pháp năm lớp của SGEN Education. Các cách luận phổ biến khác có thể cho kết luận khác với cùng một dãy số.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
