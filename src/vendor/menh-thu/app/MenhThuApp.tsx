// @ts-nocheck
"use client";

import { lazy, Suspense, useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { astro } from "iztro";
import { calculateFullHoroChart } from "./horo-adapter";
import { buildChartMarkdownForAi } from "./chart-ai-markdown";
import {
  ArrowRight,
  ArrowUp,
  Ban,
  BookOpen,
  Bot,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ClipboardCopy,
  Clock3,
  Coins,
  Compass,
  ExternalLink,
  Eye,
  FileText,
  Home,
  LayoutGrid,
  LibraryBig,
  Link2,
  MapPin,
  Minus,
  Moon,
  MoveHorizontal,
  Navigation,
  PencilLine,
  Phone,
  Plus,
  Printer,
  RotateCcw,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  type LucideIcon,
} from "lucide-react";
import {
  type BaziRelation,
  ElementName,
  type Pillar,
  TimeCalculationMode,
  getAnnualPillar,
  getBaziTemperature,
  getBaziRelations,
  getBaziSupportProfile,
  getDayAgeRelations,
  getDateProfile,
  getElementBalance,
  getFourPillars,
  getHexagram,
  getHaLacChart,
  getHiddenStems,
  getLifeStage,
  getLuckCycles,
  getLunarDate,
  getMonthCalendar,
  getNaYin,
  getPersonalDayCompatibility,
  getSolarTerm,
  getTenGod,
  getVietnameseObservances,
  isValidDateString,
  isValidTimeString,
  toDateString,
} from "../../../../shared/menh-thu/metaphysics";
import { getAstronomicalTimezoneInfo } from "./astronomical-calendar";
import { getLocalSolarTimeProfile, getMoonVoidOfCourse, overlapsMoonVoc } from "./moon-voc";
import {
  REFERENCE_MINOR_STAR_DIGNITY,
  REFERENCE_DEFAULT_CFG,
  REFERENCE_DEFAULT_TYPE_LS,
  REFERENCE_ZIWEI_SHARED_PRESET,
  ZIWEI_BRANCHES,
  REFERENCE_ZIWEI_MANAGED_NATAL_STARS,
  ZIWEI_STEMS,
  decompressConfigToken,
  getReferenceZiweiAnnualStars,
  getReferenceZiweiDignity,
  getReferenceZiweiFooter,
  getReferenceZiweiNatalPlacements,
  getReferenceZiweiNatalCycleStars,
  getReferenceZiweiPeriodBadgeLayers,
  getReferenceZiweiStarColumn,
  getZiweiFivePeriodStars,
  getZiweiPeriodSupportStars,
  getZiweiTuanTriet,
  resolveReferenceTypeLs,
  sortReferenceZiweiMinorStars,
} from "./ziwei-reference";

type ToolKey = "home" | "iching" | "bazi" | "calendar" | "sim";
const TinhMenhDoChart = lazy(() => import("./TinhMenhDoChart"));
const SimPhongThuyView = lazy(() => import("./SimPhongThuyView"));
const TOOL_PATHS: Record<ToolKey, string> = {
  home: "/",
  iching: "/gieo-que",
  bazi: "/tu-tru",
  calendar: "/ngay-tot",
  sim: "/sim-phong-thuy",
};
const CALENDAR_PROFILE_STORAGE_KEY = "menh-thu.calendar-fixed-age.v1";

function toolFromPath(pathname: string): ToolKey {
  const entry = (Object.entries(TOOL_PATHS) as [ToolKey, string][]).find(([, path]) => path === pathname);
  return entry?.[0] ?? "home";
}
type BaziView = "chart" | "fortune" | "analysis" | "ai" | "notes";
type BaziConfigTab = "time" | "chart" | "display" | "advanced";
type BaziChartStyle = "Mặc định" | "Tứ Trụ" | "Lương Phái + Nam phái" | "Khâm Thiên + Nam phái" | "Nam phái" | "Lương Phái" | "Khâm Thiên" | "Trung Châu Phái" | "Trung Châu Phái + Khâm Thiên" | "Trung Châu Phái + Lương Phái";
type BirthData = {
  name: string;
  gender: "Nam" | "Nữ";
  date: string;
  time: string;
  viewYear: number;
  viewDate: string;
  viewTime: string;
  location: number;
  locationName: string;
  timezone: string;
  latitude: number;
  longitude: number;
  utcOffset: number;
  calculationMode: TimeCalculationMode;
};

const VIETNAM_UTC_OFFSET = 7;
const LOCATIONS = [
  { name: "Việt Nam", detail: "Múi giờ cố định UTC+7", noon: "12:00", latitude: 21.0285, longitude: 105.8333, utcOffset: VIETNAM_UTC_OFFSET, timezone: "Asia/Ho_Chi_Minh" },
];
const DEFAULT_BIRTH_LOCATION = LOCATIONS[0];

const formatUtcOffset = (offset: number) => {
  const sign = offset >= 0 ? "+" : "−";
  const absolute = Math.abs(offset);
  const hours = Math.floor(absolute);
  const minutes = Math.round((absolute - hours) * 60);
  return `UTC${sign}${hours}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}`;
};

const TIME_MODE_COPY: Record<TimeCalculationMode, { label: string; short: string; description: string }> = {
  civil: { label: "Giờ dân dụng", short: "Dân dụng", description: "Giữ nguyên giờ đồng hồ tại nơi sinh." },
  mean: { label: "Giờ bình Mặt Trời", short: "Bình Mặt Trời", description: "Hiệu chỉnh theo chênh lệch kinh độ với kinh tuyến múi giờ." },
  apparent: { label: "Giờ Mặt Trời thực", short: "Mặt Trời thực", description: "Bổ sung phương trình thời gian theo ngày trong năm." },
};

const ANNUAL_BRANCH_ORDER = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
const BAZI_THREE_COMBINE_GROUPS = [["Thân", "Tý", "Thìn"], ["Hợi", "Mão", "Mùi"], ["Dần", "Ngọ", "Tuất"], ["Tị", "Dậu", "Sửu"]];
const BAZI_YANG_STEMS_BRANCHES = new Set(["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Dần", "Mão", "Tị", "Ngọ", "Mùi", "Tuất"]);
const BAZI_RELATION_STYLES: Record<BaziRelation["kind"], { color: string; dash: string; width: number; tension: number }> = {
  combine: { color: "#10b981", dash: "", width: 1.2, tension: 0.5 },
  clash: { color: "#ef4444", dash: "", width: 1.7, tension: 0 },
  punishment: { color: "#a855f7", dash: "8, 4", width: 1.5, tension: 0.5 },
  harm: { color: "#ef4444", dash: "13, 7, 2, 7", width: 2, tension: 0 },
  break: { color: "#555555", dash: "2, 5", width: 1, tension: 0.5 },
};

const TEN_GOD_SHORT: Record<string, string> = {
  "Tỷ Kiên": "Tỷ",
  "Kiếp Tài": "Kiếp",
  "Thực Thần": "Thực",
  "Thương Quan": "Thương",
  "Thiên Tài": "T.Tài",
  "Chính Tài": "Tài",
  "Thất Sát": "Sát",
  "Chính Quan": "Quan",
  "Thiên Ấn": "Kiêu",
  "Chính Ấn": "Ấn",
};

const shortTenGod = (name: string) => TEN_GOD_SHORT[name] ?? name;
const BAZI_CHART_STYLES: BaziChartStyle[] = [
  "Mặc định",
  "Lương Phái + Nam phái",
  "Khâm Thiên + Nam phái",
  "Nam phái",
  "Lương Phái",
  "Khâm Thiên",
  "Trung Châu Phái",
  "Trung Châu Phái + Khâm Thiên",
  "Trung Châu Phái + Lương Phái",
  "Tứ Trụ",
];
const TRUNG_CHAU_TABLES = ["Thiên Bàn", "Địa Bàn", "Nhân Bàn"] as const;
const PHI_HOA_TYPES = ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kị", "Tắt phi cung"] as const;
const PHI_HOA_COLORS = ["#038c00", "#6e0888", "#0e7cca", "#d90404", "#888888"] as const;
const PHI_HOA_LAYERS = ["Tiên Thiên", "Đại Vận", "Lưu Niên", "Lưu Nguyệt", "Lưu Nhật"] as const;
// The bundled Tinh Mệnh Đồ renderer reads this selector from cfg[20]
// (`showHoaIcon`).  cfg[5] and cfg[8] are separate legacy switches for
// Đại Vận/Lưu Niên transformations and must not be derived from the layer
// selector.
const PHI_HOA_LAYER_CFG_INDEX = 20;
const CAN_HOA_TABLES = ["Can hóa 1 - Canh Đồng Kị", "Can hóa 2 - Canh Âm Kị", "Can hóa 3 - Trung Châu Phái", "Can hóa 4 - Phái khác", "Can hóa 5 - Phái nhỏ"] as const;
const CURRENT_STAR_MODES = ["Không hiện", "Hiện 9 sao", "Hiện 15 sao", "Toàn bộ"] as const;
const STAR_GROUP_MODES = ["Tất cả", "Sao chính", "Sao chính, quý tinh", "Sao chính, quý tinh, trường sinh", "Sao chính, quý tinh, trường sinh, lục bại"] as const;
const ZIWEI_FOUR_TRANSFORMS: Record<string, Record<string, number>> = {
  Giáp: { "LIÊM TRINH": 0, "PHÁ QUÂN": 1, "VŨ KHÚC": 2, "THÁI DƯƠNG": 3 },
  Ất: { "THIÊN CƠ": 0, "THIÊN LƯƠNG": 1, "TỬ VI": 2, "THÁI ÂM": 3 },
  Bính: { "THIÊN ĐỒNG": 0, "THIÊN CƠ": 1, "VĂN XƯƠNG": 2, "LIÊM TRINH": 3 },
  Đinh: { "THÁI ÂM": 0, "THIÊN ĐỒNG": 1, "THIÊN CƠ": 2, "CỰ MÔN": 3 },
  Mậu: { "THAM LANG": 0, "THÁI ÂM": 1, "HỮU BẬT": 2, "THIÊN CƠ": 3 },
  Kỷ: { "VŨ KHÚC": 0, "THAM LANG": 1, "THIÊN LƯƠNG": 2, "VĂN KHÚC": 3 },
  Canh: { "THÁI DƯƠNG": 0, "VŨ KHÚC": 1, "THÁI ÂM": 2, "THIÊN ĐỒNG": 3 },
  Tân: { "CỰ MÔN": 0, "THÁI DƯƠNG": 1, "VĂN KHÚC": 2, "VĂN XƯƠNG": 3 },
  Nhâm: { "THIÊN LƯƠNG": 0, "TỬ VI": 1, "TẢ PHỤ": 2, "VŨ KHÚC": 3 },
  Quý: { "PHÁ QUÂN": 0, "CỰ MÔN": 1, "THÁI ÂM": 2, "THAM LANG": 3 },
};
const BAZI_YEAR_OPTIONS = Array.from({ length: 401 }, (_, index) => 1800 + index);
const BAZI_MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
const BAZI_HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const BAZI_MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0"));
const SOLAR_TERM_MONTH_NUMBERS: Record<string, number> = {
  Dần: 1, Mão: 2, Thìn: 3, Tị: 4, Ngọ: 5, Mùi: 6, Thân: 7, Dậu: 8, Tuất: 9, Hợi: 10, Tý: 11, Sửu: 12,
};

type ZiweiArrow = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  points: string;
  width: number;
  opacity: number;
  dash?: string;
  pathD?: string;
};

function arrowheadPoints(x1: number, y1: number, x2: number, y2: number, length = 15, width = 8) {
  const distance = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / distance;
  const uy = (y2 - y1) / distance;
  const px = -uy;
  const py = ux;
  const baseX = x2 - ux * length;
  const baseY = y2 - uy * length;
  return `${x2},${y2} ${baseX + px * width / 2},${baseY + py * width / 2} ${baseX - px * width / 2},${baseY - py * width / 2}`;
}

function makeZiweiArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  options: Partial<Pick<ZiweiArrow, "width" | "opacity" | "dash">> & { headLength?: number; headWidth?: number } = {},
): ZiweiArrow {
  return {
    x1,
    y1,
    x2,
    y2,
    color,
    points: arrowheadPoints(x1, y1, x2, y2, options.headLength, options.headWidth),
    width: options.width ?? 1.5,
    opacity: options.opacity ?? 0.8,
    dash: options.dash,
  };
}

// The reference chooses line weight from the target route. Dashed strokes are
// reserved for Lộc/Kị that actually move through the Kị chain; a fixed style
// per source palace becomes wrong as soon as the chart or configuration moves.
const ZIWEI_REFERENCE_STRONG_TARGETS = [true, false, true, true, true, false, false, true, true, false, false, false] as const;

function getZiweiCurveStyle(targetIndex: number, isMoving: boolean): Pick<ZiweiArrow, "width" | "opacity" | "dash"> {
  if (isMoving) return { width: 2, opacity: 0.9, dash: "7 3" };
  return ZIWEI_REFERENCE_STRONG_TARGETS[targetIndex]
    ? { width: 1.5, opacity: 0.7, dash: undefined }
    : { width: 0.4, opacity: 0.6, dash: undefined };
}

function getZiweiGradientStartColor(color: string): string {
  if (color === "#038c00" || color.includes("3 140 0") || color.includes("3, 140, 0")) return "rgba(90, 230, 90, 0.5)";
  if (color === "#6e0888" || color.includes("110 8 136") || color.includes("110, 8, 136")) return "rgba(227, 100, 255, 0.5)";
  if (color === "#0e7cca" || color.includes("14 124 202") || color.includes("14, 124, 202")) return "rgba(100, 200, 255, 0.5)";
  if (color === "#d90404" || color.includes("217 4 4") || color.includes("217, 4, 4")) return "rgba(255, 100, 100, 0.5)";
  return color;
}

const ZIWEI_MAJOR_STAR_SPACING = 22;
const ZIWEI_STANDALONE_SCHOOL_STAR_SPACING = 25;
const ZIWEI_MINOR_STAR_SPACING = 15;
const ZIWEI_MOVING_STAR_SPACING = 15;

const MENHTHU_TO_TINH_STYLE: Record<BaziChartStyle, number> = {
  "Mặc định": 0,
  "Lương Phái + Nam phái": 1,
  "Khâm Thiên + Nam phái": 2,
  "Nam phái": 3,
  "Lương Phái": 4,
  "Khâm Thiên": 5,
  "Trung Châu Phái": 6,
  "Trung Châu Phái + Khâm Thiên": 7,
  "Trung Châu Phái + Lương Phái": 8,
  "Tứ Trụ": 9,
};

const SLUG_TO_STYLE: Record<string, BaziChartStyle> = {
  "trung-chau-phai-kham-thien-toan-cau": "Trung Châu Phái + Khâm Thiên",
  "trung-chau-phai-luong-phai-toan-cau": "Trung Châu Phái + Lương Phái",
  "trung-chau-phai-toan-cau": "Trung Châu Phái",
  "tu-vi-trung-chau-phai": "Trung Châu Phái",
  "luong-phai-nam-phai-toan-cau": "Lương Phái + Nam phái",
  "tu-vi-phi-tinh-luong-phai": "Lương Phái",
  "kham-thien-nam-phai-toan-cau": "Khâm Thiên + Nam phái",
  "kham-thien-tu-hoa-nam-phai": "Khâm Thiên + Nam phái",
  "tu-vi-kham-thien-tu-hoa": "Khâm Thiên",
  "nam-phai-toan-cau": "Nam phái",
  "tu-vi-nam-phai": "Nam phái",
  "luong-phai-toan-cau": "Lương Phái",
  "kham-thien-toan-cau": "Khâm Thiên",
  "bazi-full-tu-tru-bat-tu-chinh-xac": "Tứ Trụ",
  "the-gioi-theo-vi-tri-sinh": "Mặc định",
  "la-so-tu-vi-viet-nam": "Mặc định",
};

const ZIWEI_EMPHASIZED_MINOR_STARS = new Set([
  "Kình Dương",
  "Hóa Lộc",
  "Linh Tinh",
  "Địa Kiếp",
  "Thiên Khôi",
  "Thiên Hình",
  "Hữu Bật",
  "Thiên Việt",
  "Hóa Kị",
  "Văn Xương",
  "Địa Không",
  "Văn Khúc",
  "Hóa Quyền",
  "Đà La",
  "Hỏa Tinh",
  "Tả Phụ",
  "Hóa Khoa",
  "Lộc Tồn",
]);

function getZiweiMajorStarTop(_palaceIndex: number, _showOverlappingPalaces: boolean, schoolStyle: boolean) {
  return schoolStyle ? 72 : 42;
}

function getZiweiMinorStarTop(
  palaceIndex: number,
  showOverlappingPalaces: boolean,
  majorStarCount = 0,
  schoolStyle = false,
) {
  const baseTop = 73;
  if (schoolStyle || majorStarCount < 2) return baseTop;
  const majorStarTop = getZiweiMajorStarTop(palaceIndex, showOverlappingPalaces, schoolStyle);
  return Math.max(baseTop, majorStarTop + (majorStarCount - 1) * ZIWEI_MAJOR_STAR_SPACING + 16);
}

const ZIWEI_REFERENCE_CENTER_X = [495.75, 309.25, 123.75, 123.75, 123.75, 123.75, 309.25, 495.75, 682.25, 682.25, 682.25, 682.25] as const;
const ZIWEI_REFERENCE_MINOR_LEFT_X = [408, 221.5, 36, 36, 36, 36, 221.5, 408, 594.5, 594.5, 594.5, 594.5] as const;
const ZIWEI_REFERENCE_MINOR_RIGHT_X = [581.5, 395, 209.5, 209.5, 209.5, 209.5, 395, 581.5, 768, 768, 768, 768] as const;

const ZIWEI_STAR_ELEMENT_GROUPS: Record<number, string[]> = {
  2: [
    "Thiên Đồng", "Thái Âm", "Cự Môn", "Thiên Tướng", "Thiếu Âm", "Long Đức", "Bác Sĩ", "Thanh Long",
    "Hữu Bật", "Văn Khúc", "Hóa Khoa", "Hóa Kị", "Tam Thai", "Long Trì", "Thiên Khốc", "Thiên Hư",
    "Hồng Loan", "Thiên Hỉ", "Thiên Diêu", "Thiên Y", "Lưu Hà", "Thiên Sứ", "Niên Giải", "Âm Sát",
  ],
  3: [
    "Thiên Cơ", "Tham Lang", "Tang Môn", "Tướng Quân", "Hóa Lộc", "Hóa Quyền", "Ân Quang", "Bát Tọa",
    "Đường Phù", "Phượng Các", "Đào Hoa", "Giải Thần", "Tức Thần", "Tai Sát", "Thiên Sát", "Chỉ Bối",
    "Nguyệt Sát", "Vong Thần", "Nguyệt Giải", "Thiên Vu", "Thiên Nguyệt",
  ],
  4: ["Vũ Khúc", "Thất Sát", "Bạch Hổ", "Tấu Thư", "Kình Dương", "Đà La", "Văn Xương", "Thai Phụ", "Hoa Cái", "Phan An"],
  5: [
    "Tử Vi", "Thiên Phủ", "Thiên Lương", "Phúc Đức", "Lộc Tồn", "Bệnh Phù", "Tả Phụ", "Thiên Quý",
    "Phong Cáo", "Quốc Ấn", "Cô Thần", "Quả Tú", "Thiên Phúc", "Thiên Trù", "Địa Giải", "Thiên Tài",
    "Thiên Thọ", "Thiên Thương", "Thiên La", "Địa Võng", "Tướng Tinh", "Âm Đức", "Dương Đức",
  ],
  6: [
    "Thái Dương", "Liêm Trinh", "Thiên Không", "Thái Tuế", "Thiếu Dương", "Quan Phù", "Tử Phù", "Tuế Phá",
    "Điếu Khách", "Trực Phù", "Lực Sĩ", "Tiểu Hao", "Phi Liêm", "Hỉ Thần", "Đại Hao", "Phục Binh",
    "Quan Phủ", "Địa Không", "Địa Kiếp", "Hỏa Tinh", "Linh Tinh", "Thiên Khôi", "Thiên Việt", "Thiên Mã",
    "Thiên Hình", "Kiếp Sát", "Phá Toái", "Thiên Quan", "Văn Tinh", "Thiên Đức", "Nguyệt Đức", "Thiên Giải",
    "Đẩu Quân", "Tuế Dịch",
  ],
};
const ZIWEI_STAR_ELEMENT_BY_NAME = new Map(
  Object.entries(ZIWEI_STAR_ELEMENT_GROUPS).flatMap(([element, stars]) =>
    stars.map((star) => [star.toLocaleUpperCase("vi-VN"), Number(element)] as const),
  ),
);
const ZIWEI_ELEMENT_COLOR_BY_ID: Record<number, string> = {
  2: "#051d52",
  3: "#067b11",
  4: "#8b8380",
  5: "#e39e25",
  6: "#cf233b",
};

function getZiweiStarColor(starName: string) {
  const normalizedName = starName.replace(/^(?:L|Đ)\./, "").toLocaleUpperCase("vi-VN");
  return ZIWEI_ELEMENT_COLOR_BY_ID[ZIWEI_STAR_ELEMENT_BY_NAME.get(normalizedName) ?? 2];
}

const ZIWEI_STANDALONE_SCHOOL_MINOR_STARS = new Set(["TẢ PHỤ", "HỮU BẬT", "VĂN XƯƠNG", "VĂN KHÚC"]);
const ZIWEI_STANDALONE_SCHOOL_STAR_COLORS: Record<string, string> = {
  "TỬ VI": "#e39e25",
  "THIÊN CƠ": "#067b11",
  "THÁI DƯƠNG": "#cf233b",
  "VŨ KHÚC": "#8b8380",
  "THIÊN ĐỒNG": "#051d52",
  "LIÊM TRINH": "#cf233b",
  "THIÊN PHỦ": "#e39e25",
  "THÁI ÂM": "#051d52",
  "THAM LANG": "#067b11",
  "CỰ MÔN": "#051d52",
  "THIÊN TƯỚNG": "#051d52",
  "THIÊN LƯƠNG": "#e39e25",
  "THẤT SÁT": "#8b8380",
  "PHÁ QUÂN": "#051d52",
  "TẢ PHỤ": "#e39e25",
  "HỮU BẬT": "#051d52",
  "VĂN XƯƠNG": "#8b8380",
  "VĂN KHÚC": "#051d52",
};

function sortZiweiMinorStars(stars: string[]) {
  return sortReferenceZiweiMinorStars(stars);
}

function getZiweiMinorStarLayout(stars: string[]) {
  const rows = [0, 0];
  return stars.map((star) => {
    const column = getReferenceZiweiStarColumn(star);
    const row = rows[column];
    rows[column] += 1;
    return { star, column, row };
  });
}

function getZiweiMovingStarLayout<T extends { name: string }>(
  stars: T[],
  startingOffsets: readonly [number, number],
  spacing = ZIWEI_MOVING_STAR_SPACING,
  maximumOffset = Number.POSITIVE_INFINITY,
) {
  const offsets = [...startingOffsets] as [number, number];
  const items = stars.map((star) => {
    const preferredColumn = getReferenceZiweiStarColumn(star.name);
    const alternateColumn = preferredColumn === 0 ? 1 : 0;
    const column = offsets[preferredColumn] > maximumOffset
      ? (offsets[alternateColumn] <= maximumOffset || offsets[alternateColumn] < offsets[preferredColumn] ? alternateColumn : preferredColumn)
      : preferredColumn;
    const offset = offsets[column];
    offsets[column] += spacing;
    return { star, column, offset };
  });
  return { items, offsets };
}

const ZIWEI_YIN_START_STEM: Record<string, number> = {
  Giáp: 2, Kỷ: 2,
  Ất: 4, Canh: 4,
  Bính: 6, Tân: 6,
  Đinh: 8, Nhâm: 8,
  Mậu: 0, Quý: 0,
};

function getZiweiPalaceStem(yearStem: string, branch: string) {
  const yinStem = ZIWEI_YIN_START_STEM[yearStem] ?? 0;
  const branchIndexFromYin = (ZIWEI_BRANCHES.indexOf(branch as (typeof ZIWEI_BRANCHES)[number]) - 2 + 12) % 12;
  return ZIWEI_STEMS[(yinStem + branchIndexFromYin) % ZIWEI_STEMS.length];
}

function getZiweiTransforms(palaceStem: string, canHoaTable: number) {
  const base = ZIWEI_FOUR_TRANSFORMS[palaceStem] ?? {};
  if (canHoaTable === 1 && palaceStem === "Canh") {
    return { "THÁI DƯƠNG": 0, "VŨ KHÚC": 1, "THIÊN ĐỒNG": 2, "THÁI ÂM": 3 };
  }
  if (canHoaTable === 2) {
    if (palaceStem === "Canh") return { "THÁI DƯƠNG": 0, "VŨ KHÚC": 1, "THIÊN PHỦ": 2, "THIÊN ĐỒNG": 3 };
    if (palaceStem === "Mậu") return { "THAM LANG": 0, "THÁI ÂM": 1, "THÁI DƯƠNG": 2, "THIÊN CƠ": 3 };
    if (palaceStem === "Nhâm") return { "THIÊN LƯƠNG": 0, "TỬ VI": 1, "THIÊN PHỦ": 2, "VŨ KHÚC": 3 };
  }
  if (canHoaTable === 3 && palaceStem === "Canh") {
    return { "THÁI DƯƠNG": 0, "VŨ KHÚC": 1, "THIÊN ĐỒNG": 2, "THIÊN TƯỚNG": 3 };
  }
  if (canHoaTable === 4 && palaceStem === "Canh") {
    return { "THÁI DƯƠNG": 0, "VŨ KHÚC": 1, "THAM LANG": 2, "THIÊN ĐỒNG": 3 };
  }
  return base;
}

function getZiweiPeriodTransformBadges(
  phiHoaLayer: number,
  stems: { decade: string; year: string; month: string; day: string },
  starName: string,
  canHoaTable: number,
) {
  return getReferenceZiweiPeriodBadgeLayers(phiHoaLayer).flatMap((badge) => {
    const transformIndex = getZiweiTransforms(stems[badge.source], canHoaTable)[starName];
    return transformIndex === undefined ? [] : [{ ...badge, stem: stems[badge.source], transformIndex }];
  });
}

type ZiweiLocKiFlow = {
  currentLoc: number;
  currentKi: number;
  locKeep: number;
  isMoveLoc: boolean;
  isMoveKi: boolean;
  locLoop: boolean;
  kiLoop: boolean;
};

type ZiweiLocKiPalace = {
  stem: string;
  majorStars: Array<{ name: string }>;
  minorStars: string[];
};

function getZiweiLocKiFlow(
  palaces: ZiweiLocKiPalace[],
  canHoaTable: number,
  lifePalaceIndex: number,
  natalYearStem?: string,
): ZiweiLocKiFlow[] {
  const targetStarBySource = palaces.map((palace) => {
    const transforms = getZiweiTransforms(palace.stem, canHoaTable);
    return Array.from({ length: 4 }, (_, type) => Object.entries(transforms).find(([, index]) => index === type)?.[0] ?? "");
  });
  const targetIndexForStar = (starName: string) => palaces.findIndex((palace) =>
    palace.majorStars.some((star) => star.name.toUpperCase() === starName)
    || palace.minorStars.some((star) => star.toUpperCase() === starName),
  );
  const targets = targetStarBySource.map((stars) => stars.map(targetIndexForStar));
  const incomingKi = palaces.map((_, targetIndex) => targets.flatMap((targetSet, sourceIndex) => targetSet[3] === targetIndex ? [sourceIndex] : []));
  const yearStemTransforms = natalYearStem ? getZiweiTransforms(natalYearStem, canHoaTable) : {};
  const annualLocStar = Object.entries(yearStemTransforms).find(([, index]) => index === 0)?.[0] ?? "";
  const annualKiStar = Object.entries(yearStemTransforms).find(([, index]) => index === 3)?.[0] ?? "";
  const annualLocTarget = (annualLocStar && targetIndexForStar(annualLocStar) >= 0) ? targetIndexForStar(annualLocStar) : targetIndexForStar("HÓA LỘC");
  const annualKiTarget = (annualKiStar && targetIndexForStar(annualKiStar) >= 0) ? targetIndexForStar(annualKiStar) : targetIndexForStar("HÓA KỊ");
  const lifeLocTarget = targets[lifePalaceIndex]?.[0] ?? -1;
  const lifeKiTarget = targets[lifePalaceIndex]?.[3] ?? -1;

  type StarFlow = { numLoc: number; numKi: number; currentLoc: number; isMoveLoc: boolean };
  type MutableZone = ZiweiLocKiFlow & { totalLoc: number; totalKi: number; isMoveAllLoc: boolean; movingAnnualLoc: boolean; stars: Map<string, StarFlow> };
  const zones: MutableZone[] = palaces.map((palace, targetIndex) => {
    const starNames = [...palace.majorStars.map((star) => star.name), ...palace.minorStars].map((star) => star.toUpperCase());
    const stars = new Map<string, StarFlow>();
    starNames.forEach((starName) => {
      const numLoc = targetStarBySource.filter((targetsForSource) => targetsForSource[0] === starName).length;
      const numKi = targetStarBySource.filter((targetsForSource) => targetsForSource[3] === starName).length;
      if (numLoc > 0 || numKi > 0) stars.set(starName, { numLoc, numKi, currentLoc: numLoc, isMoveLoc: targets[targetIndex]?.[3] === targetIndex ? false : numLoc >= 2 });
    });
    if (stars.size === 0) return {
      totalLoc: -1,
      totalKi: -1,
      currentLoc: 0,
      currentKi: 0,
      locKeep: 0,
      isMoveLoc: false,
      isMoveAllLoc: false,
      isMoveKi: false,
      movingAnnualLoc: false,
      locLoop: false,
      kiLoop: false,
      stars,
    };
    const selfKi = targets[targetIndex]?.[3] === targetIndex;
    const selfLoc = targets[targetIndex]?.[0] === targetIndex;
    let totalLoc = annualLocTarget === targetIndex ? 1 : 0;
    let totalKi = annualKiTarget === targetIndex ? 1 : 0;
    let locKeep = 0;
    stars.forEach((star) => {
      locKeep += selfKi ? star.numLoc : star.numLoc >= 2 ? 0 : star.numLoc;
      totalLoc += star.numLoc;
      totalKi += star.numKi;
    });
    let isMoveLoc = selfLoc || targetIndex === annualLocTarget || targetIndex === lifeLocTarget;
    let isMoveAllLoc = isMoveLoc;
    let isMoveKi = targetIndex === annualKiTarget || targetIndex === lifeKiTarget;
    if (!isMoveLoc && totalLoc >= 2 && [...stars.values()].some((star) => star.isMoveLoc)) isMoveLoc = true;
    if (!isMoveAllLoc && stars.size === 1 && isMoveLoc) isMoveAllLoc = true;
    if (!isMoveKi && totalKi >= 2) isMoveKi = true;
    if (selfKi) {
      isMoveLoc = false;
      isMoveAllLoc = false;
      isMoveKi = false;
    }
    return {
      totalLoc,
      totalKi,
      currentLoc: totalLoc,
      currentKi: 0,
      locKeep: isMoveAllLoc ? 0 : locKeep,
      isMoveLoc,
      isMoveAllLoc,
      isMoveKi,
      movingAnnualLoc: annualLocTarget === targetIndex,
      locLoop: false,
      kiLoop: false,
      stars,
    };
  });

  const checkZoneTruyLoc = (targetIndex: number) => {
    const zone = zones[targetIndex];
    const selfKi = targets[targetIndex]?.[3] === targetIndex;
    if (!selfKi) {
      zone.stars.forEach((star, starName) => {
        if (zone.isMoveAllLoc && star.currentLoc > 0 && !star.isMoveLoc) {
          star.isMoveLoc = true;
          zone.isMoveLoc = true;
        } else if (star.currentLoc > 0 && !star.isMoveLoc && star.numKi > 0 && star.numLoc > 0) {
          incomingKi[targetIndex].forEach((sourceIndex) => {
            if (targetStarBySource[sourceIndex][3] === starName && zones[sourceIndex].isMoveLoc) {
              star.isMoveLoc = true;
              zone.isMoveLoc = true;
            }
          });
        }
      });
      zone.currentLoc = [...zone.stars.values()].reduce((sum, star) => sum + star.currentLoc, 0);
      if (zone.stars.size === 1 && zone.isMoveLoc) zone.isMoveAllLoc = true;
    }
  };

  zones.forEach((zone, targetIndex) => {
    const selfKi = targets[targetIndex]?.[3] === targetIndex;
    checkZoneTruyLoc(targetIndex);
    const movingIncomingKi = incomingKi[targetIndex].filter((sourceIndex) => zones[sourceIndex].isMoveKi).length;
    if (zone.isMoveKi
      && movingIncomingKi === incomingKi[targetIndex].length
      && targetIndex !== annualKiTarget
      && targetIndex !== lifeKiTarget
      && !selfKi) {
      zone.isMoveKi = false;
    } else if (!zone.isMoveKi
      && incomingKi[targetIndex].length > 1
      && movingIncomingKi < incomingKi[targetIndex].length
      && !selfKi) {
      zone.isMoveKi = true;
    }
  });

  zones.forEach((zone, targetIndex) => {
    zone.currentKi = annualKiTarget === targetIndex ? 1 : 0;
    incomingKi[targetIndex].forEach((sourceIndex) => {
      if (!zones[sourceIndex].isMoveKi || (lifeKiTarget === targetIndex && zones[sourceIndex].isMoveKi)) zone.currentKi += 1;
    });
  });

  const moveKi = (sourceIndex: number, depth = 0) => {
    if (depth >= 11 || zones[sourceIndex].totalKi === -1 || !zones[sourceIndex].isMoveKi) return;
    const targetIndex = targets[sourceIndex]?.[3] ?? -1;
    if (targetIndex < 0 || targetIndex === sourceIndex) return;
    zones[targetIndex].currentKi += zones[sourceIndex].currentKi;
    zones[sourceIndex].currentKi = 0;
    if (zones[targetIndex].isMoveKi) moveKi(targetIndex, depth + 1);
  };
  const moveLoc = (sourceIndex: number, depth = 0) => {
    if (depth >= 11 || zones[sourceIndex].totalLoc === -1) return;
    const targetIndex = targets[sourceIndex]?.[3] ?? -1;
    if (targetIndex < 0 || targetIndex === sourceIndex) return;
    let movingLoc = 0;
    zones[sourceIndex].stars.forEach((star) => {
      if ((zones[sourceIndex].isMoveAllLoc || star.isMoveLoc) && star.currentLoc > 0) {
        movingLoc += star.currentLoc;
        zones[sourceIndex].currentLoc -= star.currentLoc;
        star.currentLoc = 0;
      }
    });
    if (zones[sourceIndex].movingAnnualLoc) {
      movingLoc += 1;
      zones[sourceIndex].movingAnnualLoc = false;
    }
    zones[targetIndex].currentLoc += movingLoc;
    const targetStar = targetStarBySource[sourceIndex][3];
    const targetStarFlow = zones[targetIndex].stars.get(targetStar);
    if (targetStarFlow) targetStarFlow.currentLoc += movingLoc;
    checkZoneTruyLoc(targetIndex);
    if (zones[targetIndex].isMoveLoc) moveLoc(targetIndex, depth + 1);
  };
  zones.forEach((_, sourceIndex) => {
    moveKi(sourceIndex);
    moveLoc(sourceIndex);
  });

  const markLoops = (type: 0 | 3, key: "locLoop" | "kiLoop") => {
    zones.forEach((_, sourceIndex) => {
      const path: number[] = [];
      const seen = new Map<number, number>();
      let cursor = sourceIndex;
      while (cursor >= 0 && path.length < 24 && (type === 0 ? zones[cursor].isMoveLoc : zones[cursor].isMoveKi)) {
        if (seen.has(cursor)) {
          path.slice(seen.get(cursor)).forEach((index) => { zones[index][key] = true; });
          break;
        }
        seen.set(cursor, path.length);
        path.push(cursor);
        cursor = targets[cursor]?.[3] ?? -1;
      }
    });
  };
  markLoops(0, "locLoop");
  markLoops(3, "kiLoop");
  const auditedLocLoopZones = new Set<number>();
  zones.forEach((zone, sourceIndex) => {
    if (!zone.locLoop || auditedLocLoopZones.has(sourceIndex)) return;
    const path: number[] = [];
    const seen = new Map<number, number>();
    let cursor = sourceIndex;
    while (cursor >= 0 && zones[cursor]?.locLoop && !seen.has(cursor)) {
      seen.set(cursor, path.length);
      path.push(cursor);
      cursor = targets[cursor]?.[3] ?? -1;
    }
    const cycleStart = seen.get(cursor);
    const cycle = cycleStart === undefined ? [] : path.slice(cycleStart);
    const isValidLocLoop = cycle.length > 0 && cycle.every((cycleSource) => {
      const targetIndex = targets[cycleSource]?.[3] ?? -1;
      const targetStar = targetStarBySource[cycleSource]?.[3] ?? "";
      return targetIndex >= 0 && Boolean(zones[targetIndex]?.stars.get(targetStar)?.isMoveLoc);
    });
    path.forEach((index) => {
      auditedLocLoopZones.add(index);
      zones[index].locLoop = false;
    });
    if (isValidLocLoop) {
      cycle.forEach((index) => {
        zones[index].locLoop = true;
      });
    }
  });
  return zones;
}

function formatZiweiLocKiLabels(flow: ZiweiLocKiFlow, schoolStyle: boolean) {
  const suffixLoc = schoolStyle ? "A" : "";
  const suffixKi = schoolStyle ? "D" : "";
  const labels: Array<{ kind: "loc" | "ki"; text: string }> = [];
  if (flow.currentLoc > 0) {
    if (flow.locLoop) {
      if (flow.locKeep === 0) {
        labels.push({ kind: "loc", text: `${flow.currentLoc}${suffixLoc}∞` });
      } else {
        const diff = flow.currentLoc - flow.locKeep;
        labels.push({ kind: "loc", text: `${diff > 0 ? flow.locKeep : flow.currentLoc}${suffixLoc}` });
        if (diff > 0) {
          labels.push({ kind: "loc", text: `${diff}${schoolStyle ? "" : suffixLoc}∞` });
        }
      }
    } else {
      labels.push({ kind: "loc", text: `${flow.currentLoc}${suffixLoc}` });
    }
  } else if (flow.locLoop) labels.push({ kind: "loc", text: "∞" });
  if (flow.currentKi > 0) labels.push({ kind: "ki", text: `${flow.currentKi}${suffixKi}${flow.kiLoop ? "∞" : ""}` });
  else if (flow.kiLoop) labels.push({ kind: "ki", text: "∞" });
  return labels;
}

function getZiweiStarLocKiCounts(palaces: Array<{ stem: string }>, starName: string, canHoaTable: number) {
  return palaces.reduce((counts, palace) => {
    const transformIndex = getZiweiTransforms(palace.stem, canHoaTable)[starName];
    if (transformIndex === 0) counts.loc += 1;
    if (transformIndex === 3) counts.ki += 1;
    return counts;
  }, { loc: 0, ki: 0 });
}

function getZiweiFlyArrows(
  palaces: Array<{ stem: string; branch: string; coordinate: readonly [number, number, number, number]; majorStars: Array<{ name: string }>; minorStars: string[] }>,
  chartStyle: BaziChartStyle,
  canHoaTable: number,
  showOverlappingPalaces: boolean,
  minorStarSpacing = ZIWEI_MINOR_STAR_SPACING,
) {
  if (chartStyle === "Tứ Trụ" || chartStyle === "Nam phái") return [];
  const arrows: ZiweiArrow[] = [];
  const chartBottom = Math.max(...palaces.map((palace) => palace.coordinate[1] + palace.coordinate[3])) + 20;
  // Reference internal types 4/5 correspond to Lương Phái and Khâm Thiên.
  const schoolStyle = chartStyle === "Lương Phái" || chartStyle === "Khâm Thiên";
  palaces.forEach((palace, palaceIndex) => {
    let drawnInPalace = 0;
    const stemTransforms = getZiweiTransforms(palace.stem, canHoaTable);
    const targetPalaces = Object.keys(stemTransforms).map((targetStar) => palaces.findIndex((candidate) =>
      candidate.majorStars.some((star) => star.name.toUpperCase() === targetStar)
      || candidate.minorStars.some((star) => star.toUpperCase() === targetStar),
    ));
    const selfTransformCount = targetPalaces.filter((targetIndex) => targetIndex === palaceIndex).length;
    const stars = [
      ...palace.majorStars.map((star, starIndex) => ({ name: star.name, isMain: true, starIndex })),
      ...palace.minorStars.map((star, starIndex) => ({ name: star, isMain: false, starIndex })),
    ];
    stars.forEach((starData) => {
      const transformIndex = stemTransforms[starData.name.toUpperCase()];
      if (transformIndex === undefined) return;
      const [x, y, w, h] = palace.coordinate;
      const color = PHI_HOA_COLORS[transformIndex];
      const offset = drawnInPalace * 14;
      const majorStarTop = getZiweiMajorStarTop(palaceIndex, showOverlappingPalaces, schoolStyle);
      const minorStarTop = getZiweiMinorStarTop(palaceIndex, showOverlappingPalaces, palace.majorStars.length, schoolStyle);
      const minorStarLayout = getZiweiMinorStarLayout(palace.minorStars);
      const maxMinorRows = Math.max(0, ...minorStarLayout.map(({ row }) => row + 1));
      const palaceMinorStarSpacing = maxMinorRows > 1
        ? Math.min(minorStarSpacing, (h - minorStarTop - 52) / (maxMinorRows - 1))
        : minorStarSpacing;
      const starY = starData.isMain
        ? y + majorStarTop + starData.starIndex * ZIWEI_MAJOR_STAR_SPACING
        : y + minorStarTop + (minorStarLayout[starData.starIndex]?.row ?? 0) * palaceMinorStarSpacing;
      const isSingleVanKhuc = starData.name.toUpperCase() === "VĂN KHÚC" && selfTransformCount === 1;

      if ([5, 6, 7, 8].includes(palaceIndex)) {
        const startX = (starData.isMain ? x + w / 2 : ZIWEI_REFERENCE_CENTER_X[palaceIndex] - (isSingleVanKhuc ? 23 : selfTransformCount === 2 ? 10 : 40)) - offset;
        arrows.push(makeZiweiArrow(startX, starY + (starData.isMain ? 6 : 10), startX, 5, color, { opacity: 0.8, headLength: 15, headWidth: 8 }));
      } else if ([0, 1, 2, 11].includes(palaceIndex)) {
        const startX = (starData.isMain ? x + w / 2 : ZIWEI_REFERENCE_CENTER_X[palaceIndex] - (isSingleVanKhuc ? 23 : selfTransformCount === 2 ? 10 : 40)) - offset;
        const startY = starY + (starData.isMain ? 6 : 10);
        arrows.push(makeZiweiArrow(startX, startY, startX, y + h + 23, color, { opacity: 0.8, headLength: 15, headWidth: 8 }));
      } else if ([3, 4].includes(palaceIndex)) {
        const startY = starY + (starData.isMain ? 12 : 5);
        const startX = x + (starData.isMain || schoolStyle ? 45 : 10);
        arrows.push(makeZiweiArrow(startX, startY, 5, startY, color, { opacity: 0.8, headLength: 15, headWidth: 8 }));
      } else {
        const startY = starY + (starData.isMain ? 6 : 5);
        const startX = x + w / 2 + (starData.isMain ? 35 : schoolStyle ? 45 : -15);
        arrows.push(makeZiweiArrow(startX, startY, x + w + 23, startY, color, { opacity: 0.8, headLength: 15, headWidth: 8 }));
      }
      drawnInPalace += 1;
    });
  });
  return arrows;
}

export function getZiweiPalaceFlowArrows(
  palaces: Array<{ stem: string; branch: string; coordinate: readonly [number, number, number, number]; majorStars: Array<{ name: string }>; minorStars: string[] }>,
  chartStyle: BaziChartStyle,
  phiHoaType: number,
  canHoaTable: number,
  locKiFlow: ZiweiLocKiFlow[],
  selectedPalaceIndex: number | null = null,
) {
  if (chartStyle === "Tứ Trụ" || chartStyle === "Nam phái") return [];
  if (phiHoaType >= 4 && selectedPalaceIndex === null) return [];
  const schoolStyle = chartStyle === "Lương Phái" || chartStyle === "Khâm Thiên";
  const showCurvedPhiCung = [
    "Mặc định",
    "Lương Phái + Nam phái",
    "Lương Phái",
    "Trung Châu Phái",
    "Trung Châu Phái + Lương Phái",
  ].includes(chartStyle);

  type Route = [number, number, number, number];
  const baseRoutes: Route[] = [
    [496.75, 753.5, 310.25, 271.5], // 0: Tý
    [310.25, 753.5, 496.75, 271.5], // 1: Sửu
    [217, 753.5, 590, 271.5],       // 2: Dần
    [217, 633, 590, 392],           // 3: Mão
    [217, 392, 590, 633],           // 4: Thìn
    [217, 271.5, 590, 753.5],       // 5: Tỵ
    [310.25, 271.5, 496.75, 753.5], // 6: Ngọ
    [496.75, 271.5, 310.25, 753.5], // 7: Mùi
    [590, 271.5, 217, 753.5],       // 8: Thân
    [590, 392, 217, 633],           // 9: Dậu
    [590, 633, 217, 392],           // 10: Tuất
    [590, 753.5, 217, 271.5],       // 11: Hợi
  ];

  const lane1Routes: Route[] = [
    [496.75 - 17, 753.5, 310.25 + 17, 271.5],
    [310.25 - 17, 753.5, 496.75 + 17, 271.5],
    [217 - 17, 753.5, 590 + 17, 271.5],
    [217, 633 - 17, 590, 392 + 17],
    [217, 392 - 17, 590, 633 + 17],
    [217, 271.5 - 17, 590, 753.5 + 17],
    [310.25 + 17, 271.5, 496.75 - 17, 753.5],
    [496.75 + 17, 271.5, 310.25 - 17, 753.5],
    [590 + 17, 271.5, 217 - 17, 753.5],
    [590, 392 + 17, 217, 633 - 17],
    [590, 633 + 17, 217, 392 - 17],
    [590, 753.5 + 17, 217, 271.5 - 17],
  ];

  const lane2Routes: Route[] = [
    [496.75 + 17, 753.5, 310.25 - 17, 271.5],
    [310.25 + 17, 753.5, 496.75 - 17, 271.5],
    [217, 753.5 + 17, 590, 271.5 - 17],
    [217, 633 + 17, 590, 392 - 17],
    [217, 392 + 17, 590, 633 - 17],
    [217 - 17, 271.5, 590 + 17, 753.5],
    [310.25 - 17, 271.5, 496.75 + 17, 753.5],
    [496.75 - 17, 271.5, 310.25 + 17, 753.5],
    [590, 271.5 - 17, 217, 753.5 + 17],
    [590, 392 - 17, 217, 633 + 17],
    [590, 633 - 17, 217, 392 + 17],
    [590 + 17, 753.5, 217 - 17, 271.5],
  ];

  const lane3Routes: Route[] = [
    [496.75 - 34, 753.5, 310.25 + 34, 271.5],
    [310.25 - 34, 753.5, 496.75 + 34, 271.5],
    [217 - 34, 753.5, 590 + 34, 271.5],
    [217, 633 - 34, 590, 392 + 34],
    [217, 392 - 34, 590, 633 + 34],
    [217, 271.5 - 34, 590, 753.5 + 34],
    [310.25 + 34, 271.5, 496.75 - 34, 753.5],
    [496.75 + 34, 271.5, 310.25 - 34, 753.5],
    [590 + 34, 271.5, 217 - 34, 753.5],
    [590, 392 + 34, 217, 633 - 34],
    [590, 633 + 34, 217, 392 - 34],
    [590, 753.5 + 34, 217, 271.5 - 34],
  ];

  const routes = [baseRoutes, lane1Routes, lane2Routes, lane3Routes];

  const curveOffsets: Array<Array<readonly [number, number] | null>> = [
    [null, [0, -30], [-10, -50], [10, -30], [30, -30], [30, -50], [-10, -80], [-50, 0], [-40, -30], [-30, -15], [-10, -15], [0, -30]],
    [[0, -25], null, [0, -30], [15, -15], [30, -10], [30, -30], [30, 0], [-10, -80], [-50, -50], [-30, -30], [-10, -40], [-10, -40]],
    [[0, -45], [0, -25], null, [20, 0], [30, -10], [80, 0], [40, -40], [10, 75], [-10, -80], [-10, -50], [-30, -30], [0, -80]],
    [[15, -40], [20, -20], [30, 0], null, [30, -10], [40, -10], [40, -10], [10, 60], [30, 50], [-10, -80], [0, -30], [30, -35]],
    [[30, -30], [25, -10], [40, 20], [30, 0], null, [30, 0], [15, 15], [10, 35], [20, 50], [0, 40], [-10, -80], [-10, -80]],
    [[40, -10], [25, -5], [80, 0], [50, -5], [20, -10], null, [0, 25], [10, 30], [0, 80], [10, 50], [-30, 40], [-10, -80]],
    [[-30, -30], [30, 0], [30, 20], [30, 25], [20, 20], [-10, 25], null, [0, 25], [-10, 40], [-10, 30], [-40, 40], [-50, 40]],
    [[-30, -30], [-30, -30], [40, 20], [40, 40], [10, 30], [10, 40], [10, 25], null, [0, 25], [-20, 20], [-30, -10], [-35, 0]],
    [[-30, -30], [-50, -10], [-40, -20], [20, 60], [-10, 40], [10, 80], [0, 30], [0, 20], null, [-25, 0], [-40, 0], [-50, -10]],
    [[-30, -30], [-30, -30], [-20, -90], [-40, -20], [0, 60], [-10, 40], [-10, 40], [-15, 15], [-25, -10], null, [-30, -10], [-50, -10]],
    [[-20, -20], [-10, -35], [-5, -40], [0, -50], [-10, -80], [-30, 40], [-10, 40], [-25, 10], [-60, 0], [-30, -10], null, [-25, 0]],
    [[0, -25], [-30, -30], [0, -80], [10, -50], [30, -30], [-10, -80], [-50, -20], [-25, 5], [-80, 0], [-40, -10], [-20, 0], null],
  ];

  const arrows: ZiweiArrow[] = [];
  const oppositeRouteUsage = new Array(12).fill(0);
  const isSchoolWithOnlySelectedPhiHoa = chartStyle === "Lương Phái" || chartStyle === "Lương Phái + Nam phái" || chartStyle === "Trung Châu Phái + Lương Phái";

  palaces.forEach((palace, sourceIndex) => {
    if (selectedPalaceIndex !== null && sourceIndex !== selectedPalaceIndex) {
      return;
    }

    const transforms = getZiweiTransforms(palace.stem, canHoaTable);
    const targetPalaceForStar = (targetStar: string) => palaces.findIndex((candidate) =>
      candidate.majorStars.some((star) => star.name.toUpperCase() === targetStar)
      || candidate.minorStars.some((star) => star.toUpperCase() === targetStar),
    );

    const oppositeIndex = (sourceIndex + 6) % 12;
    for (let t = 0; t <= 3; t += 1) {
      const targetStar = Object.entries(transforms).find(([, transformIndex]) => transformIndex === t)?.[0];
      const targetIndex = targetStar ? targetPalaceForStar(targetStar) : -1;
      const isOpposite = targetIndex === oppositeIndex;
      const hasMoveLoc = Boolean(locKiFlow[sourceIndex]?.isMoveLoc);
      const hasMoveKi = Boolean(locKiFlow[sourceIndex]?.isMoveKi);

      const shouldDrawOpposite = isOpposite && (
        selectedPalaceIndex !== null
        || !isSchoolWithOnlySelectedPhiHoa
        || t === phiHoaType
        || (hasMoveLoc && phiHoaType === 0 && t === 3)
      );

      if (shouldDrawOpposite) {
        const lane = Math.min(Math.max(oppositeRouteUsage[sourceIndex], oppositeRouteUsage[oppositeIndex]), 3);
        const [x1, y1, x2, y2] = routes[lane][sourceIndex];
        const dashedMovingKi = t === 3 && (hasMoveKi || hasMoveLoc);
        arrows.push(makeZiweiArrow(x1, y1, x2, y2, PHI_HOA_COLORS[t], {
          width: schoolStyle ? 3 : 2.5,
          opacity: 0.8,
          dash: dashedMovingKi ? "12 3" : undefined,
          headLength: 20,
          headWidth: 10.4,
        }));
        oppositeRouteUsage[sourceIndex] = lane + 1;
        oppositeRouteUsage[oppositeIndex] = lane + 1;
      }
    }

    const addCurvedRoute = (
      targetIndex: number,
      color: string,
      style: Pick<ZiweiArrow, "width" | "opacity" | "dash">,
    ) => {
      if (targetIndex < 0 || targetIndex === sourceIndex || targetIndex === (sourceIndex + 6) % 12) return;
      const [startX, startY] = routes[0][sourceIndex];
      let endX = routes[3][targetIndex][0];
      const endY = routes[3][targetIndex][1];
      if (targetIndex === 6 || targetIndex === 7) endX += 15;
      const midpointX = (startX + endX) / 2;
      const midpointY = (startY + endY) / 2;
      const offset = curveOffsets[sourceIndex][targetIndex];
      if (!offset) return;
      const referenceControlX = midpointX + offset[0];
      const referenceControlY = midpointY + offset[1];
      const quadraticControlX = 2 * referenceControlX - (startX + endX) / 2;
      const quadraticControlY = 2 * referenceControlY - (startY + endY) / 2;
      const angle = Math.atan2(endY - quadraticControlY, endX - quadraticControlX);
      const b = 3.25;
      const jx = endX - 11 * Math.cos(angle) + b * Math.sin(angle);
      const wy = endY - 11 * Math.sin(angle) - b * Math.cos(angle);
      const sx = endX - 11 * Math.cos(angle) - b * Math.sin(angle);
      const cy = endY - 11 * Math.sin(angle) + b * Math.cos(angle);
      const arrow: ZiweiArrow = {
        x1: startX,
        y1: startY,
        x2: endX,
        y2: endY,
        color,
        points: `${endX},${endY} ${jx},${wy} ${sx},${cy}`,
        width: style.width,
        opacity: style.opacity,
        dash: style.dash,
        pathD: `M ${startX} ${startY} Q ${quadraticControlX} ${quadraticControlY} ${endX} ${endY}`,
      };
      arrows.push(arrow);
    };

    if (showCurvedPhiCung) {
      if (selectedPalaceIndex !== null) {
        Object.entries(transforms).forEach(([targetStar, transformIndex]) => {
          const targetIndex = targetPalaceForStar(targetStar);
          if (targetIndex >= 0 && targetIndex !== sourceIndex && targetIndex !== (sourceIndex + 6) % 12) {
            const color = PHI_HOA_COLORS[transformIndex];
            const isMovingRoute = (transformIndex === 0 && locKiFlow[sourceIndex]?.isMoveLoc)
              || (transformIndex === 3 && locKiFlow[sourceIndex]?.isMoveKi);
            const curveStyle = getZiweiCurveStyle(targetIndex, Boolean(isMovingRoute));
            if (schoolStyle) {
              curveStyle.width = 1.7;
              curveStyle.opacity = Math.min(1, curveStyle.opacity + 0.2);
            }
            if (isMovingRoute && transformIndex === 3) {
              curveStyle.dash = "7 3";
              curveStyle.width = 2.0;
            }
            addCurvedRoute(targetIndex, color, curveStyle);
          }
        });
      } else {
        if ((chartStyle === "Lương Phái" || chartStyle === "Lương Phái + Nam phái" || chartStyle === "Trung Châu Phái + Lương Phái") && phiHoaType === 0 && locKiFlow[sourceIndex]?.isMoveLoc) {
          const kiTargetStar = Object.entries(transforms).find(([, transformIndex]) => transformIndex === 3)?.[0];
          const kiTargetIndex = kiTargetStar ? targetPalaceForStar(kiTargetStar) : -1;
          const isStrongKiTarget = ZIWEI_REFERENCE_STRONG_TARGETS[kiTargetIndex] ?? false;
          addCurvedRoute(kiTargetIndex, PHI_HOA_COLORS[3], {
            width: schoolStyle ? (isStrongKiTarget ? 2 : 1.5) : (isStrongKiTarget ? 1.7 : 1),
            opacity: schoolStyle ? (isStrongKiTarget ? 0.9 : 0.7) : (isStrongKiTarget ? 0.7 : 0.5),
            dash: "8 4",
          });
        }
        const targetStar = Object.entries(transforms).find(([, transformIndex]) => transformIndex === phiHoaType)?.[0];
        if (targetStar) {
          const targetIndex = targetPalaceForStar(targetStar);
          if (targetIndex >= 0 && targetIndex !== sourceIndex && targetIndex !== (sourceIndex + 6) % 12) {
            const color = PHI_HOA_COLORS[phiHoaType];
            const isMovingRoute = (phiHoaType === 0 && locKiFlow[sourceIndex]?.isMoveLoc)
              || (phiHoaType === 3 && locKiFlow[sourceIndex]?.isMoveKi);
            const curveStyle = getZiweiCurveStyle(targetIndex, Boolean(isMovingRoute));
            if (schoolStyle) {
              curveStyle.width = 1.7;
              curveStyle.opacity = Math.min(1, curveStyle.opacity + 0.2);
            }
            addCurvedRoute(targetIndex, color, curveStyle);
          }
        }
      }
    }
  });
  return arrows;
}

const ELEMENT_COPY: Record<ElementName, string> = {
  Mộc: "Sinh trưởng · khai mở",
  Hỏa: "Biểu đạt · lan tỏa",
  Thổ: "Ổn định · chuyển hóa",
  Kim: "Kỷ luật · tinh luyện",
  Thủy: "Trí tuệ · thích nghi",
};

const BAZI_PALACE_BRANCHES: { branch: string; element: ElementName; area: string }[] = [
  { branch: "Tị", element: "Hỏa", area: "ti" }, { branch: "Ngọ", element: "Hỏa", area: "ngo" },
  { branch: "Mùi", element: "Thổ", area: "mui" }, { branch: "Thân", element: "Kim", area: "than" },
  { branch: "Thìn", element: "Thổ", area: "thin" }, { branch: "Dậu", element: "Kim", area: "dau" },
  { branch: "Mão", element: "Mộc", area: "mao" }, { branch: "Tuất", element: "Thổ", area: "tuat" },
  { branch: "Dần", element: "Mộc", area: "dan" }, { branch: "Sửu", element: "Thổ", area: "suu" },
  { branch: "Tý", element: "Thủy", area: "ty" }, { branch: "Hợi", element: "Thủy", area: "hoi" },
];

const ZIWEI_PALACE_TITLES = ["MỆNH", "BÀO", "PHỐI", "TỬ", "TÀI", "TẬT", "DI", "NÔ", "QUAN", "ĐIỀN", "PHÚC", "PHỤ"] as const;
const ZIWEI_PALACE_TITLE_BY_NAME: Record<string, (typeof ZIWEI_PALACE_TITLES)[number]> = {
  Mệnh: "MỆNH",
  "Huynh Đệ": "BÀO",
  "Phu Thê": "PHỐI",
  "Tử Nữ": "TỬ",
  "Tài Bạch": "TÀI",
  "Tật Ách": "TẬT",
  "Thiên Di": "DI",
  "Nô Bộc": "NÔ",
  "Quan Lộc": "QUAN",
  "Điền Trạch": "ĐIỀN",
  "Phúc Đức": "PHÚC",
  "Phụ Mẫu": "PHỤ",
};
const ZIWEI_STAR_POLARITY: Record<string, "+" | "−"> = {
  "TỬ VI": "−", "THIÊN CƠ": "−", "THÁI DƯƠNG": "+", "VŨ KHÚC": "−",
  "THIÊN ĐỒNG": "+", "LIÊM TRINH": "−", "THIÊN PHỦ": "+", "THÁI ÂM": "−",
  "THAM LANG": "+", "CỰ MÔN": "−", "THIÊN TƯỚNG": "+", "THIÊN LƯƠNG": "+",
  "THẤT SÁT": "+", "PHÁ QUÂN": "−",
};
const ZIWEI_MONTH_ONE_STEM: Record<string, number> = {
  Giáp: 2, Kỷ: 2,
  Ất: 4, Canh: 4,
  Bính: 6, Tân: 6,
  Đinh: 8, Nhâm: 8,
  Mậu: 0, Quý: 0,
};

function normalizeZiweiBranch(branch: string) {
  return branch === "Tỵ" ? "Tị" : branch;
}

function normalizeZiweiStarName(name: string) {
  return ({
    "Phụng Các": "Phượng Các",
    "Bác Sỹ": "Bác Sĩ",
    "Lực Sỹ": "Lực Sĩ",
    "Mục Dục": "Mộc Dục",
    "Tuế Kiện": "Thái Tuế",
    "Thiên Hỷ": "Thiên Hỉ",
    "Hỷ Thần": "Hỉ Thần",
    "Đài Phụ": "Thai Phụ",
    "Hàm Trì": "Đào Hoa",
    "Phan Án": "Phan An",
    "Tả Phù": "Tả Phụ",
  } as Record<string, string>)[name] ?? name;
}

const ZIWEI_OMITTED_REFERENCE_STARS = new Set([
  "Không Vong", "Triệt Lộ", "Tuần Không", "Phan Án", "Tức Thần", "Chỉ Bối",
  "Tai Sát", "Thiên Sát", "Nguyệt Sát", "Vong Thần", "Hối Khí", "Quán Tác",
]);

function normalizeZiweiMinorDignity(starName: string, branch: string, brightness = "") {
  if (REFERENCE_MINOR_STAR_DIGNITY[starName]) {
    return REFERENCE_MINOR_STAR_DIGNITY[starName]?.[branch as (typeof ZIWEI_BRANCHES)[number]] ?? "";
  }
  return ({ Miếu: "Đ", Vượng: "V", Đắc: "Đ", Bình: "B", Hạn: "H", Hãm: "H" } as Record<string, string>)[brightness] ?? "";
}

function getZiweiMonthStem(yearStem: string, branch: string) {
  const monthNumber = branch === "Tý" ? 11 : branch === "Sửu" ? 12 : ZIWEI_BRANCHES.indexOf(branch as (typeof ZIWEI_BRANCHES)[number]) - 1;
  const startStem = ZIWEI_MONTH_ONE_STEM[yearStem] ?? 0;
  return { monthNumber, stem: ZIWEI_STEMS[(startStem + monthNumber - 1) % 10] };
}

function getElementFromLabel(label: string): ElementName {
  return (["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"] as ElementName[]).find((element) => label.includes(element)) ?? "Thổ";
}

function describeElementRelation(source: ElementName, target: ElementName) {
  const elements: ElementName[] = ["Mộc", "Hỏa", "Thổ", "Kim", "Thủy"];
  const sourceIndex = elements.indexOf(source);
  const targetIndex = elements.indexOf(target);
  if (source === target) return "Cục hòa Mệnh";
  if ((sourceIndex + 1) % 5 === targetIndex) return "Cục sinh Mệnh";
  if ((targetIndex + 1) % 5 === sourceIndex) return "Mệnh sinh Cục";
  if ((sourceIndex + 2) % 5 === targetIndex) return "Cục khắc Mệnh";
  return "Mệnh khắc Cục";
}

const ZIWEI_COORDINATES = [
  [403.5, 753.5, 186.5, 242.5], [217, 753.5, 186.5, 242.5], [29, 753.5, 188, 242.5],
  [29, 512.5, 188, 241], [29, 271.5, 188, 241], [29, 29, 188, 242.5],
  [217, 29, 186.5, 242.5], [403.5, 29, 186.5, 242.5], [590, 29, 188, 242.5],
  [590, 271.5, 188, 241], [590, 512.5, 188, 241], [590, 753.5, 188, 242.5],
] as const;
const ZIWEI_PRIMARY_MINOR_STARS = new Set([
  "Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kị", "Thiên Hình", "Thiên Diêu",
  "Lộc Tồn", "Thiên Mã", "Địa Không", "Địa Kiếp", "Hỏa Tinh", "Linh Tinh",
  "Kình Dương", "Đà La", "Thiên Khôi", "Thiên Việt", "Tả Phụ", "Hữu Bật",
  "Văn Xương", "Văn Khúc",
]);
const ZIWEI_NOBLE_STARS = new Set([
  ...ZIWEI_PRIMARY_MINOR_STARS,
  "Ân Quang", "Thiên Quý", "Tam Thai", "Bát Tọa", "Thai Phụ", "Phong Cáo", "Thiên Quan", "Thiên Phúc",
]);
const ZIWEI_SIX_DEFEAT_STARS = new Set([
  "Tang Môn", "Bạch Hổ", "Tiểu Hao", "Đại Hao", "Thiên Khốc", "Thiên Hư",
]);

function filterZiweiMinorStars(stars: string[], starGroupMode: number) {
  if (starGroupMode === 0) return stars;
  if (starGroupMode === 1) return stars.filter((star) => ZIWEI_PRIMARY_MINOR_STARS.has(star));
  if (starGroupMode === 2 || starGroupMode === 3) return stars.filter((star) => ZIWEI_NOBLE_STARS.has(star));
  return stars.filter((star) => ZIWEI_NOBLE_STARS.has(star) || ZIWEI_SIX_DEFEAT_STARS.has(star));
}

const CAST_PURPOSES = [
  { key: "timing", label: "Thời điểm", scope: "Tiến, lui hay chờ", prompt: "Ví dụ: Đây đã phải thời điểm thích hợp để bắt đầu kế hoạch chưa?", focus: "độ chín của thời cơ và nhịp tiến–lui", counsel: "quan sát điều kiện đã đủ hay mới chỉ có ý muốn", caution: "phân biệt sự trì hoãn do sợ hãi với một khoảng chờ thực sự cần thiết" },
  { key: "love", label: "Tình cảm", scope: "Cảm xúc & tương hợp", prompt: "Ví dụ: Mối quan hệ này cần điều gì để có thể tiến xa hơn?", focus: "sự tương ứng giữa tình cảm, ranh giới và mức độ thành thật", counsel: "đối chiếu lời nói với hành động của cả hai phía", caution: "không dùng quẻ để đoán thay suy nghĩ hay ý chí của người khác" },
  { key: "family", label: "Gia đạo", scope: "Nề nếp & hòa khí", prompt: "Ví dụ: Tôi nên làm gì để tháo gỡ bất đồng đang có trong gia đình?", focus: "vai trò, nề nếp và dòng giao tiếp giữa những người gần gũi", counsel: "sửa từ phần trách nhiệm của mình rồi mới mong người khác chuyển", caution: "tránh biến mong muốn giữ hòa khí thành việc né một vấn đề cần nói rõ" },
  { key: "career", label: "Công danh", scope: "Vị trí & đường tiến", prompt: "Ví dụ: Tôi có nên nhận vị trí mới trong giai đoạn này không?", focus: "vị thế, năng lực thực và con đường phát triển dài hạn", counsel: "xem cơ hội này giúp tích lũy uy tín hay chỉ làm tăng danh vị trước mắt", caution: "đừng đánh đổi nền tảng nghề nghiệp chỉ vì một tín hiệu thuận lợi ngắn hạn" },
  { key: "business", label: "Kinh doanh", scope: "Thế cuộc & vận hành", prompt: "Ví dụ: Kế hoạch mở rộng này đang thiếu điều kiện quan trọng nào?", focus: "thế thị trường, năng lực vận hành và sức chịu đựng của nguồn lực", counsel: "thử ở quy mô đủ nhỏ để thấy điểm nghẽn trước khi mở rộng", caution: "không thay thế thẩm định pháp lý, tài chính và dữ liệu thị trường bằng lời quẻ" },
  { key: "partnership", label: "Hợp tác", scope: "Người & cam kết", prompt: "Ví dụ: Tôi cần xem xét điều gì trước khi đồng hành cùng đối tác này?", focus: "mức độ đồng thuận về mục tiêu, quyền hạn và cách chia sẻ trách nhiệm", counsel: "làm rõ điều khoản khó nói khi quan hệ vẫn còn thuận", caution: "sức hút ban đầu không phải bằng chứng cho một cam kết bền vững" },
  { key: "wealth", label: "Tài chính", scope: "Tích lũy & rủi ro", prompt: "Ví dụ: Tôi nên ưu tiên bảo toàn hay mở rộng nguồn vốn lúc này?", focus: "dòng tiền, mức chịu rủi ro và tính bền của nguồn lợi", counsel: "ưu tiên phương án còn đường lui và có giới hạn tổn thất rõ", caution: "coi quẻ là góc suy xét, không phải khuyến nghị đầu tư hay bảo đảm lợi nhuận" },
  { key: "study", label: "Học tập", scope: "Đường học & thi cử", prompt: "Ví dụ: Tôi nên điều chỉnh cách học thế nào cho kỳ thi sắp tới?", focus: "phương pháp, kỷ luật và phần kiến thức cần bồi đắp", counsel: "chuyển mục tiêu lớn thành nhịp rèn luyện đều và đo được", caution: "đừng để mong cầu kết quả che mất dữ kiện từ quá trình chuẩn bị thực tế" },
  { key: "health", label: "Sức khỏe", scope: "Điều dưỡng & nếp sống", prompt: "Ví dụ: Nếp sống nào đang cần tôi quan tâm và điều chỉnh trước tiên?", focus: "nhịp nghỉ ngơi, khả năng hồi phục và điều đang làm cơ thể hao tổn", counsel: "ưu tiên thay đổi nhỏ có thể duy trì và theo dõi được", caution: "quẻ không chẩn đoán bệnh; triệu chứng bất thường cần được nhân viên y tế đánh giá" },
] as const;

const getPurposeReading = (purpose: (typeof CAST_PURPOSES)[number], keyword: string) =>
  `Trong ${purpose.label.toLowerCase()}, quẻ hướng sự chú ý về ${purpose.focus}. Tượng “${keyword.toLowerCase()}” gợi rằng lúc này nên ${purpose.counsel}. Điều cần giữ tỉnh táo: ${purpose.caution}.`;

function buildIChingAiPrompt({
  question,
  purpose,
  lines,
  hexagram,
}: {
  question: string;
  purpose: (typeof CAST_PURPOSES)[number];
  lines: number[];
  hexagram: NonNullable<ReturnType<typeof getHexagram>>;
}) {
  const lineSummary = lines.map((value, index) => {
    const polarity = value === 7 || value === 9 ? "Dương" : "Âm";
    const movement = value === 6 || value === 9 ? " · động" : " · tĩnh";
    return `Hào ${index + 1}: ${value} · ${polarity}${movement}`;
  }).join("\n");
  const movingSummary = hexagram.movingDetails.length > 0
    ? hexagram.movingDetails.map((line) =>
      `Hào ${line.position} (${line.polarity}, ${line.change}): ${line.guidance} Trọng điểm: ${line.focus}.`,
    ).join("\n")
    : "Không có hào động.";

  return [
    "Hãy luận giải quẻ Kinh Dịch dưới đây bằng tiếng Việt sáng rõ, thận trọng và có tính ứng dụng.",
    "",
    `CÂU HỎI: ${question.trim() || "Không nêu câu hỏi cụ thể; xin đọc như một thông điệp tổng quát cho hiện tại."}`,
    `CHỦ ĐỀ: ${purpose.label} — ${purpose.scope}`,
    "",
    "DỮ LIỆU LẬP QUẺ (các hào ghi từ dưới lên):",
    lineSummary,
    "",
    `QUẺ CHỦ: số ${hexagram.primary.number} — ${hexagram.primary.name}`,
    `Từ khóa: ${hexagram.primary.keyword}`,
    `Thượng quái: ${hexagram.primary.upper.name} (${hexagram.primary.upper.symbol}) — ${hexagram.primary.upper.nature}`,
    `Hạ quái: ${hexagram.primary.lower.name} (${hexagram.primary.lower.symbol}) — ${hexagram.primary.lower.nature}`,
    `Tượng quẻ tham khảo: ${hexagram.primary.message}`,
    "",
    "HÀO ĐỘNG:",
    movingSummary,
    "",
    `QUẺ BIẾN: số ${hexagram.changed.number} — ${hexagram.changed.name}`,
    `Từ khóa quẻ biến: ${hexagram.changed.keyword}`,
    `Quy tắc đọc: ${hexagram.readingRule}`,
    "",
    "YÊU CẦU:",
    "1. Tóm tắt thế quẻ và trả lời trực diện câu hỏi.",
    "2. Phân tích quẻ chủ, các hào động và quẻ biến theo đúng thứ tự.",
    "3. Nêu điều nên làm, điều nên tránh và một kế hoạch hành động ngắn.",
    "4. Phân biệt rõ dữ kiện của quẻ với phần suy luận; không khẳng định tương lai tuyệt đối.",
    "5. Với vấn đề sức khỏe, pháp lý hoặc tài chính, chỉ đưa góc nhìn tham khảo và nhắc người hỏi kiểm chứng bằng chuyên gia phù hợp.",
  ].join("\n");
}

const formatLunarParts = (date: string) => {
  return getLunarDate(date);
};

const formatLongDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
};

const formatPercent = (value: number) => new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 1,
  minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
}).format(value);

type CalendarQuality = "excellent" | "good" | "normal" | "bad" | "very-bad";

const calendarQuality = (score: number): { key: CalendarQuality; stars: number; label: string } => {
  if (score >= 80) return { key: "excellent", stars: 5, label: "Hoàng đạo tốt" };
  if (score >= 65) return { key: "good", stars: 4, label: "Hoàng đạo khá" };
  if (score >= 50) return { key: "normal", stars: 3, label: "Bình thường" };
  if (score >= 30) return { key: "bad", stars: 2, label: "Xấu" };
  return { key: "very-bad", stars: 1, label: "Rất xấu" };
};

const hourQuality = (hour: { auspicious: boolean; score: number }) => {
  if (hour.auspicious) return hour.score >= 70 ? "excellent" : "good";
  if (hour.score >= 50) return "normal";
  if (hour.score >= 35) return "bad";
  return "very-bad";
};

const circlePoint = (radius: number, angle: number) => {
  const radians = angle * Math.PI / 180;
  return {
    x: Number((160 + radius * Math.cos(radians)).toFixed(3)),
    y: Number((160 + radius * Math.sin(radians)).toFixed(3)),
  };
};

const donutSegment = (startAngle: number, endAngle: number) => {
  const outerStart = circlePoint(103, startAngle);
  const outerEnd = circlePoint(103, endAngle);
  const innerEnd = circlePoint(58, endAngle);
  const innerStart = circlePoint(58, startAngle);
  return `M ${outerStart.x} ${outerStart.y} A 103 103 0 0 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A 58 58 0 0 0 ${innerStart.x} ${innerStart.y} Z`;
};

function BrandMark({ compact = false }: { compact?: boolean }) {
  return <span className={`brand-mark ${compact ? "brand-mark--compact" : ""}`} aria-hidden="true" />;
}

function ToolIntro({
  icon: Icon,
  title,
  description,
  highlights,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
}) {
  return (
    <header className="tool-intro">
      <span className="tool-intro__icon"><Icon size={27} strokeWidth={1.7} /></span>
      <div className="tool-intro__copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <ul>
        {highlights.map((item) => <li key={item}><Check size={14} strokeWidth={2} />{item}</li>)}
      </ul>
    </header>
  );
}

function MethodNote({
  title,
  points,
  sources,
}: {
  title: string;
  points: string[];
  sources: { label: string; href: string }[];
}) {
  return (
    <details className="method-note">
      <summary><span><ShieldCheck size={19} /><b>{title}</b><small>Quy tắc và nguồn dữ liệu có thể đối chiếu</small></span><span>Đã kiểm chứng <ChevronRight size={17} /></span></summary>
      <div className="method-note__body">
        <div>{points.map((point) => <p key={point}><CircleCheck size={15} />{point}</p>)}</div>
        <nav aria-label="Nguồn phương pháp">{sources.map((source) => <a key={source.href} href={source.href} target="_blank" rel="noreferrer"><LibraryBig size={15} />{source.label}<ExternalLink size={13} /></a>)}</nav>
      </div>
    </details>
  );
}

function HexLines({ lines, changed = false }: { lines: number[]; changed?: boolean }) {
  const rendered = changed
    ? lines.map((value) => (value === 6 ? 7 : value === 9 ? 8 : value))
    : lines;
  return (
    <div className="hex-lines" aria-label={changed ? "Quẻ biến" : "Quẻ chủ"}>
      {[...rendered].reverse().map((value, visualIndex) => {
        const moving = lines[lines.length - visualIndex - 1] === 6 || lines[lines.length - visualIndex - 1] === 9;
        const yang = value === 7 || value === 9;
        return (
          <div className="hex-line-wrap" key={`${visualIndex}-${value}`}>
            <div className={`hex-line ${yang ? "hex-line--yang" : "hex-line--yin"}`}>
              {yang ? <span /> : <><span /><span /></>}
            </div>
            {!changed && moving && <i aria-label="Hào động" />}
          </div>
        );
      })}
    </div>
  );
}

function ElementMark({ element }: { element: ElementName }) {
  const glyphs: Record<ElementName, string> = { Mộc: "木", Hỏa: "火", Thổ: "土", Kim: "金", Thủy: "水" };
  return <span className={`element-mark element-mark--${element.toLowerCase()}`}>{glyphs[element]}</span>;
}

const SVG_ELEMENT_COLORS: Record<ElementName, string> = {
  Mộc: "#067b11",
  Hỏa: "#cf233b",
  Thổ: "#e39e25",
  Kim: "#8b8380",
  Thủy: "#051d52",
};

const SVG_STEM_ELEMENTS: Record<string, ElementName> = {
  Giáp: "Mộc",
  Ất: "Mộc",
  Bính: "Hỏa",
  Đinh: "Hỏa",
  Mậu: "Thổ",
  Kỷ: "Thổ",
  Canh: "Kim",
  Tân: "Kim",
  Nhâm: "Thủy",
  Quý: "Thủy",
};

const SVG_ZIWEI_MASTER_ELEMENTS: Record<string, ElementName> = {
  "Tử Vi": "Thổ",
  "Thiên Cơ": "Mộc",
  "Thái Dương": "Hỏa",
  "Vũ Khúc": "Kim",
  "Thiên Đồng": "Thủy",
  "Liêm Trinh": "Hỏa",
  "Thiên Phủ": "Thổ",
  "Thái Âm": "Thủy",
  "Tham Lang": "Mộc",
  "Cự Môn": "Thủy",
  "Thiên Tướng": "Thủy",
  "Thiên Lương": "Mộc",
  "Thất Sát": "Kim",
  "Phá Quân": "Thủy",
  "Lộc Tồn": "Thổ",
  "Văn Khúc": "Thủy",
  "Văn Xương": "Kim",
  "Linh Tinh": "Hỏa",
  "Hỏa Tinh": "Hỏa",
};

const ZIWEI_MENH_CHU_BY_YEAR_BRANCH: Record<string, string> = {
  Tý: "Tham Lang",
  Sửu: "Cự Môn",
  Dần: "Lộc Tồn",
  Mão: "Văn Khúc",
  Thìn: "Liêm Trinh",
  Tị: "Vũ Khúc",
  Ngọ: "Phá Quân",
  Mùi: "Vũ Khúc",
  Thân: "Liêm Trinh",
  Dậu: "Văn Khúc",
  Tuất: "Lộc Tồn",
  Hợi: "Cự Môn",
};

const ZIWEI_THAN_CHU_BY_YEAR_BRANCH: Record<string, string> = {
  Tý: "Linh Tinh",
  Sửu: "Thiên Tướng",
  Dần: "Thiên Lương",
  Mão: "Thiên Đồng",
  Thìn: "Văn Xương",
  Tị: "Thiên Cơ",
  Ngọ: "Hỏa Tinh",
  Mùi: "Thiên Tướng",
  Thân: "Thiên Lương",
  Dậu: "Thiên Đồng",
  Tuất: "Văn Xương",
  Hợi: "Thiên Cơ",
};

function SvgHaLacGlyph({
  lines,
  x,
  y,
  width = 24,
  color = "#334155",
  originalColor = "#c63f36",
  strokeWidth = 2,
  lineStep = 4,
}: {
  lines: Array<{ value: 6 | 9; isOriginal?: boolean }>;
  x: number;
  y: number;
  width?: number;
  color?: string;
  originalColor?: string;
  strokeWidth?: number;
  lineStep?: number;
}) {
  return <g aria-hidden="true">{[...lines].reverse().map((line, index) => {
    const lineColor = line.isOriginal ? originalColor : color;
    const lineY = y + index * lineStep;
    return line.value === 9
      ? <rect key={`${index}-${line.value}`} x={x} y={lineY - strokeWidth / 2} width={width} height={strokeWidth} fill={lineColor} />
      : <g key={`${index}-${line.value}`}><rect x={x} y={lineY - strokeWidth / 2} width={width * 0.42} height={strokeWidth} fill={lineColor} /><rect x={x + width * 0.58} y={lineY - strokeWidth / 2} width={width * 0.42} height={strokeWidth} fill={lineColor} /></g>;
  })}</g>;
}

function getNuclearHaLac(lines: Array<{ value: 6 | 9 }>) {
  const values = [lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]].map((line) => line.value);
  return { name: getHexagram(values.map((value) => value === 9 ? 7 : 8)).primary.name, lines: values.map((value) => ({ value })) };
}

function shortLifeStage(stage: string) {
  return ({ "Trường Sinh": "Sinh", "Mộc Dục": "Dục", "Quan Đới": "Đới", "Lâm Quan": "LQuan", "Đế Vượng": "Vượng" } as Record<string, string>)[stage] ?? stage;
}

function shortHaLacName(name: string) {
  const normalized = name.replace(/^Thuần /, "");
  const words = normalized.split(" ");
  const shortName = name.startsWith("Thuần ") ? normalized : words.slice(2).join(" ");
  return (shortName || normalized).replace("Quy Muội", "Qui Muội");
}

function formatBaziClock(value: string, separator: "H" | "h") {
  const [hour, minute] = value.split(":");
  return `${Number(hour)}${separator}${minute}`;
}

function ConfigStepper({ label, value, options, onDecrease, onIncrease, onSelect }: { label: string; value: string | number; options?: (string | number)[]; onDecrease: () => void; onIncrease: () => void; onSelect?: (value: string) => void }) {
  return (
    <div className="config-stepper">
      <button type="button" onClick={onIncrease} aria-label={`Tăng ${label}`}><Plus size={16} /></button>
      <span><strong>{value}</strong><small>{label}</small>{options && onSelect && <select aria-label={`Chọn ${label}`} value={String(value)} onChange={(event) => onSelect(event.target.value)}>{options.map((option) => <option value={String(option)} key={String(option)}>{option}</option>)}</select>}</span>
      <button type="button" onClick={onDecrease} aria-label={`Giảm ${label}`}><Minus size={16} /></button>
    </div>
  );
}

function LocationSearch({ value }: { value: Pick<BirthData, "locationName" | "latitude" | "longitude" | "timezone" | "utcOffset"> }) {
  return (
    <div className="location-search location-search--fixed">
      <div className="location-search__current">
        <MapPin size={17} />
        <span><b>Vị trí sinh mặc định</b><strong>{value.locationName} · {formatUtcOffset(value.utcOffset)}</strong></span>
        <small>Múi giờ Việt Nam cố định; tọa độ quy chiếu {value.latitude.toFixed(4)}°, {value.longitude.toFixed(4)}°.</small>
      </div>
    </div>
  );
}

function ConfigToggle({ checked, title, description, onChange }: { checked: boolean; title: string; description: string; onChange: () => void }) {
  return (
    <button type="button" className="config-toggle" role="switch" aria-checked={checked} onClick={onChange}>
      <span><b>{title}</b><small>{description}</small></span>
      <i className={checked ? "is-on" : ""}><em /></i>
    </button>
  );
}

function ConfigChoiceGrid({ options, selected, onSelect, colors }: { options: readonly string[]; selected: number; onSelect: (index: number) => void; colors?: readonly string[] }) {
  return <div className="config-choice-grid">{options.map((option, index) => <button type="button" className={selected === index ? "is-selected" : ""} onClick={() => onSelect(index)} key={option} style={selected === index && colors?.[index] ? { "--choice-color": colors[index] } as React.CSSProperties : undefined}><span>{colors?.[index] && <i style={{ background: colors[index] }} />}{option}</span>{selected === index && <CircleCheck size={16} />}</button>)}</div>;
}

export default function MenhThuApp({
  initialToday,
  initialTool = "home",
  initialSlug = "",
  initialSimParams,
  standaloneBazi = false,
  initialChartStyle,
  initialConfigOpen = true,
}: {
  initialToday: string;
  initialTool?: ToolKey;
  initialSlug?: string;
  standaloneBazi?: boolean;
  initialChartStyle?: BaziChartStyle;
  initialConfigOpen?: boolean;
  initialSimParams?: {
    so?: string;
    ngay?: string;
    thang?: string;
    nam?: string;
    gio?: string;
    phut?: string;
    gioitinh?: string;
    lich?: string;
    nhuan?: string;
  };
}) {
  const [activeTool, setActiveTool] = useState<ToolKey>(initialTool);
  const [isChartPending, startChartTransition] = useTransition();
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  const notify = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  };

  const goTo = (tool: ToolKey) => {
    setActiveTool(tool);
    const path = TOOL_PATHS[tool];
    if (window.location.pathname !== path) {
      window.history.pushState({ tool }, "", path);
    }
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  };

  useEffect(() => {
    const handlePopState = () => setActiveTool(toolFromPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const todayProfile = useMemo(() => getDateProfile(initialToday), [initialToday]);
  const [currentTime, setCurrentTime] = useState("12:00");
  const todayChart = useMemo(() => getFourPillars(initialToday, currentTime, LOCATIONS[0].longitude), [initialToday, currentTime]);
  const lunarToday = useMemo(() => formatLunarParts(initialToday), [initialToday]);

  useEffect(() => {
    const updateTime = () => setCurrentTime(new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date()));
    updateTime();
    const timer = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const [question, setQuestion] = useState("");
  const [castPurpose, setCastPurpose] = useState<(typeof CAST_PURPOSES)[number]["key"]>("timing");
  const activeCastPurpose = CAST_PURPOSES.find((purpose) => purpose.key === castPurpose) ?? CAST_PURPOSES[0];
  const [coinLines, setCoinLines] = useState<number[]>([]);
  const [coinHistory, setCoinHistory] = useState<boolean[][]>([]);
  const [coinFaces, setCoinFaces] = useState([true, false, true]);
  const [tossing, setTossing] = useState(false);
  const [tossRound, setTossRound] = useState(0);
  const [omenFlash, setOmenFlash] = useState(false);
  const tossTimer = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);
  const hexagram = useMemo(() => coinLines.length === 6 ? getHexagram(coinLines) : null, [coinLines]);
  const [aiReading, setAiReading] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSignInPath, setAiSignInPath] = useState("");
  const aiPrompt = useMemo(() => hexagram ? buildIChingAiPrompt({
    question,
    purpose: activeCastPurpose,
    lines: coinLines,
    hexagram,
  }) : "", [activeCastPurpose, coinLines, hexagram, question]);

  const secureCoinFace = () => {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const randomByte = new Uint8Array(1);
      crypto.getRandomValues(randomByte);
      return randomByte[0] < 128;
    }
    return Math.random() >= 0.5;
  };

  const tossCoins = () => {
    if (tossing || coinLines.length >= 6) return;
    const faces = Array.from({ length: 3 }, secureCoinFace);
    const value = faces.reduce((sum, heads) => sum + (heads ? 2 : 3), 0);
    setCoinFaces(faces);
    setTossRound((round) => round + 1);
    setTossing(true);
    tossTimer.current = window.setTimeout(() => {
      setCoinLines((lines) => [...lines, value]);
      setCoinHistory((history) => [...history, faces]);
      setTossing(false);
      if (value === 6 || value === 9) {
        setOmenFlash(true);
        flashTimer.current = window.setTimeout(() => setOmenFlash(false), 520);
      }
    }, 1850);
  };

  const resetCoins = () => {
    if (tossTimer.current) clearTimeout(tossTimer.current);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setCoinLines([]);
    setCoinHistory([]);
    setCoinFaces([true, false, true]);
    setTossing(false);
    setTossRound(0);
    setOmenFlash(false);
    setAiReading("");
    setAiError("");
    setAiSignInPath("");
    setAiLoading(false);
  };

  const copyIChingForAi = async () => {
    if (!aiPrompt) return;
    try {
      await navigator.clipboard.writeText(aiPrompt);
      notify("Đã chép câu hỏi và dữ liệu quẻ cho AI");
    } catch {
      notify("Không thể truy cập bộ nhớ tạm");
    }
  };

  const requestAiReading = async () => {
    if (!aiPrompt || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    setAiSignInPath("");
    try {
      const response = await fetch("/api/iching-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const payload = await response.json() as { reading?: string; error?: string; signInPath?: string };
      if (!response.ok || !payload.reading) {
        if (response.status === 401 && payload.signInPath) setAiSignInPath(payload.signInPath);
        throw new Error(payload.error || "AI chưa trả về lời luận.");
      }
      setAiReading(payload.reading);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Không thể kết nối dịch vụ AI.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => () => {
    if (tossTimer.current) clearTimeout(tossTimer.current);
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  const [birthForm, setBirthForm] = useState<BirthData>({
    name: "An Nhiên",
    gender: "Nữ",
    date: "1992-08-18",
    time: "07:30",
    viewYear: Number(initialToday.slice(0, 4)),
    viewDate: initialToday,
    viewTime: "12:00",
    location: 0,
    locationName: LOCATIONS[0].name,
    timezone: LOCATIONS[0].timezone,
    latitude: LOCATIONS[0].latitude,
    longitude: LOCATIONS[0].longitude,
    utcOffset: LOCATIONS[0].utcOffset,
    calculationMode: "apparent",
  });
  const [requestedChartData, setChartData] = useState(birthForm);
  // Keep steppers and selects responsive while React prepares the much larger
  // Tử Vi/Tứ Trụ chart tree in the background.
  const chartData = useDeferredValue(requestedChartData);
  const [sharedParamsApplied, setSharedParamsApplied] = useState(false);
  const [initialSharedChartReady, setInitialSharedChartReady] = useState(false);
  const chartIsUpdating = isChartPending || chartData !== requestedChartData;
  const birthFormRef = useRef(birthForm);
  const chartUpdateFrame = useRef<number | null>(null);
  const [configBaseline, setConfigBaseline] = useState(birthForm);
  const [chartVersion, setChartVersion] = useState(1);
  const [baziView, setBaziView] = useState<BaziView>("chart");
  const [configOpen, setConfigOpen] = useState(initialConfigOpen ?? true);
  const [configTab, setConfigTab] = useState<BaziConfigTab>("time");
  const [configTimeTarget, setConfigTimeTarget] = useState<"birth" | "view">("birth");
  const initialStyleFromSlug = initialSlug ? SLUG_TO_STYLE[initialSlug] : undefined;
  // Keep the first server and client trees identical. The URL query is applied
  // by the effect below after hydration; reading window here made the static
  // shared route render two different chart schools and forced React to throw
  // away the server tree before Phi Hóa settings were applied.
  const [chartStyle, setChartStyle] = useState<BaziChartStyle>(
    initialChartStyle ?? initialStyleFromSlug ?? "Trung Châu Phái + Khâm Thiên",
  );
  const [showSolarDate, setShowSolarDate] = useState(true);
  const [trungChauTable, setTrungChauTable] = useState(0);
  const [phiHoaType, setPhiHoaType] = useState(3);
  const [phiHoaLayer, setPhiHoaLayer] = useState(2);
  const [canHoaTable, setCanHoaTable] = useState(1);
  const [showDaYunStars, setShowDaYunStars] = useState(false);
  const [currentStarMode, setCurrentStarMode] = useState(3);
  const [starGroupMode, setStarGroupMode] = useState(0);
  const [showLocKiCycle, setShowLocKiCycle] = useState(true);
  const [showOverlappingPalaces, setShowOverlappingPalaces] = useState(false);
  const [showFullLocKi, setShowFullLocKi] = useState(true);
  const [referenceCfgBase, setReferenceCfgBase] = useState<readonly number[]>(REFERENCE_DEFAULT_CFG);
  const showLunarDate = true;
  const isFourPillarsMode = chartStyle === "Tứ Trụ";
  const showHiddenStems = isFourPillarsMode || starGroupMode !== 1;
  const showRelations = isFourPillarsMode || showLocKiCycle || showFullLocKi;
  // Tứ Trụ của trang tham chiếu vẫn vẽ các quan hệ Can Chi giữa bốn trụ,
  // Đại vận và Lưu niên. Trước đây lớp này bị chặn riêng ở chế độ Tứ Trụ
  // nên dữ liệu đã tính nhưng toàn bộ đường/mũi tên không được render.
  const showRelationLines = showRelations;
  const showZiweiFlyArrows = !isFourPillarsMode;
  const [showAnnualBazi, setShowAnnualBazi] = useState(false);
  const [selectedCycleIndex, setSelectedCycleIndex] = useState<number | null>(null);
  const [chartNotes, setChartNotes] = useState("");
  const firstBirthField = useRef<HTMLInputElement | null>(null);
  const cycleSelectorRef = useRef<HTMLDivElement | null>(null);
  const palaceScrollRef = useRef<HTMLDivElement | null>(null);
  const location = { name: chartData.locationName, timezone: chartData.timezone };
  const currentCfg = useMemo(() => {
    // SettingsPanel in the reference product changes one cfg slot at a time.
    // Start from the complete decoded token so unsupported/hidden switches are
    // not reset merely because a shared chart was opened in Mệnh Thư.
    const cfg = [...referenceCfgBase];
    cfg[0] = canHoaTable;
    cfg[1] = MENHTHU_TO_TINH_STYLE[chartStyle] ?? 0;
    cfg[2] = phiHoaType;
    cfg[3] = starGroupMode;
    cfg[4] = currentStarMode;
    cfg[6] = showFullLocKi ? 1 : 0;
    cfg[7] = showLocKiCycle ? 1 : 0;
    cfg[PHI_HOA_LAYER_CFG_INDEX] = phiHoaLayer;
    cfg[14] = showAnnualBazi ? 1 : 0;
    cfg[16] = showSolarDate ? 1 : 0;
    cfg[18] = showOverlappingPalaces ? 1 : 0;
    cfg[21] = trungChauTable;
    cfg[22] = showDaYunStars ? 1 : 0;
    return cfg;
  }, [canHoaTable, chartStyle, phiHoaType, phiHoaLayer, starGroupMode, currentStarMode, referenceCfgBase, showDaYunStars, showFullLocKi, showLocKiCycle, showAnnualBazi, showSolarDate, showOverlappingPalaces, trungChauTable]);

  const horoChart = useMemo(() => {
    if (activeTool !== "bazi") return null;
    try {
      return calculateFullHoroChart({
        name: chartData.name,
        sex: chartData.gender,
        bornDate: chartData.date,
        bornTime: chartData.time,
        viewDate: chartData.viewDate,
        viewTime: chartData.viewTime,
        cfg: currentCfg,
        lat: chartData.latitude,
        lon: chartData.longitude,
      });
    } catch (e) {
      console.error("Error calculating horoChart:", e);
      return null;
    }
  }, [activeTool, chartData, currentCfg]);
  const chart = useMemo(() => getFourPillars(chartData.date, chartData.time, chartData.longitude, chartData.utcOffset, chartData.calculationMode, chartData.latitude), [chartData.date, chartData.time, chartData.longitude, chartData.latitude, chartData.utcOffset, chartData.calculationMode]);
  const viewChart = useMemo(() => getFourPillars(chartData.viewDate, chartData.viewTime, chartData.longitude, chartData.utcOffset, chartData.calculationMode, chartData.latitude), [chartData.calculationMode, chartData.latitude, chartData.longitude, chartData.utcOffset, chartData.viewDate, chartData.viewTime]);
  const haLac = useMemo(() => getHaLacChart(chartData.date, chartData.time, chartData.gender, chartData.longitude, chartData.utcOffset, chartData.calculationMode), [chartData.calculationMode, chartData.date, chartData.gender, chartData.longitude, chartData.time, chartData.utcOffset]);
  const temperature = useMemo(() => getBaziTemperature(chart.pillars, chart.calculation.solarTerm), [chart]);
  const balance = useMemo(() => getElementBalance(chart.pillars), [chart]);
  const baziSupport = useMemo(() => getBaziSupportProfile(chart.pillars), [chart]);
  const strongest = [...balance].sort((a, b) => b.count - a.count)[0];
  const weakest = [...balance].sort((a, b) => a.count - b.count)[0];
  const luck = useMemo(() => getLuckCycles(chartData.date, chartData.time, chartData.gender, chartData.longitude, chartData.utcOffset, chartData.calculationMode), [chartData.date, chartData.time, chartData.gender, chartData.longitude, chartData.utcOffset, chartData.calculationMode]);
  const forward = luck.forward;
  const cycles = luck.cycles;
  const lunarBirth = useMemo(() => getLunarDate(chart.calculation.appliedDate, chart.calculation.appliedTime, chartData.longitude, chartData.utcOffset), [chart.calculation.appliedDate, chart.calculation.appliedTime, chartData.longitude, chartData.utcOffset]);
  const viewLunar = useMemo(() => getLunarDate(chartData.viewDate, chartData.viewTime, chartData.longitude, chartData.utcOffset), [chartData.viewDate, chartData.viewTime, chartData.longitude, chartData.utcOffset]);
  const ageInViewYear = Math.max(0, chartData.viewYear - Number(lunarBirth.year) + 1);
  const lunarBirthForm = useMemo(() => isValidDateString(birthForm.date) ? getLunarDate(birthForm.date, birthForm.time, birthForm.longitude, birthForm.utcOffset) : null, [birthForm.date, birthForm.time, birthForm.longitude, birthForm.utcOffset]);
  const annualPillar = viewChart.pillars[0];
  const natalRelations = useMemo(() => getBaziRelations(chart.pillars), [chart]);
  const currentCycleIndex = Math.max(0, cycles.findIndex((cycle) => ageInViewYear >= cycle.from && ageInViewYear <= cycle.to));
  const ziweiLuckCycles = cycles.slice(0, 10);
  const ziweiLuckColumnWidth = 34;
  const ziweiLuckColumnGap = 3.5;
  const ziweiLuckStartX = 219.5;
  const ziweiLuckStartDate = useMemo(() => {
    const [year, month, day] = chartData.date.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCFullYear(date.getUTCFullYear() + luck.start.year);
    date.setUTCMonth(date.getUTCMonth() + luck.start.month);
    date.setUTCDate(date.getUTCDate() + luck.start.day);
    return `${String(date.getUTCDate()).padStart(2, "0")}/${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  }, [chartData.date, luck.start.day, luck.start.month, luck.start.year]);
  const effectiveCycleIndex = selectedCycleIndex ?? currentCycleIndex;
  const selectedCycle = cycles[Math.min(effectiveCycleIndex, cycles.length - 1)] ?? cycles[0];
  const transitRelations = useMemo(() => {
    if (!selectedCycle) return [];
    const natalKeys = new Set(natalRelations.map((relation) => `${relation.system}-${relation.label}-${[...relation.members].sort().join("-")}`));
    return getBaziRelations([...chart.pillars, selectedCycle, annualPillar]).filter((relation) => !natalKeys.has(`${relation.system}-${relation.label}-${[...relation.members].sort().join("-")}`));
  }, [annualPillar, chart, natalRelations, selectedCycle]);
  const annualYears = useMemo(() => selectedCycle
    ? Array.from({ length: selectedCycle.endYear - selectedCycle.startYear + 1 }, (_, index) => {
      const year = selectedCycle.startYear + index;
      return { year, pillar: getAnnualPillar(year) };
    })
    : [], [selectedCycle]);
  const pillarDetails = useMemo(() => chart.pillars.map((pillar) => ({
    tenGod: getTenGod(chart.dayMaster.stem, pillar.stem),
    hiddenStems: getHiddenStems(pillar.branch),
    naYin: getNaYin(pillar),
    lifeStage: getLifeStage(chart.dayMaster.stem, pillar.branch),
  })), [chart]);
  const annualGroups = useMemo(() => ANNUAL_BRANCH_ORDER.map((branch) => ({ branch, years: haLac.annual.filter((item) => item.pillar.branch === branch) })), [haLac]);
  const relationLines = useMemo(() => {
    type RelationAnchor = { x: number; y: number; halfWidth: number };
    type RelationNode = {
      id: string;
      pillar: Pillar;
      pillarIndex: number;
      tier: "natal" | "cycle" | "annual";
      stem: RelationAnchor;
      branch: RelationAnchor;
    };
    type RelationPoint = { x: number; y: number };
    const paths: Array<BaziRelation & {
      key: string;
      d: string;
      color: string;
      dash: string;
      width: number;
      start: RelationPoint;
      end: RelationPoint;
      sourceAnchor: RelationAnchor;
      targetAnchor: RelationAnchor;
      sourceId: string;
      targetId: string;
    }> = [];
    const natalCenters = [108.625, 303.875, 497.125, 692.375];
    const nodes: RelationNode[] = chart.pillars.map((pillar, index) => ({
      id: `NATAL-${index}`,
      pillar,
      pillarIndex: index,
      tier: "natal",
      stem: { x: natalCenters[index], y: 134.5, halfWidth: 17 },
      branch: { x: natalCenters[index], y: 172.5, halfWidth: 17 },
    }));
    if (selectedCycle && (selectedCycleIndex !== null || (ageInViewYear >= selectedCycle.from && ageInViewYear <= selectedCycle.to))) {
      const cycleIndex = Math.min(Math.max(effectiveCycleIndex, 0), 8);
      const cyclePitch = 773 / 9;
      const cycleWidth = cyclePitch - 1;
      const x = 14.5 + cycleIndex * cyclePitch + cycleWidth / 2;
      nodes.push({
        id: "DAI-VAN",
        pillar: selectedCycle,
        pillarIndex: 4,
        tier: "cycle",
        stem: { x, y: 360.5, halfWidth: 17 },
        branch: { x, y: 380.5, halfWidth: 17 },
      });
    }
    const annualGroupIndex = annualGroups.findIndex((group) => group.years.some((item) => item.year === chartData.viewYear));
    if (annualGroupIndex >= 0) {
      const positions = [[14.5, 452.5], [206.75, 452.5], [400, 452.5], [593.25, 452.5], [593.25, 682.2775], [593.25, 912.055], [593.25, 1141.8325], [400, 1141.8325], [206.75, 1141.8325], [14.5, 1141.8325], [14.5, 912.055], [14.5, 682.2775]];
      const positionIndex = (ANNUAL_BRANCH_ORDER.indexOf(annualGroups[annualGroupIndex].branch) + 7) % 12;
      const [groupX, groupY] = positions[positionIndex];
      const hiddenCount = Math.max(1, getHiddenStems(annualPillar.branch).length);
      const branchX = groupX + 96.125 - (23.38 + (hiddenCount - 1) * 18.88);
      const selectedYearIndex = Math.max(0, annualGroups[annualGroupIndex].years.findIndex((item) => item.year === chartData.viewYear));
      const annualStemX = groupX + (selectedYearIndex % 4) * 48.0625 + 24.03125;
      const annualStemY = groupY + Math.floor(selectedYearIndex / 4) * 95 + 75;
      nodes.push({
        id: "LUU-NIEN",
        pillar: annualPillar,
        pillarIndex: 5,
        tier: "annual",
        stem: { x: annualStemX, y: annualStemY, halfWidth: 11 },
        branch: { x: branchX, y: groupY + 213.0275, halfWidth: 17 },
      });
    }
    const graphRelations = getBaziRelations(nodes.map((node) => node.pillar)).filter((relation) => relation.system !== "Thiên can" || relation.kind === "combine");
    const candidates: Array<{ relation: BaziRelation; source: number; target: number }> = [];
    const usedEdges = new Set<string>();
    const queueEdge = (relation: BaziRelation, sourceIndex: number, targetIndex: number) => {
      if (sourceIndex === targetIndex) return;
      const source = Math.min(sourceIndex, targetIndex);
      const target = Math.max(sourceIndex, targetIndex);
      const edgeKey = `${relation.system}-${source}-${target}-${relation.kind}`;
      if (usedEdges.has(edgeKey)) return;
      usedEdges.add(edgeKey);
      candidates.push({ relation, source, target });
    };
    graphRelations.forEach((relation) => {
      const values = nodes.map((node) => relation.system === "Thiên can" ? node.pillar.stem : node.pillar.branch);
      const uniqueMembers = [...new Set(relation.members)];
      if (uniqueMembers.length === 1) {
        const indexes = values.map((value, index) => value === uniqueMembers[0] ? index : -1).filter((index) => index >= 0);
        indexes.forEach((source, sourceOffset) => indexes.slice(sourceOffset + 1).forEach((target) => queueEdge(relation, source, target)));
        return;
      }
      for (let left = 0; left < uniqueMembers.length - 1; left += 1) {
        for (let right = left + 1; right < uniqueMembers.length; right += 1) {
          const sourceIndexes = values.map((value, index) => value === uniqueMembers[left] ? index : -1).filter((index) => index >= 0);
          const targetIndexes = values.map((value, index) => value === uniqueMembers[right] ? index : -1).filter((index) => index >= 0);
          sourceIndexes.forEach((source) => targetIndexes.forEach((target) => queueEdge(relation, source, target)));
        }
      }
    });
    const annualIndex = nodes.findIndex((node) => node.tier === "annual");
    const dayIndex = 2;
    if (annualIndex >= 0 && BAZI_THREE_COMBINE_GROUPS.some((group) => group.includes(nodes[annualIndex].pillar.branch) && group.includes(nodes[dayIndex].pillar.branch))) {
      queueEdge({ system: "Địa chi", kind: "combine", label: "Bán hợp", members: [nodes[dayIndex].pillar.branch, nodes[annualIndex].pillar.branch] }, dayIndex, annualIndex);
    }
    candidates.sort((left, right) => left.source - right.source || left.target - right.target || left.relation.kind.localeCompare(right.relation.kind));
    let natalRailIndex = 0;
    candidates.forEach(({ relation, source, target }) => {
      const edgeKey = `${relation.system}-${source}-${target}-${relation.kind}`;
      const sourceNode = nodes[source];
      const targetNode = nodes[target];
      const sourceAnchor = relation.system === "Thiên can" ? sourceNode.stem : sourceNode.branch;
      const targetAnchor = relation.system === "Thiên can" ? targetNode.stem : targetNode.branch;
      const sourceId = `${relation.system === "Thiên can" ? "CAN" : "CHI"}-${sourceNode.id}`;
      const targetId = `${relation.system === "Thiên can" ? "CAN" : "CHI"}-${targetNode.id}`;
      const style = BAZI_RELATION_STYLES[relation.kind];
      const distance = Math.abs(targetNode.pillarIndex - sourceNode.pillarIndex);
      const bothNatal = sourceNode.tier === "natal" && targetNode.tier === "natal";
      const isCan = relation.system === "Thiên can";
      const isCombine = relation.kind === "combine";
      const start: RelationPoint = { x: sourceAnchor.x, y: sourceAnchor.y };
      const end: RelationPoint = { x: targetAnchor.x, y: targetAnchor.y };
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;
      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
      const length = Math.hypot(deltaX, deltaY) || 1;
      let d: string;
      if (bothNatal && distance >= 2 && style.tension === 0) {
        let offset: number;
        if (isCan) {
          offset = -(60 + 8 * natalRailIndex);
          natalRailIndex += 1;
        } else {
          const dir = natalRailIndex < 2 ? -1 : 1;
          offset = dir * ((dir === -1 ? 20 : 21) + 3 * (natalRailIndex % 2));
          natalRailIndex += 1;
        }
        d = `M${start.x} ${start.y} L${start.x} ${start.y + offset} L${end.x} ${start.y + offset} L${end.x} ${end.y}`;
      } else if (style.tension === 0) {
        d = `M${start.x} ${start.y} L${end.x} ${end.y}`;
      } else {
        const isCanHop = isCombine && isCan;
        const eVal = 25 + distance * (isCanHop ? 30 : 20) + (isCombine ? (isCanHop ? 35 : 18) : (relation.kind === "punishment" || relation.kind === "break") ? 22 : 12);
        const ctrlX = midX - (deltaY / length) * eVal;
        const ctrlY = midY + (deltaX / length) * eVal;
        d = `M${start.x} ${start.y} Q${ctrlX} ${ctrlY} ${end.x} ${end.y}`;
      }
      paths.push({ ...relation, key: edgeKey, d, color: style.color, dash: style.dash, width: style.width, start, end, sourceAnchor, targetAnchor, sourceId, targetId });
    });
    return paths;
  }, [ageInViewYear, annualGroups, annualPillar, chart, chartData.viewYear, effectiveCycleIndex, selectedCycle, selectedCycleIndex]);
  const selfPunishmentMarkers = useMemo(() => {
    const markers = new Map<string, { id: string; anchor: { x: number; y: number; halfWidth: number } }>();
    relationLines.filter((line) => line.label === "Tự hình").forEach((line) => {
      markers.set(line.sourceId, { id: line.sourceId, anchor: line.sourceAnchor });
      markers.set(line.targetId, { id: line.targetId, anchor: line.targetAnchor });
    });
    return [...markers.values()];
  }, [relationLines]);
  const visibleYang = chart.pillars.reduce((total, pillar) => total
    + (pillar.polarity === "Dương" ? 1 : 0)
    + (["Tý", "Dần", "Thìn", "Ngọ", "Thân", "Tuất"].includes(pillar.branch) ? 1 : 0), 0);
  const visibleYin = 8 - visibleYang;
  const baziPalaces = useMemo(() => BAZI_PALACE_BRANCHES.map((palace) => {
    let anchorYear = chartData.viewYear - 11;
    for (let year = chartData.viewYear - 11; year <= chartData.viewYear; year += 1) {
      if (getAnnualPillar(year).branch === palace.branch) anchorYear = year;
    }
    const hiddenStems = getHiddenStems(palace.branch);
    return { ...palace, hiddenStems, lifeStage: getLifeStage(chart.dayMaster.stem, palace.branch), years: Array.from({ length: 4 }, (_, index) => anchorYear + index * 12) };
  }), [chart.dayMaster.stem, chartData.viewYear]);
  const ziweiAstrolabe = useMemo(() => {
    const [appliedHour] = chart.calculation.appliedTime.split(":").map(Number);
    const timeIndex = appliedHour === 23 ? 0 : Math.floor((appliedHour + 1) / 2);
    const lunarDateStr = `${lunarBirth.year}-${lunarBirth.month}-${lunarBirth.day}`;
    return astro.byLunar(lunarDateStr, timeIndex, chartData.gender, lunarBirth.leap, false, "vi-VN");
  }, [chart.calculation.appliedTime, chartData.gender, lunarBirth.day, lunarBirth.leap, lunarBirth.month, lunarBirth.year]);
  const ziweiDiaBanAstrolabe = useMemo(() => {
    const [appliedHour] = chart.calculation.appliedTime.split(":").map(Number);
    const timeIndex = appliedHour === 23 ? 0 : Math.floor((appliedHour + 1) / 2);
    const lunarDateStr = `${lunarBirth.year}-${lunarBirth.month}-${lunarBirth.day}`;
    return astro.byLunar(lunarDateStr, (timeIndex + 3) % 12, chartData.gender, lunarBirth.leap, false, "vi-VN");
  }, [chart.calculation.appliedTime, chartData.gender, lunarBirth.day, lunarBirth.leap, lunarBirth.month, lunarBirth.year]);
  const ziweiNhanBanAstrolabe = useMemo(() => {
    const [appliedHour] = chart.calculation.appliedTime.split(":").map(Number);
    const timeIndex = appliedHour === 23 ? 0 : Math.floor((appliedHour + 1) / 2);
    const lunarDateStr = `${lunarBirth.year}-${lunarBirth.month}-${lunarBirth.day}`;
    return astro.byLunar(lunarDateStr, (timeIndex + 9) % 12, chartData.gender, lunarBirth.leap, false, "vi-VN");
  }, [chart.calculation.appliedTime, chartData.gender, lunarBirth.day, lunarBirth.leap, lunarBirth.month, lunarBirth.year]);
  const isTrungChauStyle = chartStyle.startsWith("Trung Châu Phái");
  const ziweiNatalCycleStars = useMemo(
    () => getReferenceZiweiNatalCycleStars(chart.pillars[0], luck.forward),
    [chart.pillars, luck.forward],
  );
  const ziweiNatalCycleNames = useMemo(
    () => new Set(ziweiNatalCycleStars.map((star) => star.name)),
    [ziweiNatalCycleStars],
  );
  const ziweiReferenceNatalPlacements = useMemo(() => {
    const lifePalace = ziweiAstrolabe.palaces.find((palace) => palace.name === "Mệnh") ?? ziweiAstrolabe.palaces[0];
    const bodyPalace = ziweiAstrolabe.palaces.find((palace) => palace.isBodyPalace) ?? lifePalace;
    return getReferenceZiweiNatalPlacements({
      yearStem: chart.pillars[0].stem,
      yearBranch: chart.pillars[0].branch,
      lunarMonth: lunarBirth.month,
      lunarDay: lunarBirth.day,
      hourBranch: chart.pillars[3].branch,
      gender: chartData.gender,
      lifePalaceBranch: normalizeZiweiBranch(lifePalace.earthlyBranch),
      bodyPalaceBranch: normalizeZiweiBranch(bodyPalace.earthlyBranch),
      isTrungChau: isTrungChauStyle,
    });
  }, [chart.pillars, chartData.gender, isTrungChauStyle, lunarBirth.day, lunarBirth.leap, lunarBirth.month, ziweiAstrolabe]);
  const ziWeiPalaces = useMemo(() => ZIWEI_BRANCHES.map((branch, branchIndex) => {
    const source = ziweiAstrolabe.palaces.find((palace) => normalizeZiweiBranch(palace.earthlyBranch) === branch);
    const tableAstrolabe = !isTrungChauStyle || trungChauTable === 0
      ? ziweiAstrolabe
      : trungChauTable === 1
        ? ziweiDiaBanAstrolabe
        : ziweiNhanBanAstrolabe;
    const starSource = tableAstrolabe.palaces.find((palace) => normalizeZiweiBranch(palace.earthlyBranch) === branch) ?? source;
    const lifeStageSource = starSource;
    const title = source ? ZIWEI_PALACE_TITLE_BY_NAME[source.name] : ZIWEI_PALACE_TITLES[branchIndex];
    const titleIndex = Math.max(0, ZIWEI_PALACE_TITLES.indexOf(title));
    const monthCycle = getZiweiMonthStem(annualPillar.stem, branch);
    const birthYear = Number(chartData.date.slice(0, 4));
    let firstYear = birthYear;
    while (getAnnualPillar(firstYear).branch !== branch && firstYear < birthYear + 12) firstYear += 1;
    const natalStemTransforms = getZiweiTransforms(chart.pillars[0].stem, canHoaTable);
    const natalCycleStars = ziweiNatalCycleStars.filter((star) => star.branch === branch).map((star) => star.name);
    const referenceNatalStars = [...ziweiReferenceNatalPlacements.entries()]
      .filter(([, starBranch]) => starBranch === branch)
      .map(([star]) => star);
    const candidateStarsForTransform = [
      ...(starSource?.majorStars ?? []),
      ...(source?.minorStars ?? []),
      ...referenceNatalStars.map((name) => ({ name })),
      ...natalCycleStars.map((name) => ({ name })),
      ...(source?.adjectiveStars ?? []),
    ];
    const transformationLabels = candidateStarsForTransform
      .map((star) => {
        const transformIndex = natalStemTransforms[normalizeZiweiStarName(star.name).toUpperCase()];
        return transformIndex !== undefined ? ["Hóa Lộc", "Hóa Quyền", "Hóa Khoa", "Hóa Kị"][transformIndex] : "";
      })
      .filter(Boolean);
    const minorStars = sortZiweiMinorStars([...new Set([
      ...(source?.minorStars.map((star) => normalizeZiweiStarName(star.name)).filter((star) => !ZIWEI_OMITTED_REFERENCE_STARS.has(star) && !REFERENCE_ZIWEI_MANAGED_NATAL_STARS.has(star) && !ziweiNatalCycleNames.has(star)) ?? []),
      ...transformationLabels,
      ...(source?.adjectiveStars.map((star) => normalizeZiweiStarName(star.name)).filter((star) => !ZIWEI_OMITTED_REFERENCE_STARS.has(star) && !REFERENCE_ZIWEI_MANAGED_NATAL_STARS.has(star) && !ziweiNatalCycleNames.has(star)) ?? []),
      ...referenceNatalStars,
      ...natalCycleStars,
    ])]);
    const sourceMinorDignities = new Map([
      ...(source?.minorStars ?? []),
      ...(source?.adjectiveStars ?? []),
    ].map((star) => {
      const name = normalizeZiweiStarName(star.name);
      return [name, star.brightness ?? ""] as const;
    }));
    const minorDignities = Object.fromEntries(minorStars.map((name) => [
      name,
      normalizeZiweiMinorDignity(name, branch, sourceMinorDignities.get(name) ?? ""),
    ]).filter(([, dignity]) => dignity));
    const decadeShift = isTrungChauStyle ? (trungChauTable === 1 ? 0 : trungChauTable === 2 ? -4 : 0) : 0;
    return {
      branch,
      stem: source?.heavenlyStem ?? getZiweiPalaceStem(chart.pillars[0].stem, branch),
      title,
      titleIndex,
      isBodyPalace: source?.isBodyPalace ?? false,
      isOriginalPalace: source?.isOriginalPalace ?? false,
      majorStars: starSource?.majorStars.map((star) => {
        const name = normalizeZiweiStarName(star.name).toUpperCase();
        const transformIndex = natalStemTransforms[name];
        const mutagen = transformIndex !== undefined
          ? (["Lộc", "Quyền", "Khoa", "Kị"][transformIndex] as string)
          : undefined;
        return {
          name,
          dignity: getReferenceZiweiDignity(name, branch, star.brightness ?? ""),
          mutagen,
        };
      }) ?? [],
      minorStars,
      minorDignities,
      lifeStage: normalizeZiweiStarName(String(lifeStageSource?.changsheng12 ?? source?.changsheng12 ?? "")),
      coordinate: ZIWEI_COORDINATES[branchIndex],
      years: Array.from({ length: 8 }, (_, index) => firstYear + index * 12),
      decadeAge: (source?.decadal?.range[0] ?? titleIndex * 10 + 5) + decadeShift,
      decadeRange: [
        (source?.decadal?.range[0] ?? titleIndex * 10 + 5) + decadeShift,
        (source?.decadal?.range[1] ?? titleIndex * 10 + 14) + decadeShift,
      ] as const,
      monthStem: monthCycle.stem,
      monthNumber: monthCycle.monthNumber,
    };
  }), [annualPillar.stem, canHoaTable, chart.pillars, chartData.date, isTrungChauStyle, trungChauTable, ziweiAstrolabe, ziweiDiaBanAstrolabe, ziweiNatalCycleNames, ziweiNatalCycleStars, ziweiNhanBanAstrolabe, ziweiReferenceNatalPlacements]);
  const ziweiFateElement = getElementFromLabel(getNaYin(chart.pillars[0]));
  const ziweiBureauElement = getElementFromLabel(ziweiAstrolabe.fiveElementsClass);
  const ziweiYinYangLabel = `${chart.pillars[0].polarity} ${chartData.gender}`;
  const ziweiLifeBranchIndex = ZIWEI_BRANCHES.indexOf((ziweiAstrolabe.palaces.find((palace) => palace.name === "Mệnh")?.earthlyBranch ?? "Tý") as (typeof ZIWEI_BRANCHES)[number]);
  const ziweiBirthBranchIndex = ZIWEI_BRANCHES.indexOf(chart.pillars[0].branch as (typeof ZIWEI_BRANCHES)[number]);
  const ziweiYinYangHarmony = ziweiLifeBranchIndex % 2 === ziweiBirthBranchIndex % 2
    ? "Âm dương thuận lý"
    : "Âm dương nghịch lý";
  const ziweiBodyPalace = ziWeiPalaces.find((palace) => palace.isBodyPalace)?.title ?? "—";
  const ziweiActiveDecadePalace = ziWeiPalaces.find((palace) =>
    ageInViewYear >= palace.decadeRange[0] && ageInViewYear <= palace.decadeRange[1],
  ) ?? ziWeiPalaces[0];
  const ziweiAnnualStars = useMemo(
    () => getReferenceZiweiAnnualStars(annualPillar, currentStarMode, luck.forward, isTrungChauStyle),
    [annualPillar, currentStarMode, isTrungChauStyle, luck.forward],
  );
  const ziweiDaYunStars = useMemo(
    () => [
      ...getZiweiFivePeriodStars(ziweiActiveDecadePalace.stem, "Đ.").slice(0, 3),
      ...getZiweiPeriodSupportStars(ziweiActiveDecadePalace.stem, "Đ."),
    ],
    [ziweiActiveDecadePalace.stem],
  );
  // The full moving-star layer keeps the reference canvas height. Dense
  // palaces rebalance only their overflow rows across the two star columns.
  const ziweiDenseStarLayout = currentStarMode === 3;
  const ziweiMinorStarSpacing = ziweiDenseStarLayout ? 14.5 : ZIWEI_MINOR_STAR_SPACING;
  const ziweiMovingStarSpacing = ziweiDenseStarLayout ? 14.5 : ZIWEI_MOVING_STAR_SPACING;
  const ziweiChartExtraHeight = 0;
  const ziweiChartHeight = 1027 + ziweiChartExtraHeight;
  const ziweiVerticalScale = (967 + ziweiChartExtraHeight) / 967;
  const ziweiCenterShift = 29 + (271.5 - 29) * ziweiVerticalScale - 271.5;
  const ziweiCenterHeight = 481 * ziweiVerticalScale;
  const ziweiDisplayPalaces = useMemo(() => ziWeiPalaces.map((palace) => {
    const [x, y, width, height] = palace.coordinate;
    return {
      ...palace,
      coordinate: [x, 29 + (y - 29) * ziweiVerticalScale, width, height * ziweiVerticalScale] as const,
    };
  }), [ziWeiPalaces, ziweiVerticalScale]);
  const ziweiVoidMarkers = useMemo(() => {
    const { tuan, triet } = getZiweiTuanTriet(chart.pillars[0].stem, chart.pillars[0].branch);
    const edges = new Map<string, { first: number; second: number; labels: string[] }>();
    const addEdge = (first: number, second: number, label: string) => {
      const key = `${first}-${second}`;
      const current = edges.get(key) ?? { first, second, labels: [] };
      if (!current.labels.includes(label)) current.labels.push(label);
      edges.set(key, current);
    };
    addEdge(tuan[0], tuan[1], "Tuần");
    addEdge(triet[0], triet[1], "Triệt");

    return [...edges.values()].map(({ first, second, labels }) => {
      const [x1, y1, width1, height1] = ziweiDisplayPalaces[first].coordinate;
      const [x2, y2, width2, height2] = ziweiDisplayPalaces[second].coordinate;
      const vertical = Math.abs(x1 + width1 - x2) < 1 || Math.abs(x2 + width2 - x1) < 1;
      const x = vertical
        ? (Math.abs(x1 + width1 - x2) < 1 ? x2 : x1)
        : (Math.max(x1, x2) + Math.min(x1 + width1, x2 + width2)) / 2;
      const y = vertical
        ? (Math.max(y1, y2) + Math.min(y1 + height1, y2 + height2)) / 2
        : (Math.abs(y1 + height1 - y2) < 1 ? y2 : y1);
      return {
        x,
        y,
        vertical,
        label: labels.length > 1 ? "Tuần - Triệt" : labels[0],
      };
    });
  }, [chart.pillars, ziweiDisplayPalaces]);
  const ziweiLocKiFlow = useMemo(
    () => getZiweiLocKiFlow(
      ziweiDisplayPalaces,
      canHoaTable,
      Math.max(0, ziweiDisplayPalaces.findIndex((palace) => palace.titleIndex === 0)),
      chart.pillars[0]?.stem,
    ),
    [canHoaTable, chart.pillars, ziweiDisplayPalaces],
  );
  const ziweiFlyArrows = useMemo(
    () => getZiweiFlyArrows(ziweiDisplayPalaces, chartStyle, canHoaTable, showOverlappingPalaces, ziweiMinorStarSpacing),
    [canHoaTable, chartStyle, showOverlappingPalaces, ziweiDisplayPalaces, ziweiMinorStarSpacing],
  );
  const [selectedPalaceIndex, setSelectedPalaceIndex] = useState<number | null>(null);
  const ziweiPalaceFlowArrows = useMemo(
    () => getZiweiPalaceFlowArrows(ziweiDisplayPalaces, chartStyle, phiHoaType, canHoaTable, ziweiLocKiFlow, selectedPalaceIndex),
    [canHoaTable, chartStyle, phiHoaType, ziweiDisplayPalaces, ziweiLocKiFlow, selectedPalaceIndex],
  );
  const ziweiRelationArrows = [...ziweiFlyArrows, ...ziweiPalaceFlowArrows];
  const ziweiLocKiAnnotations = useMemo(() => ziWeiPalaces.map((palace, sourceIndex) => {
    const transforms = getZiweiTransforms(palace.stem, canHoaTable);
    const targetForType = (type: 0 | 3) => {
      const targetStar = Object.entries(transforms).find(([, transformIndex]) => transformIndex === type)?.[0];
      if (!targetStar) return -1;
      return ziWeiPalaces.findIndex((candidate) =>
        candidate.majorStars.some((star) => star.name.toUpperCase() === targetStar)
        || candidate.minorStars.some((star) => star.toUpperCase() === targetStar),
      );
    };
    return { sourceIndex, locTarget: targetForType(0), kiTarget: targetForType(3) };
  }), [canHoaTable, ziWeiPalaces]);
  const ziweiFlyingTargets = useMemo(() => ziWeiPalaces.map((palace, sourceIndex) => {
    const transforms = getZiweiTransforms(palace.stem, canHoaTable);
    const shortPalaceNames = ["Mệnh", "Bào", "Phu", "Tử", "Tài", "Tật", "Di", "Nô", "Quan", "Điền", "Phúc", "Phụ"] as const;
    const targets = Array.from({ length: 4 }, (_, transformIndex) => {
      const targetStar = Object.entries(transforms).find(([, type]) => type === transformIndex)?.[0];
      const targetIndex = targetStar ? ziWeiPalaces.findIndex((candidate) =>
        candidate.majorStars.some((star) => star.name.toUpperCase() === targetStar)
        || candidate.minorStars.some((star) => star.toUpperCase() === targetStar),
      ) : -1;
      const shortName = targetIndex >= 0 ? shortPalaceNames[ziWeiPalaces[targetIndex].titleIndex] ?? ziWeiPalaces[targetIndex].title : "—";
      return {
        transformIndex,
        targetIndex,
        label: targetIndex === sourceIndex ? "✱" : targetIndex >= 0 ? shortName : "—",
      };
    });
    return targets;
  }), [canHoaTable, ziWeiPalaces]);
  const ziweiCycleMarkerPalaces = useMemo(() => {
    const markers = new Map<number, string>();
    ziweiLocKiAnnotations.forEach((annotation) => {
      if (markers.size >= 2) return;
      if (annotation.locTarget === annotation.sourceIndex || annotation.kiTarget === annotation.sourceIndex) {
        markers.set(annotation.sourceIndex, "⇄");
      }
    });
    ([["locTarget", "⇄"], ["kiTarget", "⇅"]] as const).forEach(([targetKey, icon]) => {
      ziweiLocKiAnnotations.forEach((annotation) => {
        const target = annotation[targetKey];
        if (target < 0 || target === annotation.sourceIndex || markers.size >= 2) return;
        if (ziweiLocKiAnnotations[target]?.[targetKey] === annotation.sourceIndex) {
          markers.set(annotation.sourceIndex, icon);
          if (markers.size < 2) markers.set(target, icon);
        }
      });
    });
    return markers;
  }, [ziweiLocKiAnnotations]);
  const [formYear, formMonth, formDay] = birthForm.date.split("-").map(Number);
  const [formHour, formMinute] = birthForm.time.split(":").map(Number);
  const [viewFormYear, viewFormMonth, viewFormDay] = birthForm.viewDate.split("-").map(Number);
  const [viewFormHour, viewFormMinute] = birthForm.viewTime.split(":").map(Number);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      if (initialTool !== "bazi" && params.get("tool") !== "bazi") {
        setSharedParamsApplied(true);
        return;
      }
      const parseDateTimeParam = (value: string | null) => {
        const match = value?.match(/^(\d{4}-\d{2}-\d{2})(?:T|-)(\d{2})(?::|-)(\d{2})$/);
        if (!match) return null;
        const time = `${match[2]}:${match[3]}`;
        const year = Number(match[1].slice(0, 4));
        return year >= 1800 && year <= 2200 && isValidDateString(match[1]) && isValidTimeString(time)
          ? { date: match[1], time }
          : null;
      };
      const birth = parseDateTimeParam(params.get("b"));
      const view = parseDateTimeParam(params.get("v"));
      const sharedCoordinates = (() => {
        const match = params.get("loc")?.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);
        if (!match) return null;
        const latitude = Number(match[1]);
        const longitude = Number(match[2]);
        return Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180
          ? { latitude, longitude }
          : null;
      })();
      const legacyViewYear = /^\d{4}$/.test(params.get("v") ?? "") ? Number(params.get("v")) : null;
      const safeLegacyViewYear = legacyViewYear !== null && legacyViewYear >= 1800 && legacyViewYear <= 2200 ? legacyViewYear : null;
      const locationPreset = DEFAULT_BIRTH_LOCATION;
      const mode = params.get("mode");
      const numberParam = (key: string, fallback: number) => {
        const raw = params.get(key);
        const value = raw === null ? Number.NaN : Number(raw);
        return Number.isFinite(value) ? value : fallback;
      };
      setBirthForm((current) => {
        const legacyViewDate = safeLegacyViewYear === null
          ? current.viewDate
          : (() => {
              const [, month, day] = current.viewDate.split("-").map(Number);
              const maxDay = new Date(Date.UTC(safeLegacyViewYear, month, 0)).getUTCDate();
              return `${safeLegacyViewYear}-${String(month).padStart(2, "0")}-${String(Math.min(day, maxDay)).padStart(2, "0")}`;
            })();
        const effectiveLat = sharedCoordinates?.latitude ?? locationPreset.latitude;
        const effectiveLon = sharedCoordinates?.longitude ?? locationPreset.longitude;
        const effectiveBirthDate = birth?.date ?? current.date;
        const effectiveBirthTime = birth?.time ?? current.time;
        const tzInfo = getAstronomicalTimezoneInfo(effectiveLat, effectiveLon, effectiveBirthDate, effectiveBirthTime);
        const parsedViewDate = view?.date ?? legacyViewDate;
        const effectiveViewDate = birth && birth.date > parsedViewDate ? birth.date : parsedViewDate;
        const effectiveViewYear = Number(effectiveViewDate.slice(0, 4)) || safeLegacyViewYear || current.viewYear;
        const next: BirthData = {
          ...current,
          name: params.get("name") || current.name,
          gender: params.get("s") === "1" || params.get("g") === "nam" ? "Nam" : params.get("s") === "0" || params.get("g") === "nu" ? "Nữ" : current.gender,
          date: effectiveBirthDate,
          time: effectiveBirthTime,
          viewYear: effectiveViewYear,
          viewDate: effectiveViewDate,
          viewTime: view?.time ?? current.viewTime,
          location: 0,
          locationName: sharedCoordinates ? "Tọa độ chia sẻ" : locationPreset.name,
          timezone: tzInfo.name,
          latitude: effectiveLat,
          longitude: effectiveLon,
          utcOffset: tzInfo.offset,
          calculationMode: mode === "civil" || mode === "mean" ? mode : "apparent",
        };
        setChartData(next);
        setConfigBaseline(next);
        return next;
      });
      // `cf` is the reference site's compact configuration token. Preserve
      // explicit local params, while translating the shared sample token so
      // opening the same link also opens the same chart mode and Phi Hóa layer.
      const compactConfig = params.get("cf") ?? "";
      const decompressedCfg = decompressConfigToken(compactConfig);
      // `P` in the reference store only decodes `cf` after a non-empty birth
      // payload is present. Its route initializer separately checks whether
      // the URL has the `b` key before replacing cfg[typeLs].
      const hasBirthParam = params.has("b");
      const hasBirthPayload = Boolean(params.get("b"));
      const effectiveCfg = hasBirthPayload ? decompressedCfg : null;
      setReferenceCfgBase(effectiveCfg ? [...effectiveCfg] : [...REFERENCE_DEFAULT_CFG]);
      const isSharedReferencePreset = /^(?:7bp2b|7bmqz)-2t-lfr[cd]$/.test(compactConfig);
      const referencePreset = isSharedReferencePreset || !compactConfig
        ? REFERENCE_ZIWEI_SHARED_PRESET
        : { chartStyle: 0, phiHoaType: 0, phiHoaLayer: 2, canHoaTable: 1, daYunStars: 0, currentStarMode: 0, starGroupMode: 0, locKiCycle: 0, fullLocKi: 0 };

      const pathSlug = typeof window !== "undefined" ? window.location.pathname.split("/").filter(Boolean).pop() ?? "" : "";
      const styleFromSlug = SLUG_TO_STYLE[pathSlug];
      // Match the reference store: an explicit local `cs` wins first;
      // otherwise a URL with `b` keeps the compact payload's cfg[typeLs]
      // authoritative, and only payload-less URLs use the route slug.
      const explicitTypeLs = params.has("cs") ? numberParam("cs", Number.NaN) : undefined;
      const chartStyleIndex = resolveReferenceTypeLs({
        hasBirthParam,
        decodedCfg: effectiveCfg,
        explicitTypeLs,
        // The reference's generic Vietnam route is labelled “Mặc định” but
        // its page config uses typeLs=2.  Other school slugs use their
        // matching numeric type directly.
        routeTypeLs: styleFromSlug
          ? styleFromSlug === "Mặc định"
            ? REFERENCE_DEFAULT_TYPE_LS
            : MENHTHU_TO_TINH_STYLE[styleFromSlug]
          : (initialChartStyle ? BAZI_CHART_STYLES.indexOf(initialChartStyle) : undefined),
        fallbackTypeLs: initialChartStyle ? BAZI_CHART_STYLES.indexOf(initialChartStyle) : referencePreset.chartStyle,
      });
      setChartStyle(BAZI_CHART_STYLES[chartStyleIndex]);

      if (params.has("sun")) {
        setShowSolarDate(numberParam("sun", 1) === 1);
      } else if (effectiveCfg && effectiveCfg[16] !== undefined) {
        setShowSolarDate(effectiveCfg[16] === 1);
      } else {
        setShowSolarDate(numberParam("sun", 1) === 1);
      }

      if (params.has("tcb")) {
        setTrungChauTable(Math.min(Math.max(numberParam("tcb", 0), 0), TRUNG_CHAU_TABLES.length - 1));
      } else if (effectiveCfg && effectiveCfg[21] !== undefined) {
        setTrungChauTable(Math.min(Math.max(effectiveCfg[21], 0), TRUNG_CHAU_TABLES.length - 1));
      } else {
        setTrungChauTable(Math.min(Math.max(numberParam("tcb", 0), 0), TRUNG_CHAU_TABLES.length - 1));
      }

      if (params.has("ph")) {
        setPhiHoaType(Math.min(Math.max(numberParam("ph", referencePreset.phiHoaType), 0), PHI_HOA_TYPES.length - 1));
      } else if (effectiveCfg && effectiveCfg[2] !== undefined) {
        setPhiHoaType(Math.min(Math.max(effectiveCfg[2], 0), PHI_HOA_TYPES.length - 1));
      } else {
        setPhiHoaType(Math.min(Math.max(numberParam("ph", referencePreset.phiHoaType), 0), PHI_HOA_TYPES.length - 1));
      }

      const configLayer = effectiveCfg?.[PHI_HOA_LAYER_CFG_INDEX] ?? referencePreset.phiHoaLayer;
      setPhiHoaLayer(Math.min(Math.max(numberParam("phl", configLayer), 0), PHI_HOA_LAYERS.length - 1));

      if (params.has("cht")) {
        setCanHoaTable(Math.min(Math.max(numberParam("cht", referencePreset.canHoaTable), 0), CAN_HOA_TABLES.length - 1));
      } else if (effectiveCfg && effectiveCfg[0] !== undefined) {
        setCanHoaTable(Math.min(Math.max(effectiveCfg[0], 0), CAN_HOA_TABLES.length - 1));
      } else {
        setCanHoaTable(Math.min(Math.max(numberParam("cht", referencePreset.canHoaTable), 0), CAN_HOA_TABLES.length - 1));
      }

      if (params.has("dys")) {
        setShowDaYunStars(numberParam("dys", referencePreset.daYunStars) === 1);
      } else if (effectiveCfg && effectiveCfg[22] !== undefined) {
        setShowDaYunStars(effectiveCfg[22] === 1);
      } else {
        setShowDaYunStars(numberParam("dys", referencePreset.daYunStars) === 1);
      }

      if (params.has("csm")) {
        setCurrentStarMode(Math.min(Math.max(numberParam("csm", referencePreset.currentStarMode), 0), CURRENT_STAR_MODES.length - 1));
      } else if (effectiveCfg && effectiveCfg[4] !== undefined) {
        setCurrentStarMode(Math.min(Math.max(effectiveCfg[4], 0), CURRENT_STAR_MODES.length - 1));
      } else {
        setCurrentStarMode(Math.min(Math.max(numberParam("csm", referencePreset.currentStarMode), 0), CURRENT_STAR_MODES.length - 1));
      }

      if (params.has("sgm")) {
        setStarGroupMode(Math.min(Math.max(numberParam("sgm", referencePreset.starGroupMode), 0), STAR_GROUP_MODES.length - 1));
      } else if (effectiveCfg && effectiveCfg[3] !== undefined) {
        setStarGroupMode(Math.min(Math.max(effectiveCfg[3], 0), STAR_GROUP_MODES.length - 1));
      } else {
        setStarGroupMode(Math.min(Math.max(numberParam("sgm", referencePreset.starGroupMode), 0), STAR_GROUP_MODES.length - 1));
      }

      if (params.has("lk")) {
        setShowLocKiCycle(numberParam("lk", referencePreset.locKiCycle) === 1);
      } else if (effectiveCfg && effectiveCfg[7] !== undefined) {
        setShowLocKiCycle(effectiveCfg[7] === 1);
      } else {
        setShowLocKiCycle(numberParam("lk", referencePreset.locKiCycle) === 1);
      }

      if (params.has("ov")) {
        setShowOverlappingPalaces(numberParam("ov", 0) === 1);
      } else if (effectiveCfg && effectiveCfg[18] !== undefined) {
        setShowOverlappingPalaces(effectiveCfg[18] === 1);
      } else {
        setShowOverlappingPalaces(numberParam("ov", 0) === 1);
      }

      if (params.has("flk")) {
        setShowFullLocKi(numberParam("flk", referencePreset.fullLocKi) === 1);
      } else if (effectiveCfg && effectiveCfg[6] !== undefined) {
        setShowFullLocKi(effectiveCfg[6] === 1);
      } else {
        setShowFullLocKi(numberParam("flk", referencePreset.fullLocKi) === 1);
      }

      if (params.has("ab")) {
        setShowAnnualBazi(numberParam("ab", 0) === 1);
      } else if (effectiveCfg && effectiveCfg[14] !== undefined) {
        setShowAnnualBazi(effectiveCfg[14] === 1);
      } else {
        setShowAnnualBazi(numberParam("ab", 0) === 1);
      }

      setActiveTool("bazi");
      setSharedParamsApplied(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialTool]);

  useEffect(() => {
    if (initialSharedChartReady || !sharedParamsApplied || chartData !== requestedChartData) return;
    // The shared URL is applied after hydration, while chartData is deferred.
    // Do not expose the temporary "today" chart: on the supplied fixture it
    // gives Thiên Đồng badge 5 before v=2026-08-17-14-00 settles to badges 3,4.
    const frame = window.requestAnimationFrame(() => setInitialSharedChartReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, [chartData, initialSharedChartReady, requestedChartData, sharedParamsApplied]);

  const mergeBirthPatch = (current: BirthData, patch: Partial<BirthData>): BirthData => {
    const next = {
      ...current,
      ...patch,
    };
    if (patch.viewDate) next.viewYear = Number(patch.viewDate.slice(0, 4));
    else if (patch.viewYear !== undefined) next.viewDate = `${String(patch.viewYear).padStart(4, "0")}${current.viewDate.slice(4)}`;
    else if (patch.date !== undefined && next.viewDate < next.date) {
      next.viewDate = next.date;
      next.viewYear = Number(next.date.slice(0, 4));
    }
    if (patch.latitude !== undefined || patch.longitude !== undefined || patch.date !== undefined || patch.time !== undefined) {
      const tzInfo = getAstronomicalTimezoneInfo(next.latitude, next.longitude, next.date, next.time);
      next.timezone = tzInfo.name;
      next.utcOffset = tzInfo.offset;
    }
    return next;
  };

  const applyBirthPatch = (patch: Partial<BirthData>) => {
    const next = mergeBirthPatch(birthFormRef.current, patch);
    birthFormRef.current = next;
    setBirthForm(next);
    if (chartUpdateFrame.current !== null) window.cancelAnimationFrame(chartUpdateFrame.current);
    // Let the changed control paint first, then prepare the dense chart. This
    // keeps rapid stepper input responsive without delaying the live update by
    // an arbitrary debounce interval.
    chartUpdateFrame.current = window.requestAnimationFrame(() => {
      chartUpdateFrame.current = null;
      startChartTransition(() => setChartData(next));
    });
  };

  useEffect(() => () => {
    if (chartUpdateFrame.current !== null) window.cancelAnimationFrame(chartUpdateFrame.current);
  }, []);

  const submitChart = (event: React.FormEvent) => {
    event.preventDefault();
    const validatedForm = birthForm.viewDate < birthForm.date
      ? { ...birthForm, viewDate: birthForm.date, viewYear: Number(birthForm.date.slice(0, 4)) }
      : birthForm;
    if (validatedForm !== birthForm) setBirthForm(validatedForm);
    setChartData(validatedForm);
    setChartVersion((value) => value + 1);
    setBaziView("chart");
    notify("Lá số đã được cập nhật");
  };

  useEffect(() => {
    birthFormRef.current = birthForm;
  }, [birthForm]);

  const [calendarView, setCalendarView] = useState(() => {
    const [year, month] = initialToday.split("-").map(Number);
    return { year, monthIndex: month - 1 };
  });
  const [selectedDate, setSelectedDate] = useState(initialToday);
  const [calendarBirthDate, setCalendarBirthDate] = useState("");
  const [calendarBirthTime, setCalendarBirthTime] = useState("12:00");
  const [calendarAgePinned, setCalendarAgePinned] = useState(false);
  const [calendarProfileReady, setCalendarProfileReady] = useState(false);
  const [showMoonVoc, setShowMoonVoc] = useState(true);
  const [showHourMode, setShowHourMode] = useState(true);
  const [showActionAdvice, setShowActionAdvice] = useState(true);
  const [showAgeRelations, setShowAgeRelations] = useState(true);
  const [applyWesternWarnings, setApplyWesternWarnings] = useState(true);
  const calendar = useMemo(() => getMonthCalendar(calendarView.year, calendarView.monthIndex), [calendarView]);
  const selectedProfile = useMemo(() => getDateProfile(selectedDate), [selectedDate]);
  const selectedMoonVoc = useMemo(
    () => getMoonVoidOfCourse(selectedDate, chartData.utcOffset),
    [chartData.utcOffset, selectedDate],
  );
  const selectedSolarTime = useMemo(
    () => getLocalSolarTimeProfile(selectedDate, DEFAULT_BIRTH_LOCATION.latitude, DEFAULT_BIRTH_LOCATION.longitude, VIETNAM_UTC_OFFSET),
    [selectedDate],
  );
  const selectedAgeRelations = useMemo(() => getDayAgeRelations(selectedProfile), [selectedProfile]);
  const selectedObservances = useMemo(() => getVietnameseObservances(selectedDate), [selectedDate]);
  const selectedEnergyScore = selectedProfile.energyScore;
  const selectedEnergyLabel = selectedProfile.energyLabel;
  const selectedEnergyQuality = calendarQuality(selectedEnergyScore);
  const personalDayCompatibility = useMemo(
    () => calendarBirthDate ? getPersonalDayCompatibility(selectedDate, calendarBirthDate, selectedProfile, calendarBirthTime) : null,
    [calendarBirthDate, calendarBirthTime, selectedDate, selectedProfile],
  );
  const calendarDays = useMemo(() => Array.from({ length: calendar.days }, (_, index) => {
    const day = index + 1;
    const date = toDateString(calendarView.year, calendarView.monthIndex, day);
    const profile = getDateProfile(date);
    const moonVoc = getMoonVoidOfCourse(date, VIETNAM_UTC_OFFSET);
    return {
      day,
      date,
      profile,
      moonVoc,
      energyScore: profile.energyScore,
      lunar: formatLunarParts(date),
      observances: getVietnameseObservances(date),
      personal: calendarBirthDate ? getPersonalDayCompatibility(date, calendarBirthDate, profile, calendarBirthTime) : null,
    };
  }), [calendar.days, calendarBirthDate, calendarBirthTime, calendarView.monthIndex, calendarView.year]);
  const [selectedYear, selectedMonth, selectedDay] = selectedDate.split("-").map(Number);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(window.localStorage.getItem(CALENDAR_PROFILE_STORAGE_KEY) ?? "null") as null | { birthDate?: string; birthTime?: string };
        if (stored?.birthDate && isValidDateString(stored.birthDate)) {
          setCalendarBirthDate(stored.birthDate);
          if (stored.birthTime && isValidTimeString(stored.birthTime)) setCalendarBirthTime(stored.birthTime);
          setCalendarAgePinned(true);
        }
      } catch {
        window.localStorage.removeItem(CALENDAR_PROFILE_STORAGE_KEY);
      }
      setCalendarProfileReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!calendarProfileReady) return;
    if (calendarAgePinned && calendarBirthDate) {
      window.localStorage.setItem(CALENDAR_PROFILE_STORAGE_KEY, JSON.stringify({ birthDate: calendarBirthDate, birthTime: calendarBirthTime }));
    } else {
      window.localStorage.removeItem(CALENDAR_PROFILE_STORAGE_KEY);
    }
  }, [calendarAgePinned, calendarBirthDate, calendarBirthTime, calendarProfileReady]);

  const useChartProfileForCalendar = () => {
    setCalendarBirthDate(chartData.date);
    setCalendarBirthTime(chartData.time);
    setCalendarAgePinned(true);
    notify(`Đã ghim tuổi của ${chartData.name} cho lịch ngày tốt`);
  };

  const toggleCalendarAgePin = () => {
    if (!calendarBirthDate) {
      notify("Hãy chọn ngày sinh trước khi ghim tuổi");
      return;
    }
    setCalendarAgePinned((current) => !current);
  };

  const moveMonth = (delta: number) => {
    const nextMonth = new Date(Date.UTC(calendarView.year, calendarView.monthIndex + delta, 1));
    const year = nextMonth.getUTCFullYear();
    const monthIndex = nextMonth.getUTCMonth();
    const preferredDay = Number(selectedDate.slice(-2));
    const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    setCalendarView({ year, monthIndex });
    setSelectedDate(toDateString(year, monthIndex, Math.min(preferredDay, daysInMonth)));
  };

  const moveSelectedDay = (delta: number) => {
    const [year, month, day] = selectedDate.split("-").map(Number);
    const next = new Date(Date.UTC(year, month - 1, day + delta));
    const nextYear = next.getUTCFullYear();
    const nextMonthIndex = next.getUTCMonth();
    setCalendarView({ year: nextYear, monthIndex: nextMonthIndex });
    setSelectedDate(toDateString(nextYear, nextMonthIndex, next.getUTCDate()));
  };

  const [customAiCategory, setCustomAiCategory] = useState<"ziwei" | "bazi" | "halac" | "combined" | null>(null);
  const aiChartCategory = customAiCategory ?? (activeTool === "bazi" || isFourPillarsMode || chartStyle === "Tứ Trụ" ? "bazi" : "ziwei");

  const chartAiMarkdown = useMemo(() => {
    return buildChartMarkdownForAi({
      name: chartData.name,
      gender: chartData.gender,
      date: chartData.date,
      time: chartData.time,
      viewDate: chartData.viewDate,
      viewTime: chartData.viewTime,
      viewYear: chartData.viewYear,
      locationName: location.name,
      latitude: chartData.latitude,
      longitude: chartData.longitude,
      utcOffset: chartData.utcOffset,
      calculationMode: chartData.calculationMode,
      horoChart,
      baziChart: chart,
      baziSupport,
      luck,
      haLac,
      isFourPillarsMode,
      chartStyle,
      canHoaTable,
      trungChauTable,
    }, aiChartCategory);
  }, [chartData, location.name, horoChart, chart, baziSupport, luck, haLac, isFourPillarsMode, chartStyle, canHoaTable, trungChauTable, aiChartCategory]);

  const copyChart = async () => {
    try {
      await navigator.clipboard.writeText(chartAiMarkdown);
      const categoryLabel = chartStyle === "Tứ Trụ" || aiChartCategory === "bazi"
        ? "Tứ Trụ Bát Tự"
        : aiChartCategory === "ziwei"
        ? `Tử Vi (${chartStyle})`
        : aiChartCategory === "halac"
        ? "Hà Lạc Bát Quái"
        : "Tổng Hợp";
      notify(`Đã sao chép Markdown lá số ${categoryLabel} cho AI`);
    } catch {
      notify("Không thể truy cập bộ nhớ tạm");
    }
  };

  const copyChartLink = async () => {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    url.searchParams.set("tool", "bazi");
    url.searchParams.set("name", chartData.name);
    url.searchParams.set("g", chartData.gender === "Nam" ? "nam" : "nu");
    url.searchParams.set("b", `${chartData.date}T${chartData.time}`);
    url.searchParams.set("v", `${chartData.viewDate}T${chartData.viewTime}`);
    url.searchParams.set("mode", chartData.calculationMode);
    url.searchParams.set("loc", `${chartData.latitude.toFixed(7)},${chartData.longitude.toFixed(7)}`);
    url.searchParams.set("cs", String(BAZI_CHART_STYLES.indexOf(chartStyle)));
    url.searchParams.set("sun", showSolarDate ? "1" : "0");
    url.searchParams.set("tcb", String(trungChauTable));
    url.searchParams.set("ph", String(phiHoaType));
    url.searchParams.set("phl", String(phiHoaLayer));
    url.searchParams.set("cht", String(canHoaTable));
    url.searchParams.set("dys", showDaYunStars ? "1" : "0");
    url.searchParams.set("csm", String(currentStarMode));
    url.searchParams.set("sgm", String(starGroupMode));
    url.searchParams.set("lk", showLocKiCycle ? "1" : "0");
    url.searchParams.set("ov", showOverlappingPalaces ? "1" : "0");
    url.searchParams.set("flk", showFullLocKi ? "1" : "0");
    url.searchParams.set("ab", showAnnualBazi ? "1" : "0");
    await navigator.clipboard.writeText(url.toString());
    window.history.replaceState({}, "", url);
    notify("Đã sao chép liên kết lá số");
  };

  const editChartData = () => {
    setBirthForm(chartData);
    if (!configOpen) setConfigBaseline(chartData);
    setConfigTab("time");
    setConfigOpen((open) => !open);
  };

  const setBirthDatePart = (unit: "year" | "month" | "day", rawValue: number) => {
    const [year, month, day] = birthForm.date.split("-").map(Number);
    const nextYear = unit === "year" ? rawValue : year;
    const nextMonth = unit === "month" ? rawValue : month;
    const maxDay = new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate();
    const nextDay = unit === "day" ? Math.min(rawValue, maxDay) : Math.min(day, maxDay);
    applyBirthPatch({ date: `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}` });
  };

  const setBirthTimePart = (unit: "hour" | "minute", rawValue: number) => {
    const [hour, minute] = birthForm.time.split(":").map(Number);
    applyBirthPatch({ time: `${String(unit === "hour" ? rawValue : hour).padStart(2, "0")}:${String(unit === "minute" ? rawValue : minute).padStart(2, "0")}` });
  };

  const changeBirthDate = (unit: "year" | "month" | "day", delta: number) => {
    const [year, month, day] = birthForm.date.split("-").map(Number);
    const next = new Date(Date.UTC(year, month - 1, day, 12));
    if (unit === "year") next.setUTCFullYear(next.getUTCFullYear() + delta);
    if (unit === "month") next.setUTCMonth(next.getUTCMonth() + delta);
    if (unit === "day") next.setUTCDate(next.getUTCDate() + delta);
    applyBirthPatch({ date: next.toISOString().slice(0, 10) });
  };

  const changeBirthTime = (unit: "hour" | "minute", delta: number) => {
    const [hour, minute] = birthForm.time.split(":").map(Number);
    const total = (hour * 60 + minute + (unit === "hour" ? delta * 60 : delta) + 1440) % 1440;
    applyBirthPatch({ time: `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}` });
  };

  const setViewDatePart = (unit: "year" | "month" | "day", rawValue: number) => {
    const [year, month, day] = birthForm.viewDate.split("-").map(Number);
    const nextYear = unit === "year" ? rawValue : year;
    const nextMonth = unit === "month" ? rawValue : month;
    const maxDay = new Date(Date.UTC(nextYear, nextMonth, 0)).getUTCDate();
    const nextDay = unit === "day" ? Math.min(rawValue, maxDay) : Math.min(day, maxDay);
    applyBirthPatch({ viewDate: `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}-${String(nextDay).padStart(2, "0")}` });
  };

  const setViewTimePart = (unit: "hour" | "minute", rawValue: number) => {
    const [hour, minute] = birthForm.viewTime.split(":").map(Number);
    applyBirthPatch({ viewTime: `${String(unit === "hour" ? rawValue : hour).padStart(2, "0")}:${String(unit === "minute" ? rawValue : minute).padStart(2, "0")}` });
  };

  const changeViewDate = (unit: "year" | "month" | "day", delta: number) => {
    const [year, month, day] = birthForm.viewDate.split("-").map(Number);
    const next = new Date(Date.UTC(year, month - 1, day, 12));
    if (unit === "year") next.setUTCFullYear(next.getUTCFullYear() + delta);
    if (unit === "month") next.setUTCMonth(next.getUTCMonth() + delta);
    if (unit === "day") next.setUTCDate(next.getUTCDate() + delta);
    applyBirthPatch({ viewDate: next.toISOString().slice(0, 10) });
  };

  const changeViewTime = (unit: "hour" | "minute", delta: number) => {
    const [hour, minute] = birthForm.viewTime.split(":").map(Number);
    const total = (hour * 60 + minute + (unit === "hour" ? delta * 60 : delta) + 1440) % 1440;
    applyBirthPatch({ viewTime: `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}` });
  };

  const selectAnnualYear = (year: number) => {
    applyBirthPatch({ viewYear: year });
  };

  const openChartNotes = () => {
    const storageKey = `menh-thu-note:${chartData.date}:${chartData.time}:${chartData.name}`;
    setChartNotes(window.localStorage.getItem(storageKey) ?? "");
    setBaziView("notes");
  };

  const saveChartNotes = () => {
    const storageKey = `menh-thu-note:${chartData.date}:${chartData.time}:${chartData.name}`;
    window.localStorage.setItem(storageKey, chartNotes);
    notify("Đã lưu ghi chú trên thiết bị này");
  };

  const selectLuckCycle = (index: number) => {
    const nextCycle = cycles[index];
    setSelectedCycleIndex(index);
    if (nextCycle && (chartData.viewYear < nextCycle.startYear || chartData.viewYear > nextCycle.endYear)) selectAnnualYear(nextCycle.startYear);
  };

  return (
    <div className={`app-shell ${standaloneBazi ? "app-shell--standalone-bazi" : ""}`}>
      {!standaloneBazi && <header className="topbar">
        <button className="wordmark" onClick={() => goTo("home")} aria-label="Về đầu trang">
          <BrandMark compact />
          <span><strong>Mệnh Thư</strong><small>Huyền học ứng dụng</small></span>
        </button>
        <nav aria-label="Điều hướng chính" role="tablist">
          <button role="tab" aria-selected={activeTool === "home"} className={activeTool === "home" ? "is-active" : ""} onClick={() => goTo("home")}><Home size={15} /><span>Tổng quan</span></button>
          <button role="tab" aria-selected={activeTool === "iching"} className={activeTool === "iching" ? "is-active" : ""} onClick={() => goTo("iching")}><Coins size={15} /><span>Gieo quẻ</span></button>
          <button role="tab" aria-selected={activeTool === "bazi"} className={activeTool === "bazi" ? "is-active" : ""} onClick={() => goTo("bazi")}><LayoutGrid size={15} /><span>Tứ trụ</span></button>
          <button role="tab" aria-selected={activeTool === "calendar"} className={activeTool === "calendar" ? "is-active" : ""} onClick={() => goTo("calendar")}><CalendarDays size={15} /><span>Ngày tốt</span></button>
          <button role="tab" aria-selected={activeTool === "sim"} className={activeTool === "sim" ? "is-active" : ""} onClick={() => goTo("sim")}><Phone size={15} /><span>Sim phong thủy</span></button>
        </nav>
        <button className="topbar-today" onClick={() => goTo("calendar")}>
          <CalendarDays size={17} strokeWidth={1.8} />
          <span><b>{todayProfile.pillar.stem} {todayProfile.pillar.branch}</b><small>{todayProfile.energyScore}% · {todayProfile.energyLabel}</small></span>
        </button>
      </header>}

      <main className={`view-shell view-shell--${activeTool}`}>
        {activeTool === "home" && <div className="view-panel" id="home" role="tabpanel">
        <section className="hero hero--archive">
          <div className="hero-copy">
            <div className="hero-note"><span>Niên lịch hôm nay</span> {formatLongDate(initialToday)}</div>
            <h1>Thấu thời vận.<br />Rõ đường đi.</h1>
            <p>Một bộ công cụ mệnh lý có quy tắc và nguồn đối chiếu rõ ràng—giúp bạn gieo quẻ, lập Tứ trụ và chọn thời điểm trong cùng một nhịp tra cứu.</p>
            <div className="hero-actions">
              <button className="button button--primary" onClick={() => goTo("iching")}><Coins size={17} />Gieo một quẻ</button>
              <button className="button button--quiet" onClick={() => goTo("bazi")}>Lập lá số Tứ trụ <ArrowRight size={17} /></button>
            </div>
            <div className="hero-facts">
              <span><Compass size={17} /><span><b>{getSolarTerm(initialToday)}</b> Tiết khí hiện tại</span></span>
              <span><Clock3 size={17} /><span><b>{todayProfile.goodHours[0].branch} · {todayProfile.goodHours[1].branch}</b> Giờ đầu cát lành</span></span>
              <span><BookOpen size={17} /><span><b>Ba phép tra cứu</b> Dịch · Mệnh · Lịch</span></span>
            </div>
          </div>
          <div className="hero-visual" aria-label={`Thiên bàn ngày ${todayProfile.pillar.stem} ${todayProfile.pillar.branch}, ${todayProfile.status}`}>
            <span className="hero-artifact" aria-hidden="true" />
            <aside className="hero-day-rail">
              <CalendarDays size={18} />
              <small>Hôm nay</small>
              <strong>{todayProfile.pillar.stem}<br />{todayProfile.pillar.branch}</strong>
              <i />
              <b>{todayProfile.energyScore}%</b>
              <span>năng lượng</span>
              <em>{todayProfile.status}</em>
            </aside>
            <div className="hero-macro" aria-hidden="true">
              <span />
              <small>Khắc văn thiên bàn</small>
            </div>
          </div>
        </section>

        <section className="today-almanac" aria-labelledby="today-almanac-title">
          <header>
            <div><small>Thiên lịch hôm nay</small><h2 id="today-almanac-title">Nhịp Can Chi hiện tại</h2></div>
            <span><MapPin size={15} />Hà Nội · UTC+7 · chính ngọ 11:57</span>
          </header>
          <div className="today-almanac__body">
            <div className="today-lunar-date">
              <span>Âm lịch</span>
              <strong>{lunarToday.day}</strong>
              <p>Tháng {lunarToday.month} · năm {todayChart.pillars[0].stem} {todayChart.pillars[0].branch}</p>
              <small>{getSolarTerm(initialToday)} · {currentTime}</small>
            </div>
            <div className="today-pillars">
              {todayChart.pillars.map((pillar, index) => <article key={`${pillar.stem}-${pillar.branch}-${index}`}>
                <span>{["Năm", "Tháng", "Ngày", "Giờ"][index]}</span>
                <strong>{pillar.stem}<br />{pillar.branch}</strong>
                <small>{getNaYin(pillar)}</small>
              </article>)}
            </div>
          </div>
          <div className="today-almanac__footer"><Compass size={15} /><span>Lịch Can Chi theo tiết khí và giờ Việt Nam</span><button onClick={() => goTo("calendar")}>Mở lịch ngày tốt <ArrowRight size={15} /></button></div>
        </section>

        <section className="tool-index" aria-labelledby="tool-index-title">
          <div className="section-heading section-heading--inline">
            <div><h2 id="tool-index-title">Ba phép tra cứu cốt lõi</h2><p>Mỗi công cụ là một luồng hoàn chỉnh, không cần cài đặt.</p></div>
            <span className="ink-rule" />
          </div>
          <div className="tool-rows">
            <button onClick={() => goTo("iching")}>
              <span className="tool-number"><Coins size={21} /></span><span><b>Gieo quẻ Kinh Dịch</b><small>Tung ba đồng xu sáu lần, lập quẻ chủ và quẻ biến.</small></span><ArrowRight size={21} />
            </button>
            <button onClick={() => goTo("bazi")}>
              <span className="tool-number"><LayoutGrid size={21} /></span><span><b>Tử vi Tứ trụ</b><small>An bốn trụ, cân bằng Ngũ hành và xem các đại vận.</small></span><ArrowRight size={21} />
            </button>
            <button onClick={() => goTo("calendar")}>
              <span className="tool-number"><CalendarDays size={21} /></span><span><b>Lịch ngày giờ cát hung</b><small>Đối chiếu Trực ngày, 28 Tú và mười hai giờ Hoàng–Hắc đạo.</small></span><ArrowRight size={21} />
            </button>
            <button onClick={() => goTo("sim")}>
              <span className="tool-number"><Phone size={21} /></span><span><b>Sim phong thủy Kinh Dịch</b><small>Luận 64 quẻ, Bát Cực Linh Số & Bát Tự phối quẻ chuẩn xác.</small></span><ArrowRight size={21} />
            </button>
          </div>
        </section>

        <section className="closing-section">
          <div><BrandMark /><h2>Mệnh là nền.<br />Vận là dòng.</h2></div>
          <p>Hiểu cấu trúc để bình tâm trước biến đổi. Mệnh Thư gom những phép tra cứu cốt lõi vào một trải nghiệm đủ sáng rõ để dùng lâu dài.</p>
          <button className="button button--primary" onClick={() => goTo("iching")}>Bắt đầu từ một quẻ <ArrowRight size={17} /></button>
        </section>
        </div>}

        {activeTool === "iching" && <section className="tool-section tool-page iching-section view-panel" id="iching" role="tabpanel">
          <ToolIntro
            icon={Coins}
            title="Gieo quẻ Kinh Dịch"
            description="Giữ tâm ý nhất quán và tung ba đồng xu đúng sáu lần. Mỗi lần tung lập một hào từ dưới lên; đủ sáu hào hệ thống mới mở quẻ chủ, nhận diện hào động và an quẻ biến."
            highlights={["Lập hào từ dưới lên", "Lưu dấu 3 mặt xu mỗi lần", "Chỉ luận khi đủ 6 hào"]}
          />
          <div className="iching-workspace">
            <div className="ritual-panel">
              <div className="ritual-setup">
                <fieldset className="cast-purpose">
                  <legend>Chọn chủ đề</legend>
                  <div>{CAST_PURPOSES.map((purpose) => <button type="button" key={purpose.key} className={castPurpose === purpose.key ? "is-selected" : ""} disabled={coinLines.length > 0 || tossing} onClick={() => setCastPurpose(purpose.key)}>{purpose.label}</button>)}</div>
                </fieldset>
                <div className="question-field">
                  <div className="question-label"><label htmlFor="question">Điều bạn đang suy xét <span>không bắt buộc</span></label><small>{question.length}/180</small></div>
                  <textarea id="question" value={question} maxLength={180} onChange={(event) => {
                    setQuestion(event.target.value);
                    setAiReading("");
                    setAiError("");
                  }} placeholder={activeCastPurpose.prompt} rows={2} />
                </div>
              </div>
              <div className="casting-instruction">
                <strong>Tung 3 đồng xu để lập hào</strong>
                <div className="coin-key" aria-label="Quy ước hai mặt đồng xu">
                  <span><i className="mini-coin is-heads">乾</i><b>Mặt ngửa</b><small>2 điểm</small></span>
                  <span><i className="mini-coin is-tails">坤</i><b>Mặt sấp</b><small>3 điểm</small></span>
                </div>
              </div>

              <div className="casting-ledger" aria-live="polite" aria-label="Sáu hào của quẻ">
                {[6, 5, 4, 3, 2, 1].map((lineNumber) => {
                  const value = coinLines[lineNumber - 1];
                  const faces = coinHistory[lineNumber - 1];
                  const yang = value === 7 || value === 9;
                  const moving = value === 6 || value === 9;
                  return (
                    <div className={`casting-row ${value ? "is-revealed" : ""} ${moving ? "is-moving" : ""}`} key={lineNumber}>
                      <span>Hào {lineNumber}</span>
                      <div className={`casting-line ${yang ? "is-yang" : "is-yin"} ${!value ? "is-empty" : ""}`}>
                        {yang ? <i /> : <><i /><i /></>}
                        {moving && <b>{value === 9 ? "○" : "×"}</b>}
                      </div>
                      <div className="casting-coins">
                        {faces ? faces.map((heads, index) => <i className={`mini-coin ${heads ? "is-heads" : "is-tails"}`} key={`${lineNumber}-${index}`}>{heads ? "乾" : "坤"}</i>) : [0, 1, 2].map((index) => <i className="mini-coin is-empty" key={`${lineNumber}-${index}`} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="toss-status"><span>{coinLines.length < 6 ? `Đang chờ lập hào ${coinLines.length + 1} / 6` : "Quẻ đã thành · có thể xem luận giải"}</span><div>{Array.from({ length: 6 }, (_, index) => <i key={index} className={index < coinLines.length ? "is-filled" : ""} />)}</div></div>
            </div>

            <div className="hexagram-panel" aria-live="polite">
              {hexagram ? (
                <div className="hex-result">
                  <div className="hex-result-head">
                    <div><small>{activeCastPurpose.label} · Quẻ chủ số {hexagram.primary.number}</small><h3>{hexagram.primary.name}</h3><p>{hexagram.primary.keyword}</p></div>
                    <HexLines lines={coinLines} />
                  </div>
                  <div className="primary-reading">
                    <small>Tượng quẻ</small>
                    <blockquote>{hexagram.primary.message}</blockquote>
                  </div>
                  <div className="purpose-reading">
                    <small>Luận theo chủ đề · {activeCastPurpose.label}</small>
                    <h4>{activeCastPurpose.scope}</h4>
                    <p>{getPurposeReading(activeCastPurpose, hexagram.primary.keyword)}</p>
                  </div>
                  <div className="trigram-pair">
                    <span><i>{hexagram.primary.upper.symbol}</i><b>Thượng {hexagram.primary.upper.name}</b><small>{hexagram.primary.upper.nature}</small></span>
                    <span><i>{hexagram.primary.lower.symbol}</i><b>Hạ {hexagram.primary.lower.name}</b><small>{hexagram.primary.lower.nature}</small></span>
                  </div>
                  {hexagram.moving.length > 0 ? (
                    <>
                      <section className="moving-line-analysis" aria-label="Các hào động">
                        <header><span>Hào động</span><b>{hexagram.moving.length} hào đang biến</b></header>
                        <div>
                          {hexagram.movingDetails.map((line) => <article key={line.position}>
                            <span className={line.value === 9 ? "is-yang" : "is-yin"}>{line.value === 9 ? "○" : "×"}</span>
                            <div><small>Hào {line.position} · {line.change}</small><h4>{line.polarity}</h4><p>{line.guidance}</p><em>Trọng điểm: {line.focus}</em></div>
                          </article>)}
                        </div>
                      </section>
                      <div className="changed-hex">
                        <HexLines lines={coinLines} changed />
                        <div><small>Quẻ biến · số {hexagram.changed.number}</small><h4>{hexagram.changed.name}</h4><p>Đổi các hào {hexagram.moving.join(", ")}. Xu thế chuyển về <b>{hexagram.changed.keyword.toLowerCase()}</b>.</p></div>
                      </div>
                    </>
                  ) : <p className="stable-hex">Không có hào động — thế quẻ đang định hình; nên giữ nguyên tắc chính và chưa vội tìm biến chuyển bên ngoài.</p>}
                  <p className="reading-rule"><BookOpen size={15} /><span><b>Phép đọc đang áp dụng</b>{hexagram.readingRule}</span></p>
                  {question && <div className="question-echo"><small>Câu hỏi đã lập quẻ</small><p>“{question}”</p></div>}
                  <section className="iching-ai-panel" aria-labelledby="iching-ai-title">
                    <header>
                      <span><Bot size={18} /></span>
                      <div>
                        <small>Gói dữ liệu dành cho AI</small>
                        <h4 id="iching-ai-title">Hỏi sâu hơn về quẻ này</h4>
                        <p>Đã ghép câu hỏi, sáu hào, quẻ chủ, hào động và quẻ biến thành một prompt hoàn chỉnh.</p>
                      </div>
                    </header>
                    <textarea aria-label="Nội dung câu hỏi và dữ liệu quẻ dành cho AI" readOnly value={aiPrompt} rows={7} />
                    <div className="iching-ai-actions">
                      <button type="button" className="button button--secondary" onClick={copyIChingForAi}>
                        <ClipboardCopy size={16} /><span>Chép cho AI</span>
                      </button>
                      <button type="button" className="button button--primary" onClick={requestAiReading} disabled={aiLoading}>
                        <Bot size={16} /><span>{aiLoading ? "Đang luận giải…" : "Luận giải bằng AI"}</span>
                      </button>
                    </div>
                    {aiError && <p className="iching-ai-error" role="alert">{aiError}{aiSignInPath && <> <a href={aiSignInPath}>Đăng nhập để tiếp tục</a>.</>}</p>}
                    {aiReading && <article className="iching-ai-reading" aria-live="polite">
                      <small>Luận giải từ AI</small>
                      <div>{aiReading}</div>
                    </article>}
                    <p className="iching-ai-note">AI chỉ hỗ trợ diễn giải và suy xét; không thay thế quyết định chuyên môn hoặc bảo đảm một kết quả tương lai.</p>
                  </section>
                </div>
              ) : (
                <div className="hex-empty">
                  <span className="hex-empty__chapter">Thiên bàn đang tĩnh</span>
                  <div className="hex-empty__seal" aria-hidden="true">易</div>
                  <div className="empty-hex-lines"><span /><span /><span /><span /><span /><span /></div>
                  <h3>Sáu hào đang chờ được lập</h3>
                  <p>Mỗi lần tung sẽ tạo một hào âm, hào dương hoặc hào động. Kết quả chỉ hiện khi đủ sáu lần để không ngắt nhịp tập trung.</p>
                  <div className="line-legend"><span><i className="solid-line" /> Dương</span><span><i className="broken-line" /> Âm</span><span><i className="moving-dot" /> Hào động</span></div>
                </div>
              )}
            </div>
          </div>

          <div className={`casting-dock ${coinLines.length >= 6 ? "is-complete" : ""}`}>
            {coinLines.length < 6 ? <button className="casting-trigger" onClick={tossCoins} disabled={tossing} aria-label={`Tung ba đồng xu để lập hào ${coinLines.length + 1}`}><span className="casting-trigger__coin"><Coins size={21} /></span><span className="casting-trigger__copy"><small>Lập hào {coinLines.length + 1} / 6</small><strong>{tossing ? "Đang tung…" : "Tung 3 đồng xu"}</strong></span><ArrowUp className="casting-trigger__arrow" size={17} /></button> : <button className="casting-reset" onClick={resetCoins}><RotateCcw size={17} /><span><strong>Quẻ mới</strong><small>Gieo lại</small></span></button>}
          </div>

          {tossing && <div className="coin-cast-overlay" role="status" aria-live="assertive">
            <div className="cast-coins" key={tossRound}>
              <div className="casting-vessel casting-vessel--base" aria-hidden="true" />
              {coinFaces.map((heads, index) => (
                <div className="cast-coin-wrap" key={`${tossRound}-${index}`} style={{ "--cast-delay": `${index * 85}ms` } as React.CSSProperties}>
                  <div className={`coin is-tossing ${heads ? "lands-heads" : "lands-tails"}`}>
                    <span className="coin-face coin-face--heads"><b>乾</b><i>Ngửa</i></span>
                    <span className="coin-face coin-face--tails"><b>坤</b><i>Sấp</i></span>
                  </div>
                  <span className="cast-shadow" />
                </div>
              ))}
              <div className="casting-vessel casting-vessel--foreground" aria-hidden="true" />
            </div>
            <p><small>Đang lập hào {coinLines.length + 1}</small><strong>Chờ đồng xu dừng hẳn</strong></p>
          </div>}
          {omenFlash && <div className="omen-flash" aria-hidden="true" />}
          <MethodNote
            title="Phương pháp lập và đọc quẻ"
            points={[
              "Ba đồng xu có xác suất tự nhiên: lão âm 6 và lão dương 9 cùng 1/8; thiếu âm 8 và thiếu dương 7 cùng 3/8.",
              "Sáu hào được lập từ dưới lên. Quẻ biến chỉ hình thành bằng cách đổi các hào động 6 và 9.",
              "Lời luận 64 quẻ là bản diễn giải tiếng Việt do Mệnh Thư biên soạn từ cấu trúc Thoán từ và Đại tượng, không phải lời tiên đoán tuyệt đối.",
            ]}
            sources={[{ label: "Chu Dịch · Chinese Text Project", href: "https://ctext.org/book-of-changes" }]}
          />
        </section>}

        {activeTool === "bazi" && <section className="tool-section tool-page bazi-section view-panel" id="bazi" role="tabpanel">
          <ToolIntro
            icon={LayoutGrid}
            title="Lá số Tứ Trụ Bát Tự"
            description="An bốn trụ theo tiết khí và chuẩn thời gian tại nơi sinh. Lá số trình bày Thập thần, Tàng can, Nạp âm, Trường sinh, quan hệ Can Chi và thời điểm khởi Đại vận theo khoảng cách đến giao tiết."
            highlights={["Ba chuẩn giờ để đối chiếu", "Đại vận · Lưu niên tương tác", "Hợp · Xung · Hình · Hại · Phá"]}
          />
          <div className="bazi-workspace">
          <aside className="bazi-input-pane" aria-label="Dữ kiện lập lá số">
          <form className="birth-form" onSubmit={submitChart}>
            <div className="birth-form__intro">
              <span>Hồ sơ mệnh chủ</span>
              <div className="birth-form__seal" aria-hidden="true">八字</div>
              <strong>Nhập thời điểm sinh</strong>
              <p>Ngày, giờ và nơi sinh là ba dữ kiện chính để an bốn trụ.</p>
            </div>
            <div className="birth-form__fields">
              <label className="birth-field birth-field--name"><span>Họ tên</span><input ref={firstBirthField} value={birthForm.name} onChange={(event) => setBirthForm({ ...birthForm, name: event.target.value })} required /></label>
              <fieldset className="birth-field birth-field--gender"><legend>Giới tính</legend><div className="segmented"><button type="button" className={birthForm.gender === "Nam" ? "is-selected" : ""} onClick={() => setBirthForm({ ...birthForm, gender: "Nam" })}>Nam</button><button type="button" className={birthForm.gender === "Nữ" ? "is-selected" : ""} onClick={() => setBirthForm({ ...birthForm, gender: "Nữ" })}>Nữ</button></div></fieldset>
              <label className="birth-field birth-field--date"><span>Ngày sinh dương lịch</span><input type="date" min="1800-01-01" max="2200-12-31" value={birthForm.date} onChange={(event) => setBirthForm((current) => mergeBirthPatch(current, { date: event.target.value }))} required />{lunarBirthForm && <small>Âm lịch {lunarBirthForm.day}/{lunarBirthForm.month}/{lunarBirthForm.year}{lunarBirthForm.leap ? " · tháng nhuận" : ""}</small>}</label>
              <label className="birth-field birth-field--time"><span>Giờ sinh</span><input type="time" value={birthForm.time} onChange={(event) => setBirthForm((current) => mergeBirthPatch(current, { time: event.target.value }))} required /></label>
              <div className="birth-field birth-field--location location-field">
                <span>Nơi sinh</span>
                <LocationSearch value={birthForm} />
              </div>
              <details className="bazi-time-settings">
                <summary><SlidersHorizontal size={17} /><span><b>Hiệu chỉnh thời gian và vị trí</b><small>{TIME_MODE_COPY[birthForm.calculationMode].label} · có thể nhập kinh độ chính xác</small></span><ChevronRight size={16} /></summary>
                <div className="bazi-time-settings__body">
                  <fieldset><legend>Chuẩn thời gian dùng để an trụ giờ</legend><div className="time-mode-options">
                    {(Object.keys(TIME_MODE_COPY) as TimeCalculationMode[]).map((mode) => <button type="button" key={mode} className={birthForm.calculationMode === mode ? "is-selected" : ""} onClick={() => setBirthForm({ ...birthForm, calculationMode: mode })}><b>{TIME_MODE_COPY[mode].short}</b><small>{TIME_MODE_COPY[mode].description}</small></button>)}
                  </div></fieldset>
                  <p className="bazi-time-settings__fixed-zone"><MapPin size={15} />Việt Nam · UTC+7 cố định</p>
                </div>
              </details>
              <div className="birth-form__action">
                <div className="birth-form__action-copy"><CalendarDays size={18} /><span><strong>Luận vận theo năm</strong><small>Chọn năm cần xem sau khi an bốn trụ.</small></span></div>
                <label className="birth-field birth-field--year"><span>Năm luận vận</span><input type="number" min="1900" max="2100" value={birthForm.viewYear} onChange={(event) => {
                  const viewYear = Number(event.target.value);
                  setBirthForm({ ...birthForm, viewYear, viewDate: `${String(viewYear).padStart(4, "0")}${birthForm.viewDate.slice(4)}` });
                }} required /></label>
                <button className="button button--primary birth-form__submit" type="submit"><BookOpen size={18} /><span><small>Kiểm tra dữ kiện</small><strong>Lập lá số</strong></span></button>
              </div>
            </div>
          </form>
          <p className="bazi-input-status"><CircleCheck size={15} /><span><b>Lá số đang hiển thị</b>{chartData.name} · {chartData.date.split("-").reverse().join("/")} · {chartData.time}</span></p>
          </aside>

          <div className={`bazi-result-pane ${configOpen ? "has-config-open" : "has-config-closed"}`} aria-live="polite">
          <div className="chart-shell chart-shell--recast" key={chartVersion}>
            <div className="chart-toolbar chart-toolbar--bazi">
              <div><span>Lá số của</span><strong>{chartData.name}</strong><small>{chartData.gender} · {formatLongDate(chartData.date)} · {chartData.time}</small></div>
              <nav className="chart-toolbar__actions" aria-label="Thao tác lá số">
                <button onClick={editChartData}><PencilLine size={15} /><span>Sửa lá số</span></button>
                <button onClick={copyChartLink}><Link2 size={15} /><span>Chép liên kết</span></button>
                <button onClick={copyChart}><ClipboardCopy size={15} /><span>Chép lá số</span></button>
                <button onClick={() => window.print()}><Printer size={15} /><span>In · lưu PDF</span></button>
              </nav>
            </div>
            <div className="bazi-location-strip">
              <MapPin size={15} />
              <span><small>Vị trí tính toán</small><b>{location.name}</b></span>
              <span>{chartData.latitude.toFixed(4)}° N · {chartData.longitude.toFixed(4)}° E · {location.timezone} ({formatUtcOffset(chartData.utcOffset)})</span>
              <i>Chính ngọ {chart.calculation.solarNoonTime} · {TIME_MODE_COPY[chartData.calculationMode].label} {chart.calculation.appliedTime}</i>
              <button className={`bazi-config-launch ${configOpen ? "is-active" : ""}`} type="button" aria-expanded={configOpen} onClick={editChartData}><PencilLine size={16} /><span>Sửa lá số</span></button>
            </div>

            <nav className="bazi-view-tabs" role="tablist" aria-label="Nội dung lá số Tứ trụ">
              <button role="tab" aria-selected={baziView === "chart"} className={baziView === "chart" ? "is-selected" : ""} onClick={() => setBaziView("chart")}><LayoutGrid size={16} /><span>Lá số</span></button>
              <button role="tab" aria-selected={baziView === "fortune"} className={baziView === "fortune" ? "is-selected" : ""} onClick={() => setBaziView("fortune")}><CalendarDays size={16} /><span>Đại vận · Lưu niên</span></button>
              <button role="tab" aria-selected={baziView === "analysis"} className={baziView === "analysis" ? "is-selected" : ""} onClick={() => setBaziView("analysis")}><Compass size={16} /><span>Phân tích cấu trúc</span></button>
              <button role="tab" aria-selected={baziView === "ai"} className={baziView === "ai" ? "is-selected" : ""} onClick={() => setBaziView("ai")}><Bot size={16} /><span>Tổng kết AI</span></button>
              <button role="tab" aria-selected={baziView === "notes"} className={baziView === "notes" ? "is-selected" : ""} onClick={openChartNotes}><FileText size={16} /><span>Ghi chú</span></button>
            </nav>

            <div className="bazi-view-panel" key={`${chartVersion}-${baziView}`}>
            {baziView === "chart" && <>
              <div className={`bazi-paper ${isFourPillarsMode ? "is-four-pillars-chart" : "is-school-chart"} ${showLocKiCycle ? "has-loc-ki-cycle" : ""} ${showOverlappingPalaces ? "has-overlapping-palaces" : ""} ${showFullLocKi ? "has-full-loc-ki" : ""}`} data-chart-style={chartStyle} data-current-stars={currentStarMode} data-star-group={starGroupMode}>
                <Suspense fallback={<div className={`${isFourPillarsMode ? "bazi-reference-board" : "ziwei-reference-board"} bazi-chart-loading`} role="status"><span /><small>Đang an lá số…</small></div>}>
                  {initialSharedChartReady
                    ? <TinhMenhDoChart
                        horoMap={horoChart?.rawHoro}
                        isFourPillarsMode={isFourPillarsMode}
                      />
                    : <div className={`${isFourPillarsMode ? "bazi-reference-board" : "ziwei-reference-board"} bazi-chart-loading`} role="status"><span /><small>Đang áp dụng ngày xem từ liên kết…</small></div>}
                </Suspense>
                {!isFourPillarsMode && <div className="bazi-school-config-summary">
                  <span><small>Kiểu lá số</small><strong>{chartStyle}</strong></span>
                  {["Trung Châu Phái", "Trung Châu Phái + Khâm Thiên", "Trung Châu Phái + Lương Phái"].includes(chartStyle) && <span><small>Bàn Trung Châu</small><strong>{TRUNG_CHAU_TABLES[trungChauTable]}</strong></span>}
                  <span><small>Phi hóa</small><strong>{PHI_HOA_TYPES[phiHoaType]} · {PHI_HOA_LAYERS[phiHoaLayer]}</strong></span>
                  <span><small>Bảng tứ hóa</small><strong>{CAN_HOA_TABLES[canHoaTable]}</strong></span>
                  <span><small>Sao lưu</small><strong>{CURRENT_STAR_MODES[currentStarMode]} · {STAR_GROUP_MODES[starGroupMode]}</strong></span>
                  {(showLocKiCycle || showOverlappingPalaces || showFullLocKi) && <span><small>Lớp nâng cao</small><strong>{[showLocKiCycle && "Tuần hoàn lộc kị", showOverlappingPalaces && "Cung vị trùng điệp", showFullLocKi && "Lộc kị toàn đồ"].filter(Boolean).join(" · ")}</strong></span>}
                </div>}
                <header className="bazi-paper__header">
                  <div className="bazi-paper__identity"><small>Mệnh Thư · Bát Tự Mệnh Lý</small><h2>{chartData.name}</h2><p>{chartData.gender} mệnh · {forward ? "Thuận hành" : "Nghịch hành"}</p></div>
                  <div className="bazi-seal" aria-hidden="true">命<br />書</div>
                  <dl>
                    {showSolarDate && <div><dt>Dương lịch</dt><dd>{chartData.date.split("-").reverse().join("/")} · {chartData.time}</dd></div>}
                    {showLunarDate && <div><dt>Âm lịch</dt><dd>{lunarBirth.day}/{lunarBirth.month}/{lunarBirth.year}{lunarBirth.leap ? " · nhuận" : ""}</dd></div>}
                    <div><dt>Tiết khí</dt><dd>{chart.calculation.solarTerm}</dd></div>
                    <div><dt>Năm xem</dt><dd>{chartData.viewYear} · {ageInViewYear} tuổi</dd></div>
                    <div><dt>Nơi sinh</dt><dd>{location.name}</dd></div>
                    <div><dt>Giờ hiệu chỉnh</dt><dd>{chart.calculation.appliedTime} · {chart.calculation.appliedCorrectionMinutes >= 0 ? "+" : ""}{Math.round(chart.calculation.appliedCorrectionMinutes)} phút</dd></div>
                  </dl>
                </header>

                <div className="bazi-reference-meta">
                  <p><b>{chartData.gender === "Nam" ? "Nam" : "Nữ"} mệnh · {ageInViewYear} tuổi</b> · Lá số Tứ Trụ · Tiết {chart.calculation.solarTerm} · Hiệu chỉnh theo tọa độ ({chartData.latitude.toFixed(4)}, {chartData.longitude.toFixed(4)}) UTC{chartData.utcOffset >= 0 ? "+" : ""}{chartData.utcOffset}</p>
                  <p>Tháng {lunarBirth.month} tiết khí từ {chart.calculation.monthStartTerm.name} ({chart.calculation.monthStartTerm.date.replaceAll("-", "/")} {chart.calculation.monthStartTerm.time}) đến {chart.calculation.monthEndTerm.name} ({chart.calculation.monthEndTerm.date.replaceAll("-", "/")} {chart.calculation.monthEndTerm.time})</p>
                </div>

                <div className="bazi-board-banner">
                  <span><small>Tháng lệnh</small><b>{chart.pillars[1].stem} {chart.pillars[1].branch}</b><i>{chart.calculation.solarTerm}</i></span>
                  <span><small>Nhật chủ</small><b>{chart.dayMaster.stem} {chart.dayMaster.stemElement}</b><i>{chart.dayMaster.polarity} khí</i></span>
                  <span><small>Giờ sinh dùng an trụ</small><b>{chart.calculation.appliedTime}</b><i>{TIME_MODE_COPY[chartData.calculationMode].short}</i></span>
                  <span><small>Âm dương hiển</small><b>{visibleYang} Dương · {visibleYin} Âm</b><i>Tám chữ nguyên cục</i></span>
                </div>

                <p className="bazi-palace-hint"><MoveHorizontal size={14} />Vuốt ngang để xem toàn bộ thiên bàn</p>
                <div className="bazi-palace-scroll" ref={palaceScrollRef} tabIndex={0} aria-label="Thiên bàn Tứ Trụ mười hai Địa chi">
                  <div className="bazi-palace-board">
                    {baziPalaces.map((palace) => <article className={`bazi-palace bazi-palace--${palace.element.toLowerCase()}`} style={{ gridArea: palace.area }} key={palace.branch}>
                      <header><span><small>{palace.lifeStage}</small><strong>{palace.branch}</strong></span><ElementMark element={palace.element} /></header>
                      <div className="bazi-palace__years">{palace.years.map((year) => <button type="button" className={chartData.viewYear === year ? "is-selected" : ""} onClick={() => selectAnnualYear(year)} key={year}><b>{year}</b><small>{getAnnualPillar(year).stem}</small></button>)}</div>
                      <div className="bazi-palace__gods">{palace.hiddenStems.map((stem) => <span key={stem}><b>{stem}</b><small>{getTenGod(chart.dayMaster.stem, stem)}</small></span>)}</div>
                      <footer><span>Tàng can</span><b>{palace.hiddenStems.join(" · ")}</b></footer>
                    </article>)}

                    <section className="bazi-palace-center">
                      <header><small>Mệnh chủ · {chartData.gender}</small><strong>{chartData.name}</strong><span>{chartData.date.split("-").reverse().join("/")} · {chartData.time} ({chart.calculation.appliedTime})</span></header>
                      <div className="bazi-center-pillars">
                        {chart.pillars.map((pillar, index) => <div key={`${pillar.stem}-${pillar.branch}-${index}-center`}><small>{["Năm", "Tháng", "Ngày", "Giờ"][index]}</small><b>{index === 2 ? "Nhật chủ" : pillarDetails[index].tenGod}</b><strong>{pillar.stem}</strong><em>{pillar.branch}</em><span>{pillarDetails[index].lifeStage}</span></div>)}
                      </div>
                      <dl>
                        <div><dt>Tiết khí</dt><dd>{chart.calculation.solarTerm}</dd></div>
                        <div><dt>Đại vận</dt><dd>{forward ? "Thuận hành" : "Nghịch hành"}</dd></div>
                        <div><dt>Khởi vận</dt><dd>{luck.start.year} năm {luck.start.month} tháng</dd></div>
                        <div><dt>Năm xem</dt><dd>{chartData.viewYear} · {annualPillar.stem} {annualPillar.branch}</dd></div>
                      </dl>
                    </section>
                  </div>
                </div>

                <details className="bazi-detail-table" open>
                  <summary><span><LayoutGrid size={16} /><b>Bảng Bát Tự chi tiết</b><small>Thập thần · Tàng can · Nạp âm · Trường sinh</small></span><ChevronRight size={16} /></summary>
                  <p className="bazi-scroll-hint"><MoveHorizontal size={14} />Vuốt ngang để xem đủ bốn trụ</p>
                  <div className="bazi-table-scroll" tabIndex={0} aria-label="Bảng Tứ trụ có thể cuộn ngang trên màn hình nhỏ">
                    <div className="bazi-matrix">
                      <div className="bazi-matrix__corner"><span>Nhật chủ</span><strong>{chart.dayMaster.stem}</strong><small>{chart.dayMaster.polarity} {chart.dayMaster.stemElement}</small></div>
                      {chart.pillars.map((pillar, index) => <div className="bazi-column-head" key={`head-${pillar.stem}-${index}`}><small>{[String(chartData.date.slice(0, 4)), `${Number(chartData.date.slice(5, 7))} · ÂL ${lunarBirth.month}`, `${Number(chartData.date.slice(8, 10))} · ÂL ${lunarBirth.day}`, `${chartData.time}${chartData.time !== chart.calculation.appliedTime ? ` (${chart.calculation.appliedTime})` : ""}`][index]}</small><strong>{["Năm", "Tháng", "Ngày", "Giờ"][index]}</strong></div>)}

                      <div className="bazi-row-label">Thập thần</div>
                      {pillarDetails.map((detail, index) => <div className="bazi-cell bazi-cell--god" key={`god-${index}`}>{index === 2 ? "Chủ" : shortTenGod(detail.tenGod)}</div>)}

                      <div className="bazi-row-label">Thiên can</div>
                      {chart.pillars.map((pillar, index) => <div className={`bazi-cell bazi-cell--stem element-text--${pillar.stemElement.toLowerCase()}`} key={`stem-${index}`}><small>{pillar.polarity} · {pillar.stemElement}</small><strong>{pillar.stem}</strong><ElementMark element={pillar.stemElement} /></div>)}

                      <div className="bazi-row-label">Địa chi</div>
                      {chart.pillars.map((pillar, index) => <div className={`bazi-cell bazi-cell--branch element-text--${pillar.branchElement.toLowerCase()}`} key={`branch-${index}`}><strong>{pillar.branch}</strong><small>{pillar.branchElement}</small></div>)}

                      {showHiddenStems && <><div className="bazi-row-label">Tàng can</div>
                      {pillarDetails.map((detail, index) => <div className="bazi-cell bazi-cell--hidden" key={`hidden-${index}`}>{detail.hiddenStems.map((stem) => <span key={stem}><b>{stem}</b><small>{shortTenGod(getTenGod(chart.dayMaster.stem, stem))}</small></span>)}</div>)}</>}

                      <div className="bazi-row-label">Nạp âm</div>
                      {pillarDetails.map((detail, index) => <div className="bazi-cell bazi-cell--compact" key={`nayin-${index}`}>{detail.naYin}</div>)}

                      <div className="bazi-row-label">Trường sinh</div>
                      {pillarDetails.map((detail, index) => <div className="bazi-cell bazi-cell--compact" key={`stage-${index}`}>{detail.lifeStage}</div>)}
                    </div>
                  </div>
                </details>

                <section className="bazi-destiny-summary" aria-label="Vượng suy, Dụng thần và Hỷ thần">
                  <article className={`is-${baziSupport.status === "Thân nhược" ? "weak" : baziSupport.status === "Thân vượng" ? "strong" : "balanced"}`}>
                    <small>Vượng suy Nhật chủ</small>
                    <strong>{baziSupport.status}</strong>
                    <span>{baziSupport.strengthScore}/100 · tháng lệnh {baziSupport.monthChiefElement} · {baziSupport.rootCount} chi thông căn</span>
                  </article>
                  <article className={`element-card--${baziSupport.usefulElement.toLowerCase()}`}>
                    <small>Dụng thần tham khảo</small>
                    <strong>{baziSupport.usefulElement}</strong>
                    <span>Ngũ hành ưu tiên để điều hòa mệnh cục</span>
                  </article>
                  <article className={`element-card--${baziSupport.joyElement.toLowerCase()}`}>
                    <small>Hỷ thần</small>
                    <strong>{baziSupport.joyElement}</strong>
                    <span>{baziSupport.explanation}</span>
                  </article>
                </section>

                <div className="bazi-paper__note"><span>Khởi vận</span><b>{luck.start.year} năm {luck.start.month} tháng {luck.start.day} ngày</b><p>{forward ? "Thuận hành" : "Nghịch hành"} từ trụ tháng · ba ngày quy một năm · năm luận {chartData.viewYear}</p></div>
                <div className="bazi-inline-fortune">
                  <div><small>Đại vận</small><strong>{forward ? "Thuận hành" : "Nghịch hành"}</strong><span>Khởi {luck.start.year} năm {luck.start.month} tháng</span></div>
                  <div className="bazi-inline-fortune__track">
                    {cycles.map((cycle, index) => <button type="button" key={`${cycle.stem}-${cycle.branch}-inline`} className={currentCycleIndex === index ? "is-current" : ""} onClick={() => selectAnnualYear(cycle.startYear)}><small>{cycle.startYear}–{cycle.endYear}<br />{cycle.from}–{cycle.to}t</small><b>{shortTenGod(getTenGod(chart.dayMaster.stem, cycle.stem))}</b><strong>{cycle.stem}<br />{cycle.branch}</strong>{showDaYunStars && <span>{getHiddenStems(cycle.branch).map((stem) => `${stem}·${shortTenGod(getTenGod(chart.dayMaster.stem, stem))}`).join(" ")}<br />{getLifeStage(chart.dayMaster.stem, cycle.branch)}</span>}</button>)}
                  </div>
                </div>

                <section className={`bazi-annual-ledger ${showAnnualBazi ? "is-detailed" : "is-compact"}`} aria-label="Lưu niên 96 năm">
                  <header><span><small>Lưu niên 96 năm</small><strong>Tứ Trụ và Bát Tự theo từng tuổi</strong></span><span>Dương {visibleYang} · Âm {visibleYin}</span></header>
                  <p className="bazi-scroll-hint"><MoveHorizontal size={14} />Vuốt ngang để xem đủ mười hai Địa chi</p>
                  <div className="bazi-annual-ledger__scroll" tabIndex={0}>
                    <div className="bazi-annual-ledger__grid">
                      {annualGroups.map((group) => <article key={group.branch}>
                        <header><strong>{group.branch}</strong><span>{getHiddenStems(group.branch).map((stem) => <small key={stem}><b>{stem}</b>{shortTenGod(getTenGod(chart.dayMaster.stem, stem))}</small>)}</span></header>
                        {group.years.map(({ year, age, pillar }) => <button type="button" className={chartData.viewYear === year ? "is-selected" : ""} onClick={() => selectAnnualYear(year)} key={year}><small>{age}t · {year}</small><strong>{pillar.stem}</strong><span>{shortTenGod(getTenGod(chart.dayMaster.stem, pillar.stem))}</span>{showAnnualBazi && <em>{pillar.stem} {pillar.branch} · {getHiddenStems(pillar.branch).join(" ")}</em>}</button>)}
                      </article>)}
                    </div>
                  </div>
                </section>
              </div>
              {showRelations && <section className="bazi-relation-strip" aria-label="Quan hệ Can Chi nguyên cục">
                <div><small>Quan hệ trong nguyên cục</small><strong>Hợp · Xung · Hình · Hại · Phá</strong></div>
                <div>{natalRelations.length ? natalRelations.map((relation, index) => <span className={`relation-chip relation-chip--${relation.kind}`} key={`${relation.label}-${index}`}><b>{relation.label}</b>{relation.members.join(" · ")}<small>{relation.system}</small></span>) : <p>Không hình thành bộ hợp, xung, hình hoặc hại hoàn chỉnh giữa bốn trụ.</p>}</div>
              </section>}
            </>}

            {baziView === "fortune" && <section className="bazi-fortune-view">
              <header className="bazi-section-title"><div><small>Vận trình theo chu kỳ</small><h2>Đại vận và Lưu niên</h2><p>Chọn một Đại vận để mở dải mười năm; năm đang luận được đánh dấu theo tuổi mụ.</p></div><span>{forward ? "Thuận hành" : "Nghịch hành"} · khởi {luck.start.year} năm {luck.start.month} tháng</span></header>
              <p className="fortune-scroll-hint"><MoveHorizontal size={14} />Vuốt để xem các Đại vận</p>
              <div className="bazi-cycle-selector" ref={cycleSelectorRef} role="list" aria-label="Các Đại vận thập niên">
                {cycles.map((cycle, index) => <button type="button" data-cycle-index={index} key={`${cycle.stem}-${cycle.branch}`} className={`${effectiveCycleIndex === index ? "is-selected" : ""} ${currentCycleIndex === index ? "is-current" : ""}`} onClick={() => selectLuckCycle(index)}><small>{cycle.from}–{cycle.to} tuổi</small><b>{getTenGod(chart.dayMaster.stem, cycle.stem)}</b><strong>{cycle.stem}<br />{cycle.branch}</strong><span>{cycle.startYear}–{cycle.endYear}</span>{currentCycleIndex === index && <i>Đương vận</i>}</button>)}
              </div>
              {selectedCycle && <>
                <div className="fortune-focus">
                  <article><small>Đại vận đang chọn</small><strong>{selectedCycle.stem} {selectedCycle.branch}</strong><span>{getTenGod(chart.dayMaster.stem, selectedCycle.stem)} · {getNaYin(selectedCycle)}</span><p>{selectedCycle.stemElement} khí hiển ở can vận, chi {selectedCycle.branch} thuộc {selectedCycle.branchElement}. Cần đọc cùng nguyên cục và Lưu niên, không tách riêng một trụ vận để kết luận.</p></article>
                  <article className="is-year"><small>Lưu niên {chartData.viewYear}</small><strong>{annualPillar.stem} {annualPillar.branch}</strong><span>{getTenGod(chart.dayMaster.stem, annualPillar.stem)} · {annualPillar.branchElement}</span><p>Năm luận vận tương ứng {ageInViewYear} tuổi mụ. Các quan hệ bên dưới chỉ mô tả cấu trúc Can Chi được kích hoạt.</p></article>
                  <div className="transit-relations"><small>Tương tác với nguyên cục</small>{transitRelations.length ? transitRelations.map((relation, index) => <span className={`relation-chip relation-chip--${relation.kind}`} key={`${relation.label}-transit-${index}`}><b>{relation.label}</b>{relation.members.join(" · ")}<small>{relation.system}</small></span>) : <p>Không có bộ hợp, xung, hình hoặc hại mới hoàn chỉnh ở lớp vận đang chọn.</p>}</div>
                </div>
                <div className="annual-strip-heading"><span><small>Mười năm thuộc Đại vận</small><b>{selectedCycle.stem} {selectedCycle.branch} · {selectedCycle.startYear}–{selectedCycle.endYear}</b></span><span><MoveHorizontal size={14} />Vuốt để chọn Lưu niên</span></div>
                <div className={`annual-year-grid ${showAnnualBazi ? "is-detailed" : "is-compact"}`} aria-label="Chọn Lưu niên trong Đại vận">
                  {annualYears.map(({ year, pillar }) => <button type="button" key={year} className={chartData.viewYear === year ? "is-selected" : ""} onClick={() => selectAnnualYear(year)}><small>{year}</small>{showAnnualBazi && <><strong>{pillar.stem} {pillar.branch}</strong><span>{getTenGod(chart.dayMaster.stem, pillar.stem)}</span></>}</button>)}
                </div>
              </>}
            </section>}

            {baziView === "analysis" && <section className="bazi-analysis-view">
              <header className="bazi-section-title"><div><small>Đọc cấu trúc nguyên cục</small><h2>Nhật chủ và phân bố khí</h2><p>Định lượng vượng suy theo phân bố khí, tháng lệnh và thông căn; Dụng thần, Hỷ thần hiển thị dưới dạng gợi ý để tiếp tục luận toàn cục.</p></div><span>Tháng lệnh · {chart.pillars[1].stem} {chart.pillars[1].branch}</span></header>
              <section className="bazi-support-profile">
                <div><small>Vượng suy Nhật chủ</small><strong>{baziSupport.status}</strong><span>{baziSupport.strengthScore}/100</span></div>
                <div><small>Dụng thần tham khảo</small><strong>{baziSupport.usefulElement}</strong><span>Ưu tiên điều hòa</span></div>
                <div><small>Hỷ thần</small><strong>{baziSupport.joyElement}</strong><span>Ngũ hành hỗ trợ</span></div>
                <p>{baziSupport.explanation} Chỉ báo đã xét tháng lệnh {baziSupport.monthChiefElement} và {baziSupport.rootCount} chi thông căn; khi luận đoán chuyên sâu vẫn cần đối chiếu hợp hóa và điều hậu.</p>
              </section>
              <div className="chart-analysis">
                <div className="element-balance">
                  <div className="analysis-title"><div><h3>Phân bố khí Ngũ hành</h3><p>Thiên can hiển lộ và Tàng can trong mỗi Địa chi được quy trọng số, tổng cộng tám đơn vị khí.</p></div><span>Hiển · Tàng</span></div>
                  <div className="element-bars">
                    {balance.map((item) => <div key={item.element}><span><ElementMark element={item.element} /><b>{item.element}</b><small>{item.count.toFixed(1)}/8</small></span><div><i className={`bar--${item.element.toLowerCase()}`} style={{ width: `${Math.max(item.percent, 4)}%` }} /></div></div>)}
                  </div>
                  <div className="balance-note"><span><b>Khí nổi trội · {strongest.element}</b>{ELEMENT_COPY[strongest.element]}</span><span><b>Khí ít hiện diện · {weakest.element}</b>{ELEMENT_COPY[weakest.element]}</span></div>
                </div>
                <div className="day-master-card">
                  <ElementMark element={chart.dayMaster.stemElement} />
                  <small>Nhật chủ</small>
                  <h3>{chart.dayMaster.stem} {chart.dayMaster.stemElement}</h3>
                  <p>{chart.dayMaster.polarity} khí. Nhật chủ là tâm quy chiếu để xác định Thập thần; mức vượng suy phải xét tháng lệnh, thông căn, thấu can và toàn cục.</p>
                  <dl><div><dt>Tháng lệnh</dt><dd>{chart.pillars[1].stem} {chart.pillars[1].branch}</dd></div><div><dt>Khí ít hiện diện</dt><dd>{weakest.element}</dd></div><div><dt>Chiều Đại vận</dt><dd>{forward ? "Thuận hành" : "Nghịch hành"}</dd></div></dl>
                </div>
              </div>
              <div className="relation-ledger">
                <div><small>Liên hệ nội cục</small><h3>Can Chi tương tác</h3><p>Quan hệ được nhận diện theo các bộ cổ điển; “có quan hệ” không đồng nghĩa tự thân là tốt hoặc xấu.</p></div>
                <div>{natalRelations.length ? natalRelations.map((relation, index) => <article key={`${relation.label}-ledger-${index}`}><span className={`relation-mark relation-mark--${relation.kind}`} /><small>{relation.system}</small><b>{relation.label}</b><strong>{relation.members.join(" · ")}</strong></article>) : <p>Nguyên cục không có bộ quan hệ hoàn chỉnh cần đánh dấu.</p>}</div>
              </div>
            </section>}

            {baziView === "ai" && <section className="bazi-ai-view">
              <div>
                <small>Trợ lý AI Luận giải</small>
                <h2>Tổng kết Markdown cho AI</h2>
                <p>Bản dữ liệu tổng hợp chi tiết theo từng loại lá số của <b>{chartData.name}</b> theo định dạng Markdown chuẩn cấu trúc. Bạn có thể chọn loại lá số bên dưới và sao chép để dán vào ChatGPT, Claude, Gemini hoặc DeepSeek để nhận bài luận giải chuyên sâu.</p>
                <div className="bazi-ai-category-selector" role="group" aria-label="Chọn loại lá số xuất AI">
                  <button
                    type="button"
                    className={aiChartCategory === "ziwei" ? "is-active" : ""}
                    onClick={() => setCustomAiCategory("ziwei")}
                  >
                    Lá số Tử Vi Đẩu Số
                  </button>
                  <button
                    type="button"
                    className={aiChartCategory === "bazi" ? "is-active" : ""}
                    onClick={() => setCustomAiCategory("bazi")}
                  >
                    Lá số Tứ Trụ Bát Tự
                  </button>
                  <button
                    type="button"
                    className={aiChartCategory === "halac" ? "is-active" : ""}
                    onClick={() => setCustomAiCategory("halac")}
                  >
                    Lá số Hà Lạc Bát Quái
                  </button>
                  <button
                    type="button"
                    className={aiChartCategory === "combined" ? "is-active" : ""}
                    onClick={() => setCustomAiCategory("combined")}
                  >
                    Bản Mệnh Tổng Hợp
                  </button>
                </div>
                <button className="button button--primary" onClick={copyChart}>
                  <ClipboardCopy size={17} />
                  <span>Sao chép Markdown {chartStyle === "Tứ Trụ" || aiChartCategory === "bazi" ? "Tứ Trụ" : aiChartCategory === "ziwei" ? `Tử Vi (${chartStyle})` : aiChartCategory === "halac" ? "Hà Lạc" : "Tổng Hợp"}</span>
                </button>
              </div>
              <label>
                <span>Nội dung Markdown ({chartStyle === "Tứ Trụ" || aiChartCategory === "bazi" ? "Tứ Trụ Bát Tự" : aiChartCategory === "ziwei" ? `Tử Vi Đẩu Số (${chartStyle})` : aiChartCategory === "halac" ? "Hà Lạc Bát Quái" : "Tổng Hợp"})</span>
                <textarea rows={18} readOnly value={chartAiMarkdown} aria-label="Dữ liệu Markdown lá số dành cho AI" />
              </label>
            </section>}

            {baziView === "notes" && <section className="bazi-notes-view">
              <div><small>Nhật ký luận đoán</small><h2>Ghi chú cho lá số {chartData.name}</h2><p>Ghi lại giả thuyết, mốc kiểm chứng hoặc câu hỏi cần xem tiếp. Nội dung chỉ lưu trong trình duyệt trên thiết bị này.</p></div>
              <label><span>Nội dung ghi chú</span><textarea rows={10} value={chartNotes} onChange={(event) => setChartNotes(event.target.value)} placeholder="Ví dụ: đối chiếu Đại vận hiện tại với mốc thay đổi công việc, nơi ở hoặc quan hệ gia đình…" /></label>
              <button className="button button--primary" onClick={saveChartNotes}><Save size={17} />Lưu ghi chú</button>
            </section>}
            </div>
            <MethodNote
              title="Cơ sở an lá số"
              points={[
                "Trụ năm đổi tại Lập Xuân; trụ tháng đổi tại 12 tiết khí, không đổi theo mùng một âm lịch.",
                `Giờ sinh ${chartData.time} được tính theo chế độ ${TIME_MODE_COPY[chartData.calculationMode].label.toLowerCase()} thành ${chart.calculation.appliedTime}; chênh kinh độ ${chart.calculation.correctionMinutes >= 0 ? "+" : ""}${Math.round(chart.calculation.correctionMinutes)} phút và phương trình thời gian ${chart.calculation.equationOfTimeMinutes >= 0 ? "+" : ""}${Math.round(chart.calculation.equationOfTimeMinutes)} phút.`,
                "Đại vận dùng thuận/nghịch theo âm dương năm sinh và giới tính; tuổi khởi vận lấy khoảng cách thực tới tiết khí gần nhất.",
                "Quan hệ Hợp–Xung–Hình–Hại và biểu đồ Ngũ hành là mô tả cấu trúc; không tự động đồng nghĩa với Dụng thần, Hỷ thần hay kết luận cát hung.",
              ]}
              sources={[
                { label: "Lịch pháp lunar-javascript · MIT", href: "https://github.com/6tail/lunar-javascript" },
                { label: "24 tiết khí · Hong Kong Observatory", href: "https://www.hko.gov.hk/en/gts/time/24solarterms.htm" },
                { label: "Can Chi 60 năm · Hong Kong Observatory", href: "https://www.hko.gov.hk/en/gts/time/stemsandbranches.htm" },
              ]}
            />
          </div>
          </div>
          </div>
          {configOpen && <section className="bazi-inline-config" aria-labelledby="bazi-config-title">
              <header className="bazi-config-drawer__header">
                <div><small>Thay đổi tới đâu · an lại tới đó</small><h2 id="bazi-config-title">Cấu hình lá số</h2></div>
                {!standaloneBazi && <button type="button" onClick={() => setConfigOpen(false)} aria-label="Thu gọn cấu hình"><ArrowUp size={20} /></button>}
              </header>
              <nav className="bazi-config-tabs" aria-label="Nhóm cấu hình" role="tablist">
                {([
                  ["time", Clock3, "Thời gian"],
                  ["chart", LayoutGrid, "Lá số"],
                  ["display", Eye, "Hiển thị"],
                  ["advanced", SlidersHorizontal, "Nâng cao"],
                ] as const).map(([key, Icon, label]) => <button type="button" role="tab" aria-selected={configTab === key} className={configTab === key ? "is-selected" : ""} key={key} onClick={() => setConfigTab(key)}><Icon size={18} /><span>{label}</span></button>)}
              </nav>

              <form className="bazi-config-form" onSubmit={submitChart}>
                <div className="bazi-config-scroll">
                  {configTab === "time" && <section className="bazi-config-panel">
                    <fieldset className="config-fieldset"><legend>Giới tính</legend><div className="config-segmented">
                      {(["Nam", "Nữ"] as const).map((gender) => <button type="button" key={gender} className={birthForm.gender === gender ? "is-selected" : ""} onClick={() => applyBirthPatch({ gender })}>{gender}</button>)}
                    </div></fieldset>
                    <fieldset className="config-fieldset"><legend>Thời gian</legend><div className="config-segmented">
                      <button type="button" className={configTimeTarget === "birth" ? "is-selected" : ""} onClick={() => setConfigTimeTarget("birth")}>Năm sinh</button>
                      <button type="button" className={configTimeTarget === "view" ? "is-selected" : ""} onClick={() => setConfigTimeTarget("view")}>Năm xem</button>
                    </div></fieldset>
                    <div className="config-time-summary">
                      <span><Clock3 size={17} /><b>{configTimeTarget === "birth" ? `${new Intl.DateTimeFormat("vi-VN", { weekday: "long", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(`${birthForm.date}T12:00:00Z`))} ${birthForm.date.replaceAll("-", "/")} - ${birthForm.time}` : `${birthForm.viewDate.replaceAll("-", "/")} - ${birthForm.viewTime} · ${getAnnualPillar(birthForm.viewYear).stem} ${getAnnualPillar(birthForm.viewYear).branch}`}</b></span>
                      <button type="button" onClick={() => applyBirthPatch(configBaseline)}><RotateCcw size={14} />Đặt lại</button>
                    </div>
                    {configTimeTarget === "birth" ? <div className="config-stepper-grid">
                      <ConfigStepper label="Năm" value={formYear} options={BAZI_YEAR_OPTIONS} onSelect={(value) => setBirthDatePart("year", Number(value))} onIncrease={() => changeBirthDate("year", 1)} onDecrease={() => changeBirthDate("year", -1)} />
                      <ConfigStepper label="Tháng" value={formMonth} options={BAZI_MONTH_OPTIONS} onSelect={(value) => setBirthDatePart("month", Number(value))} onIncrease={() => changeBirthDate("month", 1)} onDecrease={() => changeBirthDate("month", -1)} />
                      <ConfigStepper label="Ngày" value={formDay} options={Array.from({ length: new Date(Date.UTC(formYear, formMonth, 0)).getUTCDate() }, (_, index) => index + 1)} onSelect={(value) => setBirthDatePart("day", Number(value))} onIncrease={() => changeBirthDate("day", 1)} onDecrease={() => changeBirthDate("day", -1)} />
                      <ConfigStepper label="Giờ" value={String(formHour).padStart(2, "0")} options={BAZI_HOUR_OPTIONS} onSelect={(value) => setBirthTimePart("hour", Number(value))} onIncrease={() => changeBirthTime("hour", 1)} onDecrease={() => changeBirthTime("hour", -1)} />
                      <ConfigStepper label="Phút" value={String(formMinute).padStart(2, "0")} options={BAZI_MINUTE_OPTIONS} onSelect={(value) => setBirthTimePart("minute", Number(value))} onIncrease={() => changeBirthTime("minute", 1)} onDecrease={() => changeBirthTime("minute", -1)} />
                    </div> : <div className="config-stepper-grid">
                      <ConfigStepper label="Năm" value={viewFormYear} options={BAZI_YEAR_OPTIONS} onSelect={(value) => setViewDatePart("year", Number(value))} onIncrease={() => changeViewDate("year", 1)} onDecrease={() => changeViewDate("year", -1)} />
                      <ConfigStepper label="Tháng" value={viewFormMonth} options={BAZI_MONTH_OPTIONS} onSelect={(value) => setViewDatePart("month", Number(value))} onIncrease={() => changeViewDate("month", 1)} onDecrease={() => changeViewDate("month", -1)} />
                      <ConfigStepper label="Ngày" value={viewFormDay} options={Array.from({ length: new Date(Date.UTC(viewFormYear, viewFormMonth, 0)).getUTCDate() }, (_, index) => index + 1)} onSelect={(value) => setViewDatePart("day", Number(value))} onIncrease={() => changeViewDate("day", 1)} onDecrease={() => changeViewDate("day", -1)} />
                      <ConfigStepper label="Giờ" value={String(viewFormHour).padStart(2, "0")} options={BAZI_HOUR_OPTIONS} onSelect={(value) => setViewTimePart("hour", Number(value))} onIncrease={() => changeViewTime("hour", 1)} onDecrease={() => changeViewTime("hour", -1)} />
                      <ConfigStepper label="Phút" value={String(viewFormMinute).padStart(2, "0")} options={BAZI_MINUTE_OPTIONS} onSelect={(value) => setViewTimePart("minute", Number(value))} onIncrease={() => changeViewTime("minute", 1)} onDecrease={() => changeViewTime("minute", -1)} />
                    </div>}

                    <details className="config-location-disclosure">
                      <summary><span><MapPin size={17} /><span><b>Chọn địa điểm sinh</b><small>{birthForm.locationName}</small></span></span><ChevronRight size={16} /></summary>
                      <div className="config-location-disclosure__body">
                        <div className="config-location">
                          <LocationSearch value={birthForm} />
                        </div>
                        <fieldset className="config-fieldset config-fieldset--time-mode"><legend>Chuẩn giờ an trụ</legend>
                          {(Object.keys(TIME_MODE_COPY) as TimeCalculationMode[]).map((mode) => <button type="button" key={mode} className={birthForm.calculationMode === mode ? "is-selected" : ""} onClick={() => applyBirthPatch({ calculationMode: mode })}><span><b>{TIME_MODE_COPY[mode].label}</b><small>{TIME_MODE_COPY[mode].description}</small></span>{birthForm.calculationMode === mode && <CircleCheck size={17} />}</button>)}
                        </fieldset>
                      </div>
                    </details>
                  </section>}

                  {configTab === "chart" && <section className="bazi-config-panel">
                    <div className="config-section-heading"><small>Cấu hình lá số</small><h3>Kiểu lá số</h3></div>
                    <div className="config-chart-modes">
                      {BAZI_CHART_STYLES.map((style) => <button type="button" className={chartStyle === style ? "is-selected" : ""} onClick={() => setChartStyle(style)} key={style}><span><b>{style}</b></span>{chartStyle === style && <CircleCheck size={17} />}</button>)}
                    </div>
                    {["Trung Châu Phái", "Trung Châu Phái + Khâm Thiên", "Trung Châu Phái + Lương Phái"].includes(chartStyle) && <div className="config-option-card"><h3>Bàn Trung Châu</h3><ConfigChoiceGrid options={TRUNG_CHAU_TABLES} selected={trungChauTable} onSelect={setTrungChauTable} /></div>}
                    {isFourPillarsMode ? <div className="config-mode-note"><LayoutGrid size={20} /><span><b>Chế độ Tứ Trụ</b><p>Ẩn sao Tử Vi, phi hóa, phương viên lộc kị. Chỉ hiển thị vòng Lục Thập Hoa Giáp và Thập Thần theo từng năm.</p></span></div> : <>
                      <div className="config-option-card"><h3>Kiểu phi hóa</h3><ConfigChoiceGrid options={PHI_HOA_TYPES} colors={PHI_HOA_COLORS} selected={phiHoaType} onSelect={setPhiHoaType} /></div>
                      <div className="config-option-card"><h3>Tầng phi hóa</h3><ConfigChoiceGrid options={PHI_HOA_LAYERS} selected={phiHoaLayer} onSelect={setPhiHoaLayer} /></div>
                      <div className="config-option-card"><h3>Bảng tứ hóa</h3><ConfigChoiceGrid options={CAN_HOA_TABLES} selected={canHoaTable} onSelect={setCanHoaTable} /></div>
                    </>}
                  </section>}

                  {configTab === "display" && <section className="bazi-config-panel">
                    <div className="config-section-heading"><small>Hiển thị</small><h3>Tùy chỉnh hiển thị</h3></div>
                    <div className="config-toggle-list">
                      <ConfigToggle checked={showSolarDate} title="Hiện dương lịch" description="Hiển thị ngày dương trên lá số" onChange={() => setShowSolarDate(!showSolarDate)} />
                      {!isFourPillarsMode && <ConfigToggle checked={showDaYunStars} title="Sao lưu đại vận" description="Hiển thị sao lưu theo đại vận" onChange={() => setShowDaYunStars(!showDaYunStars)} />}
                    </div>
                    {!isFourPillarsMode && <><div className="config-option-card"><h3>Hiện sao lưu</h3><ConfigChoiceGrid options={CURRENT_STAR_MODES} selected={currentStarMode} onSelect={setCurrentStarMode} /></div><div className="config-option-card"><h3>Hiện sao theo nhóm</h3><ConfigChoiceGrid options={STAR_GROUP_MODES} selected={starGroupMode} onSelect={setStarGroupMode} /></div></>}
                  </section>}

                  {configTab === "advanced" && <section className="bazi-config-panel">
                    <div className="config-section-heading"><small>Nâng cao</small><h3>Hiển thị nâng cao</h3></div>
                    <div className="config-toggle-list">
                      {!isFourPillarsMode && <>
                        <ConfigToggle checked={showLocKiCycle} title="Tuần hoàn lộc kị" description="Hiển thị vòng tuần hoàn lộc kị" onChange={() => setShowLocKiCycle(!showLocKiCycle)} />
                        <ConfigToggle checked={showOverlappingPalaces} title="Cung vị trùng điệp" description="Hiển thị cung vị trùng điệp" onChange={() => setShowOverlappingPalaces(!showOverlappingPalaces)} />
                        <ConfigToggle checked={showFullLocKi} title="Lộc kị toàn đồ" description="Phương viên lộc kị toàn đồ" onChange={() => setShowFullLocKi(!showFullLocKi)} />
                      </>}
                      <ConfigToggle checked={showAnnualBazi} title="Bát tự từng năm" description="Hiện bát tự chi tiết từng năm" onChange={() => setShowAnnualBazi(!showAnnualBazi)} />
                    </div>
                  </section>}
                </div>
                <footer className="bazi-config-drawer__footer">
                  <span><small>Lá số đã đồng bộ</small><b>{birthForm.date.split("-").reverse().join("/")} · {birthForm.time} · {chart.calculation.appliedTime}</b></span>
                  <span className={`config-live-pill ${chartIsUpdating ? "is-updating" : ""}`}>{chartIsUpdating ? <Clock3 size={16} /> : <CircleCheck size={16} />}{chartIsUpdating ? "Đang an lại lá số" : "Cập nhật trực tiếp"}</span>
                </footer>
              </form>
            </section>}
        </section>}

        {activeTool === "calendar" && <section className="tool-section tool-page calendar-section view-panel" id="calendar" role="tabpanel">
          <ToolIntro
            icon={CalendarDays}
            title="Xem ngày giờ tốt xấu"
            description="Chọn một ngày để đối chiếu Can Chi, tuổi người xem, tiết khí, Thần trực Hoàng–Hắc đạo, Thập nhị Trực, Nhị thập bát tú và mười hai thời thần. Có thể bật thêm Moon VOC như một lớp tham khảo chiêm tinh phương Tây độc lập."
            highlights={["Ghim tuổi cố định", "Mười hai thời thần", "Bộ lọc Moon VOC"]}
          />
          <div className="calendar-workspace">
            <div className={`month-panel ${calendarBirthDate ? "has-fixed-age" : ""}`}>
              <div className="month-nav"><button onClick={() => moveMonth(-1)} aria-label="Tháng trước"><ChevronLeft size={19} /></button><div><small>Tháng dương lịch</small><strong>Tháng {calendarView.monthIndex + 1} / {calendarView.year}</strong></div><button onClick={() => moveMonth(1)} aria-label="Tháng sau"><ChevronRight size={19} /></button></div>
              <div className="lunar-phase-key" aria-hidden="true"><span>Sóc</span><i /><span>Thượng huyền</span><i /><span>Vọng</span><i /><span>Hạ huyền</span></div>
              <div className="weekdays">{["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map((day) => <span key={day}>{day}</span>)}</div>
              <div className="month-grid">
                {Array.from({ length: calendar.offset }, (_, index) => <span className="empty-day" key={`empty-${index}`} />)}
                {calendarDays.map(({ day, date, profile, moonVoc, energyScore, lunar, observances, personal }) => {
                  const selected = selectedDate === date;
                  const today = initialToday === date;
                  const quality = calendarQuality(energyScore);
                  const personalLabel = personal ? `, theo tuổi ${personal.score} trên 100, ${personal.verdict}` : "";
                  const vocLabel = showMoonVoc && moonVoc.hasVoidOfCourse ? ", có Moon VOC" : "";
                  const observanceLabel = observances.map((item) => item.name).join(" · ");
                  return <button key={date} className={`${selected ? "is-selected" : ""} ${today ? "is-today" : ""} quality-${quality.key} ${observances.length ? "has-observance" : ""} ${showMoonVoc && moonVoc.hasVoidOfCourse ? "has-moon-voc" : ""}`} onClick={() => setSelectedDate(date)} aria-label={`Ngày ${day}, âm lịch ${lunar.day} tháng ${lunar.month}, ${quality.label}, ${quality.stars} sao${observanceLabel ? `, ${observanceLabel}` : ""}${personalLabel}${vocLabel}`}><span className="solar-day">{day}</span><span className="lunar-day">ÂL {lunar.day}/{lunar.month}</span>{observanceLabel && <span className="calendar-observance" title={observanceLabel}>{observanceLabel}</span>}<span className="calendar-quality-stars" title={`${quality.label} · ${quality.stars} sao`} aria-hidden="true">{"★".repeat(quality.stars)}</span><small>Trực {profile.dayOfficer} · Sao {profile.lunarMansion}</small>{showMoonVoc && moonVoc.hasVoidOfCourse && <em className="calendar-voc-dot" title="Có Moon VOC"><Moon size={11} /></em>}{personal && <span className={`calendar-age-score ${personal.score >= 64 ? "is-good" : personal.score < 48 ? "is-caution" : ""}`}>{personal.score}<small>/100 theo tuổi</small></span>}{today && <em>nay</em>}</button>;
                })}
              </div>
              <div className="calendar-legend calendar-quality-legend"><span><i className="is-excellent" />H.Đạo (Tốt)</span><span><i className="is-good" />H.Đạo (Khá)</span><span><i className="is-normal" />Bình Thường</span><span><i className="is-bad" />Xấu</span><span><i className="is-very-bad" />Rất Xấu</span>{showMoonVoc && <span className="moon-legend"><i className="is-moon-voc" />Moon VOC</span>}{calendarBirthDate && <span className="age-legend"><i /> Điểm riêng theo tuổi</span>}</div>
            </div>

            <section className="calendar-modebar" aria-label="Tùy chọn hiển thị lịch cát hung">
              <div><small>Tùy chọn hiển thị cát hung</small><strong>Kết hợp các lớp tham khảo</strong></div>
              <label className="is-locked"><input type="checkbox" checked disabled /><span><b>Bộ lọc phương Đông</b><small>Trực · Tú · Cát tinh · Hung tinh</small></span></label>
              <label><input type="checkbox" checked={showHourMode} onChange={(event) => setShowHourMode(event.target.checked)} /><span><b>Chế độ xem giờ</b><small>Điểm và chỉ dấu 12 thời thần</small></span></label>
              <label><input type="checkbox" checked={showActionAdvice} onChange={(event) => setShowActionAdvice(event.target.checked)} /><span><b>Hiện lời khuyên hành động</b><small>Điểm riêng theo từng công việc</small></span></label>
              <label><input type="checkbox" checked={showAgeRelations} onChange={(event) => setShowAgeRelations(event.target.checked)} /><span><b>Hiện tuổi xung / tuổi hợp</b><small>Đối chiếu đủ vòng Lục thập hoa giáp</small></span></label>
              <label><input type="checkbox" checked={showMoonVoc} onChange={(event) => setShowMoonVoc(event.target.checked)} /><span><b>Bộ lọc chiêm tinh học</b><small>Moon VOC theo giờ Việt Nam</small></span></label>
              <label><input type="checkbox" checked={applyWesternWarnings} onChange={(event) => setApplyWesternWarnings(event.target.checked)} /><span><b>Bộ lọc ngày xấu phương Tây</b><small>Đánh dấu cảnh báo, không đổi điểm lịch pháp</small></span></label>
              <span className={`fixed-age-mode ${calendarBirthDate ? "is-active" : ""}`}><CalendarDays size={16} /><span><b>{calendarBirthDate ? `Tuổi ${personalDayCompatibility?.birthYearPillar.stem} ${personalDayCompatibility?.birthYearPillar.branch}` : "Chưa chọn tuổi"}</b><small>{calendarAgePinned ? "Đang ghim trên thiết bị" : calendarBirthDate ? "Áp dụng trong phiên này" : "Chọn ở phần phân tích ngày"}</small></span></span>
            </section>

            <section className="day-panel" aria-label={`Phân tích ngày ${selectedDate}`}>
              <div className="reference-day-summary">
                <section className="reference-date-card" aria-label="Lịch Vạn Sự">
                  <header>
                    <button type="button" onClick={() => moveSelectedDay(-1)} aria-label="Ngày trước"><ChevronLeft size={22} /></button>
                    <div><small>Lịch Vạn Sự</small><strong>{formatLongDate(selectedDate).split(",")[0]}</strong></div>
                    <button type="button" onClick={() => moveSelectedDay(1)} aria-label="Ngày sau"><ChevronRight size={22} /></button>
                  </header>
                  <div className={`reference-solar-date energy-tone--${selectedEnergyQuality.key}`}>
                    <time dateTime={selectedDate}>{selectedDay}</time>
                    <span>Tháng {selectedMonth} / {selectedYear}</span>
                    <div className="reference-energy-meter">
                      <div><small>Năng Lượng (Tổng Quan)</small><b>{formatPercent(selectedEnergyScore)}%</b></div>
                      <i><span style={{ width: `${selectedEnergyScore}%` }} /></i>
                      <p><span>Đại Hung</span><span>Bình Hòa</span><span>Đại Cát</span></p>
                    </div>
                    <div className="reference-profile-pills">
                      <span><MapPin size={12} />Hà Nội, Việt Nam</span>
                      <button type="button" onClick={() => document.getElementById("calendar-birth-date")?.focus()}><CalendarDays size={12} />{calendarBirthDate ? `Tuổi ${personalDayCompatibility?.birthYearPillar.stem} ${personalDayCompatibility?.birthYearPillar.branch} · ${calendarBirthTime}` : "Nhập ngày, giờ sinh"}</button>
                    </div>
                  </div>
                  <div className="reference-lunar-date">
                    <small>Âm Lịch năm <b>{selectedProfile.yearPillar.stem} {selectedProfile.yearPillar.branch}</b></small>
                    <div><strong>{selectedProfile.lunarDate.day}</strong><i>/</i><span>{selectedProfile.lunarDate.month}</span></div>
                    {selectedObservances.length > 0 && <section className="reference-observances" aria-label="Ngày lễ và sự kiện">
                      {selectedObservances.map((observance) => <article key={`${observance.type}-${observance.name}`}>
                        <b>{observance.name}</b><span>{observance.description}</span>
                      </article>)}
                    </section>}
                    <dl>
                      <div><dt>Năm</dt><dd>{selectedProfile.yearPillar.stem} {selectedProfile.yearPillar.branch}</dd></div>
                      <div><dt>Tháng</dt><dd>{selectedProfile.monthPillar.stem} {selectedProfile.monthPillar.branch}</dd></div>
                      <div><dt>Ngày</dt><dd>{selectedProfile.pillar.stem} {selectedProfile.pillar.branch}</dd></div>
                    </dl>
                  </div>
                  <div className="reference-hour-wheel-wrap">
                    <h3>Giờ Hoàng Đạo</h3>
                    <svg className="reference-hour-wheel" viewBox="0 0 320 320" role="img" aria-label="Vòng phân loại mười hai giờ">
                      <circle className="reference-hour-wheel__track" cx="160" cy="160" r="103" />
                      {selectedProfile.hours.map((hour, index) => {
                        const centerAngle = 90 + index * 30;
                        const labelPoint = circlePoint(125, centerAngle);
                        const moonVoc = showMoonVoc && overlapsMoonVoc(selectedMoonVoc.intervals, selectedSolarTime.hourRanges[index].startMinute, selectedSolarTime.hourRanges[index].endMinute);
                        return <g className={`hour-segment quality-${hourQuality(hour)}`} key={`wheel-${hour.branch}`}>
                          <title>{`${hour.stem} ${hour.branch} · ${formatPercent(hour.score)} điểm`}</title>
                          <path d={donutSegment(centerAngle - 14.2, centerAngle + 14.2)} />
                          <text x={labelPoint.x} y={labelPoint.y} textAnchor="middle" dominantBaseline="middle">{hour.branch}{hour.auspicious ? " ★" : ""}</text>
                          {moonVoc && <circle className="hour-segment__voc" cx={circlePoint(78, centerAngle).x} cy={circlePoint(78, centerAngle).y} r="4.5" />}
                        </g>;
                      })}
                      <circle className="reference-hour-wheel__center" cx="160" cy="160" r="53" />
                      <text className="reference-hour-wheel__center-label" x="160" y="160" textAnchor="middle" dominantBaseline="middle">12 Giờ</text>
                    </svg>
                    <p className="reference-hour-wheel-legend"><span><i className="is-excellent" />H.Đạo (Tốt)</span><span><i className="is-good" />H.Đạo (Khá)</span><span><i className="is-normal" />Bình Thường</span><span><i className="is-bad" />Xấu</span><span><i className="is-very-bad" />Rất Xấu</span><span><i className="is-moon-voc" />Moon VOC</span></p>
                    <small>Chính ngọ địa phương {selectedSolarTime.solarNoonLabel} · UTC+7</small>
                  </div>
                </section>

                <section className="reference-day-reading" aria-label="Luận giải cát hung">
                  <header className={`energy-tone--${selectedEnergyQuality.key}`}><div><h2>{selectedEnergyLabel}</h2><span>{formatPercent(selectedEnergyScore)} điểm</span></div><blockquote>“{selectedProfile.energyQuote}”</blockquote></header>
                  <div className="reference-day-facts">
                    <article><small>Trực</small><h3>{selectedProfile.dayOfficer}</h3><p>{selectedProfile.officerDescription}</p></article>
                    <article><small>Nhị Thập Bát Tú</small><h3>{selectedProfile.lunarMansion}</h3><p>{selectedProfile.mansionDescription}</p></article>
                  </div>
                  <div className="reference-star-columns">
                    <section className="is-good"><h3>Cát Tinh (Sao Tốt)</h3>{selectedProfile.goodStarDetails.map((star) => <article key={star.name}><b>{star.name}</b><p>{star.description}</p></article>)}</section>
                    <section className="is-bad"><h3>Hung Tinh (Sao Xấu)</h3>{selectedProfile.badStarDetails.map((star) => <article key={star.name}><b>{star.name}</b><p>{star.description}</p></article>)}</section>
                  </div>
                  <section className="personal-day-check reference-personal-day-check" aria-label="Đối chiếu ngày với tuổi người xem">
                    <header>
                      <div><small>Tuổi cố định cho cả lịch</small><h3>Ngày này có hợp với người xem?</h3><p>Chọn ngày sinh một lần để đối chiếu tuổi với mọi ngày trong tháng.</p></div>
                      <div className="personal-day-input">
                        <label htmlFor="calendar-birth-date">Ngày sinh dương lịch</label>
                        <input id="calendar-birth-date" type="date" value={calendarBirthDate} max={initialToday} onChange={(event) => setCalendarBirthDate(event.target.value)} />
                        <label htmlFor="calendar-birth-time">Giờ sinh (Việt Nam · UTC+7)</label>
                        <input id="calendar-birth-time" type="time" value={calendarBirthTime} onChange={(event) => setCalendarBirthTime(event.target.value)} />
                        <button type="button" onClick={useChartProfileForCalendar}>Dùng hồ sơ {chartData.name}</button>
                        <button type="button" className={calendarAgePinned ? "is-pinned" : ""} onClick={toggleCalendarAgePin}>{calendarAgePinned ? "Đã ghim tuổi này" : "Ghim tuổi này"}</button>
                        {calendarBirthDate && <button type="button" className="is-clear" onClick={() => { setCalendarBirthDate(""); setCalendarBirthTime("12:00"); setCalendarAgePinned(false); }}>Bỏ tuổi đang xem</button>}
                      </div>
                    </header>
                    {personalDayCompatibility ? <div className={`personal-day-result is-${personalDayCompatibility.verdict === "Xung tuổi" ? "caution" : personalDayCompatibility.score >= 64 ? "favorable" : "neutral"}`}>
                      <span className="personal-score" style={{ "--personal-score": `${personalDayCompatibility.score * 3.6}deg` } as React.CSSProperties}><b>{personalDayCompatibility.score}</b><small>/ 100</small></span>
                      <div className="personal-verdict"><small>Tuổi {personalDayCompatibility.birthYearPillar.stem} {personalDayCompatibility.birthYearPillar.branch} · giờ {personalDayCompatibility.birthHourPillar.stem} {personalDayCompatibility.birthHourPillar.branch} · {personalDayCompatibility.lunarAge} tuổi mụ</small><h4>{personalDayCompatibility.verdict}</h4><p>Đối chiếu ngày với ngày và giờ sinh cố định của người xem tại Việt Nam (UTC+7).</p></div>
                      <div className="personal-reasons">{personalDayCompatibility.reasons.map((reason) => <article className={`is-${reason.tone}`} key={reason.label}><b>{reason.label}</b><span>{reason.detail}</span></article>)}</div>
                    </div> : <div className="personal-day-empty"><CalendarDays size={18} /><span><b>Nhập thông tin để xem dự báo chi tiết cho tuổi của bạn</b><small>Có thể dùng nhanh hồ sơ lá số hiện tại.</small></span></div>}
                  </section>
                  {showAgeRelations && <section className="calendar-age-relations reference-inline-age" aria-label="Tuổi hợp và tuổi xung của ngày">
                    <header><div><small>Đối chiếu Lục thập hoa giáp</small><h3>Tuổi Hợp · Tuổi Không Hợp Ngày</h3></div><span>{selectedAgeRelations.conflicting.length + selectedAgeRelations.favorable.length} kết quả</span></header>
                    <div className="calendar-age-relations__grid">
                      <article className="is-conflicting"><h4><CircleAlert size={16} />Tuổi Không Hợp Ngày</h4><p>{selectedAgeRelations.conflicting.map((age) => <span className={selectedAgeRelations.conflictingEmphasis.includes(age) ? "is-emphasis" : ""} key={age}>{age}</span>)}</p></article>
                      <article className="is-favorable"><h4><CircleCheck size={16} />Tuổi Hợp Ngày</h4><p>{selectedAgeRelations.favorable.map((age) => <span className={selectedAgeRelations.favorableEmphasis.includes(age) ? "is-emphasis" : ""} key={age}>{age}</span>)}</p></article>
                    </div>
                  </section>}
                  {showMoonVoc && <section className={`moon-voc-panel reference-inline-moon-voc ${selectedMoonVoc.hasVoidOfCourse ? "is-active" : "is-clear"}`} aria-label="Bộ lọc Moon VOC">
                    {selectedMoonVoc.hasVoidOfCourse ? <div className="reference-moon-voc-alert">
                      <h3>Cảnh báo: Mặt Trăng Vô Hướng (Moon Void of Course) Moon VOC</h3>
                      <p className="reference-moon-voc-impact">Ảnh hưởng trong {selectedMoonVoc.intervals.length > 1 ? "các khoảng" : "khoảng"} thời gian: <strong>{selectedMoonVoc.intervals.map((interval) => `${interval.displayRange.replace("–", " → ")} (vào ${interval.nextSign})`).join(", ")}</strong></p>
                      <p>Theo Chiêm tinh học, thời gian này mang năng lượng không định hướng, sự việc dễ đi chệch quỹ đạo. Không nên đưa ra quyết định quan trọng, bắt đầu việc mới hay ký kết hợp đồng. Đây là thời điểm thích hợp để nghỉ ngơi, dọn dẹp, nhìn nhận lại bản thân hoặc hoàn thiện các công việc đang dang dở.</p>
                      <p className="reference-moon-voc-note">Phần này kết hợp tránh cả thời gian xấu của chiêm tinh và phương tây, nếu bạn chỉ tránh ngày xấu phương đông có thể bỏ check ở trên.</p>
                    </div> : <div className="moon-voc-panel__copy">
                      <small>Bộ lọc chiêm tinh phương Tây</small>
                      <h3>Không có Moon VOC trong ngày</h3>
                      <p>Không có khung giờ Mặt Trăng vô hướng cần đánh dấu trong ngày.</p>
                      <span className={`western-filter-state ${applyWesternWarnings ? "is-applied" : ""}`}>{applyWesternWarnings ? "Bộ lọc phương Tây đang bật · không có cảnh báo" : "Chỉ hiển thị tham khảo"}</span>
                    </div>}
                  </section>}
                  <dl className="reference-day-meta">
                    <div><dt>Tiết khí</dt><dd>{getSolarTerm(selectedDate)}</dd></div>
                    <div><dt>Thần trực</dt><dd>{selectedProfile.dayOfficerName} · {selectedProfile.dayOfficerType}</dd></div>
                    <div><dt>Vị trí</dt><dd>Hà Nội · UTC+7</dd></div>
                    <div><dt>Moon VOC</dt><dd>{selectedMoonVoc.hasVoidOfCourse ? "Có trong ngày" : "Không có"}</dd></div>
                  </dl>
                </section>
              </div>

              {showHourMode && <section className="hour-analysis">
                <div className="analysis-title"><div><h3>Mười hai giờ trong ngày</h3><p>Giờ Tý được hiệu chỉnh theo chính ngọ {selectedSolarTime.solarNoonLabel} tại Hà Nội. Dấu sao chỉ giờ Hoàng đạo.</p></div><span>UTC+7 · chính ngọ {selectedSolarTime.solarNoonLabel}</span></div>
                <div className="hour-grid">
                  {selectedProfile.hours.map((hour, index) => {
                    const solarRange = selectedSolarTime.hourRanges[index];
                    const touchesMoonVoc = overlapsMoonVoc(selectedMoonVoc.intervals, solarRange.startMinute, solarRange.endMinute);
                    const adjustedScore = hour.score;
                    const showVocMark = showMoonVoc && touchesMoonVoc;
                    return <article className={`${hour.auspicious ? "is-auspicious" : "is-inauspicious"} ${showVocMark ? "is-moon-voc" : ""}`} key={`${hour.stem}-${hour.branch}`} style={{ "--hour-delay": `${index * 30}ms`, "--hour-score": `${adjustedScore}%` } as React.CSSProperties}>
                      <div><span>{hour.auspicious ? <Star size={13} fill="currentColor" /> : <CircleAlert size={13} />}{hour.auspicious ? "Hoàng đạo" : "Hắc đạo"}</span><b>{hour.officer}</b></div>
                      <span className="hour-energy-score">{formatPercent(adjustedScore)}%</span>
                      <h4>{hour.stem} {hour.branch}</h4><time>{solarRange.displayRange}{solarRange.crossesDayBoundary && <small> · qua ngày</small>}</time>
                      <i className="hour-energy-bar" />
                      <ul className="hour-signals">
                        <li className={hour.sixRen.tone === "good" ? "is-good" : "is-caution"}>{hour.sixRen.tone === "good" ? <CircleCheck size={12} /> : <CircleAlert size={12} />}{hour.sixRen.name}</li>
                        <li className={hour.auspicious ? "is-good" : "is-caution"}>{hour.auspicious ? <CircleCheck size={12} /> : <CircleAlert size={12} />}{hour.auspicious ? "Giờ Hoàng đạo" : "Giờ Hắc đạo"} · {hour.officer}</li>
                        {hour.isNoble && <li className="is-good"><CircleCheck size={12} />Giờ Quý Nhân</li>}
                        {hour.isVoid && <li className="is-caution"><CircleAlert size={12} />Không Vong</li>}
                        {hour.isDayClash && <li className="is-caution"><CircleAlert size={12} />Nhật Phá · giờ {hour.branch} xung ngày</li>}
                      </ul>
                      <p><small>Hợp</small>{hour.yi.join(" · ")}</p>
                      {showVocMark && <em className="hour-voc-badge"><Moon size={12} />Moon VOC · sang {selectedMoonVoc.intervals.find((interval) => overlapsMoonVoc([interval], solarRange.startMinute, solarRange.endMinute))?.nextSign}</em>}
                    </article>;
                  })}
                </div>
              </section>}

              <section className="day-directions reference-day-directions"><h3><Navigation size={17} />Hợp · Xung · Phương vị</h3><dl><div><dt>Lục hợp · Tam hợp</dt><dd>{selectedProfile.compatibleAges.join(" · ")}</dd></div><div><dt>Xung · Hại</dt><dd>{selectedProfile.conflictingAges.join(" · ")}</dd></div><div><dt>Hỷ / Tài thần</dt><dd>{selectedProfile.joyDirection} / {selectedProfile.wealthDirection}</dd></div><div><dt>Xung sát</dt><dd>{selectedProfile.clashDescription} · sát {selectedProfile.shaDirection}</dd></div></dl></section>

              <section className="day-prescriptions">
                <div><h3><CircleCheck size={17} />Việc nên</h3><p>{selectedProfile.dayYi.map((item) => <span key={item}>{item}</span>)}</p></div>
                <div><h3><Ban size={17} />Việc kỵ</h3><p>{selectedProfile.dayJi.map((item) => <span key={item}>{item}</span>)}</p></div>
              </section>

              {showActionAdvice && <section className="activity-analysis">
                <header className="activity-analysis__heading"><span /><h3>Lời Khuyên Hành Động</h3><span /></header>
                <p className="activity-analysis__summary">Cát thần và hung thần được đối chiếu riêng cho từng loại việc.</p>
                <div className="activity-advice-groups">
                  {[
                    { status: "suitable", title: "Việc nên làm" },
                    { status: "neutral", title: "Việc cần cân nhắc" },
                    { status: "avoid", title: "Việc cần tránh" },
                  ].map((group) => {
                    const groupActivities = selectedProfile.activities.filter((activity) => activity.status === group.status);
                    if (!groupActivities.length) return null;
                    return <section className={`activity-advice-group is-${group.status}`} key={group.status} aria-label={group.title}>
                      <h4>{group.title}</h4>
                      <div className="activity-list">
                        {groupActivities.map((activity) => {
                          const activityGoodStars = activity.goodStars || selectedProfile.goodStars.join(", ") || "Không ghi nhận cát thần riêng";
                          const activityBadStars = activity.badStars || selectedProfile.badStars.join(", ") || "Không ghi nhận hung thần riêng";
                          return <article className={`activity-card is-${activity.status}`} key={activity.name} aria-label={`${activity.name}, ${formatPercent(activity.score)} phần trăm`}>
                            <header><h5>{activity.name}</h5><strong>{formatPercent(activity.score)}%</strong></header>
                            <dl>
                              <div><dt>Cát Thần:</dt><dd>{activityGoodStars}</dd></div>
                              <div><dt>Hung Thần:</dt><dd>{activityBadStars}</dd></div>
                            </dl>
                            {activity.goodHours?.length ? <p><b>Giờ tốt:</b> {activity.goodHours.join(", ")}.</p> : null}
                          </article>;
                        })}
                      </div>
                    </section>;
                  })}
                </div>
              </section>}
            </section>
          </div>
          <MethodNote
            title="Cơ sở tra ngày"
            points={[
              "Nhãn tổng quan tổng hợp Trực, Nhị thập bát tú, cát tinh, hung tinh và các ngày kỵ dân gian; không còn suy ra chỉ bằng cách đếm ba dấu hiệu.",
              "Danh sách việc cần tránh, tuổi hợp–không hợp và mười hai thời thần được đối chiếu theo đúng cấu trúc dữ liệu của trang mẫu.",
              "Các hệ chọn ngày có thể cho kết luận khác nhau. Khi làm việc hệ trọng, nên ưu tiên loại việc cụ thể và đối chiếu thêm tuổi người chủ sự.",
              "Moon VOC là bộ lọc chiêm tinh phương Tây độc lập: dùng góc chính với Mặt Trời, Sao Thủy, Sao Kim, Sao Hỏa, Sao Mộc và Sao Thổ trước khi Mặt Trăng đổi cung.",
            ]}
            sources={[
              { label: "Lịch pháp lunar-javascript · MIT", href: "https://github.com/6tail/lunar-javascript" },
              { label: "Thiên văn Astronomy Engine · MIT", href: "https://github.com/cosinekitty/astronomy" },
              { label: "Bảng chuyển đổi lịch · Hong Kong Observatory", href: "https://www.hko.gov.hk/en/gts/time/conversion.htm" },
              { label: "24 tiết khí · Hong Kong Observatory", href: "https://www.hko.gov.hk/en/gts/time/24solarterms.htm" },
            ]}
          />
        </section>}

        {activeTool === "sim" && <section className="tool-section tool-page sim-section view-panel" id="sim" role="tabpanel">
          <Suspense fallback={<div className="sim-loading" role="status">Đang mở bộ luận giải sim…</div>}>
            <SimPhongThuyView
              initialPhone={initialSimParams?.so ?? ""}
              initialDay={initialSimParams?.ngay}
              initialMonth={initialSimParams?.thang}
              initialYear={initialSimParams?.nam}
              initialHour={initialSimParams?.gio}
              initialMinute={initialSimParams?.phut}
              initialDate={initialSimParams?.nam && initialSimParams?.thang && initialSimParams?.ngay ? `${initialSimParams.nam}-${String(initialSimParams.thang).padStart(2, '0')}-${String(initialSimParams.ngay).padStart(2, '0')}` : undefined}
              initialTime={initialSimParams?.gio && initialSimParams?.phut ? `${String(initialSimParams.gio).padStart(2, '0')}:${String(initialSimParams.phut).padStart(2, '0')}` : undefined}
              initialGender={initialSimParams?.gioitinh ? (initialSimParams.gioitinh.toLowerCase().includes("nữ") || initialSimParams.gioitinh.toLowerCase() === "nu" ? "Nữ" : "Nam") : (initialSimParams?.nam ? birthForm.gender : undefined)}
              initialCalendarType={initialSimParams?.lich?.toLowerCase() === "al" ? "lunar" : "solar"}
              initialLunarLeapMonth={initialSimParams?.nhuan === "1" || initialSimParams?.nhuan?.toLowerCase() === "true"}
            />
          </Suspense>
        </section>}
      </main>

      {!standaloneBazi && (
        <>
          <footer><div><BrandMark compact /><span><strong>Mệnh Thư</strong><small>Kinh Dịch · Tứ Trụ · Lịch Cát Hung · Sim Phong Thủy</small></span></div><p>Được xây dựng cho người Việt yêu mệnh lý phương Đông.</p><button onClick={() => goTo("home")}>Về tổng quan <ArrowUp size={14} /></button></footer>

          <nav className="mobile-nav" aria-label="Điều hướng di động">
            <button className={activeTool === "home" ? "is-active" : ""} onClick={() => goTo("home")}><Home size={19} /><span>Tổng quan</span></button>
            <button className={activeTool === "iching" ? "is-active" : ""} onClick={() => goTo("iching")}><Coins size={19} /><span>Gieo quẻ</span></button>
            <button className={activeTool === "bazi" ? "is-active" : ""} onClick={() => goTo("bazi")}><LayoutGrid size={19} /><span>Tứ trụ</span></button>
            <button className={activeTool === "calendar" ? "is-active" : ""} onClick={() => goTo("calendar")}><CalendarDays size={19} /><span>Ngày tốt</span></button>
            <button className={activeTool === "sim" ? "is-active" : ""} onClick={() => goTo("sim")}><Phone size={19} /><span>Sim số</span></button>
          </nav>
        </>
      )}
      <div className={`toast ${toast ? "is-visible" : ""}`} role="status">{toast}</div>
    </div>
  );
}
