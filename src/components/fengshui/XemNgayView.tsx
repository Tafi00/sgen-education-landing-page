import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Printer, X } from "lucide-react";
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
import { tietKhiTho } from "../../../shared/xem-ngay/tiet-khi-tho";
import "../../styles/xem-ngay.css";

/**
 * Rê chuột: thẻ nhỏ neo dưới chữ ("note": lời giải ngắn, "rich": bảng/danh sách).
 * Bấm: mở hộp thoại chi tiết đầy đủ (`detail`, mặc định dùng lại `body`).
 */
type HintVariant = "note" | "rich";
type Hint = { id: string; title: string; body: ReactNode; variant: HintVariant; detail?: ReactNode };
type ActiveHint = Hint & { anchor: HTMLElement; pinned: boolean };

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

/** Popover neo dưới chữ, tự lật lên trên khi thiếu chỗ (giống placement "auto bottom" của trang mẫu). */
function HintPopover({
  hint,
  onPointerEnter,
  onPointerLeave,
}: {
  hint: ActiveHint;
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
      role="tooltip"
      aria-label={hint.title}
      className={`xn-pop xn-pop--${hint.variant} ${place ? `is-${place.side}` : ""}`}
      style={place ? { top: place.top, left: place.left, ["--xn-arrow" as string]: `${place.arrow}px` } : { top: -9999, left: -9999 }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {hint.body}
    </div>,
    document.body,
  );
}

/** Hộp thoại chi tiết ở giữa màn hình (trượt từ đáy trên điện thoại), tự dựng nên chạy cả trên Safari 14. */
function HintDialog({ hint, onClose }: { hint: ActiveHint; onClose: () => void }) {
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
      <div className={`xn-sheet xn-sheet--${hint.variant}`} role="dialog" aria-modal="true" aria-label={hint.title}>
        <div className="xn-sheet__bar">
          <span className="xn-sheet__grip" aria-hidden="true" />
          <button type="button" ref={closeRef} onClick={onClose} aria-label="Đóng">
            <X aria-hidden="true" />
          </button>
        </div>
        <div className="xn-sheet__body">{hint.detail ?? hint.body}</div>
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
    const apply = () => setActive({ ...hint, anchor, pinned });
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
    "aria-describedby": active?.id === hint.id && !active.pinned ? `xn-hint-${hint.id}` : undefined,
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
    active.pinned ? (
      <HintDialog hint={active} onClose={close} />
    ) : (
      <HintPopover hint={active} onPointerEnter={keepOpen} onPointerLeave={scheduleClose} />
    )
  ) : null;

  return { trigger, layer, close };
}

type LinkFn = (label: ReactNode, title: string, body: ReactNode, className?: string, variant?: HintVariant, detail?: ReactNode) => ReactNode;

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

  const link: LinkFn = (label, title, body, className = "", variant = "rich", detail) => {
    const id = `${title}::${typeof label === "string" ? label : ""}::${className}`.replace(/\s+/g, "-");
    return (
      <button type="button" className={`xn-link ${className}`} {...hints.trigger({ id, title, body, variant, detail })}>
        {label}
      </button>
    );
  };
  const note: NoteFn = (label, title, text, className = "", detail) =>
    text
      ? link(
          label,
          title,
          <NoteCard title={title} text={text} />,
          className,
          "note",
          detail ?? (
            <Card title={title}>
              <CardRows rows={[["Ý nghĩa", text]]} />
            </Card>
          ),
        )
      : <span className={className}>{label}</span>;

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

      <div className="xn-row xn-row--4 xn-row--hours">
        <Panel title="Giờ hoàng đạo">
          <table className="xn-table">
            <tbody>
              {profile.goodHours.map((item) => (
                <tr key={item.chi}>
                  <th scope="row">{item.chi}</th>
                  <td className="xn-num">{item.range}</td>
                  <td className="xn-right">{note(item.name, `${item.name} Hoàng Đạo`, findInfo(DAY_OFFICER_INFO, item.name)?.summary, "is-good", officerDetail(item.name))}</td>
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
                        {name ? note(name, name, info?.summary, luckClass(findInfo(HOUR_STAR_INFO, name)?.luck), hourStarDetail(name)) : null}
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
                  {note(item.lucNham, `Giờ ${item.chi} · ${item.lucNham}`, info ? `${info.luck}. ${info.summary}` : undefined, luckClass(info?.luck), lucNhamDetail(item.lucNham, `Giờ ${item.chi} · ${item.lucNham}`))}
                </li>
              );
            })}
          </ul>
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
              <DongCongCard entry={profile.dongCong} day={profile.ctx.day.name} />,
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
                      <MucCard no={no} highlight={profile.ctx.day.name} />,
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

type NoteFn = (label: ReactNode, title: string, text: string | undefined, className?: string, detail?: ReactNode) => ReactNode;

function OverviewPanel({ profile, link, note }: { profile: XemNgayProfile; link: LinkFn; note: NoteFn }) {
  const { overview } = profile;
  const truc = findInfo(TRUC_INFO, overview.truc);
  return (
    <Panel title="Tổng quan" className="xn-overview">
      <Rows
        rows={[
          ["Giờ đang xem", link(overview.hour, "Can Chi giờ theo ngày", <HourCard profile={profile} />)],
          ["Nạp âm ngày", overview.napAm],
          ["Thập nhị trực", link(`Trực ${overview.truc}`, `Trực ${overview.truc}`, <TrucCard name={overview.truc} />, luckClass(truc?.luck))],
          [
            "Kiết hung nhật",
            note(
              `${overview.officer.name} ${overview.officer.type}`,
              `${overview.officer.name} ${overview.officer.type}`,
              findInfo(DAY_OFFICER_INFO, overview.officer.name)?.summary,
              overview.officer.type === "Hoàng Đạo" ? "is-good" : "is-bad",
              officerDetail(overview.officer.name),
            ),
          ],
          ["Đại tiểu nguyệt", overview.monthSize],
          ["Nhị thập bát tú", link(`${overview.tu28.name}: ${overview.tu28.luck}`, overview.tu28.name, <TuCard name={overview.tu28.name} />, overview.tu28.luck === "Tốt" ? "is-good" : "is-bad")],
          ["Tương quan ngũ hành", note(overview.relation, overview.relation, findInfo(TUONG_QUAN_INFO, overview.relation)?.summary, luckClass(overview.relation), tuongQuanDetail(overview.relation))],
          ["Thập thiên can ngày", overview.stem],
          ["Thập nhị địa chi ngày", overview.branch],
        ]}
      />
    </Panel>
  );
}

function InfoPanel({ profile, link, note }: { profile: XemNgayProfile; link: LinkFn; note: NoteFn }) {
  const { info } = profile;
  const starLink = (name: string, label: string = name) => link(label, `Sao ${name}`, <CuuTinhCard name={name} />);
  const lucNham = findInfo(LUC_NHAM_INFO, info.lucNham);
  const xuatHanh = findInfo(XUAT_HANH_INFO, info.xuatHanh);
  const folk = findInfo(DAN_GIAN_INFO, info.folk);
  // Rê chuột vào tiết khí: bài thơ chọn ngày của tháng tiết khí như trang mẫu (xem `tiet-khi-tho.ts`).
  const tietKhiLink = (name: string) =>
    tietKhiTho(name)
      ? link(name, name, <TietKhiCard name={name} />, "", "rich", <TietKhiCard name={name} withAstronomy />)
      : note(name, name, TIET_KHI_INFO[name]?.summary, "", tietKhiDetail(name));
  return (
    <Panel title="Thông tin" className="xn-info">
      <Rows
        rows={[
          ["Năm cửu tinh", starLink(info.yearStar)],
          ["Tháng cửu tinh", starLink(info.monthStar)],
          ["Ngày cửu tinh", starLink(info.dayStar)],
          ["Giờ cửu tinh", starLink(info.hourStar, `${info.hourStar} (${profile.overview.hour})`)],
          ["Ngày Lục Nhâm", note(info.lucNham, `Ngày ${info.lucNham}`, lucNham ? `${lucNham.luck}. ${lucNham.summary}` : undefined, luckClass(lucNham?.luck), lucNhamDetail(info.lucNham, `Ngày ${info.lucNham}`))],
          ["Nhị thập tứ khí", <>{tietKhiLink(info.solarTerms[0])} – {tietKhiLink(info.solarTerms[1])}</>],
          ["Ngày xuất hành", note(info.xuatHanh, `Xuất hành ${info.xuatHanh}`, xuatHanh?.summary, luckClass(xuatHanh?.luck), xuatHanhDetail(info.xuatHanh))],
          ["Ngày đầu tháng", note(info.monthFirstDay, "Ngày đầu tháng", `Mùng 1 tháng ${profile.lunar.month}${profile.lunar.leap ? " nhuận" : ""} âm lịch là ngày ${info.monthFirstDay}.`)],
          ["Quan niệm dân gian", note(info.folk, info.folk, folk?.summary, luckClass(folk?.luck), danGianDetail(info.folk))],
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

/**
 * Bảng chọn ngày theo trang mẫu: mở đè lên khung công cụ, hai cột Dương lịch | Âm lịch
 * (mỗi cột có ngày/tháng/năm, giờ/phút và nút Xem), bên dưới là lịch tháng.
 */
function DatePicker({
  profile,
  today,
  focusMode,
  onGo,
  onClose,
}: {
  profile: XemNgayProfile;
  today: string;
  focusMode: PickerMode;
  onGo: (date: string, hour?: number, minute?: number) => void;
  onClose: () => void;
}) {
  const [solarInput, setSolarInput] = useState({ day: profile.solar.day, month: profile.solar.month, year: profile.solar.year });
  const [lunarInput, setLunarInput] = useState({ day: profile.lunar.day, month: profile.lunar.month, year: profile.lunar.year, leap: profile.lunar.leap });
  const [time, setTime] = useState({ hour: profile.hour, minute: profile.minute });
  const [error, setError] = useState<{ mode: PickerMode; text: string } | null>(null);
  const [view, setView] = useState({ year: profile.solar.year, month: profile.solar.month });
  const solarDayRef = useRef<HTMLInputElement>(null);
  const lunarDayRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const field = focusMode === "solar" ? solarDayRef.current : lunarDayRef.current;
    field?.focus();
    field?.select();
  }, [focusMode]);

  const submitSolar = (event: React.FormEvent) => {
    event.preventDefault();
    const value = formatDateString(solarInput.year, solarInput.month, solarInput.day);
    if (!isValidDate(value)) return setError({ mode: "solar", text: "Ngày dương lịch không hợp lệ." });
    onGo(value, time.hour, time.minute);
    onClose();
  };

  const submitLunar = (event: React.FormEvent) => {
    event.preventDefault();
    const solar = lunarToSolar(lunarInput.day, lunarInput.month, lunarInput.year, lunarInput.leap);
    if (!solar || lunarInput.day < 1 || lunarInput.day > 30) {
      return setError({ mode: "lunar", text: lunarInput.leap ? "Năm này không có tháng nhuận đã chọn." : "Ngày âm lịch không hợp lệ." });
    }
    const check = solarToLunar(solar[0], solar[1], solar[2]);
    if (check.day !== lunarInput.day) return setError({ mode: "lunar", text: "Tháng âm lịch này không có ngày 30." });
    onGo(formatDateString(solar[2], solar[1], solar[0]), time.hour, time.minute);
    onClose();
  };

  const moveView = (months: number) => {
    const index = view.year * 12 + (view.month - 1) + months;
    setView({ year: Math.floor(index / 12), month: (index % 12) + 1 });
  };
  const firstWeekday = new Date(view.year, view.month - 1, 1).getDay();
  const daysInMonth = new Date(view.year, view.month, 0).getDate();
  // Luôn đủ 6 hàng như trang mẫu để bảng không nhảy chiều cao khi đổi tháng.
  const cells: Array<number | null> = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstWeekday + 1;
    return day >= 1 && day <= daysInMonth ? day : null;
  });

  const num = (
    label: string,
    value: number,
    onChange: (value: number) => void,
    min: number,
    max: number,
    className = "",
    ref?: React.Ref<HTMLInputElement>,
  ) => (
    <input
      ref={ref}
      aria-label={label}
      className={className}
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={value}
      onChange={(event) => {
        setError(null);
        onChange(Number(event.target.value));
      }}
    />
  );

  const timeRow = (
    <div className="xn-picker__time">
      <label>
        Giờ {num("Giờ", time.hour, (hour) => setTime({ ...time, hour: Math.min(23, Math.max(0, hour)) }), 0, 23)}
      </label>
      <label>
        Phút {num("Phút", time.minute, (minute) => setTime({ ...time, minute: Math.min(59, Math.max(0, minute)) }), 0, 59)}
      </label>
    </div>
  );

  return (
    <div className="xn-picker" role="dialog" aria-label="Chọn ngày xem">
      <div className="xn-picker__cols">
        <form className="xn-picker__col" onSubmit={submitSolar}>
          <div className="xn-picker__title">
            <b>Dương lịch</b>
          </div>
          <div className="xn-picker__date">
            {num("Ngày dương lịch", solarInput.day, (day) => setSolarInput({ ...solarInput, day }), 1, 31, "", solarDayRef)}
            {num("Tháng dương lịch", solarInput.month, (month) => setSolarInput({ ...solarInput, month }), 1, 12)}
            {num("Năm dương lịch", solarInput.year, (year) => setSolarInput({ ...solarInput, year }), 1900, 2199, "is-year")}
          </div>
          {timeRow}
          {error?.mode === "solar" && <p className="xn-picker__error" role="alert">{error.text}</p>}
          <button type="submit" className="xn-picker__go">Xem</button>
        </form>
        <form className="xn-picker__col" onSubmit={submitLunar}>
          <div className="xn-picker__title">
            <b>Âm lịch</b>
            <label className="xn-picker__leap" title="Tháng nhuận">
              <input type="checkbox" checked={lunarInput.leap} onChange={(event) => setLunarInput({ ...lunarInput, leap: event.target.checked })} /> nhuận
            </label>
          </div>
          <div className="xn-picker__date">
            {num("Ngày âm lịch", lunarInput.day, (day) => setLunarInput({ ...lunarInput, day }), 1, 30, "", lunarDayRef)}
            {num("Tháng âm lịch", lunarInput.month, (month) => setLunarInput({ ...lunarInput, month }), 1, 12)}
            {num("Năm âm lịch", lunarInput.year, (year) => setLunarInput({ ...lunarInput, year }), 1900, 2199, "is-year")}
          </div>
          {timeRow}
          {error?.mode === "lunar" && <p className="xn-picker__error" role="alert">{error.text}</p>}
          <button type="submit" className="xn-picker__go">Xem</button>
        </form>
      </div>

      <table className="xn-cal" aria-label={`Lịch tháng ${view.month}/${view.year}`}>
        <thead>
          <tr className="xn-cal__nav">
            <td><button type="button" onClick={() => moveView(-12)} aria-label="Năm trước" title="Năm trước">«</button></td>
            <td><button type="button" onClick={() => moveView(-1)} aria-label="Tháng trước" title="Tháng trước">‹</button></td>
            <td colSpan={3}><strong>{view.month}/{view.year}</strong></td>
            <td><button type="button" onClick={() => moveView(1)} aria-label="Tháng sau" title="Tháng sau">›</button></td>
            <td><button type="button" onClick={() => moveView(12)} aria-label="Năm sau" title="Năm sau">»</button></td>
          </tr>
          <tr className="xn-cal__week">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((label) => <th key={label} scope="col">{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }, (_, row) => (
            <tr key={row}>
              {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                if (!day) return <td key={col} className="is-empty" />;
                const value = formatDateString(view.year, view.month, day);
                const lunar = solarToLunar(day, view.month, view.year);
                const title = dayTitle(day, view.month, view.year);
                const classes = [col === 0 ? "is-sun" : col === 6 ? "is-sat" : ""];
                if (value === profile.date) classes.push("is-selected");
                if (value === today) classes.push("is-today");
                return (
                  <td key={col} className={classes.join(" ")}>
                    <button
                      type="button"
                      title={title}
                      aria-label={`${day}/${view.month}/${view.year}, âm lịch ${lunar.day}/${lunar.month}. ${title}`}
                      aria-pressed={value === profile.date}
                      onClick={() => {
                        onGo(value);
                        onClose();
                      }}
                    >
                      <b>{day}</b>
                      <small>{lunar.day === 1 || day === 1 ? `${lunar.day}/${lunar.month}` : lunar.day}</small>
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" className="xn-picker__close" onClick={onClose}>– Đóng lại –</button>
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
        {picker && <DatePicker profile={profile} today={today} focusMode={picker} onGo={onGo} onClose={closePicker} />}
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
              <PhoiQueCard name={item.name} upper={item.upper} luck={item.luck} hexagram={item.hexagram} />,
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

/* Nội dung hộp thoại chi tiết cho các mục chỉ có lời giải ngắn khi rê chuột. */
const luckTone = (luck?: string) => (/Hung|Xấu/.test(luck ?? "") ? "bad" : /Cát|Tốt|Kiết/.test(luck ?? "") ? "good" : undefined);

function officerDetail(name: string) {
  const info = findInfo(DAY_OFFICER_INFO, name);
  if (!info) return undefined;
  return (
    <Card title={`${info.name} ${info.type}`}>
      <CardRows rows={[["Loại", info.type, info.type === "Hoàng Đạo" ? "good" : "bad"], ["Tên gọi khác", info.alias], ["Ý nghĩa", info.summary]]} />
    </Card>
  );
}

function hourStarDetail(name: string) {
  const info = findInfo(HOUR_STAR_INFO, name);
  if (!info) return officerDetail(name);
  return (
    <Card title={name} sub={<p>Sao theo giờ · {info.luck}</p>}>
      <CardRows rows={[["Tính chất", info.luck, luckTone(info.luck)], ["Ý nghĩa", info.summary]]} />
    </Card>
  );
}

function lucNhamDetail(name: string, title: string) {
  const info = findInfo(LUC_NHAM_INFO, name);
  if (!info) return undefined;
  return (
    <Card title={title} sub={<p>Lục Nhâm · vị trí thứ {info.order} trong vòng 6 cung · {info.luck}</p>}>
      <CardRows rows={[["Tính chất", info.luck, luckTone(info.luck)], ["Ý nghĩa", info.summary]]} />
    </Card>
  );
}

function tuongQuanDetail(name: string) {
  const info = findInfo(TUONG_QUAN_INFO, name);
  if (!info) return undefined;
  return (
    <Card title={info.name} sub={<p>{info.relation} · {info.luck}</p>}>
      <CardRows rows={[["Quan hệ Can – Chi", info.relation], ["Tính chất", info.luck, luckTone(info.luck)], ["Ví dụ", info.example], ["Ý nghĩa", info.summary]]} />
    </Card>
  );
}

/** Lời tiết khí theo lịch dân gian: tên gọi, vị trí trong tháng, bài thơ chọn ngày và chú thích của tháng. */
function TietKhiCard({ name, withAstronomy = false }: { name: string; withAstronomy?: boolean }) {
  const tho = tietKhiTho(name);
  if (!tho) return null;
  const astronomy = TIET_KHI_INFO[name];
  return (
    <Card
      title={name}
      sub={
        <>
          <p className="xn-tho__subtitle">{tho.subtitle}</p>
          <p>{tho.period}</p>
        </>
      }
    >
      <div className="xn-tho">
        <p className="xn-tho__sep" aria-hidden="true">*****</p>
        <div className="xn-tho__verse">
          {tho.verse.map((line, index) => (line ? <p key={index}>{line}</p> : <span key={index} className="xn-tho__break" aria-hidden="true" />))}
        </div>
        <p className="xn-tho__sep" aria-hidden="true">*****</p>
        <div className="xn-tho__notes">
          <b>Chú thích thêm</b>
          {tho.notes.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        {withAstronomy && astronomy && <p className="xn-tho__astro">{astronomy.summary}</p>}
      </div>
    </Card>
  );
}

function tietKhiDetail(name: string) {
  const info = TIET_KHI_INFO[name];
  if (!info) return undefined;
  return (
    <Card title={name} sub={<p>{info.kind} · mùa {info.season}</p>}>
      <CardRows
        rows={[
          ["Nghĩa của tên", info.meaning],
          ["Loại", info.kind],
          ["Mùa", info.season],
          ["Ngày dương lịch thường gặp", info.approxDate],
          ["Kinh độ Mặt Trời", `${info.longitude}°`],
          ["Ý nghĩa", info.summary],
        ]}
      />
    </Card>
  );
}

function xuatHanhDetail(name: string) {
  const info = findInfo(XUAT_HANH_INFO, name);
  if (!info) return undefined;
  return (
    <Card title={`Xuất hành ${name}`} sub={<p>{info.luck}</p>}>
      <CardRows rows={[["Tính chất", info.luck, luckTone(info.luck)], ["Áp dụng cho tháng âm", info.months], ["Ý nghĩa", info.summary]]} />
    </Card>
  );
}

function danGianDetail(name: string) {
  const info = findInfo(DAN_GIAN_INFO, name);
  if (!info) return undefined;
  return (
    <Card title={name} sub={<p>Quan niệm dân gian · {info.luck}</p>}>
      <CardRows rows={[["Tính chất", info.luck, luckTone(info.luck)], ["Ý nghĩa", info.summary]]} />
    </Card>
  );
}

/** Lời giải ngắn: thẻ nhỏ căn giữa hiện khi rê chuột. */
function NoteCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="xn-note">
      <b>{title}</b>
      <p>{text}</p>
    </div>
  );
}

/** Thẻ bảng: dải tiêu đề tím đậm, các hàng nhãn | nội dung. */
function Card({ title, sub, children, wide = false }: { title: string; sub?: ReactNode; children?: ReactNode; wide?: boolean }) {
  return (
    <div className={`xn-card ${wide ? "is-wide" : ""}`}>
      <header className="xn-card__band">
        <strong>{title}</strong>
        {sub && <div className="xn-card__sub">{sub}</div>}
      </header>
      {children}
    </div>
  );
}

function CardRows({ rows }: { rows: Array<[string, ReactNode, string?] | false | null | undefined> }) {
  const visible = rows.filter((row): row is [string, ReactNode, string?] => Boolean(row && row[1]));
  if (visible.length === 0) return null;
  return (
    <table className="xn-card__rows">
      <tbody>
        {visible.map(([label, value, tone]) => (
          <tr key={label} className={tone ? `is-${tone}` : ""}>
            <th scope="row">{label}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const joinList = (items?: string[]) => (items && items.length ? `${items.join(", ")}.` : "");

function HourCard({ profile }: { profile: XemNgayProfile }) {
  const fmt = (range: string) => {
    const [from, to] = range.split("-").map(Number);
    return `${pad(from)}:00 – ${pad((to + 23) % 24)}:59`;
  };
  return (
    <Card title="Can Chi giờ theo ngày">
      <table className="xn-card__rows xn-card__rows--center">
        <tbody>
          {profile.hours.map((item) => (
            <tr key={item.chi} className={item.canChi === profile.overview.hour ? "is-current" : ""}>
              <td className="xn-num">{fmt(item.range)}</td>
              <td><b>{item.canChi}</b></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function PhoiQueCard({ name, upper, luck, hexagram }: { name: string; upper: number; luck: number; hexagram: string }) {
  return (
    <Card title="Biểu đồ Lục thập Giáp Tý phối quẻ">
      <table className="xn-card__rows xn-card__rows--center xn-phoique">
        <tbody>
          <tr><td className="xn-phoique__num">{upper}</td></tr>
          <tr><td><b>{name}</b></td></tr>
          <tr><td className="xn-phoique__num">{luck}</td></tr>
          <tr><td className="xn-phoique__gua">{hexagram}</td></tr>
        </tbody>
      </table>
    </Card>
  );
}

function TrucCard({ name }: { name: string }) {
  const info = findInfo(TRUC_INFO, name);
  if (!info) return <Card title={`Trực ${name}`} />;
  return (
    <Card title={`Trực ${name}`} sub={<><p>{info.luck}{info.luckNote ? ` — ${info.luckNote}` : ""}</p><p>{info.summary}</p></>} wide>
      <CardRows
        rows={[
          ["Bành Tổ kị nhật", info.saying],
          [`Ý nghĩa trực ${name}`, info.meaning],
          ["Trực thuộc ngũ hành", info.element],
          ["Nên", joinList(info.suitable), "good"],
          ["Kị", joinList(info.avoid), "bad"],
        ]}
      />
    </Card>
  );
}

function TuCard({ name }: { name: string }) {
  const info = findInfo(TU28_INFO, name);
  if (!info) return <Card title={name} />;
  return (
    <Card title={info.name} sub={<p>Tướng tinh: {info.animal} · {info.luck} · chủ trị {info.weekday}</p>} wide>
      <CardRows
        rows={[
          ["Thất diệu", info.element],
          ["Tứ tượng", info.group],
          ["Ý nghĩa", info.summary],
          ["Nên làm", joinList(info.suitable), "good"],
          ["Kiêng cữ", joinList(info.avoid), "bad"],
          ["Ngoại lệ", info.exception],
        ]}
      />
    </Card>
  );
}

/** Lưới phi tinh 3×3 (Bắc ở trên): sao đang xét vào giữa, các sao còn lại bay thuận như trang mẫu. */
const FLIGHT_ORDER = [4, 0, 3, 2, 7, 1, 6, 5, 8]; // ô lưới theo thứ tự bay: giữa, TB, T, ĐB, N, B, TN, Đ, ĐN
const GRID_LABELS = ["Tây Bắc", "Bắc", "Đông Bắc", "Tây", "Trung cung", "Đông", "Tây Nam", "Nam", "Đông Nam"];
const STAR_TONES = ["", "white", "black", "jade", "green", "yellow", "white", "red", "white", "purple"];

function flyingGrid(center: number) {
  const grid = Array<number>(9).fill(0);
  FLIGHT_ORDER.forEach((cell, step) => {
    grid[cell] = ((center - 1 + step) % 9) + 1;
  });
  return grid;
}

function CuuTinhCard({ name }: { name: string }) {
  const info = findInfo(CUU_TINH_INFO, name);
  if (!info) return <Card title={`Sao ${name}`} />;
  const grid = flyingGrid(info.number);
  return (
    <Card title={`Sao ${info.name}`} sub={<p>{info.star} · {info.element} · màu {info.color.toLocaleLowerCase("vi")} · {info.luck}</p>}>
      <div className="xn-loshu" role="img" aria-label={`Phi tinh: ${grid.map((value, index) => `${GRID_LABELS[index]} ${value}`).join(", ")}`}>
        {grid.map((value, index) => (
          <span key={index} className={`xn-loshu__cell is-${STAR_TONES[value]} ${index === 4 ? "is-center" : ""}`}>
            <b>{value}</b>
            <small>{GRID_LABELS[index]}</small>
          </span>
        ))}
      </div>
    </Card>
  );
}

function DongCongCard({ entry, day }: { entry: NonNullable<XemNgayProfile["dongCong"]>; day: string }) {
  return (
    <Card title={entry.title} wide>
      <table className="xn-card__grid">
        <thead>
          <tr><th>Ngày</th><th>Nghi – Kị</th><th>Kiết – Hung</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><b>{day}</b></td>
            <td>
              {entry.summary}
              {entry.suitable.length > 0 && <span className="xn-card__good"> Nên: {joinList(entry.suitable)}</span>}
            </td>
            <td className={luckClass(entry.rating)}><b>{entry.rating}</b></td>
          </tr>
        </tbody>
      </table>
    </Card>
  );
}

function MucCard({ no, highlight }: { no: number; highlight: string }) {
  const muc = TRANG_TRINH_MUC[no];
  if (!muc) return <Card title={`Mục ${pad(no)}`} />;
  const [stem, branch] = highlight.split(" ");
  return (
    <Card title={`Mục ${pad(no)} · ${muc.title}`} sub={<p>{muc.summary}</p>} wide>
      {muc.tables.map((table, index) => (
        <div className="xn-muc-table" key={index}>
          {table.caption && <p className="xn-muc-table__caption">{table.caption}</p>}
          <div className="xn-muc-table__scroll">
            <table className="xn-card__grid xn-card__grid--days">
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
        <ul className="xn-card__notes">
          {muc.notes.map((note) => <li key={note}>{note}</li>)}
        </ul>
      )}
    </Card>
  );
}
