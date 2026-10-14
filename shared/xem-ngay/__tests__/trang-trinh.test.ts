import { describe, expect, it } from "vitest";
import { BRANCHES, canChiFromIndex, STEMS } from "../calendar";
import { buildDayContext } from "../context";
import { getTrangTrinhMuc, TRANG_TRINH_MUC, TRANG_TRINH_OVERRIDES } from "../trang-trinh";
import reference from "./fixtures/trang-trinh-reference.json";

/** Danh sách mục theo Can Chi ngày, đối chiếu từ công cụ gốc (chỉ dữ kiện, không có lời văn). */
const REFERENCE = reference as Record<string, number[]>;

/** Tập ngày của bảng chính một mục, dạng "Can Chi". */
function mainTableDays(no: number) {
  const days = new Set<string>();
  for (const [stem, branches] of Object.entries(TRANG_TRINH_MUC[no].tables[0].days)) {
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
    expect(getTrangTrinhMuc(canChi)).toEqual(expected);
  });

  it("tính theo Can Chi ngày của lịch (buildDayContext)", () => {
    const day = buildDayContext("2025-07-20").day.name;
    expect(day).toBe("Canh Dần");
    expect(getTrangTrinhMuc(day)).toEqual([4, 7, 8, 10, 14, 15, 22, 36, 37, 41, 46, 57, 58, 60, 65, 76, 78]);
  });

  it("chấp nhận cách viết khác của Can Chi và trả mảng rỗng khi không hợp lệ", () => {
    expect(getTrangTrinhMuc("  Quí   Mão ")).toEqual(REFERENCE["Quý Mẹo"]);
    expect(getTrangTrinhMuc("Ðinh Tỵ")).toEqual(REFERENCE["Đinh Tị"]);
    expect(getTrangTrinhMuc("Giáp Sửu")).toEqual([]);
    expect(getTrangTrinhMuc("")).toEqual([]);
  });

  it("trả bản sao, sửa kết quả không ảnh hưởng lần gọi sau", () => {
    getTrangTrinhMuc("Tân Dậu").push(999);
    expect(getTrangTrinhMuc("Tân Dậu")).toEqual(REFERENCE["Tân Dậu"]);
  });
});

describe("Trạng Trình – dữ liệu danh mục", () => {
  it("65 mục có bảng, số mục khớp khoá và nằm trong 1–83", () => {
    const entries = Object.entries(TRANG_TRINH_MUC);
    expect(entries).toHaveLength(65);
    for (const [key, muc] of entries) {
      expect(muc.no).toBe(Number(key));
      expect(muc.no).toBeGreaterThanOrEqual(1);
      expect(muc.no).toBeLessThanOrEqual(83);
      expect(muc.title.length).toBeGreaterThan(0);
      expect(muc.summary.length).toBeGreaterThan(0);
      expect(muc.tables.length).toBeGreaterThan(0);
    }
  });

  it("mọi ô bảng là Can Chi có thật (Can và Chi cùng âm dương)", () => {
    for (const muc of Object.values(TRANG_TRINH_MUC)) {
      for (const table of muc.tables) {
        for (const [stem, branches] of Object.entries(table.days)) {
          const stemIndex = STEMS.indexOf(stem as (typeof STEMS)[number]);
          expect(stemIndex, `mục ${muc.no}: ${stem}`).toBeGreaterThanOrEqual(0);
          for (const branch of branches ?? []) {
            const branchIndex = BRANCHES.indexOf(branch);
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
