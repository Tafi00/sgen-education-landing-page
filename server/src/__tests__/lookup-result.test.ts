import { describe, expect, it } from "vitest";
import { calculateFullNumerologyReport } from "../../../shared/numerology";
import type { ResultBlock } from "../../../shared/lookup-types";
import { NUMEROLOGY_WEB_SECTIONS, numerologyPayload, numerologyWebPayload } from "../services/lookupResult";

const report = calculateFullNumerologyReport("Nguyễn Thị Quý", "2019-10-11", 2026);
const ofKind = <K extends ResultBlock["kind"]>(blocks: ResultBlock[], kind: K) =>
  blocks.filter((block): block is Extract<ResultBlock, { kind: K }> => block.kind === kind);

describe("kết quả Thần số học trên trang tra cứu (bản rút gọn)", () => {
  const web = numerologyWebPayload(report);

  it("chỉ có 8 chỉ số chủ đạo và ý nghĩa chi tiết của 8 chỉ số này", () => {
    const [metrics] = ofKind(web.blocks, "metrics");
    expect(metrics.heading).toBe("Tám chỉ số chủ đạo");
    expect(metrics.items.map((item) => item.label)).toEqual(report.metrics.map((metric) => metric.label));

    const details = ofKind(web.blocks, "metricDetail");
    expect(details).toHaveLength(1);
    const labels = details[0].items.map((item) => item.label);
    // 7 chỉ số đơn + "4 đỉnh cao" luận theo từng đỉnh.
    expect(labels.filter((label) => !label.startsWith("4 đỉnh cao"))).toEqual(
      report.metrics.filter((metric) => metric.key !== "peaks").map((metric) => metric.label),
    );
    expect(labels.filter((label) => /^4 đỉnh cao — Đỉnh \d \(.+ tuổi\)$/.test(label))).toHaveLength(4);
    for (const item of details[0].items) {
      expect(item.paragraphs.length).toBeGreaterThan(0);
      expect(item.paragraphs.some((paragraph) => /^ĐỈNH\s+\d+$/.test(paragraph.trim()))).toBe(false);
    }
  });

  it("không gửi Thư ngỏ, biểu đồ hay lời luận các chỉ số còn lại", () => {
    expect(web.blocks.map((block) => block.kind)).toEqual(["metrics", "section", "metricDetail", "section", "pdfTeaser"]);
    expect(ofKind(web.blocks, "text")).toHaveLength(0);
    expect(ofKind(web.blocks, "section").map((block) => block.id)).toEqual([NUMEROLOGY_WEB_SECTIONS.core.id, NUMEROLOGY_WEB_SECTIONS.ebook.id]);
  });

  it("phần dẫn về Tải PDF liệt kê các nhóm còn lại, không nhắc lại chỉ số chủ đạo", () => {
    const [teaser] = ofKind(web.blocks, "pdfTeaser");
    const titles = teaser.groups.map((group) => group.title);
    expect(titles).toEqual([...report.sections.map((section) => section.title), "Biểu đồ năng lượng", "Kết luận"]);
    const items = teaser.groups.flatMap((group) => group.items.map((item) => item.label));
    expect(items).toEqual(expect.arrayContaining(["Logic", "Cảm xúc", "Trực giác", "Cân bằng", "Bài học nghiệp", "Ngày sinh", "Đam mê", "Biểu đồ Ikigai"]));
    for (const core of ["Nội tâm", "Thái độ", "Tương tác", "Sứ mệnh", "Đường đời", "Trưởng thành"]) expect(items).not.toContain(core);
  });

  it("không gửi con số của các chỉ số chỉ có trong ebook (chỉ dấu gạch)", () => {
    const [teaser] = ofKind(web.blocks, "pdfTeaser");
    const values = teaser.groups.flatMap((group) => group.items.map((item) => item.value));
    expect(values.some((value) => /\d/.test(value))).toBe(false);
    const indexValues = teaser.groups.filter((group) => group.title !== "Biểu đồ năng lượng" && group.title !== "Kết luận").flatMap((group) => group.items.map((item) => item.value));
    expect(new Set(indexValues)).toEqual(new Set(["—"]));
  });

  it("có tên thường dùng thì thêm nhóm chỉ số theo tên thường dùng", () => {
    const withCommon = numerologyWebPayload(calculateFullNumerologyReport("Nguyễn Thị Quý", "2019-10-11", 2026, "Quý"));
    const [teaser] = ofKind(withCommon.blocks, "pdfTeaser");
    expect(teaser.groups.map((group) => group.title)).toContain("Chỉ số theo tên thường dùng");
  });
});

describe("báo cáo Thần số học lưu cho quản trị (bản đầy đủ)", () => {
  it("giữ nguyên Thư ngỏ, đủ các nhóm chỉ số, biểu đồ và kết luận", () => {
    const full = numerologyPayload(report);
    expect(ofKind(full.blocks, "text").some((block) => /thư ngỏ/i.test(block.heading ?? ""))).toBe(true);
    expect(ofKind(full.blocks, "section").map((block) => block.id)).toEqual([...report.sections.map((section) => section.id), "bieu-do", "ket-luan"]);
    expect(ofKind(full.blocks, "pinnacles")).toHaveLength(1);
    expect(ofKind(full.blocks, "ikigai")).toHaveLength(1);
    expect(ofKind(full.blocks, "chart3x3")).toHaveLength(2);
    expect(ofKind(full.blocks, "pdfTeaser")).toHaveLength(0);
    // Nhãn đỉnh của bản đầy đủ không đổi.
    expect(ofKind(full.blocks, "metricDetail").flatMap((block) => block.items.map((item) => item.label))).toContain(
      `Đỉnh 1 · ${report.lifePathChart.pinnacles[0].range} tuổi`,
    );
  });
});
