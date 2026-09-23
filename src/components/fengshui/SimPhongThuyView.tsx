import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  analyzeSimPhongThuy,
  normalizeVietnamesePhone,
  type SimAnalysisResult,
  validateSimPhongThuyInput,
} from "../../../shared/sim/sim-phong-thuy-engine";
import {
  Compass,
  Phone,
  RotateCcw,
  Search,
} from "lucide-react";
import "../../styles/sim-phong-thuy.css";

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
      gioitinh: submittedQuery.gender === "Nữ" ? "nu" : "nam",
      lich: submittedQuery.calendarType === "lunar" ? "al" : "dl",
    });
    if (y && m && d) {
      params.set("nam", y);
      params.set("thang", String(Number(m)));
      params.set("ngay", String(Number(d)));
    }
    if (h && min) {
      params.set("gio", String(Number(h)));
      params.set("phut", String(Number(min)));
    }
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

      {hasValidPhone && isSyncing ? (
        <div className="skd-result-loading" role="status" aria-live="polite">
          <span className="skd-result-loading-mark" aria-hidden="true">易</span>
          <div><strong>Đang lập quẻ SIM</strong><span>Vui lòng chờ trong giây lát.</span></div>
        </div>
      ) : !hasValidPhone || !result ? (
        <div className="skd-simple-welcome">
          <Compass aria-hidden="true" />
          <div><strong>Tra cứu SIM theo Kinh Dịch</strong><p>Nhập số điện thoại để xem quẻ chủ, quẻ biến và gợi ý sử dụng.</p></div>
        </div>
      ) : (
        <div id="print-area" ref={resultRef} className="skd-simple-result" role="region" aria-live="polite" aria-labelledby="sim-result-title" tabIndex={-1}>
          {syncedForCurrentQuery && syncedAnalysis.error && (
            <p className="skd-result-sync-warning" role="status">Không thể đối chiếu dữ liệu trực tuyến. Kết quả đang dùng bộ tính nội bộ.</p>
          )}
          <header className="skd-simple-result__intro">
            <span>Kết quả tra cứu</span>
            <h2 id="sim-result-title">Phong thủy SIM {result.formattedPhone}</h2>
          </header>

          <section className="skd-simple-summary" aria-label="Kết luận nhanh">
            <div className="skd-simple-summary__copy">
              <span>Kết luận theo Kinh Dịch</span>
              <h3>SIM {result.formattedPhone}</h3>
              <p>{result.decisionText.summary}</p>
              <dl>
                <div><dt>Quẻ chủ</dt><dd>{result.primaryHexagram.name}</dd></div>
                <div><dt>Hào động</dt><dd>Hào {result.movingLine}</dd></div>
                <div><dt>Quẻ biến</dt><dd>{result.changedHexagram.name}</dd></div>
              </dl>
            </div>
            <div className="skd-simple-summary__verdict">
              <strong>{result.finalClassification}</strong>
              <span>{result.decisionText.recommendation}</span>
            </div>
          </section>

          <section className="skd-simple-panel" aria-labelledby="skd-simple-hex-title">
            <div className="skd-simple-panel__heading"><span>01 / Lá quẻ</span><h3 id="skd-simple-hex-title">Quẻ SIM</h3></div>
            <div className="skd-simple-hex-grid">
              <article>
                <span>Quẻ chủ · Hiện tại</span>
                <h4>{result.primaryHexagram.name}</h4>
                <p>{result.hexagramAssessment.primary.explanation}</p>
              </article>
              <div className="skd-simple-hex-arrow" aria-label={`Hào ${result.movingLine} động`}><b>Hào {result.movingLine}</b><span aria-hidden="true">→</span></div>
              <article>
                <span>Quẻ biến · Xu hướng</span>
                <h4>{result.changedHexagram.name}</h4>
                <p>{result.hexagramAssessment.changed.explanation}</p>
              </article>
            </div>
            {result.referenceDetails?.hexagramImageUrl && (
              <details className="skd-simple-details">
                <summary>Xem lá quẻ Lục Hào đầy đủ</summary>
                <img src={result.referenceDetails.hexagramImageUrl} alt={`Lá quẻ Lục Hào của SIM ${result.formattedPhone}`} loading="lazy" />
              </details>
            )}
          </section>

          <section className="skd-simple-panel" aria-labelledby="skd-simple-aspects-title">
            <div className="skd-simple-panel__heading"><span>02 / Phương diện</span><h3 id="skd-simple-aspects-title">SIM hỗ trợ điều gì?</h3></div>
            <div className="skd-simple-aspects">
              {([
                ["Thế vận", result.scores5Aspects.theVan],
                ["Tài lộc", result.scores5Aspects.taiLoc],
                ["Công danh", result.scores5Aspects.congDanh],
                ["Tình cảm", result.scores5Aspects.tinhCam],
                ["Gia đạo", result.scores5Aspects.giaDao],
              ] as const).map(([label, aspect]) => (
                <article key={label}>
                  <div><h4>{label}</h4><strong>{aspect.scorePercent}%</strong></div>
                  <p>{result.referenceDetails ? aspect.text : aspect.scorePercent >= 70 ? "Phương diện được hỗ trợ rõ." : aspect.scorePercent >= 50 ? "Phương diện ở mức cân bằng." : "Phương diện cần cân nhắc thêm."}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="skd-simple-advice" aria-labelledby="skd-simple-advice-title">
            <span>03 / Gợi ý sử dụng</span>
            <h3 id="skd-simple-advice-title">Có nên tiếp tục sử dụng?</h3>
            <p>{result.referenceDetails ? result.decisionText.advice : result.decisionText.summary}</p>
            <button type="button" onClick={handleResetToTop}><RotateCcw size={17} aria-hidden="true" /> Luận SIM khác</button>
          </section>

          <details className="skd-simple-details skd-simple-details--more">
            <summary>Xem thêm thông tin mệnh chủ và luận giải</summary>
            <div className="skd-simple-more-grid">
              <div><span>Ngày sinh</span><strong>{result.ownerAstro.solarDate}</strong></div>
              <div><span>Bản mệnh</span><strong>{result.ownerAstro.banMenhNguHanh}</strong></div>
              <div><span>Cung phi</span><strong>{result.ownerAstro.cungPhi}</strong></div>
              <div><span>Ngũ hành SIM</span><strong>{result.simElement.element}</strong></div>
            </div>
            <div className="skd-simple-reading">
              <h4>Ý nghĩa quẻ {result.primaryHexagram.name}</h4>
              {(result.referenceDetails?.meaningParagraphs.length ? result.referenceDetails.meaningParagraphs : [result.primaryHexagram.explanation]).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
