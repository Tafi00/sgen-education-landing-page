import { describe, expect, it } from "vitest";
import { solarToLunar, lunarToSolar, leapMonthOfYear } from "../calendar";
import { buildDayContext } from "../context";
import { napAm } from "../index";
import * as R from "../rules";
import reference from "./fixtures/rules-reference.json";

type Ref = (typeof reference)[number];

describe("lịch âm Việt Nam", () => {
  it("đổi đúng các mốc Tết và tháng nhuận", () => {
    expect(solarToLunar(17, 2, 2026)).toMatchObject({ day: 1, month: 1, year: 2026, leap: false });
    expect(solarToLunar(29, 1, 2025)).toMatchObject({ day: 1, month: 1, year: 2025 });
    expect(solarToLunar(25, 7, 2025)).toMatchObject({ day: 1, month: 6, leap: true, monthDays: 29 });
    expect(leapMonthOfYear(2025)).toBe(6);
    expect(lunarToSolar(1, 6, 2025, true)).toEqual([25, 7, 2025]);
    expect(lunarToSolar(1, 5, 2026, true)).toBeNull();
  });
});

/** Đối chiếu với dữ kiện trang mẫu (đã bỏ các ngày trang mẫu tính sai tiết khí / tháng nhuận). */
describe.each(reference as Ref[])("ngày $date $hour giờ", (ref) => {
  const ctx = buildDayContext(ref.date, ref.hour);
  it("trụ Can Chi và phối quẻ", () => {
    expect([ctx.year.name, ctx.month.name, ctx.day.name, ctx.time.name]).toEqual(ref.pillars);
    expect([ctx.year, ctx.month, ctx.day, ctx.time].map((value) => {
      const que = R.getPhoiQue(value);
      return [que.upper, que.luck];
    })).toEqual(ref.phoiQue);
  });
  it("tổng quan và thông tin", () => {
    const officer = R.getDayOfficer(ctx);
    expect(R.getTruc(ctx)).toBe(ref.truc);
    expect(`${officer.name} ${officer.type}`).toBe(ref.officer);
    expect(R.getTu28(ctx).name).toBe(ref.tu28);
    expect(R.getStemBranchRelation(ctx.day)).toBe(ref.tuongQuan);
    expect(napAm(ctx.day.stem, ctx.day.branch)).toBe(ref.napAm);
    expect([R.getYearStar(ctx), R.getMonthStar(ctx), R.getDayStar(ctx), R.getHourStar(ctx)]).toEqual(ref.cuuTinh);
    expect(R.getDayLucNham(ctx)).toBe(ref.lucNham);
    expect(R.getXuatHanh(ctx).toLowerCase()).toBe(ref.xuatHanh.toLowerCase());
    expect(R.getFolkDay(ctx)).toBe(ref.danGian);
  });
  it("giờ, hướng, tuổi xung", () => {
    expect([ctx.year, ctx.month, ctx.day, ctx.time].map((value) => R.getTamSat(value.branch))).toEqual(ref.tamSat);
    expect(R.getHourOfficers(ctx).filter((hour) => hour.type === "Hoàng Đạo").map((hour) => `${hour.chi} ${hour.name}`)).toEqual(ref.gioHoangDao);
    expect(R.getClashingAges(ctx.day)).toEqual(ref.xungNgay);
    const directions = R.getDirections(ctx);
    expect([directions.taiThan, directions.hyThan, directions.hacThan]).toEqual(ref.huong);
    const empty = R.getEmptyHours(ctx);
    expect([empty.lonely, empty.hollow]).toEqual(ref.khongVong);
    const tide = R.getTide(ctx);
    expect([tide.highland.flood, tide.highland.ebb]).toEqual(ref.nuocCao);
  });
});
