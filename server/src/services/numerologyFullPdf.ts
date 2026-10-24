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
import { BIRTH_NAME_CHART_PAGES, IKIGAI_INTRO, PINNACLE_CONTENT } from "./numerologyContent.js";
import {
  KARMIC_DEBTS,
  METRIC_TITLES,
  karmicDebtBlock,
  metricIntro,
  metricNote,
  metricValueBlock,
  metricValues,
  pinnacleBlock,
  sectionText,
  type ContentBlock,
  type MetricKey,
} from "./numerologyFullContent.js";
import {
  ASSET_DIR,
  MAGENTA,
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
 * Ebook BẢN ĐẦY ĐỦ (hơn 70 trang) theo đúng Mục lục của bộ PDF gốc (`pages/Page_03.pdf`): 5 chương, mọi chỉ số đều có
 * trang giới thiệu + trang luận giải theo con số, biểu đồ chặng đường đời, Ikigai, biểu đồ ngày sinh/họ tên.
 *
 * - Trang có sẵn trong bộ mẫu (bìa, thư ngỏ, chương 3/5, Sứ mệnh, Đường đời, Đam mê, trang tổng hợp…) được chép nguyên.
 * - Các trang còn lại dựng bằng pdf-lib trên khung trang trí tách từ bộ mẫu (`assets/numerology-pdf/full/`): tiêu đề xanh
 *   "CHỈ SỐ / <TÊN>" kèm hoa văn, huy hiệu vàng mang con số, tiêu đề đỏ, thân chữ Faustina, xoáy góc và chân trang.
 * - Số trang ở chân trang luôn bằng vị trí thật (bìa = 0, giống bản gốc). Trang mẫu được bỏ chân trang cũ và cặp xoáy góc
 *   (danh sách khối lệnh ở `full/template-strip.json`, đã đối chiếu từng tệp) rồi dùng chung khung xoáy + vẽ lại chân trang;
 *   Mục lục được sửa số khi một mục bị đẩy trang (chỉ số có nhiều con số).
 */

const FULL_DIR = path.join(ASSET_DIR, "full");
const PAGE_W = 595.5;
const PAGE_H = 842.25;

const GREEN = rgb(9 / 255, 103 / 255, 25 / 255);
const RED = rgb(244 / 255, 5 / 255, 5 / 255);
const BLACK = rgb(0, 0, 0);
const BLUE = rgb(6 / 255, 145 / 255, 246 / 255);
const NAVY = rgb(1 / 255, 6 / 255, 36 / 255);
const GOLD = rgb(0.9765, 0.8392, 0.0235);
const WHITE = rgb(1, 1, 1);
const LAVENDER = rgb(0.8, 0.78, 0.92);
const CHART_BLUE = rgb(0.13, 0.42, 0.85);
const MUTED = rgb(0.33, 0.33, 0.4);
const CARD = rgb(1, 0.985, 0.9);

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
type Shape = "seal" | "star" | "heart";
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

type TemplateSpec = { kind: "template"; anchor?: string; file: string; overlays?: (ctx: Ctx) => Overlay[]; patch?: (ctx: Ctx, page: PDFPage) => void };
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

type Align = "justify" | "left" | "center";

/** Đặt từng từ của một dòng: dòng căn đều dàn khoảng trắng, dòng cuối đoạn căn trái như bản mẫu. */
function placeLine(style: TextStyle, words: string[], left: number, width: number, top: number, align: Align, last: boolean): Run[] {
  const text = words.join(" ");
  if (align === "center") return [{ x: left + (width - widthOf(style, text)) / 2, top, text }];
  if (align === "left" || last || words.length < 2) return [{ x: left, top, text }];
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

type Draw = (ctx: Ctx, page: PDFPage, top: number) => void;

type FlowItem =
  | { kind: "heading"; text: string; color?: RGB }
  | { kind: "para"; text: string; color?: RGB; align?: Align }
  | { kind: "space"; height: number }
  | { kind: "graphic"; height: number; draw: Draw };

type Op = { kind: "text"; runs: Run[]; style: TextStyle } | { kind: "graphic"; top: number; draw: Draw };

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
    if (item.kind === "space") {
      if (!fresh()) y += item.height;
      return;
    }
    if (item.kind === "graphic") {
      if (y + item.height > BODY_BOTTOM && !fresh()) newPage();
      pages.at(-1)!.push({ kind: "graphic", top: y, draw: item.draw });
      y += item.height;
      return;
    }
    const heading = item.kind === "heading";
    const style: TextStyle = {
      font: ctx.fonts.semi,
      size: heading ? Math.max(18, 20 * scale) : BODY_SIZE * scale,
      color: item.color ?? (heading ? RED : BLACK),
      bold: heading,
    };
    const leading = style.size * (heading ? 1.3 : LEADING);
    const align: Align = heading ? "center" : (item.align ?? "justify");
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
      pages.at(-1)!.push({ kind: "text", runs, style });
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
  for (const op of ops) {
    if (op.kind === "text") writeText(ctx, page, op.runs, op.style);
    else op.draw(ctx, page, op.top);
  }
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

/** Dải hoa văn giữa trang (dưới phần hình), cao ~39pt như bản mẫu. */
const dividerItem = (): FlowItem => ({
  kind: "graphic",
  height: 46,
  draw: (ctx, page, top) => drawImage(page, ctx.divider, BOTTOM_DIVIDER.x, top + 2, BOTTOM_DIVIDER.width, BOTTOM_DIVIDER.height),
});

/** Trang dựng: khung + nội dung chảy qua nhiều trang nếu dài; mọi trang lặp lại tiêu đề và huy hiệu. */
function flowPages(ctx: Ctx, chrome: Chrome, items: FlowItem[], anchor?: string): DrawnSpec[] {
  const top = titleLayout(ctx, chrome).bottom + 14;
  return fitFlow(ctx, items, top).map((ops, index) => ({
    kind: "drawn",
    anchor: index === 0 ? anchor : undefined,
    draw: (c, page) => {
      drawChrome(c, page, chrome);
      drawOps(c, page, ops);
    },
  }));
}

// ───────────────────────────── Hình vẽ ─────────────────────────────

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
  if (shape === "star") return points(5, 0.43, -Math.PI / 2);
  if (shape === "seal") return points(26, 0.88, 0);
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

/** Huy hiệu vàng mang con số đỏ (ngôi sao / ấn răng cưa / trái tim như các trang mẫu). */
function drawBadge(ctx: Ctx, page: PDFPage, shape: Shape, cx: number, cy: number, r: number, text: string) {
  page.drawSvgPath(shapePath(shape, r), { x: cx, y: pdfY(page, cy), color: GOLD });
  const semi = ctx.fonts.semi;
  const room = shape === "star" ? r * 0.85 : r * 1.3;
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

function roundedRect(width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  return `M ${r} 0 H ${width - r} Q ${width} 0 ${width} ${r} V ${height - r} Q ${width} ${height} ${width - r} ${height} H ${r} Q 0 ${height} 0 ${height - r} V ${r} Q 0 0 ${r} 0 Z`;
}

function drawCard(page: PDFPage, x: number, top: number, width: number, height: number) {
  page.drawSvgPath(roundedRect(width, height, 14), { x, y: pdfY(page, top), color: CARD, borderColor: GOLD, borderWidth: 1.6 });
}

const pad = (index: number) => String(index).padStart(2, "0");

/**
 * Khối hình đầu trang giới thiệu (thay cho ảnh minh họa của bản mẫu): thẻ vàng nhạt với ấn vàng mang con số của khách,
 * tên chỉ số và trang có luận giải chi tiết.
 */
function heroCard(label: string, values: string[], targetAnchor: string, emptyText?: string): FlowItem {
  const height = 168;
  return {
    kind: "graphic",
    height,
    draw: (ctx, page, top) => {
      const semi = ctx.fonts.semi;
      const width = 440;
      const x = (PAGE_W - width) / 2;
      const y = top + 6;
      drawCard(page, x, y, width, height - 18);
      const cardMiddle = y + (height - 18) / 2;
      drawBadge(ctx, page, "seal", x + 92, cardMiddle, 60, values.length ? values.join(", ") : "—");
      const textLeft = x + 176;
      const room = x + width - 18 - textLeft;
      const fit = (text: string, size: number) => {
        let s = size;
        while (textWidth(semi, text, s) > room && s > 11) s -= 0.5;
        return s;
      };
      const labelSize = fit(label, 23);
      writeText(ctx, page, [{ text: "Chỉ số", x: textLeft, top: cardMiddle - 34 }], { font: semi, size: 17, color: GREEN, bold: true });
      writeText(ctx, page, [{ text: label, x: textLeft, top: cardMiddle - 6 }], { font: semi, size: labelSize, color: GREEN, bold: true });
      const own = values.length ? "của bạn" : (emptyText ?? "");
      writeText(ctx, page, [{ text: own, x: textLeft, top: cardMiddle + 19 }], { font: semi, size: fit(own, 17), color: values.length ? GREEN : RED, bold: true });
      const target = ctx.anchors.get(targetAnchor);
      if (target !== undefined) {
        writeText(ctx, page, [{ text: `Luận giải chi tiết ở trang ${pad(target)}`, x: textLeft, top: cardMiddle + 44 }], { font: semi, size: 12, color: MUTED });
      }
    },
  };
}

/** Danh sách mục của trang chương/phần: tên, con số của bạn, ghi chú ngắn và số trang (đường chấm như Mục lục). */
type Entry = { label: string; anchor?: string; value?: string; note?: string; group?: boolean };

function entriesItem(entries: Entry[]): FlowItem {
  const rowHeight = (entry: Entry) => (entry.group ? 30 : entry.note ? 44 : 28);
  return {
    kind: "graphic",
    height: entries.reduce((sum, entry) => sum + rowHeight(entry), 0) + 10,
    draw: (ctx, page, top) => {
      const semi = ctx.fonts.semi;
      let y = top + 6;
      for (const entry of entries) {
        const indent = entry.group ? 0 : 18;
        const baseline = y + 18;
        const labelStyle: TextStyle = { font: semi, size: entry.group ? 16 : 15, color: entry.group ? GREEN : NAVY, bold: entry.group };
        const label = entry.value ? `${entry.label}: ` : entry.label;
        writeText(ctx, page, [{ text: label, x: BODY_LEFT + indent, top: baseline }], labelStyle);
        let end = BODY_LEFT + indent + widthOf(labelStyle, label);
        if (entry.value) {
          const valueStyle: TextStyle = { font: semi, size: 16, color: RED, bold: true };
          writeText(ctx, page, [{ text: entry.value, x: end, top: baseline }], valueStyle);
          end += widthOf(valueStyle, entry.value);
        }
        const target = entry.anchor ? ctx.anchors.get(entry.anchor) : undefined;
        if (target !== undefined) {
          const number = pad(target);
          const numberX = BODY_RIGHT - widthOf(labelStyle, number);
          writeText(ctx, page, [{ text: number, x: numberX, top: baseline }], labelStyle);
          if (numberX - 8 > end + 8) {
            const lineY = pdfY(page, baseline);
            page.drawLine({ start: { x: end + 8, y: lineY }, end: { x: numberX - 8, y: lineY }, thickness: 0.8, color: MUTED, dashArray: [1, 3], opacity: 0.7 });
          }
        }
        if (entry.note && !entry.group) {
          let size = 11.5;
          while (textWidth(semi, entry.note, size) > BODY_WIDTH - indent && size > 9) size -= 0.25;
          writeText(ctx, page, [{ text: entry.note, x: BODY_LEFT + indent, top: baseline + 18 }], { font: semi, size, color: MUTED });
        }
        y += rowHeight(entry);
      }
    },
  };
}

/** Biểu đồ chặng đường đời: 3 gốc (tháng / ngày sinh / năm) + 4 đỉnh kèm khoảng tuổi, kiểu hình tháp của trang tổng hợp. */
function pinnacleDiagram(report: NumerologyFullReport): FlowItem {
  return {
    kind: "graphic",
    height: 300,
    draw: (ctx, page, top) => {
      const chart = report.lifePathChart;
      const p = chart.pinnacles;
      const cx = PAGE_W / 2;
      const node = (x: number, y: number) => ({ x, y: top + y });
      const base = [node(cx - 170, 255), node(cx, 255), node(cx + 170, 255)];
      const [d1, d2, d3, d4] = [node(cx - 85, 175), node(cx + 85, 175), node(cx, 105), node(cx, 30)];
      const line = (a: { x: number; y: number }, b: { x: number; y: number }) =>
        page.drawLine({ start: { x: a.x, y: pdfY(page, a.y) }, end: { x: b.x, y: pdfY(page, b.y) }, thickness: 1.6, color: CHART_BLUE });
      [[base[0], d4], [base[2], d4], [base[0], d1], [base[1], d1], [base[1], d2], [base[2], d2], [d1, d3], [d2, d3], [d3, d4]].forEach(([a, b]) => line(a, b));
      const semi = ctx.fonts.semi;
      const circle = (at: { x: number; y: number }, value: string) => {
        page.drawCircle({ x: at.x, y: pdfY(page, at.y), size: 21, color: LAVENDER, borderColor: CHART_BLUE, borderWidth: 1.4 });
        let size = 17;
        while (textWidth(semi, value, size) > 34 && size > 9) size -= 1;
        writeCentered(ctx, page, value, at.x, at.y + size * 0.35, { font: semi, size, color: RED, bold: true });
      };
      const label = (text: string, x: number, y: number, align: "left" | "right" | "center", color: RGB = NAVY) => {
        const style: TextStyle = { font: semi, size: 11.5, color, bold: true };
        const w = widthOf(style, text);
        writeText(ctx, page, [{ text, x: align === "left" ? x : align === "right" ? x - w : x - w / 2, top: y }], style);
      };
      const range = (index: number) => (p[index]?.range ? `${p[index].range} tuổi` : "");
      circle(base[0], chart.month);
      circle(base[1], chart.birthNumber);
      circle(base[2], chart.year);
      [d1, d2, d3, d4].forEach((at, index) => circle(at, p[index]?.value ?? ""));
      label("Tháng sinh", base[0].x, base[0].y + 36, "center");
      label("Ngày sinh", base[1].x, base[1].y + 36, "center");
      label("Năm sinh", base[2].x, base[2].y + 36, "center");
      // Nhãn đỉnh đặt ngoài hai cạnh tam giác lớn (Tháng sinh → Đỉnh 4 ← Năm sinh) để không bị đường kẻ cắt.
      label("ĐỈNH 1", d1.x - 42, d1.y - 4, "right");
      label(range(0), d1.x - 42, d1.y + 11, "right", MAGENTA);
      [
        { at: d2, gap: 42 },
        { at: d3, gap: 74 },
        { at: d4, gap: 30 },
      ].forEach(({ at, gap }, index) => {
        label(`ĐỈNH ${index + 2}`, at.x + gap, at.y - 4, "left");
        label(range(index + 1), at.x + gap, at.y + 11, "left", MAGENTA);
      });
    },
  };
}

/** Biểu đồ Ikigai 4 vòng tròn giống trang tổng hợp, điền các con số của khách. */
function ikigaiDiagram(report: NumerologyFullReport): FlowItem {
  return {
    kind: "graphic",
    height: 360,
    draw: (ctx, page, top) => {
      const ik = report.ikigai;
      const cx = PAGE_W / 2;
      const cy = top + 180;
      const off = 66;
      for (const [dx, dy] of [[0, -off], [-off, 0], [off, 0], [0, off]]) {
        page.drawCircle({ x: cx + dx, y: pdfY(page, cy + dy), size: 96, borderColor: CHART_BLUE, borderWidth: 3, color: CHART_BLUE, opacity: 0.04, borderOpacity: 0.9 });
      }
      const semi = ctx.fonts.semi;
      const centered = (text: string, x: number, y: number, size: number, color: RGB) => writeCentered(ctx, page, text, x, y, { font: semi, size, color, bold: true });
      centered("Việc bạn", cx, cy - off - 52, 11, MAGENTA);
      centered("THÍCH", cx, cy - off - 38, 12, MAGENTA);
      centered("Việc bạn", cx - off - 52, cy - 6, 11, MAGENTA);
      centered("LÀM TỐT", cx - off - 52, cy + 8, 12, MAGENTA);
      centered("Việc xã hội", cx + off + 52, cy - 6, 11, MAGENTA);
      centered("CẦN", cx + off + 52, cy + 8, 12, MAGENTA);
      centered("Việc mang lại", cx, cy + off + 40, 11, MAGENTA);
      centered("THU NHẬP CAO", cx, cy + off + 54, 12, MAGENTA);
      const quad = (label: string, value: string, x: number, y: number) => {
        centered(label, x, y, 12.5, GREEN);
        let size = 18;
        while (textWidth(semi, value, size) > 70 && size > 10) size -= 1;
        centered(value, x, y + 20, size, RED);
      };
      quad("ĐAM MÊ", ik.passion.join(", "), cx - 45, cy - 48);
      quad("SỨ MỆNH", ik.mission, cx + 45, cy - 48);
      quad("CHUYÊN MÔN", ik.expertise.join(", "), cx - 45, cy + 34);
      quad("SỰ NGHIỆP", ik.career.join(", "), cx + 45, cy + 34);
      centered("Mục đích", cx, cy - 4, 10, RED);
      centered("CUỘC ĐỜI", cx, cy + 8, 10, RED);
    },
  };
}

/** 8 đường mũi tên theo đúng định nghĩa trong nội dung "BIỂU ĐỒ ĐƯỜNG MŨI TÊN ĐẦY ĐỦ". */
type Arrow = { name: string; digits: [number, number, number] };
const ARROWS: Arrow[] = [
  { name: "Đường Quyết Tâm 1-5-9", digits: [1, 5, 9] },
  { name: "Đường Tâm Linh 3-5-7", digits: [3, 5, 7] },
  { name: "Đường Kế Hoạch 1-2-3", digits: [1, 2, 3] },
  { name: "Đường Ý Chí 4-5-6", digits: [4, 5, 6] },
  { name: "Đường Hành Động 7-8-9", digits: [7, 8, 9] },
  { name: "Đường Thực Tế 1-4-7", digits: [1, 4, 7] },
  { name: "Đường Cân Bằng Cảm Xúc 2-5-8", digits: [2, 5, 8] },
  { name: "Đường Trí Tuệ 3-6-9", digits: [3, 6, 9] },
];

/** Lưới 3×3 kiểu Pythagoras (3-6-9 trên cùng, 1-4-7 dưới cùng), mỗi ô lặp con số theo số lần xuất hiện. */
const GRID_ROWS = [
  [3, 6, 9],
  [2, 5, 8],
  [1, 4, 7],
];

function gridDiagram(counts: Record<number, number>, caption: string, arrows: Arrow[] = []): FlowItem {
  const cell = 66;
  return {
    kind: "graphic",
    height: cell * 3 + 52,
    draw: (ctx, page, top) => {
      const semi = ctx.fonts.semi;
      const left = PAGE_W / 2 - (cell * 3) / 2;
      const gridTop = top + 8;
      const center = (digit: number) => {
        const row = GRID_ROWS.findIndex((digits) => digits.includes(digit));
        return { x: left + GRID_ROWS[row].indexOf(digit) * cell + cell / 2, y: gridTop + row * cell + cell / 2 };
      };
      for (const digit of GRID_ROWS.flat()) {
        const { x, y } = center(digit);
        page.drawSvgPath(roundedRect(cell - 8, cell - 8, 8), { x: x - cell / 2 + 4, y: pdfY(page, y - cell / 2 + 4), color: LAVENDER, opacity: 0.55, borderColor: CHART_BLUE, borderWidth: 1 });
        const count = counts[digit] ?? 0;
        if (!count) continue;
        const text = String(digit).repeat(count);
        let size = 22;
        while (textWidth(semi, text, size) > cell - 16 && size > 9) size -= 1;
        writeCentered(ctx, page, text, x, y + size * 0.35, { font: semi, size, color: RED, bold: true });
      }
      for (const arrow of arrows) {
        const a = center(arrow.digits[0]);
        const b = center(arrow.digits[2]);
        page.drawLine({ start: { x: a.x, y: pdfY(page, a.y) }, end: { x: b.x, y: pdfY(page, b.y) }, thickness: 3, color: GREEN, opacity: 0.55 });
      }
      writeCentered(ctx, page, caption, PAGE_W / 2, gridTop + cell * 3 + 24, { font: semi, size: 12, color: MUTED });
    },
  };
}

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
 * Thay lệnh vẽ của trang mẫu vừa chép bằng bản đã bỏ chân trang cũ; nếu cặp xoáy góc cũng được bỏ thì vẽ khung xoáy
 * dùng chung ở lớp dưới cùng (đúng thứ tự vẽ như bản mẫu). Trả về `true` khi chân trang cũ đã được bỏ.
 */
function replaceTemplateContents(ctx: Ctx, page: PDFPage, rel: string) {
  const strip = ctx.strip[rel];
  const ref = page.node.get(PDFName.of("Contents"));
  const stream = page.node.Contents();
  if (!strip || !(ref instanceof PDFRef) || !(stream instanceof PDFRawStream)) return false;
  const stripped = strippedContents(rel, stream, strip);
  if (!stripped) return false;
  // pdf-lib bọc lệnh gốc trong q…Q (lệnh gốc đặt ma trận toàn trang không khôi phục); thay đúng phần tử đó trong mảng.
  page.node.normalize();
  const contents = page.node.Contents();
  const slot = contents instanceof PDFArray ? contents.indexOf(ref) : undefined;
  if (!(contents instanceof PDFArray) || slot === undefined) return false;
  const context = ctx.out.context;
  contents.set(slot, context.register(context.stream(stripped, { Filter: "FlateDecode" })));
  if (strip.swirls.length) {
    const box = page.getMediaBox();
    const name = page.node.newXObject("Frame", ctx.frame.ref);
    const frameOps = [pushGraphicsState(), concatTransformationMatrix(box.width / PAGE_W, 0, 0, box.height / PAGE_H, box.x, box.y), drawObject(name), popGraphicsState()];
    contents.insert(slot, context.register(context.contentStream(frameOps)));
  }
  // Bản chép của luồng lệnh gốc (~1,4 MB) không còn ai dùng — bỏ để tệp xuất không mang theo.
  context.delete(ref);
  return true;
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

const METRIC_SHAPES: Partial<Record<MetricKey, Shape>> = { balance: "star", missing: "star", debts: "star", passion: "heart" };

/** Câu thay thế khi chỉ số nhiều con số không có số nào (diễn giải trực tiếp cách tính trong `shared/numerology.ts`). */
const EMPTY_TEXT: Partial<Record<MetricKey, string>> = {
  repeated: "Bạn không có số lặp",
  missing: "Bạn không có bài học nghiệp",
  debts: "Bạn không có nợ nghiệp",
};
const EMPTY_DETAIL: Partial<Record<MetricKey, string>> = {
  repeated: "Sáu chỉ số nền (Sứ mệnh, Đường đời, Ngày sinh, Nội tâm, Tương tác, Thái độ) của bạn không có căn số nào lặp lại nhiều hơn các số khác, nên bạn không có số lặp.",
  missing: "Họ tên của bạn có đủ các con số từ 1 đến 9, nên bạn không có bài học nghiệp cần bồi đắp.",
};

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

function titleOf(key: MetricKey) {
  const name = METRIC_TITLES[key];
  return name.startsWith("KẾT NỐI ") ? ["CHỈ SỐ KẾT NỐI", name.slice("KẾT NỐI ".length)] : ["CHỈ SỐ", name];
}

function contentItems(block: ContentBlock): FlowItem[] {
  return [...(block.heading ? [{ kind: "heading", text: block.heading } as FlowItem] : []), ...block.paragraphs.map((text): FlowItem => ({ kind: "para", text }))];
}

function labelOf(report: NumerologyFullReport, key: string) {
  for (const section of report.sections) {
    const found = section.metrics.find((metric) => metric.key === key);
    if (found) return found.label;
  }
  return METRIC_TITLES[key as MetricKey] ?? key;
}

/** Trang giới thiệu chỉ số: thẻ con số của bạn (thay ảnh minh họa) + ý nghĩa chỉ số. */
function introPages(ctx: Ctx, key: MetricKey, body: FlowItem[] = contentItems(metricIntro(key))): DrawnSpec[] {
  const hero = heroCard(labelOf(ctx.report, key), metricValues(ctx.report, key), `${key}:value`, EMPTY_TEXT[key]);
  return flowPages(ctx, { title: titleOf(key) }, [hero, dividerItem(), ...body], key);
}

/** Trang luận giải theo con số; chỉ số nhiều con số xếp lần lượt từng số. */
function valuePages(ctx: Ctx, key: MetricKey, values = metricValues(ctx.report, key)): DrawnSpec[] {
  if (!values.length) {
    return flowPages(ctx, { title: titleOf(key) }, [{ kind: "heading", text: (EMPTY_TEXT[key] ?? METRIC_TITLES[key]).toUpperCase() }, { kind: "para", text: EMPTY_DETAIL[key] ?? "" }], `${key}:value`);
  }
  const items = values.flatMap((value, index): FlowItem[] => {
    const block = metricValueBlock(key, value);
    if (!block.paragraphs.length) block.paragraphs.push(missingContentText(ctx.report, key, value));
    return [...(index ? [{ kind: "space", height: 10 } as FlowItem] : []), ...contentItems(block)];
  });
  return flowPages(ctx, { title: titleOf(key), badge: { text: values.join(", "), shape: METRIC_SHAPES[key] ?? "seal" } }, items, `${key}:value`);
}

const metricPages = (ctx: Ctx, key: MetricKey) => [...introPages(ctx, key), ...valuePages(ctx, key)];

/** Trang chương/phần: tiêu đề, ấn lớn và danh sách mục kèm con số + số trang. */
function coverPage(ctx: Ctx, anchor: string, title: string[], emblem: string, entries: Entry[]): DrawnSpec[] {
  const emblemItem: FlowItem = { kind: "graphic", height: 150, draw: (c, page, top) => drawBadge(c, page, "seal", PAGE_W / 2, top + 72, 64, emblem) };
  return flowPages(ctx, { title }, [dividerItem(), emblemItem, entriesItem(entries)], anchor);
}

function metricEntry(ctx: Ctx, key: MetricKey, withNote = true): Entry {
  const values = metricValues(ctx.report, key);
  return {
    label: `Chỉ số ${labelOf(ctx.report, key)}`,
    anchor: key,
    value: values.length ? values.join(", ") : "không có",
    note: withNote ? metricNote(ctx.report, key) : undefined,
  };
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

  // CHƯƠNG 1 — Thấu hiểu bản thân
  const inner: MetricKey[] = ["soul", "subconscious", "logic", "emotion", "intuition", "experience"];
  const outer: MetricKey[] = ["repeated", "attitude", "interaction"];
  push(
    ...coverPage(ctx, "chapter1", ["CHƯƠNG 1", "THẤU HIỂU BẢN THÂN"], "1", [
      { label: "A. Thế giới bên trong", anchor: "sectionA", group: true },
      ...inner.map((key) => metricEntry(ctx, key, false)),
      { label: "B. Thế giới bên ngoài", anchor: "sectionB", group: true },
      ...outer.map((key) => metricEntry(ctx, key, false)),
    ]),
  );
  push(...coverPage(ctx, "sectionA", ["PHẦN A", "THẾ GIỚI BÊN TRONG"], "A", inner.map((key) => metricEntry(ctx, key))));
  for (const key of inner) push(...metricPages(ctx, key));
  push(...coverPage(ctx, "sectionB", ["PHẦN B", "THẾ GIỚI BÊN NGOÀI"], "B", outer.map((key) => metricEntry(ctx, key))));
  for (const key of outer) push(...metricPages(ctx, key));

  // CHƯƠNG 2 — Phát triển bản thân
  const growth: MetricKey[] = ["balance", "missing", "debts"];
  push(...coverPage(ctx, "chapter2", ["CHƯƠNG 2", "PHÁT TRIỂN BẢN THÂN"], "2", growth.map((key) => metricEntry(ctx, key))));
  push(...metricPages(ctx, "balance"), ...metricPages(ctx, "missing"));
  // Nợ nghiệp: trang giới thiệu + 4 trang hóa giải (đủ 13/4, 14/5, 16/7, 19/1 như bản gốc), đánh dấu nợ nghiệp của khách.
  push(...introPages(ctx, "debts"));
  const debts = metricValues(report, "debts");
  KARMIC_DEBTS.forEach((debt, index) => {
    const own = debts.includes(debt.root);
    const status: FlowItem = {
      kind: "para",
      align: "center",
      color: own ? RED : BLUE,
      text: own ? `Hồ sơ của bạn có nợ nghiệp ${debt.label}.` : `Hồ sơ của bạn không mang nợ nghiệp ${debt.label} — nội dung dưới đây để bạn tham khảo.`,
    };
    const chrome: Chrome = { title: titleOf("debts"), badge: { text: debt.label, shape: "star" } };
    push(...flowPages(ctx, chrome, [status, ...contentItems(karmicDebtBlock(debt))], index === 0 ? "debts:value" : undefined));
  });

  // CHƯƠNG 3 — Định hướng sự nghiệp (trang chương, Sứ mệnh, Đường đời, Đam mê có sẵn trong bộ mẫu)
  push({ kind: "template", anchor: "chapter3", file: page("Page_08") });
  push(...metricPages(ctx, "personalYear"));
  push({ kind: "template", anchor: "destiny", file: page("Page_09") });
  push({ kind: "template", file: `su-menh/SuMenh_00${numerator(metricValues(report, "destiny")[0] ?? "1")}.pdf` });
  push({ kind: "template", anchor: "lifePath", file: page("Page_11") });
  push({ kind: "template", file: `duong-doi/DuongDoi_00${numerator(metricValues(report, "lifePath")[0] ?? "1")}.pdf` });
  push(...metricPages(ctx, "birthNumber"), ...metricPages(ctx, "maturity"));
  push({ kind: "template", anchor: "passion", file: page("Page_13") });
  const passion = firstPassion(report);
  push({ kind: "template", file: `dam-me/DamMe_00${numerator(passion)}.pdf` });
  // Trang Đam mê của bộ mẫu chỉ có một con số; các con số Đam mê còn lại có thêm trang luận giải.
  const morePassion = metricValues(report, "passion").filter((value) => value !== passion);
  if (morePassion.length) push(...valuePages(ctx, "passion", morePassion));

  // Biểu đồ chặng đường đời: giới thiệu + hình tháp, rồi 4 trang luận giải từng đỉnh
  const pinnacleIntro = sectionText(PINNACLE_CONTENT.intro, "BIỂU ĐỒ CHẶNG ĐƯỜNG ĐỜI");
  push(...flowPages(ctx, { title: ["BIỂU ĐỒ", "CHẶNG ĐƯỜNG ĐỜI"] }, [pinnacleDiagram(report), ...contentItems(pinnacleIntro)], "pinnacles"));
  report.lifePathChart.pinnacles.forEach((node, index) => {
    const period: FlowItem[] = node.range ? [{ kind: "para", align: "center", color: BLUE, text: `Giai đoạn từ ${node.range} tuổi` }] : [];
    const chrome: Chrome = { title: [`ĐỈNH ${index + 1}`, "CHẶNG ĐƯỜNG ĐỜI"], badge: { text: node.value, shape: "star" } };
    push(...flowPages(ctx, chrome, [...period, ...contentItems(pinnacleBlock(index as 0 | 1 | 2 | 3, node.value))]));
  });

  // Biểu đồ Ikigai: ý nghĩa, rồi hình 4 vòng tròn với các con số của khách
  const ik = report.ikigai;
  const ikigaiIntro = sectionText(IKIGAI_INTRO, "BIỂU ĐỒ IKIGAI MỤC ĐÍCH CUỘC ĐỜI");
  push(...flowPages(ctx, { title: ["BIỂU ĐỒ IKIGAI", "MỤC ĐÍCH CUỘC ĐỜI"] }, [dividerItem(), ...contentItems(ikigaiIntro)], "ikigai"));
  push(
    ...flowPages(ctx, { title: ["BIỂU ĐỒ IKIGAI", "CỦA BẠN"] }, [
      ikigaiDiagram(report),
      entriesItem([
        { label: "Đam mê", value: ik.passion.join(", "), note: "Các con số xuất hiện nhiều nhất trong họ tên (chỉ số Đam mê)." },
        { label: "Sứ mệnh", value: ik.mission, note: "Căn số của chỉ số Sứ mệnh." },
        { label: "Chuyên môn", value: ik.expertise.join(", "), note: "Căn số của chỉ số Nội tâm, Tương tác và Ngày sinh." },
        { label: "Sự nghiệp", value: ik.career.join(", "), note: "Căn số của chỉ số Đường đời, Trưởng thành và Năm cá nhân." },
      ]),
    ]),
  );

  // CHƯƠNG 4 — Nguồn lực hỗ trợ
  push(
    ...coverPage(ctx, "chapter4", ["CHƯƠNG 4", "NGUỒN LỰC HỖ TRỢ"], "4", [
      metricEntry(ctx, "soulInteraction"),
      metricEntry(ctx, "destinyLifePath"),
      { label: "Biểu đồ ngày sinh", anchor: "birthChart", note: "Mỗi con số trong ngày, tháng, năm sinh xuất hiện bao nhiêu lần — ô trống là năng lượng còn thiếu." },
      { label: "Biểu đồ họ tên", anchor: "nameChart", note: "Tần suất các giá trị chữ cái trong họ tên khai sinh theo bảng Pythagoras." },
    ]),
  );
  for (const [key, left, right] of [
    ["soulInteraction", "soul", "interaction"],
    ["destinyLifePath", "destiny", "lifePath"],
  ] as const) {
    // Bộ nội dung gốc không có đoạn giới thiệu cho hai chỉ số kết nối: dùng định nghĩa ngắn của chỉ số + cách tính.
    const formula = `Cách tính: | ${labelOf(report, left)} ${metricValues(report, left)[0] ?? ""} − ${labelOf(report, right)} ${metricValues(report, right)[0] ?? ""} | (lấy căn số) = ${metricValues(report, key)[0] ?? ""}`;
    push(
      ...introPages(ctx, key, [
        { kind: "heading", text: `Ý NGHĨA CHỈ SỐ ${METRIC_TITLES[key]}` },
        { kind: "para", text: metricNote(report, key), align: "center" },
        { kind: "para", text: formula, align: "center", color: BLUE },
      ]),
      ...valuePages(ctx, key),
    );
  }

  // Biểu đồ ngày sinh, biểu đồ họ tên và hai trang đường mũi tên (thứ tự 65–68 của bản gốc)
  const [birthText, nameText, fullArrowText, emptyArrowRaw] = BIRTH_NAME_CHART_PAGES;
  const birthCounts = report.birthChart;
  const yourBirthChart = "Biểu đồ ngày sinh của bạn";
  push(...flowPages(ctx, { title: ["BIỂU ĐỒ", "NGÀY SINH"] }, [gridDiagram(birthCounts, yourBirthChart), ...contentItems(sectionText(birthText, "BIỂU ĐỒ NGÀY SINH"))], "birthChart"));
  push(...flowPages(ctx, { title: ["BIỂU ĐỒ", "HỌ TÊN"] }, [gridDiagram(report.nameChart, "Biểu đồ họ tên của bạn"), ...contentItems(sectionText(nameText, "BIỂU ĐỒ HỌ TÊN"))], "nameChart"));
  const fullArrows = ARROWS.filter((arrow) => arrow.digits.every((digit) => (birthCounts[digit] ?? 0) > 0));
  const arrowNote: FlowItem = {
    kind: "para",
    align: "center",
    color: BLUE,
    text: fullArrows.length ? `Biểu đồ ngày sinh của bạn có: ${fullArrows.map((arrow) => arrow.name).join("; ")}.` : "Biểu đồ ngày sinh của bạn chưa có đường mũi tên đầy đủ nào.",
  };
  push(...flowPages(ctx, { title: ["ĐƯỜNG MŨI TÊN", "ĐẦY ĐỦ"] }, [gridDiagram(birthCounts, yourBirthChart, fullArrows), arrowNote, ...contentItems(sectionText(fullArrowText, "BIỂU ĐỒ ĐƯỜNG MŨI TÊN ĐẦY ĐỦ"))]));
  // Đoạn đầu của trang "mũi tên trống" là nhãn hình vẽ bị trích dính ("Đường Thiếu Kế Hoạch Đường Trí Nhớ…") — bỏ đi.
  const emptyArrowText = emptyArrowRaw.filter((paragraph) => !paragraph.endsWith("BIỂU ĐỒ ĐƯỜNG MŨI TÊN TRỐNG"));
  push(...flowPages(ctx, { title: ["ĐƯỜNG MŨI TÊN", "TRỐNG"] }, [gridDiagram(birthCounts, yourBirthChart), ...contentItems(sectionText(emptyArrowText, "BIỂU ĐỒ ĐƯỜNG MŨI TÊN TRỐNG"))]));

  // CHƯƠNG 5 — Kết luận, trang tổng hợp, lời cảm ơn, bìa sau
  push(
    { kind: "template", anchor: "chapter5", file: page("Page_15") },
    { kind: "template", anchor: "summary", file: page("summary"), overlays: (c) => summaryOverlays(c.report, c.name, c.birth, { bold: c.fonts.boldItalic, semi: c.fonts.semi }, "full") },
    { kind: "template", file: page("Page_LoiCamOn") },
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
    const ownFooter = replaceTemplateContents(ctx, page, spec.file);
    out.addPage(page);
    for (const item of spec.overlays?.(ctx) ?? []) {
      page.drawText(item.text, { x: item.x, y: item.y, size: item.size, font: item.font === "bold" ? ctx.fonts.boldItalic : ctx.fonts.semi, color: item.color });
    }
    spec.patch?.(ctx, page);
    if (ownFooter) drawFooter(ctx, page, index);
  }
  return out.save();
}
