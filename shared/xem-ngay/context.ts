import {
  BRANCHES,
  type CanChi,
  canChi,
  dayCanChi,
  hourBranch,
  hourCanChi,
  jdFromDate,
  jdToDate,
  type LunarDate,
  monthCanChi,
  SOLAR_TERMS,
  solarMonthBranch,
  solarTermIndex,
  solarTermStart,
  solarToLunar,
  STEMS,
  WEEKDAYS,
  yearCanChi,
} from "./calendar";

/** Mọi dữ kiện lịch của một thời điểm xem; các mô-đun sao, Đổng Công, Trạng Trình… chỉ đọc từ đây. */
export type DayContext = {
  /** "YYYY-MM-DD" dương lịch. */
  date: string;
  solar: { year: number; month: number; day: number };
  weekday: string;
  jd: number;
  hour: number;
  minute: number;
  lunar: LunarDate;
  /** Can Chi năm âm lịch, tháng âm lịch, ngày, giờ. */
  year: CanChi;
  month: CanChi;
  day: CanChi;
  time: CanChi;
  /** Chi tháng theo tiết khí tại giờ đang xem (Lập Xuân → Dần = 2). Dùng cho Trực, Cửu tinh, Đổng Công. */
  solarMonthBranch: number;
  /** Chỉ số tiết khí tại giờ đang xem (0 = Xuân Phân … 23 = Kinh Trập) và tên. */
  solarTerm: number;
  solarTermName: string;
  /** Ngày Julius bắt đầu tiết khí hiện tại. */
  solarTermStartJd: number;
};

export function parseDateString(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

export function formatDateString(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function addDaysToDate(date: string, delta: number) {
  const { year, month, day } = parseDateString(date);
  const [d, m, y] = jdToDate(jdFromDate(day, month, year) + delta);
  return formatDateString(y, m, d);
}

export function buildDayContext(date: string, hour = 12, minute = 0): DayContext {
  const solar = parseDateString(date);
  const jd = jdFromDate(solar.day, solar.month, solar.year);
  const lunar = solarToLunar(solar.day, solar.month, solar.year);
  const day = dayCanChi(jd);
  const branch = hourBranch(hour);
  // Tiết khí lấy tại đúng giờ đang xem: ngày giao tiết đổi tháng tiết kể từ giờ giao khí.
  const clock = hour + minute / 60;
  const term = solarTermIndex(jd, clock);
  return {
    date,
    solar,
    weekday: WEEKDAYS[(jd + 1) % 7],
    jd,
    hour,
    minute,
    lunar,
    year: yearCanChi(lunar.year),
    month: monthCanChi(lunar.year, lunar.month),
    day,
    time: hourCanChi(day.stem, branch),
    solarMonthBranch: solarMonthBranch(jd, clock),
    solarTerm: term,
    solarTermName: SOLAR_TERMS[term],
    solarTermStartJd: solarTermStart(jd),
  };
}

export const stemName = (index: number) => STEMS[index];
export const branchName = (index: number) => BRANCHES[index];
export { canChi };
