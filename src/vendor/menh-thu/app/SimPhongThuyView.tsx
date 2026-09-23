// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeSimPhongThuy,
  buildSimPhongThuyMarkdownForAi,
  normalizeVietnamesePhone,
  type SimAnalysisResult,
  validateSimPhongThuyInput,
} from "./sim-phong-thuy-engine";
import {
  BarChart3,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Hash,
  Phone,
  RotateCcw,
  Scale,
  Search,
  Star,
  Zap,
} from "lucide-react";
import "./sim-phong-thuy.css";

interface SimPhongThuyViewProps {
  initialPhone?: string;
  initialDay?: string;
  initialMonth?: string;
  initialYear?: string;
  initialHour?: string;
  initialMinute?: string;
  initialDate?: string;
  initialTime?: string;
  initialGender?: "Nam" | "Nữ";
  initialCalendarType?: "solar" | "lunar";
  initialLunarLeapMonth?: boolean;
}

const formatQueryDate = (year: string, month: string, day: string) => {
  const y = year.trim();
  const m = month.trim().padStart(2, "0");
  const d = day.trim().padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const formatQueryTime = (hour: string, minute: string) => {
  return `${hour.trim().padStart(2, "0")}:${minute.trim().padStart(2, "0")}`;
};

const BAGUA_BY_PALACE: Record<string, { symbol: string; han: string }> = {
  Càn: { symbol: "☰", han: "乾" },
  Đoài: { symbol: "☱", han: "兌" },
  Ly: { symbol: "☲", han: "離" },
  Chấn: { symbol: "☳", han: "震" },
  Tốn: { symbol: "☴", han: "巽" },
  Khảm: { symbol: "☵", han: "坎" },
  Cấn: { symbol: "☶", han: "艮" },
  Khôn: { symbol: "☷", han: "坤" },
};

export default function SimPhongThuyView({
  initialPhone = "",
  initialDay,
  initialMonth,
  initialYear,
  initialHour,
  initialMinute,
  initialDate,
  initialTime,
  initialGender = "Nam",
  initialCalendarType = "solar",
  initialLunarLeapMonth = false,
}: SimPhongThuyViewProps) {
  const defaultDay = initialDay ?? (initialDate ? (initialDate.split("-")[2] || "").split("-")[0] : "");
  const defaultMonth = initialMonth ?? (initialDate ? initialDate.split("-")[1] || "" : "");
  const defaultYear = initialYear ?? (initialDate ? initialDate.split("-")[0] || "" : "");
  const defaultHour = initialHour ?? (initialTime ? initialTime.split(":")[0] || "" : "");
  const defaultMinute = initialMinute ?? (initialTime ? initialTime.split(":")[1] || "" : "");

  const [phone, setPhone] = useState<string>(initialPhone);
  const [day, setDay] = useState<string>(defaultDay);
  const [month, setMonth] = useState<string>(defaultMonth);
  const [year, setYear] = useState<string>(defaultYear);
  const [hour, setHour] = useState<string>(defaultHour);
  const [minute, setMinute] = useState<string>(defaultMinute);
  const [gender, setGender] = useState<"Nam" | "Nữ">(initialGender);
  const [calendarType, setCalendarType] = useState<"solar" | "lunar">(initialCalendarType);
  const [lunarLeapMonth, setLunarLeapMonth] = useState(initialLunarLeapMonth);
  const [formError, setFormError] = useState("");
  const [syncedAnalysis, setSyncedAnalysis] = useState<{
    key: string;
    result: SimAnalysisResult | null;
    error: string;
  }>({ key: "", result: null, error: "" });

  const [submittedQuery, setSubmittedQuery] = useState<{
    phone: string;
    birthDate: string;
    birthTime: string;
    gender: "Nam" | "Nữ";
    calendarType: "solar" | "lunar";
    lunarLeapMonth: boolean;
  }>({
    phone: initialPhone,
    birthDate: (defaultYear && defaultMonth && defaultDay) ? formatQueryDate(defaultYear, defaultMonth, defaultDay) : "",
    birthTime: (defaultHour && defaultMinute) ? formatQueryTime(defaultHour, defaultMinute) : "",
    gender: initialGender,
    calendarType: initialCalendarType,
    lunarLeapMonth: initialLunarLeapMonth,
  });

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const didSubmitRef = useRef(false);
  const [copiedAi, setCopiedAi] = useState<boolean>(false);

  const handleResetToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    phoneInputRef.current?.focus();
  };

  const handleCopyAiMarkdown = () => {
    if (!result) return;
    const md = buildSimPhongThuyMarkdownForAi(result);
    navigator.clipboard.writeText(md).then(() => {
      setCopiedAi(true);
      setTimeout(() => setCopiedAi(false), 2500);
    });
  };

  const hasValidPhone = useMemo(() => {
    return /^0\d{9}$/.test(normalizeVietnamesePhone(submittedQuery.phone));
  }, [submittedQuery.phone]);

  const analysis = useMemo<{ result: SimAnalysisResult | null; error: string }>(() => {
    if (!hasValidPhone) return { result: null, error: "" };
    try {
      return { result: analyzeSimPhongThuy(submittedQuery), error: "" };
    } catch (error) {
      return {
        result: null,
        error: error instanceof Error ? error.message : "Không thể lập kết quả với dữ liệu đã nhập.",
      };
    }
  }, [submittedQuery, hasValidPhone]);
  const submittedQueryKey = useMemo(() => JSON.stringify(submittedQuery), [submittedQuery]);

  useEffect(() => {
    if (!hasValidPhone || !analysis.result) return;

    const [y, m, d] = submittedQuery.birthDate.split("-");
    const [h, min] = submittedQuery.birthTime.split(":");
    const params = new URLSearchParams({
      so: submittedQuery.phone,
      ngay: String(Number(d)),
      thang: String(Number(m)),
      nam: y,
      gio: String(Number(h)),
      phut: String(Number(min)),
      gioitinh: submittedQuery.gender === "Nữ" ? "nu" : "nam",
      lich: submittedQuery.calendarType === "lunar" ? "al" : "dl",
    });
    if (submittedQuery.lunarLeapMonth) params.set("nhuan", "1");

    const controller = new AbortController();
    fetch(`/api/sim-phong-thuy?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json() as { result?: SimAnalysisResult; error?: string };
        if (!response.ok || !payload.result) throw new Error(payload.error || "Không thể đối chiếu kết quả.");
        setSyncedAnalysis({ key: submittedQueryKey, result: payload.result, error: "" });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setSyncedAnalysis({
          key: submittedQueryKey,
          result: null,
          error: error instanceof Error ? error.message : "Không thể đối chiếu kết quả.",
        });
      });

    return () => controller.abort();
  }, [analysis.result, hasValidPhone, submittedQuery, submittedQueryKey]);

  const syncedForCurrentQuery = syncedAnalysis.key === submittedQueryKey;
  const isSyncing = hasValidPhone && analysis.result
    ? !syncedForCurrentQuery
    : false;
  const result = syncedForCurrentQuery && syncedAnalysis.result
    ? syncedAnalysis.result
    : analysis.result;
  const aspectAnalysisItems = result ? [
    {
      key: "theVan" as const,
      label: "Thế vận",
      aspect: result.scores5Aspects.theVan,
      facts: [] as Array<[string, string]>,
      strongPoints: [] as string[],
      weakPoints: [] as string[],
    },
    {
      key: "taiLoc" as const,
      label: "Tài lộc",
      aspect: result.scores5Aspects.taiLoc,
      facts: [
        ["Địa chi Tài vận", result.scores5Aspects.taiLoc.diaChi],
        ["Ngũ hành Tài vận", result.scores5Aspects.taiLoc.nguHanh],
      ] as Array<[string, string]>,
      strongPoints: result.scores5Aspects.taiLoc.strongPoints,
      weakPoints: result.scores5Aspects.taiLoc.weakPoints,
    },
    {
      key: "congDanh" as const,
      label: "Công danh",
      aspect: result.scores5Aspects.congDanh,
      facts: [
        ["Địa chi Công danh", result.scores5Aspects.congDanh.diaChi],
        ["Ngũ hành Công danh", result.scores5Aspects.congDanh.nguHanh],
        ["Địa chi nguyên thần", result.scores5Aspects.congDanh.nguyenThanChi],
        ["Ngũ hành nguyên thần", result.scores5Aspects.congDanh.nguyenThanHanh],
      ] as Array<[string, string]>,
      strongPoints: result.scores5Aspects.congDanh.strongPoints,
      weakPoints: result.scores5Aspects.congDanh.weakPoints,
    },
    {
      key: "tinhCam" as const,
      label: "Tình cảm",
      aspect: result.scores5Aspects.tinhCam,
      facts: [
        ["Địa chi đối tượng", result.scores5Aspects.tinhCam.diaChiDoiTuong],
        ["Ngũ hành đối tượng", result.scores5Aspects.tinhCam.nguHanhDoiTuong],
        ["Quan hệ địa chi", result.scores5Aspects.tinhCam.quanHeDiaChi],
      ] as Array<[string, string]>,
      strongPoints: result.scores5Aspects.tinhCam.strongPoints,
      weakPoints: result.scores5Aspects.tinhCam.weakPoints,
    },
    {
      key: "giaDao" as const,
      label: "Gia đạo",
      aspect: result.scores5Aspects.giaDao,
      facts: [] as Array<[string, string]>,
      strongPoints: [] as string[],
      weakPoints: [] as string[],
    },
  ] : [];
  const baguaProfile = result
    ? BAGUA_BY_PALACE[result.ownerAstro.cungPhi] ?? { symbol: "☯", han: "易" }
    : { symbol: "☯", han: "易" };
  const elementDistribution = result
    ? (["Thủy", "Mộc", "Hỏa", "Thổ", "Kim"] as const).map((element) => ({
        element,
        points: result.ownerAstro.elementPoints[element] ?? 0,
        percent: result.ownerAstro.elementPercent[element] ?? 0,
      }))
    : [];
  const dominantElement = [...elementDistribution].sort((a, b) => b.points - a.points)[0];
  const weakestElement = [...elementDistribution].sort((a, b) => a.points - b.points)[0];
  const aspectOverallScore = result
    ? Math.round((
        result.scores5Aspects.theVan.scorePercent
        + result.scores5Aspects.taiLoc.scorePercent
        + result.scores5Aspects.congDanh.scorePercent
        + result.scores5Aspects.tinhCam.scorePercent
        + result.scores5Aspects.giaDao.scorePercent
      ) / 5)
    : 0;
  const bclsCatCount = result ? result.meta.bc.items.filter((item) => item.type === "cat").length : 0;
  const bclsHungCount = result ? result.meta.bc.items.filter((item) => item.type === "hung").length : 0;
  const bclsCriterion = result?.scoreCriteria.find((criterion) => criterion.key === "batCucLinhSo");

  useEffect(() => {
    if (!didSubmitRef.current || !result || isSyncing) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    didSubmitRef.current = false;
  }, [isSyncing, result]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedPhone = normalizeVietnamesePhone(phone);
    const formattedDate = (year.trim() && month.trim() && day.trim()) ? formatQueryDate(year, month, day) : "";
    const formattedTime = (hour.trim() && minute.trim()) ? formatQueryTime(hour, minute) : "";
    const nextQuery = {
      phone: normalizedPhone,
      birthDate: formattedDate,
      birthTime: formattedTime,
      gender,
      calendarType,
      lunarLeapMonth: calendarType === "lunar" && lunarLeapMonth,
    };
    const validation = validateSimPhongThuyInput(nextQuery);
    if (!validation.isValid) {
      setFormError(validation.error || "Dữ liệu không hợp lệ.");
      if (!/^0\d{9}$/.test(normalizedPhone)) phoneInputRef.current?.focus();
      return;
    }

    setFormError("");
    setPhone(normalizedPhone);
    didSubmitRef.current = true;
    setSubmittedQuery(nextQuery);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("so", normalizedPhone);
      if (formattedDate) {
        const [y, m, d] = formattedDate.split("-");
        url.searchParams.set("ngay", String(parseInt(d, 10) || 1));
        url.searchParams.set("thang", String(parseInt(m, 10) || 1));
        url.searchParams.set("nam", y);
        if (formattedTime) {
          const [h, min] = formattedTime.split(":");
          url.searchParams.set("gio", String(parseInt(h, 10) || 0));
          url.searchParams.set("phut", String(parseInt(min, 10) || 0));
        }
        url.searchParams.set("gioitinh", gender === "Nữ" ? "nu" : "nam");
        url.searchParams.set("lich", calendarType === "lunar" ? "al" : "dl");
        if (nextQuery.lunarLeapMonth) url.searchParams.set("nhuan", "1");
        else url.searchParams.delete("nhuan");
      } else {
        url.searchParams.delete("ngay");
        url.searchParams.delete("thang");
        url.searchParams.delete("nam");
        url.searchParams.delete("gio");
        url.searchParams.delete("phut");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  const getClassBadgeStyle = (classification: string) => {
    switch (classification) {
      case "ĐẠI CÁT": return "skd-class-dai-cat";
      case "CÁT": return "skd-class-cat";
      case "TƯƠNG ĐỐI":
      case "BÌNH": return "skd-class-binh";
      case "HUNG": return "skd-class-hung";
      default: return "skd-class-dai-hung";
    }
  };

  const getNguHanhBadgeColor = (element: string) => {
    switch (element) {
      case "Kim": return "#9c6b1e";
      case "Mộc": return "#107e3e";
      case "Thủy": return "#1769aa";
      case "Hỏa": return "#c81e1e";
      case "Thổ": return "#8c5b2a";
      default: return "#555";
    }
  };

  const getScoreTone = (score: number) => score >= 80 ? "is-good" : score >= 50 ? "is-neutral" : "is-warning";

  return (
    <div className="skd-sim-container">
      {/* HERO BANNER */}
      <div className="skd-sim-hero-banner">
        <h1>Sim Phong Thủy Kinh Dịch</h1>
      </div>

      {/* SEARCH FORM */}
      <div className="skd-sim-form-card">
        <header className="skd-sim-form-head">
          <div className="skd-sim-form-title">
            <span className="skd-sim-form-icon" aria-hidden="true"><Phone size={21} /></span>
            <strong>Thông tin tra cứu</strong>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="skd-sim-form-grid">
          <div className="skd-sim-field-group skd-sim-field-phone">
            <label htmlFor="sim-phone"><span>Số điện thoại</span></label>
            <input
              id="sim-phone"
              name="phone"
              ref={phoneInputRef}
              type="tel"
              className="skd-sim-input"
              placeholder="0932 601 616"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (formError) setFormError("");
              }}
              autoComplete="tel"
              inputMode="tel"
              maxLength={16}
              aria-describedby={formError || analysis.error ? "sim-form-error" : undefined}
              required
            />
          </div>

          <fieldset className="skd-sim-field-group skd-sim-field-date">
            <legend><span>Ngày sinh</span></legend>
            <div className="skd-sim-inline-inputs">
              <div className="skd-sim-number-box">
                <span>Ngày</span>
                <input
                  id="sim-birth-day"
                  name="birth-day"
                  type="number"
                  inputMode="numeric"
                  className="skd-sim-input skd-input-day"
                  aria-label="Ngày sinh"
                  autoComplete="bday-day"
                  min={1}
                  max={calendarType === "lunar" ? 30 : 31}
                  value={day}
                  onFocus={(event) => event.currentTarget.select()}
                  onChange={(e) => setDay(e.target.value)}
                />
              </div>
              <div className="skd-sim-number-box">
                <span>Tháng</span>
                <input
                  id="sim-birth-month"
                  name="birth-month"
                  type="number"
                  inputMode="numeric"
                  className="skd-sim-input skd-input-month"
                  aria-label="Tháng sinh"
                  autoComplete="bday-month"
                  min={1}
                  max={12}
                  value={month}
                  onFocus={(event) => event.currentTarget.select()}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
              <div className="skd-sim-number-box is-year">
                <span>Năm</span>
                <input
                  id="sim-birth-year"
                  name="birth-year"
                  type="number"
                  inputMode="numeric"
                  className="skd-sim-input skd-input-year"
                  aria-label="Năm sinh"
                  autoComplete="bday-year"
                  min={1900}
                  max={2100}
                  value={year}
                  onFocus={(event) => event.currentTarget.select()}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="skd-sim-field-group skd-sim-field-time">
            <legend><span>Giờ sinh</span></legend>
            <div className="skd-sim-inline-inputs">
              <div className="skd-sim-number-box">
                <span>Giờ</span>
                <input
                  id="sim-birth-hour"
                  name="birth-hour"
                  type="number"
                  inputMode="numeric"
                  className="skd-sim-input skd-input-hour"
                  aria-label="Giờ sinh"
                  min={0}
                  max={23}
                  value={hour}
                  onFocus={(event) => event.currentTarget.select()}
                  onChange={(e) => setHour(e.target.value)}
                />
              </div>
              <div className="skd-sim-number-box">
                <span>Phút</span>
                <input
                  id="sim-birth-minute"
                  name="birth-minute"
                  type="number"
                  inputMode="numeric"
                  className="skd-sim-input skd-input-minute"
                  aria-label="Phút sinh"
                  min={0}
                  max={59}
                  value={minute}
                  onFocus={(event) => event.currentTarget.select()}
                  onChange={(e) => setMinute(e.target.value)}
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="skd-sim-field-group skd-sim-field-calendar">
            <legend><span>Loại lịch</span></legend>
            <div className="skd-sim-segmented" role="group" aria-label="Loại lịch ngày sinh">
              <button
                type="button"
                aria-pressed={calendarType === "solar"}
                className={calendarType === "solar" ? "is-active" : ""}
                onClick={() => {
                  setCalendarType("solar");
                  setLunarLeapMonth(false);
                }}
              >
                Dương lịch
              </button>
              <button
                type="button"
                aria-pressed={calendarType === "lunar"}
                className={calendarType === "lunar" ? "is-active" : ""}
                onClick={() => setCalendarType("lunar")}
              >
                Âm lịch
              </button>
            </div>
            {calendarType === "lunar" && (
              <label className="skd-sim-leap-toggle" htmlFor="sim-lunar-leap">
                <input
                  id="sim-lunar-leap"
                  name="lunar-leap-month"
                  type="checkbox"
                  checked={lunarLeapMonth}
                  onChange={(event) => setLunarLeapMonth(event.target.checked)}
                />
                Tháng nhuận
              </label>
            )}
          </fieldset>

          <fieldset className="skd-sim-field-group skd-sim-field-gender">
            <legend><span>Giới tính</span></legend>
            <div className="skd-sim-segmented" role="group" aria-label="Giới tính">
              <button
                type="button"
                aria-pressed={gender === "Nam"}
                className={gender === "Nam" ? "is-active" : ""}
                onClick={() => setGender("Nam")}
              >
                Nam
              </button>
              <button
                type="button"
                aria-pressed={gender === "Nữ"}
                className={gender === "Nữ" ? "is-active" : ""}
                onClick={() => setGender("Nữ")}
              >
                Nữ
              </button>
            </div>
          </fieldset>

          {(formError || analysis.error) && (
            <p id="sim-form-error" className="skd-sim-form-error" role="alert">
              {formError || analysis.error}
            </p>
          )}

          <button type="submit" className="skd-sim-submit-btn" aria-label="Xem phong thủy sim">
            <Search size={18} />
            <strong>Xem kết quả</strong>
          </button>
        </form>
      </div>

      {/* RESULT OR WELCOME SECTION */}
      {hasValidPhone && isSyncing ? (
        <div className="skd-result-loading" role="status" aria-live="polite">
          <span className="skd-result-loading-mark" aria-hidden="true">易</span>
          <div>
            <strong>Đang lập và đối chiếu lá quẻ</strong>
            <span>Kiểm tra quẻ, Bát Tự và các chỉ số liên quan.</span>
          </div>
        </div>
      ) : !hasValidPhone || !result ? (
        <div className="skd-welcome-card">
          <header className="skd-welcome-head">
            <span>Phương pháp</span>
            <div className="skd-welcome-title">5 yếu tố chấm điểm</div>
          </header>

          <div className="skd-welcome-features">
            <div className="skd-welcome-feature-item">
              <div className="skd-welcome-feature-icon"><Compass aria-hidden="true" /></div>
              <h3>Kinh Dịch Lục Hào</h3>
            </div>

            <div className="skd-welcome-feature-item">
              <div className="skd-welcome-feature-icon"><Zap aria-hidden="true" /></div>
              <h3>Ngũ Hành & Bát Tự</h3>
            </div>

            <div className="skd-welcome-feature-item">
              <div className="skd-welcome-feature-icon"><Scale aria-hidden="true" /></div>
              <h3>Âm Dương Tương Phối</h3>
            </div>

            <div className="skd-welcome-feature-item">
              <div className="skd-welcome-feature-icon"><Hash aria-hidden="true" /></div>
              <h3>81 Linh Số Đuôi SIM</h3>
            </div>

            <div className="skd-welcome-feature-item">
              <div className="skd-welcome-feature-icon"><BarChart3 aria-hidden="true" /></div>
              <h3>5 Phương Diện Vận Khí</h3>
            </div>
          </div>
        </div>
      ) : (
        <div
          id="print-area"
          ref={resultRef}
          role="region"
          aria-live="polite"
          aria-labelledby="sim-result-title"
          tabIndex={-1}
        >
          {syncedForCurrentQuery && syncedAnalysis.error && (
            <p className="skd-result-sync-warning" role="status">
              Chưa thể đối chiếu nguồn trực tuyến; kết quả dưới đây đang dùng bộ tính dự phòng.
            </p>
          )}
          <div className="skd-result-header">
            <h2 id="sim-result-title">XEM PHONG THỦY SIM {result.formattedPhone}</h2>
          </div>

          <nav className="skd-result-jump-nav" aria-label="Điều hướng nhanh kết quả phong thủy sim">
            <a href="#kd-summary-card"><span>01</span>Kết luận nhanh</a>
            <a href="#skd-luc-hao"><span>02</span>Lá quẻ</a>
            <a href="#skd-owner-overview"><span>03</span>Mệnh cục</a>
            <a href="#skd-boisim-scorecards"><span>04</span>Điểm mạnh</a>
            <a href="#skd-bcls"><span>05</span>Bát Cực</a>
            <a href="#skd-final-advice"><span>06</span>Lời khuyên</a>
          </nav>

        {/* HERO SUMMARY CARD */}
        <section id="kd-summary-card" className="skd-hero-summary-card">
          <div>
            <div className="skd-hero-eyebrow">Kết luận nhanh theo Kinh Dịch</div>
            <div className="skd-hero-phone-title">Sim {result.formattedPhone}</div>

            <div className="skd-hero-meta-row">
              <div className="skd-hero-meta-item">
                <span>Quẻ chủ:</span>
                <strong>{result.primaryHexagram.name}</strong>
              </div>
              <div className="skd-hero-meta-item">
                <span>Hào động:</span>
                <strong>{result.movingLine}</strong>
              </div>
              <div className="skd-hero-meta-item">
                <span>Ngũ hành sim:</span>
                <strong style={{ color: getNguHanhBadgeColor(result.simElement.element) }}>
                  {result.simElement.element}
                </strong>
              </div>
            </div>

            <p className="skd-hero-desc">{result.decisionText.summary}</p>

            <div className="skd-hero-actions">
              <button
                type="button"
                className="skd-btn-sm"
                onClick={handleCopyAiMarkdown}
              >
                {copiedAi ? (
                  <>
                    <Check size={14} style={{ display: "inline", marginRight: 4, color: "#0d8a43" }} />
                    Đã chép AI Report
                  </>
                ) : (
                  <>
                    <Copy size={14} style={{ display: "inline", marginRight: 4 }} />
                    Xuất AI Report
                  </>
                )}
              </button>
              <button
                type="button"
                className="skd-btn-sm"
                onClick={handleResetToTop}
              >
                <RotateCcw size={14} style={{ display: "inline", marginRight: 4 }} />
                Luận số khác
              </button>
            </div>
          </div>

          <div className="skd-score-badge-card">
            <div className="skd-score-number">{result.totalScore}</div>
            <div className="skd-score-denom">/100</div>
            <div className={`skd-classification-pill ${getClassBadgeStyle(result.finalClassification)}`}>
              {result.finalClassification}
            </div>
            <div className="skd-score-table-wrap">
              <table className="skd-score-table" aria-label="Bảng điểm tổng kết phong thủy SIM">
                <thead>
                  <tr><th>Hạng mục</th><th>Điểm</th><th>Quy đổi</th></tr>
                </thead>
                <tbody>
                  {result.scoreCriteria.filter((criterion) => criterion.weight > 0).map((criterion) => (
                    <tr key={criterion.key} title={criterion.explanation}>
                      <th scope="row">{criterion.label}</th>
                      <td>{criterion.score ?? "—"}/100</td>
                      <td>{criterion.points}/{criterion.weight}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><th scope="row" colSpan={2}>Tổng điểm</th><td>{result.totalScore}/100</td></tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        {/* LÁ QUẺ LỤC HÀO SHEET */}
        <section id="skd-luc-hao" className="skd-luc-hao-sheet" aria-labelledby="skd-lh-title">
          <header className="skd-lh-section-intro">
            <span>Lá quẻ đồ họa</span>
            <h3 id="skd-lh-title">Lá Quẻ Lục Hào của SIM {result.formattedPhone}</h3>
            <p>Xem nhanh toàn bộ quẻ chủ, quẻ biến và các hào trên một bản duy nhất.</p>
          </header>

          <div className="skd-hex-explainer" aria-label="Đánh giá quẻ chủ và quẻ biến">
            <article className={`skd-hex-explainer-card ${getScoreTone(result.hexagramAssessment.primary.score)}`}>
              <header>
                <div><span>Quẻ chủ · Hiện tại</span><h4>{result.hexagramAssessment.primary.name}</h4></div>
                <strong>{result.hexagramAssessment.primary.score}<small>/100</small></strong>
              </header>
              <p>{result.hexagramAssessment.primary.explanation}</p>
              <footer><b>{result.hexagramAssessment.primary.label}</b><span>Quẻ chủ phản ánh nền trường khí đang tác động chính lên SIM.</span></footer>
            </article>

            <div className="skd-hex-transition-score">
              <span>Hào {result.movingLine} động</span>
              <strong>{result.hexagramAssessment.score}<small>/100</small></strong>
              <small>Điểm hành trình quẻ</small>
              <i aria-hidden="true">→</i>
            </div>

            <article className={`skd-hex-explainer-card ${getScoreTone(result.hexagramAssessment.changed.score)}`}>
              <header>
                <div><span>Quẻ biến · Xu hướng</span><h4>{result.hexagramAssessment.changed.name}</h4></div>
                <strong>{result.hexagramAssessment.changed.score}<small>/100</small></strong>
              </header>
              <p>{result.hexagramAssessment.changed.explanation}</p>
              <footer><b>{result.hexagramAssessment.changed.label}</b><span>Quẻ biến cho biết chiều chuyển hóa sau khi hào động phát huy.</span></footer>
            </article>
          </div>
          <p className="skd-hex-journey-summary">{result.hexagramAssessment.summary}</p>

          {result.referenceDetails?.hexagramImageUrl && (
            <figure className="skd-lh-reference-figure">
              <div className="skd-lh-reference-head">
                <div>
                  <span>Bản Lá Quẻ hoàn chỉnh</span>
                  <strong>Lục Thân · Can Chi · Lục Thú · Sao theo hào</strong>
                </div>
                <a
                  href={result.referenceDetails.hexagramImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Mở ảnh Lá Quẻ kích thước đầy đủ"
                >
                  Mở ảnh lớn
                </a>
              </div>
              <a
                className="skd-lh-reference-image-link"
                href={result.referenceDetails.hexagramImageUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Mở ảnh Lá Quẻ kích thước đầy đủ trong thẻ mới"
              >
                {/* Dynamic reference artwork is already generated at its final dimensions. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.referenceDetails.hexagramImageUrl}
                  alt={`Lá Quẻ Lục Hào đầy đủ của SIM ${result.formattedPhone}`}
                  width={860}
                  height={1253}
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <figcaption>Chạm vào ảnh để xem rõ toàn bộ Lục Thân, Can Chi, Lục Thú và sao theo từng hào.</figcaption>
            </figure>
          )}

          <details className="skd-lh-data-details" open={!result.referenceDetails?.hexagramImageUrl}>
            <summary>
              <span>
                <b>Bảng dữ liệu Lục Hào</b>
                <small>Dành cho người muốn tra cứu từng hào và các chỉ số chi tiết</small>
              </span>
              <em>Xem chi tiết</em>
            </summary>
            <div className="skd-lh-data-details-body">
          <div className="skd-lh-oracle-stage">
            <header className="skd-lh-heading">
              <div>
                <div className="skd-lh-kicker">Hồ sơ Kinh Dịch · Lục Hào</div>
                <h3>Bản đọc tương tác</h3>
                <p>Đối chiếu quẻ chủ, hào động và quẻ biến của dãy sim.</p>
              </div>
              <div className="skd-lh-line-legend" aria-label="Chú giải màu hào">
                <span><i /> Hào tĩnh</span>
                <span><i className="is-moving" /> Hào động</span>
              </div>
            </header>

            {/* HEXAGRAM GRAPHICS & LABELS */}
            <div className="skd-lh-hex-header">
              {/* QUẺ CHỦ */}
              <article className="skd-lh-hex-col is-primary">
                <div className="skd-lh-hex-eyebrow">Quẻ chủ</div>
                <div className="skd-lh-hex-name">{result.lucHaoData.primary.name}</div>
                <div className="skd-lh-hex-bars" aria-label={`Sáu hào của quẻ ${result.lucHaoData.primary.name}`}>
                  {result.lucHaoData.primary.lines.map((l) => (
                    <div
                      key={l.position}
                      className="skd-lh-bar-row"
                      aria-label={`Hào ${l.position}${l.isMoving ? ", hào động" : ""}`}
                    >
                      <span className="skd-lh-bar-order">{l.position}</span>
                      <span className="skd-lh-bar-graphic">
                        {l.isYang ? (
                          <span className={`skd-lh-bar-yang ${l.isMoving ? "is-moving" : ""}`} />
                        ) : (
                          <span className={`skd-lh-bar-yin ${l.isMoving ? "is-moving" : ""}`}>
                            <span />
                            <span />
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="skd-lh-hex-palace">{result.lucHaoData.primary.palaceLabel}</div>
              </article>

              {/* BIẾN ARROW */}
              <div className="skd-lh-hex-center" aria-label={`Hào ${result.movingLine} biến`}>
                <span className="skd-lh-moving-label">Hào {result.movingLine}</span>
                <span className="skd-lh-arrow" aria-hidden="true">→</span>
                <span>Biến quẻ</span>
              </div>

              {/* QUẺ BIẾN */}
              <article className="skd-lh-hex-col is-changed">
                <div className="skd-lh-hex-eyebrow">Quẻ biến</div>
                <div className="skd-lh-hex-name">{result.lucHaoData.changed.name}</div>
                <div className="skd-lh-hex-bars" aria-label={`Sáu hào của quẻ ${result.lucHaoData.changed.name}`}>
                  {result.lucHaoData.changed.lines.map((cl) => (
                    <div
                      key={cl.position}
                      className="skd-lh-bar-row"
                      aria-label={`Hào ${cl.position}${cl.isTransformed ? ", được biến đổi" : ""}`}
                    >
                      <span className="skd-lh-bar-order">{cl.position}</span>
                      <span className="skd-lh-bar-graphic">
                        {cl.isYang ? (
                          <span className={`skd-lh-bar-yang ${cl.isTransformed ? "is-moving" : ""}`} />
                        ) : (
                          <span className={`skd-lh-bar-yin ${cl.isTransformed ? "is-moving" : ""}`}>
                            <span />
                            <span />
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="skd-lh-hex-palace">{result.lucHaoData.changed.palaceLabel}</div>
              </article>
            </div>
          </div>

          {/* META INFO */}
          <div className="skd-lh-meta-box">
            <div className="skd-lh-meta-item">
              <span>Dương lịch</span>
              <strong>{result.lucHaoData.meta.solarDateTime}</strong>
            </div>
            <div className="skd-lh-meta-item">
              <span>Âm lịch</span>
              <strong>{result.lucHaoData.meta.lunarDateTime}</strong>
            </div>
            <div className="skd-lh-meta-item is-wide">
              <span>Tứ trụ Can Chi</span>
              <strong>{result.lucHaoData.meta.fourPillarsText}</strong>
            </div>
            <div className="skd-lh-meta-item">
              <span>Tiết khí</span>
              <strong>{result.lucHaoData.meta.solarTerm}</strong>
            </div>
            <div className="skd-lh-meta-item">
              <span>Nhật thần</span>
              <strong>{result.lucHaoData.meta.nhatThan}</strong>
            </div>
            <div className="skd-lh-meta-item">
              <span>Nguyệt lệnh</span>
              <strong>{result.lucHaoData.meta.nguyetLenh}</strong>
            </div>
          </div>

          {/* TRIỆU / TƯỢNG QUẺ BANNER */}
          <div className="skd-lh-trieu-banner">
            <span>Tượng quẻ</span>
            <strong>{result.lucHaoData.primary.trieu}</strong>
          </div>

          {/* TABLE 1: THÂN HÀO & CAN CHI */}
          <div className="skd-lh-table-section">
            <div className="skd-lh-table-heading">
              <div>
                <span>Chi tiết Lục Hào</span>
                <strong>Lục Thân · Can Chi · Lục Thú</strong>
              </div>
              <small>Vuốt ngang để xem đầy đủ</small>
            </div>
            <div
              className="skd-lh-table-wrap"
              role="region"
              aria-label="Bảng chi tiết Lục Thân, Can Chi và Lục Thú"
              tabIndex={0}
            >
              <table className="skd-lh-table">
                <caption className="skd-visually-hidden">Bảng Lục Thân, Can Chi và Lục Thú của quẻ chủ và quẻ biến</caption>
                <thead>
                  <tr className="skd-lh-table-group-row">
                    <th colSpan={6}>Quẻ chủ · {result.lucHaoData.primary.name}</th>
                    <th colSpan={5}>Quẻ biến · {result.lucHaoData.changed.name}</th>
                  </tr>
                  <tr>
                  <th style={{ width: "45px" }}>Hào</th>
                  <th style={{ width: "50px" }}>T/Ư</th>
                  <th>Lục Thân</th>
                  <th>Can Chi</th>
                  <th style={{ width: "55px" }}>P.Thần</th>
                  <th style={{ width: "45px" }}>T.K</th>
                  <th>Lục Thân</th>
                  <th>Can Chi</th>
                  <th>Lục Thú</th>
                  <th style={{ width: "45px" }}>T.K</th>
                  <th style={{ width: "45px" }}>Hào</th>
                  </tr>
                </thead>
                <tbody>
                {result.lucHaoData.primary.lines.map((pLine, i) => {
                  const cLine = result.lucHaoData.changed.lines[i];
                  const isMoving = pLine.isMoving;

                  return (
                    <tr key={pLine.position} className={isMoving ? "skd-lh-row-moving" : ""}>
                      {/* Quẻ Chủ: Hào */}
                      <td style={{ fontWeight: "700" }}>{pLine.symbol}</td>
                      {/* Quẻ Chủ: T/Ư */}
                      <td>
                        {pLine.theUng === "Thế" ? (
                          <span className="skd-lh-the-tag">Thế</span>
                        ) : pLine.theUng === "Ứng" ? (
                          <span className="skd-lh-ung-tag">Ứng</span>
                        ) : (
                          ""
                        )}
                      </td>
                      {/* Quẻ Chủ: Lục Thân */}
                      <td style={{ fontWeight: isMoving ? "700" : "500" }}>{pLine.lucThan}</td>
                      {/* Quẻ Chủ: Can Chi */}
                      <td style={{ fontWeight: isMoving ? "700" : "500" }}>{pLine.canChi}</td>
                      {/* Quẻ Chủ: P.Thần */}
                      <td>{pLine.phucThan}</td>
                      {/* Quẻ Chủ: T.K */}
                      <td>{pLine.tuanKhong}</td>

                      {/* Quẻ Biến: Lục Thân */}
                      <td style={{ fontWeight: isMoving ? "700" : "500" }}>{cLine.lucThan}</td>
                      {/* Quẻ Biến: Can Chi */}
                      <td style={{ fontWeight: isMoving ? "700" : "500" }}>{cLine.canChi}</td>
                      {/* Quẻ Biến: Lục Thú */}
                      <td>{cLine.lucThu}</td>
                      {/* Quẻ Biến: T.K */}
                      <td>{cLine.tuanKhong}</td>
                      {/* Quẻ Biến: Hào */}
                      <td style={{ fontWeight: "700" }}>{cLine.symbol}</td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 2: VƯỢNG TƯỚNG & TRƯỜNG SINH */}
          <div className="skd-lh-table-section">
            <div className="skd-lh-table-heading">
              <div>
                <span>Chu kỳ sinh vượng</span>
                <strong>Vượng Suy · Quý Thần · Trường Sinh</strong>
              </div>
              <small>Hào động được đánh dấu màu son</small>
            </div>
            <div
              className="skd-lh-table-wrap"
              role="region"
              aria-label="Bảng Vượng Suy, Quý Thần và Trường Sinh"
              tabIndex={0}
            >
              <table className="skd-lh-table">
                <caption className="skd-visually-hidden">Bảng Vượng Suy, Quý Thần và Trường Sinh của quẻ chủ và quẻ biến</caption>
                <thead>
                  <tr className="skd-lh-table-group-row">
                    <th colSpan={5}>Quẻ chủ · {result.lucHaoData.primary.name}</th>
                    <th colSpan={4}>Quẻ biến · {result.lucHaoData.changed.name}</th>
                  </tr>
                  <tr>
                  <th>Hào</th>
                  <th>V-S</th>
                  <th>Q.Thần</th>
                  <th>T.S-Ngày</th>
                  <th>T.S-Tháng</th>
                  <th>Hào</th>
                  <th>V-S</th>
                  <th>T.S-Ngày</th>
                  <th>T.S-Tháng</th>
                  </tr>
                </thead>
                <tbody>
                {result.lucHaoData.primary.lines.map((pLine, i) => {
                  const cLine = result.lucHaoData.changed.lines[i];
                  const isMoving = pLine.isMoving;

                  return (
                    <tr key={pLine.position} className={isMoving ? "skd-lh-row-moving" : ""}>
                      {/* Quẻ Chủ: Hào */}
                      <td style={{ fontWeight: isMoving ? "700" : "600" }}>{pLine.canChiFull}</td>
                      {/* Quẻ Chủ: V-S */}
                      <td>{pLine.vuongTuong}</td>
                      {/* Quẻ Chủ: Q.Thần */}
                      <td>{pLine.quyThan}</td>
                      {/* Quẻ Chủ: T.S Ngày */}
                      <td>{pLine.tsNgay}</td>
                      {/* Quẻ Chủ: T.S Tháng */}
                      <td>{pLine.tsThang}</td>

                      {/* Quẻ Biến: Hào */}
                      <td style={{ fontWeight: isMoving ? "700" : "600" }}>{cLine.canChiFull}</td>
                      {/* Quẻ Biến: V-S */}
                      <td>{cLine.vuongTuong}</td>
                      {/* Quẻ Biến: T.S Ngày */}
                      <td>{cLine.tsNgay}</td>
                      {/* Quẻ Biến: T.S Tháng */}
                      <td>{cLine.tsThang}</td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>
          </div>
            </div>
          </details>
        </section>

        {/* KHÁI QUÁT VỀ MỆNH CỤC (5 THẺ) */}
        <details id="skd-owner-overview" className="skd-accordion" open>
          <summary>Khái quát về mệnh cục cá nhân</summary>
          <div className="skd-accordion-body">
            <section className="skd-destiny-score-panel" aria-label="Tiêu chí chấm điểm hợp mệnh cục">
              <div className="skd-destiny-score-total">
                <span>Điểm hợp Mệnh cục</span>
                <strong>{result.ownerAstro.destinyScore ?? "—"}<small>/100</small></strong>
                <p>Đối chiếu ngũ hành SIM với Nạp âm, Cung phi và Nhật chủ.</p>
              </div>
              <div className="skd-destiny-axis-list">
                {result.ownerAstro.destinyAxes.length > 0 ? result.ownerAstro.destinyAxes.map((axis) => (
                  <div key={axis.key} className={getScoreTone(axis.score)}>
                    <span>{axis.label}<small>{axis.ownerElement} ↔ SIM {axis.simElement}</small></span>
                    <b>{axis.relation}</b>
                    <strong>{axis.score}/100</strong>
                  </div>
                )) : <p>Nhập ngày giờ sinh để mở chấm điểm Mệnh cục.</p>}
              </div>
            </section>

            <div className="skd-astro-cards-grid">
              {/* CARD 01 */}
              <article className="skd-astro-card is-profile">
                <header className="skd-astro-card-head">
                  <span className="skd-astro-card-num">01</span>
                  <h4>Thông tin thân chủ</h4>
                </header>
                <div className="skd-astro-kv"><span>Dương lịch</span><strong>{result.ownerAstro.solarDate}</strong></div>
                <div className="skd-astro-kv"><span>Âm lịch</span><strong>{result.ownerAstro.lunarDate}</strong></div>
                <div className="skd-astro-kv"><span>Tiết khí</span><strong>{result.ownerAstro.solarTerm}</strong></div>
                <div className="skd-astro-kv"><span>Giới tính</span><strong>{result.ownerAstro.gender}</strong></div>
                <div className="skd-astro-kv"><span>Cung mệnh</span><strong>{result.ownerAstro.cungMenh}</strong></div>
                <div className="skd-astro-kv"><span>Bản mệnh</span><strong>{result.ownerAstro.banMenhNguHanh}</strong></div>
              </article>

              {/* CARD 02 */}
              <article className="skd-astro-card is-palace">
                <header className="skd-astro-card-head">
                  <span className="skd-astro-card-num">02</span>
                  <h4>Cung phi & Quái số</h4>
                </header>
                <div className="skd-palace-panel">
                  <span className="skd-palace-symbol" aria-hidden="true">{baguaProfile.symbol}</span>
                  <strong className="skd-palace-number">{result.ownerAstro.quaiSo}</strong>
                  <div className="skd-palace-name">
                    <b>{baguaProfile.han}</b>
                    <span>{result.ownerAstro.cungPhi}</span>
                  </div>
                </div>
              </article>

              {/* CARD 03 */}
              <article className="skd-astro-card is-elements">
                <header className="skd-astro-card-head">
                  <span className="skd-astro-card-num">03</span>
                  <h4>Biểu đồ Ngũ hành Bát Tự</h4>
                </header>
                <div className="skd-element-insights">
                  <div><span>Vượng nhất</span><strong>{dominantElement?.element} · {dominantElement?.points}</strong></div>
                  <div><span>Yếu nhất</span><strong>{weakestElement?.element} · {weakestElement?.points}</strong></div>
                </div>
                <div className="skd-element-meter-list">
                  {elementDistribution.map(({ element, points, percent }) => {
                    return (
                      <div key={element} className="skd-element-meter-row">
                        <span style={{ color: getNguHanhBadgeColor(element), fontWeight: "bold" }}>{element}</span>
                        <div className="skd-element-meter-bar" role="meter" aria-label={`${element}: ${percent}%`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                          <div
                            className="skd-element-meter-fill"
                            style={{ width: `${percent}%`, background: getNguHanhBadgeColor(element) }}
                          />
                        </div>
                        <strong>{points}<small>{percent}%</small></strong>
                      </div>
                    );
                  })}
                </div>
              </article>

              {/* CARD 04 */}
              <article className="skd-astro-card is-bazi">
                <header className="skd-astro-card-head">
                  <span className="skd-astro-card-num">04</span>
                  <h4>Bát tự Tứ trụ</h4>
                </header>
                <div className="skd-bazi-pillars">
                  {([
                    ["Giờ", result.ownerAstro.baziPillars.hour],
                    ["Ngày", result.ownerAstro.baziPillars.day],
                    ["Tháng", result.ownerAstro.baziPillars.month],
                    ["Năm", result.ownerAstro.baziPillars.year],
                  ] as const).map(([label, pillar]) => (
                    <section className="skd-bazi-pillar" key={label}>
                      <h5>{label}</h5>
                      <div>
                        <span>{label === "Ngày" ? "Nhật chủ" : "Thiên can"}</span>
                        <strong>{pillar.stem}</strong>
                        <small>{pillar.stemMeta || pillar.element.split(" · ")[0]}</small>
                      </div>
                      <div>
                        <span>Địa chi</span>
                        <strong>{pillar.branch}</strong>
                        <small>{pillar.branchMeta || pillar.element.split(" · ")[1]}</small>
                      </div>
                    </section>
                  ))}
                </div>
              </article>

              {/* CARD 05 */}
              <article className="skd-astro-card is-relations">
                <header className="skd-astro-card-head">
                  <span className="skd-astro-card-num">05</span>
                  <h4>Quan hệ Can Chi</h4>
                </header>
                <div className="skd-relation-list">
                  {result.ownerAstro.canChiRelations.canHops.length > 0 && (
                    <div className="skd-relation-group">
                      <div className="skd-relation-label">Thiên can</div>
                      {result.ownerAstro.canChiRelations.canHops.map((item, index) => <p key={index}>{item}</p>)}
                    </div>
                  )}
                  {result.ownerAstro.canChiRelations.good.length > 0 && (
                    <div className="skd-relation-group is-good">
                      <div className="skd-relation-label">Quan hệ tốt</div>
                      {result.ownerAstro.canChiRelations.good.map((item, index) => <p key={index}>{item}</p>)}
                    </div>
                  )}
                  {result.ownerAstro.canChiRelations.caution.length > 0 && (
                    <div className="skd-relation-group is-warning">
                      <div className="skd-relation-label">Cần lưu ý</div>
                      {result.ownerAstro.canChiRelations.caution.map((item, index) => <p key={index}>{item}</p>)}
                    </div>
                  )}
                </div>
              </article>
            </div>
          </div>
        </details>

        {/* CĂN CỨ QUYẾT ĐỊNH */}
        <section className="skd-reading-article" style={{ borderLeftColor: "#7b2c0d", background: "#fbf8f2" }}>
          <h4>Dãy SIM này nổi bật ở điểm nào?</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginTop: "0.75rem" }}>
            <div>
              <b>Quẻ chủ: {result.primaryHexagram.name}</b>
              <p style={{ fontSize: "0.85rem", color: "#555" }}>
                Điểm hành trình {result.hexagramAssessment.score}/100; quẻ chủ {result.hexagramAssessment.primary.score}/100 và quẻ biến {result.hexagramAssessment.changed.score}/100.
              </p>
            </div>
            <div>
              <b>Ngũ hành sim: {result.simElement.element}</b>
              <p style={{ fontSize: "0.85rem", color: result.simElement.isGood ? "#0d8a43" : "#c81e1e" }}>
                Mối quan hệ {result.simElement.relationWithOwner} ({result.simElement.isGood ? "tốt" : "không tốt"}).
              </p>
            </div>
          </div>
        </section>

        {/* 5 PHƯƠNG DIỆN SCORE METERS */}
        <section id="skd-boisim-scorecards">
          <header className="skd-aspect-section-head">
            <div><span>04 · Chấm điểm ứng dụng</span><h3>Điểm mạnh & Điểm yếu: SIM đang hỗ trợ tốt nhất phương diện nào?</h3></div>
            <strong>{aspectOverallScore}<small>/100</small></strong>
          </header>
          <div className="skd-aspects-grid">
            <div className="skd-aspect-card">
              <div className="skd-aspect-title">Thế Vận</div>
              <div className="skd-aspect-score">{result.scores5Aspects.theVan.scorePercent}%</div>
              <div className="skd-aspect-meter">
                <div className="skd-aspect-fill" style={{ width: `${result.scores5Aspects.theVan.scorePercent}%` }} />
              </div>
              <div className="skd-aspect-desc">{result.scores5Aspects.theVan.text}</div>
            </div>

            <div className="skd-aspect-card">
              <div className="skd-aspect-title">Tài Lộc</div>
              <div className="skd-aspect-score">{result.scores5Aspects.taiLoc.scorePercent}%</div>
              <div className="skd-aspect-meter">
                <div className="skd-aspect-fill" style={{ width: `${result.scores5Aspects.taiLoc.scorePercent}%` }} />
              </div>
              <div className="skd-aspect-desc">{result.scores5Aspects.taiLoc.text}</div>
            </div>

            <div className="skd-aspect-card">
              <div className="skd-aspect-title">Công Danh</div>
              <div className="skd-aspect-score">{result.scores5Aspects.congDanh.scorePercent}%</div>
              <div className="skd-aspect-meter">
                <div className="skd-aspect-fill" style={{ width: `${result.scores5Aspects.congDanh.scorePercent}%` }} />
              </div>
              <div className="skd-aspect-desc">{result.scores5Aspects.congDanh.text}</div>
            </div>

            <div className="skd-aspect-card">
              <div className="skd-aspect-title">Tình Cảm</div>
              <div className="skd-aspect-score">{result.scores5Aspects.tinhCam.scorePercent}%</div>
              <div className="skd-aspect-meter">
                <div className="skd-aspect-fill" style={{ width: `${result.scores5Aspects.tinhCam.scorePercent}%` }} />
              </div>
              <div className="skd-aspect-desc">{result.scores5Aspects.tinhCam.text}</div>
            </div>

            <div className="skd-aspect-card">
              <div className="skd-aspect-title">Gia Đạo</div>
              <div className="skd-aspect-score">{result.scores5Aspects.giaDao.scorePercent}%</div>
              <div className="skd-aspect-meter">
                <div className="skd-aspect-fill" style={{ width: `${result.scores5Aspects.giaDao.scorePercent}%` }} />
              </div>
              <div className="skd-aspect-desc">{result.scores5Aspects.giaDao.text}</div>
            </div>
          </div>

          {aspectAnalysisItems.some(({ key, facts, strongPoints, weakPoints }) => (
            (result.referenceDetails?.aspectDetails?.[key]?.contextParagraphs.length ?? 0) > 0
            || facts.some(([, value]) => Boolean(value))
            || strongPoints.length > 0
            || weakPoints.length > 0
          )) && (
            <details className="skd-aspect-analysis">
              <summary>Luận chi tiết từng phương diện</summary>
              {result.referenceDetails?.fitMethodParagraphs?.length ? (
                <details className="skd-fit-method">
                  <summary>Cách phối quẻ với Bát Tự</summary>
                  <div>
                    {result.referenceDetails.fitMethodParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  </div>
                </details>
              ) : null}
              <div className="skd-aspect-analysis-grid">
                {aspectAnalysisItems.map(({ key, label, aspect, facts, strongPoints, weakPoints }, index) => (
                  <details className="skd-aspect-detail-card" key={key} open={index === 0}>
                    <summary>
                      <span>{label}<em>{aspect.tag}</em></span>
                      <strong>{aspect.scorePercent}%</strong>
                    </summary>
                    <div className="skd-aspect-detail-body">
                      <p className="skd-aspect-detail-verdict">{aspect.text}</p>
                      {result.referenceDetails?.aspectDetails?.[key]?.contextParagraphs.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>{paragraph}</p>
                      ))}
                      {facts.some(([, value]) => Boolean(value)) && (
                        <dl className="skd-aspect-facts">
                          {facts.filter(([, value]) => Boolean(value)).map(([factLabel, value]) => (
                            <div key={factLabel}><dt>{factLabel}</dt><dd>{value}</dd></div>
                          ))}
                        </dl>
                      )}
                      {strongPoints.length > 0 && (
                        <>
                          <b className="skd-aspect-list-title is-good">Điểm mạnh</b>
                          <ul className="is-good">
                            {strongPoints.map((item, pointIndex) => <li key={pointIndex}>{item}</li>)}
                          </ul>
                        </>
                      )}
                      {weakPoints.length > 0 && (
                        <>
                          <b className="skd-aspect-list-title is-warning">Điểm cần lưu ý</b>
                          <ul className="is-warning">
                            {weakPoints.map((item, pointIndex) => <li key={pointIndex}>{item}</li>)}
                          </ul>
                        </>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </details>
          )}
        </section>

        {/* BÁT CỰC LINH SỐ */}
        <section id="skd-bcls" className="skd-bcls-section" aria-labelledby="skd-bcls-title">
          <header className="skd-bcls-head">
            <div>
              <span>05 · 64 cặp sao Bát Trạch</span>
              <h3 id="skd-bcls-title">Bát Cực Linh Số</h3>
              <p>Đọc lần lượt {result.meta.bc.total} cặp số liền kề, xét cát/hung, chuỗi liên tục và lực của phần đuôi SIM.</p>
            </div>
            <div className={`skd-bcls-total ${getScoreTone(result.meta.s1)}`}>
              <strong>{result.meta.s1}<small>/100</small></strong>
              <span>Quy đổi {bclsCriterion?.points ?? 0}/{bclsCriterion?.weight ?? 0} điểm tổng</span>
            </div>
          </header>

          <div className="skd-bcls-metrics">
            <div><span>Cặp cát</span><strong>{bclsCatCount}</strong></div>
            <div><span>Cặp hung</span><strong>{bclsHungCount}</strong></div>
            <div><span>Chuỗi cát dài nhất</span><strong>{result.meta.bc.longestCatRun}</strong></div>
            <div><span>Chuỗi hung dài nhất</span><strong>{result.meta.bc.longestHungRun}</strong></div>
            <div><span>Điểm cát/hung nền</span><strong>{result.meta.bc.baseScore}</strong></div>
            <div><span>Điều chỉnh cấu trúc</span><strong>{result.meta.bc.sequenceAdjustment > 0 ? "+" : ""}{result.meta.bc.sequenceAdjustment}</strong></div>
          </div>

          <p className="skd-bcls-summary">{result.meta.bc.summary}</p>
          <div className="skd-bcls-pair-flow" role="list" aria-label="Các cặp sao Bát Cực trong SIM">
            {result.meta.bc.items.map((item, index) => (
              <article key={`${item.pair}-${index}`} role="listitem" className={`skd-bcls-pair is-${item.type}`}>
                <header><strong>{item.pair}</strong><span>{index + 1}</span></header>
                <b>{item.name}</b>
                <small>{item.type === "cat" ? "Cát tinh" : "Hung tinh"} · {item.points > 0 ? "+" : ""}{item.points}</small>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>

          <details className="skd-bcls-method">
            <summary>Cách tính điểm Bát Cực</summary>
            <p>Điểm nền chuẩn hóa tổng lực của Sinh Khí, Thiên Y, Diên Niên, Phục Vị và bốn hung tinh. Hệ thống sau đó cộng lực cho chuỗi cát liên tục, đuôi lặp ổn định và cặp cát thuận nghịch; đồng thời trừ lực khi nhiều hung tinh nối tiếp.</p>
          </details>
        </section>

        {/* LUẬN GIẢI CHUYÊN SÂU THEO QUẺ SIM & BÁT TỰ */}
        <details id="skd-deep-reading" className="skd-accordion">
          <summary>Luận giải chuyên sâu theo quẻ sim và bát tự</summary>
          <div className="skd-accordion-body">
            <div className="skd-reading-article">
              <h4>Ý nghĩa quẻ: {result.primaryHexagram.name}</h4>
              {result.referenceDetails?.meaningParagraphs.length
                ? result.referenceDetails.meaningParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                : <><p><b>Triệu:</b> <em>{result.primaryHexagram.trieu}</em></p><p>{result.primaryHexagram.explanation}</p></>}
            </div>

            <div className="skd-reading-article">
              <h4>Luận giải tổng thể vận thế của Sim {result.formattedPhone}</h4>
              {result.referenceDetails?.generalReadingParagraphs.length
                ? result.referenceDetails.generalReadingParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                : <p>{result.primaryHexagram.generalReading}</p>}
            </div>
          </div>
        </details>

        {/* GỢI Ý SỬ DỤNG & QUYẾT ĐỊNH */}
        <section id="skd-final-advice" className="skd-decision-card">
          <header className="skd-decision-head">
            <span>Gợi ý sử dụng</span>
            <h3 className="skd-decision-title">SIM {result.formattedPhone} có nên tiếp tục sử dụng?</h3>
          </header>

          <div className="skd-decision-copy">
            <p>{result.decisionText.summary}</p>
            <p>{result.decisionText.advice}</p>
          </div>

          <div className="skd-decision-highlights">
            <div className="skd-decision-highlights-title">Xét các yếu tố phụ khác</div>
            <ul>
              <li>
                <CheckCircle2 aria-hidden="true" />
                <span><b>Quẻ Kinh Dịch:</b> Quẻ chủ {result.primaryHexagram.name} {result.hexagramAssessment.primary.score}/100; quẻ biến {result.changedHexagram.name} {result.hexagramAssessment.changed.score}/100.</span>
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" />
                <span><b>Bát Cực Linh Số:</b> {result.meta.s1}/100, gồm {bclsCatCount} cặp cát và {bclsHungCount} cặp hung.</span>
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" />
                <span><b>Ngũ hành Sim:</b> Sim {result.formattedPhone} có ngũ hành <strong>{result.simElement.element}</strong> ({result.simElement.name}), thân chủ có bản mệnh <strong>{result.ownerAstro.banMenhNguHanh}</strong>, đây là mối quan hệ <em>{result.simElement.relationWithOwner}</em> ⇒ <strong style={{ color: result.simElement.isGood ? "#0d8a43" : "#c81e1e" }}>{result.simElement.isGood ? "Tốt" : "Không tốt"}</strong>.</span>
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" />
                <span><b>Âm Dương:</b> {result.yinYang.text} ({result.yinYang.evenCount} Âm / {result.yinYang.oddCount} Dương).</span>
              </li>
              {result.referenceDetails?.hasLast4Reading !== false && (
                <li>
                  <CheckCircle2 aria-hidden="true" />
                  <span><b>4 số cuối:</b> Đuôi <strong>{result.linhSo4Last.last4}</strong> ({result.linhSo4Last.meaning} - {result.linhSo4Last.scoreType}).</span>
                </li>
              )}
              {result.patterns.length > 0 && (
                <li>
                  <CheckCircle2 aria-hidden="true" />
                  <span><b>Dạng số:</b> {result.patterns.join(", ")}.</span>
                </li>
              )}
            </ul>
          </div>

          <div className="skd-decision-aspects">
            <b>Phương diện nổi bật</b>
            <div className="skd-decision-tags">
              {result.scores5Aspects.prominentAspects.map((asp, i) => (
                <span key={i} className="skd-decision-tag">
                  <Star size={13} aria-hidden="true" /> {asp}
                </span>
              ))}
            </div>
          </div>

          <div className="skd-decision-verdict">
            <div>
              <span>Đánh giá tổng hợp</span>
              <strong>
                {result.decisionText.recommendation} ({result.totalScore}/100 - {result.finalClassification})
              </strong>
            </div>
            <button
              type="button"
              className="skd-decision-reset"
              onClick={handleResetToTop}
            >
              <RotateCcw size={15} aria-hidden="true" />
              Luận SIM Khác
            </button>
          </div>
        </section>
      </div>
      )}
    </div>
  );
}
