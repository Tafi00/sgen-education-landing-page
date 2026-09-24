import { useMemo, useState, type CSSProperties } from "react";
import { BookOpen, CalendarCheck, Check, CircleAlert, Clock3, Compass, ShieldCheck, X } from "lucide-react";
import { getDateProfile, getDayAgeRelations, getFourPillars, getNaYin, getPersonalDayCompatibility, getSolarTerm } from "../../../shared/menh-thu/metaphysics";
import { Lunar, Solar } from "lunar-javascript";

export type CalendarToolViewProps = {
  /** Câu hỏi gợi ý — công cụ xem ngày không dùng trường này, giữ để đồng nhất giao diện prop. */
  defaultQuestion?: string;
  /** Chế độ gọn: ẩn phần tiêu đề lịch vạn sự và ghi chú phương pháp trong thẻ nhập liệu. */
  compact?: boolean;
  /** Ngày dương lịch đang chọn (YYYY-MM-DD). Truyền vào khi trang cha cần điều khiển. */
  date?: string;
  /** Gọi mỗi khi ngày tra cứu thay đổi, để trang cha đồng bộ bảng giờ và nút chọn nhanh. */
  onDateChange?: (date: string) => void;
};

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

const NINE_STAR_NAMES: Record<string, string> = {
  "一": "Nhất Bạch", "二": "Nhị Hắc", "三": "Tam Bích", "四": "Tứ Lục", "五": "Ngũ Hoàng",
  "六": "Lục Bạch", "七": "Thất Xích", "八": "Bát Bạch", "九": "Cửu Tử",
};
const CHINESE_BRANCHES: Record<string, string> = {
  子: "Tý", 丑: "Sửu", 寅: "Dần", 卯: "Mão", 辰: "Thìn", 巳: "Tị",
  午: "Ngọ", 未: "Mùi", 申: "Thân", 酉: "Dậu", 戌: "Tuất", 亥: "Hợi",
};
function localizeBranches(value: string) {
  return [...value].map((branch) => CHINESE_BRANCHES[branch] ?? branch).join(" · ");
}

function tamSatDirections(branch: string) {
  if (["Thân", "Tý", "Thìn"].includes(branch)) return "Đông Nam · Chính Nam · Tây Nam";
  if (["Dần", "Ngọ", "Tuất"].includes(branch)) return "Tây Bắc · Chính Bắc · Đông Bắc";
  if (["Tị", "Dậu", "Sửu"].includes(branch)) return "Đông Bắc · Chính Đông · Đông Nam";
  return "Tây Nam · Chính Tây · Tây Bắc";
}

/**
 * Công cụ tra ngày tốt xấu theo lịch pháp Việt Nam, tách từ `FengShuiTools` để dùng
 * độc lập trên trang `/cong-cu-phong-thuy/xem-ngay`. Ngoài chế độ tự quản lý ngày như
 * bản gốc, công cụ nhận thêm cặp prop `date`/`onDateChange` để trang cha điều khiển.
 */
export function CalendarToolView({ compact = false, date, onDateChange }: CalendarToolViewProps) {
  const today = useMemo(localDateValue, []);
  const [internalDate, setInternalDate] = useState(today);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("12:00");
  const [viewTime, setViewTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [dateMode, setDateMode] = useState<"solar" | "lunar">("solar");
  const [lunarError, setLunarError] = useState("");
  const selectedDate = date ?? internalDate;
  const updateDate = (next: string) => {
    setInternalDate(next);
    onDateChange?.(next);
  };
  const profile = useMemo(() => getDateProfile(selectedDate), [selectedDate]);
  const lunar = useMemo(() => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    return Solar.fromYmd(year, month, day).getLunar();
  }, [selectedDate]);
  const [lunarEntry, setLunarEntry] = useState<{ day: number; month: number; year: number; leap: boolean } | null>(null);
  const lunarFields = lunarEntry ?? { day: lunar.getDay(), month: Math.abs(lunar.getMonth()), year: lunar.getYear(), leap: lunar.getMonth() < 0 };
  const changeLunar = (next: typeof lunarFields) => {
    setLunarEntry(next);
    setLunarError("");
    try {
      const solar = Lunar.fromYmd(next.year, next.leap ? -next.month : next.month, next.day).getSolar();
      const checked = solar.getLunar();
      if (checked.getYear() !== next.year || checked.getMonth() !== (next.leap ? -next.month : next.month) || checked.getDay() !== next.day) throw new Error("invalid lunar date");
      updateDate(`${solar.getYear()}-${String(solar.getMonth()).padStart(2, "0")}-${String(solar.getDay()).padStart(2, "0")}`);
      setLunarEntry(null);
    } catch {
      setLunarError("Ngày âm lịch này không tồn tại. Vui lòng kiểm tra ngày hoặc tháng nhuận.");
    }
  };
  const hours = profile.hours;
  const viewingHour = useMemo(() => hours.find((hour) => {
    const start = Number(hour.range.slice(0, 2));
    const end = Number(hour.range.slice(-5, -3));
    const current = Number(viewTime.slice(0, 2));
    return start > end ? current >= start || current < end : current >= start && current < end;
  }) ?? hours[0], [hours, viewTime]);
  const selectedLunarTime = useMemo(() => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const [hour, minute] = viewTime.split(":").map(Number);
    return Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar();
  }, [selectedDate, viewTime]);
  const nineStar = selectedLunarTime as unknown as {
    getYearNineStar(): { getNumber(): string; getNameInXuanKong(): string };
    getMonthNineStar(): { getNumber(): string; getNameInXuanKong(): string };
    getDayNineStar(): { getNumber(): string; getNameInXuanKong(): string };
    getTimeNineStar(): { getNumber(): string; getNameInXuanKong(): string };
    getDayXunKong(): string;
    getTimeXunKong(): string;
  };
  const starRows = [
    ["Năm", nineStar.getYearNineStar()], ["Tháng", nineStar.getMonthNineStar()],
    ["Ngày", nineStar.getDayNineStar()], ["Giờ", nineStar.getTimeNineStar()],
  ] as const;
  const ageRelations = useMemo(() => getDayAgeRelations(profile), [profile]);
  const monthAgeRelations = useMemo(() => getDayAgeRelations({ ...profile, pillar: profile.monthPillar, ageRelationsOverride: undefined }), [profile]);
  const solarTerm = useMemo(() => getSolarTerm(selectedDate), [selectedDate]);
  // Nạp âm của trụ ngày: an bốn trụ tại 12:00 để lấy Can Chi ngày, rồi tra bảng nạp âm.
  const dayNaYin = useMemo(() => getNaYin(getFourPillars(selectedDate, "12:00").pillars[2]), [selectedDate]);
  const compatibility = useMemo(
    () => birthDate ? getPersonalDayCompatibility(selectedDate, birthDate, profile, birthTime) : null,
    [birthDate, birthTime, profile, selectedDate],
  );

  return (
    <div className="fengshui-tool-layout fengshui-tool-layout--calendar">
      <aside className="calendar-top-card calendar-top-card--overview">
        <h3>Tổng quan</h3>
        <dl>
          <div><dt>Giờ đang xem</dt><dd>{viewTime} · {viewingHour.stem} {viewingHour.branch}</dd></div>
          <div><dt>Nạp âm ngày</dt><dd>{dayNaYin}</dd></div>
          <div><dt>Thập nhị Trực</dt><dd>Trực {profile.dayOfficer}</dd></div>
          <div><dt>Kiết hung nhật</dt><dd>{profile.dayOfficerName} · {profile.dayOfficerType}</dd></div>
          <div><dt>Nhị thập bát tú</dt><dd>{profile.lunarMansion} · {profile.lunarMansionLuck}</dd></div>
          <div><dt>Can Chi ngày</dt><dd>{profile.pillar.stem} {profile.pillar.branch}</dd></div>
        </dl>
      </aside>
      <div className="fengshui-form-card">
        {!compact && <span className="fengshui-kicker"><CalendarCheck /> Lịch vạn sự</span>}
        {!compact && <h3>Công cụ xem ngày tốt, xấu</h3>}
        <div className="calendar-date-tabs" role="tablist" aria-label="Chọn loại lịch">
          <button type="button" role="tab" aria-selected={dateMode === "solar"} className={dateMode === "solar" ? "is-active" : ""} onClick={() => setDateMode("solar")}>Dương lịch</button>
          <button type="button" role="tab" aria-selected={dateMode === "lunar"} className={dateMode === "lunar" ? "is-active" : ""} onClick={() => setDateMode("lunar")}>Âm lịch</button>
        </div>
        <div className="calendar-date-entry">
          {dateMode === "solar" ? <label><span>Ngày dương lịch</span><input type="date" value={selectedDate} onChange={(event) => { if (event.target.value) updateDate(event.target.value); }} /></label> : <div className="calendar-lunar-entry">
            <label><span>Ngày</span><input aria-label="Ngày âm lịch" type="number" min="1" max="30" value={lunarFields.day} onChange={(event) => changeLunar({ ...lunarFields, day: Number(event.target.value) })} /></label>
            <label><span>Tháng</span><input aria-label="Tháng âm lịch" type="number" min="1" max="12" value={lunarFields.month} onChange={(event) => changeLunar({ ...lunarFields, month: Number(event.target.value) })} /></label>
            <label><span>Năm</span><input aria-label="Năm âm lịch" type="number" min="1900" max="2100" value={lunarFields.year} onChange={(event) => changeLunar({ ...lunarFields, year: Number(event.target.value) })} /></label>
            <label className="calendar-lunar-leap"><input type="checkbox" checked={lunarFields.leap} onChange={(event) => changeLunar({ ...lunarFields, leap: event.target.checked })} /><span>Tháng nhuận</span></label>
          </div>}
          <label><span>Giờ đang xem</span><input type="time" value={viewTime} onChange={(event) => setViewTime(event.target.value)} /></label>
        </div>
        {lunarError && <p className="calendar-date-error" role="alert">{lunarError}</p>}
        <p className="calendar-date-summary">Dương lịch {selectedDate.split("-").reverse().join("/")} · Âm lịch {lunar.getDay()}/{Math.abs(lunar.getMonth())}/{lunar.getYear()}{lunar.getMonth() < 0 ? " nhuận" : ""}</p>
        <div className="calendar-current-pillars">
          <span><small>Năm</small><b>{profile.yearPillar.stem} {profile.yearPillar.branch}</b></span>
          <span><small>Tháng</small><b>{profile.monthPillar.stem} {profile.monthPillar.branch}</b></span>
          <span><small>Ngày</small><b>{profile.pillar.stem} {profile.pillar.branch}</b></span>
          <span><small>Giờ</small><b>{viewingHour.stem} {viewingHour.branch}</b></span>
        </div>
        <details className="calendar-personal-fields">
          <summary>Đối chiếu thêm với tuổi của tôi</summary>
          <div className="fengshui-fields fengshui-fields--single">
            <label><span>Ngày sinh</span><input type="date" value={birthDate} max={today} onInput={(event) => setBirthDate(event.currentTarget.value)} onChange={(event) => setBirthDate(event.target.value)} /></label>
            <label><span>Giờ sinh</span><input type="time" value={birthTime} onInput={(event) => setBirthTime(event.currentTarget.value)} onChange={(event) => setBirthTime(event.target.value)} /></label>
          </div>
          {compatibility && <div className={`calendar-compatibility is-${compatibility.verdict === "Xung tuổi" ? "caution" : compatibility.score >= 64 ? "good" : "neutral"}`}>
            <b>{compatibility.score}/100 · {compatibility.verdict}</b>
            <span>Tuổi {compatibility.birthYearPillar.stem} {compatibility.birthYearPillar.branch} · {compatibility.lunarAge} tuổi mụ</span>
            <p>{compatibility.reasons.map((reason) => reason.label).join(" · ")}</p>
          </div>}
        </details>
        <div className={`calendar-energy is-${qualityClass(profile.energyScore)}`}>
          <span style={{ "--score": `${profile.energyScore * 3.6}deg` } as CSSProperties}><b>{profile.energyScore}</b><small>/100</small></span>
          <div><small>Năng lượng tổng quan</small><h3>{profile.energyLabel}</h3><p>{profile.energyQuote}</p></div>
        </div>
        {!compact && <p className="fengshui-method-note"><ShieldCheck /> Điểm ngày dựa trên cát/hung thần, Trực, Tú và thần trực; không dùng điểm ngẫu nhiên.</p>}
      </div>

      <aside className="calendar-top-card calendar-top-card--details">
        <h3>Thông tin</h3>
        <dl>
          {starRows.map(([label, star]) => <div key={label}><dt>{label} Cửu tinh</dt><dd>{NINE_STAR_NAMES[star.getNumber()] ?? star.getNumber()}</dd></div>)}
          <div><dt>Giờ Lục Nhâm</dt><dd>{viewingHour.sixRen.name}</dd></div>
          <div><dt>Tiết khí</dt><dd>{solarTerm}</dd></div>
          <div><dt>Ngày xuất hành</dt><dd>{profile.dayYi.includes("Xuất hành") ? "Có trong việc nên" : profile.dayJi.includes("Xuất hành") ? "Có trong việc kỵ" : "Đối chiếu theo loại việc"}</dd></div>
          <div><dt>Không vong</dt><dd>Ngày {localizeBranches(nineStar.getDayXunKong())} · giờ {localizeBranches(nineStar.getTimeXunKong())}</dd></div>
        </dl>
      </aside>

      <div className="fengshui-result-card calendar-reading">
        <div className="fengshui-result-card__heading">
          <div><small>Âm lịch {profile.lunarDate.day}/{profile.lunarDate.month}{profile.lunarDate.leap ? " nhuận" : ""}</small><h3>{profile.pillar.stem} {profile.pillar.branch} · {solarTerm}</h3></div>
          <span>{profile.dayOfficerType}</span>
        </div>

        <div className="calendar-pillars">
          <article><small>Năm</small><b>{profile.yearPillar.stem} {profile.yearPillar.branch}</b></article>
          <article><small>Tháng</small><b>{profile.monthPillar.stem} {profile.monthPillar.branch}</b></article>
          <article><small>Ngày</small><b>{profile.pillar.stem} {profile.pillar.branch}</b></article>
          <article><small>Thần trực</small><b>{profile.dayOfficerName}</b></article>
        </div>

        <nav className="calendar-section-nav" aria-label="Các mục xem ngày">
          <a href="#xem-ngay-thong-tin">Thông tin ngày</a>
          <a href="#xem-ngay-sao">Kiết tinh · Hung tinh</a>
          <a href="#xem-ngay-gio">Giờ trong ngày</a>
          <a href="#xem-ngay-viec">Việc nên · kỵ</a>
        </nav>

        <section className="calendar-info" id="xem-ngay-thong-tin">
          <h4><CalendarCheck /> Thông tin ngày</h4>
          <dl className="calendar-info-grid">
            <div><dt>Can chi năm</dt><dd>{profile.yearPillar.stem} {profile.yearPillar.branch}</dd></div>
            <div><dt>Can chi tháng</dt><dd>{profile.monthPillar.stem} {profile.monthPillar.branch}</dd></div>
            <div><dt>Can chi ngày</dt><dd>{profile.pillar.stem} {profile.pillar.branch}</dd></div>
            <div><dt>Nạp âm ngày</dt><dd>{dayNaYin}</dd></div>
            <div><dt>Tiết khí</dt><dd>{solarTerm}</dd></div>
            <div><dt>Ngày âm lịch</dt><dd>{profile.lunarDate.day}/{profile.lunarDate.month}{profile.lunarDate.leap ? " nhuận" : ""} · năm {profile.lunarDate.year}</dd></div>
            {profile.indicators.map((indicator) => <div key={indicator.label}><dt>{indicator.label}</dt><dd>{indicator.value}</dd></div>)}
          </dl>
        </section>

        <section className="calendar-reference-grid">
          <article><h4>Tam sát niên</h4><p>{tamSatDirections(profile.yearPillar.branch)}</p><small>Theo Địa chi năm.</small></article>
          <article><h4>Tam sát nguyệt</h4><p>{tamSatDirections(profile.monthPillar.branch)}</p><small>Theo Địa chi tháng tiết khí.</small></article>
          <article><h4>Tam sát nhật</h4><p>{tamSatDirections(profile.pillar.branch)}</p><small>Theo Địa chi ngày.</small></article>
          <article><h4>Tam sát thời</h4><p>{tamSatDirections(viewingHour.branch)}</p><small>Theo Địa chi giờ đang xem.</small></article>
          <article><h4>Tuổi xung khắc với ngày</h4><p>{ageRelations.conflicting.slice(0, 4).join(" · ") || "Không ghi nhận"}</p>{ageRelations.conflicting.length > 4 && <details><summary>Xem thêm tuổi xung</summary><small>{ageRelations.conflicting.slice(4).join(" · ")}</small></details>}<small>Đối chiếu Can Chi ngày.</small></article>
          <article><h4>Tuổi xung khắc với tháng</h4><p>{monthAgeRelations.conflicting.slice(0, 4).join(" · ") || "Không ghi nhận"}</p>{monthAgeRelations.conflicting.length > 4 && <details><summary>Xem thêm tuổi xung</summary><small>{monthAgeRelations.conflicting.slice(4).join(" · ")}</small></details>}<small>Đối chiếu Can Chi tháng.</small></article>
          <article><h4>Giờ đang xem</h4><p>{viewingHour.branch} · {viewingHour.range}</p><small>{viewingHour.auspicious ? "Giờ hoàng đạo" : "Giờ hắc đạo"} · Lục Nhâm {viewingHour.sixRen.name}</small></article>
          <article><h4>Giờ không vong</h4><p>{localizeBranches(nineStar.getTimeXunKong())}</p><small>Theo tuần Không Vong của giờ đã chọn.</small></article>
        </section>

        <div className="calendar-facts">
          <article><small>Thập nhị Trực</small><h4>Trực {profile.dayOfficer}</h4><p>{profile.officerDescription}</p></article>
          <article>
            <small>Nhị thập bát tú</small>
            <h4>Sao {profile.lunarMansion} · {profile.lunarMansionLuck}</h4>
            <p>{profile.mansionDescription}</p>
            <em className="calendar-mansion-note">Tùy trường phái, sao {profile.lunarMansion} có thể được luận khác nhau; đây là cách luận theo lịch pháp dùng ở đây.</em>
          </article>
        </div>

        <section className="calendar-guide">
          <h4><Compass /> Hướng và tuổi</h4>
          <div className="calendar-guide-grid">
            <article className="is-good"><small>Hỷ thần · hướng cưới hỏi, tin vui</small><b>{profile.joyDirection}</b></article>
            <article className="is-good"><small>Tài thần · hướng cầu tài</small><b>{profile.wealthDirection}</b></article>
            <article className="is-bad"><small>Hướng sát ngày · nên lưu ý</small><b>{profile.shaDirection}</b></article>
            <article>
              <small>Tuổi hợp</small>
              <p className="calendar-age-chips">
                {profile.compatibleAges.length ? profile.compatibleAges.map((age, index) => <span key={`${age}-${index}`}>{age}</span>) : <span>Không ghi nhận</span>}
              </p>
            </article>
            <article>
              <small>Tuổi xung</small>
              <p className="calendar-age-chips">
                {profile.conflictingAges.length ? profile.conflictingAges.map((age, index) => <span key={`${age}-${index}`}>{age}</span>) : <span>Không ghi nhận</span>}
              </p>
            </article>
          </div>
        </section>

        <div className="calendar-stars" id="xem-ngay-sao">
          <section className="is-good">
            <h4><Check /> Sao tốt chi tiết</h4>
            <div className="calendar-star-list">
              {profile.goodStarDetails.length
                ? profile.goodStarDetails.map((star, index) => <article key={`${star.name}-${index}`}><b>{star.name}</b><small>{star.description}</small></article>)
                : <article><b>Không ghi nhận cát tinh riêng</b><small>Theo hệ thống lịch pháp dùng ở đây, ngày này không có cát tinh nào được ghi nhận.</small></article>}
            </div>
          </section>
          <section className="is-bad">
            <h4><CircleAlert /> Sao xấu chi tiết</h4>
            <div className="calendar-star-list">
              {profile.badStarDetails.length
                ? profile.badStarDetails.map((star, index) => <article key={`${star.name}-${index}`}><b>{star.name}</b><small>{star.description}</small></article>)
                : <article><b>Không ghi nhận hung tinh riêng</b><small>Theo hệ thống lịch pháp dùng ở đây, ngày này không có hung tinh nào được ghi nhận.</small></article>}
            </div>
          </section>
        </div>

        <section className="calendar-hours" id="xem-ngay-gio">
          <h4><Clock3 /> Mười hai giờ trong ngày · đang xem {viewTime}</h4>
          <p className="calendar-section-intro">Theo thứ tự thời gian. Giờ đang chọn được viền nổi bật; mỗi giờ có Can Chi, Hoàng/Hắc đạo, Lục Nhâm và việc nên/kỵ.</p>
          <div className="calendar-hour-summary">
            <article><h5>Giờ hoàng đạo</h5><p>{hours.filter((hour) => hour.auspicious).map((hour) => `${hour.branch} ${hour.range}`).join(" · ")}</p></article>
            <article><h5>Sao theo giờ đang xem</h5><p>{viewingHour.officer}{viewingHour.isNoble ? " · Quý nhân" : ""}{viewingHour.isVoid ? " · Không vong" : ""}</p></article>
            <article><h5>Giờ Lục Nhâm</h5><p>{viewingHour.branch} · {viewingHour.sixRen.name}</p></article>
          </div>
          <div>
            {hours.map((hour) => (
              <article className={`${hour.auspicious ? "is-auspicious" : "is-inauspicious"} ${hour === viewingHour ? "is-current" : ""}`} key={`${hour.stem}-${hour.branch}-${hour.range}`}>
                <b>{hour.stem} {hour.branch}</b>
                <span>{hour.range}</span>
                <strong>{hour.auspicious ? "Hoàng đạo" : "Hắc đạo"}</strong>
                <small>{hour.officer}</small>
                <ul className="calendar-hour-flags">
                  <li className={`is-${hour.sixRen.tone}`}>Lục Nhâm: {hour.sixRen.name}</li>
                  {hour.isNoble && <li className="is-noble">Quý nhân</li>}
                  {hour.isVoid && <li className="is-void">Không vong</li>}
                  {hour.isDayClash && <li className="is-clash">Xung ngày</li>}
                </ul>
                <dl className="calendar-hour-advice">
                  <div><dt>Nên</dt><dd>{hour.yi.length ? hour.yi.join(", ") : "Chưa ghi nhận"}</dd></div>
                  <div><dt>Kỵ</dt><dd>{hour.ji.length ? hour.ji.join(", ") : "Chưa ghi nhận"}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <div className="calendar-prescriptions" id="xem-ngay-viec">
          <section><h4>Việc nên</h4><p>{profile.dayYi.map((item: string) => <span key={item}>{item}</span>)}</p></section>
          <section><h4>Việc kỵ</h4><p>{profile.dayJi.map((item: string) => <span key={item}>{item}</span>)}</p></section>
        </div>

        {profile.activities.length > 0 && <section className="calendar-activities">
          <h4>Gợi ý theo loại việc</h4>
          <div>{profile.activities.map((activity) => <article className={`is-${activity.status}`} key={activity.name}><span>{activity.status === "suitable" ? <Check /> : activity.status === "avoid" ? <X /> : <CircleAlert />}</span><div><b>{activity.name}</b><small>{activity.guidance}</small><small>Cát tinh: {activity.goodStars}</small><small>Hung tinh: {activity.badStars}</small></div><strong>{activity.status === "suitable" ? "Nên" : activity.status === "avoid" ? "Tránh" : "Cân nhắc"}</strong></article>)}</div>
        </section>}

        <section className="calendar-method">
          <h4><BookOpen /> Ghi chú phương pháp</h4>
          <ul>
            <li>Dữ liệu ngày được an theo lịch pháp Việt Nam: Can Chi năm — tháng — ngày, âm lịch và tiết khí đều tính từ lịch âm dương kết hợp tiết khí, không dùng tháng dương lịch thông thường.</li>
            <li>Nạp âm, Thập nhị Trực, Nhị thập bát tú và các sao cát — hung được tra theo bảng cổ truyền; mỗi trường phái có thể luận khác nhau ở một vài sao, nên kết quả chỉ là một cách đọc có ghi rõ quy tắc.</li>
            <li>Giờ được chấm theo Hoàng — Hắc đạo, Trực giờ, Lục Nhâm, Quý nhân và Nhật Phá; một giờ tốt không có nghĩa mọi việc đều thuận.</li>
            <li>Toàn bộ thông tin mang tính tham khảo, không thay thế quyết định của bạn.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
