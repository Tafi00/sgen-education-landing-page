/**
 * Các phép an ngày theo lịch pháp Việt Nam cho công cụ xem ngày:
 * Trực, Hoàng/Hắc đạo, Nhị thập bát tú, Cửu tinh, Lục Nhâm, xuất hành Khổng Minh,
 * tam sát, sao theo giờ, nước lớn ròng, tuổi xung, hướng thần, giờ không vong, quan niệm dân gian.
 */
import { BRANCH_ELEMENTS, BRANCHES, type CanChi, canChi, canChiFromIndex, dayCanChi, mod, sexagenaryIndex, SOLAR_TERMS, solarTermIndex, STEM_ELEMENTS, STEMS } from "./calendar";
import type { DayContext } from "./context";

export const TRUC_NAMES = ["Kiên", "Trừ", "Mãn", "Bình", "Định", "Chấp", "Phá", "Nguy", "Thành", "Thâu", "Khai", "Bế"] as const;

/** Thập nhị Trực: Kiến khởi tại chi tháng tiết khí. */
export function getTruc(ctx: DayContext) {
  return TRUC_NAMES[mod(ctx.day.branch - ctx.solarMonthBranch, 12)];
}

export const OFFICERS = ["Thanh Long", "Minh Đường", "Thiên Hình", "Chu Tước", "Kim Quỹ", "Kim Đường", "Bạch Hổ", "Ngọc Đường", "Thiên Lao", "Huyền Vũ", "Tư Mệnh", "Câu Trận"] as const;
const AUSPICIOUS_OFFICERS = new Set(["Thanh Long", "Minh Đường", "Kim Quỹ", "Kim Đường", "Ngọc Đường", "Tư Mệnh"]);
export const officerType = (name: string) => (AUSPICIOUS_OFFICERS.has(name) ? "Hoàng Đạo" : "Hắc Đạo");

/** Thanh Long khởi theo chi tháng (Dần, Thân → Tý; Mẹo, Dậu → Dần; …) rồi đi thuận. */
function officerAt(baseBranch: number, targetBranch: number) {
  const start = mod((mod(baseBranch - 2, 6)) * 2, 12);
  return OFFICERS[mod(targetBranch - start, 12)];
}

/** Thần trực ngày (Hoàng đạo / Hắc đạo) theo chi tháng âm lịch. */
export function getDayOfficer(ctx: DayContext) {
  const name = officerAt(ctx.month.branch, ctx.day.branch);
  return { name, type: officerType(name) };
}

const HOUR_RANGES = ["23-01", "01-03", "03-05", "05-07", "07-09", "09-11", "11-13", "13-15", "15-17", "17-19", "19-21", "21-23"];
export const hourRange = (branch: number) => HOUR_RANGES[branch];

/** Thần trực của 12 giờ trong ngày (Thanh Long khởi theo chi ngày). */
export function getHourOfficers(ctx: DayContext) {
  return BRANCHES.map((_, branch) => {
    const name = officerAt(ctx.day.branch, branch);
    return { branch, chi: BRANCHES[branch], range: HOUR_RANGES[branch], name, type: officerType(name) };
  });
}

export const TU28 = [
  "Giác Mộc Giao", "Can Kim Long", "Đê Thổ Lạc", "Phòng Nhật Thố", "Tâm Nguyệt Hồ", "Vĩ Hỏa Hổ", "Cơ Thủy Báo",
  "Đẩu Mộc Giải", "Ngưu Kim Ngưu", "Nữ Thổ Bức", "Hư Nhật Thử", "Nguy Nguyệt Yến", "Thất Hỏa Trư", "Bích Thủy Du",
  "Khuê Mộc Lang", "Lâu Kim Cẩu", "Vị Thổ Trĩ", "Mão Nhật Kê", "Tất Nguyệt Ô", "Chủy Hỏa Hầu", "Sâm Thủy Viên",
  "Tỉnh Mộc Can", "Quỷ Kim Dương", "Liễu Thổ Chương", "Tinh Nhật Mã", "Trương Nguyệt Lộc", "Dực Hỏa Xà", "Chẩn Thủy Dẫn",
] as const;
/** Đánh giá Tốt/Xấu của 28 sao theo trang mẫu. */
const TU28_GOOD = new Set(["Giác Mộc Giao", "Phòng Nhật Thố", "Vĩ Hỏa Hổ", "Cơ Thủy Báo", "Đẩu Mộc Giải", "Thất Hỏa Trư", "Bích Thủy Du", "Lâu Kim Cẩu", "Vị Thổ Trĩ", "Tất Nguyệt Ô", "Sâm Thủy Viên", "Tỉnh Mộc Can", "Trương Nguyệt Lộc", "Chẩn Thủy Dẫn"]);

/** Nhị thập bát tú: chu kỳ 28 ngày (ngày 14/10/2026 là sao Chẩn). */
export function getTu28(ctx: DayContext) {
  const name = TU28[mod(ctx.jd - 2461328 + 27, 28)];
  return { name, luck: TU28_GOOD.has(name) ? "Tốt" : "Xấu" };
}

export const CUU_TINH = ["Nhất Bạch", "Nhị Hắc", "Tam Bích", "Tứ Lục", "Ngũ Hoàng", "Lục Bạch", "Thất Xích", "Bát Bạch", "Cửu Tử"] as const;
const star = (value: number) => CUU_TINH[mod(value - 1, 9)];

export function getYearStar(ctx: DayContext) {
  return star(11 - mod(ctx.lunar.year, 9));
}

/** Tháng Giêng: năm Tý Ngọ Mẹo Dậu khởi Bát Bạch, Thìn Tuất Sửu Mùi khởi Ngũ Hoàng, Dần Thân Tị Hợi khởi Nhị Hắc; đi nghịch. */
export function getMonthStar(ctx: DayContext) {
  const first = [8, 5, 2][mod(ctx.year.branch, 3)];
  return star(first - (ctx.lunar.month - 1));
}

/** Số khởi Cửu tinh ngày theo nhóm 4 khí (chỉ số khí 0 = Xuân Phân); nửa dương đi thuận, nửa âm đi nghịch. */
const DAY_STAR_START = [7, 7, 4, 4, 4, 4, 9, 9, 9, 9, 3, 3, 3, 3, 6, 6, 6, 6, 1, 1, 1, 1, 7, 7];

/** Cửu tinh ngày: lấy số khởi của nhóm khí hiện tại tại ngày Giáp Tý gần nhất (về trước) rồi đếm tới ngày xem. */
export function getDayStar(ctx: DayContext) {
  const days = mod(sexagenaryIndex(ctx.day), 60);
  const first = DAY_STAR_START[ctx.solarTerm];
  return isYangHalf(ctx) ? star(first + days) : star(first - days);
}

/** Cửu tinh giờ: ngày Tý Ngọ Mẹo Dậu khởi 1 (dương) / 9 (âm); Thìn Tuất Sửu Mùi khởi 4 / 6; Dần Thân Tị Hợi khởi 7 / 3. */
export function getHourStar(ctx: DayContext, branch = ctx.time.branch) {
  const yang = isYangHalf(ctx);
  const group = mod(ctx.day.branch, 3);
  const first = yang ? [1, 4, 7][group] : [9, 6, 3][group];
  return yang ? star(first + branch) : star(first - branch);
}

/** Nửa năm dương độn: từ Đông chí đến trước Hạ chí. */
function isYangHalf(ctx: DayContext) {
  const term = ctx.solarTerm; // 0 = Xuân Phân
  return term >= 18 || term < 6;
}

export const LUC_NHAM = ["Đại An", "Lưu Liên", "Tốc Hỷ", "Xích Khẩu", "Tiểu Cát", "Không Vong"] as const;

export function getDayLucNham(ctx: DayContext) {
  return LUC_NHAM[mod(ctx.lunar.month + ctx.lunar.day - 2, 6)];
}

export function getHourLucNham(ctx: DayContext, branch: number) {
  return LUC_NHAM[mod(ctx.lunar.month + ctx.lunar.day + branch - 2, 6)];
}

const XUAT_HANH_A = ["Đường Phong", "Kim Thổ", "Kim Dương", "Thuần Dương", "Đạo Tặc", "Hảo Thương"];
const XUAT_HANH_B = ["Thiên Đạo", "Thiên Môn", "Thiên Đường", "Thiên Tài", "Thiên Tặc", "Thiên Dương", "Thiên Hầu", "Thiên Thương"];
const XUAT_HANH_C = ["Chu Tước", "Bạch Hổ Đầu", "Bạch Hổ Kiếp", "Bạch Hổ Túc", "Huyền Vũ", "Thanh Long Đầu", "Thanh Long Kiếp", "Thanh Long Túc"];

/** Ngày xuất hành theo Khổng Minh: tháng 1-4-7-10, 2-5-8-11, 3-6-9-12 dùng ba vòng khác nhau. */
export function getXuatHanh(ctx: DayContext) {
  const month = ctx.lunar.month;
  const index = ctx.lunar.day - 1;
  if (month % 3 === 1) return XUAT_HANH_A[index % 6];
  // Trang mẫu ghi ngày 21 các tháng 2-5-8-11 là Thiên Thương (khác vòng 8 ngày).
  if (month % 3 === 2) return ctx.lunar.day === 21 ? "Thiên Thương" : XUAT_HANH_B[index % 8];
  return XUAT_HANH_C[index % 8];
}

export function getMonthFirstDay(ctx: DayContext) {
  return dayCanChi(ctx.lunar.monthStartJd);
}

export const getMonthSize = (ctx: DayContext) => (ctx.lunar.monthDays >= 30 ? "Tháng Đủ" : "Tháng Thiếu");

const GENERATES: Record<string, string> = { Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim", Kim: "Thủy", Thủy: "Mộc" };
const CONTROLS: Record<string, string> = { Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim", Kim: "Mộc" };

/** Tương quan ngũ hành giữa Can và Chi ngày. */
export function getStemBranchRelation(day: CanChi) {
  const stem = STEM_ELEMENTS[day.stem];
  const branch = BRANCH_ELEMENTS[day.branch];
  if (stem === branch) return "Bát Chuyên Đồng Khí";
  if (GENERATES[stem] === branch) return "Bảo Nhật Đại Kiết";
  if (GENERATES[branch] === stem) return "Thoa Nhật Tiểu Kiết";
  if (CONTROLS[stem] === branch) return "Chế Nhật Tiểu Hung";
  return "Phạt Nhật Đại Hung";
}

/** Tam sát theo tam hợp của chi: Thân Tý Thìn ở Nam, Dần Ngọ Tuất ở Bắc, Tị Dậu Sửu ở Đông, Hợi Mẹo Mùi ở Tây. */
const TAM_SAT = ["Tây Nam - Chánh Nam - Đông Nam", "Tây Bắc - Chánh Bắc - Đông Bắc", "Đông Bắc - Chánh Đông - Đông Nam", "Tây Nam - Chánh Tây - Tây Bắc"];
export function getTamSat(branch: number) {
  // nhóm theo tam hợp: Thân Tý Thìn (0), Dần Ngọ Tuất (1), Tị Dậu Sửu (2), Hợi Mẹo Mùi (3)
  const group = [0, 2, 1, 3, 0, 2, 1, 3, 0, 2, 1, 3][branch];
  return TAM_SAT[group];
}


/** Tuần không của Can Chi (hai chi thiếu trong tuần Giáp). */
export function getVoidBranches(value: CanChi) {
  const head = mod(value.branch - value.stem, 12);
  return [mod(head + 10, 12), mod(head + 11, 12)];
}

/**
 * Sao theo giờ của 6 giờ hoàng đạo (theo thứ tự giờ trong ngày), tra theo Can Chi ngày như bảng trang mẫu.
 * Mỗi ô tối đa hai sao, ngăn bởi "+".
 */
const HOUR_STAR_TABLE = [
  "Kim Quỹ|Thiên Ất+Nhật Hiệp|Ngọc Đường+Nhật Hình|Nhật Phá|Thanh Long|Thiên Quan", // Giáp Tý
  "Kim Quỹ|Nhật Lộc+Bửu Quang|Ngọc Đường+Bất Ngộ|Thiên Quan+Thiên Ất|Hỷ Thần+Tuần Không|Phúc Tinh+Tuần Không", // Ất Sửu
  "Thiên Quan+Phúc Tinh|Minh Đường|Kim Quỹ+Lộ Không|Hỷ Thần+Lộ Không|Ngọc Đường|Phúc Tinh+Tuần Không", // Bính Dần
  "Tư Mệnh|Thanh Long+Lộ Không|Nhật Kiên+Lộ Không|Hỷ Thần+Nhật Lộc|Bửu Quang|Thiên Ất+Nhật Phá", // Đinh Mẹo
  "Tư Mệnh+Bất Ngộ|Nhật Kiên+Nhật Hình|Nhật Lộc+Minh Đường|Phúc Tinh+Kim Quỹ|Nhật Hiệp+Bửu Quang|Ngọc Đường+Lộ Không", // Mậu Thìn
  "Ngọc Đường+Bất Ngộ|Tư Mệnh|Nhật Lộc+Thanh Long|Phúc Tinh+Minh Đường|Kim Quỹ+Tuần Không|Nhật Phá+Nhật Mã", // Kỷ Tị
  "Kim Quỹ+Nhật Phá|Thiên Ất+Nhật Hại|Ngọc Đường|Thiên Quan+Lộ Không|Nhật Lộc+Thanh Long|Minh Đường", // Canh Ngọ
  "Kim Quỹ+Thiên Ất|Bửu Quang|Thiên Quan+Lộ Không|Hỷ Thần+Tư Mệnh|Thanh Long+Tuần Không|Minh Đường+Tuần Không", // Tân Mùi
  "Thanh Long|Minh Đường+Thiên Quan|Phúc Tinh+Kim Quỹ|Thiên Ất+Nhật Hiệp|Ngọc Đường+Thiên Quan|Tư Mệnh+Tuần Không", // Nhâm Thân
  "Nhật Lộc+Lộ Không|Thanh Long|Phúc Tinh+Nhật Phá|Kim Quỹ|Bửu Quang+Bất Ngộ|Nhật Kiên+Nhật Hình", // Quý Dậu
  "Hỷ Thần+Nhật Lộc|Thanh Long+Nhật Phá|Minh Đường|Nhật Mã+Lộ Không|Thiên Quan+Tuần Không|Ngọc Đường", // Giáp Tuất
  "Phúc Tinh+Ngọc Đường|Tư Mệnh|Thanh Long+Lộ Không|Minh Đường+Lộ Không|Kim Quỹ+Hỷ Thần|Nhật Kiên+Nhật Hình", // Ất Hợi
  "Thiên Quan+Phúc Tinh|Nhật Hiệp+Bửu Quang|Ngọc Đường+Nhật Hình|Tư Mệnh+Nhật Phá|Hỷ Thần+Tuần Không|Thiên Ất+Tuần Không", // Bính Tý
  "Kim Quỹ+Lộ Không|Bửu Quang+Bất Ngộ|Ngọc Đường|Tư Mệnh+Tuần Không|Thanh Long+Nhật Hình|Thiên Quan+Thiên Ất", // Đinh Sửu
  "Thanh Long+Lộ Không|Thiên Ất+Lộ Không", // Mậu Dần
  "Thiên Ất+Nhật Hình|Hỷ Thần+Thiên Quan|Minh Đường+Nhật Kiên|Kim Quỹ+Nhật Lộc|Bửu Quang+Phúc Tinh|Ngọc Đường+Tuần Không", // Kỷ Mẹo
  "Tư Mệnh+Nhật Mã|Nhật Kiên+Nhật Hình|Minh Đường|Nhật Lộc+Tuần Không|Nhật Hiệp+Tuần Không|Ngọc Đường", // Canh Thìn
  "Ngọc Đường|Tư Mệnh+Lộ Không|Thanh Long+Thiên Ất|Minh Đường|Kim Quỹ|Bửu Quang+Nhật Phá", // Tân Tị
  "Kim Quỹ+Nhật Phá|Thiên Quan+Nhật Hại|Thiên Ất+Lộ Không|Hỷ Thần+Nhật Hình|Bất Ngộ+Nhật Mã|Minh Đường+Tuần Không", // Nhâm Ngọ
  "Kim Quỹ|Thiên Ất+Phúc Tinh|Thiên Ất+Nhật Mã|Tư Mệnh+Tuần Không|Thiên Quan+Lộ Không|Minh Đường+Lộ Không", // Quý Mùi
  "Thanh Long|Minh Đường+Thiên Ất|Kim Quỹ|Nhật Hiệp+Bửu Quang|Thiên Ất+Tuần Không|Tư Mệnh", // Giáp Thân
  "Tư Mệnh+Thiên Ất|Thanh Long|Minh Đường+Nhật Phá|Kim Quỹ+Lộ Không|Bửu Quang+Lộ Không|Nhật Kiên+Nhật Hình", // Ất Dậu
  "Tư Mệnh|Thanh Long+Lộ Không|Nhật Lộc+Lộ Không|Hỷ Thần+Nhật Mã|Thiên Ất|Ngọc Đường+Thiên Ất", // Bính Tuất
  "Ngọc Đường|Tư Mệnh|Hỷ Thần+Tuần Không|Minh Đường+Tuần Không|Kim Quỹ|Thiên Quan+Nhật Hình", // Đinh Hợi
  "Nhật Kiên+Lộ Không|Nhật Hiệp+Lộ Không|Thiên Quan+Nhật Hình|Tư Mệnh+Tuần Không|Thanh Long+Phúc Tinh|Minh Đường", // Mậu Tý
  "Hỷ Thần+Thiên Quan|Bửu Quang|Ngọc Đường|Thiên Ất+Lộ Không|Thanh Long+Nhật Hình|Bất Ngộ+Nhật Mã", // Kỷ Sửu
  "Thanh Long|Minh Đường+Thiên Ất|Kim Quỹ|Bửu Quang+Nhật Hại|Ngọc Đường+Lộ Không|Tư Mệnh+Bất Ngộ", // Canh Dần
  "Tư Mệnh+Nhật Hình|Thanh Long+Thiên Ất|Minh Đường+Nhật Kiên|Kim Quỹ+Tuần Không|Bửu Quang+Tuần Không|Nhật Phá+Bất Ngộ", // Tân Mẹo
  "Thiên Quan+Tuần Không|Phúc Tinh+Nhật Hình|Minh Đường+Thiên Ất|Kim Quỹ+Bất Ngộ|Bửu Quang+Nhật Hiệp|Ngọc Đường+Nhật Lộc", // Nhâm Thìn
  "Ngọc Đường+Lộ Không|Tư Mệnh+Thiên Quan|Thanh Long+Tuần Không|Minh Đường+Bất Ngộ|Nhật Phá+Nhật Mã", // Quý Tị
  "Kim Quỹ+Nhật Phá|Thiên Ất+Nhật Hại|Ngọc Đường|Nhật Kiên+Bất Ngộ|Lộ Không+Nhật Mã|Thiên Quan+Lộ Không", // Giáp Ngọ
  "Kim Quỹ|Nhật Lộc+Bửu Quang|Bất Ngộ+Nhật Mã|Tư Mệnh+Thiên Quan|Hỷ Thần+Thanh Long|Minh Đường+Phúc Tinh", // Ất Mùi
  "Phúc Tinh+Thanh Long|Minh Đường|Kim Quỹ|Nhật Hiệp+Tuần Không|Ngọc Đường|Tư Mệnh+Phúc Tinh", // Bính Thân
  "Tư Mệnh|Thanh Long|Minh Đường+Nhật Phá|Hỷ Thần+Nhật Lộc|Bửu Quang|Thiên Ất+Nhật Hình", // Đinh Dậu
  "Tư Mệnh|Hỷ Thần+Nhật Phá|Minh Đường|Phúc Tinh+Nhật Mã|Bửu Quang+Nhật Hại|Kim Quỹ+Lộ Không", // Mậu Tuất
  "Ngọc Đường|Tư Mệnh+Tuần Không|Thanh Long+Nhật Lộc|Minh Đường+Phúc Tinh|Kim Quỹ|Nhật Lộc+Bất Ngộ", // Kỷ Hợi
  "Nhật Kiên+Bất Ngộ|Thiên Ất+Nhật Hiệp|Ngọc Đường+Nhật Hình|Thiên Ất+Lộ Không|Nhật Lộc+Thanh Long|Minh Đường", // Canh Tý
  "Kim Quỹ+Thiên Ất|Bửu Quang|Thiên Quan+Lộ Không|Tư Mệnh+Hỷ Thần|Thanh Long+Nhật Hình|Minh Đường+Nhật Mã", // Tân Sửu
  "Thanh Long|Minh Đường+Thiên Quan|Phúc Tinh+Tuần Không|Thiên Ất+Nhật Hình|Ngọc Đường+Thiên Quan|Tư Mệnh", // Nhâm Dần
  "Hỷ Thần+Lộ Không|Thanh Long|Phúc Tinh+Thiên Ất|Kim Quỹ|Bửu Quang|Ngọc Đường+Nhật Phá", // Quý Mẹo
  "Tuần Không+Nhật Mã|Nhật Hình+Nhật Kiên|Minh Đường|Kim Quỹ+Lộ Không|Nhật Hiệp+Lộ Không|Ngọc Đường", // Giáp Thìn
  "Ngọc Đường+Phúc Tinh|Tư Mệnh|Thanh Long+Lộ Không|Nhật Kiên+Lộ Không|Kim Quỹ+Hỷ Thần|Bửu Quang+Nhật Phá", // Ất Tị
  "Thiên Quan+Nhật Phá|Bửu Quang+Nhật Hại|Ngọc Đường+Tuần Không|Nhật Hình+Nhật Kiên|Hỷ Thần+Nhật Mã|Minh Đường+Thiên Ất", // Bính Ngọ
  "Kim Quỹ+Lộ Không|Bửu Quang+Lộ Không|Ngọc Đường+Nhật Mã|Tư Mệnh|Thanh Long|Minh Đường+Thiên Ất", // Đinh Mùi
  "Thanh Long+Lộ Không|Thiên Ất|Kim Quỹ+Hỷ Thần|Nhật Lộc+Nhật Hiệp|Ngọc Đường+Thiên Ất|Tư Mệnh+Lộ Không", // Mậu Thân
  "Tư Mệnh+Thiên Ất|Thiên Quan+Tuần Không|Minh Đường+Tuần Không|Kim Quỹ+Nhật Lộc|Phúc Tinh+Bửu Quang|Nhật Kiên+Lộ Không", // Kỷ Dậu
  "Tư Mệnh+Tuần Không|Thanh Long+Nhật Phá|Minh Đường|Nhật Lộc+Nhật Mã|Bửu Quang+Nhật Hại|Ngọc Đường", // Canh Tuất
  "Ngọc Đường|Tư Mệnh+Lộ Không|Thanh Long+Thiên Ất|Minh Đường|Kim Quỹ|Nhật Hình+Nhật Kiên", // Tân Hợi
  "Kim Quỹ+Nhật Kiên|Thiên Quan+Nhật Hiệp|Thiên Ất+Lộ Không|Tư Mệnh+Nhật Phá|Thanh Long+Bất Ngộ|Minh Đường", // Nhâm Tý
  "Kim Quỹ+Tuần Không|Thiên Ất+Tuần Không|Ngọc Đường+Thiên Ất|Tư Mệnh|Thiên Quan+Lộ Không|Nhật Mã+Lộ Không", // Quý Sửu
  "Thanh Long+Tuần Không|Thiên Ất+Tuần Không|Kim Quỹ|Bửu Quang+Nhật Hại|Ngọc Đường+Thiên Ất|Tư Mệnh", // Giáp Dần
  "Thiên Ất+Nhật Hình|Thanh Long|Minh Đường+Nhật Kiên|Kim Quỹ+Lộ Không|Bửu Quang+Lộ Không|Ngọc Đường+Nhật Phá", // Ất Mẹo
  "Tư Mệnh+Nhật Mã|Nhật Kiên+Lộ Không|Nhật Lộc+Lộ Không|Kim Quỹ+Hỷ Thần|Thiên Ất+Nhật Hiệp|Ngọc Đường+Thiên Ất", // Bính Thìn
  "Ngọc Đường+Tuần Không|Tư Mệnh|Nhật Lộc+Hỷ Thần|Minh Đường|Kim Quỹ|Thiên Quan+Nhật Phá", // Đinh Tị
  "Kim Quỹ+Nhật Phá|Thiên Ất+Lộ Không|Ngọc Đường+Thiên Quan|Nhật Hình|Thanh Long+Nhật Mã|Minh Đường", // Mậu Ngọ
  "Hỷ Thần+Thiên Lao|Bửu Quang|Ngọc Đường+Nhật Mã|Tư Mệnh+Lộ Không|Thanh Long|Minh Đường+Bất Ngộ", // Kỷ Mùi
  "Thanh Long+Bất Ngộ|Thiên Ất+Tuần Không|Kim Quỹ|Bửu Quang+Nhật Hiệp|Lộ Không|Tư Mệnh+Bất Ngộ", // Canh Thân
  "Tư Mệnh+Tuần Không|Thanh Long+Thiên Ất|Minh Đường+Nhật Phá|Kim Quỹ+Thiên Ất|Bửu Quang|Nhật Kiên+Bất Ngộ", // Tân Dậu
  "Tư Mệnh+Lộ Không|Phúc Tinh+Nhật Phá|Minh Đường+Thiên Ất|Bất Ngộ+Nhật Mã|Bửu Quang+Nhật Hại|Ngọc Đường+Nhật Lộc", // Nhâm Tuất
  "Ngọc Đường+Lộ Không|Tư Mệnh+Thiên Quan|Thanh Long|Minh Đường+Bất Ngộ|Thiên Quan+Lộ Không", // Quý Hợi
];

export function getHourStarTable(ctx: DayContext) {
  const hours = getHourOfficers(ctx).filter((hour) => hour.type === "Hoàng Đạo");
  const cells = HOUR_STAR_TABLE[sexagenaryIndex(ctx.day)].split("|");
  return hours.map((hour, index) => ({ chi: hour.chi, branch: hour.branch, stars: cells[index] ? cells[index].split("+") : [] }));
}

/** Nước lớn, ròng theo ngày âm lịch (vùng cao; vùng thấp đảo lại). */
const NUOC_LON = [0, 0, 1, 1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5];
export function getTide(ctx: DayContext) {
  const high = NUOC_LON[(ctx.lunar.day - 1) % 15];
  const low = (high + 3) % 6;
  const pair = (branch: number) => [BRANCHES[branch], BRANCHES[branch + 6]];
  return { highland: { flood: pair(high), ebb: pair(low) }, lowland: { flood: pair(low), ebb: pair(high) } };
}

/** Tuổi xung khắc theo Can Chi (dùng cho cả ngày lẫn tháng) — bảng theo trang mẫu. */
const XUNG = [
  "Mậu Ngọ,Nhâm Ngọ,Canh Dần,Canh Thân", "Kỷ Mùi,Quý Mùi,Tân Mẹo,Tân Dậu", "Giáp Thân,Nhâm Thân,Nhâm Tuất,Nhâm Thìn", "Ất Dậu,Quý Dậu,Quý Tị,Quý Hợi",
  "Canh Tuất,Bính Tuất", "Tân Hợi,Đinh Hợi", "Nhâm Tý,Bính Tý,Giáp Thân,Giáp Dần", "Quý Sửu,Đinh Sửu,Ất Dậu,Ất Mẹo",
  "Bính Dần,Canh Dần,Bính Thân", "Đinh Mẹo,Tân Mẹo,Đinh Dậu", "Nhâm Thìn,Canh Thìn,Canh Tuất", "Quý Tị,Tân Tị,Tân Hợi",
  "Canh Ngọ,Mậu Ngọ", "Tân Mùi,Kỷ Mùi", "Canh Thân,Giáp Thân", "Tân Dậu,Ất Dậu",
  "Giáp Tuất,Mậu Tuất,Giáp Thìn", "Ất Hợi,Kỷ Hợi,Ất Tị", "Giáp Tý,Canh Tý,Bính Tuất,Bính Thìn", "Ất Sửu,Tân Sửu,Đinh Hợi,Đinh Tị",
  "Mậu Dần,Bính Dần,Canh Ngọ,Canh Tý", "Kỷ Mẹo,Đinh Mẹo,Tân Mùi,Tân Sửu", "Mậu Thìn,Nhâm Thìn,Nhâm Ngọ,Nhâm Tý", "Kỷ Tị,Quý Tị,Quý Mùi,Quý Sửu",
  "Bính Ngọ,Giáp Ngọ", "Đinh Mùi,Ất Mùi", "Nhâm Thân,Mậu Thân,Giáp Tý,Giáp Ngọ", "Quý Dậu,Kỷ Dậu,Ất Sửu,Ất Mùi",
  "Bính Tuất,Giáp Tuất,Bính Dần", "Đinh Hợi,Ất Hợi,Đinh Mẹo", "Mậu Tý,Nhâm Tý,Canh Dần,Nhâm Dần", "Kỷ Sửu,Quý Sửu,Tân Mẹo,Tân Dậu",
  "Giáp Dần,Nhâm Thân,Nhâm Tuất,Nhâm Thìn", "Ất Mẹo,Quý Mẹo,Quý Tị,Quý Hợi", "Canh Thìn,Bính Thìn", "Tân Tị,Đinh Tị",
  "Nhâm Ngọ,Bính Ngọ,Giáp Thân,Giáp Dần", "Quý Mùi,Đinh Mùi,Ất Dậu,Ất Mẹo", "Canh Thân,Bính Thân,Bính Dần", "Tân Dậu,Đinh Dậu,Đinh Mẹo",
  "Nhâm Tuất,Canh Tuất,Canh Thìn", "Quý Hợi,Tân Hợi,Tân Tị", "Mậu Tý,Canh Tý", "Kỷ Sửu,Tân Sửu",
  "Canh Dần,Giáp Dần", "Tân Mẹo,Ất Mẹo", "Giáp Thìn,Mậu Thìn,Giáp Tuất", "Ất Tị,Kỷ Tị,Ất Hợi",
  "Giáp Ngọ,Canh Ngọ,Bính Tuất,Bính Thìn", "Ất Mùi,Tân Mùi,Đinh Hợi,Đinh Tị", "Mậu Thân,Bính Thân,Canh Ngọ,Canh Tý", "Kỷ Dậu,Đinh Dậu,Tân Mùi,Tân Sửu",
  "Mậu Tuất,Nhâm Tuất,Nhâm Ngọ,Nhâm Tý", "Kỷ Hợi,Quý Hợi,Quý Sửu,Quý Mùi", "Bính Tý,Giáp Tý", "Đinh Sửu,Ất Sửu",
  "Nhâm Dần,Mậu Dần,Giáp Tý,Giáp Ngọ", "Quý Mẹo,Kỷ Mẹo,Ất Sửu,Ất Mùi", "Bính Thìn,Giáp Thìn,Bính Thân,Bính Dần", "Đinh Tị,Ất Tị,Đinh Mẹo,Đinh Dậu",
];
export const getClashingAges = (value: CanChi) => XUNG[sexagenaryIndex(value)].split(",");

const TAI_THAN = ["Đông Nam", "Đông Nam", "Chánh Đông", "Chánh Đông", "Chánh Nam", "Chánh Nam", "Tây Nam", "Tây Nam", "Chánh Tây", "Tây Bắc"];
const HY_THAN = ["Đông Bắc", "Tây Bắc", "Tây Nam", "Chánh Nam", "Đông Nam", "Đông Bắc", "Tây Bắc", "Tây Nam", "Chánh Nam", "Đông Nam"];
/** Hạc thần theo 60 Giáp Tý (các ngày "Tại Thiên Giới" thần ở trên trời, không kiêng hướng). */
const HAC_THAN = [
  "Đông Nam", "Đông Nam", "Chánh Nam", "Tại Thiên Giới", "Chánh Nam", "Tại Thiên Giới", "Chánh Nam", "Tây Nam", "Tây Nam", "Tây Nam",
  "Tây Nam", "Tây Nam", "Tây Nam", "Chánh Tây", "Chánh Tây", "Chánh Tây", "Chánh Tây", "Chánh Tây", "Tây Bắc", "Tây Bắc",
  "Tây Bắc", "Tây Bắc", "Tây Bắc", "Tây Bắc", "Chánh Bắc", "Chánh Bắc", "Chánh Bắc", "Chánh Bắc", "Chánh Bắc", "Tại Thiên Giới",
  "Tại Thiên Giới", "Tại Thiên Giới", "Tại Thiên Giới", "Tại Thiên Giới", "Tại Thiên Giới", "Tại Thiên Giới", "Tại Thiên Giới", "Tại Thiên Giới", "Tại Thiên Giới", "Tại Thiên Giới",
  "Tại Thiên Giới", "Tại Thiên Giới", "Tại Thiên Giới", "Tại Thiên Giới", "Tại Thiên Giới", "Đông Bắc", "Đông Bắc", "Đông Bắc", "Đông Bắc", "Đông Bắc",
  "Đông Bắc", "Tại Thiên Giới", "Chánh Đông", "Tại Thiên Giới", "Chánh Đông", "Chánh Đông", "Đông Nam", "Đông Nam", "Đông Nam", "Đông Nam",
];

export function getDirections(ctx: DayContext) {
  return { taiThan: TAI_THAN[ctx.day.stem], hyThan: HY_THAN[ctx.day.stem], hacThan: HAC_THAN[sexagenaryIndex(ctx.day)] };
}

/** Giờ không vong: giờ Cô là hai chi tuần không của ngày, giờ Hư là hai chi đối xung. */
export function getEmptyHours(ctx: DayContext) {
  const lonely = getVoidBranches(ctx.day);
  return { lonely: lonely.map((b) => BRANCHES[b]), hollow: lonely.map((b) => BRANCHES[mod(b + 6, 12)]) };
}

const DUONG_CONG: Record<number, number[]> = { 1: [13], 2: [11], 3: [9], 4: [7], 5: [5], 6: [3], 7: [1, 29], 8: [27], 9: [25], 10: [23], 11: [21], 12: [19] };

/** Quan niệm dân gian theo ngày âm lịch và các ngày giao tiết (Tứ tuyệt, Tứ ly). */
export function getFolkDay(ctx: DayContext) {
  const { day, month } = ctx.lunar;
  // Ngày giao tiết là ngày mà 0 giờ hôm sau đã sang khí mới; Tứ tuyệt/Tứ ly là ngày liền trước đó.
  const termTomorrow = solarTermIndex(ctx.jd + 1);
  const termAfter = solarTermIndex(ctx.jd + 2);
  if (termAfter !== termTomorrow && [21, 3, 9, 15].includes(termAfter)) return "Tứ Tuyệt";
  if (termAfter !== termTomorrow && [0, 6, 12, 18].includes(termAfter)) return "Tứ Ly";
  if (DUONG_CONG[month]?.includes(day)) return "Dương Công Kị";
  if ([5, 14, 23].includes(day)) return "Nguyệt Kị";
  if ([3, 7, 13, 18, 22, 27].includes(day)) return "Tam Nương";
  if (day === 1 || day === 15) return "Sóc Vọng";
  if (day === 30) return "Nguyệt Tận";
  if (day === 2 || day === 16) return "Vong Linh";
  return "Ngày Thường";
}

/** Tiết khí hiện tại và tiết khí kế tiếp. */
export function getSolarTermPair(ctx: DayContext) {
  return [SOLAR_TERMS[ctx.solarTerm], SOLAR_TERMS[mod(ctx.solarTerm + 1, 24)]] as const;
}

/** Lục thập Giáp Tý phối quẻ (Huyền Không Đại Quái): [số quái thượng, quái vận, tên quẻ]. */
const PHOI_QUE: Array<[number, number, string]> = [
  [1, 1, "Địa Vi Khôn"], [3, 6, "Hỏa Lôi Phệ Hạp"], [2, 4, "Phong Hỏa Gia Nhân"], [6, 9, "Sơn Trạch Tổn"], [9, 6, "Thiên Trạch Lý"],
  [8, 2, "Lôi Thiên Đại Tráng"], [8, 9, "Lôi Phong Hằng"], [9, 3, "Thiên Thủy Tụng"], [1, 7, "Địa Thủy Sư"], [2, 7, "Phong Sơn Tiệm"],
  [7, 2, "Thủy Sơn Kiển"], [3, 3, "Hỏa Địa Tấn"], [6, 3, "Sơn Lôi Di"], [4, 7, "Trạch Lôi Tùy"], [8, 6, "Lôi Hỏa Phong"],
  [7, 8, "Thủy Trạch Tiết"], [1, 9, "Địa Thiên Thái"], [3, 7, "Hỏa Thiên Đại Hữu"], [2, 1, "Phong Vi Tốn"], [4, 8, "Trạch Thủy Khốn"],
  [3, 9, "Hỏa Thủy Vị Tế"], [9, 4, "Thiên Sơn Độn"], [6, 1, "Sơn Vi Cấn"], [8, 8, "Lôi Địa Dự"], [7, 4, "Thủy Lôi Truân"],
  [9, 2, "Thiên Lôi Vô Vọng"], [3, 1, "Hỏa Vi Ly"], [2, 3, "Phong Trạch Trung Phu"], [6, 4, "Sơn Thiên Đại Súc"], [4, 6, "Trạch Thiên Quải"],
  [9, 1, "Thiên Vi Càn"], [7, 6, "Thủy Phong Tỉnh"], [8, 4, "Lôi Thủy Giải"], [4, 9, "Trạch Sơn Hàm"], [1, 6, "Địa Sơn Khiêm"],
  [2, 2, "Phong Địa Quan"], [2, 9, "Phong Lôi Ích"], [1, 3, "Địa Hỏa Minh Di"], [9, 7, "Thiên Hỏa Đồng Nhân"], [8, 7, "Lôi Trạch Quy Muội"],
  [3, 2, "Hỏa Trạch Khuê"], [7, 3, "Thủy Thiên Nhu"], [4, 3, "Trạch Phong Đại Quá"], [6, 7, "Sơn Phong Cổ"], [2, 6, "Phong Thủy Hoán"],
  [3, 8, "Hỏa Sơn Lữ"], [9, 9, "Thiên Địa Bĩ"], [7, 7, "Thủy Địa Tỷ"], [8, 1, "Lôi Vi Chấn"], [6, 8, "Sơn Hỏa Bí"],
  [7, 9, "Thủy Hỏa Ký Tế"], [1, 4, "Địa Trạch Lâm"], [4, 1, "Trạch Vi Đoài"], [2, 8, "Phong Thiên Tiểu Súc"],
  [3, 4, "Hỏa Phong Đỉnh"], [1, 2, "Địa Phong Thăng"], [7, 1, "Thủy Vi Khảm"], [8, 3, "Lôi Sơn Tiểu Quá"], [4, 4, "Trạch Địa Tụy"], [6, 6, "Sơn Địa Bác"],
];

export function getPhoiQue(value: CanChi) {
  const [upper, luck, name] = PHOI_QUE[sexagenaryIndex(value)];
  return { upper, luck, name };
}

/**
 * Bốn Can Chi nằm giữa hai quẻ, bảng "Hành và Vận" của trang mẫu ghi hai cặp số (in màu hồng): [hành, vận] của quẻ thứ hai.
 * Chỉ số theo vòng Lục thập Giáp Tý: Giáp Tý 0, Canh Dần 26, Giáp Ngọ 30, Canh Thân 56.
 */
const PHOI_QUE_PHU: Record<number, [number, number]> = { 0: [1, 8], 26: [4, 2], 30: [9, 8], 56: [6, 2] };

export type HanhVanCell = { name: string; can: string; chi: string; hanh: number[]; van: number[] };
export type HanhVanWeek = { name: string; cells: HanhVanCell[]; voids: HanhVanCell[] };

function hanhVanCell(index: number): HanhVanCell {
  const value = canChiFromIndex(index);
  const [upper, luck] = PHOI_QUE[index];
  const extra = PHOI_QUE_PHU[index];
  const [can, chi] = value.name.split(" ");
  return { name: value.name, can, chi, hanh: extra ? [upper, extra[0]] : [upper], van: extra ? [luck, extra[1]] : [luck] };
}

/**
 * Bảng "Hành và Vận của giờ theo ngày": 60 Can Chi chia 6 tuần (Giáp Tý, Giáp Tuất, Giáp Thân, Giáp Ngọ, Giáp Thìn,
 * Giáp Dần), mỗi ô ghi số hành (quái thượng) và quái vận như các số trên / dưới mỗi trụ; hai ô Không Vong của tuần là
 * hai Chi bị khuyết (lấy số của hai Can Chi mở đầu tuần kế tiếp, như bảng mẫu).
 */
export function getHanhVanTable(): HanhVanWeek[] {
  return [0, 10, 20, 30, 40, 50].map((start) => ({
    name: canChiFromIndex(start).name,
    cells: Array.from({ length: 10 }, (_, offset) => hanhVanCell(start + offset)),
    voids: [hanhVanCell((start + 10) % 60), hanhVanCell((start + 11) % 60)],
  }));
}

export { canChi, canChiFromIndex, STEMS };
