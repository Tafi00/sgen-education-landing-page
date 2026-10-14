/**
 * Lịch âm Việt Nam (múi giờ GMT+7) theo thuật toán thiên văn của Hồ Ngọc Đức,
 * cùng các trụ Can Chi dùng cho công cụ xem ngày.
 */

export const STEMS = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"] as const;
export const BRANCHES = ["Tý", "Sửu", "Dần", "Mẹo", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"] as const;
export const STEM_ELEMENTS = ["Mộc", "Mộc", "Hỏa", "Hỏa", "Thổ", "Thổ", "Kim", "Kim", "Thủy", "Thủy"] as const;
export const BRANCH_ELEMENTS = ["Thủy", "Thổ", "Mộc", "Mộc", "Thổ", "Hỏa", "Hỏa", "Thổ", "Kim", "Kim", "Thổ", "Thủy"] as const;
export const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"] as const;

export type CanChi = { stem: number; branch: number; name: string };

const TIME_ZONE = 7;
const PI = Math.PI;

export const mod = (value: number, base: number) => ((value % base) + base) % base;

export function canChi(stem: number, branch: number): CanChi {
  const s = mod(stem, 10);
  const b = mod(branch, 12);
  return { stem: s, branch: b, name: `${STEMS[s]} ${BRANCHES[b]}` };
}

/** Vị trí 0..59 trong Lục thập hoa giáp. */
export function sexagenaryIndex(value: CanChi) {
  return mod(6 * value.stem - 5 * value.branch, 60);
}

export function canChiFromIndex(index: number) {
  return canChi(mod(index, 10), mod(index, 12));
}

export function jdFromDate(dd: number, mm: number, yy: number) {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  if (jd < 2299161) jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  return jd;
}

export function jdToDate(jd: number): [number, number, number] {
  let a: number;
  let b: number;
  let c: number;
  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return [day, month, year];
}

function newMoon(k: number) {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 -= 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  const deltat = T < -11
    ? 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3
    : -0.000278 + 0.000265 * T + 0.000262 * T2;
  return Jd1 + C1 - deltat;
}

/** Kinh độ Mặt Trời (radian) tại ngày Julius `jdn`. */
function sunLongitudeRad(jdn: number) {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L -= PI * 2 * Math.floor(L / (PI * 2));
  return L;
}

function getNewMoonDay(k: number) {
  return Math.floor(newMoon(k) + 0.5 + TIME_ZONE / 24);
}

/** Cung kinh độ Mặt Trời 0..11 (mỗi cung 30°) lúc nửa đêm đầu ngày. */
function getSunLongitudeSector(dayNumber: number) {
  return Math.floor((sunLongitudeRad(dayNumber - 0.5 - TIME_ZONE / 24) / PI) * 6);
}

function getLunarMonth11(yy: number) {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k);
  if (getSunLongitudeSector(nm) >= 9) nm = getNewMoonDay(k - 1);
  return nm;
}

function getLeapMonthOffset(a11: number) {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitudeSector(getNewMoonDay(k + i));
  do {
    last = arc;
    i += 1;
    arc = getSunLongitudeSector(getNewMoonDay(k + i));
  } while (arc !== last && i < 14);
  return i - 1;
}

export type LunarDate = { day: number; month: number; year: number; leap: boolean; monthStartJd: number; monthDays: number };

export function solarToLunar(dd: number, mm: number, yy: number): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthK = k + 1;
  let monthStart = getNewMoonDay(monthK);
  if (monthStart > dayNumber) {
    monthK = k;
    monthStart = getNewMoonDay(k);
  }
  let a11 = getLunarMonth11(yy);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let leap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) leap = true;
    }
  }
  if (lunarMonth > 12) lunarMonth -= 12;
  if (lunarMonth >= 11 && diff < 4) lunarYear -= 1;
  const monthDays = getNewMoonDay(monthK + 1) - monthStart;
  return { day: lunarDay, month: lunarMonth, year: lunarYear, leap, monthStartJd: monthStart, monthDays };
}

export function lunarToSolar(lunarDay: number, lunarMonth: number, lunarYear: number, lunarLeap: boolean): [number, number, number] | null {
  let a11: number;
  let b11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1);
    b11 = getLunarMonth11(lunarYear);
  } else {
    a11 = getLunarMonth11(lunarYear);
    b11 = getLunarMonth11(lunarYear + 1);
  }
  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) off += 12;
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) leapMonth += 12;
    if (lunarLeap && lunarMonth !== leapMonth) return null;
    if (lunarLeap || off >= leapOff) off += 1;
  } else if (lunarLeap) {
    return null;
  }
  const monthStart = getNewMoonDay(k + off);
  return jdToDate(monthStart + lunarDay - 1);
}

/** Tháng nhuận của năm âm lịch (0 nếu không có). */
export function leapMonthOfYear(lunarYear: number) {
  const a11 = getLunarMonth11(lunarYear - 1);
  const b11 = getLunarMonth11(lunarYear);
  if (b11 - a11 <= 365) return 0;
  const leapOff = getLeapMonthOffset(a11);
  return mod(leapOff - 2, 12) || 12;
}

export const SOLAR_TERMS = [
  "Xuân Phân", "Thanh Minh", "Cốc Vũ", "Lập Hạ", "Tiểu Mãn", "Mang Chủng",
  "Hạ Chí", "Tiểu Thử", "Đại Thử", "Lập Thu", "Xử Thử", "Bạch Lộ",
  "Thu Phân", "Hàn Lộ", "Sương Giáng", "Lập Đông", "Tiểu Tuyết", "Đại Tuyết",
  "Đông Chí", "Tiểu Hàn", "Đại Hàn", "Lập Xuân", "Vũ Thủy", "Kinh Trập",
] as const;

/**
 * Tiết khí (24 khí, mỗi khí 15°) đang hiệu lực vào ngày Julius `jd`, tại `hours` giờ (giờ Việt Nam) trong ngày;
 * mặc định lúc 0 giờ.
 */
export function solarTermIndex(jd: number, hours = 0) {
  return Math.floor((sunLongitudeRad(jd - 0.5 - TIME_ZONE / 24 + hours / 24) / PI) * 12);
}

/** Ngày Julius bắt đầu của tiết khí chứa ngày `jd` (lùi tới khi đổi khí). */
export function solarTermStart(jd: number) {
  const current = solarTermIndex(jd);
  let day = jd;
  while (solarTermIndex(day - 1) === current) day -= 1;
  return day;
}

/**
 * Tháng tiết khí theo Địa chi (0 = Tý ... 2 = Dần): tháng Dần bắt đầu từ Lập Xuân.
 * Dùng cho Thập nhị Trực và các sao an theo tiết; `hours` là giờ trong ngày đang xem.
 */
export function solarMonthBranch(jd: number, hours = 0) {
  const term = solarTermIndex(jd, hours); // 0 = Xuân Phân
  // Lập Xuân (21) → Dần; mỗi tiết (2 khí) sang một chi.
  return mod(Math.floor(mod(term - 21, 24) / 2) + 2, 12);
}

export function dayCanChi(jd: number) {
  return canChi(jd + 9, jd + 1);
}

export function yearCanChi(lunarYear: number) {
  return canChi(lunarYear + 6, lunarYear + 8);
}

/** Can Chi tháng theo tháng âm lịch (tháng Giêng là Dần). */
export function monthCanChi(lunarYear: number, lunarMonth: number) {
  return canChi(lunarYear * 12 + lunarMonth + 3, lunarMonth + 1);
}

/** Chi giờ: 23h–1h là Tý. */
export function hourBranch(hour: number) {
  return mod(Math.floor((hour + 1) / 2), 12);
}

/** Can giờ theo can ngày (ngũ thử độn); giờ Tý muộn (23h) vẫn tính theo ngày đang xem như trang mẫu. */
export function hourCanChi(dayStem: number, branch: number) {
  return canChi(mod(dayStem, 5) * 2 + branch, branch);
}
