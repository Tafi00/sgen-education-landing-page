import { describe, expect, it } from "vitest";
import { getHanhVanTable } from "../rules";

/** Đối chiếu bảng "Hành và Vận của giờ theo ngày" của trang mẫu (ảnh bangvanhanh.png). */
describe("bảng Hành và Vận", () => {
  const table = getHanhVanTable();
  const row = (week: number, key: "hanh" | "van") => table[week].cells.map((cell) => cell[key].join(" "));

  it("6 tuần Giáp, mỗi tuần 10 Can Chi và 2 Chi Không Vong", () => {
    expect(table.map((week) => week.name)).toEqual(["Giáp Tý", "Giáp Tuất", "Giáp Thân", "Giáp Ngọ", "Giáp Thìn", "Giáp Dần"]);
    expect(table[0].voids.map((cell) => cell.chi)).toEqual(["Tuất", "Hợi"]);
    expect(table[5].voids.map((cell) => cell.chi)).toEqual(["Tý", "Sửu"]);
  });

  it("số hành / vận từng ô như bảng mẫu", () => {
    expect(row(0, "hanh")).toEqual(["1 1", "3", "2", "6", "9", "8", "8", "9", "1", "2"]);
    expect(row(0, "van")).toEqual(["1 8", "6", "4", "9", "6", "2", "9", "3", "7", "7"]);
    expect(row(2, "hanh")).toEqual(["3", "9", "6", "8", "7", "9", "3 4", "2", "6", "4"]);
    expect(row(2, "van")).toEqual(["9", "4", "1", "8", "4", "2", "1 2", "3", "4", "6"]);
    expect(row(5, "hanh")).toEqual(["7", "1", "4", "2", "3", "1", "7 6", "8", "4", "6"]);
    expect(row(5, "van")).toEqual(["9", "4", "1", "8", "4", "2", "1 2", "3", "4", "6"]);
    expect(table[1].voids.map((cell) => `${cell.hanh.join(" ")}/${cell.van.join(" ")}`)).toEqual(["3/9", "9/4"]);
  });
});
