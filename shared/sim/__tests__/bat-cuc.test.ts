import { describe, expect, it } from "vitest";
import { BAT_CUC_DETAILS } from "../bat-cuc-chi-tiet";
import { analyzeBCLS, analyzeSimPhongThuy, BCLS, BCLS_SCORES } from "../sim-phong-thuy-engine";

describe("Bát Cực Linh Số theo bảng của khách", () => {
  it("điểm chấm từng sao đúng bảng: Sinh Khí +4 … Tuyệt Mệnh −4", () => {
    expect(BCLS_SCORES).toEqual({ SK: 4, TY: 3, DN: 2, PV: 1, LS: -1, NQ: -2, HH: -3, TM: -4 });
  });

  it("điểm, cặp số in trong bảng 5 cột khớp với cách chấm của công cụ", () => {
    for (const [code, detail] of Object.entries(BAT_CUC_DETAILS)) {
      expect(Number(detail.score), code).toBe(BCLS_SCORES[code]);
      for (const pair of detail.pairs) expect(BCLS.pairs[pair], `${code} ${pair}`).toBe(code);
    }
  });

  it("điểm nền quy về thang 0–100 theo mức ±4 của bảng", () => {
    // "91" là Diên Niên (+2), 8 cặp còn lại Sinh Khí (+4): 50 + 50 × 34 / (4 × 9) ≈ 97.
    expect(analyzeBCLS("9141414141").baseScore).toBe(97);
    expect(analyzeBCLS("1212121212").baseScore).toBe(0);
  });

  it("số 0 và 5 không có từ trường: bỏ qua, số trước nối với số kế tiếp (ví dụ của khách 31/10/2026)", () => {
    const result = analyzeBCLS("0909306578");
    expect(result.items.map((item) => [item.source, item.pair, item.name])).toEqual([
      ["0909", "99", "Phục Vị"],
      ["93", "93", "Sinh Khí"],
      ["306", "36", "Ngũ Quỷ"],
      ["657", "67", "Sinh Khí"],
      ["78", "78", "Diên Niên"],
    ]);
    expect(result.total).toBe(5);
    expect(analyzeSimPhongThuy({ phone: "0909306578" }).linhSo4Last.meaning).toBe("4 số cuối mang trường khí Sinh Khí, Diên Niên");
  });

  it("bảng cặp đúng 64 cặp của 8 chữ số có từ trường (không có 0, 5)", () => {
    const pairs = Object.keys(BCLS.pairs);
    expect(pairs).toHaveLength(64);
    expect(pairs.some((pair) => /[05]/.test(pair))).toBe(false);
    expect(analyzeBCLS("0505050505").items).toEqual([]);
  });
});
