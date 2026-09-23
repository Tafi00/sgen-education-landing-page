// @ts-nocheck
/**
 * Tử Vi display conventions observed on Tinh Mệnh Đồ.
 *
 * The upstream star placement produced by iztro is retained. This module only
 * aligns the reference product's dignity labels and its five/annual moving-star
 * layers. Source checked on 2026-08-13:
 * https://tinhmenhdo.com/CshgmXoIMulSNd/staticData.i42p8bOT.js
 */

export const ZIWEI_STEMS = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"] as const;
export const ZIWEI_BRANCHES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"] as const;

type ReferenceZiweiMinorStarMeta = { id: number; column: 0 | 1; zone: 1 | 2 | 3 };

/**
 * `typ` and `zone` from the reference engine's auxiliary-star catalogue.
 * The renderer groups zone 1 first, zone 3 second and zone 2 last; `typ = 2`
 * is the right column. Keeping that metadata here avoids chart-specific lists
 * drifting whenever a Trung Châu star appears on a different birth chart.
 */
const REFERENCE_ZIWEI_MINOR_STAR_ROWS = [
  ["Thiên Không", 15, 2, 1], ["Thái Tuế", 16, 1, 3], ["Thiếu Dương", 17, 1, 3],
  ["Tang Môn", 18, 2, 3], ["Thiếu Âm", 19, 1, 3], ["Quan Phù", 20, 2, 3],
  ["Tử Phù", 21, 1, 3], ["Tuế Phá", 22, 2, 3], ["Long Đức", 23, 1, 3],
  ["Bạch Hổ", 24, 2, 3], ["Phúc Đức", 25, 1, 3], ["Điếu Khách", 26, 2, 3],
  ["Trực Phù", 27, 2, 3], ["Lộc Tồn", 28, 1, 1], ["Bác Sĩ", 29, 1, 3],
  ["Lực Sĩ", 30, 1, 3], ["Thanh Long", 31, 1, 3], ["Tiểu Hao", 32, 2, 3],
  ["Tướng Quân", 33, 2, 3], ["Tấu Thư", 34, 1, 3], ["Phi Liêm", 35, 2, 3],
  ["Hỉ Thần", 36, 1, 3], ["Bệnh Phù", 37, 2, 3], ["Đại Hao", 38, 2, 3],
  ["Phục Binh", 39, 2, 3], ["Quan Phủ", 40, 2, 3], ["Địa Không", 53, 2, 1],
  ["Địa Kiếp", 54, 2, 1], ["Hỏa Tinh", 55, 2, 1], ["Linh Tinh", 56, 2, 1],
  ["Kình Dương", 57, 2, 1], ["Đà La", 58, 2, 1], ["Thiên Khôi", 59, 1, 1],
  ["Thiên Việt", 60, 1, 1], ["Tả Phụ", 61, 1, 1], ["Hữu Bật", 62, 1, 1],
  ["Văn Xương", 63, 1, 1], ["Văn Khúc", 64, 1, 1], ["Hóa Lộc", 65, 1, 1],
  ["Hóa Quyền", 66, 1, 1], ["Hóa Khoa", 67, 1, 1], ["Hóa Kị", 68, 2, 1],
  ["Ân Quang", 69, 1, 1], ["Thiên Quý", 70, 1, 1], ["Tam Thai", 71, 1, 1],
  ["Bát Tọa", 72, 1, 1], ["Thai Phụ", 73, 1, 2], ["Phong Cáo", 74, 1, 2],
  ["Quốc Ấn", 75, 1, 2], ["Đường Phù", 76, 1, 2], ["Long Trì", 77, 1, 2],
  ["Phượng Các", 78, 1, 2], ["Hoa Cái", 79, 1, 2], ["Thiên Mã", 80, 1, 1],
  ["Thiên Khốc", 81, 2, 1], ["Thiên Hư", 82, 2, 1], ["Đào Hoa", 83, 1, 1],
  ["Hồng Loan", 84, 1, 2], ["Thiên Hỉ", 85, 1, 2], ["Cô Thần", 86, 2, 2],
  ["Quả Tú", 87, 2, 2], ["Thiên Hình", 88, 2, 1], ["Thiên Diêu", 89, 2, 1],
  ["Thiên Y", 90, 1, 2], ["Lưu Hà", 91, 2, 2], ["Kiếp Sát", 92, 2, 2],
  ["Phá Toái", 93, 1, 2], ["Thiên Quan", 94, 1, 2], ["Thiên Phúc", 95, 1, 2],
  ["Văn Tinh", 96, 1, 2], ["Thiên Trù", 97, 1, 2], ["Thiên Đức", 98, 1, 2],
  ["Nguyệt Đức", 99, 1, 2], ["Thiên Giải", 100, 1, 2], ["Địa Giải", 101, 1, 2],
  ["Giải Thần", 102, 1, 2], ["Thiên Tài", 103, 1, 2], ["Thiên Thọ", 104, 1, 2],
  ["Đẩu Quân", 105, 2, 2], ["Thiên Thương", 106, 2, 2], ["Thiên Sứ", 107, 2, 2],
  ["Thiên La", 108, 2, 2], ["Địa Võng", 109, 2, 2], ["Tướng Tinh", 110, 2, 3],
  ["Phan An", 111, 1, 3], ["Tuế Dịch", 112, 1, 3], ["Tức Thần", 113, 2, 3],
  ["Tai Sát", 114, 2, 3], ["Thiên Sát", 115, 2, 3], ["Chỉ Bối", 116, 1, 3],
  ["Nguyệt Sát", 117, 2, 3], ["Vong Thần", 118, 2, 3], ["Niên Giải", 119, 1, 2],
  ["Nguyệt Giải", 120, 1, 2], ["Thiên Vu", 121, 1, 3], ["Thiên Nguyệt", 122, 1, 2],
  ["Âm Sát", 123, 2, 2], ["Dương Sát", 124, 2, 2], ["Âm Đức", 125, 1, 2],
  ["Dương Đức", 126, 1, 2],
] as const;

export const REFERENCE_ZIWEI_MINOR_STAR_META = new Map<string, ReferenceZiweiMinorStarMeta>(
  REFERENCE_ZIWEI_MINOR_STAR_ROWS.map(([name, id, typ, zone]) => [name, { id, column: typ === 2 ? 1 : 0, zone }]),
);

export const REFERENCE_MINOR_STAR_DIGNITY: Record<string, Partial<Record<(typeof ZIWEI_BRANCHES)[number], string>>> = {
  "Tang Môn": { Dần: "Đ", Mão: "Đ", Thân: "Đ", Dậu: "Đ" },
  "Bạch Hổ": { Dần: "Đ", Mão: "Đ", Thân: "Đ", Dậu: "Đ" },
  "Tiểu Hao": { Dần: "Đ", Mão: "Đ", Thân: "Đ", Dậu: "Đ" },
  "Đại Hao": { Dần: "Đ", Mão: "Đ", Thân: "Đ", Dậu: "Đ" },
  "Địa Không": { Tý: "H", Sửu: "H", Dần: "Đ", Mão: "H", Thìn: "H", Tị: "Đ", Ngọ: "H", Mùi: "H", Thân: "Đ", Dậu: "H", Tuất: "H", Hợi: "Đ" },
  "Địa Kiếp": { Tý: "H", Sửu: "H", Dần: "Đ", Mão: "H", Thìn: "H", Tị: "Đ", Ngọ: "H", Mùi: "H", Thân: "Đ", Dậu: "H", Tuất: "H", Hợi: "Đ" },
  "Hỏa Tinh": { Tý: "H", Sửu: "H", Dần: "Đ", Mão: "Đ", Thìn: "Đ", Tị: "Đ", Ngọ: "Đ", Mùi: "H", Thân: "H", Dậu: "H", Tuất: "H", Hợi: "H" },
  "Linh Tinh": { Tý: "H", Sửu: "H", Dần: "Đ", Mão: "Đ", Thìn: "Đ", Tị: "Đ", Ngọ: "Đ", Mùi: "H", Thân: "H", Dậu: "H", Tuất: "H", Hợi: "H" },
  "Kình Dương": { Tý: "H", Sửu: "Đ", Dần: "H", Mão: "H", Thìn: "Đ", Tị: "H", Ngọ: "H", Mùi: "Đ", Thân: "H", Dậu: "H", Tuất: "Đ", Hợi: "H" },
  "Đà La": { Tý: "H", Sửu: "Đ", Dần: "H", Mão: "H", Thìn: "Đ", Tị: "H", Ngọ: "H", Mùi: "Đ", Thân: "H", Dậu: "H", Tuất: "Đ", Hợi: "H" },
  "Văn Xương": { Tý: "H", Sửu: "Đ", Dần: "H", Mão: "H", Thìn: "Đ", Tị: "Đ", Ngọ: "H", Mùi: "Đ", Thân: "H", Dậu: "H", Tuất: "Đ", Hợi: "Đ" },
  "Văn Khúc": { Sửu: "Đ", Thìn: "Đ", Tị: "Đ", Mùi: "Đ", Tuất: "Đ", Hợi: "Đ" },
  "Hóa Kị": { Tý: "H", Sửu: "Đ", Dần: "H", Mão: "H", Thìn: "Đ", Tị: "H", Ngọ: "H", Mùi: "Đ", Thân: "H", Dậu: "H", Tuất: "Đ", Hợi: "H" },
  "Thiên Mã": { Dần: "Đ", Tị: "Đ" },
  "Thiên Khốc": { Tý: "Đ", Sửu: "Đ", Mão: "Đ", Ngọ: "Đ", Mùi: "Đ", Dậu: "Đ" },
  "Thiên Hư": { Tý: "Đ", Sửu: "Đ", Mão: "Đ", Ngọ: "Đ", Mùi: "Đ", Dậu: "Đ" },
  "Thiên Hình": { Dần: "Đ", Mão: "Đ", Thân: "Đ", Dậu: "Đ" },
  "Thiên Diêu": { Dần: "Đ", Mão: "Đ", Dậu: "Đ", Tuất: "Đ" },
};

const REFERENCE_ZIWEI_MINOR_STAR_ORDER = [
  // Major assistants & malefics
  "Kình Dương", "Đà La", "Hỏa Tinh", "Linh Tinh", "Địa Không", "Địa Kiếp",
  "Thiên Khôi", "Thiên Việt", "Tả Phụ", "Hữu Bật", "Văn Xương", "Văn Khúc",
  // Four transformations
  "Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kị",
  // Luu / Loc Ton
  "Lộc Tồn",
  // Secondary assistants
  "Ân Quang", "Thiên Quý", "Tam Thai", "Bát Tọa",
  // Forms & shapes
  "Thiên Hình", "Thiên Diêu",
  // Moving / Sound
  "Thiên Mã", "Thiên Khốc", "Thiên Hư",
  // Thien Khong
  "Thiên Không",
  // Romance
  "Đào Hoa",
  // Thai Tue Ring
  "Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù",
  "Tuế Phá", "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù",
  // Bac Si Ring
  "Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư",
  "Phi Liêm", "Hỉ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ",
  // Zone 2 / other auxiliary stars in order
  "Thai Phụ", "Phong Cáo", "Quốc Ấn", "Đường Phù", "Hồng Loan", "Thiên Hỉ",
  "Phượng Các", "Giải Thần", "Phá Toái", "Thiên Y", "Thiên Phúc", "Thiên Quan",
  "Văn Tinh", "Long Trì", "Nguyệt Đức", "Thiên Đức", "Thiên Giải", "Địa Giải",
  "Thiên Tài", "Thiên Thọ", "Lưu Hà", "Quả Tú", "Cô Thần", "Đẩu Quân",
  "Thiên Thương", "Thiên Sứ", "Thiên La", "Địa Võng", "Âm Sát", "Kiếp Sát",
  "Hoa Cái", "Thiên Trù"
];

const REFERENCE_ZIWEI_STAR_RANK = new Map(REFERENCE_ZIWEI_MINOR_STAR_ORDER.map((name, idx) => [name, idx]));

const normalizePeriodStarName = (name: string) => name.replace(/^[LĐ]\./, "");

export function getReferenceZiweiStarColumn(starName: string): 0 | 1 {
  return REFERENCE_ZIWEI_MINOR_STAR_META.get(normalizePeriodStarName(starName))?.column ?? 0;
}

export function sortReferenceZiweiMinorStars(stars: string[]) {
  return [...stars].sort((a, b) => {
    const rankA = REFERENCE_ZIWEI_STAR_RANK.get(normalizePeriodStarName(a)) ?? 999;
    const rankB = REFERENCE_ZIWEI_STAR_RANK.get(normalizePeriodStarName(b)) ?? 999;
    return rankA - rankB;
  });
}

export function getReferenceZiweiPeriodBadgeLayers(phiHoaLayer: number) {
  return [
    { label: "2", source: "decade" as const, square: true },
    { label: "3", source: "year" as const, square: false },
    { label: "4", source: "month" as const, square: false },
    { label: "5", source: "day" as const, square: false },
  ].slice(0, Math.min(4, Math.max(0, phiHoaLayer)));
}

const REFERENCE_ZIWEI_MONTH_ONE_STEM: Record<string, number> = {
  Giáp: 2, Kỷ: 2, Ất: 4, Canh: 4, Bính: 6, Tân: 6, Đinh: 8, Nhâm: 8, Mậu: 0, Quý: 0,
};

const mod12 = (value: number) => ((value % 12) + 12) % 12;

export function getReferenceZiweiFooter(input: {
  palaceIndex: number;
  natalYearBranch: string;
  natalLunarMonth: number;
  natalHourBranch: string;
  viewYearStem: string;
  viewYearBranch: string;
  isMale: boolean;
}) {
  const natalBranchIndex = Math.max(0, ZIWEI_BRANCHES.indexOf((input.natalYearBranch === "Tỵ" ? "Tị" : input.natalYearBranch) as (typeof ZIWEI_BRANCHES)[number]));
  const annualBranchIndex = Math.max(0, ZIWEI_BRANCHES.indexOf((input.viewYearBranch === "Tỵ" ? "Tị" : input.viewYearBranch) as (typeof ZIWEI_BRANCHES)[number]));
  const natalHourIndex = Math.max(0, ZIWEI_BRANCHES.indexOf((input.natalHourBranch === "Tỵ" ? "Tị" : input.natalHourBranch) as (typeof ZIWEI_BRANCHES)[number]));
  const smallYearStartPalace = [10, 7, 4, 1][natalBranchIndex % 4];

  // 1. Small year (lynp)
  const stepsFromSmallYearStart = input.isMale
    ? mod12(input.palaceIndex - smallYearStartPalace)
    : mod12(smallYearStartPalace - input.palaceIndex);
  const smallYearBranch = ZIWEI_BRANCHES[mod12(natalBranchIndex + stepsFromSmallYearStart)];

  // 2. lynpc: palace where lynp === annualBranchIndex
  const stepsToAnnual = mod12(annualBranchIndex - natalBranchIndex);
  const lynpc = input.isMale
    ? mod12(smallYearStartPalace + stepsToAnnual)
    : mod12(smallYearStartPalace - stepsToAnnual);

  // 3. virgoCode (lmnp - Nam Phái)
  let hNamPhai = lynpc;
  hNamPhai = mod12(hNamPhai - (input.natalLunarMonth - 1));
  hNamPhai = mod12(hNamPhai + natalHourIndex);
  const virgoCode = mod12(input.palaceIndex - hNamPhai) + 1;

  // 4. periodNumber (lmpt - Phổ thông / Trung Châu / Phi Tinh)
  let hPhoThong = annualBranchIndex;
  hPhoThong = mod12(hPhoThong - (input.natalLunarMonth - 1));
  hPhoThong = mod12(hPhoThong + natalHourIndex);
  const periodNumber = mod12(input.palaceIndex - hPhoThong) + 1;

  const periodBranchIndex = mod12(periodNumber + 1); // 1->Dần(2), 2->Mão(3), etc.
  const periodBranch = ZIWEI_BRANCHES[periodBranchIndex];
  const startStem = REFERENCE_ZIWEI_MONTH_ONE_STEM[input.viewYearStem] ?? 0;
  const periodStem = ZIWEI_STEMS[(startStem + periodNumber - 1) % 10];

  return { smallYearBranch, virgoCode, periodBranch, periodStem, periodNumber };
}

/**
 * Configuration encoded by the reference site's shared Khâm Thiên + Nam phái
 * links (for example `7bp2b-2t-lfrc`). Keep it here so the interface and the
 * parity tests share one source of truth.
 */
export const REFERENCE_ZIWEI_SHARED_PRESET = Object.freeze({
  chartStyle: 3,
  phiHoaType: 3,
  phiHoaLayer: 2,
  canHoaTable: 1,
  daYunStars: 0,
  currentStarMode: 0,
  starGroupMode: 0,
  locKiCycle: 1,
  fullLocKi: 1,
});

/**
 * The upstream store applies a route's default `typeLs` only when the URL
 * does not contain a birth payload (`b`). Once a chart payload is present,
 * the compact configuration (or the engine default when `cf` is absent) is
 * authoritative. Keeping that precedence in one pure resolver prevents a
 * school slug from silently changing the renderer used by a shared chart.
 */
export const REFERENCE_DEFAULT_CFG = Object.freeze([
  1, 2, 3, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 2, 0, 0,
]);
export const REFERENCE_DEFAULT_TYPE_LS = REFERENCE_DEFAULT_CFG[1];

export function resolveReferenceTypeLs(input: {
  hasBirthParam: boolean;
  decodedCfg?: readonly number[] | null;
  explicitTypeLs?: number;
  routeTypeLs?: number;
  fallbackTypeLs?: number;
}) {
  const clamp = (value: number) => Math.min(9, Math.max(0, Math.trunc(value)));
  if (input.explicitTypeLs !== undefined && Number.isFinite(input.explicitTypeLs)) {
    return clamp(input.explicitTypeLs);
  }

  const payloadTypeLs = input.hasBirthParam
    ? input.decodedCfg && Number.isFinite(input.decodedCfg[1])
      ? input.decodedCfg[1]
      : REFERENCE_DEFAULT_TYPE_LS
    : undefined;
  if (payloadTypeLs !== undefined) return clamp(payloadTypeLs);
  if (input.routeTypeLs !== undefined && Number.isFinite(input.routeTypeLs)) return clamp(input.routeTypeLs);
  return clamp(input.fallbackTypeLs ?? REFERENCE_DEFAULT_TYPE_LS);
}

export function decompressConfigToken(cf: string): number[] | null {
  if (!cf) return null;
  try {
    if (/^\d+$/.test(cf)) return cf.padStart(23, "0").split("").map(Number);
    const parts = cf.split("-");
    if (parts.length !== 3) return null;
    const a = BigInt(parseInt(parts[0], 36)).toString().padStart(8, "0");
    const b = BigInt(parseInt(parts[1], 36)).toString().padStart(8, "0");
    const c = BigInt(parseInt(parts[2], 36)).toString().padStart(7, "0");
    const digits = (a + b + c).split("").map(Number);
    return digits.length === 23 ? digits : null;
  } catch {
    return null;
  }
}

export type ZiweiPeriodStar = { name: string; branch: string; transform?: number };

export type ZiweiNatalPlacementInput = {
  yearStem: string;
  yearBranch: string;
  lunarMonth: number;
  lunarDay: number;
  hourBranch: string;
  gender: "Nam" | "Nữ";
  lifePalaceBranch: string;
  bodyPalaceBranch: string;
  isTrungChau: boolean;
};

type ZiweiDignity = "M" | "V" | "Đ" | "B" | "H";

const DIGNITY_BY_MAJOR_STAR: Record<string, Partial<Record<(typeof ZIWEI_BRANCHES)[number], ZiweiDignity>>> = {
  "TỬ VI": { Tị: "M", Ngọ: "M", Dần: "M", Thân: "M", Thìn: "V", Tuất: "V", Sửu: "Đ", Mùi: "Đ", Mão: "B", Hợi: "B", Dậu: "B", Tý: "B" },
  "THIÊN CƠ": { Thìn: "M", Tuất: "M", Mão: "M", Dậu: "M", Tị: "V", Thân: "V", Tý: "Đ", Ngọ: "Đ", Sửu: "Đ", Mùi: "Đ", Dần: "H", Hợi: "H" },
  "THÁI DƯƠNG": { Tị: "M", Ngọ: "M", Dần: "M", Mão: "M", Thìn: "M", Sửu: "Đ", Mùi: "Đ", Thân: "H", Dậu: "H", Tuất: "H", Hợi: "H", Tý: "H" },
  "VŨ KHÚC": { Thìn: "M", Tuất: "M", Sửu: "M", Mùi: "M", Dần: "V", Thân: "V", Tý: "V", Ngọ: "V", Mão: "Đ", Dậu: "Đ", Tị: "H", Hợi: "H" },
  "THIÊN ĐỒNG": { Dần: "M", Thân: "M", Tý: "V", Mão: "Đ", Tị: "Đ", Hợi: "Đ", Ngọ: "H", Dậu: "H", Thìn: "H", Tuất: "H", Sửu: "H", Mùi: "H" },
  "LIÊM TRINH": { Thìn: "M", Tuất: "M", Tý: "V", Ngọ: "V", Dần: "V", Thân: "V", Sửu: "Đ", Mùi: "Đ", Tị: "H", Hợi: "H", Mão: "H", Dậu: "H" },
  "THIÊN PHỦ": { Dần: "M", Thân: "M", Tý: "M", Ngọ: "M", Thìn: "V", Tuất: "V", Tị: "Đ", Hợi: "Đ", Mùi: "Đ", Mão: "B", Dậu: "B", Sửu: "B" },
  "THÁI ÂM": { Dậu: "M", Tuất: "M", Hợi: "M", Thân: "V", Tý: "V", Sửu: "Đ", Mùi: "Đ", Dần: "H", Mão: "H", Thìn: "H", Tị: "H", Ngọ: "H" },
  "THAM LANG": { Sửu: "M", Mùi: "M", Thìn: "V", Tuất: "V", Dần: "Đ", Thân: "Đ", Tị: "H", Hợi: "H", Tý: "H", Ngọ: "H", Mão: "H", Dậu: "H" },
  "CỰ MÔN": { Mão: "M", Dậu: "M", Tý: "V", Ngọ: "V", Dần: "V", Thân: "Đ", Hợi: "Đ", Thìn: "H", Tuất: "H", Sửu: "H", Mùi: "H", Tị: "H" },
  "THIÊN TƯỚNG": { Dần: "M", Thân: "M", Thìn: "V", Tuất: "V", Tý: "V", Ngọ: "V", Sửu: "Đ", Mùi: "Đ", Tị: "Đ", Hợi: "Đ", Mão: "H", Dậu: "H" },
  "THIÊN LƯƠNG": { Ngọ: "M", Thìn: "M", Tuất: "M", Tý: "V", Mão: "V", Dần: "V", Thân: "V", Sửu: "Đ", Mùi: "Đ", Dậu: "H", Tị: "H", Hợi: "H" },
  "THẤT SÁT": { Dần: "M", Thân: "M", Tý: "M", Ngọ: "M", Tị: "V", Hợi: "V", Sửu: "Đ", Mùi: "Đ", Mão: "H", Dậu: "H", Thìn: "H", Tuất: "H" },
  "PHÁ QUÂN": { Tý: "M", Ngọ: "M", Sửu: "V", Mùi: "V", Thìn: "Đ", Tuất: "Đ", Mão: "H", Dậu: "H", Dần: "H", Thân: "H", Tị: "H", Hợi: "H" },
};

export function getReferenceZiweiDignity(starName: string, branch: string, fallback = "") {
  const normalizedStar = starName.trim().toLocaleUpperCase("vi-VN");
  const normalizedBranch = branch === "Tỵ" ? "Tị" : branch;
  return DIGNITY_BY_MAJOR_STAR[normalizedStar]?.[normalizedBranch as (typeof ZIWEI_BRANCHES)[number]] ?? fallback;
}

// Indexes use the canonical stem order above and branch order Tý → Hợi.
const LOC_TON_BY_STEM = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0] as const;
const KHOI_BY_STEM = [1, 0, 11, 11, 1, 0, 1, 6, 3, 3] as const;
const VIET_BY_STEM = [7, 8, 9, 9, 7, 8, 7, 2, 5, 5] as const;

const NATAL_REFERENCE_STARS = [
  "Lộc Tồn", "Thiên Không", "Địa Không", "Địa Kiếp", "Hỏa Tinh", "Linh Tinh", "Kình Dương", "Đà La",
  "Thiên Khôi", "Thiên Việt", "Tả Phụ", "Hữu Bật", "Văn Xương", "Văn Khúc",
  "Ân Quang", "Thiên Quý", "Tam Thai", "Bát Tọa", "Thai Phụ", "Phong Cáo",
  "Quốc Ấn", "Đường Phù", "Long Trì", "Phượng Các", "Hoa Cái", "Thiên Mã",
  "Thiên Khốc", "Thiên Hư", "Đào Hoa", "Hồng Loan", "Thiên Hỉ", "Cô Thần",
  "Quả Tú", "Thiên Hình", "Thiên Diêu", "Thiên Y", "Lưu Hà", "Kiếp Sát",
  "Phá Toái", "Thiên Quan", "Thiên Phúc", "Văn Tinh", "Thiên Trù", "Thiên Đức",
  "Nguyệt Đức", "Thiên Giải", "Địa Giải", "Giải Thần", "Thiên Tài", "Thiên Thọ",
  "Đẩu Quân", "Thiên Thương", "Thiên Sứ", "Thiên La", "Địa Võng", "Tướng Tinh",
  "Phan An", "Tuế Dịch", "Tức Thần", "Tai Sát", "Thiên Sát", "Chỉ Bối",
  "Nguyệt Sát", "Vong Thần", "Niên Giải", "Nguyệt Giải", "Thiên Vu", "Thiên Nguyệt",
] as const;

export const REFERENCE_ZIWEI_MANAGED_NATAL_STARS = new Set<string>(NATAL_REFERENCE_STARS);

const TMD_STEMS = ["Canh", "Tân", "Nhâm", "Quý", "Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ"] as const;
const LONG_TRI_BY_BRANCH = [4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2, 3] as const;
const PHUONG_CAC_BY_BRANCH = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 11] as const;
const HOA_CAI_BY_BRANCH: Record<number, number> = { 0: 4, 4: 4, 8: 4, 1: 1, 5: 1, 9: 1, 2: 10, 6: 10, 10: 10, 3: 7, 7: 7, 11: 7 };
const THIEN_MA_BY_BRANCH: Record<number, number> = { 0: 2, 4: 2, 8: 2, 1: 11, 5: 11, 9: 11, 2: 8, 6: 8, 10: 8, 3: 5, 7: 5, 11: 5 };
const DAO_HOA_BY_BRANCH: Record<number, number> = { 0: 9, 4: 9, 8: 9, 1: 6, 5: 6, 9: 6, 2: 3, 6: 3, 10: 3, 3: 0, 7: 0, 11: 0 };
const CO_QUA_BY_BRANCH: Record<number, [number, number]> = {
  0: [2, 10], 1: [2, 10], 2: [5, 1], 3: [5, 1], 4: [5, 1], 5: [8, 4],
  6: [8, 4], 7: [8, 4], 8: [11, 7], 9: [11, 7], 10: [11, 7], 11: [2, 10],
};
const QUAN_PHUC_NIEN_TRU_BY_STEM: Record<number, [number, number, number, number]> = {
  0: [11, 6, 11, 11], 1: [9, 5, 0, 0], 2: [10, 6, 2, 2], 3: [6, 5, 3, 3],
  4: [7, 9, 5, 5], 5: [4, 8, 6, 6], 6: [5, 0, 8, 5], 7: [2, 11, 9, 6],
  8: [3, 3, 8, 8], 9: [9, 2, 9, 9],
};
const TRUNG_CHAU_MONTH_STARS: Record<number, [number, number, number]> = {
  1: [8, 5, 10], 2: [8, 8, 5], 3: [10, 2, 4], 4: [10, 11, 2],
  5: [0, 5, 7], 6: [0, 8, 3], 7: [2, 2, 11], 8: [2, 11, 7],
  9: [4, 5, 2], 10: [4, 8, 6], 11: [6, 2, 10], 12: [6, 11, 2],
};

const branchAt = (index: number) => ZIWEI_BRANCHES[((index % 12) + 12) % 12];
const move = (start: number, count: number, forward = true) => ((start + (forward ? 1 : -1) * Math.max(0, count - 1)) % 12 + 12) % 12;

/**
 * Natal auxiliary-star conventions used by the reference chart. Iztro and the
 * reference product differ for a small but important set (Hỏa/Linh, Tả Phụ,
 * Quang/Quý, Quốc Ấn, Đường Phù, the giải stars, La/Võng and Trung Châu rings).
 * Keeping those placements explicit makes the output stable across birth years.
 */
export function getReferenceZiweiNatalPlacements(input: ZiweiNatalPlacementInput) {
  const placements = new Map<string, string>();
  const add = (name: string, branchIndex: number) => placements.set(name, branchAt(branchIndex));
  const canonicalStemIndex = Math.max(0, ZIWEI_STEMS.indexOf(input.yearStem as (typeof ZIWEI_STEMS)[number]));
  const tmdStemIndex = Math.max(0, TMD_STEMS.indexOf(input.yearStem as (typeof TMD_STEMS)[number]));
  const yearBranchIndex = Math.max(0, ZIWEI_BRANCHES.indexOf((input.yearBranch === "Tỵ" ? "Tị" : input.yearBranch) as (typeof ZIWEI_BRANCHES)[number]));
  const hourBranchIndex = Math.max(0, ZIWEI_BRANCHES.indexOf((input.hourBranch === "Tỵ" ? "Tị" : input.hourBranch) as (typeof ZIWEI_BRANCHES)[number]));
  const lifeBranchIndex = Math.max(0, ZIWEI_BRANCHES.indexOf((input.lifePalaceBranch === "Tỵ" ? "Tị" : input.lifePalaceBranch) as (typeof ZIWEI_BRANCHES)[number]));
  const bodyBranchIndex = Math.max(0, ZIWEI_BRANCHES.indexOf((input.bodyPalaceBranch === "Tỵ" ? "Tị" : input.bodyPalaceBranch) as (typeof ZIWEI_BRANCHES)[number]));
  const locTonIndex = LOC_TON_BY_STEM[canonicalStemIndex];
  const yearIsYang = canonicalStemIndex % 2 === 0;
  const genderIsYang = input.gender === "Nam";

  add("Lộc Tồn", locTonIndex);
  add("Kình Dương", locTonIndex + 1);
  add("Đà La", locTonIndex - 1);
  add("Thiên Không", yearBranchIndex + 1);
  add("Địa Không", move(11, hourBranchIndex + 1, false));
  add("Địa Kiếp", move(11, hourBranchIndex + 1, true));
  const fireBase: Record<number, number> = { 0: 2, 4: 2, 8: 2, 1: 3, 5: 3, 9: 3, 2: 1, 6: 1, 10: 1, 3: 9, 7: 9, 11: 9 };
  const bellBase: Record<number, number> = { 0: 10, 4: 10, 8: 10, 1: 10, 5: 10, 9: 10, 2: 3, 6: 3, 10: 3, 3: 10, 7: 10, 11: 10 };
  const fireForward = input.isTrungChau || genderIsYang === yearIsYang;
  const bellForward = input.isTrungChau || genderIsYang !== yearIsYang;
  add("Hỏa Tinh", move(fireBase[yearBranchIndex], hourBranchIndex + 1, fireForward));
  add("Linh Tinh", move(bellBase[yearBranchIndex], hourBranchIndex + 1, bellForward));

  add("Thiên Khôi", KHOI_BY_STEM[canonicalStemIndex]);
  add("Thiên Việt", VIET_BY_STEM[canonicalStemIndex]);
  const vanXuongIndex = move(10, hourBranchIndex + 1, false);
  const vanKhucIndex = move(4, hourBranchIndex + 1, true);
  const taPhuIndex = move(4, input.lunarMonth, true);
  const huuBatIndex = move(10, input.lunarMonth, false);
  add("Văn Xương", vanXuongIndex);
  add("Văn Khúc", vanKhucIndex);
  add("Tả Phụ", taPhuIndex);
  add("Hữu Bật", huuBatIndex);
  add("Ân Quang", move(move(vanXuongIndex, input.lunarDay, true), 2, false));
  add("Thiên Quý", move(move(vanKhucIndex, input.lunarDay, false), 2, true));
  add("Tam Thai", move(taPhuIndex, input.lunarDay, true));
  add("Bát Tọa", move(huuBatIndex, input.lunarDay, false));
  add("Thai Phụ", move(6, hourBranchIndex + 1, true));
  add("Phong Cáo", move(2, hourBranchIndex + 1, true));
  add("Quốc Ấn", move(locTonIndex, 9, true));
  add("Đường Phù", move(locTonIndex, 8, false));

  add("Long Trì", LONG_TRI_BY_BRANCH[yearBranchIndex]);
  add("Phượng Các", PHUONG_CAC_BY_BRANCH[yearBranchIndex]);
  add("Hoa Cái", HOA_CAI_BY_BRANCH[yearBranchIndex]);
  add("Thiên Mã", THIEN_MA_BY_BRANCH[yearBranchIndex]);
  add("Thiên Khốc", 6 - yearBranchIndex);
  add("Thiên Hư", 6 + yearBranchIndex);
  add("Đào Hoa", DAO_HOA_BY_BRANCH[yearBranchIndex]);
  const hongLoanIndex = 3 - yearBranchIndex;
  add("Hồng Loan", hongLoanIndex);
  add("Thiên Hỉ", hongLoanIndex + 6);
  add("Cô Thần", CO_QUA_BY_BRANCH[yearBranchIndex][0]);
  add("Quả Tú", CO_QUA_BY_BRANCH[yearBranchIndex][1]);

  add("Lưu Hà", ({ 0: 9, 1: 10, 2: 7, 3: 8, 4: 5, 5: 6, 6: 4, 7: 3, 8: 11, 9: 2 } as Record<number, number>)[canonicalStemIndex]);
  add("Kiếp Sát", ({ 0: 5, 4: 5, 8: 5, 1: 2, 5: 2, 9: 2, 2: 11, 6: 11, 10: 11, 3: 8, 7: 8, 11: 8 } as Record<number, number>)[yearBranchIndex]);
  add("Phá Toái", ({ 0: 5, 3: 5, 6: 5, 9: 5, 2: 9, 5: 9, 8: 9, 11: 9, 1: 1, 4: 1, 7: 1, 10: 1 } as Record<number, number>)[yearBranchIndex]);
  add("Thiên Hình", move(9, input.lunarMonth, true));
  const rieuYIndex = move(1, input.lunarMonth, true);
  add("Thiên Diêu", rieuYIndex);
  add("Thiên Y", rieuYIndex);

  const [thienQuan, thienPhuc, vanTinh, thienTru] = QUAN_PHUC_NIEN_TRU_BY_STEM[tmdStemIndex];
  add("Thiên Quan", thienQuan);
  add("Thiên Phúc", thienPhuc);
  add("Văn Tinh", vanTinh);
  add("Thiên Trù", thienTru);
  add("Thiên Đức", move(9, yearBranchIndex + 1, true));
  add("Nguyệt Đức", move(5, yearBranchIndex + 1, true));
  add("Thiên Giải", move(8, input.lunarMonth, true));
  add("Địa Giải", move(7, input.lunarMonth, true));
  add("Giải Thần", PHUONG_CAC_BY_BRANCH[yearBranchIndex]);
  add("Thiên Tài", move(lifeBranchIndex, yearBranchIndex + 1, true));
  add("Thiên Thọ", move(bodyBranchIndex, yearBranchIndex + 1, true));
  let dauQuanIndex = move(yearBranchIndex, input.lunarMonth, false);
  dauQuanIndex = move(dauQuanIndex, hourBranchIndex + 1, true);
  add("Đẩu Quân", dauQuanIndex);
  add("Thiên Thương", lifeBranchIndex + 5);
  add("Thiên Sứ", lifeBranchIndex + 7);
  add("Thiên La", 4);
  add("Địa Võng", 10);

  if (input.isTrungChau) {
    add("Niên Giải", 10 - yearBranchIndex);
    const [nguyetGiai, thienVu, thienNguyet] = TRUNG_CHAU_MONTH_STARS[input.lunarMonth] ?? [0, 0, 0];
    add("Nguyệt Giải", nguyetGiai);
    add("Thiên Vu", thienVu);
    add("Thiên Nguyệt", thienNguyet);
    const generalIndex = ({ 0: 0, 4: 0, 8: 0, 2: 6, 6: 6, 10: 6, 3: 3, 7: 3, 11: 3, 1: 9, 5: 9, 9: 9 } as Record<number, number>)[yearBranchIndex] ?? 0;
    const vtt = ["Tướng Tinh", "Phan An", "Tuế Dịch", "Tức Thần", "", "", "Tai Sát", "Thiên Sát", "Chỉ Bối", "", "Nguyệt Sát", "Vong Thần"];
    vtt.forEach((name, offset) => {
      if (name) add(name, generalIndex + offset);
    });
  }

  return placements;
}

const TRIET_BY_CANONICAL_STEM: Record<number, [number, number]> = {
  0: [8, 9], 5: [8, 9],
  1: [6, 7], 6: [6, 7],
  2: [4, 5], 7: [4, 5],
  3: [2, 3], 8: [2, 3],
  4: [0, 1], 9: [0, 1],
};

export function getZiweiTuanTriet(yearStem: string, yearBranch: string) {
  const stemIndex = Math.max(0, ZIWEI_STEMS.indexOf(yearStem as (typeof ZIWEI_STEMS)[number]));
  const branchIndex = Math.max(0, ZIWEI_BRANCHES.indexOf((yearBranch === "Tỵ" ? "Tị" : yearBranch) as (typeof ZIWEI_BRANCHES)[number]));
  const triet = TRIET_BY_CANONICAL_STEM[stemIndex] ?? [0, 1];
  const branchAtGiap = ((branchIndex - stemIndex) % 12 + 12) % 12;
  const tuan: [number, number] = [
    ((branchAtGiap - 2) % 12 + 12) % 12,
    ((branchAtGiap - 1) % 12 + 12) % 12,
  ];
  return { tuan, triet };
}

export type ZiweiDecadeYearEntry = {
  age: number;
  year: number;
  stem: string;
  branch: string;
};

export function getZiweiPalaceDecadeYears(
  natalYearBranch: string,
  birthYear: number,
  palaceIndex: number,
  maxAge = 96,
): ZiweiDecadeYearEntry[] {
  const natalBranchIndex = Math.max(0, ZIWEI_BRANCHES.indexOf((natalYearBranch === "Tỵ" ? "Tị" : natalYearBranch) as (typeof ZIWEI_BRANCHES)[number]));
  const results: ZiweiDecadeYearEntry[] = [];
  for (let age = 1; age <= maxAge; age++) {
    const palace = (natalBranchIndex + age - 1) % 12;
    if (palace === palaceIndex) {
      const year = birthYear + age - 1;
      const stemIndex = ((year - 4) % 10 + 10) % 10;
      const branchIndex = ((year - 4) % 12 + 12) % 12;
      const stem = ZIWEI_STEMS[stemIndex];
      const branch = ZIWEI_BRANCHES[branchIndex];
      results.push({ age, year, stem, branch });
    }
  }
  return results;
}

const KING_CIRCLE = [
  "Thái Tuế", "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù",
  "Tuế Phá", "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù",
] as const;
const DOCTOR_CIRCLE = [
  "Bác Sĩ", "Lực Sĩ", "Thanh Long", "Tiểu Hao", "Tướng Quân", "Tấu Thư",
  "Phi Liêm", "Hỉ Thần", "Bệnh Phù", "Đại Hao", "Phục Binh", "Quan Phủ",
] as const;
const ANNUAL_DISPLAY_ORDER = [
  "Thiên Khốc", "Thiên Hư", "Thiên Việt", "Thiên Khôi", "Văn Xương", "Văn Khúc",
  "Lộc Tồn", "Kình Dương", "Đà La", "Thiên Mã", "Đào Hoa", "Thiên Không",
  "Long Đức", "Bạch Hổ", "Phúc Đức", "Điếu Khách", "Trực Phù", "Thái Tuế",
  "Thiếu Dương", "Tang Môn", "Thiếu Âm", "Quan Phù", "Tử Phù", "Tuế Phá",
  "Tấu Thư", "Tướng Quân", "Tiểu Hao", "Thanh Long", "Lực Sĩ", "Bác Sĩ",
  "Quan Phủ", "Phục Binh", "Đại Hao", "Bệnh Phù", "Hỉ Thần", "Phi Liêm",
  "Phượng Các", "Phá Toái", "Thiên Hỉ", "Hồng Loan", "Lưu Hà", "Long Trì",
  "Hoa Cái", "Kiếp Sát",
] as const;

export const ziweiBranchAt = (index: number) => ZIWEI_BRANCHES[((index % 12) + 12) % 12];

/**
 * The natal Thái Tuế and Bác Sĩ rings used by Tinh Mệnh Đồ.  Iztro exposes
 * similarly named fields, but those fields follow a different ring convention
 * for a number of palaces (for example Nhâm Thân puts Tử Phù at Sửu and
 * Quan Phủ at Tý).  Keeping the rings explicit also makes them stable when the
 * birth year or gender changes.
 */
export function getReferenceZiweiNatalCycleStars(
  pillar: { stem: string; branch: string },
  forward: boolean,
) {
  const branchIndex = Math.max(0, ZIWEI_BRANCHES.indexOf((pillar.branch === "Tỵ" ? "Tị" : pillar.branch) as (typeof ZIWEI_BRANCHES)[number]));
  const stemIndex = Math.max(0, ZIWEI_STEMS.indexOf(pillar.stem as (typeof ZIWEI_STEMS)[number]));
  const locTonIndex = LOC_TON_BY_STEM[stemIndex];
  const stars: ZiweiPeriodStar[] = [];
  KING_CIRCLE.forEach((name, index) => stars.push({ name, branch: ziweiBranchAt(branchIndex + index) }));
  DOCTOR_CIRCLE.forEach((name, index) => stars.push({ name, branch: ziweiBranchAt(locTonIndex + (forward ? index : -index)) }));
  return stars;
}

export function getZiweiFivePeriodStars(stem: string, prefix: "L." | "Đ."): ZiweiPeriodStar[] {
  const stemIndex = Math.max(0, ZIWEI_STEMS.indexOf(stem as (typeof ZIWEI_STEMS)[number]));
  const locTonIndex = LOC_TON_BY_STEM[stemIndex];
  return [
    { name: `${prefix}Lộc Tồn`, branch: ziweiBranchAt(locTonIndex) },
    { name: `${prefix}Kình Dương`, branch: ziweiBranchAt(locTonIndex + 1) },
    { name: `${prefix}Đà La`, branch: ziweiBranchAt(locTonIndex - 1) },
    { name: `${prefix}Thiên Khôi`, branch: ziweiBranchAt(KHOI_BY_STEM[stemIndex]) },
    { name: `${prefix}Thiên Việt`, branch: ziweiBranchAt(VIET_BY_STEM[stemIndex]) },
  ];
}

const PERIOD_XUONG_KHUC_BY_STEM = [
  [8, 6], [9, 5], [11, 3], [0, 2], [2, 0],
  [3, 11], [5, 9], [6, 8], [8, 6], [9, 5],
] as const;

/** Period Khôi/Việt/Xương/Khúc used by the reference moving-star layers. */
export function getZiweiPeriodSupportStars(stem: string, prefix: "L." | "Đ."): ZiweiPeriodStar[] {
  const stemIndex = Math.max(0, ZIWEI_STEMS.indexOf(stem as (typeof ZIWEI_STEMS)[number]));
  const [xuongIndex, khucIndex] = PERIOD_XUONG_KHUC_BY_STEM[stemIndex];
  return [
    ...getZiweiFivePeriodStars(stem, prefix).slice(3),
    { name: `${prefix}Văn Xương`, branch: ziweiBranchAt(xuongIndex) },
    { name: `${prefix}Văn Khúc`, branch: ziweiBranchAt(khucIndex) },
  ];
}

export function getReferenceZiweiAnnualStars(
  pillar: { stem: string; branch: string },
  mode: number,
  forward: boolean,
  isTrungChau = false,
) {
  if (mode === 0) return [] as ZiweiPeriodStar[];
  const branchIndex = Math.max(0, ZIWEI_BRANCHES.indexOf((pillar.branch === "Tỵ" ? "Tị" : pillar.branch) as (typeof ZIWEI_BRANCHES)[number]));
  const stemIndex = Math.max(0, ZIWEI_STEMS.indexOf(pillar.stem as (typeof ZIWEI_STEMS)[number]));
  const locTonIndex = LOC_TON_BY_STEM[stemIndex];
  const stars: ZiweiPeriodStar[] = [];
  const add = (name: string, index: number) => {
    if (!stars.some((star) => star.name === `L.${name}`)) {
      stars.push({ name: `L.${name}`, branch: ziweiBranchAt(index) });
    }
  };

  add("Thái Tuế", branchIndex);
  add("Tang Môn", branchIndex + 2);
  add("Bạch Hổ", branchIndex + 8);
  add("Thiên Mã", ({ 1: 11, 5: 11, 9: 11, 3: 5, 7: 5, 11: 5, 2: 8, 6: 8, 10: 8, 0: 2, 4: 2, 8: 2 } as Record<number, number>)[branchIndex]);
  add("Thiên Khốc", 6 - branchIndex);
  add("Thiên Hư", 6 + branchIndex);
  getZiweiFivePeriodStars(pillar.stem, "L.").slice(0, 3).forEach((star) => stars.push(star));

  if (mode >= 3 || isTrungChau) {
    getZiweiPeriodSupportStars(pillar.stem, "L.").forEach((star) => stars.push(star));
  }

  if (mode >= 2) {
    add("Điếu Khách", branchIndex + 10);
    add("Đại Hao", locTonIndex + (forward ? 9 : -9));
    add("Đào Hoa", ({ 1: 6, 5: 6, 9: 6, 3: 0, 7: 0, 11: 0, 2: 3, 6: 3, 10: 3, 0: 9, 4: 9, 8: 9 } as Record<number, number>)[branchIndex]);
    add("Hồng Loan", 3 - branchIndex);
  }

  if (mode >= 3) {
    KING_CIRCLE.forEach((name, index) => add(name, branchIndex + index));
    add("Thiên Không", branchIndex + 1);
    DOCTOR_CIRCLE.forEach((name, index) => add(name, locTonIndex + (forward ? index : -index)));
    add("Thiên Hỉ", 9 - branchIndex);
    add("Long Trì", 4 + branchIndex);
    add("Phượng Các", 10 - branchIndex);
    add("Hoa Cái", ({ 1: 1, 5: 1, 9: 1, 3: 7, 7: 7, 11: 7, 2: 10, 6: 10, 10: 10, 0: 4, 4: 4, 8: 4 } as Record<number, number>)[branchIndex]);
    add("Lưu Hà", ({ 0: 9, 1: 10, 2: 7, 3: 8, 4: 5, 5: 6, 6: 4, 7: 3, 8: 11, 9: 2 } as Record<number, number>)[stemIndex]);
    add("Kiếp Sát", ({ 0: 5, 4: 5, 8: 5, 1: 2, 5: 2, 9: 2, 2: 11, 6: 11, 10: 11, 3: 8, 7: 8, 11: 8 } as Record<number, number>)[branchIndex]);
    add("Phá Toái", ({ 0: 5, 3: 5, 6: 5, 9: 5, 2: 9, 5: 9, 8: 9, 11: 9, 1: 1, 4: 1, 7: 1, 10: 1 } as Record<number, number>)[branchIndex]);
  }

  return stars.sort((left, right) => {
    const leftIndex = ANNUAL_DISPLAY_ORDER.indexOf(left.name.slice(2) as (typeof ANNUAL_DISPLAY_ORDER)[number]);
    const rightIndex = ANNUAL_DISPLAY_ORDER.indexOf(right.name.slice(2) as (typeof ANNUAL_DISPLAY_ORDER)[number]);
    return leftIndex - rightIndex;
  });
}
