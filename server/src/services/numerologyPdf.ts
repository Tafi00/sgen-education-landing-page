import { readFile } from "node:fs/promises";
import path from "node:path";
import * as fontkit from "fontkit";
import { PDFDocument, rgb, type PDFFont } from "pdf-lib";
import type { NumerologyFullReport } from "../../../shared/numerology.js";

/**
 * Sinh báo cáo PDF thiết kế giống `output3.pdf` gốc (port từ `main3.py`):
 * merge 18 trang template + vẽ overlay tên/ngày sinh/chỉ số/biểu đồ bằng font Faustina.
 * Khác bản gốc: các ô bản gốc in "?" (bug) được điền số thật; trang Sứ mệnh/Đường đời/Đam mê
 * chọn đúng file theo con số thay vì file cứng.
 */

// Asset đặt ở <cwd>/assets/numerology-pdf — khớp cả chạy tsx (project root) lẫn Docker (/app).
const ASSET_DIR = path.resolve(process.cwd(), "assets/numerology-pdf");

const PURPLE = rgb(0.5, 0, 0.5);
const RED = rgb(1, 0, 0);
const MAGENTA = rgb(199 / 255, 12 / 255, 129 / 255);
const BLACK = rgb(0, 0, 0);

type Overlay = { text: string; x: number; y: number; size: number; font: "bold" | "semi"; color: typeof PURPLE };

function metric(report: NumerologyFullReport, sectionId: string, key: string) {
  return report.sections.find((section) => section.id === sectionId)?.metrics.find((item) => item.key === key);
}

function metricValue(report: NumerologyFullReport, sectionId: string, key: string) {
  return metric(report, sectionId, key)?.value ?? "";
}

/** Tử số của giá trị dạng "13/4" → "13"; giá trị thường giữ nguyên. */
function numerator(value: string) {
  return value.split("/")[0];
}

async function loadDoc(file: string) {
  return PDFDocument.load(await readFile(file));
}

export async function buildNumerologyPdf(report: NumerologyFullReport): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  // @ts-expect-error fontkit types mismatch pdf-lib's bundled Fontkit interface but is runtime-compatible
  out.registerFontkit(fontkit);
  const bold = await out.embedFont(await readFile(path.join(ASSET_DIR, "fonts/Faustina-BoldItalic.ttf")));
  const semi = await out.embedFont(await readFile(path.join(ASSET_DIR, "fonts/Faustina-SemiBold.ttf")));
  const fonts: Record<Overlay["font"], PDFFont> = { bold, semi };

  const name = report.displayName.toUpperCase();
  const birth = report.birthDateLabel;

  /** Chép toàn bộ trang của một file template vào output, vẽ overlay lên trang đầu. */
  async function appendPages(file: string, overlays: Overlay[] = []) {
    const src = await loadDoc(file);
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const page of pages) out.addPage(page);
    if (overlays.length) {
      const target = pages[0];
      for (const item of overlays) {
        target.drawText(item.text, { x: item.x, y: item.y, size: item.size, font: fonts[item.font], color: item.color });
      }
    }
    return pages[0];
  }

  const page = (name_: string) => path.join(ASSET_DIR, "pages", `${name_}.pdf`);

  // 1. Bìa trước — tên + ngày sinh
  await appendPages(page("Page_01"), [
    { text: name, x: 300 - name.length * 6, y: 100, size: 28, font: "bold", color: PURPLE },
    { text: birth, x: 250, y: 60, size: 26, font: "bold", color: PURPLE },
  ]);
  // 2. Thông tin cá nhân
  await appendPages(page("Page_02"), [
    { text: name, x: 210, y: 330, size: 18, font: "bold", color: PURPLE },
    { text: birth, x: 210, y: 288, size: 18, font: "bold", color: PURPLE },
  ]);
  // 3. Mục lục
  await appendPages(page("Page_03"));
  // 4. Thư ngỏ — tên
  await appendPages(page("Page_04"), [{ text: name, x: 125, y: 746, size: 22, font: "bold", color: BLACK }]);
  // 5-7. Intro Pythagoras + mục đích
  await appendPages(page("Page_05"));
  await appendPages(page("Page_06"));
  await appendPages(page("Page_07"));
  // 8. Intro chương 3
  await appendPages(page("Page_08"));
  // 9. Intro Sứ mệnh
  await appendPages(page("Page_09"));
  // 10. Trang Sứ mệnh theo con số
  await appendPages(path.join(ASSET_DIR, "su-menh", `SuMenh_00${numerator(metricValue(report, "dinh-huong-su-nghiep", "destiny"))}.pdf`));
  // 11. Intro Đường đời
  await appendPages(page("Page_11"));
  // 12. Trang Đường đời theo con số
  await appendPages(path.join(ASSET_DIR, "duong-doi", `DuongDoi_00${numerator(metricValue(report, "dinh-huong-su-nghiep", "lifePath"))}.pdf`));
  // 13. Intro Đam mê
  await appendPages(page("Page_13"));
  // 14. Trang Đam mê theo con số (lấy số đầu nếu nhiều)
  const passionValue = metric(report, "dinh-huong-su-nghiep", "passion")?.values?.[0] ?? metricValue(report, "dinh-huong-su-nghiep", "passion").split(",")[0];
  await appendPages(path.join(ASSET_DIR, "dam-me", `DamMe_00${numerator(passionValue)}.pdf`));
  // 15. Kết luận
  await appendPages(page("Page_15"));
  // 16. Trang tổng hợp — overlay toàn bộ chỉ số + biểu đồ
  await appendPages(page("summary"), summaryOverlays(report, name, birth));
  // 17. Lời cảm ơn
  await appendPages(page("Page_LoiCamOn"));
  // 18. Bìa sau
  await appendPages(page("Page_BiaSau"));

  return out.save();
}

/** Overlay trang tổng hợp: tọa độ port nguyên từ `main3.py`, điền số thật thay "?". */
function summaryOverlays(report: NumerologyFullReport, name: string, birth: string): Overlay[] {
  const o: Overlay[] = [];
  const put = (text: string, x: number, y: number, size = 22, font: Overlay["font"] = "semi", color = RED) => {
    if (text) o.push({ text, x, y, size, font, color });
  };

  // Tên + ngày sinh (đầu trang)
  put(name, 139, 817, 18, "bold", PURPLE);
  put(birth, 465, 819, 18, "bold", PURPLE);

  const wide = (value: string) => (value.length > 3 ? -10 : 0);
  const comma = (value: string) => (value.match(/,/g) ?? []).length * -8;

  // Hàng 1 — Thế giới bên trong: Nội tâm / Tiềm thức / Logic / Cảm xúc / Trực giác / Trải nghiệm
  const inner = "the-gioi-ben-trong";
  put(metricValue(report, inner, "soul"), 100 + wide(metricValue(report, inner, "soul")), 677);
  put(metricValue(report, inner, "subconscious"), 185 + wide(metricValue(report, inner, "subconscious")), 677);
  put(metricValue(report, inner, "logic"), 265 + wide(metricValue(report, inner, "logic")), 677);
  put(metricValue(report, inner, "emotion"), 350 + wide(metricValue(report, inner, "emotion")), 677);
  put(metricValue(report, inner, "intuition"), 430 + wide(metricValue(report, inner, "intuition")), 677);
  put(metricValue(report, inner, "experience"), 515 + wide(metricValue(report, inner, "experience")), 677);

  // Hàng 2 — Bên ngoài + Phát triển: Tương tác / Thái độ / Số lặp / Cân bằng / Bài học / Nợ nghiệp
  const outer = "the-gioi-ben-ngoai";
  const growth = "phat-trien-ban-than";
  const repeated = metricValue(report, outer, "repeated");
  const missing = metricValue(report, growth, "missing");
  const debts = metricValue(report, growth, "debts");
  put(metricValue(report, outer, "interaction"), 100 + wide(metricValue(report, outer, "interaction")), 580);
  put(metricValue(report, outer, "attitude"), 185 + wide(metricValue(report, outer, "attitude")), 580);
  put(repeated, 265 + comma(repeated), 580);
  put(metricValue(report, growth, "balance"), 350 + wide(metricValue(report, growth, "balance")), 580);
  put(missing, 360 + comma(missing), 580);
  put(debts, 515 + comma(debts), 580);

  // Hàng 3 — Định hướng: Năm cá nhân / Sứ mệnh / Đường đời / Ngày sinh / Trưởng thành / Đam mê
  const career = "dinh-huong-su-nghiep";
  const personalYear = metricValue(report, career, "personalYear");
  const destiny = metricValue(report, career, "destiny");
  const lifePath = metricValue(report, career, "lifePath");
  const birthNumber = metricValue(report, career, "birthNumber");
  const maturity = metricValue(report, career, "maturity");
  const passion = metricValue(report, career, "passion");
  put(personalYear, 100 + wide(personalYear), 480);
  put(destiny, 185 + wide(destiny), 480);
  put(lifePath, 265 + wide(lifePath), 480);
  put(birthNumber, 350 + wide(birthNumber), 480);
  put(maturity, 430 + wide(maturity), 480);
  put(passion, 515 + comma(passion) + (passion.length > 7 ? 5 : 0), 480, passion.length > 7 ? 18 : 22);

  // Biểu đồ chặng đường đời: 3 gốc + 4 đỉnh + khoảng tuổi
  const chart = report.lifePathChart;
  const p = chart.pinnacles;
  const pw = (value: string) => (value.length > 3 ? -8 : 0);
  put(p[3]?.value ?? "", 198 + pw(p[3]?.value ?? ""), 415, 11);
  put(p[2]?.value ?? "", 198 + pw(p[2]?.value ?? ""), 348, 11);
  put(p[1]?.value ?? "", 243 + pw(p[1]?.value ?? ""), 297, 11);
  put(p[0]?.value ?? "", 149 + pw(p[0]?.value ?? ""), 297, 11);
  put(chart.month, 91 + pw(chart.month), 240, 11);
  put(chart.year, 296 + pw(chart.year), 240, 11);
  put(chart.birthNumber, 198 + pw(chart.birthNumber), 240, 11);
  for (const [index, node] of p.entries()) {
    if (!node.range) continue;
    const pos = [
      [137, 270],
      [232, 270],
      [185, 323],
      [185, 388],
    ][index];
    put(node.range.replace(/\s*–\s*/g, " - "), pos[0], pos[1], 11, "semi", MAGENTA);
  }

  // Nguồn lực hỗ trợ: kết nối Nội tâm–Tương tác, Sứ mệnh–Đường đời
  const support = "nguon-luc-ho-tro";
  put(metricValue(report, support, "soulInteraction"), 110, 100, 22, "semi", MAGENTA);
  put(metricValue(report, support, "destinyLifePath"), 190, 100, 22, "semi", MAGENTA);

  // Biểu đồ Ikigai: Đam mê / Sứ mệnh / Chuyên môn / Sự nghiệp
  const ik = report.ikigai;
  const passionText = ik.passion.join(",");
  const expertiseText = ik.expertise.join(",");
  const careerText = ik.career.join(",");
  put(passionText, 395 - (passionText.match(/,/g) ?? []).length * 5, 350, 16);
  put(ik.mission, 468, 350, 16);
  put(expertiseText, 395 - (expertiseText.match(/,/g) ?? []).length * 5, 270, 16);
  put(careerText, 470 - (careerText.match(/,/g) ?? []).length * 5, 270, 16);

  // Biểu đồ ngày sinh + họ tên: lặp chữ số theo tần suất
  const drawChart = (counts: Record<number, number>, columns: [number, number, number]) => {
    const rows = [
      { digits: [1, 4, 7], y: 80 },
      { digits: [2, 5, 8], y: 120 },
      { digits: [3, 6, 9], y: 160 },
    ];
    for (const row of rows) {
      for (const [col, digit] of row.digits.entries()) {
        const count = counts[digit] ?? 0;
        let x = columns[col] - count * 2.5;
        for (let i = 0; i < count; i += 1) {
          put(String(digit), x, row.y, 11);
          x += 7;
        }
      }
    }
  };
  drawChart(report.birthChart, [266, 310, 355]);
  drawChart(report.nameChart, [440, 485, 530]);

  return o;
}
