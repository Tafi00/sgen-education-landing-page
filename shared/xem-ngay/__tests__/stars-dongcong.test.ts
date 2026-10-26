import { describe, expect, it } from "vitest";
import { buildDayContext } from "../context";
import { BRANCHES } from "../calendar";
import { getDongCong } from "../dong-cong";
import { DONG_CONG_MONTHS, DONG_CONG_TEXTS } from "../dong-cong-data";
import { getDayStars } from "../stars";
import reference from "./fixtures/stars-dongcong-reference.json";

/**
 * Đối chiếu kiết/hung tinh và Đổng Công với các ngày mẫu độc lập (không dùng để sinh bảng).
 * Riêng 2026-11-19 (Đinh Dậu, tháng Mười): trang mẫu ghi Đại Kiết nhưng giáo trình Đổng Công của khách (cả bảng ngày
 * lẫn bảng tổng quan tháng) ghi Thứ Kiết — fixture theo giáo trình.
 */
describe.each(reference)("ngày $date", (ref) => {
  const ctx = buildDayContext(ref.date, 10);
  it("kiết tinh và hung tinh đúng thứ tự trang mẫu", () => {
    const stars = getDayStars(ctx);
    expect(stars.good.map((star) => star.name)).toEqual(ref.good);
    expect(stars.bad.map((star) => star.name)).toEqual(ref.bad);
  });
  // Có ngày trang mẫu để trống Đổng Công dù cùng tháng, cùng Can Chi ở ngày khác có lời luận: bỏ qua các ngày đó.
  it.skipIf(ref.dongCong[0] === null)("Đổng Công", () => {
    const entry = getDongCong(ctx);
    expect([entry?.title ?? null, entry?.rating ?? null]).toEqual(ref.dongCong);
  });
});

describe("Đổng Công – dữ liệu theo giáo trình", () => {
  const OFFICERS = ["Kiên", "Trừ", "Mãn", "Bình", "Định", "Chấp", "Phá", "Nguy", "Thành", "Thâu", "Khai", "Bế"];

  it("đủ 12 tháng × 60 ngày, mỗi ngày có lời luận và mức kiết hung hợp lệ", () => {
    expect(DONG_CONG_MONTHS).toHaveLength(12);
    for (const month of DONG_CONG_MONTHS) {
      expect(month.days).toHaveLength(60);
      for (const [nghiKi, anhHuong, rating] of month.days) {
        expect(DONG_CONG_TEXTS[nghiKi], month.name).toBeTypeOf("string");
        expect(DONG_CONG_TEXTS[anhHuong], month.name).toBeTypeOf("string");
        expect(`${DONG_CONG_TEXTS[nghiKi]}${DONG_CONG_TEXTS[anhHuong]}`.length, month.name).toBeGreaterThan(0);
        expect([0, 1, 2, 3]).toContain(rating);
      }
    }
  });

  it("Trực của từng Chi đúng vòng Kiến Trừ (tháng Giêng: Kiên Dần)", () => {
    DONG_CONG_MONTHS.forEach((month, index) => {
      BRANCHES.forEach((branch, branchIndex) => {
        expect(month.groups[branch]?.[0], `${month.name} ${branch}`).toBe(OFFICERS[(branchIndex - (index + 2) + 24) % 12]);
      });
    });
  });

  it("lấy nguyên văn giáo trình cho ngày đang xem", () => {
    const entry = getDongCong(buildDayContext("2026-11-19", 10));
    expect(entry).toMatchObject({ title: "Ngày Khai Dậu", rating: "Thứ Kiết", nghiKi: "Có Thể Làm Được.", anhHuong: "Tốt", month: "Tháng Mười" });
    expect(entry?.hungSat.length).toBeGreaterThan(0);
  });
});
