import { structureParagraphs } from "../../../shared/report-text.js";
import type { NumerologyFullReport } from "../../../shared/numerology.js";
import { NUMEROLOGY_CONTENT, PINNACLE_CONTENT, type MetricContent } from "./numerologyContent.js";

/**
 * Chuẩn bị nội dung chữ cho ebook BẢN ĐẦY ĐỦ (`numerologyFullPdf.ts`).
 *
 * Nội dung luận giải lấy từ `numerologyContent.ts` (trích từ bộ PDF đầy đủ gốc của SGEN). Văn bản trích bị dính tiêu đề,
 * số thứ tự và nhãn trang ("1 CHỈ SỐ NỘI TÂM NỘI TÂM SỐ 1 = …"); các hàm ở đây tách chúng thành tiêu đề + đoạn văn sạch
 * để dàn trang. Không thêm nội dung luận giải mới — chỉ dọn chữ và ghép tiêu đề từ nhãn chỉ số.
 */

export type MetricKey = keyof typeof METRIC_TITLES;

/** Tên chỉ số in trên tiêu đề trang ("CHỈ SỐ" / <tên>), khớp nhãn của Mục lục và trang tổng hợp. */
export const METRIC_TITLES = {
  soul: "NỘI TÂM",
  subconscious: "TIỀM THỨC",
  logic: "TƯ DUY LOGIC",
  emotion: "TƯ DUY CẢM XÚC",
  intuition: "TƯ DUY TRỰC GIÁC",
  experience: "TƯ DUY TRẢI NGHIỆM",
  repeated: "LẶP",
  attitude: "THÁI ĐỘ",
  interaction: "TƯƠNG TÁC",
  balance: "CÂN BẰNG",
  missing: "BÀI HỌC NGHIỆP",
  debts: "NỢ NGHIỆP",
  personalYear: "NĂM CÁ NHÂN",
  destiny: "SỨ MỆNH",
  lifePath: "ĐƯỜNG ĐỜI",
  birthNumber: "NGÀY SINH",
  maturity: "TRƯỞNG THÀNH",
  passion: "ĐAM MÊ",
  soulInteraction: "KẾT NỐI NỘI TÂM & TƯƠNG TÁC",
  destinyLifePath: "KẾT NỐI SỨ MỆNH & ĐƯỜNG ĐỜI",
} as const;

/** Cách gọi ngắn trong tiêu đề luận giải theo con số ("NỘI TÂM SỐ 3"); tiêu đề trang dùng `METRIC_TITLES`. */
const VALUE_LABELS: Partial<Record<MetricKey, string>> = {
  logic: "LOGIC",
  emotion: "CẢM XÚC",
  intuition: "TRỰC GIÁC",
  experience: "TRẢI NGHIỆM",
  repeated: "SỐ LẶP",
  soulInteraction: "KẾT NỐI",
  destinyLifePath: "KẾT NỐI",
};

/** Bốn nợ nghiệp theo thứ tự tài liệu gốc ("13/4; 14/5; 16/7; 19/1"), khóa nội dung là căn số. */
export const KARMIC_DEBTS = [
  { root: "4", label: "13/4" },
  { root: "5", label: "14/5" },
  { root: "7", label: "16/7" },
  { root: "1", label: "19/1" },
] as const;

export type ContentBlock = { heading?: string; paragraphs: string[] };

/** Chữ bị tách đôi khi trích PDF gốc (khoảng trắng chen giữa một âm tiết). */
const BROKEN_WORDS: Array<[RegExp, string]> = [
  [/CHỦ ĐỘ NG/g, "CHỦ ĐỘNG"],
  [/NGOẠI GIA O/g, "NGOẠI GIAO"],
  [/KẾT N ỐI/g, "KẾT NỐI"],
  [/CH UYÊN GIA/g, "CHUYÊN GIA"],
  [/BA O DUNG/g, "BAO DUNG"],
  [/– NG ƯỜI/g, "– NGƯỜI"],
];

const ZERO_WIDTH = /[​-‍﻿]/g;

function tidy(text: string) {
  let out = text.replace(ZERO_WIDTH, "").replace(/\s+([,.;:!?…])/g, "$1").replace(/\s+/g, " ").trim();
  for (const [pattern, fixed] of BROKEN_WORDS) out = out.replace(pattern, fixed);
  return out;
}

/** "2 Nội Tâm Số 2 là…" / "11/2 Bạn là…" → bỏ con số dính đầu đoạn (số trang/ô số của bản gốc). */
function dropLeadingNumber(text: string) {
  return text.replace(/^\d{1,2}(?:\/\d)?\s+(?=\p{Lu})/u, "");
}

/**
 * Bỏ tiền tố nhãn chung "CHỈ SỐ <TÊN>" khỏi tiêu đề. Kết quả:
 * - `""` khi chỉ còn con số/rỗng (tiêu đề không mang thông tin);
 * - `"= <vế>"` khi còn "<n> = <vế>" ("CHỈ SỐ TRƯỞNG THÀNH 7 = CHUYÊN GIA") để nơi gọi tự ghép tên + con số;
 * - nguyên phần còn lại trong các trường hợp khác.
 */
function stripGenericPrefix(heading: string, key: MetricKey) {
  let rest = heading;
  const names = [METRIC_TITLES[key], VALUE_LABELS[key], key === "soulInteraction" ? "KẾT NỐI NỘI TÂM VÀ TƯƠNG TÁC" : undefined]
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => b.length - a.length);
  for (const name of names) {
    const prefix = `CHỈ SỐ ${name}`;
    if (rest.startsWith(prefix)) {
      rest = rest.slice(prefix.length).trim();
      break;
    }
  }
  if (rest === heading && rest.startsWith("CHỈ SỐ ") && rest.includes("=")) return rest.slice("CHỈ SỐ ".length);
  const definition = rest.match(/^(?:[\d/]+\s*)?[=:–-]\s*(.+)$/);
  if (definition) return `= ${definition[1]}`;
  return /^[\d/\s]*$/.test(rest) ? "" : rest;
}

/** Ghép tiêu đề: vế "= …" nối sau tên; tiêu đề đã có "SỐ n"/"="/":" giữ nguyên; còn lại là vế mô tả. */
function composeHeading(base: string, own: string) {
  if (!own) return base;
  if (own.startsWith("= ")) return `${base} ${own}`;
  if (/SỐ\s+[\d/]+|=|:/.test(own)) return own;
  return `${base} = ${own}`;
}

/** Đoạn văn sạch + tiêu đề con (nếu có) từ mảng đoạn trích. */
export function cleanBlocks(raw: readonly string[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  for (const item of structureParagraphs(raw.map(tidy))) {
    const text = tidy(dropLeadingNumber(item.text));
    if (!text) continue;
    if (item.heading || !blocks.length) blocks.push({ heading: item.heading ? tidy(item.heading) : undefined, paragraphs: [text] });
    else blocks.at(-1)!.paragraphs.push(text);
  }
  return blocks;
}

/** Ghép mọi đoạn của các khối (bỏ tiêu đề con) — dùng khi trang đã có tiêu đề riêng. */
function paragraphsOf(blocks: ContentBlock[]) {
  return blocks.flatMap((block) => block.paragraphs);
}

/** Nội dung theo con số: tra theo tử số ("13/4" → "13"), thiếu thì dùng căn số — giống trang tra cứu trên web. */
export function valueParagraphs(value: string, content: MetricContent | undefined): string[] {
  if (!content || !value) return [];
  const numerator = value.split("/")[0];
  const root = value.split("/").at(-1) ?? numerator;
  return content.byValue[numerator] ?? content.byValue[root] ?? [];
}

/** Trang giới thiệu chỉ số: tiêu đề đỏ ("SỨ MỆNH = SỰ GIÚP ĐỠ") + đoạn văn. */
export function metricIntro(key: MetricKey): ContentBlock {
  const blocks = cleanBlocks(NUMEROLOGY_CONTENT[key]?.intro ?? []);
  const own = blocks.map((block) => (block.heading ? stripGenericPrefix(block.heading, key) : "")).find(Boolean) ?? "";
  const heading = own.startsWith("= ") ? `${METRIC_TITLES[key]} ${own}` : own;
  return { heading: heading || `Ý NGHĨA CHỈ SỐ ${METRIC_TITLES[key]}`, paragraphs: paragraphsOf(blocks) };
}

/**
 * Luận giải một con số: tiêu đề lấy từ bản gốc khi có câu định nghĩa ("NỘI TÂM SỐ 1 = …", "LOGIC SỐ 1: …"); bản gốc chỉ
 * ghi nhãn chung thì dựng "<TÊN> SỐ <n>", có vế mô tả ("KHỞI ĐẦU & CHINH PHỤC") thì ghép thành "<TÊN> SỐ <n> = <vế>".
 */
export function metricValueBlock(key: MetricKey, value: string, raw?: readonly string[]): ContentBlock {
  const blocks = cleanBlocks(raw ?? valueParagraphs(value, NUMEROLOGY_CONTENT[key]));
  const base = key === "repeated" ? `SỐ LẶP ${value}` : `${VALUE_LABELS[key] ?? METRIC_TITLES[key]} SỐ ${value}`;
  const own = blocks.map((block) => (block.heading ? stripGenericPrefix(block.heading, key) : "")).find(Boolean) ?? "";
  return { heading: composeHeading(base, own), paragraphs: paragraphsOf(blocks) };
}

/** Trang hóa giải một nợ nghiệp ("HÓA GIẢI NỢ NGHIỆP 13/4 = SỰ TẬP TRUNG"); nội dung gốc đánh khóa theo căn số. */
export function karmicDebtBlock(debt: (typeof KARMIC_DEBTS)[number]): ContentBlock {
  return metricValueBlock("debts", debt.label, valueParagraphs(debt.root, NUMEROLOGY_CONTENT.debts));
}

/** Các con số của một chỉ số trong báo cáo: chỉ số nhiều số (lặp, bài học, nợ nghiệp, đam mê) trả đủ danh sách. */
export function metricValues(report: NumerologyFullReport, key: string): string[] {
  for (const section of report.sections) {
    const found = section.metrics.find((metric) => metric.key === key);
    if (found) return (found.values?.length ? found.values : [found.value]).filter(Boolean);
  }
  return [];
}

export function metricNote(report: NumerologyFullReport, key: string) {
  for (const section of report.sections) {
    const found = section.metrics.find((metric) => metric.key === key);
    if (found) return found.note;
  }
  return "";
}

/** Luận giải một đỉnh của biểu đồ chặng đường đời ("ĐỈNH CAO SỐ 1 – CHINH PHỤC MỤC TIÊU"). */
export function pinnacleBlock(index: 0 | 1 | 2 | 3, value: string): ContentBlock {
  const content = PINNACLE_CONTENT[`dinh${index + 1}` as "dinh1"];
  const raw = valueParagraphs(value, { byValue: content }).filter((paragraph) => !/^ĐỈNH\s+\d(\s+[\d/]+)?$/.test(tidy(paragraph)));
  const blocks = cleanBlocks(raw);
  const own = blocks.map((block) => block.heading ?? "").find(Boolean) ?? "";
  return { heading: own.replace(/^ĐỈNH \d\s+/, "") || `ĐỈNH CAO SỐ ${value}`, paragraphs: paragraphsOf(blocks) };
}

/** Nội dung có sẵn tiêu đề trong bản gốc (biểu đồ, Ikigai…): bỏ dòng tiêu đề trùng với tiêu đề trang. */
export function sectionText(raw: readonly string[], pageTitle: string): ContentBlock {
  const blocks = cleanBlocks(raw);
  const title = pageTitle.replace(/\s+/g, " ");
  const heading = blocks.map((block) => block.heading ?? "").find((item) => item && !title.includes(item) && !item.includes(title));
  return { heading: heading || undefined, paragraphs: paragraphsOf(blocks) };
}
