import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, CalendarDays, Download, Hash, Loader2, Printer, Share2, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { TextField } from "../../components/form/Field";
import { ResultBlocks } from "../../components/lookup/ResultBlocks";
import { useToast } from "../../components/ui/Toast";
import type { LookupResultPayload } from "../../../shared/lookup-types";

const STEPS = ["Nhập thông tin", "Phân tích", "Nhận kết quả", "Lưu & chia sẻ"];

type NumerologyReport = LookupResultPayload & { id: string; shareToken?: string };

/** Trang tra cứu Thần số học: thu thập dữ liệu có đồng ý, chấm ở server và hiển thị bằng ResultBlocks. */
export function NumerologyPage() {
  const toast = useToast();
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [commonName, setCommonName] = useState("");
  const [agreed, setAgreed] = useState(false);
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
      toast.push({ tone: "info", title: "Liên kết chia sẻ", description: "Trình duyệt không cho phép sao chép tự động, bạn hãy sao chép liên kết bên dưới." });
    }
  };

  return (
    <section className="page-dark-section">
      <div className={payload ? "container lookup-workspace lookup-workspace--result" : "container lookup-workspace"}>
        <header>
          <span className="page-kicker">
            <Hash aria-hidden="true" /> Tra cứu Thần số học
          </span>
          <h1>
            Giải mã <em>bản đồ số học</em> từ họ tên và ngày sinh
          </h1>
          <p>
            Điền họ tên, ngày sinh và tên thường dùng (nếu có). Hệ thống tính 20 chỉ số theo hệ Pythagoras cùng biểu đồ
            chặng đường đời, Ikigai, ngày sinh và họ tên. Kết quả chỉ mang tính tham khảo, không thay thế tư vấn y tế, pháp lý hay tài chính.
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

        <div className={payload ? "lookup-workspace__grid lookup-workspace__grid--result" : "lookup-workspace__grid"}>
          <form className="page-form-card" onSubmit={handleSubmit} noValidate>
            <div>
              <small>Bước 1</small>
              <h2>Thông tin của bạn</h2>
            </div>
            <TextField
              label="Họ và tên"
              required
              icon={<UserRound aria-hidden="true" />}
              placeholder="Nguyễn Văn A"
              value={name}
              error={fieldErrors.name}
              autoComplete="name"
              onChange={(event) => setName(event.target.value)}
            />
            <TextField
              label="Ngày sinh"
              type="date"
              required
              icon={<CalendarDays aria-hidden="true" />}
              value={birthDate}
              error={fieldErrors.birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
            />
            <TextField
              label="Tên thường dùng"
              hint="Không bắt buộc — điền nếu bạn muốn xem thêm chỉ số theo tên gọi hằng ngày."
              placeholder="Ví dụ: A Nhi"
              value={commonName}
              onChange={(event) => setCommonName(event.target.value)}
            />

            <label className="page-check">
              <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
              <span>Đồng ý cho SGEN xử lý dữ liệu để phân tích.</span>
            </label>

            <button type="submit" className="button button--primary" disabled={loading}>
              {loading ? <Loader2 className="spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}
              {loading ? "Đang phân tích…" : "Phân tích kết quả"}
            </button>

            {error ? (
              <div className="privacy-banner" role="alert">
                <AlertTriangle aria-hidden="true" />
                <div>
                  <strong>Không thể phân tích</strong>
                  <span>{error}</span>
                </div>
              </div>
            ) : null}

            <p>
              <ShieldCheck aria-hidden="true" />
              Họ tên, ngày sinh và tên thường dùng chỉ được gửi lên máy chủ khi bạn bấm nút &ldquo;Phân tích kết quả&rdquo; và đã tích đồng ý. Kết quả
              chỉ mang tính tham khảo, được lưu tối đa 30 ngày để phục vụ liên kết chia sẻ.
            </p>
          </form>

          <div ref={resultRef} className="lookup-workspace__result">
            {payload ? (
              <>
                <ResultBlocks
                  payload={payload}
                  actions={
                    <>
                      <button type="button" className="action-button action-button--gradient" onClick={() => void saveResult()}>
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
              </>
            ) : (
              <div className="result-preview section--dark">
                <div className="result-preview__empty result-preview__empty--compact">
                  <Sparkles aria-hidden="true" />
                  <h2>Kết quả sẽ hiển thị tại đây</h2>
                  <p>Điền thông tin để xem báo cáo đầy đủ gồm 20 chỉ số và 4 biểu đồ.</p>
                  <Link className="result-preview__example" to="/#y-nghia-con-so">
                    Xem ví dụ <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
