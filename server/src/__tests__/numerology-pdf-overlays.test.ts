import { readFile } from "node:fs/promises";
import path from "node:path";
import * as fontkit from "fontkit";
import { PDFDocument, type PDFFont } from "pdf-lib";
import { beforeAll, describe, expect, it } from "vitest";
import { calculateFullNumerologyReport } from "../../../shared/numerology";
import { DEMO_METRIC_KEYS, SUMMARY_CELL_CENTERS, SUMMARY_CELL_INNER_WIDTH, summaryOverlays, type Overlay, type OverlayFonts } from "../services/numerologyPdf";

const ASSET_DIR = path.resolve(process.cwd(), "assets/numerology-pdf");
const ROW_Y = { inner: 677, outer: 580, career: 480 } as const;
const MAGENTA = [199 / 255, 12 / 255, 129 / 255];

let fonts: OverlayFonts;

beforeAll(async () => {
  const doc = await PDFDocument.create();
  // @ts-expect-error fontkit types mismatch pdf-lib's bundled Fontkit interface but is runtime-compatible
  doc.registerFontkit(fontkit);
  const bold = await doc.embedFont(await readFile(path.join(ASSET_DIR, "fonts/Faustina-BoldItalic.ttf")));
  const semi = await doc.embedFont(await readFile(path.join(ASSET_DIR, "fonts/Faustina-SemiBold.ttf")));
  fonts = { bold, semi } satisfies Record<"bold" | "semi", PDFFont>;
});

/** Bộ sinh số giả ngẫu nhiên có hạt giống để test lặp lại được. */
function rng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const SURNAMES = ["NGUYỄN", "TRẦN", "LÊ", "PHẠM", "HOÀNG", "VŨ", "ĐẶNG", "BÙI", "NGÔ", "TRƯƠNG"];
const MIDDLES = ["VĂN", "THỊ", "THANH", "MINH", "QUỐC", "NGỌC", "HỮU", "ĐỨC", "ANH", "KIM"];
const GIVEN = ["TÙNG", "LAN", "HƯNG", "TRANG", "QUÂN", "VY", "NHẬT", "PHÚC", "OANH", "KHÁNH", "DUY", "HẰNG"];

function profiles(count: number) {
  const next = rng(20261020);
  const pick = <T,>(list: T[]) => list[Math.floor(next() * list.length)];
  return Array.from({ length: count }, () => {
    const year = 1940 + Math.floor(next() * 80);
    const month = 1 + Math.floor(next() * 12);
    const day = 1 + Math.floor(next() * 28);
    return { name: `${pick(SURNAMES)} ${pick(MIDDLES)} ${pick(GIVEN)}`, birth: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}` };
  });
}

function build(name: string, birth: string, edition: "demo" | "full" = "full") {
  const report = calculateFullNumerologyReport(name, birth, 2026);
  return { report, overlays: summaryOverlays(report, report.displayName.toUpperCase(), report.birthDateLabel, fonts, edition) };
}

const box = (item: Overlay) => ({ left: item.x, right: item.x + fonts[item.font].widthOfTextAtSize(item.text, item.size) });
const cellOf = (item: Overlay) => {
  const { left, right } = box(item);
  const middle = (left + right) / 2;
  return SUMMARY_CELL_CENTERS.reduce((best, center, index) => (Math.abs(center - middle) < Math.abs(SUMMARY_CELL_CENTERS[best] - middle) ? index : best), 0);
};
const rowItems = (overlays: Overlay[], y: number) => overlays.filter((item) => item.y === y);

describe("trang tổng hợp ebook — không chồng số, không tràn ô", () => {
  it("hồ sơ mẫu PHẠM THANH TÙNG 02/09/2010: Cân bằng và Bài học nghiệp nằm riêng từng ô", () => {
    const { report, overlays } = build("PHẠM THANH TÙNG", "2010-09-02");
    const growth = report.sections.find((section) => section.id === "phat-trien-ban-than")!;
    const balance = growth.metrics.find((metric) => metric.key === "balance")!.value;
    const missing = growth.metrics.find((metric) => metric.key === "missing")!.value;
    const row = rowItems(overlays, ROW_Y.outer);
    const balanceItem = row.find((item) => item.text === balance && cellOf(item) === 3)!;
    const missingItem = row.find((item) => item.text === missing && cellOf(item) === 4)!;
    expect(balanceItem).toBeTruthy();
    expect(missingItem).toBeTruthy();
    expect(box(balanceItem).right).toBeLessThan(box(missingItem).left);
  });

  it("500 hồ sơ ngẫu nhiên: mọi giá trị nằm gọn trong ô của nó và không đè ô bên cạnh", () => {
    const half = SUMMARY_CELL_INNER_WIDTH / 2;
    for (const { name, birth } of profiles(500)) {
      const { overlays } = build(name, birth);
      for (const y of Object.values(ROW_Y)) {
        const row = rowItems(overlays, y).sort((a, b) => a.x - b.x);
        for (const item of row) {
          const { left, right } = box(item);
          const center = SUMMARY_CELL_CENTERS[cellOf(item)];
          expect(left, `${name} ${birth} "${item.text}" tràn trái`).toBeGreaterThanOrEqual(center - half - 0.01);
          expect(right, `${name} ${birth} "${item.text}" tràn phải`).toBeLessThanOrEqual(center + half + 0.01);
        }
        for (let index = 1; index < row.length; index += 1) {
          expect(box(row[index - 1]).right, `${name} ${birth} y=${y}: "${row[index - 1].text}" đè "${row[index].text}"`).toBeLessThan(box(row[index]).left);
        }
      }
    }
  });

  it("màu: 10 chỉ số trong khung là hồng như hai chỉ số Nguồn lực hỗ trợ; Nội tâm, Tương tác và hàng Định hướng giữ đỏ", () => {
    const { overlays } = build("NGUYỄN VĂN AN", "1990-05-17");
    const isPink = (item: Overlay) => [item.color.red, item.color.green, item.color.blue].every((value, index) => Math.abs(value - MAGENTA[index]) < 1e-9);
    const support = overlays.filter((item) => item.y === 100);
    expect(support.length).toBe(2);
    expect(support.every(isPink)).toBe(true);

    for (const y of [ROW_Y.inner, ROW_Y.outer]) {
      for (const item of rowItems(overlays, y)) expect(isPink(item), `y=${y} ô ${cellOf(item)} "${item.text}"`).toBe(cellOf(item) !== 0);
    }
    for (const item of rowItems(overlays, ROW_Y.career)) expect(isPink(item), `Định hướng ô ${cellOf(item)}`).toBe(false);
  });

  it("màu hồng là đúng mã của bản gốc main3.py (199, 12, 129)", () => {
    const { overlays } = build("LÊ THỊ LAN", "1985-11-03");
    const support = overlays.find((item) => item.y === 100)!;
    expect([support.color.red * 255, support.color.green * 255, support.color.blue * 255].map(Math.round)).toEqual([199, 12, 129]);
  });

  it("ô không có giá trị giữ trống (không vẽ chữ)", () => {
    // Hồ sơ có Bài học nghiệp / Nợ nghiệp rỗng thì không được in "?" hay "—".
    for (const { name, birth } of profiles(200)) {
      const { overlays } = build(name, birth);
      expect(overlays.every((item) => item.text.trim() !== "" && item.text !== "?" && item.text !== "—")).toBe(true);
    }
  });
});

describe("bản demo 3 chỉ số", () => {
  it("chỉ hiện Sứ mệnh, Đường đời, Đam mê; không vẽ các ô và biểu đồ khác", () => {
    const { report, overlays } = build("PHẠM THANH TÙNG", "2010-09-02", "demo");
    const career = report.sections.find((section) => section.id === "dinh-huong-su-nghiep")!;
    const wanted = DEMO_METRIC_KEYS.map((key) => career.metrics.find((metric) => metric.key === key)!.value);
    expect(rowItems(overlays, ROW_Y.inner)).toHaveLength(0);
    expect(rowItems(overlays, ROW_Y.outer)).toHaveLength(0);
    expect(rowItems(overlays, ROW_Y.career).map((item) => item.text).sort()).toEqual([...wanted].sort());
    // Chỉ còn tên + ngày sinh (đầu trang) và 3 chỉ số.
    expect(overlays).toHaveLength(2 + 3);
  });

  it("bản đầy đủ vẫn có đủ các ô và biểu đồ", () => {
    const { overlays } = build("PHẠM THANH TÙNG", "2010-09-02", "full");
    expect(rowItems(overlays, ROW_Y.inner).length).toBeGreaterThanOrEqual(5);
    expect(rowItems(overlays, ROW_Y.outer).length).toBeGreaterThanOrEqual(4);
    expect(overlays.some((item) => item.y === 100)).toBe(true);
  });
});
