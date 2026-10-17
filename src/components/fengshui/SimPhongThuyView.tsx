import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeSimPhongThuy,
  calcSimLifeHexagrams,
  isValidSimDigits,
  normalizeVietnamesePhone,
  type SimFortuneHexagram,
  type SimAnalysisResult,
  validateSimPhongThuyInput,
} from "../../../shared/sim/sim-phong-thuy-engine";
import {
  BarChart3,
  CheckCircle2,
  Compass,
  Hash,
  Phone,
  RotateCcw,
  Scale,
  Search,
  Zap,
} from "lucide-react";
import { IChingReadingList, type IChingReadingItem } from "./IChingReadingList";
import "../../styles/sim-phong-thuy.css";
import { LucHaoSheet } from "./LucHaoSheet";

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

  const handleResetToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    phoneInputRef.current?.focus();
  };

  const hasValidPhone = useMemo(() => {
    return isValidSimDigits(normalizeVietnamesePhone(submittedQuery.phone));
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
  const lifeHexagramItems = useMemo<IChingReadingItem[]>(() => {
    if (!hasValidPhone) return [];
    const life = calcSimLifeHexagrams(submittedQuery.phone);
    const fortuneNote = (fortune: SimFortuneHexagram, scope: string) =>
      `${scope} ${fortune.digits}: thượng ${fortune.upperDigits.split("").join(" + ")} → ${fortune.upperQuai}, hạ ${fortune.lowerDigits.split("").join(" + ")} → ${fortune.lowerQuai}`;
    const items: IChingReadingItem[] = [
      { key: "primary", label: "Quẻ Chủ", number: life.primary, highlightLines: [life.movingLine], note: `Động hào ${life.movingLine}` },
      { key: "changed", label: "Quẻ Biến", number: life.changed, highlightLines: [life.movingLine], note: `Biến từ hào ${life.movingLine} của quẻ chủ` },
    ];
    if (life.tienVan) items.push({ key: "tien", label: "Quẻ Tiền Vận", number: life.tienVan.hexNum, note: fortuneNote(life.tienVan, "Xét số đầu") });
    if (life.trungVan) items.push({ key: "trung", label: "Quẻ Trung Vận", number: life.trungVan.hexNum, note: fortuneNote(life.trungVan, "Xét số giữa") });
    if (life.hauVan) items.push({ key: "hau", label: "Quẻ Hậu Vận", number: life.hauVan.hexNum, note: fortuneNote(life.hauVan, "Xét số cuối") });
    return items;
  }, [hasValidPhone, submittedQuery.phone]);
  const aspectAnalysisItems = result ? [
    {
      key: "theVan" as const,
      label: "Thế vận",
      facts: [] as Array<[string, string]>,
    },
    {
      key: "taiLoc" as const,
      label: "Tài lộc",
      facts: [
        ["Địa chi Tài vận", result.scores5Aspects.taiLoc.diaChi],
        ["Ngũ hành Tài vận", result.scores5Aspects.taiLoc.nguHanh],
      ] as Array<[string, string]>,
    },
    {
      key: "congDanh" as const,
      label: "Công danh",
      facts: [
        ["Địa chi Công danh", result.scores5Aspects.congDanh.diaChi],
        ["Ngũ hành Công danh", result.scores5Aspects.congDanh.nguHanh],
        ["Địa chi nguyên thần", result.scores5Aspects.congDanh.nguyenThanChi],
        ["Ngũ hành nguyên thần", result.scores5Aspects.congDanh.nguyenThanHanh],
      ] as Array<[string, string]>,
    },
    {
      key: "tinhCam" as const,
      label: "Tình cảm",
      facts: [
        ["Địa chi đối tượng", result.scores5Aspects.tinhCam.diaChiDoiTuong],
        ["Ngũ hành đối tượng", result.scores5Aspects.tinhCam.nguHanhDoiTuong],
        ["Quan hệ địa chi", result.scores5Aspects.tinhCam.quanHeDiaChi],
      ] as Array<[string, string]>,
    },
    {
      key: "giaDao" as const,
      label: "Gia đạo",
      facts: [] as Array<[string, string]>,
    },
  ].filter(({ key, facts }) => (
    (result.referenceDetails?.aspectDetails?.[key]?.contextParagraphs.length ?? 0) > 0
    || facts.some(([, value]) => Boolean(value))
  )) : [];
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
      if (!isValidSimDigits(normalizedPhone)) phoneInputRef.current?.focus();
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
              maxLength={32}
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
            <div className="skd-welcome-title">5 yếu tố luận giải</div>
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
            <a href="#kd-summary-card"><span>01</span>Tổng quan</a>
            <a href="#skd-life-hexagrams"><span>02</span>Luận quẻ</a>
            <a href="#skd-luc-hao"><span>03</span>Lá quẻ</a>
            <a href="#skd-owner-overview"><span>04</span>Mệnh cục</a>
            <a href="#skd-boisim-scorecards"><span>05</span>Phương diện</a>
            <a href="#skd-bcls"><span>06</span>Bát Cực</a>
            <a href="#skd-final-advice"><span>07</span>Tổng hợp</a>
          </nav>

        {/* HERO SUMMARY CARD */}
        <section id="kd-summary-card" className="skd-hero-summary-card">
          <div>
            <div className="skd-hero-eyebrow">Tổng quan theo Kinh Dịch</div>
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

            <p className="skd-hero-desc">Bản luận giải tổng hợp lá quẻ Lục Hào, mệnh cục Bát Tự và Bát Cực Linh Số của dãy số.</p>

            <div className="skd-hero-actions">
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

        </section>

        {/* NĂM QUẺ LUẬN SIM: CHỦ · BIẾN · TIỀN VẬN · TRUNG VẬN · HẬU VẬN */}
        {lifeHexagramItems.length > 0 && (
          <section id="skd-life-hexagrams" className="skd-life-hexagrams" aria-labelledby="skd-life-hex-title">
            <header className="skd-lh-section-intro">
              <span>Luận giải tổng thể sim</span>
              <h3 id="skd-life-hex-title">{lifeHexagramItems.length} quẻ của SIM {result.formattedPhone}</h3>
              <p>Quẻ Chủ, Quẻ Biến và các quẻ Tiền Vận, Trung Vận, Hậu Vận theo bảng 64 quẻ Kinh Dịch. Bấm “Xem chi tiết” để đọc đầy đủ từng quẻ.</p>
            </header>
            <IChingReadingList items={lifeHexagramItems} />
          </section>
        )}

        {/* LÁ QUẺ LỤC HÀO SHEET */}
        <section id="skd-luc-hao" className="skd-luc-hao-sheet" aria-labelledby="skd-lh-title">
          <header className="skd-lh-section-intro">
            <span>Lá quẻ đồ họa</span>
            <h3 id="skd-lh-title">Lá Quẻ Lục Hào của SIM {result.formattedPhone}</h3>
            <p>Xem nhanh toàn bộ quẻ chủ, quẻ biến và các hào trên một bản duy nhất.</p>
          </header>


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
          <LucHaoSheet data={result.lucHaoData} movingLine={result.movingLine} />
            </div>
          </details>
        </section>

        {/* KHÁI QUÁT VỀ MỆNH CỤC (5 THẺ) */}
        <details id="skd-owner-overview" className="skd-accordion" open>
          <summary>Khái quát về mệnh cục cá nhân</summary>
          <div className="skd-accordion-body">
            <section className="skd-destiny-score-panel" aria-label="Đối chiếu ngũ hành SIM với mệnh cục">
              <div className="skd-destiny-score-total">
                <span>Đối chiếu Mệnh cục</span>
                <p>Đối chiếu ngũ hành SIM với Nạp âm, Cung phi và Nhật chủ.</p>
              </div>
              <div className="skd-destiny-axis-list">
                {result.ownerAstro.destinyAxes.length > 0 ? result.ownerAstro.destinyAxes.map((axis) => (
                  <div key={axis.key}>
                    <span>{axis.label}<small>{axis.ownerElement} ↔ SIM {axis.simElement}</small></span>
                    <b>{axis.relation}</b>
                  </div>
                )) : <p>Nhập ngày giờ sinh để đối chiếu Mệnh cục.</p>}
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
                        <div className="skd-element-meter-bar" role="meter" aria-label={`${element}: ${points}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                          <div
                            className="skd-element-meter-fill"
                            style={{ width: `${percent}%`, background: getNguHanhBadgeColor(element) }}
                          />
                        </div>
                        <strong>{points}</strong>
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


        {/* 5 PHƯƠNG DIỆN SCORE METERS */}
        <section id="skd-boisim-scorecards">
          <header className="skd-aspect-section-head">
            <div><span>04 · Ứng dụng</span><h3>SIM tác động thế nào đến từng phương diện?</h3></div>
          </header>

          {aspectAnalysisItems.length > 0 && (
            <details className="skd-aspect-analysis" open>
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
                {aspectAnalysisItems.map(({ key, label, facts }, index) => (
                  <details className="skd-aspect-detail-card" key={key} open={index === 0}>
                    <summary>
                      <span>{label}</span>
                    </summary>
                    <div className="skd-aspect-detail-body">
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
              <p>Đọc lần lượt {result.meta.bc.total} cặp số liền kề và ý nghĩa sao Bát Trạch của từng cặp.</p>
            </div>
          </header>

          <div className="skd-bcls-pair-flow" role="list" aria-label="Các cặp sao Bát Cực trong SIM">
            {result.meta.bc.items.map((item, index) => (
              <article key={`${item.pair}-${index}`} role="listitem" className="skd-bcls-pair">
                <header><strong>{item.pair}</strong><span>{index + 1}</span></header>
                <b>{item.name}</b>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>

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
            <span>Tổng hợp</span>
            <h3 className="skd-decision-title">Các yếu tố của SIM {result.formattedPhone}</h3>
          </header>


          <div className="skd-decision-highlights">
            <div className="skd-decision-highlights-title">Các yếu tố đã xét</div>
            <ul>
              <li>
                <CheckCircle2 aria-hidden="true" />
                <span><b>Quẻ Kinh Dịch:</b> Quẻ chủ {result.primaryHexagram.name}, hào {result.movingLine} động, quẻ biến {result.changedHexagram.name}.</span>
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" />
                <span><b>Bát Cực Linh Số:</b> {result.meta.bc.total} cặp số liền kề: {result.meta.bc.items.map((item) => item.name).join(", ")}.</span>
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" />
                <span><b>Ngũ hành Sim:</b> Sim {result.formattedPhone} có ngũ hành <strong>{result.simElement.element}</strong> ({result.simElement.name}), thân chủ có bản mệnh <strong>{result.ownerAstro.banMenhNguHanh}</strong>, quan hệ ngũ hành: <em>{result.simElement.relationWithOwner}</em>.</span>
              </li>
              <li>
                <CheckCircle2 aria-hidden="true" />
                <span><b>Âm Dương:</b> {result.yinYang.evenCount} số Âm (chẵn) / {result.yinYang.oddCount} số Dương (lẻ).</span>
              </li>
              {result.referenceDetails?.hasLast4Reading !== false && (
                <li>
                  <CheckCircle2 aria-hidden="true" />
                  <span><b>4 số cuối:</b> Đuôi <strong>{result.linhSo4Last.last4}</strong> ({result.linhSo4Last.meaning}).</span>
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

          <div className="skd-decision-verdict">
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
