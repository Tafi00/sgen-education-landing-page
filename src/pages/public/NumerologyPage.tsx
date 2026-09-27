import { useRef, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Compass,
  Download,
  Hash,
  Loader2,
  Mars,
  Orbit,
  Printer,
  Search,
  Share2,
  ShieldCheck,
  Tag,
  UserRound,
  Venus,
  VenusAndMars,
  type LucideIcon,
} from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { LookupNavTabs } from "../../components/lookup/LookupNavTabs";
import { ResultBlocks } from "../../components/lookup/ResultBlocks";
import { useToast } from "../../components/ui/Toast";
import type { LookupResultPayload } from "../../../shared/lookup-types";

const cosmicDarkClean = "/assets/backgrounds/cosmic-dark-clean.webp";

const NUMERAL_IMAGES: Record<string, string> = {
  "1": "/assets/illustrations/numeral-1-cosmic.webp",
  "2": "/assets/illustrations/numeral-2-cosmic.webp",
  "3": "/assets/illustrations/numeral-3-cosmic.webp",
  "4": "/assets/illustrations/numeral-4-cosmic.webp",
  "5": "/assets/illustrations/numeral-5-cosmic.webp",
  "6": "/assets/illustrations/numeral-6-cosmic.webp",
  "7": "/assets/illustrations/numeral-7-cosmic.webp",
  "8": "/assets/illustrations/numeral-8-cosmic.webp",
  "9": "/assets/illustrations/numeral-9-cosmic.webp",
  "11": "/assets/illustrations/numeral-11-cosmic.webp",
  "22": "/assets/illustrations/numeral-22-cosmic.webp",
};

const NUMBER_PREVIEWS: Record<string, { title: string; subtitle: string; desc: string; traits: string[] }> = {
  "1": {
    title: "Người tiên phong",
    subtitle: "Độc lập — Sáng tạo",
    desc: "Số 1 đại diện cho tinh thần đổi mới, sự tự tin và khả năng dẫn dắt. Khi phát huy đúng năng lượng, bạn có thể biến ý tưởng thành hành động tích cực.",
    traits: ["Táo bạo", "Sáng tạo", "Độc lập", "Kiên định"],
  },
  "2": {
    title: "Người kết nối",
    subtitle: "Tinh tế — Hợp tác",
    desc: "Số 2 mang năng lượng của sự thấu cảm, cân bằng và kết nối. Bạn tạo nên sức mạnh bằng khả năng lắng nghe và nuôi dưỡng các mối quan hệ.",
    traits: ["Tinh tế", "Kiên nhẫn", "Hợp tác", "Thấu cảm"],
  },
  "3": {
    title: "Người truyền cảm hứng",
    subtitle: "Biểu đạt — Lạc quan",
    desc: "Số 3 lan tỏa niềm vui qua giao tiếp và sáng tạo. Khả năng biểu đạt tự nhiên giúp bạn chạm tới người khác bằng cảm xúc chân thành.",
    traits: ["Lạc quan", "Hoạt ngôn", "Sáng tạo", "Cởi mở"],
  },
  "4": {
    title: "Người xây nền",
    subtitle: "Kỷ luật — Thực tế",
    desc: "Số 4 là nền móng của trật tự và bền vững. Bạn phát triển tốt nhất khi có kế hoạch rõ ràng và từng bước biến mục tiêu thành kết quả.",
    traits: ["Kỷ luật", "Tin cậy", "Thực tế", "Bền bỉ"],
  },
  "5": {
    title: "Người khám phá",
    subtitle: "Tự do — Thích nghi",
    desc: "Số 5 yêu trải nghiệm, chuyển động và sự thay đổi. Tính linh hoạt giúp bạn tìm thấy cơ hội ở những nơi người khác chưa nhìn thấy.",
    traits: ["Linh hoạt", "Tò mò", "Tự do", "Mạo hiểm"],
  },
  "6": {
    title: "Người nuôi dưỡng",
    subtitle: "Trách nhiệm — Yêu thương",
    desc: "Số 6 hướng về gia đình, cộng đồng và cái đẹp. Bạn tạo ảnh hưởng qua sự tận tâm, trách nhiệm và khả năng chăm sóc.",
    traits: ["Tận tâm", "Ấm áp", "Trách nhiệm", "Hài hòa"],
  },
  "7": {
    title: "Người chiêm nghiệm",
    subtitle: "Trí tuệ — Nội tâm",
    desc: "Số 7 tìm kiếm chiều sâu và sự thật. Khả năng quan sát, phân tích và học từ trải nghiệm là con đường phát triển cốt lõi của bạn.",
    traits: ["Sâu sắc", "Phân tích", "Trực giác", "Độc lập"],
  },
  "8": {
    title: "Người kiến tạo",
    subtitle: "Quyền lực — Thành tựu",
    desc: "Số 8 gắn với năng lực quản trị và hiện thực hóa mục tiêu. Khi cân bằng vật chất và giá trị, bạn tạo nên ảnh hưởng bền vững.",
    traits: ["Bản lĩnh", "Quản trị", "Tham vọng", "Công bằng"],
  },
  "9": {
    title: "Người phụng sự",
    subtitle: "Nhân ái — Bao dung",
    desc: "Số 9 mang tầm nhìn rộng và trái tim nhân văn. Bạn được thúc đẩy bởi mong muốn đóng góp và tạo ra giá trị cho cộng đồng.",
    traits: ["Nhân ái", "Bao dung", "Lý tưởng", "Truyền cảm"],
  },
  "11": {
    title: "Người khai sáng",
    subtitle: "Trực giác — Tầm nhìn",
    desc: "Số chủ đạo 11 sở hữu độ nhạy cảm và trực giác nổi bật. Năng lượng này mở ra khả năng truyền cảm hứng và dẫn đường bằng tầm nhìn.",
    traits: ["Trực giác", "Khai sáng", "Nhạy cảm", "Tầm nhìn"],
  },
  "22": {
    title: "Bậc thầy kiến tạo",
    subtitle: "Tầm vóc — Hiện thực hóa",
    desc: "Số chủ đạo 22 kết hợp tầm nhìn lớn với năng lực xây dựng thực tế. Bạn có tiềm năng biến những ý tưởng có ích thành hệ thống bền vững.",
    traits: ["Kiến tạo", "Thực tế", "Tầm vóc", "Bền vững"],
  },
};

const STEPS = ["Nhập thông tin", "Phân tích", "Nhận kết quả", "Lưu & chia sẻ"];

type NumerologyReport = LookupResultPayload & { id: string; shareToken?: string };

const GENDER_OPTIONS: { value: "Nam" | "Nữ" | "Khác"; icon: LucideIcon }[] = [
  { value: "Nam", icon: Mars },
  { value: "Nữ", icon: Venus },
  { value: "Khác", icon: VenusAndMars },
];

export function NumerologyPage() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [commonName, setCommonName] = useState("");
  const [gender, setGender] = useState<"Nam" | "Nữ" | "Khác">("Nam");
  const [agreed, setAgreed] = useState(true);
  const [previewNumber, setPreviewNumber] = useState("1");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; birthDate?: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState<LookupResultPayload | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const [reportRef, setReportRef] = useState<{ id: string; token: string } | null>(null);
  const [saved, setSaved] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const activeStep = payload ? 2 : loading ? 1 : 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: { name?: string; birthDate?: string } = {};
    if (name.trim().length < 2) errors.name = "Vui lòng nhập họ tên (ít nhất 2 ký tự).";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) errors.birthDate = "Vui lòng chọn ngày sinh.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      toast.error("Thiếu thông tin", "Vui lòng kiểm tra các ô được đánh dấu rồi thử lại.");
      return;
    }
    if (!agreed) {
      toast.error("Chưa đồng ý xử lý dữ liệu", "Bạn cần tích vào ô đồng ý trước khi hệ thống phân tích.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await api.post<{ report: NumerologyReport }>("/api/lookups/numerology", {
        inputs: {
          name: name.trim(),
          birthDate,
          commonName: commonName.trim() || undefined,
          referenceYear: new Date().getFullYear(),
        },
        save: true,
        source: "/tra-cuu/than-so-hoc",
      });
      setPayload({
        headline: data.report.headline,
        subhead: data.report.subhead,
        blocks: data.report.blocks ?? [],
        disclaimer: data.report.disclaimer,
      });
      const url = data.report.shareToken
        ? `${window.location.origin}/tra-cuu/ket-qua/${data.report.id}?token=${data.report.shareToken}`
        : `${window.location.origin}/tra-cuu/ket-qua/${data.report.id}`;
      setReportRef({ id: data.report.id, token: data.report.shareToken ?? "" });
      setShareUrl(url);
      setSaved(false);
      toast.success("Đã phân tích xong", "Báo cáo đầy đủ hiển thị bên dưới.");
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (caught) {
      const message = errorMessage(caught);
      setError(message);
      toast.error("Không thể phân tích", message);
    } finally {
      setLoading(false);
    }
  };

  const saveResult = async () => {
    if (!shareUrl) return;
    setSaved(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Đã tạo liên kết chia sẻ", "Liên kết đã được sao chép vào bộ nhớ tạm.");
    } catch {
      toast.push({
        tone: "info",
        title: "Liên kết chia sẻ",
        description: "Trình duyệt không cho phép sao chép tự động, bạn hãy sao chép liên kết bên dưới.",
      });
    }
  };

  return (
    <div
      className="numerology-lookup-page"
      style={
        {
          "--page-dark-bg": `url(${cosmicDarkClean})`,
          backgroundColor: "#07032e",
          backgroundImage:
            "radial-gradient(circle at 75% 18%, rgba(132, 60, 245, 0.22), transparent 45%), radial-gradient(circle at 25% 45%, rgba(90, 34, 232, 0.18), transparent 40%), var(--page-dark-bg)",
          backgroundPosition: "center top",
          backgroundSize: "cover",
        } as React.CSSProperties
      }
    >
      <div className="container numerology-hero-container">
        <LookupNavTabs activeKey="numerology" />

        <header className="numerology-header">
          <span className="page-kicker">
            <Hash aria-hidden="true" /> Tra cứu Thần số học Pythagoras
          </span>
          <h1>
            Giải mã <em>bản đồ số học cuộc đời</em>
          </h1>
          <p className="numerology-header__desc">
            Khám phá 20 chỉ số định hướng, 4 đỉnh cao cuộc đời và tiềm năng tiềm ẩn từ họ tên và ngày sinh theo hệ
            Pythagoras chuẩn hóa.
          </p>
          <div className="lookup-steps">
            {STEPS.map((step, index) => (
              <div className={index === activeStep ? "is-active" : ""} key={step}>
                <span>{index + 1}</span>
                <small>{step}</small>
              </div>
            ))}
          </div>
        </header>

        {/* Khối Form Tra Cứu trung tâm cân đối */}
        <div className="lookup-form-center-wrap">
          <form className="lookup-card lookup-form-center" onSubmit={handleSubmit} noValidate>
            <div className="lookup-form-center__head">
              <span className="lookup-card__badge">
                <Orbit aria-hidden="true" size={15} /> Nhập thông tin tra cứu
              </span>
              <h2>Bản đồ Thần số học cá nhân</h2>
              <p>Điền thông tin chính xác để hệ thống phân tích báo cáo chi tiết cho bạn.</p>
            </div>

            <div className="lookup-form-fields-grid">
              <label className="field-group">
                <span>Họ và tên khai sinh *</span>
                <span className={`field-control ${fieldErrors.name ? "is-error" : ""}`}>
                  <UserRound aria-hidden="true" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Ví dụ: NGUYỄN VĂN A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </span>
                {fieldErrors.name ? <small className="field-error-text">{fieldErrors.name}</small> : null}
              </label>

              <label className="field-group">
                <span>Tên thường dùng <em>(nếu có)</em></span>
                <span className="field-control">
                  <Tag aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Ví dụ: Minh Anh, Anna"
                    value={commonName}
                    onChange={(e) => setCommonName(e.target.value)}
                  />
                </span>
              </label>

              <label className="field-group">
                <span>Ngày/tháng/năm sinh dương lịch *</span>
                <span className={`field-control ${fieldErrors.birthDate ? "is-error" : ""}`}>
                  <CalendarDays aria-hidden="true" />
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </span>
                {fieldErrors.birthDate ? <small className="field-error-text">{fieldErrors.birthDate}</small> : null}
              </label>

              <div className="field-group">
                <span>Giới tính</span>
                <div className="gender-selector">
                  {GENDER_OPTIONS.map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      className={`gender-btn ${gender === value ? "is-selected" : ""}`}
                      aria-pressed={gender === value}
                      onClick={() => setGender(value)}
                    >
                      <Icon aria-hidden="true" /> {value}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <label className="page-check">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>Tôi đồng ý để hệ thống SGEN phân tích dữ liệu theo trường phái Pythagoras.</span>
            </label>
            <div className="lookup-submit-wrap">
              <button
                type="submit"
                className="lookup-submit-btn"
                disabled={loading}
              >
                {loading ? <Loader2 className="spin" aria-hidden="true" size={20} /> : <Search aria-hidden="true" size={20} />}
                <span>{loading ? "Đang giải mã dữ liệu số học…" : "TRA CỨU NGAY"}</span>
              </button>

              <p className="lookup-card__privacy">
                <ShieldCheck aria-hidden="true" /> Miễn phí tra cứu 100% · Dữ liệu bảo mật tuyệt đối · Kết quả theo hệ Pythagoras chuẩn hóa
              </p>
            </div>

            {error ? (
              <div className="privacy-banner" role="alert">
                <AlertTriangle aria-hidden="true" />
                <div>
                  <strong>Không thể phân tích</strong>
                  <span>{error}</span>
                </div>
              </div>
            ) : null}
          </form>
        </div>

        {/* Khối hiển thị kết quả hoặc Showcase 11 con số 3D Cosmic */}
        <div ref={resultRef} className="lookup-result-area">
          {payload ? (
            <div className="lookup-workspace__grid lookup-workspace__grid--result" style={{ marginTop: 40 }}>
              <ResultBlocks
                payload={payload}
                actions={
                  <>
                    <button
                      type="button"
                      className="action-button action-button--gradient"
                      onClick={() => void saveResult()}
                    >
                      <Share2 aria-hidden="true" /> Lưu kết quả
                    </button>
                    {reportRef ? (
                      <a
                        className="action-button"
                        href={`/api/lookups/${reportRef.id}/pdf?token=${encodeURIComponent(reportRef.token)}`}
                        download
                      >
                        <Download aria-hidden="true" /> Tải PDF
                      </a>
                    ) : null}
                    <button type="button" className="action-button" onClick={() => window.print()}>
                      <Printer aria-hidden="true" /> In báo cáo
                    </button>
                  </>
                }
              />
              {saved && shareUrl ? (
                <p className="share-url-note">
                  Liên kết chia sẻ: <a href={shareUrl}>{shareUrl}</a>
                </p>
              ) : null}
            </div>
          ) : (
            <div className="numeral-showcase-card">
              <div className="numeral-showcase-card__header">
                <h3>Khám phá 11 con số chủ đạo</h3>
                <p>Chọn một con số để xem năng lượng đặc trưng.</p>
              </div>

              <div className="numeral-showcase-tabs" role="tablist" aria-label="Chọn con số thần số học">
                {Object.keys(NUMERAL_IMAGES).map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`numeral-showcase-tab ${previewNumber === num ? "is-active" : ""}`}
                    role="tab"
                    aria-selected={previewNumber === num}
                    onClick={() => setPreviewNumber(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="numeral-showcase-display">
                <div className="numeral-showcase-art">
                  <img
                    src={NUMERAL_IMAGES[previewNumber]}
                    alt={`Minh họa năng lượng số ${previewNumber}`}
                    className="numeral-showcase-img"
                    key={previewNumber}
                  />
                </div>

                <div className="numeral-showcase-info">
                  <span className="numeral-showcase-eyebrow">
                    <Orbit size={16} /> Thần số học số {previewNumber}
                  </span>
                  <h4>
                    {NUMBER_PREVIEWS[previewNumber].title}
                    <small>{NUMBER_PREVIEWS[previewNumber].subtitle}</small>
                  </h4>
                  <p>{NUMBER_PREVIEWS[previewNumber].desc}</p>

                  <p className="numeral-showcase-keywords">
                    <span>Từ khóa</span> {NUMBER_PREVIEWS[previewNumber].traits.join(" · ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
