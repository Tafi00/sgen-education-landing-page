import { describe, expect, it } from "vitest";
import { castHexagram, castMomentVN, dayStemAt, HIDDEN_MOVING_BY_STEM } from "../menh-thu/hidden-moving";
import { getFourPillars, getHexagramByTrigramOrder } from "../menh-thu/metaphysics";

/** Tìm một ngày dương lịch có Thiên Can (và Địa Chi nếu cần) cho trước. */
function findDay(stem: string, branch?: string) {
  const start = Date.UTC(2026, 0, 1);
  for (let offset = 0; offset < 120; offset += 1) {
    const date = new Date(start + offset * 86_400_000).toISOString().slice(0, 10);
    const day = getFourPillars(date, "12:00", 105.833, 7, "civil").pillars[2];
    if (day.stem === stem && (!branch || day.branch === branch)) return date;
  }
  throw new Error(`không tìm thấy ngày ${stem} ${branch ?? ""}`);
}

const yangBits = (lines: number[]) => lines.map((value) => (value === 7 || value === 9 ? 1 : 0));

/** Quẻ tĩnh toàn dương, toàn âm và vài mẫu hỗn hợp: đủ cả hai trường hợp hào được chọn là âm / dương. */
const STATIC_CASTS: number[][] = [
  [7, 7, 7, 7, 7, 7],
  [8, 8, 8, 8, 8, 8],
  [7, 7, 7, 8, 8, 7],
  [8, 7, 8, 7, 8, 7],
  [7, 8, 8, 7, 7, 8],
];

describe("bảng hào Ám động theo Thiên Can", () => {
  it("khớp tài liệu SGEN: Đinh/Nhâm 3, Ất/Canh 4, Tân/Bính 1, Mậu/Quý 2, Giáp 5, Kỷ 6", () => {
    expect(HIDDEN_MOVING_BY_STEM).toEqual({ Đinh: 3, Nhâm: 3, Ất: 4, Canh: 4, Tân: 1, Bính: 1, Mậu: 2, Quý: 2, Giáp: 5, Kỷ: 6 });
  });
});

describe("castHexagram — quẻ không có hào động", () => {
  it("ca kiểm thử của tài liệu: ngày Đinh Mão, quẻ chủ 7/1 Sơn Thiên Đại Súc → quẻ biến 7/2 Sơn Trạch Tổn", () => {
    const date = findDay("Đinh", "Mão");
    const lines = [7, 7, 7, 8, 8, 7]; // Cấn trên Càn dưới
    const cast = castHexagram(lines, { solarDate: date, time: "10:30" });
    expect(cast.hexagram.primary.number).toBe(getHexagramByTrigramOrder(7, 1)!.number);
    expect(cast.hexagram.changed.number).toBe(getHexagramByTrigramOrder(7, 2)!.number);
    expect(cast.hidden).toMatchObject({ position: 3, stem: "Đinh", polarity: "Dương", change: "Dương → Âm" });
    expect(cast.movingLines).toEqual([3]);
    expect(cast.hidden?.notice).toBe("Không có hào động từ kết quả gieo. Áp dụng hào Ám động tại hào 3 theo Thiên Can Đinh của ngày gieo quẻ.");
  });

  for (const [stem, position] of Object.entries(HIDDEN_MOVING_BY_STEM)) {
    it(`Thiên Can ${stem}: chỉ đảo đúng hào ${position}, quẻ biến khác quẻ chủ (cả hào âm lẫn dương)`, () => {
      const date = findDay(stem);
      for (const lines of STATIC_CASTS) {
        const cast = castHexagram(lines, { solarDate: date, time: "09:00" });
        expect(cast.hidden?.position).toBe(position);
        expect(cast.hidden?.stem).toBe(stem);

        const primary = yangBits(lines);
        const changed = primary.map((bit, index) => (index === position - 1 ? 1 - bit : bit));
        // Quẻ chủ giữ nguyên sáu hào.
        expect(yangBits(cast.lines)).toEqual(primary);
        // Đúng một hào đổi, năm hào còn lại giữ nguyên.
        expect(changed.filter((bit, index) => bit !== primary[index])).toHaveLength(1);
        expect(cast.hexagram.changed.number).not.toBe(cast.hexagram.primary.number);
        // Tên quẻ biến khớp hình quẻ biến dựng độc lập.
        const bits = primary.map((bit, index) => (index === position - 1 ? 1 - bit : bit));
        const upper = bits.slice(3).join("");
        const lower = bits.slice(0, 3).join("");
        expect(cast.hexagram.changed.upper.key).toBe(upper);
        expect(cast.hexagram.changed.lower.key).toBe(lower);
        expect(cast.hexagram.movingDetails).toHaveLength(1);
        expect(cast.hexagram.movingDetails[0].position).toBe(position);
      }
    });
  }

  it("hào Ám động đổi đúng chiều: dương → âm và âm → dương", () => {
    const date = findDay("Đinh"); // hào 3
    const yang = castHexagram([7, 8, 7, 8, 8, 8], { solarDate: date, time: "09:00" });
    const yin = castHexagram([7, 8, 8, 8, 8, 8], { solarDate: date, time: "09:00" });
    expect(yang.hidden).toMatchObject({ polarity: "Dương", change: "Dương → Âm" });
    expect(yin.hidden).toMatchObject({ polarity: "Âm", change: "Âm → Dương" });
  });
});

describe("castHexagram — đã có hào động", () => {
  it("giữ nguyên quy tắc hiện có, không áp dụng hào Ám động", () => {
    const date = findDay("Đinh");
    const lines = [7, 7, 9, 8, 8, 6];
    const cast = castHexagram(lines, { solarDate: date, time: "09:00" });
    expect(cast.hidden).toBeNull();
    expect(cast.lines).toEqual(lines);
    expect(cast.movingLines).toEqual([3, 6]);
  });

  it("đòi đủ sáu hào", () => {
    expect(() => castHexagram([7, 8], { solarDate: "2026-10-20", time: "09:00" })).toThrow();
  });
});

describe("ngày dùng để xác định Thiên Can", () => {
  it("đổi Thiên Can đúng nửa đêm giờ Việt Nam (23:59 vs 00:01)", () => {
    const before = dayStemAt({ solarDate: "2026-10-20", time: "23:59" });
    const after = dayStemAt({ solarDate: "2026-10-21", time: "00:01" });
    const sameDay = dayStemAt({ solarDate: "2026-10-20", time: "00:01" });
    expect(before).toBe(sameDay);
    expect(after).not.toBe(before);
  });

  it("castMomentVN lấy ngày theo Asia/Ho_Chi_Minh, không theo múi giờ máy", () => {
    // 18:30 UTC ngày 20/10 = 01:30 ngày 21/10 giờ Việt Nam.
    expect(castMomentVN(new Date("2026-10-20T18:30:00Z"))).toEqual({ solarDate: "2026-10-21", time: "01:30" });
    // 16:59 UTC = 23:59 cùng ngày giờ Việt Nam.
    expect(castMomentVN(new Date("2026-10-20T16:59:00Z"))).toEqual({ solarDate: "2026-10-20", time: "23:59" });
  });
});
