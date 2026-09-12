import { useMemo, useState, type CSSProperties } from "react";
import { BookOpen, CalendarCheck, Check, CircleAlert, Clock3, Compass, ShieldCheck, X } from "lucide-react";
import { getDateProfile, getFourPillars, getNaYin, getPersonalDayCompatibility, getSolarTerm } from "../../../shared/menh-thu/metaphysics";

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
  const selectedDate = date ?? internalDate;
  const updateDate = (next: string) => {
    setInternalDate(next);
    onDateChange?.(next);
  };
  const profile = useMemo(() => getDateProfile(selectedDate), [selectedDate]);
  const hours = useMemo(() => [...profile.hours].sort((a, b) => b.score - a.score), [profile.hours]);
  const solarTerm = useMemo(() => getSolarTerm(selectedDate), [selectedDate]);
  // Nạp âm của trụ ngày: an bốn trụ tại 12:00 để lấy Can Chi ngày, rồi tra bảng nạp âm.
  const dayNaYin = useMemo(() => getNaYin(getFourPillars(selectedDate, "12:00").pillars[2]), [selectedDate]);
  const compatibility = useMemo(
    () => birthDate ? getPersonalDayCompatibility(selectedDate, birthDate, profile, birthTime) : null,
    [birthDate, birthTime, profile, selectedDate],
  );

  return (
    <div className="fengshui-tool-layout fengshui-tool-layout--calendar">
      <div className="fengshui-form-card">
        {!compact && <span className="fengshui-kicker"><CalendarCheck /> Lịch vạn sự</span>}
        {!compact && <h3>Chọn ngày cần tra cứu</h3>}
        <div className="fengshui-fields fengshui-fields--single">
          <label><span>Ngày dương lịch</span><input type="date" value={selectedDate} onInput={(event) => updateDate(event.currentTarget.value)} onChange={(event) => updateDate(event.target.value)} /></label>
          <label><span>Ngày sinh để đối chiếu tuổi <em>(tùy chọn)</em></span><input type="date" value={birthDate} max={today} onInput={(event) => setBirthDate(event.currentTarget.value)} onChange={(event) => setBirthDate(event.target.value)} /></label>
          <label><span>Giờ sinh</span><input type="time" value={birthTime} onInput={(event) => setBirthTime(event.currentTarget.value)} onChange={(event) => setBirthTime(event.target.value)} /></label>
        </div>
        <div className={`calendar-energy is-${qualityClass(profile.energyScore)}`}>
          <span style={{ "--score": `${profile.energyScore * 3.6}deg` } as CSSProperties}><b>{profile.energyScore}</b><small>/100</small></span>
          <div><small>Năng lượng tổng quan</small><h3>{profile.energyLabel}</h3><p>{profile.energyQuote}</p></div>
        </div>
        {compatibility && <div className={`calendar-compatibility is-${compatibility.verdict === "Xung tuổi" ? "caution" : compatibility.score >= 64 ? "good" : "neutral"}`}>
          <b>{compatibility.score}/100 · {compatibility.verdict}</b>
          <span>Tuổi {compatibility.birthYearPillar.stem} {compatibility.birthYearPillar.branch} · {compatibility.lunarAge} tuổi mụ</span>
          <p>{compatibility.reasons.map((reason) => reason.label).join(" · ")}</p>
        </div>}
        {!compact && <p className="fengshui-method-note"><ShieldCheck /> Điểm ngày dựa trên cát/hung thần, Trực, Tú và thần trực; không dùng điểm ngẫu nhiên.</p>}
      </div>

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

        <section className="calendar-info">
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
            <article className="is-bad"><small>Tam sát · hướng nên tránh</small><b>{profile.shaDirection}</b></article>
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

        <div className="calendar-stars">
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

        <section className="calendar-hours">
          <h4><Clock3 /> Mười hai giờ trong ngày, xếp theo điểm</h4>
          <div>
            {hours.map((hour) => (
              <article className={hour.auspicious ? "is-auspicious" : "is-inauspicious"} key={`${hour.stem}-${hour.branch}-${hour.range}`}>
                <b>{hour.stem} {hour.branch}</b>
                <span>{hour.range}</span>
                <strong>{hour.score} điểm</strong>
                <small>{hour.auspicious ? "Hoàng đạo" : hour.officer}</small>
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

        <div className="calendar-prescriptions">
          <section><h4>Việc nên</h4><p>{profile.dayYi.map((item: string) => <span key={item}>{item}</span>)}</p></section>
          <section><h4>Việc kỵ</h4><p>{profile.dayJi.map((item: string) => <span key={item}>{item}</span>)}</p></section>
        </div>

        {profile.activities.length > 0 && <section className="calendar-activities">
          <h4>Gợi ý theo loại việc</h4>
          <div>{profile.activities.slice(0, 8).map((activity) => <article className={`is-${activity.status}`} key={activity.name}><span>{activity.status === "suitable" ? <Check /> : activity.status === "avoid" ? <X /> : <CircleAlert />}</span><div><b>{activity.name}</b><small>{activity.guidance}</small></div><strong>{activity.score}</strong></article>)}</div>
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
