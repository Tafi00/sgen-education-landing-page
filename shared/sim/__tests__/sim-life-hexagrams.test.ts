import { describe, expect, it } from "vitest";
import { calcSimLifeHexagrams } from "../sim-phong-thuy-engine";
import { getHexagramByTrigramOrder, getHexagramInfo } from "../../menh-thu/metaphysics";

describe("năm quẻ luận sim theo tài liệu SGEN", () => {
  it("khớp ví dụ 0902110931 trong tài liệu", () => {
    const result = calcSimLifeHexagrams("0902110931");
    // Quẻ chủ 4/6 Lôi Thủy Giải, động hào 2, quẻ biến 4/8 Lôi Địa Dự.
    expect(result.primary).toBe(40);
    expect(result.movingLine).toBe(2);
    expect(result.changed).toBe(16);
    // Tiền vận 0902 → 1/2 Thiên Trạch Lý.
    expect(result.tienVan).toMatchObject({ digits: "0902", upperQuai: 1, lowerQuai: 2, hexNum: 10 });
    // Trung vận 110 → 2/8 Trạch Địa Tụy.
    expect(result.trungVan).toMatchObject({ digits: "110", upperQuai: 2, lowerQuai: 8, hexNum: 45 });
    // Hậu vận 931 → 4/1 Lôi Thiên Đại Tráng.
    expect(result.hauVan).toMatchObject({ digits: "931", upperQuai: 4, lowerQuai: 1, hexNum: 34 });
  });

  it("chia đoạn đúng độ dài theo từng loại dãy số", () => {
    const lengths = (phone: string) => {
      const r = calcSimLifeHexagrams(phone);
      return [r.tienVan?.digits.length ?? 0, r.trungVan?.digits.length ?? 0, r.hauVan?.digits.length ?? 0];
    };
    expect(lengths("12345678901")).toEqual([4, 4, 3]);
    expect(lengths("123456789012")).toEqual([4, 4, 4]);
    expect(lengths("123456789")).toEqual([3, 3, 3]);
    expect(lengths("12345678")).toEqual([4, 0, 4]);
    expect(lengths("12345")).toEqual([3, 0, 2]);
    expect(lengths("1234")).toEqual([2, 0, 2]);
    expect(lengths("1234567890123456")).toEqual([6, 5, 5]);
    expect(lengths("12345678901234567890")).toEqual([7, 7, 6]);
  });

  it("đoạn 2 số lấy mỗi số làm một quái, số 0 thành 8", () => {
    expect(calcSimLifeHexagrams("1230").hauVan).toMatchObject({ upperQuai: 3, lowerQuai: 8, hexNum: 35 });
  });
});

describe("tra quẻ theo số Văn Vương và số thượng/hạ quái", () => {
  it("trả về thượng/hạ quái đúng", () => {
    const giai = getHexagramInfo(40);
    expect(giai?.upper.name).toBe("Chấn");
    expect(giai?.lower.name).toBe("Khảm");
    expect(getHexagramByTrigramOrder(4, 6)?.number).toBe(40);
    expect(getHexagramInfo(65)).toBeNull();
  });
});
