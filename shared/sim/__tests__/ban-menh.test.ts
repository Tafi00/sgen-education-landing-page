import { describe, expect, it } from "vitest";
import { getNaYin, getNaYinByYear, getFourPillars } from "../../menh-thu/metaphysics";
import { buildPersonFromBirth } from "../sim-phong-thuy-engine";

describe("Bản mệnh (nạp âm Lục Thập Hoa Giáp) theo năm sinh", () => {
  it("ca khách báo lỗi: nam 12/10/1983 (Quý Hợi) là Đại Hải Thủy, không phải Lộ Bàng Thổ", () => {
    const person = buildPersonFromBirth("1983-10-12", "Nam");
    expect(person.canChi).toBe("Quý Hợi");
    expect(person.menh).toBe("Đại Hải Thủy");
    expect(person.menhElement).toBe("Thủy");
  });

  it("các năm nổi tiếng đúng theo bảng Lục Thập Hoa Giáp", () => {
    const known: Record<number, string> = {
      1960: "Bích Thượng Thổ", // Canh Tý
      1975: "Đại Khê Thủy", // Ất Mão
      1982: "Đại Hải Thủy", // Nhâm Tuất
      1983: "Đại Hải Thủy", // Quý Hợi
      1984: "Hải Trung Kim", // Giáp Tý
      1990: "Lộ Bàng Thổ", // Canh Ngọ
      1991: "Lộ Bàng Thổ", // Tân Mùi
      1996: "Giản Hạ Thủy", // Bính Tý
      2000: "Bạch Lạp Kim", // Canh Thìn
      2024: "Phúc Đăng Hỏa", // Giáp Thìn
      2026: "Thiên Hà Thủy", // Bính Ngọ
      2043: "Đại Hải Thủy", // Quý Hợi
    };
    for (const [year, name] of Object.entries(known)) expect(getNaYinByYear(Number(year)), `năm ${year}`).toBe(name);
  });

  it("khớp nạp âm của trụ năm tính từ Can Chi, với mọi năm 1900–2100 (không có năm nào rơi về giá trị mặc định)", () => {
    for (let year = 1900; year <= 2100; year += 1) {
      // Giữa năm dương lịch luôn đã qua Lập Xuân nên trụ năm = năm đó.
      const yearPillar = getFourPillars(`${year}-07-01`, "12:00", 105.833, 7, "civil").pillars[0];
      expect(getNaYinByYear(year), `năm ${year}`).toBe(getNaYin(yearPillar));
    }
  });

  it("hồ sơ sinh trước Lập Xuân tính theo năm trước", () => {
    expect(buildPersonFromBirth("1990-01-15", "Nữ").menh).toBe(getNaYinByYear(1989)); // Kỷ Tỵ
    expect(buildPersonFromBirth("1990-03-15", "Nữ").menh).toBe(getNaYinByYear(1990)); // Canh Ngọ
  });
});
