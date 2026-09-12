import { describe, expect, it } from "vitest";
import { analyzeSim } from "../index";
import { detectCarrier, normalizePhone } from "../carriers";
import { getHexagram } from "../../menh-thu/metaphysics";

/** Danh sách 64 tên quẻ hợp lệ, sinh trực tiếp từ bảng quẻ dùng chung. */
const VALID_HEXAGRAM_NAMES = new Set<string>();
for (let mask = 0; mask < 64; mask += 1) {
  const lines = Array.from({ length: 6 }, (_, index) => ((mask >> index) & 1 ? 7 : 8));
  VALID_HEXAGRAM_NAMES.add(getHexagram(lines).primary.name);
}

describe("chuẩn hoá số điện thoại", () => {
  it("giữ nguyên số nội địa đã đúng", () => {
    expect(normalizePhone("0987654321")).toBe("0987654321");
  });

  it("quy tiền tố +84 và 84 về 0, bỏ khoảng trắng và dấu chấm", () => {
    expect(normalizePhone("+84 987 654 321")).toBe("0987654321");
    expect(normalizePhone("84987654321")).toBe("0987654321");
    expect(normalizePhone("098.765.4321")).toBe("0987654321");
  });

  it("từ chối số 9 chữ số, số chứa chữ cái và chuỗi rỗng", () => {
    expect(() => normalizePhone("987654321")).toThrow();
    expect(() => normalizePhone("098765432a")).toThrow();
    expect(() => normalizePhone("   ")).toThrow();
    expect(() => analyzeSim({ phone: "12345" })).toThrow();
  });
});

describe("nhận diện nhà mạng", () => {
  it("khớp đúng bảng đầu số Việt Nam", () => {
    expect(detectCarrier("0987654321")).toBe("Viettel");
    expect(detectCarrier("0321234567")).toBe("Viettel");
    expect(detectCarrier("0861234567")).toBe("Viettel");
    expect(detectCarrier("0912345678")).toBe("Vinaphone");
    expect(detectCarrier("0941234567")).toBe("Vinaphone");
    expect(detectCarrier("0851234567")).toBe("Vinaphone");
    expect(detectCarrier("0901234567")).toBe("Mobifone");
    expect(detectCarrier("0931234567")).toBe("Mobifone");
    expect(detectCarrier("0701234567")).toBe("Mobifone");
    expect(detectCarrier("0891234567")).toBe("Mobifone");
    expect(detectCarrier("0521234567")).toBe("Vietnamobile");
    expect(detectCarrier("0561234567")).toBe("Vietnamobile");
    expect(detectCarrier("0581234567")).toBe("Vietnamobile");
    expect(detectCarrier("0921234567")).toBe("Vietnamobile");
    expect(detectCarrier("0591234567")).toBe("Gmobile");
    expect(detectCarrier("0991234567")).toBe("Gmobile");
    expect(detectCarrier("0871234567")).toBe("Itelecom");
    expect(detectCarrier("0201234567")).toBe("Không xác định");
  });
});

describe("quẻ Kinh Dịch từ dãy số", () => {
  it("trả về tên quẻ hợp lệ cho cả quẻ chủ, quẻ hỗ và quẻ biến", () => {
    const report = analyzeSim({ phone: "0987654321" });
    for (const name of [report.hexagram.primary, report.hexagram.mutual, report.hexagram.changing]) {
      expect(name).toBeTruthy();
      expect(VALID_HEXAGRAM_NAMES.has(name)).toBe(true);
    }
  });

  it("sinh đúng 6 hào âm/dương và không có hào động", () => {
    const report = analyzeSim({ phone: "0987654321" });
    expect(report.hexagram.lines).toHaveLength(6);
    expect(report.hexagram.lines.every((value) => value === 7 || value === 8)).toBe(true);
    expect(report.hexagram.changingLine).toBe(0);
    expect(report.hexagram.movingLines).toEqual([]);
  });
});

describe("ngũ hành và âm dương", () => {
  it("tổng số lần quy đổi bằng 10 trừ số chữ số 0", () => {
    const report = analyzeSim({ phone: "0202020202" });
    const total = Object.values(report.elements.counts).reduce((sum, value) => sum + value, 0);
    expect(total).toBe(10 - 5);
    expect(report.elements.dominant).toBe("Thổ");
  });

  it("liệt kê đúng các hành khuyết", () => {
    const report = analyzeSim({ phone: "0202020202" });
    expect(report.elements.missing).toHaveLength(4);
    expect(report.elements.missing).toEqual(expect.arrayContaining(["Mộc", "Hỏa", "Kim", "Thủy"]));
    expect(report.elements.lastDigitElement).toBe("Thổ");

    const full = analyzeSim({ phone: "0987654321" });
    expect(full.elements.missing).toEqual([]);
  });

  it("chẵn/lẻ khớp độ dài dãy số", () => {
    const report = analyzeSim({ phone: "0202020202" });
    expect(report.yinYang.yin + report.yinYang.yang).toBe(10);
    expect(report.yinYang.yin).toBe(10);
    expect(report.yinYang.yang).toBe(0);
    expect(report.yinYang.balanced).toBe(false);
  });
});

describe("đối chiếu bản mệnh", () => {
  it("trả null khi không có ngày sinh", () => {
    expect(analyzeSim({ phone: "0987654321" }).personalFit).toBeNull();
    expect(analyzeSim({ phone: "0987654321", birthDate: "không-hợp-lệ" }).personalFit).toBeNull();
  });

  it("trả kết quả đối chiếu khi có ngày sinh hợp lệ", () => {
    const report = analyzeSim({ phone: "0987654321", birthDate: "1992-05-12", birthTime: "08:30" });
    expect(report.personalFit).not.toBeNull();
    expect(report.personalFit?.supportElements.length).toBeGreaterThan(0);
    expect(report.personalFit?.matchScore).toBeGreaterThanOrEqual(0);
    expect(report.personalFit?.matchScore).toBeLessThanOrEqual(100);
    expect(report.personalFit?.note).toContain("Nhật chủ");
  });
});

describe("điểm và tính tất định", () => {
  it("mọi khối điểm nằm trong khoảng 0–100", () => {
    const report = analyzeSim({ phone: "0987654321", birthDate: "1990-01-01" });
    for (const method of report.methods) {
      expect(method.score).toBeGreaterThanOrEqual(0);
      expect(method.score).toBeLessThanOrEqual(100);
      expect(method.bullets.length).toBeGreaterThanOrEqual(3);
    }
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
  });

  it("bỏ khối bản mệnh và chuẩn hoá lại trọng số khi không có ngày sinh", () => {
    const report = analyzeSim({ phone: "0987654321" });
    expect(report.methods.map((method) => method.key)).toEqual(["iching", "element", "yin-yang", "folk"]);
  });

  it("cho cùng kết quả với cùng input", () => {
    const input = { phone: "+84 987 654 321", birthDate: "1992-05-12", birthTime: "08:30" } as const;
    expect(analyzeSim(input)).toEqual(analyzeSim(input));
  });

  it("chuẩn hoá số trong báo cáo và nhận diện nhà mạng", () => {
    const report = analyzeSim({ phone: "+84987654321" });
    expect(report.phone).toBe("0987654321");
    expect(report.carrier).toBe("Viettel");
    expect(report.notes.join(" ")).toContain("tham khảo");
  });
});
