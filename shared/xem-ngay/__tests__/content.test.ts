import { describe, expect, it } from "vitest";
import { SOLAR_TERMS } from "../calendar";
import {
  CUU_TINH_INFO,
  DAN_GIAN_INFO,
  DAY_OFFICER_INFO,
  HOUR_STAR_INFO,
  LUC_NHAM_INFO,
  TIET_KHI_INFO,
  TRUC_INFO,
  TU28_INFO,
  TUONG_QUAN_INFO,
  XUAT_HANH_INFO,
  cuuTinhGrid,
  findInfo,
  type InfoEntry,
} from "../content";
import { tu28Luck, TRUC_NAMES, TU28 } from "../rules";
import { KIM_THAN_THAT_SAT, TRUC_GIAO_TRINH, TU28_GIAO_TRINH } from "../truc-tu-data";
import names from "./fixtures/content-names.json";

/** Mỗi nhóm tên trong fixture (lấy từ trang tham chiếu) ứng với một từ điển. */
const GROUPS: [keyof Omit<typeof names, "_note">, Record<string, InfoEntry>][] = [
  ["truc", TRUC_INFO],
  ["tu28", TU28_INFO],
  ["dayOfficer", DAY_OFFICER_INFO],
  ["hourStar", HOUR_STAR_INFO],
  ["cuuTinh", CUU_TINH_INFO],
  ["lucNham", LUC_NHAM_INFO],
  ["xuatHanh", XUAT_HANH_INFO],
  ["tietKhi", TIET_KHI_INFO],
  ["danGian", DAN_GIAN_INFO],
  ["tuongQuan", TUONG_QUAN_INFO],
];

const ALL_DICTS = GROUPS.map(([, dict]) => dict);
const LUCK3 = ["Cát", "Hung", "Bình"];

describe("từ điển nội dung xem ngày", () => {
  it.each(GROUPS)("mọi tên nhóm %s trong dữ liệu tham chiếu đều có mục với lời giải", (group, dict) => {
    const list: string[] = names[group];
    expect(list.length).toBeGreaterThan(0);
    for (const name of list) {
      const entry = findInfo(dict, name);
      expect(entry, `${group}: thiếu "${name}"`).toBeDefined();
      expect(entry!.name.trim().length, `${group}: "${name}" thiếu tên`).toBeGreaterThan(0);
      expect(entry!.summary.trim().length, `${group}: "${name}" thiếu summary`).toBeGreaterThan(0);
    }
  });

  it("đủ số mục chuẩn của từng hệ", () => {
    expect(Object.keys(TRUC_INFO)).toHaveLength(12);
    expect(Object.keys(TU28_INFO)).toHaveLength(28);
    expect(Object.keys(DAY_OFFICER_INFO)).toHaveLength(12);
    expect(Object.keys(CUU_TINH_INFO)).toHaveLength(9);
    expect(Object.keys(LUC_NHAM_INFO)).toHaveLength(6);
    expect(Object.keys(XUAT_HANH_INFO)).toHaveLength(22);
    expect(Object.keys(TIET_KHI_INFO)).toHaveLength(24);
    expect(Object.keys(TUONG_QUAN_INFO)).toHaveLength(5);
    expect(new Set(Object.keys(TIET_KHI_INFO))).toEqual(new Set(SOLAR_TERMS));
  });

  it("khoá đã chuẩn hoá, summary ngắn gọn một đoạn", () => {
    for (const dict of ALL_DICTS) {
      for (const [key, entry] of Object.entries(dict)) {
        expect(key).toBe(key.trim());
        expect(key).not.toMatch(/Ð|Quí/);
        expect(entry.summary).not.toMatch(/\n/);
        expect(entry.summary.length).toBeLessThanOrEqual(320);
      }
    }
  });

  it("mức tốt xấu và phân loại hợp lệ", () => {
    for (const dict of [HOUR_STAR_INFO, LUC_NHAM_INFO, XUAT_HANH_INFO, DAN_GIAN_INFO, TUONG_QUAN_INFO]) {
      for (const entry of Object.values(dict)) expect(LUCK3).toContain(entry.luck);
    }
    const hoangDao = Object.values(DAY_OFFICER_INFO).filter((entry) => entry.type === "Hoàng Đạo");
    expect(hoangDao.map((entry) => entry.name).sort()).toEqual(
      ["Kim Quỹ", "Kim Đường", "Minh Đường", "Ngọc Đường", "Thanh Long", "Tư Mệnh"].sort(),
    );
    for (const entry of hoangDao) expect(HOUR_STAR_INFO[entry.name].luck).toBe("Cát");
  });

  it("Nhị thập bát tú suy đúng ngũ hành, ngày chủ trị và chòm", () => {
    const giac = TU28_INFO["Giác Mộc Giao"];
    expect(giac).toMatchObject({ order: 1, element: "Mộc", weekday: "Thứ Năm", group: "Thanh Long (phương Đông)" });
    expect(TU28_INFO["Chẩn Thủy Dẫn"]).toMatchObject({ order: 28, element: "Thủy", weekday: "Thứ Tư" });
    expect(TU28_INFO["Tinh Nhật Mã"].weekday).toBe("Chủ Nhật");
    expect(TU28_INFO["Tâm Nguyệt Hồ"].weekday).toBe("Thứ Hai");
  });

  it("Thập nhị trực đủ 12 trực, mỗi trực đủ lời giáo trình", () => {
    expect(TRUC_GIAO_TRINH.map((item) => item.name)).toEqual([...TRUC_NAMES]);
    for (const item of TRUC_GIAO_TRINH) {
      for (const field of [item.otherName, item.nature, item.element, item.nen, item.ki]) expect(field.trim(), item.name).not.toBe("");
      expect(item.banhTo, item.name).toHaveLength(2);
    }
    expect(TRUC_INFO["Kiên"]).toMatchObject({ name: "Trực Kiên", otherName: "Nguyên Cát", nature: "Kiết Hung", element: "Thổ", dao: "Hắc đạo" });
    expect(TRUC_INFO["Bế"].nen).toBe("Cầu y hợp thuốc, xây đắp tường, gắn cửa, gác đòn dông, khởi công, uống thuốc, trị bệnh.");
    expect(TRUC_GIAO_TRINH.filter((item) => item.dao === "Hoàng đạo").map((item) => item.name)).toEqual(["Trừ", "Định", "Chấp", "Nguy", "Thành", "Khai"]);
  });

  it("Nhị thập bát tú đủ 28 sao theo thứ tự engine, mỗi sao đủ lời giáo trình", () => {
    expect(TU28_GIAO_TRINH.map((item) => item.key)).toEqual([...TU28]);
    for (const item of TU28_GIAO_TRINH) {
      for (const field of [item.tuongTinh, item.chuTri, item.thuoc, item.thanBi, item.thaiBaLe, item.nen, item.ky]) expect(field.trim(), item.key).not.toBe("");
      expect(item.ngoaiLe.length, item.key).toBeGreaterThan(0);
      expect([item.tuTuyet.length, item.dich.length, item.batCu.filter(Boolean).length], item.key).toEqual([4, 4, 8]);
    }
    expect(TU28_GIAO_TRINH.filter((item) => item.kimThan).map((item) => item.name)).toEqual(["Giác", "Cang", "Ngưu", "Khuê", "Lâu", "Quỷ", "Tinh"]);
    expect(KIM_THAN_THAT_SAT).toMatch(/Đó là: Giác, Cang, Khuê, Lâu, Ngưu, Quỷ, Tinh\.$/);
    const count = (nhom: string) => TU28_GIAO_TRINH.filter((item) => item.nhom === nhom).length;
    expect([count("toàn cát"), count("toàn hung"), count("trung bình")]).toEqual([11, 10, 7]);
  });

  it("Tốt/Xấu của sao trên bảng khớp nhóm toàn cát / toàn hung của giáo trình", () => {
    for (const entry of Object.values(TU28_INFO)) {
      if (entry.nhom === "toàn cát") expect(tu28Luck(entry.name), entry.name).toBe("Tốt");
      if (entry.nhom === "toàn hung") expect(tu28Luck(entry.name), entry.name).toBe("Xấu");
    }
  });

  it("findInfo nhận cả nhãn có tiền tố, hậu tố, tên lệch", () => {
    expect(findInfo(TRUC_INFO, "Trực Kiên")?.name).toBe("Trực Kiên");
    expect(findInfo(TRUC_INFO, "Kiến")?.name).toBe("Trực Kiên");
    expect(findInfo(TRUC_INFO, "Trực Thu")?.name).toBe("Trực Thâu");
    expect(findInfo(TU28_INFO, "Đẩu Mộc Giải ")?.name).toBe("Đẩu Mộc Giải");
    expect(findInfo(TU28_INFO, "Chẩn Thủy Dẫn: Tốt")?.name).toBe("Chẩn Thủy Dẫn");
    expect(findInfo(TU28_INFO, "Tinh Nhựt Mã")?.name).toBe("Tinh Nhật Mã");
    expect(findInfo(DAY_OFFICER_INFO, "Kim Quỹ Hoàng Đạo")?.type).toBe("Hoàng Đạo");
    expect(findInfo(DAY_OFFICER_INFO, "Bảo Quang Hoàng Đạo (Kim Đường Hoàng Đạo)")?.name).toBe("Kim Đường");
    expect(findInfo(HOUR_STAR_INFO, "Bửu Quan")?.name).toBe("Bửu Quang");
    expect(findInfo(XUAT_HANH_INFO, "Thiên đạo")?.name).toBe("Thiên Đạo");
    expect(findInfo(XUAT_HANH_INFO, "ÐƯỜNG PHONG")?.name).toBe("Đường Phong");
    expect(findInfo(TRUC_INFO, "Không có")).toBeUndefined();
    expect(findInfo(TRUC_INFO, undefined)).toBeUndefined();
  });

  it("bảng phi tinh Cửu tinh khớp cách đọc của nguồn", () => {
    expect(cuuTinhGrid(1)).toEqual([2, 6, 4, 3, 1, 8, 7, 5, 9]);
    expect(cuuTinhGrid(5)).toEqual([6, 1, 8, 7, 5, 3, 2, 9, 4]);
    expect(cuuTinhGrid(9)).toEqual([1, 5, 3, 2, 9, 7, 6, 4, 8]);
  });
});
