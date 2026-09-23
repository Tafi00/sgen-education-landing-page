import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  CalendarDays,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ClipboardCopy,
  Clock3,
  Compass,
  FileText,
  LayoutGrid,
  Link2,
  MapPin,
  PencilLine,
  Printer,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  getAnnualPillar,
  getBaziRelations,
  getBaziSupportProfile,
  getBaziTemperature,
  getElementBalance,
  getFourPillars,
  getHiddenStems,
  getLifeStage,
  getLuckCycles,
  getLunarDate,
  getNaYin,
  getTenGod,
  type TimeCalculationMode,
} from "../../../shared/menh-thu/metaphysics";
import "../../styles/bazi-sgen.css";

export type BaziToolViewProps = { defaultQuestion?: string; compact?: boolean };
type BaziView = "chart" | "fortune" | "analysis" | "ai" | "notes";
type BirthForm = {
  name: string;
  gender: "Nam" | "Nữ";
  date: string;
  time: string;
  viewYear: number;
  mode: TimeCalculationMode;
};

const LONGITUDE = 105.8333;
const LATITUDE = 21.0285;
const UTC_OFFSET = 7;
const BRANCHES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const PILLAR_LABELS = ["Năm", "Tháng", "Ngày", "Giờ"];

const TIME_MODES: Record<TimeCalculationMode, { title: string; description: string }> = {
  apparent: { title: "Giờ Mặt Trời thực", description: "Hiệu chỉnh theo kinh độ và phương trình thời gian theo ngày." },
  mean: { title: "Giờ bình Mặt Trời", description: "Hiệu chỉnh theo chênh lệch kinh độ chuẩn." },
  civil: { title: "Giờ dân dụng", description: "Giữ nguyên giờ đồng hồ tại nơi sinh." },
};

function getElementColorClass(element: string) {
  switch (element) {
    case "Thủy": return "sgen-el-thuy";
    case "Mộc": return "sgen-el-moc";
    case "Hỏa": return "sgen-el-hoa";
    case "Thổ": return "sgen-el-tho";
    case "Kim": return "sgen-el-kim";
    default: return "";
  }
}

const initialForm = (): BirthForm => ({
  name: "An Nhiên",
  gender: "Nữ",
  date: "1992-08-18",
  time: "07:30",
  viewYear: 2026,
  mode: "apparent",
});

const dateVi = (value: string) => value.split("-").reverse().join("/");

export function BaziToolView({ compact = false }: BaziToolViewProps) {
  const [form, setForm] = useState<BirthForm>(initialForm);
  const [submitted, setSubmitted] = useState<BirthForm>(initialForm);
  const [view, setView] = useState<BaziView>("chart");
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null);
  const [viewYear, setViewYear] = useState(2026);
  const [showAnnualDetail, setShowAnnualDetail] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Parse URL query on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qName = params.get("ten");
    const qGender = params.get("gioi-tinh");
    const qDate = params.get("ngay-sinh");
    const qTime = params.get("gio-sinh");
    const qYear = params.get("nam-xem");
    const qMode = params.get("chuan-gio") as TimeCalculationMode | null;

    if (qName || qDate || qTime) {
      const next: BirthForm = {
        name: qName?.trim() || "An Nhiên",
        gender: qGender === "Nam" ? "Nam" : "Nữ",
        date: qDate || "1992-08-18",
        time: qTime || "07:30",
        viewYear: qYear ? Number(qYear) : 2026,
        mode: qMode && qMode in TIME_MODES ? qMode : "apparent",
      };
      setForm(next);
      setSubmitted(next);
      setViewYear(next.viewYear);
    }
  }, []);

  const result = useMemo(() => {
    try {
      const chart = getFourPillars(submitted.date, submitted.time, LONGITUDE, UTC_OFFSET, submitted.mode);
      const luck = getLuckCycles(submitted.date, submitted.time, submitted.gender, LONGITUDE, UTC_OFFSET, submitted.mode);
      return {
        chart,
        luck,
        balance: getElementBalance(chart.pillars),
        support: getBaziSupportProfile(chart.pillars),
        temperature: getBaziTemperature(chart.pillars, chart.calculation.solarTerm),
        relations: getBaziRelations(chart.pillars),
        lunar: getLunarDate(chart.calculation.appliedDate),
      };
    } catch {
      return null;
    }
  }, [submitted]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.date || !form.time || !Number.isInteger(form.viewYear) || form.viewYear < 1900 || form.viewYear > 2100) {
      setError("Vui lòng kiểm tra họ tên, ngày giờ sinh và năm xem.");
      return;
    }
    try {
      getFourPillars(form.date, form.time, LONGITUDE, UTC_OFFSET, form.mode);
      setSubmitted({ ...form, name: form.name.trim() });
      setViewYear(form.viewYear);
      setError("");
      setNotice("Đã cập nhật lá số Bát Tự.");
      setTimeout(() => setNotice(""), 3000);
    } catch {
      setError("Không thể an trụ từ dữ kiện này. Vui lòng kiểm tra lại ngày và giờ sinh.");
    }
  };

  const copyLink = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("ten", submitted.name);
    url.searchParams.set("gioi-tinh", submitted.gender);
    url.searchParams.set("ngay-sinh", submitted.date);
    url.searchParams.set("gio-sinh", submitted.time);
    url.searchParams.set("nam-xem", String(viewYear));
    url.searchParams.set("chuan-gio", submitted.mode);
    await navigator.clipboard.writeText(url.toString());
    setNotice("Đã chép liên kết lá số vào bộ nhớ đệm.");
    setTimeout(() => setNotice(""), 3000);
  };

  const chartMarkdown = useMemo(() => {
    if (!result) return "";
    const { chart, luck, support, balance, relations } = result;
    return [
      `# Lá số Tứ Trụ Bát Tự · ${submitted.name}`,
      `- Giới tính: ${submitted.gender} mệnh`,
      `- Sinh ngày: ${dateVi(submitted.date)} · ${submitted.time} · Việt Nam (UTC+7)`,
      `- Chuẩn giờ: ${TIME_MODES[submitted.mode].title} (giờ an trụ ${chart.calculation.appliedTime})`,
      `- Tiết khí: ${chart.calculation.solarTerm}`,
      `- Nhật chủ: ${chart.dayMaster.stem} ${chart.dayMaster.stemElement} (${chart.dayMaster.polarity} khí)`,
      "",
      "## Bốn trụ nguyên cục",
      ...chart.pillars.map(
        (pillar, index) =>
          `- ${PILLAR_LABELS[index]}: ${pillar.stem} ${pillar.branch} · Thập thần: ${
            index === 2 ? "Nhật chủ" : getTenGod(chart.dayMaster.stem, pillar.stem)
          } · Tàng can: ${getHiddenStems(pillar.branch).join(", ") || "—"} · Nạp âm: ${getNaYin(
            pillar
          )} · Trường sinh: ${getLifeStage(chart.dayMaster.stem, pillar.branch)}`
      ),
      "",
      `## Cấu trúc vượng suy: ${support.status} (${support.strengthScore}/100)`,
      `- Dụng thần tham khảo: ${support.usefulElement}`,
      `- Hỷ thần: ${support.joyElement} (${support.explanation})`,
      `- Phân bố ngũ hành: ${balance.map((item) => `${item.element} ${item.percent}%`).join("; ")}`,
      `- Quan hệ Can Chi: ${
        relations.map((item) => `${item.label} ${item.members.join("–")}`).join("; ") || "Không có bộ nổi bật"
      }`,
      `- Đại vận: ${luck.forward ? "Thuận hành" : "Nghịch hành"} · Khởi vận ${luck.start.year} năm ${
        luck.start.month
      } tháng`,
      ...luck.cycles.map(
        (cycle) =>
          `- ${cycle.from}–${cycle.to} tuổi: ${cycle.stem} ${cycle.branch} (${cycle.startYear}–${cycle.endYear})`
      ),
    ].join("\n");
  }, [submitted, result]);

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(chartMarkdown);
    setNotice("Đã sao chép nội dung Markdown.");
    setTimeout(() => setNotice(""), 3000);
  };

  const focusForm = () => {
    nameInputRef.current?.focus();
    nameInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const currentCycleIndex = result
    ? result.luck.cycles.findIndex((cycle) => viewYear >= cycle.startYear && viewYear <= cycle.endYear)
    : -1;
  const effectiveCycleIndex = selectedCycle ?? Math.max(0, currentCycleIndex);
  const activeCycle = result?.luck.cycles[effectiveCycleIndex];
  const annualPillar = getAnnualPillar(viewYear);
  const annualYears = activeCycle
    ? Array.from(
        { length: Math.min(10, activeCycle.endYear - activeCycle.startYear + 1) },
        (_, index) => activeCycle.startYear + index
      )
    : [];
  const birthYear = Number(submitted.date.slice(0, 4)) || 1990;
  const age = Math.max(1, viewYear - birthYear + 1);

  const visibleYang =
    result?.chart.pillars.reduce(
      (sum, pillar) =>
        sum +
        (pillar.polarity === "Dương" ? 1 : 0) +
        (["Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất"].includes(pillar.branch) ? 1 : 0),
      0
    ) ?? 0;

  const lunarBirthForm = useMemo(() => {
    try {
      return getLunarDate(form.date);
    } catch {
      return null;
    }
  }, [form.date]);

  return (
    <div className="sgen-bazi-workspace">
      {/* CỘT TRÁI — HỒ SƠ MỆNH CHỦ FORM */}
      <aside className="sgen-bazi-form-card" aria-label="Dữ kiện lập lá số">
        <form onSubmit={submit}>
          <div className="sgen-bazi-form-intro">
            <span>Hồ sơ mệnh chủ</span>
            <b aria-hidden="true">八字</b>
            <strong>Nhập thời điểm sinh</strong>
            <p>Ngày, giờ và nơi sinh là ba dữ kiện chính để an bốn trụ.</p>
          </div>

          <div className="sgen-bazi-form-body">
            <label className="sgen-bazi-field">
              <span>Họ tên</span>
              <input
                ref={nameInputRef}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nhập họ tên"
                required
              />
            </label>

            <fieldset className="sgen-bazi-field">
              <legend>Giới tính</legend>
              <div className="sgen-bazi-segmented">
                <button
                  type="button"
                  className={form.gender === "Nam" ? "is-selected" : ""}
                  onClick={() => setForm({ ...form, gender: "Nam" })}
                >
                  Nam
                </button>
                <button
                  type="button"
                  className={form.gender === "Nữ" ? "is-selected" : ""}
                  onClick={() => setForm({ ...form, gender: "Nữ" })}
                >
                  Nữ
                </button>
              </div>
            </fieldset>

            <label className="sgen-bazi-field">
              <span>Ngày sinh dương lịch</span>
              <input
                type="date"
                min="1800-01-01"
                max="2200-12-31"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
              {lunarBirthForm && (
                <small>
                  Âm lịch {lunarBirthForm.day}/{lunarBirthForm.month}/{lunarBirthForm.year}
                  {lunarBirthForm.leap ? " · tháng nhuận" : ""}
                </small>
              )}
            </label>

            <label className="sgen-bazi-field">
              <span>Giờ sinh</span>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </label>

            <div className="sgen-bazi-location-pill">
              <MapPin size={17} />
              <div>
                <b>Vị trí sinh mặc định</b>
                <strong>Việt Nam · UTC+7</strong>
                <small>Tọa độ quy chiếu {LATITUDE.toFixed(4)}° N, {LONGITUDE.toFixed(4)}° E.</small>
              </div>
            </div>

            <details className="sgen-bazi-time-settings">
              <summary>
                <SlidersHorizontal size={16} />
                <span>
                  <b>Hiệu chỉnh thời gian</b>
                  <small>{TIME_MODES[form.mode].title}</small>
                </span>
                <ChevronRight size={15} />
              </summary>
              <div className="sgen-bazi-time-settings__body">
                {(Object.keys(TIME_MODES) as TimeCalculationMode[]).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    className={`sgen-bazi-time-mode-btn ${form.mode === mode ? "is-selected" : ""}`}
                    onClick={() => setForm({ ...form, mode })}
                  >
                    <b>{TIME_MODES[mode].title}</b>
                    <small>{TIME_MODES[mode].description}</small>
                  </button>
                ))}
              </div>
            </details>

            <div className="sgen-bazi-form-action">
              <label className="sgen-bazi-field">
                <span>Năm luận vận</span>
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={form.viewYear}
                  onChange={(e) => setForm({ ...form, viewYear: Number(e.target.value) })}
                  required
                />
              </label>

              <button className="sgen-bazi-submit-btn" type="submit">
                <Sparkles size={18} />
                <span>Lập lá số Bát Tự</span>
              </button>
            </div>

            {error && (
              <p className="sgen-bazi-field" style={{ color: "#d92d20", fontSize: "0.78rem" }}>
                <CircleAlert size={15} style={{ verticalAlign: "middle", marginRight: 4 }} />
                {error}
              </p>
            )}
          </div>
        </form>

        <p className="sgen-bazi-input-status">
          <CircleCheck size={16} />
          <span>
            <b>Lá số đang hiển thị:</b> {submitted.name} · {dateVi(submitted.date)} · {submitted.time}
          </span>
        </p>
      </aside>

      {/* CỘT PHẢI — BÁT TỰ RESULTS */}
      <main className="sgen-bazi-result-card" aria-live="polite">
        {result ? (
          <>
            {/* Toolbar */}
            <header className="sgen-bazi-toolbar">
              <div className="sgen-bazi-toolbar__info">
                <span>Lá số của</span>
                <strong>{submitted.name}</strong>
                <small>
                  {submitted.gender} · {dateVi(submitted.date)} · {submitted.time}
                </small>
              </div>

              <div className="sgen-bazi-toolbar__actions">
                <button type="button" onClick={focusForm} title="Sửa dữ kiện sinh">
                  <PencilLine size={15} /> Sửa lá số
                </button>
                <button type="button" onClick={copyLink} title="Chép liên kết xem lá số">
                  <Link2 size={15} /> Chép liên kết
                </button>
                <button type="button" onClick={copyMarkdown} title="Chép dữ liệu Markdown">
                  <ClipboardCopy size={15} /> Chép lá số
                </button>
                <button type="button" onClick={() => window.print()} title="In lá số ra giấy hoặc xuất PDF">
                  <Printer size={15} /> In · lưu PDF
                </button>
              </div>
            </header>

            {/* Location & Solar Time Strip */}
            <div className="sgen-bazi-location-strip">
              <MapPin size={15} />
              <span>
                Vị trí tính toán: <b>Việt Nam</b> ({LATITUDE.toFixed(4)}° N, {LONGITUDE.toFixed(4)}° E · UTC+7)
              </span>
              <span className="sgen-solar-time-pill">
                <Clock3 size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                Chính ngọ {result.chart.calculation.solarNoonTime} · {TIME_MODES[submitted.mode].title}{" "}
                {result.chart.calculation.appliedTime}
              </span>
            </div>

            {notice && (
              <div
                style={{
                  padding: "8px 24px",
                  background: "#edfcf2",
                  color: "#12b76a",
                  fontSize: "0.78rem",
                  fontWeight: 650,
                  borderBottom: "1px solid #d3f8df",
                }}
              >
                {notice}
              </div>
            )}

            {/* View Tabs */}
            <nav className="sgen-bazi-tabs" role="tablist" aria-label="Nội dung lá số">
              <button
                type="button"
                className={view === "chart" ? "is-selected" : ""}
                onClick={() => setView("chart")}
              >
                <LayoutGrid size={15} /> Lá số
              </button>
              <button
                type="button"
                className={view === "fortune" ? "is-selected" : ""}
                onClick={() => setView("fortune")}
              >
                <CalendarDays size={15} /> Đại vận · Lưu niên
              </button>
              <button
                type="button"
                className={view === "analysis" ? "is-selected" : ""}
                onClick={() => setView("analysis")}
              >
                <Compass size={15} /> Phân tích cấu trúc
              </button>
              <button
                type="button"
                className={view === "ai" ? "is-selected" : ""}
                onClick={() => setView("ai")}
              >
                <Sparkles size={15} /> Tổng kết AI
              </button>
              <button
                type="button"
                className={view === "notes" ? "is-selected" : ""}
                onClick={() => setView("notes")}
              >
                <FileText size={15} /> Ghi chú
              </button>
            </nav>

            {/* TAB 1: LÁ SỐ */}
            {view === "chart" && (
              <div className="sgen-bazi-paper">
                {/* Header Profile */}
                <div className="sgen-bazi-paper-header">
                  <div>
                    <small>SGEN · Bát Tự Mệnh Lý Học</small>
                    <h2>{submitted.name}</h2>
                    <p>
                      {submitted.gender} mệnh · {result.luck.forward ? "Thuận hành" : "Nghịch hành"} · Tiết{" "}
                      {result.chart.calculation.solarTerm}
                    </p>
                  </div>
                  <div className="sgen-bazi-seal" aria-hidden="true">
                    命<br />書
                  </div>
                  <dl className="sgen-bazi-header-dl">
                    <div>
                      <dt>Dương lịch</dt>
                      <dd>{dateVi(submitted.date)} · {submitted.time}</dd>
                    </div>
                    <div>
                      <dt>Âm lịch</dt>
                      <dd>
                        {result.lunar.day}/{result.lunar.month}/{result.lunar.year}
                        {result.lunar.leap ? " · nhuận" : ""}
                      </dd>
                    </div>
                    <div>
                      <dt>Tiết khí</dt>
                      <dd>{result.chart.calculation.solarTerm}</dd>
                    </div>
                    <div>
                      <dt>Năm xem</dt>
                      <dd>{viewYear} ({age} tuổi)</dd>
                    </div>
                    <div>
                      <dt>Giờ an trụ</dt>
                      <dd>{result.chart.calculation.appliedTime} ({Math.round(result.chart.calculation.appliedCorrectionMinutes)}p)</dd>
                    </div>
                  </dl>
                </div>

                {/* 4 Banner Cards */}
                <div className="sgen-bazi-board-banner">
                  <div className="sgen-bazi-banner-card">
                    <small>Tháng lệnh</small>
                    <b>
                      {result.chart.pillars[1].stem} {result.chart.pillars[1].branch}
                    </b>
                    <i>{result.chart.calculation.solarTerm}</i>
                  </div>
                  <div className="sgen-bazi-banner-card">
                    <small>Nhật chủ</small>
                    <b>
                      {result.chart.dayMaster.stem} {result.chart.dayMaster.stemElement}
                    </b>
                    <i>{result.chart.dayMaster.polarity} khí</i>
                  </div>
                  <div className="sgen-bazi-banner-card">
                    <small>Giờ sinh an trụ</small>
                    <b>{result.chart.calculation.appliedTime}</b>
                    <i>{TIME_MODES[submitted.mode].title}</i>
                  </div>
                  <div className="sgen-bazi-banner-card">
                    <small>Âm dương hiển</small>
                    <b>
                      {visibleYang} Dương · {8 - visibleYang} Âm
                    </b>
                    <i>Tám chữ nguyên cục</i>
                  </div>
                </div>

                {/* Palace Board (12 Địa Chi) */}
                <div className="sgen-bazi-palace-scroll">
                  <div className="sgen-bazi-palace-board">
                    {BRANCHES.map((branch, index) => {
                      const hidden = getHiddenStems(branch);
                      return (
                        <article className="sgen-bazi-palace-cell" key={branch}>
                          <header>
                            <small>{getLifeStage(result.chart.dayMaster.stem, branch)}</small>
                            <strong>{branch}</strong>
                          </header>
                          <div className="sgen-bazi-palace-gods">
                            {hidden.map((stem) => (
                              <span key={stem}>
                                <b className={getElementColorClass(stem)}>{stem}</b>
                                <small>{getTenGod(result.chart.dayMaster.stem, stem)}</small>
                              </span>
                            ))}
                          </div>
                          <footer>Tàng: {hidden.join(" · ")}</footer>
                        </article>
                      );
                    })}

                    {/* Center box */}
                    <div className="sgen-bazi-palace-center">
                      <small>Mệnh chủ · {submitted.gender}</small>
                      <strong>{submitted.name}</strong>
                      <div className="sgen-bazi-center-pillars">
                        {result.chart.pillars.map((pillar, index) => (
                          <div className="sgen-bazi-center-pillar" key={index}>
                            <small>{PILLAR_LABELS[index]}</small>
                            <b>{index === 2 ? "Chủ" : getTenGod(result.chart.dayMaster.stem, pillar.stem)}</b>
                            <strong className={getElementColorClass(pillar.stemElement)}>{pillar.stem}</strong>
                            <em className={getElementColorClass(pillar.branchElement)}>{pillar.branch}</em>
                            <span>{getLifeStage(result.chart.dayMaster.stem, pillar.branch)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Matrix Table */}
                <details className="sgen-bazi-detail-table" open>
                  <summary>
                    <span>
                      <LayoutGrid size={16} style={{ verticalAlign: "middle", marginRight: 8, color: "#7a3cff" }} />
                      Bảng Bát Tự chi tiết (Thập thần · Tàng can · Nạp âm · Trường sinh)
                    </span>
                    <ChevronRight size={17} />
                  </summary>
                  <div className="sgen-bazi-matrix-scroll">
                    <div className="sgen-bazi-matrix">
                      <div className="sgen-bazi-matrix-corner">
                        Nhật chủ<br />
                        <strong>{result.chart.dayMaster.stem}</strong>
                      </div>
                      {PILLAR_LABELS.map((label) => (
                        <div className="sgen-bazi-matrix-head" key={label}>
                          {label}
                        </div>
                      ))}

                      {(["Thập thần", "Thiên can", "Địa chi", "Tàng can", "Nạp âm", "Trường sinh"] as const).map((row) => (
                        <div className="sgen-bazi-matrix-row" key={row}>
                          <div className="sgen-bazi-matrix-row-label">{row}</div>
                          {result.chart.pillars.map((pillar, index) => (
                            <div className="sgen-bazi-matrix-cell" key={index}>
                              {row === "Thập thần"
                                ? index === 2
                                  ? "Nhật chủ"
                                  : getTenGod(result.chart.dayMaster.stem, pillar.stem)
                                : row === "Thiên can"
                                ? `${pillar.stem} (${pillar.stemElement})`
                                : row === "Địa chi"
                                ? `${pillar.branch} (${pillar.branchElement})`
                                : row === "Tàng can"
                                ? getHiddenStems(pillar.branch).join(" · ") || "—"
                                : row === "Nạp âm"
                                ? getNaYin(pillar)
                                : getLifeStage(result.chart.dayMaster.stem, pillar.branch)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </details>

                {/* Destiny Cards */}
                <div className="sgen-bazi-destiny-grid">
                  <article className="sgen-bazi-destiny-card">
                    <small>Vượng suy Nhật chủ</small>
                    <strong>{result.support.status}</strong>
                    <span>
                      Điểm vượng suy {result.support.strengthScore}/100 · Tháng lệnh {result.support.monthChiefElement}.
                    </span>
                  </article>
                  <article className="sgen-bazi-destiny-card">
                    <small>Dụng thần tham khảo</small>
                    <strong>{result.support.usefulElement}</strong>
                    <span>Ngũ hành ưu tiên giúp điều hòa sinh khắc của toàn bộ nguyên cục.</span>
                  </article>
                  <article className="sgen-bazi-destiny-card">
                    <small>Hỷ thần</small>
                    <strong>{result.support.joyElement}</strong>
                    <span>{result.support.explanation}</span>
                  </article>
                </div>

                {/* Luck Summary & Track */}
                <div className="sgen-bazi-luck-track-wrap">
                  <div className="sgen-bazi-luck-summary">
                    <b>Khởi vận:</b> {result.luck.start.year} năm {result.luck.start.month} tháng{" "}
                    {result.luck.start.day} ngày ({result.luck.forward ? "Thuận hành" : "Nghịch hành"} từ trụ tháng · năm luận {viewYear}).
                  </div>
                  <div className="sgen-bazi-luck-track">
                    {result.luck.cycles.map((cycle, index) => (
                      <button
                        type="button"
                        key={index}
                        className={`sgen-bazi-luck-cycle-btn ${index === currentCycleIndex ? "is-current" : ""}`}
                        onClick={() => {
                          setSelectedCycle(index);
                          setView("fortune");
                        }}
                      >
                        <small>{cycle.from}–{cycle.to} tuổi</small>
                        <strong>{cycle.stem} {cycle.branch}</strong>
                        <small>{cycle.startYear}–{cycle.endYear}</small>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Can Chi Relations */}
                <div className="sgen-bazi-relations-wrap">
                  <b>Quan hệ Can Chi nguyên cục (Hợp · Xung · Hình · Hại · Phá)</b>
                  <div className="sgen-bazi-relations-chips">
                    {result.relations.length ? (
                      result.relations.map((relation, index) => (
                        <span
                          className={`sgen-bazi-relation-chip ${
                            relation.kind === "clash"
                              ? "is-clash"
                              : relation.kind === "harm"
                              ? "is-harm"
                              : ""
                          }`}
                          key={index}
                        >
                          <b>{relation.label}</b> · {relation.members.join(" – ")} ({relation.system})
                        </span>
                      ))
                    ) : (
                      <p style={{ margin: 0, color: "#6e6077", fontSize: "0.8rem" }}>
                        Nguyên cục không hình thành bộ hợp xung hình hại đặc biệt.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ĐẠI VẬN · LƯU NIÊN */}
            {view === "fortune" && (
              <div className="sgen-bazi-tab-panel">
                <header className="sgen-bazi-panel-heading">
                  <small>Chu kỳ vận trình</small>
                  <h3>Đại vận và Lưu niên</h3>
                  <p>Chọn một Đại vận thập niên để xem chi tiết mười năm Lưu niên tương ứng.</p>
                </header>

                <div className="sgen-bazi-luck-track" style={{ padding: "4px 0 12px" }}>
                  {result.luck.cycles.map((cycle, index) => (
                    <button
                      type="button"
                      key={index}
                      className={`sgen-bazi-luck-cycle-btn ${effectiveCycleIndex === index ? "is-current" : ""}`}
                      onClick={() => setSelectedCycle(index)}
                      style={{ flex: "0 0 125px" }}
                    >
                      <small>{cycle.from}–{cycle.to} tuổi</small>
                      <strong>{cycle.stem} {cycle.branch}</strong>
                      <small>{getTenGod(result.chart.dayMaster.stem, cycle.stem)}</small>
                      <small style={{ color: "#7a3cff" }}>{cycle.startYear}–{cycle.endYear}</small>
                    </button>
                  ))}
                </div>

                {activeCycle && (
                  <>
                    <div className="sgen-bazi-destiny-grid">
                      <article className="sgen-bazi-destiny-card">
                        <small>Đại vận đang chọn</small>
                        <strong>{activeCycle.stem} {activeCycle.branch}</strong>
                        <span>
                          {getTenGod(result.chart.dayMaster.stem, activeCycle.stem)} · Nạp âm: {getNaYin(activeCycle)}.
                          Can vận thuộc {activeCycle.stemElement}, chi {activeCycle.branch} thuộc {activeCycle.branchElement}.
                        </span>
                      </article>

                      <article className="sgen-bazi-destiny-card">
                        <small>Lưu niên năm xem {viewYear}</small>
                        <strong>{annualPillar.stem} {annualPillar.branch}</strong>
                        <span>
                          {getTenGod(result.chart.dayMaster.stem, annualPillar.stem)} · Nạp âm {annualPillar.branchElement}.
                          Năm xem tương ứng mệnh chủ {age} tuổi.
                        </span>
                      </article>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                      <b style={{ fontSize: "0.9rem", color: "#190847" }}>
                        Mười năm thuộc Đại vận {activeCycle.stem} {activeCycle.branch}
                      </b>
                      <button
                        type="button"
                        onClick={() => setShowAnnualDetail(!showAnnualDetail)}
                        style={{
                          padding: "6px 12px",
                          background: "#f3eefb",
                          border: "1px solid #e4d7f5",
                          borderRadius: 8,
                          color: "#5a22e8",
                          fontFamily: "inherit",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {showAnnualDetail ? "Thu gọn Can Chi" : "Hiện Can Chi chi tiết"}
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
                      {annualYears.map((year) => {
                        const ap = getAnnualPillar(year);
                        const isSel = viewYear === year;
                        return (
                          <button
                            type="button"
                            key={year}
                            onClick={() => setViewYear(year)}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 3,
                              padding: "10px 8px",
                              background: isSel ? "#5a22e8" : "#ffffff",
                              color: isSel ? "#ffffff" : "#17073d",
                              border: `1px solid ${isSel ? "#5a22e8" : "#e5daf5"}`,
                              borderRadius: 10,
                              cursor: "pointer",
                              textAlign: "center",
                              fontFamily: "inherit",
                            }}
                          >
                            <b style={{ fontSize: "0.85rem" }}>{year}</b>
                            {showAnnualDetail ? (
                              <>
                                <strong style={{ fontSize: "0.95rem", color: isSel ? "#ffffff" : "#5a22e8" }}>
                                  {ap.stem} {ap.branch}
                                </strong>
                                <small style={{ fontSize: "0.68rem", opacity: 0.85 }}>
                                  {getTenGod(result.chart.dayMaster.stem, ap.stem)}
                                </small>
                              </>
                            ) : (
                              <small style={{ fontSize: "0.72rem", opacity: 0.8 }}>
                                {year - birthYear + 1} tuổi
                              </small>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB 3: PHÂN TÍCH CẤU TRÚC */}
            {view === "analysis" && (
              <div className="sgen-bazi-tab-panel">
                <header className="sgen-bazi-panel-heading">
                  <small>Nguyên lý sinh khắc</small>
                  <h3>Phân tích Ngũ hành & Mệnh cục</h3>
                  <p>Định lượng ngũ hành nguyên cục, phân bổ khí và mức độ hòa hợp của Nhật chủ.</p>
                </header>

                <div className="sgen-bazi-elements-grid">
                  <b style={{ fontSize: "0.9rem", color: "#190847", marginBottom: 4 }}>
                    Tỷ trọng Ngũ hành nguyên cục
                  </b>
                  {result.balance.map((item) => (
                    <div className="sgen-bazi-element-row" key={item.element}>
                      <span className={getElementColorClass(item.element)}>{item.element}</span>
                      <div className="sgen-bazi-bar-track">
                        <div
                          className="sgen-bazi-bar-fill"
                          style={{ width: `${Math.max(item.percent, 4)}%` }}
                        />
                      </div>
                      <span style={{ textAlign: "right", color: "#17073d" }}>{item.percent}%</span>
                    </div>
                  ))}
                </div>

                <div className="sgen-bazi-destiny-grid">
                  <article className="sgen-bazi-destiny-card">
                    <small>Vượng suy</small>
                    <strong>{result.support.status}</strong>
                    <span>Điểm vượng suy {result.support.strengthScore}/100</span>
                  </article>
                  <article className="sgen-bazi-destiny-card">
                    <small>Dụng thần</small>
                    <strong>{result.support.usefulElement}</strong>
                    <span>Điều hòa toàn cục</span>
                  </article>
                  <article className="sgen-bazi-destiny-card">
                    <small>Điều hậu</small>
                    <strong>{result.temperature.label}</strong>
                    <span>{result.temperature.state}</span>
                  </article>
                </div>
              </div>
            )}

            {/* TAB 4: TỔNG KẾT AI */}
            {view === "ai" && (
              <div className="sgen-bazi-tab-panel">
                <header className="sgen-bazi-panel-heading">
                  <small>Trợ lý AI</small>
                  <h3>Dữ liệu Markdown Bát Tự cho AI</h3>
                  <p>
                    Sao chép toàn bộ dữ kiện có cấu trúc chuẩn bên dưới để dán vào ChatGPT, Claude hoặc Gemini nhận bài luận giải chi tiết.
                  </p>
                </header>

                <button type="button" className="sgen-bazi-copy-btn" onClick={copyMarkdown}>
                  <ClipboardCopy size={16} /> Sao chép Markdown Tứ Trụ
                </button>

                <textarea
                  className="sgen-bazi-ai-textarea"
                  rows={16}
                  readOnly
                  value={chartMarkdown}
                />
              </div>
            )}

            {/* TAB 5: GHI CHÚ */}
            {view === "notes" && (
              <div className="sgen-bazi-tab-panel">
                <header className="sgen-bazi-panel-heading">
                  <small>Nhật ký cá nhân</small>
                  <h3>Ghi chú cho lá số {submitted.name}</h3>
                  <p>Ghi lại các mốc nghiệm chứng, ghi chú đối chiếu cá nhân. Dữ liệu lưu trong trình duyệt của bạn.</p>
                </header>

                <textarea
                  className="sgen-bazi-ai-textarea"
                  rows={12}
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    try {
                      localStorage.setItem(`sgen_bazi_note_${submitted.name}`, e.target.value);
                    } catch {}
                  }}
                  placeholder="Ghi lại các giả thuyết hoặc mốc nghiệm chứng cuộc đời cho lá số này..."
                />
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: 40, textAlign: "center", color: "#6c5e85" }}>
            <p>Đang chuẩn bị dữ liệu lá số...</p>
          </div>
        )}
      </main>
    </div>
  );
}
