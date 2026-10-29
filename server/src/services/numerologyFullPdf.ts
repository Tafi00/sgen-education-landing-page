import { readFile } from "node:fs/promises";
import path from "node:path";
import { deflateSync, inflateSync } from "node:zlib";
import * as fontkit from "fontkit";
import {
  PDFDocument,
  PDFArray,
  PDFName,
  PDFRawStream,
  PDFRef,
  TextRenderingMode,
  beginText,
  concatTransformationMatrix,
  decodePDFRawStream,
  drawObject,
  endText,
  popGraphicsState,
  pushGraphicsState,
  rgb,
  setFillingColor,
  setFontAndSize,
  setLineWidth,
  setStrokingColor,
  setTextMatrix,
  setTextRenderingMode,
  showText,
  type PDFEmbeddedPage,
  type PDFFont,
  type PDFHexString,
  type PDFImage,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import type { NumerologyFullReport } from "../../../shared/numerology.js";
import { NUMEROLOGY_CONTENT, PINNACLE_CONTENT, type MetricContent } from "./numerologyContent.js";
import {
  METRIC_TITLES,
  metricValueBlock,
  metricValues,
  pinnacleBlock,
  valueParagraphs,
  type ContentBlock,
  type MetricKey,
} from "./numerologyFullContent.js";
import {
  ASSET_DIR,
  coverOverlays,
  firstPassion,
  infoOverlays,
  letterOverlays,
  numerator,
  summaryOverlays,
  type NumerologyPdfOptions,
  type Overlay,
} from "./numerologyPdf.js";

/**
 * Ebook BẢN ĐẦY ĐỦ (hơn 70 trang) theo đúng "bảng chuẩn" xuất từ phần mềm gốc (ebook mẫu Elon Reeve Musk khách gửi
 * 28/10/2026): 5 chương, mọi chỉ số có trang giới thiệu + trang luận giải theo con số, chặng đường đời, Ikigai và ba tổ
 * hợp, biểu đồ ngày sinh/họ tên, trang Cảm nhận khách hàng.
 *
 * - Trang cố định (chương, phần, giới thiệu chỉ số, nợ nghiệp, biểu đồ, Ikigai, kết luận…) chép nguyên trang thiết kế
 *   của bản chuẩn (`assets/numerology-pdf/chuan/`, tách bằng `scripts/build_ebook_chuan.py`); bìa, thư ngỏ, Sứ mệnh,
 *   Đường đời, Đam mê và trang tổng hợp dùng bộ mẫu cũ (giống hệt bản chuẩn).
 * - Trang luận giải theo con số dùng trang thiết kế gốc khi có (`DESIGNED_VALUE_PAGES` — hiện chỉ các con số của hồ sơ
 *   mẫu); con số chưa có trang gốc thì dựng bằng pdf-lib trên khung trang trí tách từ bộ mẫu (`full/`): tiêu đề xanh kèm
 *   hoa văn, huy hiệu vàng mang con số, tiêu đề đỏ, thân chữ Faustina. Chỉ số nhiều con số: mỗi số một trang như bản chuẩn.
 * - Số trang ở chân trang luôn bằng vị trí thật (bìa = 0). Trang mẫu được bỏ chân trang cũ và cặp xoáy góc (bộ mẫu cũ:
 *   danh sách khối lệnh ở `full/template-strip.json`; trang chuẩn: đã bỏ sẵn khi tách) rồi dùng chung khung xoáy + vẽ lại
 *   chân trang; Mục lục được sửa số khi một mục bị đẩy trang (chỉ số có nhiều con số).
 */

const FULL_DIR = path.join(ASSET_DIR, "full");
const PAGE_W = 595.5;
const PAGE_H = 842.25;

const GREEN = rgb(9 / 255, 103 / 255, 25 / 255);
const RED = rgb(244 / 255, 5 / 255, 5 / 255);
const BLACK = rgb(0, 0, 0);
const NAVY = rgb(1 / 255, 6 / 255, 36 / 255);
const GOLD = rgb(0.9765, 0.8392, 0.0235);
const WHITE = rgb(1, 1, 1);

/** Vùng thân chữ của trang dựng (đơn vị pt, tọa độ tính từ mép trên trang như bản mẫu). */
const BODY_LEFT = 62.9;
const BODY_RIGHT = 547.5;
const BODY_WIDTH = BODY_RIGHT - BODY_LEFT;
const BODY_BOTTOM = 760;
/** Dải hoa văn cuối trang (giống `Page_09`) và chân trang "https:/www… - Trang NN". */
const BOTTOM_DIVIDER = { x: 145.2, top: 768.5, width: 305.5, height: 39.1 };
const FOOTER = { x: 64.3, baseline: 824.2, size: 17, prefix: "https:/www.Thansohuongnghiep.com - Hotline : 0903.891.839 - Trang  " };

/** Tiêu đề trang: dòng 1 kèm hoa văn hai bên, cỡ 33 như `CHỈ SỐ` của bản mẫu. */
const TITLE = { size: 33, firstBaseline: 51.6, lineGap: 50.3, flower: 45, flowerTop: 18.7, flowerGap: 8.5 };
/** Huy hiệu con số góc phải (vị trí ngôi sao/ấn vàng của `DuongDoi_00x`). */
const BADGE = { cx: 463.5, cy: 59.7, r: 47 };

const BODY_SIZE = 15;
const LEADING = 1.447;
/** Thu nhỏ thân chữ tối đa tới 13pt nếu nhờ đó bớt được một trang lẻ vài dòng. */
const BODY_SCALES = [1, 0.96, 0.92, 0.88, 0.867];

type Fonts = { semi: PDFFont; boldItalic: PDFFont };
/** Dáng huy hiệu con số — mỗi chỉ số của bản chuẩn một dáng riêng (tròn, sao nhiều cánh, đa giác, khung bo góc, tim). */
type Shape = "seal" | "star" | "heart" | "circle" | "star6" | "star8" | "star12" | "heptagon" | "octagon" | "diamond" | "pill" | "box";
/** Khối lệnh cần bỏ của một trang mẫu: chỉ số khối BT…ET của chân trang và nhóm q…Q của cặp xoáy góc. */
export type TemplateStrip = { blocks: number; footer: number[]; groups: number; swirls: number[] };

type Ctx = {
  out: PDFDocument;
  report: NumerologyFullReport;
  name: string;
  birth: string;
  phone?: string;
  fonts: Fonts;
  frame: PDFEmbeddedPage;
  flower: PDFImage;
  divider: PDFImage;
  strip: Record<string, TemplateStrip>;
  /** Vị trí trang của từng mục (đã chốt sau khi dàn trang) — dùng cho Mục lục, trang chương và hộp "xem trang …". */
  anchors: Map<string, number>;
  fontKeys: WeakMap<PDFPage, Map<PDFFont, PDFName>>;
};

/** `framed`: trang chuẩn đã bỏ sẵn chân trang + xoáy góc khi tách — chỉ cần lót khung xoáy và in chân trang. */
type TemplateSpec = { kind: "template"; anchor?: string; file: string; framed?: boolean; overlays?: (ctx: Ctx) => Overlay[]; patch?: (ctx: Ctx, page: PDFPage) => void };
type DrawnSpec = { kind: "drawn"; anchor?: string; draw: (ctx: Ctx, page: PDFPage) => void };
type PageSpec = TemplateSpec | DrawnSpec;

// ───────────────────────────── Chữ ─────────────────────────────

type Run = { x: number; top: number; text: string };
type TextStyle = { font: PDFFont; size: number; color: RGB; bold?: boolean };

/** Bề rộng ở cỡ 1pt và mã glyph của từng chuỗi, nhớ theo tên font (fontkit dựng glyph khá chậm, chữ lặp lại rất nhiều). */
const unitWidths = new Map<string, Map<string, number>>();
const encodings = new Map<string, Map<string, PDFHexString>>();

function memo<T>(store: Map<string, Map<string, T>>, font: PDFFont, text: string, make: () => T) {
  let byText = store.get(font.name);
  if (!byText) store.set(font.name, (byText = new Map()));
  let value = byText.get(text);
  if (value === undefined) byText.set(text, (value = make()));
  return value;
}

const textWidth = (font: PDFFont, text: string, size: number) => memo(unitWidths, font, text, () => font.widthOfTextAtSize(text, 1)) * size;
const widthOf = (style: TextStyle, text: string) => textWidth(style.font, text, style.size);
const encode = (font: PDFFont, text: string) => memo(encodings, font, text, () => font.encodeText(text));

function fontKey(ctx: Ctx, page: PDFPage, font: PDFFont) {
  let keys = ctx.fontKeys.get(page);
  if (!keys) ctx.fontKeys.set(page, (keys = new Map()));
  let key = keys.get(font);
  if (!key) keys.set(font, (key = page.node.newFontDictionary(font.name, font.ref)));
  return key;
}

const pdfY = (page: PDFPage, top: number) => page.getMediaBox().y + page.getHeight() - top;

/**
 * Vẽ nhiều đoạn chữ cùng kiểu trong một khối BT…ET. `top` là đường chân chữ tính từ mép trên trang.
 * `bold` giả lập Faustina Bold của bản mẫu bằng cách tô thêm viền cùng màu (bộ font chỉ có SemiBold).
 */
function writeText(ctx: Ctx, page: PDFPage, runs: Run[], style: TextStyle) {
  if (!runs.length) return;
  const ops = [pushGraphicsState(), setFillingColor(style.color)];
  if (style.bold) ops.push(setTextRenderingMode(TextRenderingMode.FillAndOutline), setLineWidth(style.size * 0.028), setStrokingColor(style.color));
  ops.push(beginText(), setFontAndSize(fontKey(ctx, page, style.font), style.size));
  for (const run of runs) ops.push(setTextMatrix(1, 0, 0, 1, run.x, pdfY(page, run.top)), showText(encode(style.font, run.text)));
  ops.push(endText(), popGraphicsState());
  page.pushOperators(...ops);
}

/** Một dòng chữ căn giữa quanh trục `cx`. */
function writeCentered(ctx: Ctx, page: PDFPage, text: string, cx: number, top: number, style: TextStyle) {
  writeText(ctx, page, [{ text, x: cx - widthOf(style, text) / 2, top }], style);
}

/** Ngắt dòng tham lam theo bề rộng; trả về các dòng (mảng từ). */
function wrapWords(style: TextStyle, text: string, width: number) {
  const words = text.split(" ").filter(Boolean);
  const space = widthOf(style, " ");
  const lines: string[][] = [];
  let line: string[] = [];
  let lineWidth = 0;
  for (const word of words) {
    const w = widthOf(style, word);
    if (line.length && lineWidth + space + w > width) {
      lines.push(line);
      line = [];
      lineWidth = 0;
    }
    lineWidth += (line.length ? space : 0) + w;
    line.push(word);
  }
  if (line.length) lines.push(line);
  return lines;
}

type Align = "justify" | "center";

/** Đặt từng từ của một dòng: dòng căn đều dàn khoảng trắng, dòng cuối đoạn căn trái như bản mẫu. */
function placeLine(style: TextStyle, words: string[], left: number, width: number, top: number, align: Align, last: boolean): Run[] {
  const text = words.join(" ");
  if (align === "center") return [{ x: left + (width - widthOf(style, text)) / 2, top, text }];
  if (last || words.length < 2) return [{ x: left, top, text }];
  const widths = words.map((word) => widthOf(style, word));
  const gap = (width - widths.reduce((sum, w) => sum + w, 0)) / (words.length - 1);
  let x = left;
  return words.map((word, index) => {
    const run = { x, top, text: word };
    x += widths[index] + gap;
    return run;
  });
}

// ───────────────────────────── Dòng chảy nội dung ─────────────────────────────

type FlowItem = { kind: "heading" | "para"; text: string };

type Op = { runs: Run[]; style: TextStyle };

/** Dàn các mục nội dung vào các trang có vùng chữ [top, BODY_BOTTOM]; tiêu đề không đứng trơ ở cuối trang. */
function layoutFlow(ctx: Ctx, items: FlowItem[], top: number, scale: number): Op[][] {
  const pages: Op[][] = [[]];
  let y = top;
  const fresh = () => y === top;
  const newPage = () => {
    pages.push([]);
    y = top;
  };

  items.forEach((item, index) => {
    const heading = item.kind === "heading";
    const style: TextStyle = {
      font: ctx.fonts.semi,
      size: heading ? Math.max(18, 20 * scale) : BODY_SIZE * scale,
      color: heading ? RED : BLACK,
      bold: heading,
    };
    const leading = style.size * (heading ? 1.3 : LEADING);
    const align: Align = heading ? "center" : "justify";
    const lines = wrapWords(style, item.text, BODY_WIDTH);
    if (heading) {
      if (!fresh()) y += leading * 0.45;
      // Giữ tiêu đề đi cùng ít nhất 2 dòng của đoạn kế tiếp.
      const reserve = items[index + 1]?.kind === "para" ? BODY_SIZE * scale * LEADING * 2 : 0;
      if (y + lines.length * leading + reserve > BODY_BOTTOM && !fresh()) newPage();
    }
    lines.forEach((words, lineIndex) => {
      if (y + leading > BODY_BOTTOM + style.size * 0.3 && !fresh()) newPage();
      const runs = placeLine(style, words, BODY_LEFT, BODY_WIDTH, y + style.size * 1.02, align, lineIndex === lines.length - 1);
      pages.at(-1)!.push({ runs, style });
      y += leading;
    });
    y += heading ? leading * 0.15 : leading * 0.45;
  });
  return pages.filter((ops, index) => ops.length || index === 0);
}

/** Chọn cỡ chữ lớn nhất vẫn giữ số trang tối thiểu (tránh trang cuối chỉ vài dòng). */
function fitFlow(ctx: Ctx, items: FlowItem[], top: number) {
  const smallest = layoutFlow(ctx, items, top, BODY_SCALES.at(-1)!);
  for (const scale of BODY_SCALES.slice(0, -1)) {
    const pages = layoutFlow(ctx, items, top, scale);
    if (pages.length <= smallest.length) return pages;
  }
  return smallest;
}

function drawOps(ctx: Ctx, page: PDFPage, ops: Op[]) {
  for (const op of ops) writeText(ctx, page, op.runs, op.style);
}

// ───────────────────────────── Khung trang ─────────────────────────────

type Chrome = { title: string[]; badge?: { text: string; shape: Shape } };

/** Bố cục tiêu đề: căn giữa trang; nếu đụng huy hiệu thì dời sang trái và thu nhỏ chữ khi cần. */
function titleLayout(ctx: Ctx, chrome: Chrome) {
  const flowerSpan = TITLE.flower + TITLE.flowerGap;
  const limitRight = chrome.badge ? BADGE.cx - BADGE.r - 6 : PAGE_W - 36;
  const measure = (size: number) => chrome.title.map((line, index) => textWidth(ctx.fonts.semi, line, size) + (index === 0 ? 2 * flowerSpan * (size / TITLE.size) : 0));
  let size = TITLE.size;
  while (Math.max(...measure(size)) > limitRight - 36 && size > 22) size -= 1;
  const axis = Math.min(PAGE_W / 2, limitRight - Math.max(...measure(size)) / 2);
  const lines = chrome.title.map((text, index) => {
    const width = textWidth(ctx.fonts.semi, text, size);
    return { text, x: axis - width / 2, top: TITLE.firstBaseline + index * TITLE.lineGap * (size / TITLE.size), width };
  });
  const bottom = Math.max(lines.at(-1)!.top + size * 0.3, chrome.badge ? BADGE.cy + BADGE.r : 0);
  return { size, lines, bottom };
}

function drawImage(page: PDFPage, image: PDFImage, x: number, top: number, width: number, height: number) {
  page.drawImage(image, { x, y: pdfY(page, top + height), width, height });
}

function drawChrome(ctx: Ctx, page: PDFPage, chrome: Chrome) {
  page.drawPage(ctx.frame, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
  const layout = titleLayout(ctx, chrome);
  writeText(ctx, page, layout.lines.map(({ text, x, top }) => ({ text, x, top })), { font: ctx.fonts.semi, size: layout.size, color: GREEN, bold: true });
  const first = layout.lines[0];
  const scale = layout.size / TITLE.size;
  const flower = TITLE.flower * scale;
  const flowerTop = first.top - (TITLE.firstBaseline - TITLE.flowerTop) * scale;
  drawImage(page, ctx.flower, first.x - TITLE.flowerGap * scale - flower, flowerTop, flower, flower);
  drawImage(page, ctx.flower, first.x + first.width + TITLE.flowerGap * scale, flowerTop, flower, flower);
  if (chrome.badge) drawBadge(ctx, page, chrome.badge.shape, BADGE.cx, BADGE.cy, BADGE.r, chrome.badge.text);
  drawImage(page, ctx.divider, BOTTOM_DIVIDER.x, BOTTOM_DIVIDER.top, BOTTOM_DIVIDER.width, BOTTOM_DIVIDER.height);
}

/** Trang dựng: khung + nội dung chảy qua nhiều trang nếu dài; mọi trang lặp lại tiêu đề và huy hiệu. */
function flowPages(ctx: Ctx, chrome: Chrome, items: FlowItem[]): DrawnSpec[] {
  const top = titleLayout(ctx, chrome).bottom + 14;
  return fitFlow(ctx, items, top).map((ops) => ({
    kind: "drawn",
    draw: (c, page) => {
      drawChrome(c, page, chrome);
      drawOps(c, page, ops);
    },
  }));
}

// ───────────────────────────── Hình vẽ ─────────────────────────────

/** Khung chữ nhật bo góc đặt tâm tại gốc tọa độ. */
function roundedRect(width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  const [x0, y0, x1, y1] = [-width / 2, -height / 2, width / 2, height / 2];
  return `M ${x0 + r} ${y0} H ${x1 - r} Q ${x1} ${y0} ${x1} ${y0 + r} V ${y1 - r} Q ${x1} ${y1} ${x1 - r} ${y1} H ${x0 + r} Q ${x0} ${y1} ${x0} ${y1 - r} V ${y0 + r} Q ${x0} ${y0} ${x0 + r} ${y0} Z`;
}

/** Bề ngang/cao của hai dáng khung (huy hiệu "Lặp", "Thái độ", "Năm cá nhân"… của bản chuẩn). */
const BOX_SIZE = { pill: [2, 1.2], box: [2.2, 1.5] } as const;

function shapePath(shape: Shape, r: number) {
  const points = (count: number, inner: number, rotate: number) => {
    const out: string[] = [];
    for (let i = 0; i < count * 2; i += 1) {
      const radius = i % 2 === 0 ? r : r * inner;
      const angle = rotate + (i * Math.PI) / count;
      out.push(`${(radius * Math.cos(angle)).toFixed(2)} ${(radius * Math.sin(angle)).toFixed(2)}`);
    }
    return `M ${out.join(" L ")} Z`;
  };
  /** Đa giác đều n cạnh = "sao" có đỉnh trong nằm đúng trên cạnh. */
  const polygon = (count: number, rotate: number) => points(count, Math.cos(Math.PI / count), rotate);
  switch (shape) {
    case "star":
      return points(5, 0.43, -Math.PI / 2);
    case "seal":
      return points(26, 0.88, 0);
    case "star6":
      return points(6, 0.62, -Math.PI / 2);
    case "star8":
      return points(8, 0.74, -Math.PI / 2);
    case "star12":
      return points(12, 0.8, -Math.PI / 2);
    case "heptagon":
      return polygon(7, -Math.PI / 2);
    case "octagon":
      return polygon(8, Math.PI / 8);
    case "diamond":
      return polygon(4, -Math.PI / 2);
    case "circle":
      return `M ${r} 0 A ${r} ${r} 0 1 1 ${-r} 0 A ${r} ${r} 0 1 1 ${r} 0 Z`;
    case "pill":
    case "box": {
      const [w, h] = BOX_SIZE[shape];
      return roundedRect(r * w, r * h, shape === "pill" ? (r * h) / 2 : r * 0.38);
    }
    case "heart":
      return [
        `M 0 ${0.82 * r}`,
        `C ${-0.25 * r} ${0.6 * r} ${-1.05 * r} ${0.12 * r} ${-1.05 * r} ${-0.32 * r}`,
        `C ${-1.05 * r} ${-0.78 * r} ${-0.62 * r} ${-0.98 * r} ${-0.32 * r} ${-0.92 * r}`,
        `C ${-0.14 * r} ${-0.88 * r} ${-0.04 * r} ${-0.78 * r} 0 ${-0.66 * r}`,
        `C ${0.04 * r} ${-0.78 * r} ${0.14 * r} ${-0.88 * r} ${0.32 * r} ${-0.92 * r}`,
        `C ${0.62 * r} ${-0.98 * r} ${1.05 * r} ${-0.78 * r} ${1.05 * r} ${-0.32 * r}`,
        `C ${1.05 * r} ${0.12 * r} ${0.25 * r} ${0.6 * r} 0 ${0.82 * r} Z`,
      ].join(" ");
  }
}

/** Bề ngang dành cho chữ trong từng dáng huy hiệu (bán kính r). */
function badgeRoom(shape: Shape, r: number) {
  if (shape === "pill" || shape === "box") return r * BOX_SIZE[shape][0] * 0.85;
  if (shape === "star") return r * 0.85;
  if (shape === "star6" || shape === "diamond") return r * 0.95;
  return r * 1.3;
}

/** Huy hiệu vàng mang con số đỏ (dáng theo từng chỉ số của bản chuẩn). */
function drawBadge(ctx: Ctx, page: PDFPage, shape: Shape, cx: number, cy: number, r: number, text: string) {
  page.drawSvgPath(shapePath(shape, r), { x: cx, y: pdfY(page, cy), color: GOLD });
  const semi = ctx.fonts.semi;
  const room = badgeRoom(shape, r);
  const centerY = shape === "star" ? cy + r * 0.12 : shape === "heart" ? cy - r * 0.08 : cy;
  let lines = [text];
  let size = Math.min(44, r * 0.95);
  const fits = (s: number) => lines.every((line) => textWidth(semi, line, s) <= room);
  while (!fits(size) && size > 18) size -= 1;
  if (!fits(size) && text.includes(", ")) {
    const parts = text.split(", ");
    const half = Math.ceil(parts.length / 2);
    lines = [`${parts.slice(0, half).join(", ")},`, parts.slice(half).join(", ")];
    size = Math.min(30, r * 0.6);
    while (!fits(size) && size > 10) size -= 1;
  }
  const lineHeight = size * 1.05;
  const firstBaseline = centerY - (lines.length * lineHeight) / 2 + size * 0.78;
  const style: TextStyle = { font: semi, size, color: RED, bold: true };
  lines.forEach((line, index) => writeCentered(ctx, page, line, cx, firstBaseline + index * lineHeight, style));
}

const pad = (index: number) => String(index).padStart(2, "0");

// ───────────────────────────── Trang mẫu ─────────────────────────────

/** Bộ mẫu được dùng lại giữa các lần xuất; giữ tối đa chừng này tệp đã phân tích trong bộ nhớ. */
const TEMPLATE_CACHE_LIMIT = 40;
const docCache = new Map<string, Promise<PDFDocument>>();
/** Nội dung trang mẫu đã bỏ chân trang/xoáy (nén sẵn), theo tệp. `null` = tệp đổi khác, giữ nguyên trang. */
const strippedCache = new Map<string, Uint8Array | null>();

function templateDoc(rel: string) {
  let doc = docCache.get(rel);
  if (doc) {
    docCache.delete(rel);
  } else {
    doc = readFile(path.join(ASSET_DIR, rel)).then((bytes) => PDFDocument.load(bytes));
    doc.catch(() => docCache.delete(rel));
  }
  docCache.set(rel, doc);
  while (docCache.size > TEMPLATE_CACHE_LIMIT) docCache.delete(docCache.keys().next().value!);
  return doc;
}

const PDF_SPACE = "[\\0\\t\\n\\f\\r ]";
/** Lệnh q/Q đứng riêng (tách bởi khoảng trắng PDF) — dùng để tìm các nhóm vẽ cấp ngoài cùng. */
const SAVE_RESTORE = new RegExp(`(?<=${PDF_SPACE}|^)[qQ](?=${PDF_SPACE})`, "g");
const TEXT_OBJECT = /BT\b[\s\S]*?\bET\b/g;

export function decodeContents(stream: PDFRawStream) {
  const filter = stream.dict.get(PDFName.of("Filter"));
  const bytes = filter === PDFName.of("FlateDecode") ? inflateSync(stream.contents) : decodePDFRawStream(stream).decode();
  return Buffer.from(bytes).toString("latin1");
}

/**
 * Bỏ các khối chân trang (BT…ET) và cặp xoáy góc (nhóm q…Q cấp ngoài cùng) khỏi lệnh vẽ đã giải nén của trang mẫu.
 * Trả `null` khi số khối/nhóm không khớp `template-strip.json` (tệp mẫu đã bị thay) để nơi gọi giữ nguyên trang.
 */
export function stripTemplateSource(source: string, strip: TemplateStrip): string | null {
  const blocks = [...source.matchAll(TEXT_OBJECT)].map((match) => [match.index!, match.index! + match[0].length] as const);
  const groups: Array<readonly [number, number]> = [];
  let depth = 0;
  let start = 0;
  for (const match of source.matchAll(SAVE_RESTORE)) {
    if (match[0] === "q") {
      if (depth === 0) start = match.index!;
      depth += 1;
    } else if (--depth === 0) {
      groups.push([start, match.index! + 1]);
    }
  }
  if (blocks.length !== strip.blocks || groups.length !== strip.groups) return null;
  const cuts = [...strip.footer.map((index) => blocks[index]), ...strip.swirls.map((index) => groups[index])].sort((a, b) => a[0] - b[0]);
  let kept = "";
  let last = 0;
  for (const [from, to] of cuts) {
    kept += source.slice(last, from);
    last = to;
  }
  return kept + source.slice(last);
}

/** Nội dung đã bỏ chân trang/xoáy, nén sẵn và nhớ theo tệp mẫu. */
function strippedContents(rel: string, stream: PDFRawStream, strip: TemplateStrip): Uint8Array | null {
  if (!strippedCache.has(rel)) {
    const kept = stripTemplateSource(decodeContents(stream), strip);
    strippedCache.set(rel, kept === null ? null : deflateSync(Buffer.from(kept, "latin1"), { level: kept.length > 300_000 ? 1 : 6 }));
  }
  return strippedCache.get(rel)!;
}

/**
 * Thay lệnh vẽ của trang mẫu vừa chép bằng bản đã bỏ chân trang cũ (và cặp xoáy góc nếu có). Trả về `null` khi giữ
 * nguyên trang, ngược lại cho biết trang có cần vẽ lại khung xoáy không.
 */
function replaceTemplateContents(ctx: Ctx, page: PDFPage, rel: string): { swirls: boolean } | null {
  const strip = ctx.strip[rel];
  const ref = page.node.get(PDFName.of("Contents"));
  const stream = page.node.Contents();
  if (!strip || !(ref instanceof PDFRef) || !(stream instanceof PDFRawStream)) return null;
  const stripped = strippedContents(rel, stream, strip);
  if (!stripped) return null;
  // pdf-lib bọc lệnh gốc trong q…Q (lệnh gốc đặt ma trận toàn trang không khôi phục); thay đúng phần tử đó trong mảng.
  page.node.normalize();
  const contents = page.node.Contents();
  const slot = contents instanceof PDFArray ? contents.indexOf(ref) : undefined;
  if (!(contents instanceof PDFArray) || slot === undefined) return null;
  const context = ctx.out.context;
  contents.set(slot, context.register(context.stream(stripped, { Filter: "FlateDecode" })));
  // Bản chép của luồng lệnh gốc (~1,4 MB) không còn ai dùng — bỏ để tệp xuất không mang theo.
  context.delete(ref);
  return { swirls: strip.swirls.length > 0 };
}

/**
 * Khung xoáy góc dùng chung, co giãn theo khổ trang. Vẽ SAU lệnh gốc: trang mẫu tô nền trắng kín trang trước tiên nên
 * lót bên dưới sẽ bị che; hai góc dưới không có gì khác ngoài chân trang (vẽ sau khung).
 */
function drawFrame(ctx: Ctx, page: PDFPage) {
  const box = page.getMediaBox();
  const name = page.node.newXObject("Frame", ctx.frame.ref);
  page.pushOperators(pushGraphicsState(), concatTransformationMatrix(box.width / PAGE_W, 0, 0, box.height / PAGE_H, box.x, box.y), drawObject(name), popGraphicsState());
}

function drawFooter(ctx: Ctx, page: PDFPage, index: number) {
  writeText(ctx, page, [{ text: `${FOOTER.prefix}${pad(index)}`, x: FOOTER.x, top: FOOTER.baseline }], { font: ctx.fonts.boldItalic, size: FOOTER.size, color: GREEN });
}

/**
 * Mục lục gốc in sẵn số trang. Khi một mục bị đẩy trang (chỉ số có nhiều con số), che số cũ bằng nền trắng và in số mới
 * cùng font, cùng vị trí. Hàng cách đều nhau từ "Thư ngỏ" (đỉnh 48.6pt) tới "Bảng tổng hợp" (783pt).
 */
const TOC_ROWS: Array<[anchor: string, printed: number]> = [
  ["letter", 3], ["pythagoras", 4], ["history", 5], ["purpose", 6], ["chapter1", 7], ["sectionA", 8], ["soul", 9],
  ["subconscious", 11], ["logic", 13], ["emotion", 15], ["intuition", 17], ["experience", 19], ["sectionB", 21],
  ["repeated", 22], ["attitude", 24], ["interaction", 26], ["chapter2", 28], ["balance", 29], ["missing", 31], ["debts", 33],
  ["chapter3", 38], ["personalYear", 39], ["destiny", 41], ["lifePath", 43], ["birthNumber", 45], ["maturity", 47],
  ["passion", 49], ["pinnacles", 51], ["ikigai", 56], ["chapter4", 60], ["soulInteraction", 61], ["destinyLifePath", 63],
  ["birthChart", 65], ["nameChart", 66], ["chapter5", 69], ["summary", 70],
];
const TOC_FIRST_TOP = 48.6;
const TOC_ROW_STEP = (783 - TOC_FIRST_TOP) / (TOC_ROWS.length - 1);

function patchToc(ctx: Ctx, page: PDFPage) {
  const style: TextStyle = { font: ctx.fonts.semi, size: 15, color: NAVY };
  TOC_ROWS.forEach(([anchor, printed], row) => {
    const actual = ctx.anchors.get(anchor);
    if (actual === undefined || actual === printed) return;
    const top = TOC_FIRST_TOP + row * TOC_ROW_STEP;
    page.drawRectangle({ x: 510, y: pdfY(page, top + 18.5), width: 24, height: 17, color: WHITE });
    writeText(ctx, page, [{ text: pad(actual), x: 512.6, top: top + 15.6 }], style);
  });
}

// ───────────────────────────── Kế hoạch trang ─────────────────────────────

/** Dáng huy hiệu của trang luận giải dựng, theo huy hiệu từng chỉ số trên bản chuẩn. */
const METRIC_SHAPES: Partial<Record<MetricKey, Shape>> = {
  soul: "circle",
  subconscious: "circle",
  emotion: "heptagon",
  intuition: "star6",
  experience: "star12",
  repeated: "pill",
  attitude: "box",
  balance: "octagon",
  missing: "box",
  personalYear: "box",
  birthNumber: "diamond",
  maturity: "star8",
  passion: "heart",
  soulInteraction: "box",
  destinyLifePath: "box",
};

/** Câu thay thế khi chỉ số nhiều con số không có số nào (diễn giải trực tiếp cách tính trong `shared/numerology.ts`). */
const EMPTY_TEXT: Partial<Record<MetricKey, string>> = {
  repeated: "Bạn không có số lặp",
  missing: "Bạn không có bài học nghiệp",
};
const EMPTY_DETAIL: Partial<Record<MetricKey, string>> = {
  repeated: "Sáu chỉ số nền (Sứ mệnh, Đường đời, Ngày sinh, Nội tâm, Tương tác, Thái độ) của bạn không có căn số nào lặp lại nhiều hơn các số khác, nên bạn không có số lặp.",
  missing: "Họ tên của bạn có đủ các con số từ 1 đến 9, nên bạn không có bài học nghiệp cần bồi đắp.",
};

/** Trang giới thiệu chỉ số của bản chuẩn (ảnh minh hoạ + ý nghĩa chỉ số), trong `chuan/`. */
const INTRO_PAGES: Partial<Record<MetricKey, string>> = {
  soul: "noi-tam",
  subconscious: "tiem-thuc",
  logic: "logic",
  emotion: "cam-xuc",
  intuition: "truc-giac",
  experience: "trai-nghiem",
  repeated: "so-lap",
  attitude: "thai-do",
  interaction: "tuong-tac",
  balance: "can-bang",
  missing: "bai-hoc-nghiep",
  debts: "no-nghiep",
  personalYear: "nam-ca-nhan",
  birthNumber: "ngay-sinh",
  maturity: "truong-thanh",
  soulInteraction: "ket-noi-noi-tam-tuong-tac",
  destinyLifePath: "ket-noi-su-menh-duong-doi",
};

/**
 * Trang luận giải theo con số có thiết kế gốc (ảnh minh hoạ riêng), trong `chuan/`: chỉ số → con số mẫu → tệp. Hiện chỉ có
 * các con số của hồ sơ mẫu Elon Reeve Musk; con số khác dùng trang dựng cho tới khi có thêm trang gốc.
 */
export const DESIGNED_VALUE_PAGES: Partial<Record<MetricKey, Record<string, string>>> = {
  soul: { "2": "noi-tam-2" },
  subconscious: { "7": "tiem-thuc-7" },
  logic: { "8": "logic-8" },
  emotion: { "7": "cam-xuc-7" },
  intuition: { "9": "truc-giac-9" },
  experience: { "6": "trai-nghiem-6" },
  repeated: { "1": "so-lap-1", "7": "so-lap-7" },
  attitude: { "7": "thai-do-7" },
  interaction: { "1": "tuong-tac-1" },
  balance: { "9": "can-bang-9" },
  missing: { "7": "bai-hoc-nghiep-7", "8": "bai-hoc-nghiep-8" },
  personalYear: { "8": "nam-ca-nhan-8" },
  birthNumber: { "1": "ngay-sinh-1" },
  maturity: { "1": "truong-thanh-1" },
  soulInteraction: { "1": "ket-noi-noi-tam-tuong-tac-1" },
  destinyLifePath: { "4": "ket-noi-su-menh-duong-doi-4" },
};
/** Như trên cho bốn đỉnh của biểu đồ chặng đường đời (Đỉnh 1…4). */
export const DESIGNED_PINNACLE_PAGES: Array<Record<string, string>> = [{ "7": "dinh-1-7" }, { "1": "dinh-2-1" }, { "8": "dinh-3-8" }, { "6": "dinh-4-6" }];

/**
 * Tệp trang gốc cho một con số: trang mẫu khớp khi cùng nội dung luận giải (vd. Tương tác 19/1 dùng chung lời luận
 * với 1, đúng như bản chuẩn in trang số 1 cho hồ sơ 19/1).
 */
export function designedPage(pages: Record<string, string> | undefined, content: MetricContent | undefined, value: string) {
  const own = valueParagraphs(value, content).join("\n");
  if (!own) return undefined;
  return Object.entries(pages ?? {}).find(([sample]) => valueParagraphs(sample, content).join("\n") === own)?.[1];
}

/** Trang của bản chuẩn (đã bỏ sẵn chân trang và xoáy góc). */
const chuan = (slug: string, anchor?: string): TemplateSpec => ({ kind: "template", file: `chuan/${slug}.pdf`, framed: true, anchor });

/**
 * Bộ nội dung gốc thiếu luận giải cho một vài con số hiếm (Tiềm thức 1–2: họ tên thiếu 7–8 con số). Khi đó in cách tính
 * thay vì để trống trang.
 */
function missingContentText(report: NumerologyFullReport, key: MetricKey, value: string) {
  if (key === "subconscious") {
    const missing = metricValues(report, "missing");
    return `Chỉ số Tiềm thức bằng 9 trừ đi số con số còn thiếu trong họ tên. Họ tên của bạn còn thiếu ${missing.length} con số (${missing.join(", ")}) nên Tiềm thức của bạn là ${value}. Ý nghĩa của từng con số còn thiếu được luận giải ở chỉ số Bài học nghiệp (Chương 2).`;
  }
  return `Bộ tài liệu luận giải hiện chưa có phần riêng cho ${METRIC_TITLES[key].toLowerCase()} số ${value}.`;
}

/** Tiêu đề trang như bản chuẩn: "CHỈ SỐ NỘI TÂM" một dòng, "CHỈ SỐ KẾT NỐI / NỘI TÂM VÀ TƯƠNG TÁC", còn lại "CHỈ SỐ / <TÊN>". */
function titleOf(key: MetricKey) {
  if (key === "soul" || key === "subconscious") return [`CHỈ SỐ ${METRIC_TITLES[key]}`];
  if (key === "soulInteraction") return ["CHỈ SỐ KẾT NỐI", "NỘI TÂM VÀ TƯƠNG TÁC"];
  const name = METRIC_TITLES[key];
  return name.startsWith("KẾT NỐI ") ? ["CHỈ SỐ KẾT NỐI", name.slice("KẾT NỐI ".length)] : ["CHỈ SỐ", name];
}

function contentItems(block: ContentBlock): FlowItem[] {
  return [...(block.heading ? [{ kind: "heading", text: block.heading } as FlowItem] : []), ...block.paragraphs.map((text): FlowItem => ({ kind: "para", text }))];
}

/** Trang luận giải theo con số: trang thiết kế gốc nếu có, không thì dựng; chỉ số nhiều con số mỗi số một trang như bản chuẩn. */
function valuePages(ctx: Ctx, key: MetricKey, values = metricValues(ctx.report, key)): PageSpec[] {
  if (!values.length) {
    return flowPages(ctx, { title: titleOf(key) }, [{ kind: "heading", text: (EMPTY_TEXT[key] ?? METRIC_TITLES[key]).toUpperCase() }, { kind: "para", text: EMPTY_DETAIL[key] ?? "" }]);
  }
  return values.flatMap((value): PageSpec[] => {
    const designed = designedPage(DESIGNED_VALUE_PAGES[key], NUMEROLOGY_CONTENT[key], value);
    if (designed) return [chuan(designed)];
    const block = metricValueBlock(key, value);
    if (!block.paragraphs.length) block.paragraphs.push(missingContentText(ctx.report, key, value));
    return flowPages(ctx, { title: titleOf(key), badge: { text: value, shape: METRIC_SHAPES[key] ?? "seal" } }, contentItems(block));
  });
}

/** Trang giới thiệu (bản chuẩn) + trang luận giải theo con số của một chỉ số. */
const metricPages = (ctx: Ctx, key: MetricKey): PageSpec[] => [chuan(INTRO_PAGES[key]!, key), ...valuePages(ctx, key)];

/** Trang luận giải một đỉnh (Đỉnh 1…4) của biểu đồ chặng đường đời. */
function pinnaclePages(ctx: Ctx, index: 0 | 1 | 2 | 3, value: string): PageSpec[] {
  const designed = designedPage(DESIGNED_PINNACLE_PAGES[index], { byValue: PINNACLE_CONTENT[`dinh${index + 1}` as "dinh1"] }, value);
  if (designed) return [chuan(designed)];
  return flowPages(ctx, { title: [`ĐỈNH ${index + 1}`], badge: { text: value, shape: "circle" } }, contentItems(pinnacleBlock(index, value)));
}

/** Trang "Cảm nhận khách hàng": họ tên và ngày sinh in sau nhãn có sẵn (vị trí, cỡ chữ như bản chuẩn; tên dài thì thu nhỏ). */
function patchFeedback(ctx: Ctx, page: PDFPage) {
  const style: TextStyle = { font: ctx.fonts.boldItalic, size: 24, color: BLACK };
  const nameSize = Math.min(24, (24 * 360) / textWidth(style.font, ctx.name, 24));
  writeText(ctx, page, [{ text: ctx.name, x: 180, top: 98.1 }], { ...style, size: nameSize });
  writeText(ctx, page, [{ text: ctx.birth, x: 200, top: 142.1 }], style);
}

function planPages(ctx: Ctx): PageSpec[] {
  const { report } = ctx;
  const page = (file: string) => `pages/${file}.pdf`;
  const plan: PageSpec[] = [];
  const push = (...specs: PageSpec[]) => plan.push(...specs);

  push(
    { kind: "template", file: page("Page_01"), overlays: (c) => coverOverlays(c.name, c.birth) },
    { kind: "template", file: page("Page_02"), overlays: (c) => infoOverlays(c.name, c.birth, c.phone) },
    { kind: "template", file: page("Page_03"), patch: patchToc },
    { kind: "template", anchor: "letter", file: page("Page_04"), overlays: (c) => letterOverlays(c.name) },
    { kind: "template", anchor: "pythagoras", file: page("Page_05") },
    { kind: "template", anchor: "history", file: page("Page_06") },
    { kind: "template", anchor: "purpose", file: page("Page_07") },
  );

  // CHƯƠNG 1 — Thấu hiểu bản thân: A. Thế giới bên trong, B. Thế giới bên ngoài
  push(chuan("chuong-1", "chapter1"), chuan("the-gioi-ben-trong", "sectionA"));
  for (const key of ["soul", "subconscious", "logic", "emotion", "intuition", "experience"] as const) push(...metricPages(ctx, key));
  push(chuan("the-gioi-ben-ngoai", "sectionB"));
  for (const key of ["repeated", "attitude", "interaction"] as const) push(...metricPages(ctx, key));

  // CHƯƠNG 2 — Phát triển bản thân. Nợ nghiệp: trang giới thiệu + đủ 4 trang hóa giải (13/4, 14/5, 16/7, 19/1) như bản chuẩn.
  push(chuan("chuong-2", "chapter2"), ...metricPages(ctx, "balance"), ...metricPages(ctx, "missing"));
  push(chuan(INTRO_PAGES.debts!, "debts"), ...["no-nghiep-13-4", "no-nghiep-14-5", "no-nghiep-16-7", "no-nghiep-19-1"].map((slug) => chuan(slug)));

  // CHƯƠNG 3 — Định hướng sự nghiệp. Sứ mệnh, Đường đời, Đam mê (giới thiệu + theo con số) có sẵn trong bộ mẫu cũ, giống
  // hệt bản chuẩn (trang giới thiệu là tệp `_000`; Page_09/11/13 của bản Demo là bản thiết kế cũ hơn).
  push(chuan("chuong-3", "chapter3"), ...metricPages(ctx, "personalYear"));
  push({ kind: "template", anchor: "destiny", file: "su-menh/SuMenh_000.pdf" });
  push({ kind: "template", file: `su-menh/SuMenh_00${numerator(metricValues(report, "destiny")[0] ?? "1")}.pdf` });
  push({ kind: "template", anchor: "lifePath", file: "duong-doi/DuongDoi_000.pdf" });
  push({ kind: "template", file: `duong-doi/DuongDoi_00${numerator(metricValues(report, "lifePath")[0] ?? "1")}.pdf` });
  push(...metricPages(ctx, "birthNumber"), ...metricPages(ctx, "maturity"));
  push({ kind: "template", anchor: "passion", file: "dam-me/DamMe_000.pdf" });
  const passion = firstPassion(report);
  push({ kind: "template", file: `dam-me/DamMe_00${numerator(passion)}.pdf` });
  // Trang Đam mê của bộ mẫu chỉ có một con số; các con số Đam mê còn lại có thêm trang luận giải.
  const morePassion = metricValues(report, "passion").filter((value) => value !== passion);
  if (morePassion.length) push(...valuePages(ctx, "passion", morePassion));

  // Biểu đồ chặng đường đời + 4 đỉnh, biểu đồ Ikigai + 3 tổ hợp (Tâm trí, Tư duy kinh doanh, Sáng tạo)
  push(chuan("chang-duong-doi", "pinnacles"));
  report.lifePathChart.pinnacles.forEach((node, index) => push(...pinnaclePages(ctx, index as 0 | 1 | 2 | 3, node.value)));
  push(chuan("ikigai", "ikigai"), chuan("to-hop-tam-tri"), chuan("to-hop-kinh-doanh"), chuan("to-hop-sang-tao"));

  // CHƯƠNG 4 — Nguồn lực hỗ trợ: hai chỉ số kết nối, biểu đồ ngày sinh, họ tên và hai trang đường mũi tên
  push(chuan("chuong-4", "chapter4"), ...metricPages(ctx, "soulInteraction"), ...metricPages(ctx, "destinyLifePath"));
  push(chuan("bieu-do-ngay-sinh", "birthChart"), chuan("bieu-do-ho-ten", "nameChart"), chuan("mui-ten-day-du"), chuan("mui-ten-trong"));

  // CHƯƠNG 5 — Kết luận, trang tổng hợp, lời cảm ơn, cảm nhận khách hàng, bìa sau
  push(
    chuan("chuong-5", "chapter5"),
    { kind: "template", anchor: "summary", file: page("summary"), overlays: (c) => summaryOverlays(c.report, c.name, c.birth, { bold: c.fonts.boldItalic, semi: c.fonts.semi }, "full") },
    chuan("loi-cam-on"),
    { ...chuan("cam-nhan-khach-hang"), patch: patchFeedback },
    { kind: "template", file: page("Page_BiaSau") },
  );
  return plan;
}

// ───────────────────────────── Dựng tệp ─────────────────────────────

export async function buildFullNumerologyPdf(report: NumerologyFullReport, options: Pick<NumerologyPdfOptions, "phone"> = {}): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  // @ts-expect-error fontkit types mismatch pdf-lib's bundled Fontkit interface but is runtime-compatible
  out.registerFontkit(fontkit);
  const [semiBytes, boldItalicBytes, frameBytes, flowerBytes, dividerBytes, stripJson] = await Promise.all([
    readFile(path.join(ASSET_DIR, "fonts/Faustina-SemiBold.ttf")),
    readFile(path.join(ASSET_DIR, "fonts/Faustina-BoldItalic.ttf")),
    readFile(path.join(FULL_DIR, "frame.pdf")),
    readFile(path.join(FULL_DIR, "flower.png")),
    readFile(path.join(FULL_DIR, "divider.png")),
    readFile(path.join(FULL_DIR, "template-strip.json"), "utf8"),
  ]);
  const [frame] = await out.embedPdf(frameBytes, [0]);
  const ctx: Ctx = {
    out,
    report,
    name: report.displayName.toUpperCase(),
    birth: report.birthDateLabel,
    phone: options.phone,
    fonts: { semi: await out.embedFont(semiBytes), boldItalic: await out.embedFont(boldItalicBytes) },
    frame,
    flower: await out.embedPng(flowerBytes),
    divider: await out.embedPng(dividerBytes),
    strip: JSON.parse(stripJson),
    anchors: new Map(),
    fontKeys: new WeakMap(),
  };

  const plan = planPages(ctx);
  plan.forEach((spec, index) => spec.anchor && ctx.anchors.set(spec.anchor, index));

  const templates = await Promise.all(plan.map((spec) => (spec.kind === "template" ? templateDoc(spec.file) : undefined)));
  for (const [index, spec] of plan.entries()) {
    if (spec.kind === "drawn") {
      const page = out.addPage([PAGE_W, PAGE_H]);
      spec.draw(ctx, page);
      drawFooter(ctx, page, index);
      continue;
    }
    const [page] = await out.copyPages(templates[index]!, [0]);
    // Trang chuẩn đã bỏ sẵn chân trang + xoáy góc khi tách; trang mẫu cũ bỏ theo `template-strip.json`.
    const stripped = spec.framed ? { swirls: true } : replaceTemplateContents(ctx, page, spec.file);
    out.addPage(page);
    if (stripped?.swirls) drawFrame(ctx, page);
    for (const item of spec.overlays?.(ctx) ?? []) {
      page.drawText(item.text, { x: item.x, y: item.y, size: item.size, font: item.font === "bold" ? ctx.fonts.boldItalic : ctx.fonts.semi, color: item.color });
    }
    spec.patch?.(ctx, page);
    if (stripped) drawFooter(ctx, page, index);
  }
  return out.save();
}
