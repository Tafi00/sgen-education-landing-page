import { describe, expect, it } from "vitest";
import { BAT_CUC_DETAILS } from "../bat-cuc-chi-tiet";
import { analyzeBCLS, BCLS, BCLS_SCORES } from "../sim-phong-thuy-engine";

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
    // "01" là Tuyệt Mệnh (−4) theo bảng cặp mở rộng; 8 cặp còn lại Sinh Khí (+4): 50 + 50 × 28 / (4 × 9) ≈ 89.
    expect(analyzeBCLS("0141414141").baseScore).toBe(89);
    expect(analyzeBCLS("0121212121").baseScore).toBe(0);
  });
});
