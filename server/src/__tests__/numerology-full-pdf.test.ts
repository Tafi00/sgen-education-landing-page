import { readFile } from "node:fs/promises";
import path from "node:path";
import { inflateSync } from "node:zlib";
import * as fontkit from "fontkit";
import { PDFArray, PDFDocument, PDFName, PDFRawStream, type PDFFont, type PDFPage } from "pdf-lib";
import { beforeAll, describe, expect, it } from "vitest";
import { calculateFullNumerologyReport } from "../../../shared/numerology";
import { buildEbookPdf } from "../services/ebookPdf";
import { NUMEROLOGY_CONTENT } from "../services/numerologyContent";
import { METRIC_TITLES, metricIntro, metricValueBlock, type MetricKey } from "../services/numerologyFullContent";
import { decodeContents, stripTemplateSource, type TemplateStrip } from "../services/numerologyFullPdf";

const ASSET_DIR = path.resolve(process.cwd(), "assets/numerology-pdf");
const FOOTER_PREFIX = "https:/www.Thansohuongnghiep.com - Hotline : 0903.891.839 - Trang  ";

let footerFont: PDFFont;
let bodyFont: PDFFont;

beforeAll(async () => {
  const doc = await PDFDocument.create();
  // @ts-expect-error fontkit types mismatch pdf-lib's bundled Fontkit interface but is runtime-compatible
  doc.registerFontkit(fontkit);
  footerFont = await doc.embedFont(await readFile(path.join(ASSET_DIR, "fonts/Faustina-BoldItalic.ttf")));
  bodyFont = await doc.embedFont(await readFile(path.join(ASSET_DIR, "fonts/Faustina-SemiBold.ttf")));
});

/** Toàn bộ lệnh vẽ của một trang (giải nén, nối các luồng) để dò chuỗi chữ đã mã hóa. */
function pageOperators(page: PDFPage) {
  const contents = page.node.Contents();
  const streams = contents instanceof PDFArray ? contents.asArray().map((ref) => page.node.context.lookup(ref)) : [contents];
  return streams
    .filter((stream): stream is PDFRawStream => stream instanceof PDFRawStream)
    .map((stream) => (stream.dict.get(PDFName.of("Filter")) ? inflateSync(stream.contents) : Buffer.from(stream.contents)).toString("latin1"))
    .join("\n");
}

const encoded = (font: PDFFont, text: string) => font.encodeText(text).toString();
const pad = (index: number) => String(index).padStart(2, "0");

async function buildFull(name: string, birth: string) {
  const report = calculateFullNumerologyReport(name, birth, 2026);
  const bytes = await buildEbookPdf("full", report, { phone: "0903891839" });
  return { report, bytes, doc: await PDFDocument.load(bytes) };
}

describe("ebook bản đầy đủ", () => {
  it("hơn 70 trang theo Mục lục gốc; bản demo vẫn 18 trang", async () => {
    // Gồm số chủ đạo (11/2, 22/4), nợ nghiệp, nhiều bài học nghiệp và đam mê nhiều con số.
    for (const [name, birth] of [
      ["PHẠM BÁ NHA", "1965-09-19"],
      ["LÊ HOÀNG MINH KHÔI", "1976-04-16"],
      ["LÝ LY", "2001-02-22"],
    ]) {
      const { doc } = await buildFull(name, birth);
      expect(doc.getPageCount(), `${name} ${birth}`).toBeGreaterThan(70);
    }
    const report = calculateFullNumerologyReport("PHẠM BÁ NHA", "1965-09-19", 2026);
    const demo = await PDFDocument.load(await buildEbookPdf("demo", report, { phone: "0903891839" }));
    expect(demo.getPageCount()).toBe(18);
  }, 60_000);

  it("chân trang mọi trang ghi đúng vị trí thật (bìa = 0), kể cả trang mẫu bị đẩy trang", async () => {
    const { doc } = await buildFull("LÝ LY", "2001-02-22");
    const pages = doc.getPages();
    for (const [index, page] of pages.entries()) {
      const ops = pageOperators(page);
      const own = encoded(footerFont, `${FOOTER_PREFIX}${pad(index)}`);
      const isCover = index === 0 || index === pages.length - 1;
      expect(ops.includes(own), `trang ${index}`).toBe(!isCover);
    }
  }, 60_000);

  it("Mục lục in lại số trang khi mục bị đẩy (hồ sơ nhiều bài học nghiệp)", async () => {
    const { doc } = await buildFull("LÝ LY", "2001-02-22");
    const summaryIndex = doc.getPageCount() - 3;
    expect(summaryIndex).not.toBe(70);
    expect(pageOperators(doc.getPage(2)).includes(encoded(bodyFont, pad(summaryIndex)))).toBe(true);
  }, 60_000);

  it("mọi trang mẫu bỏ được chân trang cũ và cặp xoáy góc theo template-strip.json", async () => {
    const strip: Record<string, TemplateStrip> = JSON.parse(await readFile(path.join(ASSET_DIR, "full/template-strip.json"), "utf8"));
    expect(Object.keys(strip).length).toBeGreaterThan(50);
    for (const [rel, info] of Object.entries(strip)) {
      const doc = await PDFDocument.load(await readFile(path.join(ASSET_DIR, rel)));
      const stream = doc.getPage(0).node.Contents();
      expect(stream, rel).toBeInstanceOf(PDFRawStream);
      const source = decodeContents(stream as PDFRawStream);
      const kept = stripTemplateSource(source, info);
      expect(kept, rel).not.toBeNull();
      const count = (pattern: RegExp) => (kept!.match(pattern) ?? []).length;
      expect(count(/(?<=[\0\t\n\f\r ]|^)q(?=[\0\t\n\f\r ])/g), `${rel} q/Q cân bằng`).toBe(count(/(?<=[\0\t\n\f\r ]|^)Q(?=[\0\t\n\f\r ])/g));
      expect(count(/\bBT\b/g), `${rel} BT/ET cân bằng`).toBe(count(/\bET\b/g));
      expect(count(/\bBT\b/g), rel).toBe(info.blocks - info.footer.length);
      if (info.swirls.length) expect(source.length - kept!.length, `${rel} bỏ cặp xoáy`).toBeGreaterThan(1_000_000);
    }
  }, 60_000);
});

describe("nội dung bản đầy đủ", () => {
  const keys = Object.keys(METRIC_TITLES) as MetricKey[];

  it("mọi con số có tiêu đề riêng và đoạn văn sạch (không còn số/nhãn dính đầu đoạn)", () => {
    for (const key of keys) {
      for (const value of Object.keys(NUMEROLOGY_CONTENT[key].byValue)) {
        const block = metricValueBlock(key, value);
        expect(block.heading, `${key} ${value}`).toBeTruthy();
        expect(block.heading!.startsWith("CHỈ SỐ"), `${key} ${value}: ${block.heading}`).toBe(false);
        expect(block.paragraphs.length, `${key} ${value}`).toBeGreaterThan(0);
        for (const paragraph of block.paragraphs) {
          expect(paragraph, `${key} ${value}`).not.toMatch(/^\d{1,2}(\/\d)?\s+\p{Lu}/u);
          expect(paragraph).not.toMatch(/[​-‍﻿]/);
        }
      }
    }
  });

  it("tiêu đề ghép đúng kiểu bản gốc", () => {
    expect(metricValueBlock("maturity", "7").heading).toBe("TRƯỞNG THÀNH SỐ 7 = CHUYÊN GIA");
    expect(metricValueBlock("missing", "9").heading).toBe("BÀI HỌC NGHIỆP 9 = BAO DUNG & GIÚP ĐỠ");
    expect(metricValueBlock("personalYear", "1").heading).toBe("NĂM CÁ NHÂN SỐ 1 = KHỞI ĐẦU & CHINH PHỤC");
    expect(metricValueBlock("repeated", "2").heading).toBe("SỐ LẶP 2");
    expect(metricIntro("destiny").heading).toBe("SỨ MỆNH = SỰ GIÚP ĐỠ");
  });

  it("trang giới thiệu có nội dung cho mọi chỉ số (trừ hai chỉ số kết nối — bản gốc không có đoạn giới thiệu)", () => {
    for (const key of keys) {
      const intro = metricIntro(key);
      expect(intro.heading, key).toBeTruthy();
      if (key !== "soulInteraction" && key !== "destinyLifePath") expect(intro.paragraphs.length, key).toBeGreaterThan(0);
    }
  });
});
