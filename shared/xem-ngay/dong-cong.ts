/**
 * Đổng Công soạn trạch nhựt: lời luận của từng Can Chi trong mỗi tháng tiết khí (tháng Giêng = tháng Dần), lấy nguyên
 * văn từ giáo trình của khách — dữ liệu ở `dong-cong-data.ts`, sinh bằng `scripts/extract_trach_cat.py`.
 */
import { BRANCHES, sexagenaryIndex } from "./calendar";
import type { DayContext } from "./context";
import { DONG_CONG_MONTHS, DONG_CONG_TEXTS } from "./dong-cong-data";

/** Lời luận một ngày theo Đổng Công, đủ 4 cột như bảng giáo trình: Ngày · Nghi – Kị · Ảnh hưởng · Kiết – Hung. */
export type DongCongEntry = {
  /** Trực + Chi, vd "Ngày Bế Dậu". */
  title: string;
  /** Sao / cách cục ghi kèm tên ngày (vd "Thiên Tặc"). */
  label?: string;
  /** Đại Kiết, Thứ Kiết, Thứ Hung, Đại Hung. */
  rating: string;
  /** Cột "Nghi – Kị" (xuống dòng bằng "\n"). */
  nghiKi: string;
  /** Cột "Ảnh hưởng" (xuống dòng bằng "\n"). */
  anhHuong: string;
  /** Tháng tiết khí và hai tiết của tháng, vd "Tháng Chín" · "Hàn Lộ - Sương Giáng". */
  month: string;
  terms: string;
  /** Bảng hung sát của tháng: [Thời gian, Hung sát, Phương, Hướng, Kị]. */
  hungSat: string[][];
};

const RATINGS = ["Đại Kiết", "Thứ Kiết", "Thứ Hung", "Đại Hung"] as const;

export function getDongCong(ctx: DayContext): DongCongEntry | null {
  const month = DONG_CONG_MONTHS[(ctx.solarMonthBranch + 10) % 12];
  const row = month?.days[sexagenaryIndex(ctx.day)];
  if (!month || !row) return null;
  const branch = BRANCHES[ctx.day.branch];
  const [officer, label] = month.groups[branch] ?? ["", ""];
  const [nghiKi, anhHuong, rating] = row;
  return {
    title: `Ngày ${officer} ${branch}`,
    label: label || undefined,
    rating: RATINGS[rating],
    nghiKi: DONG_CONG_TEXTS[nghiKi],
    anhHuong: DONG_CONG_TEXTS[anhHuong],
    month: month.name,
    terms: month.terms,
    hungSat: month.hungSat,
  };
}
