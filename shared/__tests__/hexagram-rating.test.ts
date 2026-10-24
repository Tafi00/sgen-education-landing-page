import { describe, expect, it } from "vitest";
import { ICHING_DOCUMENT_READINGS } from "../../src/components/fengshui/iching-document-readings";
import { HEXAGRAM_RATING_LABEL, hexagramRating, type HexagramRating } from "../menh-thu/hexagram-rating";
import { getHexagramByTrigramOrder } from "../menh-thu/metaphysics";

/** So tên quẻ không phân biệt dấu (bảng khách ghi "Bĩ", tài liệu SGEN ghi "Bỉ"). */
const plain = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase();

/** Bảng 64 quẻ khách gửi: [tên quẻ, mức] theo từng ô, hàng = thượng quái, cột = hạ quái. */
const T: HexagramRating = "tot";
const B: HexagramRating = "trung-binh";
const X: HexagramRating = "xau";
const TABLE: [string, HexagramRating][][] = [
  [["Thiên Vi Càn", T], ["Thiên Trạch Lý", B], ["Thiên Hỏa Đồng Nhân", B], ["Thiên Lôi Vô Vọng", X], ["Thiên Phong Cấu", X], ["Thiên Thủy Tụng", X], ["Thiên Sơn Độn", X], ["Thiên Địa Bĩ", X]],
  [["Trạch Thiên Quải", B], ["Trạch Vi Đoài", T], ["Trạch Hỏa Cách", B], ["Trạch Lôi Tùy", B], ["Trạch Phong Đại Quá", B], ["Trạch Thủy Khốn", X], ["Trạch Sơn Hàm", B], ["Trạch Địa Tụy", B]],
  [["Hỏa Thiên Đại Hữu", T], ["Hỏa Trạch Khuê", X], ["Hỏa Vi Ly", B], ["Hỏa Lôi Phệ Hạp", B], ["Hỏa Phong Đỉnh", B], ["Hỏa Thủy Vị Tế", X], ["Hỏa Sơn Lữ", X], ["Hỏa Địa Tấn", T]],
  [["Lôi Thiên Đại Tráng", T], ["Lôi Trạch Quy Muội", X], ["Lôi Hỏa Phong", T], ["Lôi Vi Chấn", B], ["Lôi Phong Hằng", B], ["Lôi Thủy Giải", B], ["Lôi Sơn Tiểu Quá", X], ["Lôi Địa Dự", T]],
  [["Phong Thiên Tiểu Súc", X], ["Phong Trạch Trung Phu", B], ["Phong Hỏa Gia Nhân", B], ["Phong Lôi Ích", T], ["Phong Vi Tốn", B], ["Phong Thủy Hoán", X], ["Phong Sơn Tiệm", T], ["Phong Địa Quan", B]],
  [["Thủy Thiên Nhu", B], ["Thủy Trạch Tiết", X], ["Thủy Hỏa Ký Tế", T], ["Thủy Lôi Truân", X], ["Thủy Phong Tỉnh", B], ["Thủy Vi Khảm", X], ["Thủy Sơn Kiển", X], ["Thủy Địa Tỷ", B]],
  [["Sơn Thiên Đại Súc", T], ["Sơn Trạch Tổn", X], ["Sơn Hỏa Bí", X], ["Sơn Lôi Di", B], ["Sơn Phong Cổ", X], ["Sơn Thủy Mông", X], ["Sơn Vi Cấn", X], ["Sơn Địa Bác", X]],
  [["Địa Thiên Thái", T], ["Địa Trạch Lâm", T], ["Địa Hỏa Minh Di", X], ["Địa Lôi Phục", B], ["Địa Phong Thăng", T], ["Địa Thủy Sư", B], ["Địa Sơn Khiêm", B], ["Địa Vi Khôn", B]],
];

describe("mức Tốt / Trung Bình / Xấu của 64 quẻ", () => {
  it("khớp từng ô trong bảng 64 quẻ của khách (tên quẻ và mức)", () => {
    for (let upper = 1; upper <= 8; upper += 1) {
      for (let lower = 1; lower <= 8; lower += 1) {
        const [name, rating] = TABLE[upper - 1][lower - 1];
        const hexagram = getHexagramByTrigramOrder(upper, lower)!;
        const shown = ICHING_DOCUMENT_READINGS[hexagram.number]?.name ?? hexagram.name;
        expect(plain(shown), `ô ${upper}/${lower}`).toBe(plain(name));
        expect(hexagramRating(hexagram.number), `${upper}/${lower} ${name}`).toBe(rating);
      }
    }
  });

  it("ví dụ khách nêu: Thiên Hỏa Đồng Nhân = Trung Bình (xanh), Thiên Vi Càn = Tốt (đỏ)", () => {
    expect(hexagramRating(getHexagramByTrigramOrder(1, 3)!.number)).toBe("trung-binh");
    expect(hexagramRating(getHexagramByTrigramOrder(1, 1)!.number)).toBe("tot");
    expect(HEXAGRAM_RATING_LABEL["trung-binh"]).toBe("Trung Bình");
  });

  it("đủ 64 quẻ đều có mức; quẻ ngoài khoảng trả null", () => {
    for (let number = 1; number <= 64; number += 1) expect(hexagramRating(number), `quẻ ${number}`).not.toBeNull();
    expect(hexagramRating(0)).toBeNull();
    expect(hexagramRating(65)).toBeNull();
  });

  it("tổng số quẻ mỗi mức theo bảng của khách", () => {
    const counts = { tot: 0, "trung-binh": 0, xau: 0 };
    for (let number = 1; number <= 64; number += 1) counts[hexagramRating(number)!] += 1;
    expect(counts.tot + counts["trung-binh"] + counts.xau).toBe(64);
    const expected = { tot: 0, "trung-binh": 0, xau: 0 };
    for (const row of TABLE) for (const [, rating] of row) expected[rating] += 1;
    expect(counts).toEqual(expected);
  });
});
