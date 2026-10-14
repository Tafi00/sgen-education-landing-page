/** Hồ sơ xem ngày tốt xấu: gom mọi phép an ngày của một thời điểm cho giao diện. */
import { BRANCH_ELEMENTS, BRANCHES, hourCanChi, STEM_ELEMENTS, STEMS } from "./calendar";
import { buildDayContext, type DayContext } from "./context";
import { getDongCong } from "./dong-cong";
import * as R from "./rules";
import { getDayStars } from "./stars";
import { getTrangTrinhMuc } from "./trang-trinh";

export type PillarView = { label: string; name: string; upper: number; luck: number; hexagram: string };

export function getXemNgayProfile(date: string, hour = 12, minute = 0) {
  const ctx = buildDayContext(date, hour, minute);
  return buildProfile(ctx);
}

export type XemNgayProfile = ReturnType<typeof buildProfile>;

function buildProfile(ctx: DayContext) {
  const pillar = (label: string, value: DayContext["day"]): PillarView => {
    const que = R.getPhoiQue(value);
    return { label, name: value.name, upper: que.upper, luck: que.luck, hexagram: que.name };
  };
  const officer = R.getDayOfficer(ctx);
  const tu28 = R.getTu28(ctx);
  const hourOfficers = R.getHourOfficers(ctx);
  const hours = hourOfficers.map((item) => ({
    ...item,
    canChi: hourCanChi(ctx.day.stem, item.branch).name,
    lucNham: R.getHourLucNham(ctx, item.branch),
    nineStar: R.getHourStar(ctx, item.branch),
  }));
  const tide = R.getTide(ctx);
  const empty = R.getEmptyHours(ctx);
  return {
    ctx,
    date: ctx.date,
    weekday: ctx.weekday,
    solar: ctx.solar,
    lunar: ctx.lunar,
    hour: ctx.hour,
    minute: ctx.minute,
    pillars: [pillar("Năm", ctx.year), pillar("Tháng", ctx.month), pillar("Ngày", ctx.day), pillar("Giờ", ctx.time)],
    overview: {
      hour: ctx.time.name,
      napAm: napAm(ctx.day.stem, ctx.day.branch),
      truc: R.getTruc(ctx),
      officer,
      monthSize: R.getMonthSize(ctx),
      tu28,
      relation: R.getStemBranchRelation(ctx.day),
      stem: `${STEMS[ctx.day.stem]} (${STEM_ELEMENTS[ctx.day.stem]})`,
      branch: `${BRANCHES[ctx.day.branch]} (${BRANCH_ELEMENTS[ctx.day.branch]})`,
    },
    info: {
      yearStar: R.getYearStar(ctx),
      monthStar: R.getMonthStar(ctx),
      dayStar: R.getDayStar(ctx),
      hourStar: R.getHourStar(ctx),
      lucNham: R.getDayLucNham(ctx),
      solarTerms: R.getSolarTermPair(ctx),
      xuatHanh: R.getXuatHanh(ctx),
      monthFirstDay: R.getMonthFirstDay(ctx).name,
      folk: R.getFolkDay(ctx),
    },
    stars: getDayStars(ctx),
    tamSat: {
      year: R.getTamSat(ctx.year.branch),
      month: R.getTamSat(ctx.month.branch),
      day: R.getTamSat(ctx.day.branch),
      hour: R.getTamSat(ctx.time.branch),
    },
    hours,
    goodHours: hours.filter((item) => item.type === "Hoàng Đạo"),
    hourStars: R.getHourStarTable(ctx),
    tide,
    clashDay: R.getClashingAges(ctx.day),
    clashMonth: R.getClashingAges(ctx.month),
    directions: R.getDirections(ctx),
    emptyHours: empty,
    dongCong: getDongCong(ctx),
    trangTrinh: getTrangTrinhMuc(ctx.day.name),
  };
}

const NAP_AM = [
  "Hải Trung Kim", "Lư Trung Hỏa", "Đại Lâm Mộc", "Lộ Bàng Thổ", "Kiếm Phong Kim", "Sơn Đầu Hỏa",
  "Giản Hạ Thủy", "Thành Đầu Thổ", "Bạch Lạp Kim", "Dương Liễu Mộc", "Tuyền Trung Thủy", "Ốc Thượng Thổ",
  "Thích Lịch Hỏa", "Tùng Bách Mộc", "Trường Lưu Thủy", "Sa Trung Kim", "Sơn Hạ Hỏa", "Bình Địa Mộc",
  "Bích Thượng Thổ", "Kim Bạch Kim", "Phú Đăng Hỏa", "Thiên Hà Thủy", "Đại Trạch Thổ", "Thoa Xuyến Kim",
  "Tang Đố Mộc", "Đại Khê Thủy", "Sa Trung Thổ", "Thiên Thượng Hỏa", "Thạch Lựu Mộc", "Đại Hải Thủy",
];

/** Nạp âm của Can Chi (mỗi cặp hai ngày liền nhau chung một nạp âm). */
export function napAm(stem: number, branch: number) {
  const index = ((6 * stem - 5 * branch) % 60 + 60) % 60;
  return NAP_AM[Math.floor(index / 2)];
}

export { addDaysToDate, buildDayContext, formatDateString, parseDateString } from "./context";
export { lunarToSolar, solarToLunar, leapMonthOfYear, BRANCHES, STEMS } from "./calendar";
export { hourRange } from "./rules";
