import { describe, expect, it } from "vitest";
import {
  analyzeSimPhongThuy,
  calcSimLifeHexagrams,
  normalizeVietnamesePhone,
  validateSimPhongThuyInput,
} from "../sim-phong-thuy-engine";

const DIGITS = "98765432109876543210";

describe("phân tích dãy số 4–20 chữ số", () => {
  for (let length = 4; length <= 20; length += 1) {
    it(`phân tích được dãy ${length} số`, () => {
      const phone = DIGITS.slice(0, length);
      expect(validateSimPhongThuyInput({ phone }).isValid).toBe(true);
      const result = analyzeSimPhongThuy({ phone });
      expect(result.phone).toBe(phone);
      expect(result.formattedPhone.replace(/ /g, "")).toBe(phone);
      const life = calcSimLifeHexagrams(phone);
      expect(life.hauVan).not.toBeNull();
      expect(life.tienVan).not.toBeNull();
    });
  }

  it("từ chối dãy ngắn hơn 4 hoặc dài hơn 20 số", () => {
    expect(validateSimPhongThuyInput({ phone: "123" }).isValid).toBe(false);
    expect(validateSimPhongThuyInput({ phone: "1".repeat(21) }).isValid).toBe(false);
    expect(() => analyzeSimPhongThuy({ phone: "1".repeat(21) })).toThrow(RangeError);
  });

  it("không biến dãy bắt đầu bằng 84 dài khác 11 số thành đầu số 0", () => {
    expect(normalizeVietnamesePhone("8412345678901234")).toBe("8412345678901234");
    expect(normalizeVietnamesePhone("84932601616")).toBe("0932601616");
    expect(normalizeVietnamesePhone("+84 932 601 616")).toBe("0932601616");
  });

  it("định dạng 10 số như cũ", () => {
    expect(analyzeSimPhongThuy({ phone: "0932601616" }).formattedPhone).toBe("0932 601 616");
  });
});
