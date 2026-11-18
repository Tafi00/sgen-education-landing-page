import { describe, expect, it } from "vitest";
import { analyzeSimPhongThuy, buildLucHaoSheet } from "../sim-phong-thuy-engine";
import { getHexagram } from "../../menh-thu/metaphysics";

describe("lá quẻ Lục Hào dùng chung cho Gieo quẻ", () => {
  it("khớp số quẻ chủ/quẻ biến với bộ lập quẻ ba đồng xu", () => {
    const casts = [
      [7, 8, 9, 7, 6, 8],
      [7, 7, 7, 7, 7, 7],
      [8, 8, 8, 8, 8, 8],
      [9, 9, 6, 6, 7, 8],
      [6, 7, 8, 9, 7, 7],
    ];
    for (const cast of casts) {
      const hexagram = getHexagram(cast);
      const lines = cast.map((value) => (value === 7 || value === 9 ? 1 : 0));
      const movingLines = cast.flatMap((value, index) => (value === 6 || value === 9 ? [index + 1] : []));
      const sheet = buildLucHaoSheet({ lines, movingLines, solarDate: "2026-10-17", time: "10:30" });
      expect(sheet.primary.number).toBe(hexagram.primary.number);
      expect(sheet.changed.number).toBe(hexagram.changed.number);
      expect(sheet.primary.lines.filter((line) => line.isMoving).map((line) => line.position)).toEqual(movingLines);
      expect(sheet.primary.lines.map((line) => line.position)).toEqual([1, 2, 3, 4, 5, 6]);
    }
  });

  it("an đủ Lục Thân, Can Chi, Lục Thú cho sáu hào và đúng một Thế, một Ứng", () => {
    const sheet = buildLucHaoSheet({ lines: [1, 0, 1, 0, 1, 0], movingLines: [3], solarDate: "2026-10-17", time: "10:30" });
    for (const line of sheet.primary.lines) {
      expect(line.lucThan).toBeTruthy();
      expect(line.canChi).toBeTruthy();
      expect(line.lucThu).toBeTruthy();
    }
    expect(sheet.primary.lines.filter((line) => line.theUng === "Thế")).toHaveLength(1);
    expect(sheet.primary.lines.filter((line) => line.theUng === "Ứng")).toHaveLength(1);
  });

  it("khớp lá quẻ simkinhdich.com khách gửi: sim 0363881131, sinh 5/10/2002 08:00 (Lôi Thủy Giải → Địa Thủy Sư)", () => {
    const { lucHaoData: sheet } = analyzeSimPhongThuy({ phone: "0363881131", birthDate: "2002-10-05", birthTime: "08:00", gender: "Nam", calendarType: "solar" });
    expect(sheet.primary.name).toBe("Lôi Thủy Giải");
    expect(sheet.changed.name).toBe("Địa Thủy Sư");
    expect(sheet.meta.fourPillarsText).toBe("giờ Nhâm Thìn, ngày Bính Ngọ, tháng Kỷ Dậu, năm Nhâm Ngọ");
    expect([sheet.meta.nhatThan, sheet.meta.nguyetLenh]).toEqual(["Ngọ-Hỏa", "Dậu-Kim"]);
    // Hào 6 → 1. Quẻ biến xét Lục Thân theo cung quẻ chủ (Chấn - Mộc).
    const top = <T,>(lines: T[]) => [...lines].reverse();
    expect(top(sheet.changed.lines).map((l) => l.lucThan)).toEqual(["Quan Quỷ", "Phụ Mẫu", "Thê Tài", "Tử Tôn", "Thê Tài", "Huynh Đệ"]);
    expect(top(sheet.primary.lines).map((l) => [l.vuongTuong, l.tsNgay, l.tsThang])).toEqual([
      ["Hưu", "Thai", "Mộc Dục"], ["Vượng", "Mộc Dục", "Đế Vượng"], ["Tù", "Đế Vượng", "Tử"],
      ["Tù", "Đế Vượng", "Tử"], ["Hưu", "Thai", "Mộc Dục"], ["Tử", "Tử", "Thai"],
    ]);
    expect(top(sheet.changed.lines).map((l) => [l.vuongTuong, l.tsNgay, l.tsThang])).toEqual([
      ["Vượng", "Mộc Dục", "Đế Vượng"], ["Tướng", "Thai", "Mộc Dục"], ["Hưu", "Thai", "Mộc Dục"],
      ["Tù", "Đế Vượng", "Tử"], ["Hưu", "Thai", "Mộc Dục"], ["Tử", "Tử", "Thai"],
    ]);
    // Phục thần Phụ Mẫu Tý dưới hào 1; Tuần Không ngày Bính Ngọ là Dần, Mão.
    expect(top(sheet.primary.lines).map((l) => l.phucThan)).toEqual(["", "", "", "", "", "Phụ-Tý"]);
    expect(top(sheet.primary.lines).map((l) => l.tuanKhong)).toEqual(["", "", "", "", "", "K"]);
  });
});
