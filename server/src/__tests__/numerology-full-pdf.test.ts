import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { inflateSync } from "node:zlib";
import * as fontkit from "fontkit";
import { PDFArray, PDFDocument, PDFName, PDFRawStream, type PDFFont, type PDFPage } from "pdf-lib";
import { beforeAll, describe, expect, it } from "vitest";
import { calculateFullNumerologyReport } from "../../../shared/numerology";
import { buildEbookPdf } from "../services/ebookPdf";
import { NUMEROLOGY_CONTENT } from "../services/numerologyContent";
import { METRIC_TITLES, metricValueBlock, metricValues, type MetricKey } from "../services/numerologyFullContent";
import {
  INTRO_PAGES,
  VALUE_PAGE_INDEX_FILE,
  decodeContents,
  originalValuePage,
  stripTemplateSource,
  type TemplateStrip,
  type ValuePageIndex,
} from "../services/numerologyFullPdf";

const ASSET_DIR = path.resolve(process.cwd(), "assets/numerology-pdf");
const FOOTER_PREFIX = "https:/www.Thansohuongnghiep.com - Hotline : 0903.891.839 - Trang  ";

let footerFont: PDFFont;
let bodyFont: PDFFont;
let valuePages: ValuePageIndex;

beforeAll(async () => {
  valuePages = JSON.parse(await readFile(VALUE_PAGE_INDEX_FILE, "utf8"));
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
    // Sau trang tổng hợp: Lời cảm ơn, Cảm nhận khách hàng, bìa sau.
    const summaryIndex = doc.getPageCount() - 4;
    expect(summaryIndex).not.toBe(70);
    expect(pageOperators(doc.getPage(2)).includes(encoded(bodyFont, pad(summaryIndex)))).toBe(true);
  }, 60_000);

  it("hồ sơ mẫu Elon Reeve Musk ra đúng 76 trang như bảng chuẩn, trang luận giải là đúng trang của bản chuẩn", async () => {
    const { report, doc } = await buildFull("Elon Reeve Musk", "1971-06-28");
    expect(doc.getPageCount()).toBe(76);
    const pages = Object.entries(INTRO_PAGES)
      .filter(([key]) => key !== "debts")
      .flatMap(([key, slug]) => metricValues(report, key).map((value) => originalValuePage(valuePages, slug, value)));
    const pinnacles = report.lifePathChart.pinnacles.map((node, index) => originalValuePage(valuePages, `dinh-${index + 1}`, node.value));
    // Tên tệp tách từ bảng chuẩn 76 trang (28/10/2026); Tương tác 19/1 dùng trang số 1 như bảng chuẩn in.
    expect([...pages, ...pinnacles]).toEqual([
      "noi-tam-2", "tiem-thuc-7", "logic-8", "cam-xuc-7", "truc-giac-9", "trai-nghiem-6", "so-lap-1", "so-lap-7", "thai-do-7",
      "tuong-tac-1", "can-bang-9", "bai-hoc-nghiep-7", "bai-hoc-nghiep-8", "nam-ca-nhan-8", "ngay-sinh-1", "truong-thanh-1",
      "ket-noi-noi-tam-tuong-tac-1", "ket-noi-su-menh-duong-doi-4", "dinh-1-7", "dinh-2-1", "dinh-3-8", "dinh-4-6",
    ]);
  }, 60_000);

  it("mọi con số web tính ra đều có trang gốc của phần mềm (trừ Tiềm thức 1–2 bộ gốc không có)", () => {
    const missing = new Set<string>();
    const names = ["PHẠM BÁ NHA", "LÊ HOÀNG MINH KHÔI", "LÝ LY", "NGUYỄN THỊ MINH KHAI", "ELON REEVE MUSK", "TRẦN ANH"];
    for (const [nameIndex, name] of names.entries()) {
      // Mỗi tên một dải ngày sinh khác nhau để quét đủ các con số (gồm 11/2, 22/4 và nợ nghiệp 13/14/16/19).
      for (let day = 0; day < 800; day += 1) {
        const birth = new Date(Date.UTC(1950 + nameIndex * 9, 0, 1 + day * 3)).toISOString().slice(0, 10);
        const report = calculateFullNumerologyReport(name, birth, 2026);
        for (const [key, slug] of Object.entries(INTRO_PAGES)) {
          if (key === "debts") continue;
          for (const value of metricValues(report, key)) {
            if (key === "subconscious" && Number(value) < 3) continue;
            if (!originalValuePage(valuePages, slug, value)) missing.add(`${key} ${value}`);
          }
        }
        report.lifePathChart.pinnacles.forEach((node, index) => {
          if (!originalValuePage(valuePages, `dinh-${index + 1}`, node.value)) missing.add(`đỉnh ${index + 1} ${node.value}`);
        });
      }
    }
    expect([...missing]).toEqual([]);
  });

  it("bảng trang theo con số tra theo số đầu, có đủ tệp trong assets/numerology-pdf/chuan", async () => {
    expect(originalValuePage(valuePages, "noi-tam", "11/2")).toBe("noi-tam-11");
    expect(originalValuePage(valuePages, "noi-tam", "22/4")).toBe("noi-tam-22");
    expect(originalValuePage(valuePages, "tuong-tac", "19/1")).toBe(originalValuePage(valuePages, "tuong-tac", "1"));
    expect(originalValuePage(valuePages, "ket-noi-noi-tam-tuong-tac", "0")).toBe("ket-noi-noi-tam-tuong-tac-0");
    expect(originalValuePage(valuePages, "tiem-thuc", "2")).toBeUndefined();
    expect(originalValuePage(valuePages, undefined, "2")).toBeUndefined();
    const files = new Set(Object.values(valuePages).flatMap((pages) => Object.values(pages)));
    expect(files.size).toBeGreaterThan(150);
    for (const slug of files) await expect(access(path.join(ASSET_DIR, "chuan", `${slug}.pdf`)), slug).resolves.toBeUndefined();
  });

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
  });
});
