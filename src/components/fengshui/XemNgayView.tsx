import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
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
import { canChi, jdFromDate, monthCanChi, yearCanChi } from "../../../shared/xem-ngay/calendar";
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

/**
 * "note": lời giải ngắn, hiện thành thẻ nhỏ căn giữa (như popover vàng của trang mẫu).
 * "rich": nội dung có bảng/danh sách, hiện thành thẻ rộng.
 */
type HintVariant = "note" | "rich";
type Hint = { id: string; title: string; body: ReactNode; variant: HintVariant };
type ActiveHint = Hint & { anchor: HTMLElement; pinned: boolean; sheet: boolean };

const pad = (value: number) => String(value).padStart(2, "0");
const OPEN_DELAY = 90;
const CLOSE_DELAY = 160;

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

/** Màn hình hẹp hoặc chạm: mở chi tiết thành tấm trượt từ đáy thay cho popover. */
function prefersSheet() {
  return window.matchMedia("(max-width: 640px), (hover: none)").matches;
}

/** Popover neo dưới chữ, tự lật lên trên khi thiếu chỗ (giống placement "auto bottom" của trang mẫu). */
function HintPopover({
  hint,
  onClose,
  onPointerEnter,
  onPointerLeave,
}: {
  hint: ActiveHint;
  onClose: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ top: number; left: number; arrow: number; side: "bottom" | "top" } | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      const node = ref.current;
      if (!node || !hint.anchor.isConnected) return;
      const rect = hint.anchor.getBoundingClientRect();
      const width = node.offsetWidth;
      const height = node.offsetHeight;
      const gap = 10;
      const margin = 8;
      const below = window.innerHeight - rect.bottom;
      const side = below < height + gap + margin && rect.top > below ? "top" : "bottom";
      const center = rect.left + rect.width / 2;
      const left = Math.min(Math.max(center - width / 2, margin), window.innerWidth - width - margin);
      const top = side === "bottom" ? rect.bottom + gap : rect.top - gap - height;
      setPlace({ top, left, side, arrow: Math.min(Math.max(center - left, 14), width - 14) });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [hint]);

  return createPortal(
    <div
      ref={ref}
      id={`xn-hint-${hint.id}`}
      role={hint.pinned ? "dialog" : "tooltip"}
      aria-label={hint.title}
      className={`xn-pop xn-pop--${hint.variant} ${place ? `is-${place.side}` : ""} ${hint.pinned ? "is-pinned" : ""}`}
      style={place ? { top: place.top, left: place.left, ["--xn-arrow" as string]: `${place.arrow}px` } : { top: -9999, left: -9999 }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <div className="xn-pop__head">
        <strong>{hint.title}</strong>
        {hint.pinned && (
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="xn-pop__body">{hint.body}</div>
    </div>,
    document.body,
  );
}

/** Tấm chi tiết trượt từ đáy cho điện thoại (tự dựng, chạy cả trên Safari 14). */
function HintSheet({ hint, onClose }: { hint: ActiveHint; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.classList.add("xn-sheet-open");
    return () => {
      document.body.classList.remove("xn-sheet-open");
      previous?.focus();
    };
  }, []);
  return createPortal(
    <div className="xn-sheet-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`xn-sheet xn-sheet--${hint.variant}`} role="dialog" aria-modal="true" aria-labelledby="xn-sheet-title">
        <span className="xn-sheet__grip" aria-hidden="true" />
        <header className="xn-sheet__head">
          <h3 id="xn-sheet-title">{hint.title}</h3>
          <button type="button" ref={closeRef} onClick={onClose} aria-label="Đóng">
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="xn-sheet__body">{hint.body}</div>
      </div>
    </div>,
    document.body,
  );
}

/** Quản lý một popover duy nhất: rê chuột để xem, bấm để ghim, Esc / bấm ra ngoài để đóng. */
function useHints() {
  const [active, setActive] = useState<ActiveHint | null>(null);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const activeRef = useRef(active);
  activeRef.current = active;

  const clearTimers = () => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
  };
  const close = useCallback(() => {
    clearTimers();
    setActive(null);
  }, []);
  const scheduleClose = useCallback(() => {
    window.clearTimeout(openTimer.current);
    window.clearTimeout(closeTimer.current);
    if (activeRef.current?.pinned) return;
    closeTimer.current = window.setTimeout(() => setActive((current) => (current?.pinned ? current : null)), CLOSE_DELAY);
  }, []);
  const keepOpen = useCallback(() => window.clearTimeout(closeTimer.current), []);

  const show = useCallback((hint: Hint, anchor: HTMLElement, pinned: boolean, delay = 0) => {
    clearTimers();
    const sheet = pinned && prefersSheet();
    const apply = () => setActive({ ...hint, anchor, pinned, sheet });
    if (delay) openTimer.current = window.setTimeout(apply, delay);
    else apply();
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const anchor = active.anchor;
        close();
        anchor.focus();
      }
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (active.anchor.contains(target)) return;
      if ((target as Element).closest?.(".xn-pop, .xn-sheet")) return;
      close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [active, close]);

  useEffect(() => clearTimers, []);

  const trigger = (hint: Hint) => ({
    "aria-expanded": active?.id === hint.id,
    "aria-describedby": active?.id === hint.id && !active.sheet ? `xn-hint-${hint.id}` : undefined,
    onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType !== "mouse" || activeRef.current?.pinned) return;
      show(hint, event.currentTarget, false, activeRef.current ? 0 : OPEN_DELAY);
    },
    onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === "mouse") scheduleClose();
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      if (activeRef.current?.pinned) return;
      if (event.currentTarget.matches(":focus-visible")) show(hint, event.currentTarget, false);
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      const next = event.relatedTarget as Element | null;
      if (next?.closest?.(".xn-pop")) return;
      scheduleClose();
    },
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      const current = activeRef.current;
      if (current?.id === hint.id && current.pinned) close();
      else show(hint, event.currentTarget, true);
    },
  });

  const layer = active ? (
    active.sheet ? (
      <HintSheet hint={active} onClose={close} />
    ) : (
      <HintPopover hint={active} onClose={close} onPointerEnter={keepOpen} onPointerLeave={scheduleClose} />
    )
  ) : null;

  return { trigger, layer, close };
}

type LinkFn = (label: ReactNode, title: string, body: ReactNode, className?: string, variant?: HintVariant) => ReactNode;

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

/** Xếp hai danh sách vào lưới 2 cột theo hàng: a[0], b[0], a[1], b[1]... */
function interleave<T>(a: T[], b: T[]) {
  const result: T[] = [];
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if (a[index]) result.push(a[index]);
    if (b[index]) result.push(b[index]);
  }
  return result;
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
  const hints = useHints();
  const closeHints = hints.close;

  // Đổi ngày thì đóng popover đang mở (nội dung cũ không còn đúng).
  useEffect(() => closeHints(), [profile.date, profile.hour, profile.minute, closeHints]);

  const go = (nextDate: string, nextHour = hour, nextMinute = minute) => {
    const params = new URLSearchParams(searchParams);
    params.set("ngay", nextDate);
    params.set("gio", String(nextHour));
    params.set("phut", String(nextMinute));
    setSearchParams(params, { replace: false });
  };

  const link: LinkFn = (label, title, body, className = "", variant = "rich") => {
    const id = `${title}::${typeof label === "string" ? label : ""}::${className}`.replace(/\s+/g, "-");
    return (
      <button type="button" className={`xn-link ${className}`} {...hints.trigger({ id, title, body, variant })}>
        {label}
      </button>
    );
  };
  const note = (label: ReactNode, title: string, text: string | undefined, className = "") =>
    text ? link(label, title, <SimpleInfo text={text} />, className, "note") : <span className={className}>{label}</span>;

  return (
    <div className="xn">
      <div className="xn-row xn-row--top">
        <OverviewPanel profile={profile} link={link} note={note} />
        <ToolPanel profile={profile} today={today} onGo={go} link={link} />
        <InfoPanel profile={profile} link={link} note={note} />
      </div>

      <div className="xn-row xn-row--2">
        <Panel title="Kiết tinh">
          <StarList stars={profile.stars.good} tone="good" note={note} />
        </Panel>
        <Panel title="Hung tinh">
          <StarList stars={profile.stars.bad} tone="bad" note={note} />
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
                  <td className="xn-num">{item.range}</td>
                  <td className="xn-right">{note(item.name, `${item.name} Hoàng Đạo`, findInfo(DAY_OFFICER_INFO, item.name)?.summary, "is-good")}</td>
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
                    const info = name ? findInfo(HOUR_STAR_INFO, name) ?? findInfo(DAY_OFFICER_INFO, name) : undefined;
                    return (
                      <td key={slot} className={slot ? "xn-right" : ""}>
                        {name ? note(name, name, info?.summary, luckClass(findInfo(HOUR_STAR_INFO, name)?.luck)) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="Giờ Lục Nhâm">
          <ul className="xn-lucnham">
            {/* Như trang mẫu: cột trái là giờ hoàng đạo, cột phải là giờ hắc đạo. */}
            {interleave(
              profile.hours.filter((item) => item.type === "Hoàng Đạo"),
              profile.hours.filter((item) => item.type !== "Hoàng Đạo"),
            ).map((item) => {
              const info = findInfo(LUC_NHAM_INFO, item.lucNham);
              return (
                <li key={item.chi} className={item.type === "Hoàng Đạo" ? "is-golden" : ""}>
                  <span>{item.chi}</span>
                  {note(item.lucNham, `Giờ ${item.chi} · ${item.lucNham}`, info ? `${info.luck}. ${info.summary}` : undefined, luckClass(info?.luck))}
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Giờ nước lớn, ròng">
          <div className="xn-tide">
            <b>Đối với vùng cao</b>
            <p>Giờ nước lớn: <span className="is-bad">{profile.tide.highland.flood.join(", ")}</span></p>
            <p>Giờ nước ròng: {profile.tide.highland.ebb.join(", ")}</p>
            <b>Đối với vùng thấp</b>
            <p>Giờ nước lớn: <span className="is-bad">{profile.tide.lowland.flood.join(", ")}</span></p>
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
              ["Hạc thần", <span className="is-bad">{profile.directions.hacThan}</span>],
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
            link(
              <>
                <b>Ngày {profile.ctx.day.name}:</b>
                <span>{profile.dongCong.summary}</span>
                <em className={luckClass(profile.dongCong.rating)}>{profile.dongCong.rating}</em>
              </>,
              profile.dongCong.title,
              <DongCongDetail entry={profile.dongCong} day={profile.ctx.day.name} />,
              "xn-dongcong",
            )
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

      {hints.layer}
    </div>
  );
}

type NoteFn = (label: ReactNode, title: string, text: string | undefined, className?: string) => ReactNode;

function OverviewPanel({ profile, link, note }: { profile: XemNgayProfile; link: LinkFn; note: NoteFn }) {
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
            note(
              `${overview.officer.name} ${overview.officer.type}`,
              `${overview.officer.name} ${overview.officer.type}`,
              findInfo(DAY_OFFICER_INFO, overview.officer.name)?.summary,
              overview.officer.type === "Hoàng Đạo" ? "is-good" : "is-bad",
            ),
          ],
          ["Đại tiểu nguyệt", overview.monthSize],
          ["Nhị thập bát tú", link(`${overview.tu28.name}: ${overview.tu28.luck}`, overview.tu28.name, <TuDetail name={overview.tu28.name} />, overview.tu28.luck === "Tốt" ? "is-good" : "is-bad")],
          ["Tương quan ngũ hành", note(overview.relation, overview.relation, findInfo(TUONG_QUAN_INFO, overview.relation)?.summary, luckClass(overview.relation))],
          ["Thập thiên can ngày", overview.stem],
          ["Thập nhị địa chi ngày", overview.branch],
        ]}
      />
    </Panel>
  );
}

function InfoPanel({ profile, link, note }: { profile: XemNgayProfile; link: LinkFn; note: NoteFn }) {
  const { info } = profile;
  const starLink = (name: string, label: string = name) => link(label, name, <CuuTinhDetail name={name} />);
  const lucNham = findInfo(LUC_NHAM_INFO, info.lucNham);
  const xuatHanh = findInfo(XUAT_HANH_INFO, info.xuatHanh);
  const folk = findInfo(DAN_GIAN_INFO, info.folk);
  return (
    <Panel title="Thông tin" className="xn-info">
      <Rows
        rows={[
          ["Năm cửu tinh", starLink(info.yearStar)],
          ["Tháng cửu tinh", starLink(info.monthStar)],
          ["Ngày cửu tinh", starLink(info.dayStar)],
          ["Giờ cửu tinh", starLink(info.hourStar, `${info.hourStar} (${profile.overview.hour})`)],
          ["Ngày Lục Nhâm", note(info.lucNham, `Ngày ${info.lucNham}`, lucNham ? `${lucNham.luck}. ${lucNham.summary}` : undefined, luckClass(lucNham?.luck))],
          [
            "Nhị thập tứ khí",
            <>
              {note(info.solarTerms[0], info.solarTerms[0], TIET_KHI_INFO[info.solarTerms[0]]?.summary)} –{" "}
              {note(info.solarTerms[1], info.solarTerms[1], TIET_KHI_INFO[info.solarTerms[1]]?.summary)}
            </>,
          ],
          ["Ngày xuất hành", note(info.xuatHanh, `Xuất hành ${info.xuatHanh}`, xuatHanh?.summary, luckClass(xuatHanh?.luck))],
          ["Ngày đầu tháng", note(info.monthFirstDay, "Ngày đầu tháng", `Mùng 1 tháng ${profile.lunar.month}${profile.lunar.leap ? " nhuận" : ""} âm lịch là ngày ${info.monthFirstDay}.`)],
          ["Quan niệm dân gian", note(info.folk, info.folk, folk?.summary, luckClass(folk?.luck))],
        ]}
      />
    </Panel>
  );
}

/** Can Chi đầy đủ của một ngày dương lịch, dùng cho tooltip ô lịch như trang mẫu. */
function dayTitle(day: number, month: number, year: number) {
  const lunar = solarToLunar(day, month, year);
  const jd = jdFromDate(day, month, year);
  const dayName = canChi(jd + 9, jd + 1).name;
  return `Ngày ${dayName}, tháng ${monthCanChi(lunar.year, lunar.month).name}, năm ${yearCanChi(lunar.year).name}`;
}

type PickerMode = "solar" | "lunar";

function DatePicker({
  profile,
  today,
  initialMode,
  onGo,
  onClose,
}: {
  profile: XemNgayProfile;
  today: string;
  initialMode: PickerMode;
  onGo: (date: string, hour?: number, minute?: number) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<PickerMode>(initialMode);
  const [solarInput, setSolarInput] = useState({ day: profile.solar.day, month: profile.solar.month, year: profile.solar.year });
  const [lunarInput, setLunarInput] = useState({ day: profile.lunar.day, month: profile.lunar.month, year: profile.lunar.year, leap: profile.lunar.leap });
  const [time, setTime] = useState({ hour: profile.hour, minute: profile.minute });
  const [error, setError] = useState("");
  const [view, setView] = useState({ year: profile.solar.year, month: profile.solar.month });
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    firstFieldRef.current?.select();
  }, [mode]);

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
    onClose();
  };

  const moveView = (months: number) => {
    const index = view.year * 12 + (view.month - 1) + months;
    setView({ year: Math.floor(index / 12), month: (index % 12) + 1 });
  };
  const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();
  const daysInMonth = new Date(view.year, view.month, 0).getDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const numberField = (label: string, value: number, onChange: (value: number) => void, min: number, max: number, first = false) => (
    <label className="xn-field">
      <span>{label}</span>
      <input ref={first ? firstFieldRef : undefined} type="number" inputMode="numeric" min={min} max={max} value={value} onChange={(event) => { setError(""); onChange(Number(event.target.value)); }} />
    </label>
  );

  return (
    <div className="xn-picker" role="dialog" aria-label="Chọn ngày xem">
      <form onSubmit={submit}>
        <div className="xn-picker__tabs" role="tablist" aria-label="Loại lịch">
          {(["solar", "lunar"] as const).map((value) => (
            <button key={value} type="button" role="tab" aria-selected={mode === value} className={mode === value ? "is-active" : ""} onClick={() => { setMode(value); setError(""); }}>
              {value === "solar" ? "Dương lịch" : "Âm lịch"}
            </button>
          ))}
        </div>
        <div className="xn-picker__fields">
          {mode === "solar" ? (
            <>
              {numberField("Ngày", solarInput.day, (day) => setSolarInput({ ...solarInput, day }), 1, 31, true)}
              {numberField("Tháng", solarInput.month, (month) => setSolarInput({ ...solarInput, month }), 1, 12)}
              {numberField("Năm", solarInput.year, (year) => setSolarInput({ ...solarInput, year }), 1900, 2199)}
            </>
          ) : (
            <>
              {numberField("Ngày", lunarInput.day, (day) => setLunarInput({ ...lunarInput, day }), 1, 30, true)}
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
        {error && <p className="xn-picker__error" role="alert">{error}</p>}
        <button type="submit" className="xn-btn xn-btn--primary xn-btn--block">Xem ngày</button>
      </form>

      <div className="xn-calendar" aria-label="Lịch tháng">
        <div className="xn-calendar__nav">
          <button type="button" onClick={() => moveView(-12)} aria-label="Năm trước" title="Năm trước"><ChevronsLeft aria-hidden="true" /></button>
          <button type="button" onClick={() => moveView(-1)} aria-label="Tháng trước" title="Tháng trước"><ChevronLeft aria-hidden="true" /></button>
          <strong>Tháng {view.month}/{view.year}</strong>
          <button type="button" onClick={() => moveView(1)} aria-label="Tháng sau" title="Tháng sau"><ChevronRight aria-hidden="true" /></button>
          <button type="button" onClick={() => moveView(12)} aria-label="Năm sau" title="Năm sau"><ChevronsRight aria-hidden="true" /></button>
        </div>
        <div className="xn-calendar__grid">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((label) => (
            <span className="xn-calendar__weekday" key={label}>{label}</span>
          ))}
          {cells.map((day, index) => {
            if (!day) return <span key={`empty-${index}`} aria-hidden="true" />;
            const value = formatDateString(view.year, view.month, day);
            const lunar = solarToLunar(day, view.month, view.year);
            const title = dayTitle(day, view.month, view.year);
            const classes = ["xn-calendar__day"];
            if (value === profile.date) classes.push("is-selected");
            if (value === today) classes.push("is-today");
            if (lunar.day === 1 || lunar.day === 15) classes.push("is-marked");
            if (index % 7 === 0) classes.push("is-sunday");
            return (
              <button
                type="button"
                key={value}
                className={classes.join(" ")}
                title={title}
                onClick={() => {
                  onGo(value);
                  onClose();
                }}
                aria-label={`${day}/${view.month}/${view.year}, âm lịch ${lunar.day}/${lunar.month}. ${title}`}
                aria-pressed={value === profile.date}
              >
                <b>{day}</b>
                <small>{lunar.day === 1 ? `${lunar.day}/${lunar.month}` : lunar.day}</small>
              </button>
            );
          })}
        </div>
      </div>
      <button type="button" className="xn-picker__close" onClick={onClose}>Đóng lại</button>
    </div>
  );
}

function ToolPanel({ profile, today, onGo, link }: { profile: XemNgayProfile; today: string; onGo: (date: string, hour?: number, minute?: number) => void; link: LinkFn }) {
  const [picker, setPicker] = useState<PickerMode | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const closePicker = useCallback(() => setPicker(null), []);

  useEffect(() => {
    if (!picker) return;
    const onDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) closePicker();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePicker();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [picker, closePicker]);

  const dateButton = (mode: PickerMode, label: string, value: string) => (
    <button type="button" className={`xn-datebox ${picker === mode ? "is-open" : ""}`} aria-expanded={picker === mode} aria-haspopup="dialog" onClick={() => setPicker(picker === mode ? null : mode)}>
      <span>{label}</span>
      <strong>{value}</strong>
    </button>
  );

  return (
    <Panel title="Công cụ xem ngày tốt, xấu" className="xn-tool">
      <p className="xn-tool__today">
        Đang hiển thị <b>{profile.weekday}</b>
      </p>
      <div className="xn-tool__picker" ref={wrapRef}>
        <div className="xn-tool__dates">
          {dateButton("solar", "Dương lịch", `${pad(profile.solar.day)}/${pad(profile.solar.month)}/${profile.solar.year}`)}
          {dateButton("lunar", "Âm lịch", `${pad(profile.lunar.day)}/${pad(profile.lunar.month)}${profile.lunar.leap ? "N" : ""}/${profile.lunar.year}`)}
        </div>
        {picker && <DatePicker key={picker} profile={profile} today={today} initialMode={picker} onGo={onGo} onClose={closePicker} />}
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
              `Trụ ${item.label.toLowerCase()} · ${item.name}`,
              <PhoiQueDetail name={item.name} upper={item.upper} luck={item.luck} hexagram={item.hexagram} />,
              "xn-pillar__btn",
            )}
          </div>
        ))}
      </div>

      <div className="xn-tool__nav">
        <button type="button" className="xn-icon-btn" onClick={() => onGo(addDaysToDate(profile.date, -1))} aria-label="Ngày trước" title="Ngày trước">
          <ChevronLeft aria-hidden="true" />
        </button>
        <button type="button" className="xn-btn xn-btn--primary" onClick={() => onGo(today, new Date().getHours(), new Date().getMinutes())}>
          Xem hôm nay
        </button>
        <button type="button" className="xn-icon-btn" onClick={() => onGo(addDaysToDate(profile.date, 1))} aria-label="Ngày sau" title="Ngày sau">
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <button type="button" className="xn-print" onClick={() => window.print()}>
        <Printer aria-hidden="true" /> In trang này
      </button>
    </Panel>
  );
}

function StarList({ stars, tone, note }: { stars: XemNgayProfile["stars"]["good"]; tone: "good" | "bad"; note: NoteFn }) {
  if (stars.length === 0) return <p className="xn-muted">Không có {tone === "good" ? "kiết tinh" : "hung tinh"} đáng kể.</p>;
  return (
    <p className={`xn-stars is-${tone}`}>
      {stars.map((item, index) => (
        <span key={item.name}>
          {note(item.name, item.name, sentenceCase(item.tag), item.strong ? "is-strong" : "")}
          {index < stars.length - 1 ? ", " : ""}
        </span>
      ))}
    </p>
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

function PhoiQueDetail({ name, upper, luck, hexagram }: { name: string; upper: number; luck: number; hexagram: string }) {
  return (
    <div className="xn-detail xn-phoique">
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

