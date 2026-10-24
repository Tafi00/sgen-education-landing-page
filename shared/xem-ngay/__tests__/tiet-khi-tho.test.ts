import { describe, expect, it } from "vitest";
import { TIET_KHI_INFO } from "../content";
import { tietKhiTho } from "../tiet-khi-tho";

describe("lời tiết khí theo trang mẫu", () => {
  it("đủ 24 tiết khí, cùng tháng tiết khí với bảng thiên văn", () => {
    const names = Object.keys(TIET_KHI_INFO);
    expect(names).toHaveLength(24);
    for (const name of names) {
      const tho = tietKhiTho(name);
      expect(tho, name).toBeDefined();
      expect(tho?.month).toBe(TIET_KHI_INFO[name].month);
      expect(tho?.period).toContain(TIET_KHI_INFO[name].kind === "Tiết" ? "Đầu" : "Cuối");
      expect(tho?.verse.filter(Boolean).length).toBeGreaterThan(5);
      expect(tho?.notes).toHaveLength(2);
    }
  });

  it("Sương Giáng: cuối tháng 09, chung bài thơ tháng chín với Hàn Lộ", () => {
    const suongGiang = tietKhiTho("Sương Giáng");
    expect(suongGiang).toMatchObject({ subtitle: "Sương Mù Xuất Hiện", period: "(Cuối Tháng 09 Theo Lịch Tiết Khí)" });
    expect(suongGiang?.verse[0]).toBe("Tháng chín lại nhớ không sai");
    expect(tietKhiTho("Hàn Lộ")?.verse).toEqual(suongGiang?.verse);
    expect(suongGiang?.notes[0]).toBe("Trùng tang Kỷ, trùng phục Mậu. Thiên địa trùng phục Tị, Hợi.");
  });
});
