import { describe, expect, it } from "vitest";
import { BRANCHES, canChiFromIndex, STEMS } from "../calendar";
import { buildDayContext } from "../context";
import { getTrangTrinhMuc, TRANG_TRINH_MUC, TRANG_TRINH_OVERRIDES } from "../trang-trinh";
import reference from "./fixtures/trang-trinh-reference.json";

/** Danh sách mục theo Can Chi ngày, đối chiếu từ công cụ gốc (chỉ dữ kiện, không có lời văn). */
const REFERENCE = reference as Record<string, number[]>;

/** Mục có bảng ngày tốt trong giáo trình của khách nhưng công cụ gốc không liệt kê; so với fixture thì bỏ qua. */
const GIAO_TRINH_ONLY = [9, 31, 81];
const withoutGiaoTrinhOnly = (list: number[]) => list.filter((no) => !GIAO_TRINH_ONLY.includes(no));

/** Tập ngày của bảng chính một mục, dạng "Can Chi". */
function mainTableDays(no: number) {
  const days = new Set<string>();
  for (const [stem, branches] of Object.entries(TRANG_TRINH_MUC[no].mainDays ?? {})) {
    for (const branch of branches ?? []) days.add(`${stem} ${branch}`);
  }
  return days;
}

describe("Trạng Trình – danh sách mục theo Can Chi ngày", () => {
  it("fixture phủ đủ 60 Can Chi", () => {
    const names = Array.from({ length: 60 }, (_, index) => canChiFromIndex(index).name);
    expect(Object.keys(REFERENCE).sort()).toEqual([...names].sort());
  });

  it.each(Object.entries(REFERENCE))("%s khớp danh sách đối chiếu", (canChi, expected) => {
    expect(withoutGiaoTrinhOnly(getTrangTrinhMuc(canChi))).toEqual(expected);
  });

  it("mục 9, 31, 81 theo bảng ngày tốt của giáo trình", () => {
    for (const no of GIAO_TRINH_ONLY) {
      for (const day of mainTableDays(no)) expect(getTrangTrinhMuc(day), `${day} có mục ${no}`).toContain(no);
    }
    expect(getTrangTrinhMuc("Bính Dần")).toContain(9);
    expect(getTrangTrinhMuc("Giáp Tý")).not.toContain(9);
  });

  it("tính theo Can Chi ngày của lịch (buildDayContext)", () => {
    const day = buildDayContext("2025-07-20").day.name;
    expect(day).toBe("Canh Dần");
    expect(getTrangTrinhMuc(day)).toEqual([4, 7, 8, 10, 14, 15, 22, 31, 36, 37, 41, 46, 57, 58, 60, 65, 76, 78]);
  });

  it("chấp nhận cách viết khác của Can Chi và trả mảng rỗng khi không hợp lệ", () => {
    expect(withoutGiaoTrinhOnly(getTrangTrinhMuc("  Quí   Mão "))).toEqual(REFERENCE["Quý Mẹo"]);
    expect(withoutGiaoTrinhOnly(getTrangTrinhMuc("Ðinh Tỵ"))).toEqual(REFERENCE["Đinh Tị"]);
    expect(getTrangTrinhMuc("Giáp Sửu")).toEqual([]);
    expect(getTrangTrinhMuc("")).toEqual([]);
  });

  it("trả bản sao, sửa kết quả không ảnh hưởng lần gọi sau", () => {
    getTrangTrinhMuc("Tân Dậu").push(999);
    expect(withoutGiaoTrinhOnly(getTrangTrinhMuc("Tân Dậu"))).toEqual(REFERENCE["Tân Dậu"]);
  });
});

describe("Trạng Trình – dữ liệu danh mục", () => {
  it("đủ 83 mục theo giáo trình, mỗi mục có tên và nội dung", () => {
    const entries = Object.entries(TRANG_TRINH_MUC);
    expect(entries).toHaveLength(83);
    for (const [key, muc] of entries) {
      expect(muc.no).toBe(Number(key));
      expect(muc.title.length).toBeGreaterThan(0);
      expect(muc.blocks.length).toBeGreaterThan(0);
    }
    expect(TRANG_TRINH_MUC[1].title).toBe("Đại Minh Nhật");
    expect(TRANG_TRINH_MUC[83].title).toBe("Uống Thuốc");
  });

  it("68 mục có bảng ngày tốt chung; mục theo tiết khí / tháng và mục ngày kị không tính", () => {
    const withMain = Object.values(TRANG_TRINH_MUC).filter((muc) => muc.mainDays);
    expect(withMain).toHaveLength(68);
    for (const no of [23, 33, 42, 54, 63, 11, 24]) expect(TRANG_TRINH_MUC[no].mainDays, `mục ${no}`).toBeNull();
  });

  it("mọi ô bảng ngày là Can Chi có thật (Can và Chi cùng âm dương)", () => {
    for (const muc of Object.values(TRANG_TRINH_MUC)) {
      for (const block of muc.blocks) {
        if (block.kind !== "days") continue;
        for (const [stem, branches] of Object.entries(block.days)) {
          const stemIndex = STEMS.indexOf(stem as (typeof STEMS)[number]);
          expect(stemIndex, `mục ${muc.no}: ${stem}`).toBeGreaterThanOrEqual(0);
          for (const branch of branches) {
            const branchIndex = BRANCHES.indexOf(branch as (typeof BRANCHES)[number]);
            expect(branchIndex % 2, `mục ${muc.no}: ${stem} ${branch}`).toBe(stemIndex % 2);
          }
        }
      }
    }
  });

  it("điều chỉnh chỉ bỏ ngày có trong bảng chính và chỉ thêm ngày chưa có", () => {
    for (const [key, override] of Object.entries(TRANG_TRINH_OVERRIDES)) {
      const no = Number(key);
      expect(TRANG_TRINH_MUC[no], `mục ${no}`).toBeDefined();
      const days = mainTableDays(no);
      for (const day of override?.remove ?? []) expect(days.has(day), `mục ${no} bỏ ${day}`).toBe(true);
      for (const day of override?.add ?? []) expect(days.has(day), `mục ${no} thêm ${day}`).toBe(false);
    }
  });
});
