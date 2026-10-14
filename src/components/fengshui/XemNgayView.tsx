import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Printer, X } from "lucide-react";
import {
  addDaysToDate,
  formatDateString,
  getXemNgayProfile,
  lunarToSolar,
  parseDateString,
  solarToLunar,
  STEMS,
  type XemNgayProfile,
} from "../../../shared/xem-ngay";
import {
  CUU_TINH_INFO,
  DAN_GIAN_INFO,
  DAY_OFFICER_INFO,
  HOUR_STAR_INFO,
  LUC_NHAM_INFO,
  TIET_KHI_INFO,
  TRUC_INFO,
  TU28_INFO,
  TUONG_QUAN_INFO,
  XUAT_HANH_INFO,
  findInfo,
} from "../../../shared/xem-ngay/content";
import { TRANG_TRINH_MUC } from "../../../shared/xem-ngay/trang-trinh";
import "../../styles/xem-ngay.css";

type Detail = { title: string; body: ReactNode };

const pad = (value: number) => String(value).padStart(2, "0");

function todayValue() {
  const now = new Date();
  return formatDateString(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

function isValidDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const { year, month, day } = parseDateString(value);
  const probe = new Date(year, month - 1, day);
  return year >= 1900 && year <= 2199 && probe.getMonth() === month - 1 && probe.getDate() === day;
}

/** Hộp thoại chi tiết (tự dựng để chạy cả trên Safari 14 không có thẻ <dialog>). */
function DetailDialog({ detail, onClose }: { detail: Detail; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.classList.add("xn-dialog-open");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("xn-dialog-open");
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div className="xn-dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="xn-dialog" role="dialog" aria-modal="true" aria-labelledby="xn-dialog-title">
        <header className="xn-dialog__head">
          <h3 id="xn-dialog-title">{detail.title}</h3>
          <button type="button" ref={closeRef} onClick={onClose} aria-label="Đóng">
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="xn-dialog__body">{detail.body}</div>
      </div>
    </div>
  );
}

function Panel({ title, className = "", children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <section className={`xn-panel ${className}`}>
      <h2 className="xn-panel__head">{title}</h2>
      <div className="xn-panel__body">{children}</div>
    </section>
  );
}

function Rows({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl className="xn-kv">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ListBlock({ title, items, tone }: { title: string; items?: string[]; tone?: "good" | "bad" }) {
  if (!items || items.length === 0) return null;
  return (
    <div className={`xn-detail-list ${tone ? `is-${tone}` : ""}`}>
      <b>{title}</b>
      <p>{items.join(", ")}.</p>
    </div>
  );
}

/** Nhãn sao trong dữ liệu viết hoa mọi chữ; hiển thị theo kiểu câu thường. */
function sentenceCase(text: string) {
  const lower = text.toLocaleLowerCase("vi");
  return lower.charAt(0).toLocaleUpperCase("vi") + lower.slice(1);
}

function luckClass(luck?: string) {
  if (!luck) return "";
  if (/Đại Hung|Hung|Xấu|Hắc/.test(luck)) return "is-bad";
  if (/Kiết|Cát|Tốt|Hoàng/.test(luck)) return "is-good";
  return "";
}

export function XemNgayView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const today = useMemo(todayValue, []);
  const now = useMemo(() => new Date(), []);
  const paramDate = searchParams.get("ngay");
  const date = isValidDate(paramDate) ? paramDate : today;
  const hour = Math.min(23, Math.max(0, Number(searchParams.get("gio") ?? now.getHours()) || 0));
  const minute = Math.min(59, Math.max(0, Number(searchParams.get("phut") ?? now.getMinutes()) || 0));
  const profile = useMemo(() => getXemNgayProfile(date, hour, minute), [date, hour, minute]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const closeDetail = useCallback(() => setDetail(null), []);

  const go = (nextDate: string, nextHour = hour, nextMinute = minute) => {
    const params = new URLSearchParams(searchParams);
    params.set("ngay", nextDate);
    params.set("gio", String(nextHour));
    params.set("phut", String(nextMinute));
    setSearchParams(params, { replace: false });
  };

  const open = (title: string, body: ReactNode) => setDetail({ title, body });
  const link = (label: ReactNode, title: string, body: ReactNode, className = "") => (
    <button type="button" className={`xn-link ${className}`} onClick={() => open(title, body)}>
      {label}
    </button>
  );

  return (
    <div className="xn">
      <div className="xn-row xn-row--top">
        <OverviewPanel profile={profile} link={link} />
        <ToolPanel profile={profile} today={today} onGo={go} link={link} />
        <InfoPanel profile={profile} link={link} />
      </div>

      <div className="xn-row xn-row--2">
        <Panel title="Kiết tinh">
          <StarList stars={profile.stars.good} tone="good" link={link} />
        </Panel>
        <Panel title="Hung tinh">
          <StarList stars={profile.stars.bad} tone="bad" link={link} />
        </Panel>
      </div>

      <div className="xn-row xn-row--4">
        <Panel title="Tam sát niên"><p className="xn-center">{profile.tamSat.year}</p></Panel>
        <Panel title="Tam sát nguyệt"><p className="xn-center">{profile.tamSat.month}</p></Panel>
        <Panel title="Tam sát nhựt"><p className="xn-center">{profile.tamSat.day}</p></Panel>
        <Panel title="Tam sát thời"><p className="xn-center">{profile.tamSat.hour}</p></Panel>
      </div>

      <div className="xn-row xn-row--4">
        <Panel title="Giờ hoàng đạo">
          <table className="xn-table">
            <tbody>
              {profile.goodHours.map((item) => (
                <tr key={item.chi}>
                  <th scope="row">{item.chi}</th>
                  <td>{item.range}</td>
                  <td>{link(item.name, `${item.name} Hoàng Đạo`, <OfficerDetail name={item.name} />, "is-good")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Sao theo giờ">
          <table className="xn-table">
            <tbody>
              {profile.hourStars.map((item) => (
                <tr key={item.chi}>
                  <th scope="row">{item.chi}</th>
                  {[0, 1].map((slot) => {
                    const name = item.stars[slot];
                    return <td key={slot}>{name ? link(name, name, <HourStarDetail name={name} />, luckClass(findInfo(HOUR_STAR_INFO, name)?.luck)) : null}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Giờ Lục Nhâm">
          <table className="xn-table">
            <tbody>
              {profile.hours.map((item) => (
                <tr key={item.chi} className={item.type === "Hoàng Đạo" ? "is-golden" : ""}>
                  <th scope="row">{item.chi}</th>
                  <td>{link(item.lucNham, `Giờ ${item.chi} · ${item.lucNham}`, <LucNhamDetail name={item.lucNham} />, luckClass(findInfo(LUC_NHAM_INFO, item.lucNham)?.luck))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Giờ nước lớn, ròng">
          <div className="xn-tide">
            <b>Đối với vùng cao</b>
            <p>Giờ nước lớn: {profile.tide.highland.flood.join(", ")}</p>
            <p>Giờ nước ròng: {profile.tide.highland.ebb.join(", ")}</p>
            <b>Đối với vùng thấp</b>
            <p>Giờ nước lớn: {profile.tide.lowland.flood.join(", ")}</p>
            <p>Giờ nước ròng: {profile.tide.lowland.ebb.join(", ")}</p>
          </div>
        </Panel>
      </div>

      <div className="xn-row xn-row--4">
        <Panel title="Tuổi xung khắc với ngày">
          <ul className="xn-ages">{profile.clashDay.map((age) => <li key={age}>{age}</li>)}</ul>
        </Panel>
        <Panel title="Tuổi xung khắc với tháng">
          <ul className="xn-ages">{profile.clashMonth.map((age) => <li key={age}>{age}</li>)}</ul>
        </Panel>
        <Panel title="Hướng kiết hung">
          <Rows
            rows={[
              ["Tài thần", <span className="is-good">{profile.directions.taiThan}</span>],
              ["Hỷ thần", <span className="is-good">{profile.directions.hyThan}</span>],
              ["Hạc thần", profile.directions.hacThan],
            ]}
          />
        </Panel>
        <Panel title="Giờ không vong">
          <Rows
            rows={[
              ["Giờ Cô", <span className="is-bad">{profile.emptyHours.lonely.join(", ")}</span>],
              ["Giờ Hư", profile.emptyHours.hollow.join(", ")],
            ]}
          />
        </Panel>
      </div>

      <div className="xn-row xn-row--2 xn-row--wide">
        <Panel title="Đổng Công — soạn trạch nhật">
          {profile.dongCong ? (
            <button
              type="button"
              className="xn-dongcong"
              onClick={() => open(profile.dongCong!.title, <DongCongDetail entry={profile.dongCong!} day={profile.ctx.day.name} />)}
            >
              <b>Ngày {profile.ctx.day.name}:</b>
              <span>{profile.dongCong.summary}</span>
              <em className={luckClass(profile.dongCong.rating)}>{profile.dongCong.rating}</em>
            </button>
          ) : (
            <p className="xn-muted">Chưa có lời luận Đổng Công cho ngày này.</p>
          )}
        </Panel>
        <Panel title="Trạng Trình — Nguyễn Bỉnh Khiêm">
          {profile.trangTrinh.length ? (
            <ol className="xn-muc">
              {profile.trangTrinh.map((no) => {
                const muc = TRANG_TRINH_MUC[no];
                if (!muc) return null;
                return (
                  <li key={no}>
                    {link(
                      <>
                        <b>{pad(no)}.</b> {muc.title}
                      </>,
                      `Mục ${pad(no)} · ${muc.title}`,
                      <MucDetail no={no} highlight={profile.ctx.day.name} />,
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="xn-muted">Ngày này không thuộc bảng ngày tốt của mục nào.</p>
          )}
        </Panel>
      </div>

      {detail && <DetailDialog detail={detail} onClose={closeDetail} />}
    </div>
  );
}

type LinkFn = (label: ReactNode, title: string, body: ReactNode, className?: string) => ReactNode;

function OverviewPanel({ profile, link }: { profile: XemNgayProfile; link: LinkFn }) {
  const { overview } = profile;
  const truc = findInfo(TRUC_INFO, overview.truc);
  return (
    <Panel title="Tổng quan" className="xn-overview">
      <Rows
        rows={[
          ["Giờ đang xem", link(overview.hour, "Can Chi giờ theo ngày", <HourTable profile={profile} />)],
          ["Nạp âm ngày", overview.napAm],
          ["Thập nhị trực", link(`Trực ${overview.truc}`, `Trực ${overview.truc}`, <TrucDetail name={overview.truc} />, luckClass(truc?.luck))],
          [
            "Kiết hung nhật",
            link(`${overview.officer.name} ${overview.officer.type}`, `${overview.officer.name} ${overview.officer.type}`, <OfficerDetail name={overview.officer.name} />, overview.officer.type === "Hoàng Đạo" ? "is-good" : "is-bad"),
          ],
          ["Đại tiểu nguyệt", overview.monthSize],
          ["Nhị thập bát tú", link(`${overview.tu28.name}: ${overview.tu28.luck}`, overview.tu28.name, <TuDetail name={overview.tu28.name} />, overview.tu28.luck === "Tốt" ? "is-good" : "is-bad")],
          ["Tương quan ngũ hành", link(overview.relation, overview.relation, <SimpleInfo text={findInfo(TUONG_QUAN_INFO, overview.relation)?.summary} />, luckClass(overview.relation))],
          ["Thập thiên can ngày", overview.stem],
          ["Thập nhị địa chi ngày", overview.branch],
        ]}
      />
    </Panel>
  );
}

function InfoPanel({ profile, link }: { profile: XemNgayProfile; link: LinkFn }) {
  const { info } = profile;
  const starLink = (name: string, suffix = "") => link(`${name}${suffix}`, name, <CuuTinhDetail name={name} />);
  return (
    <Panel title="Thông tin" className="xn-info">
      <Rows
        rows={[
          ["Năm cửu tinh", starLink(info.yearStar)],
          ["Tháng cửu tinh", starLink(info.monthStar)],
          ["Ngày cửu tinh", starLink(info.dayStar)],
          ["Giờ cửu tinh", link(`${info.hourStar} (${profile.overview.hour})`, info.hourStar, <CuuTinhDetail name={info.hourStar} />)],
          ["Ngày Lục Nhâm", link(info.lucNham, `Ngày ${info.lucNham}`, <LucNhamDetail name={info.lucNham} />, luckClass(findInfo(LUC_NHAM_INFO, info.lucNham)?.luck))],
          [
            "Nhị thập tứ khí",
            <>
              {link(info.solarTerms[0], info.solarTerms[0], <SimpleInfo text={TIET_KHI_INFO[info.solarTerms[0]]?.summary} />)} —{" "}
              {link(info.solarTerms[1], info.solarTerms[1], <SimpleInfo text={TIET_KHI_INFO[info.solarTerms[1]]?.summary} />)}
            </>,
          ],
          ["Ngày xuất hành", link(info.xuatHanh, `Xuất hành ${info.xuatHanh}`, <SimpleInfo text={findInfo(XUAT_HANH_INFO, info.xuatHanh)?.summary} />, luckClass(findInfo(XUAT_HANH_INFO, info.xuatHanh)?.luck))],
          ["Ngày đầu tháng", link(info.monthFirstDay, "Ngày đầu tháng", <SimpleInfo text={`Mùng 1 tháng ${profile.lunar.month}${profile.lunar.leap ? " nhuận" : ""} âm lịch là ngày ${info.monthFirstDay}.`} />)],
          ["Quan niệm dân gian", link(info.folk, info.folk, <SimpleInfo text={findInfo(DAN_GIAN_INFO, info.folk)?.summary} />, luckClass(findInfo(DAN_GIAN_INFO, info.folk)?.luck))],
        ]}
      />
    </Panel>
  );
}

function ToolPanel({ profile, today, onGo, link }: { profile: XemNgayProfile; today: string; onGo: (date: string, hour?: number, minute?: number) => void; link: LinkFn }) {
  const [mode, setMode] = useState<"solar" | "lunar">("solar");
  const [solarInput, setSolarInput] = useState({ day: profile.solar.day, month: profile.solar.month, year: profile.solar.year });
  const [lunarInput, setLunarInput] = useState({ day: profile.lunar.day, month: profile.lunar.month, year: profile.lunar.year, leap: profile.lunar.leap });
  const [time, setTime] = useState({ hour: profile.hour, minute: profile.minute });
  const [error, setError] = useState("");
  const [view, setView] = useState({ year: profile.solar.year, month: profile.solar.month });

  useEffect(() => {
    setSolarInput({ day: profile.solar.day, month: profile.solar.month, year: profile.solar.year });
    setLunarInput({ day: profile.lunar.day, month: profile.lunar.month, year: profile.lunar.year, leap: profile.lunar.leap });
    setTime({ hour: profile.hour, minute: profile.minute });
    setView({ year: profile.solar.year, month: profile.solar.month });
    setError("");
  }, [profile.date, profile.hour, profile.minute, profile.solar, profile.lunar]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (mode === "solar") {
      const value = formatDateString(solarInput.year, solarInput.month, solarInput.day);
      if (!isValidDate(value)) return setError("Ngày dương lịch không hợp lệ.");
      onGo(value, time.hour, time.minute);
    } else {
      const solar = lunarToSolar(lunarInput.day, lunarInput.month, lunarInput.year, lunarInput.leap);
      if (!solar || lunarInput.day < 1 || lunarInput.day > 30) return setError(lunarInput.leap ? "Năm này không có tháng nhuận đã chọn." : "Ngày âm lịch không hợp lệ.");
      const value = formatDateString(solar[2], solar[1], solar[0]);
      const check = solarToLunar(solar[0], solar[1], solar[2]);
      if (check.day !== lunarInput.day) return setError("Tháng âm lịch này không có ngày 30.");
      onGo(value, time.hour, time.minute);
    }
  };

  const moveView = (months: number) => {
    const index = view.year * 12 + (view.month - 1) + months;
    setView({ year: Math.floor(index / 12), month: (index % 12) + 1 });
  };
  const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();
  const daysInMonth = new Date(view.year, view.month, 0).getDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const numberField = (label: string, value: number, onChange: (value: number) => void, min: number, max: number) => (
    <label className="xn-field">
      <span>{label}</span>
      <input type="number" inputMode="numeric" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );

  return (
    <Panel title="Công cụ xem ngày tốt, xấu" className="xn-tool">
      <p className="xn-tool__today">
        Đang hiển thị <b>{profile.weekday}</b>
      </p>
      <div className="xn-tool__dates">
        <div>
          <span>Dương lịch</span>
          <strong>
            {pad(profile.solar.day)}/{pad(profile.solar.month)}/{profile.solar.year}
          </strong>
        </div>
        <div>
          <span>Âm lịch</span>
          <strong>
            {pad(profile.lunar.day)}/{pad(profile.lunar.month)}
            {profile.lunar.leap ? " nhuận" : ""}/{profile.lunar.year}
          </strong>
        </div>
      </div>

      <form className="xn-form" onSubmit={submit}>
        <div className="xn-form__mode" role="tablist" aria-label="Loại lịch">
          <button type="button" role="tab" aria-selected={mode === "solar"} className={mode === "solar" ? "is-active" : ""} onClick={() => setMode("solar")}>
            Dương lịch
          </button>
          <button type="button" role="tab" aria-selected={mode === "lunar"} className={mode === "lunar" ? "is-active" : ""} onClick={() => setMode("lunar")}>
            Âm lịch
          </button>
        </div>
        <div className="xn-form__grid">
          {mode === "solar" ? (
            <>
              {numberField("Ngày", solarInput.day, (day) => setSolarInput({ ...solarInput, day }), 1, 31)}
              {numberField("Tháng", solarInput.month, (month) => setSolarInput({ ...solarInput, month }), 1, 12)}
              {numberField("Năm", solarInput.year, (year) => setSolarInput({ ...solarInput, year }), 1900, 2199)}
            </>
          ) : (
            <>
              {numberField("Ngày", lunarInput.day, (day) => setLunarInput({ ...lunarInput, day }), 1, 30)}
              {numberField("Tháng", lunarInput.month, (month) => setLunarInput({ ...lunarInput, month }), 1, 12)}
              {numberField("Năm", lunarInput.year, (year) => setLunarInput({ ...lunarInput, year }), 1900, 2199)}
            </>
          )}
          {numberField("Giờ", time.hour, (hour) => setTime({ ...time, hour: Math.min(23, Math.max(0, hour)) }), 0, 23)}
          {numberField("Phút", time.minute, (minute) => setTime({ ...time, minute: Math.min(59, Math.max(0, minute)) }), 0, 59)}
        </div>
        {mode === "lunar" && (
          <label className="xn-check">
            <input type="checkbox" checked={lunarInput.leap} onChange={(event) => setLunarInput({ ...lunarInput, leap: event.target.checked })} /> Tháng nhuận
          </label>
        )}
        {error && <p className="xn-form__error" role="alert">{error}</p>}
        <button type="submit" className="xn-btn xn-btn--primary">Xem ngày</button>
      </form>

      <div className="xn-calendar" aria-label="Lịch tháng">
        <div className="xn-calendar__nav">
          <button type="button" onClick={() => moveView(-12)} aria-label="Năm trước"><ChevronsLeft aria-hidden="true" /></button>
          <button type="button" onClick={() => moveView(-1)} aria-label="Tháng trước"><ChevronLeft aria-hidden="true" /></button>
          <strong>
            {pad(view.month)}/{view.year}
          </strong>
          <button type="button" onClick={() => moveView(1)} aria-label="Tháng sau"><ChevronRight aria-hidden="true" /></button>
          <button type="button" onClick={() => moveView(12)} aria-label="Năm sau"><ChevronsRight aria-hidden="true" /></button>
        </div>
        <div className="xn-calendar__grid">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((label) => (
            <span className="xn-calendar__weekday" key={label}>{label}</span>
          ))}
          {cells.map((day, index) => {
            if (!day) return <span key={`empty-${index}`} />;
            const value = formatDateString(view.year, view.month, day);
            const lunar = solarToLunar(day, view.month, view.year);
            const classes = ["xn-calendar__day"];
            if (value === profile.date) classes.push("is-selected");
            if (value === today) classes.push("is-today");
            if (lunar.day === 1 || lunar.day === 15) classes.push("is-marked");
            return (
              <button type="button" key={value} className={classes.join(" ")} onClick={() => onGo(value)} aria-label={`Ngày ${day}/${view.month}/${view.year}, âm lịch ${lunar.day}/${lunar.month}`} aria-pressed={value === profile.date}>
                <b>{day}</b>
                <small>{lunar.day === 1 ? `${lunar.day}/${lunar.month}` : lunar.day}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="xn-pillars">
        {profile.pillars.map((item) => (
          <div key={item.label} className="xn-pillar">
            <span>{item.label}</span>
            {link(
              <>
                <i>{item.upper}</i>
                <b>{item.name}</b>
                <i>{item.luck}</i>
              </>,
              "Biểu đồ Lục thập Giáp Tý phối quẻ",
              <PhoiQueDetail label={item.label} name={item.name} upper={item.upper} luck={item.luck} hexagram={item.hexagram} />,
              "xn-pillar__btn",
            )}
          </div>
        ))}
      </div>

      <div className="xn-tool__actions">
        <button type="button" className="xn-btn" onClick={() => onGo(addDaysToDate(profile.date, -1))}>
          <ChevronLeft aria-hidden="true" /> Ngày trước
        </button>
        <button type="button" className="xn-btn xn-btn--primary" onClick={() => onGo(today, new Date().getHours(), new Date().getMinutes())}>
          Xem hôm nay
        </button>
        <button type="button" className="xn-btn" onClick={() => onGo(addDaysToDate(profile.date, 1))}>
          Ngày sau <ChevronRight aria-hidden="true" />
        </button>
        <button type="button" className="xn-btn xn-btn--ghost" onClick={() => window.print()}>
          <Printer aria-hidden="true" /> In trang này
        </button>
      </div>
    </Panel>
  );
}

function StarList({ stars, tone, link }: { stars: XemNgayProfile["stars"]["good"]; tone: "good" | "bad"; link: LinkFn }) {
  if (stars.length === 0) return <p className="xn-muted">Không có {tone === "good" ? "kiết tinh" : "hung tinh"} đáng kể.</p>;
  return (
    <ul className={`xn-stars is-${tone}`}>
      {stars.map((item) => (
        <li key={item.name}>
          {link(item.name, item.name, <SimpleInfo text={sentenceCase(item.tag)} />, item.strong ? "is-strong" : "")}
          <small>{sentenceCase(item.tag)}</small>
        </li>
      ))}
    </ul>
  );
}

function SimpleInfo({ text }: { text?: string }) {
  return <p>{text || "Chưa có diễn giải cho mục này."}</p>;
}

function HourTable({ profile }: { profile: XemNgayProfile }) {
  return (
    <table className="xn-table xn-table--full">
      <thead>
        <tr><th>Khung giờ</th><th>Can Chi</th><th>Thần trực</th></tr>
      </thead>
      <tbody>
        {profile.hours.map((item) => (
          <tr key={item.chi} className={item.canChi === profile.overview.hour ? "is-current" : ""}>
            <td>{item.range.replace("-", "h – ")}h</td>
            <td><b>{item.canChi}</b></td>
            <td className={item.type === "Hoàng Đạo" ? "is-good" : "is-bad"}>{item.name} ({item.type})</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TrucDetail({ name }: { name: string }) {
  const info = findInfo(TRUC_INFO, name);
  if (!info) return <SimpleInfo />;
  return (
    <div className="xn-detail">
      <p className="xn-detail__lead">{info.summary}</p>
      <Rows rows={[["Tốt xấu", info.luck], ["Ngũ hành", info.element], ["Bành Tổ kị nhật", info.saying], ["Ý nghĩa", info.meaning]]} />
      <ListBlock title="Nên làm" items={info.suitable} tone="good" />
      <ListBlock title="Kiêng kỵ" items={info.avoid} tone="bad" />
    </div>
  );
}

function TuDetail({ name }: { name: string }) {
  const info = findInfo(TU28_INFO, name);
  if (!info) return <SimpleInfo />;
  return (
    <div className="xn-detail">
      <p className="xn-detail__lead">{info.summary}</p>
      <Rows rows={[["Sao", info.short], ["Ngũ hành", info.element], ["Tướng tinh", info.animal], ["Đánh giá", info.luck]]} />
      <ListBlock title="Nên làm" items={info.suitable} tone="good" />
      <ListBlock title="Kiêng cữ" items={info.avoid} tone="bad" />
      {info.exception && <p className="xn-detail__note"><b>Ngoại lệ:</b> {info.exception}</p>}
    </div>
  );
}

function OfficerDetail({ name }: { name: string }) {
  const info = findInfo(DAY_OFFICER_INFO, name);
  return (
    <div className="xn-detail">
      {info && <p className="xn-detail__lead">{info.type}</p>}
      <SimpleInfo text={info?.summary} />
    </div>
  );
}

function HourStarDetail({ name }: { name: string }) {
  const info = findInfo(HOUR_STAR_INFO, name) ?? findInfo(DAY_OFFICER_INFO, name);
  return <SimpleInfo text={info?.summary} />;
}

function LucNhamDetail({ name }: { name: string }) {
  const info = findInfo(LUC_NHAM_INFO, name);
  return (
    <div className="xn-detail">
      {info && <p className={`xn-detail__lead ${luckClass(info.luck)}`}>{info.luck}</p>}
      <SimpleInfo text={info?.summary} />
    </div>
  );
}

function CuuTinhDetail({ name }: { name: string }) {
  const info = findInfo(CUU_TINH_INFO, name);
  if (!info) return <SimpleInfo />;
  return (
    <div className="xn-detail">
      <Rows rows={[["Ngũ hành", info.element], ["Màu", info.color], ["Tính chất", info.luck]]} />
      <SimpleInfo text={info.summary} />
    </div>
  );
}

function PhoiQueDetail({ label, name, upper, luck, hexagram }: { label: string; name: string; upper: number; luck: number; hexagram: string }) {
  return (
    <div className="xn-detail xn-phoique">
      <p className="xn-detail__lead">Trụ {label.toLowerCase()} · {name}</p>
      <div className="xn-phoique__card">
        <span>{upper}</span>
        <b>{name}</b>
        <span>{luck}</span>
        <strong>{hexagram}</strong>
      </div>
      <p>
        Theo Huyền Không Đại Quái, mỗi Can Chi trong Lục thập Giáp Tý ứng với một quẻ. Số phía trên là quái số của quẻ thượng, số phía dưới là quái vận (1–9) của quẻ.
      </p>
    </div>
  );
}

function DongCongDetail({ entry, day }: { entry: NonNullable<XemNgayProfile["dongCong"]>; day: string }) {
  return (
    <div className="xn-detail">
      {entry.label && <p className="xn-detail__lead">{entry.label}</p>}
      <table className="xn-table xn-table--full">
        <thead>
          <tr><th>Ngày</th><th>Lời luận</th><th>Kiết – Hung</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><b>{day}</b></td>
            <td>{entry.summary}</td>
            <td className={luckClass(entry.rating)}><b>{entry.rating}</b></td>
          </tr>
        </tbody>
      </table>
      <ListBlock title="Đổng Công nêu là nên làm" items={entry.suitable} tone="good" />
    </div>
  );
}

function MucDetail({ no, highlight }: { no: number; highlight: string }) {
  const muc = TRANG_TRINH_MUC[no];
  if (!muc) return <SimpleInfo />;
  const [stem, branch] = highlight.split(" ");
  return (
    <div className="xn-detail">
      <p className="xn-detail__lead">{muc.summary}</p>
      {muc.tables.map((table, index) => (
        <div className="xn-muc-table" key={index}>
          {table.caption && <p className="xn-muc-table__caption">{table.caption}</p>}
          <div className="xn-muc-table__scroll">
            <table className="xn-table xn-table--grid">
              <thead>
                <tr>
                  <th scope="row">Can</th>
                  {STEMS.map((name) => <th key={name} className={name === stem ? "is-current" : ""}>{name}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Chi</th>
                  {STEMS.map((name) => {
                    const days = (table.days as Record<string, string[] | undefined>)[name] ?? [];
                    return (
                      <td key={name} className={name === stem ? "is-current" : ""}>
                        {days.map((chi) => <span key={chi} className={name === stem && chi === branch ? "is-hit" : ""}>{chi}</span>)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {muc.notes.length > 0 && (
        <ul className="xn-detail__notes">
          {muc.notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      )}
    </div>
  );
}

