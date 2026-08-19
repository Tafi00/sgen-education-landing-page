import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarCheck,
  Check,
  CircleAlert,
  Clock3,
  Coins,
  Compass,
  Flame,
  LayoutGrid,
  Leaf,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Waves,
  X,
} from "lucide-react";
import ichingArtwork from "../../../assets/fengshui/iching-cosmic-v1.webp";
import baziArtwork from "../../../assets/fengshui/bazi-cosmic-v1.webp";
import calendarArtwork from "../../../assets/fengshui/auspicious-calendar-cosmic-v1.webp";
import {
  getBaziRelations,
  getBaziSupportProfile,
  getDateProfile,
  getElementBalance,
  getFourPillars,
  getHexagram,
  getHiddenStems,
  getLifeStage,
  getLuckCycles,
  getNaYin,
  getPersonalDayCompatibility,
  getSolarTerm,
  getTenGod,
  type ElementName,
} from "../../lib/menh-thu/metaphysics";

type FengShuiTool = "iching" | "bazi" | "calendar";

const tools = [
  {
    id: "iching" as const,
    title: "Gieo quẻ Kinh Dịch",
    description: "Tung ba đồng xu sáu lần, lập quẻ chủ, hào động và quẻ biến.",
    image: ichingArtwork,
    icon: Coins,
    category: "Dịch học",
    meta: "64 quẻ · 6 hào",
  },
  {
    id: "bazi" as const,
    title: "Tứ Trụ Bát Tự",
    description: "Lập bốn trụ theo tiết khí và hiệu chỉnh giờ Mặt Trời tại Việt Nam.",
    image: baziArtwork,
    icon: LayoutGrid,
    category: "Mệnh lý",
    meta: "Tứ trụ · Đại vận",
  },
  {
    id: "calendar" as const,
    title: "Lịch ngày tốt",
    description: "Tra cát hung, Thập nhị Trực, Nhị thập bát tú và giờ hoàng đạo.",
    image: calendarArtwork,
    icon: CalendarCheck,
    category: "Lịch pháp",
    meta: "Ngày giờ · Hợp tuổi",
  },
];

const elementIcons: Record<ElementName, typeof Flame> = {
  Mộc: Leaf,
  Hỏa: Flame,
  Thổ: Compass,
  Kim: Sparkles,
  Thủy: Waves,
};

const elementClasses: Record<ElementName, string> = {
  Mộc: "wood",
  Hỏa: "fire",
  Thổ: "earth",
  Kim: "metal",
  Thủy: "water",
};

const pillarLabels = ["Trụ năm", "Trụ tháng", "Trụ ngày", "Trụ giờ"];

function localDateValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function qualityClass(score: number) {
  if (score >= 65) return "good";
  if (score >= 45) return "neutral";
  return "caution";
}

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

function IChingTool() {
  const [question, setQuestion] = useState("");
  const [lines, setLines] = useState<number[]>([]);
  const [faces, setFaces] = useState<boolean[]>([]);
  const [casting, setCasting] = useState(false);
  const result = useMemo(() => lines.length === 6 ? getHexagram(lines) : null, [lines]);

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
    <div className="fengshui-tool-layout fengshui-tool-layout--iching">
      <div className="fengshui-form-card">
        <span className="fengshui-kicker"><Coins /> Nghi thức lập quẻ</span>
        <h3>Giữ một câu hỏi, gieo đủ sáu hào</h3>
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
        <p className="fengshui-method-note"><ShieldCheck /> Mỗi lần gieo dùng số ngẫu nhiên bảo mật của trình duyệt; hào được lập từ dưới lên.</p>
      </div>

      <div className="fengshui-result-card">
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
          </div>
        )}
      </div>
    </div>
  );
}

type BaziResult = {
  chart: ReturnType<typeof getFourPillars>;
  balance: ReturnType<typeof getElementBalance>;
  support: ReturnType<typeof getBaziSupportProfile>;
  relations: ReturnType<typeof getBaziRelations>;
  luck: ReturnType<typeof getLuckCycles>;
  name: string;
  gender: "Nam" | "Nữ";
};

function BaziTool() {
  const [result, setResult] = useState<BaziResult | null>(null);
  const [error, setError] = useState("");

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const gender = String(data.get("gender")) as "Nam" | "Nữ";
    const date = String(data.get("date"));
    const time = String(data.get("time"));
    try {
      const chart = getFourPillars(date, time, 105.8333, 7, "apparent");
      setResult({
        chart,
        balance: getElementBalance(chart.pillars),
        support: getBaziSupportProfile(chart.pillars),
        relations: getBaziRelations(chart.pillars),
        luck: getLuckCycles(date, time, gender, 105.8333, 7, "apparent"),
        name,
        gender,
      });
      setError("");
    } catch {
      setError("Không thể lập lá số từ dữ liệu này. Vui lòng kiểm tra ngày và giờ sinh.");
    }
  };

  return (
    <div className="fengshui-tool-layout fengshui-tool-layout--bazi">
      <form className="fengshui-form-card" onSubmit={submit}>
        <span className="fengshui-kicker"><LayoutGrid /> Hồ sơ mệnh chủ</span>
        <h3>Lập Tứ Trụ Bát Tự</h3>
        <div className="fengshui-fields">
          <label className="is-wide"><span>Họ và tên</span><input name="name" placeholder="Nhập họ tên" required /></label>
          <label><span>Giới tính</span><select name="gender" defaultValue="Nam"><option>Nam</option><option>Nữ</option></select></label>
          <label><span>Ngày sinh dương lịch</span><input name="date" type="date" required /></label>
          <label><span>Giờ sinh</span><input name="time" type="time" defaultValue="12:00" required /></label>
          <label><span>Vị trí / múi giờ</span><input value="Việt Nam · UTC+7" readOnly /></label>
        </div>
        <button className="fengshui-primary-action" type="submit"><Sparkles /> Lập lá số</button>
        <p className="fengshui-method-note"><Clock3 /> Giờ sinh được hiệu chỉnh theo kinh độ Hà Nội và phương trình thời gian trước khi an trụ.</p>
        {error && <p className="fengshui-error" role="alert"><CircleAlert /> {error}</p>}
      </form>

      <div className="fengshui-result-card">
        {!result ? <div className="fengshui-empty fengshui-empty--large"><LayoutGrid /><h3>Chưa lập lá số</h3><p>Nhập ngày giờ sinh để xem Nhật chủ, ngũ hành, quan hệ Can Chi và Đại vận.</p></div> : <>
          <div className="fengshui-result-card__heading">
            <div><small>{result.gender} mệnh · {result.name}</small><h3>Nhật chủ {result.chart.dayMaster.stem} {result.chart.dayMaster.branch}</h3></div>
            <span>{result.support.status}</span>
          </div>

          <div className="bazi-pillars">
            {result.chart.pillars.map((pillar, index) => (
              <article className={`element-${elementClasses[pillar.stemElement]}`} key={`${pillar.stem}-${pillar.branch}-${index}`}>
                <small>{pillarLabels[index]}</small>
                <strong>{pillar.stem}</strong>
                <strong>{pillar.branch}</strong>
                <b>{index === 2 ? "Nhật chủ" : getTenGod(result.chart.dayMaster.stem, pillar.stem)}</b>
                <span>{getNaYin(pillar)}</span>
                <span>Tàng can: {getHiddenStems(pillar.branch).join(" · ") || "—"}</span>
                <span>{getLifeStage(result.chart.dayMaster.stem, pillar.branch)}</span>
              </article>
            ))}
          </div>

          <section className="bazi-analysis">
            <div className="element-balance">
              <h4>Cân bằng ngũ hành</h4>
              {result.balance.map((item) => {
                const Icon = elementIcons[item.element];
                return <div key={item.element}><span><Icon /> {item.element}</span><i><em style={{ width: `${Math.min(100, item.percent)}%` }} /></i><b>{item.percent}%</b></div>;
              })}
            </div>
            <article className="bazi-support">
              <small>Vượng suy Nhật chủ</small>
              <h4>{result.support.status} · {result.support.strengthScore}/100</h4>
              <p>{result.support.explanation}</p>
              <div><span>Dụng thần gợi ý <b>{result.support.usefulElement}</b></span><span>Hỷ thần <b>{result.support.joyElement}</b></span></div>
            </article>
          </section>

          <section className="bazi-relations">
            <h4>Quan hệ Can Chi</h4>
            <div>{result.relations.length ? result.relations.map((relation, index) => <span className={`is-${relation.kind}`} key={`${relation.label}-${index}`}><b>{relation.label}</b> {relation.members.join(" · ")}</span>) : <span>Không có quan hệ hợp/xung nổi bật trong bốn trụ.</span>}</div>
          </section>

          <section className="bazi-luck">
            <div><small>Khởi Đại vận</small><b>{result.luck.start.year} năm {result.luck.start.month} tháng</b><span>{result.luck.forward ? "Thuận hành" : "Nghịch hành"}</span></div>
            <ol>{result.luck.cycles.map((cycle) => <li key={`${cycle.stem}-${cycle.branch}-${cycle.from}`}><small>{cycle.from}–{cycle.to} tuổi</small><b>{cycle.stem} {cycle.branch}</b><span>{cycle.startYear}–{cycle.endYear}</span></li>)}</ol>
          </section>

          <p className="fengshui-method-note"><Clock3 /> Giờ dân dụng {result.chart.calculation.civilTime} → giờ Mặt Trời thực {result.chart.calculation.apparentSolarTime} · tiết {result.chart.calculation.solarTerm}.</p>
        </>}
      </div>
    </div>
  );
}

function CalendarTool() {
  const today = useMemo(localDateValue, []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const profile = useMemo(() => getDateProfile(selectedDate), [selectedDate]);
  const compatibility = useMemo(
    () => birthDate ? getPersonalDayCompatibility(selectedDate, birthDate, profile, birthTime) : null,
    [birthDate, birthTime, profile, selectedDate],
  );
  const bestHours = [...profile.hours].sort((a, b) => b.score - a.score).slice(0, 4);

  return (
    <div className="fengshui-tool-layout fengshui-tool-layout--calendar">
      <div className="fengshui-form-card">
        <span className="fengshui-kicker"><CalendarCheck /> Lịch vạn sự</span>
        <h3>Chọn ngày cần tra cứu</h3>
        <div className="fengshui-fields fengshui-fields--single">
          <label><span>Ngày dương lịch</span><input type="date" value={selectedDate} onInput={(event) => setSelectedDate(event.currentTarget.value)} onChange={(event) => setSelectedDate(event.target.value)} /></label>
          <label><span>Ngày sinh để đối chiếu tuổi <em>(tùy chọn)</em></span><input type="date" value={birthDate} max={today} onInput={(event) => setBirthDate(event.currentTarget.value)} onChange={(event) => setBirthDate(event.target.value)} /></label>
          <label><span>Giờ sinh</span><input type="time" value={birthTime} onInput={(event) => setBirthTime(event.currentTarget.value)} onChange={(event) => setBirthTime(event.target.value)} /></label>
        </div>
        <div className={`calendar-energy is-${qualityClass(profile.energyScore)}`}>
          <span style={{ "--score": `${profile.energyScore * 3.6}deg` } as React.CSSProperties}><b>{profile.energyScore}</b><small>/100</small></span>
          <div><small>Năng lượng tổng quan</small><h3>{profile.energyLabel}</h3><p>{profile.energyQuote}</p></div>
        </div>
        {compatibility && <div className={`calendar-compatibility is-${compatibility.verdict === "Xung tuổi" ? "caution" : compatibility.score >= 64 ? "good" : "neutral"}`}>
          <b>{compatibility.score}/100 · {compatibility.verdict}</b>
          <span>Tuổi {compatibility.birthYearPillar.stem} {compatibility.birthYearPillar.branch} · {compatibility.lunarAge} tuổi mụ</span>
          <p>{compatibility.reasons.map((reason) => reason.label).join(" · ")}</p>
        </div>}
        <p className="fengshui-method-note"><ShieldCheck /> Điểm ngày dựa trên cát/hung thần, Trực, Tú và thần trực; không dùng điểm ngẫu nhiên.</p>
      </div>

      <div className="fengshui-result-card calendar-reading">
        <div className="fengshui-result-card__heading">
          <div><small>Âm lịch {profile.lunarDate.day}/{profile.lunarDate.month}{profile.lunarDate.leap ? " nhuận" : ""}</small><h3>{profile.pillar.stem} {profile.pillar.branch} · {getSolarTerm(selectedDate)}</h3></div>
          <span>{profile.dayOfficerType}</span>
        </div>

        <div className="calendar-pillars">
          <article><small>Năm</small><b>{profile.yearPillar.stem} {profile.yearPillar.branch}</b></article>
          <article><small>Tháng</small><b>{profile.monthPillar.stem} {profile.monthPillar.branch}</b></article>
          <article><small>Ngày</small><b>{profile.pillar.stem} {profile.pillar.branch}</b></article>
          <article><small>Thần trực</small><b>{profile.dayOfficerName}</b></article>
        </div>

        <div className="calendar-facts">
          <article><small>Thập nhị Trực</small><h4>Trực {profile.dayOfficer}</h4><p>{profile.officerDescription}</p></article>
          <article><small>Nhị thập bát tú</small><h4>Sao {profile.lunarMansion} · {profile.lunarMansionLuck}</h4><p>{profile.mansionDescription}</p></article>
        </div>

        <div className="calendar-stars">
          <section className="is-good"><h4><Check /> Cát tinh</h4><p>{profile.goodStars.length ? profile.goodStars.map((star) => <span key={star}>{star}</span>) : <span>Không ghi nhận cát tinh riêng</span>}</p></section>
          <section className="is-bad"><h4><CircleAlert /> Hung tinh</h4><p>{profile.badStars.length ? profile.badStars.map((star) => <span key={star}>{star}</span>) : <span>Không ghi nhận hung tinh riêng</span>}</p></section>
        </div>

        <section className="calendar-hours">
          <h4><Clock3 /> Giờ nên ưu tiên</h4>
          <div>{bestHours.map((hour) => <article key={`${hour.stem}-${hour.branch}`}><b>{hour.stem} {hour.branch}</b><span>{hour.range}</span><strong>{hour.score} điểm</strong><small>{hour.auspicious ? "Hoàng đạo" : hour.officer}</small></article>)}</div>
        </section>

        <div className="calendar-prescriptions">
          <section><h4>Việc nên</h4><p>{profile.dayYi.map((item) => <span key={item}>{item}</span>)}</p></section>
          <section><h4>Việc kỵ</h4><p>{profile.dayJi.map((item) => <span key={item}>{item}</span>)}</p></section>
        </div>

        {profile.activities.length > 0 && <section className="calendar-activities">
          <h4>Gợi ý theo loại việc</h4>
          <div>{profile.activities.slice(0, 8).map((activity) => <article className={`is-${activity.status}`} key={activity.name}><span>{activity.status === "suitable" ? <Check /> : activity.status === "avoid" ? <X /> : <CircleAlert />}</span><div><b>{activity.name}</b><small>{activity.guidance}</small></div><strong>{activity.score}</strong></article>)}</div>
        </section>}

        <div className="calendar-directions"><span>Hỷ thần <b>{profile.joyDirection}</b></span><span>Tài thần <b>{profile.wealthDirection}</b></span><span>Xung sát <b>{profile.clashDescription}</b></span></div>
      </div>
    </div>
  );
}

export function FengShuiTools() {
  const [activeTool, setActiveTool] = useState<FengShuiTool | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const openTool = (tool: FengShuiTool) => {
    setActiveTool(tool);
    window.requestAnimationFrame(() => workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="fengshui-tools">
      <div className="fengshui-feature-grid">
        {tools.map(({ id, title, description, image, icon: Icon, category, meta }, index) => (
          <article className={activeTool === id ? "is-active" : ""} key={id}>
            <button className="fengshui-feature-card" type="button" onClick={() => openTool(id)} aria-pressed={activeTool === id}>
              <div className="fengshui-feature-card__art">
                <img src={image} alt="" loading="lazy" />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="fengshui-feature-card__body">
                <div className="fengshui-feature-card__label"><Icon /><span>{category}</span></div>
                <h3>{title}</h3>
                <p>{description}</p>
                <footer><span>{meta}</span><b>Mở <ArrowRight /></b></footer>
              </div>
            </button>
          </article>
        ))}
      </div>

      <div className={`fengshui-workspace ${activeTool ? "is-open" : ""}`} ref={workspaceRef}>
        {activeTool && <>
          <header>
            <div><small>Công cụ đang mở</small><h2>{tools.find((tool) => tool.id === activeTool)?.title}</h2></div>
            <button type="button" onClick={() => setActiveTool(null)} aria-label="Đóng công cụ"><X /></button>
          </header>
          {activeTool === "iching" && <IChingTool />}
          {activeTool === "bazi" && <BaziTool />}
          {activeTool === "calendar" && <CalendarTool />}
        </>}
      </div>
    </div>
  );
}
