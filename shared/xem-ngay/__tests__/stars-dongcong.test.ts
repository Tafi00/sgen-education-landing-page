import { describe, expect, it } from "vitest";
import { buildDayContext } from "../context";
import { getDongCong } from "../dong-cong";
import { getDayStars } from "../stars";
import reference from "./fixtures/stars-dongcong-reference.json";

/** Đối chiếu kiết/hung tinh và Đổng Công với các ngày mẫu độc lập (không dùng để sinh bảng). */
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
