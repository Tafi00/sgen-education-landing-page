import { describe, expect, it } from "vitest";
import { calculateFullNumerologyReport, calculateNumerologyReport, type NumerologyFullReport } from "../numerology";
import golden from "./numerology.golden.json";

/**
 * Bộ giá trị chuẩn được sinh trực tiếp từ engine Python gốc của SGEN
 * (`Bản sao sgennumerology`, main3.py) — nguồn tạo báo cáo PDF cho khách.
 * Mọi chỉ số của bản đầy đủ phải khớp tuyệt đối với engine đó.
 */
type GoldenCase = {
  name: string;
  birthDate: string;
  expect: {
    noi_tam: string;
    logic: string;
    cam_xuc: string;
    truc_giac: string;
    trai_nghiem: string;
    tiem_thuc: number;
    lap: string;
    thai_do: string;
    tuong_tac: string;
    can_bang: string;
    bai_hoc_nghiep: string;
    no_nghiep: string;
    nam_ca_nhan: string;
    su_menh: string;
    duong_doi: string;
    ngay_sinh: string;
    truong_thanh: string;
    dam_me: string;
    noi_tam_tuong_tac: string;
    su_menh_duong_doi: string;
    bieu_do_duong_doi: string[];
    age_range: number;
    bieu_do_ngay_sinh: Record<string, number>;
    bieu_do_ho_ten: Record<string, number>;
    ikigai: { dam_me: string[]; su_menh: string; chuyen_mon: string[]; su_nghiep: string[] };
  };
}

const REFERENCE_YEAR = 2026;

function metricOf(report: NumerologyFullReport, sectionId: string, key: string) {
  const section = report.sections.find((item) => item.id === sectionId);
  const found = section?.metrics.find((item) => item.key === key);
  if (!found) throw new Error(`Thiếu chỉ số ${sectionId}/${key}`);
  return found;
}

function metricValue(report: NumerologyFullReport, sectionId: string, key: string) {
  return metricOf(report, sectionId, key).value;
}

/** Chỉ số nhiều số: so mảng `values` với chuỗi join của Python (dấu phẩy có/không cách). */
function metricValues(report: NumerologyFullReport, sectionId: string, key: string, joined: string) {
  const found = metricOf(report, sectionId, key);
  const expected = joined ? joined.split(",").map((item) => item.trim()) : [];
  expect(found.values ?? []).toEqual(expected);
}

describe("calculateFullNumerologyReport — khớp engine Python gốc", () => {
  for (const testCase of golden as unknown as GoldenCase[]) {
    it(`${testCase.name} (${testCase.birthDate})`, () => {
      const report = calculateFullNumerologyReport(testCase.name, testCase.birthDate, REFERENCE_YEAR);
      const expected = testCase.expect;

      // Thế giới bên trong
      expect(metricValue(report, "the-gioi-ben-trong", "soul")).toBe(expected.noi_tam);
      expect(metricValue(report, "the-gioi-ben-trong", "logic")).toBe(expected.logic);
      expect(metricValue(report, "the-gioi-ben-trong", "emotion")).toBe(expected.cam_xuc);
      expect(metricValue(report, "the-gioi-ben-trong", "intuition")).toBe(expected.truc_giac);
      expect(metricValue(report, "the-gioi-ben-trong", "experience")).toBe(expected.trai_nghiem);
      expect(metricValue(report, "the-gioi-ben-trong", "subconscious")).toBe(String(expected.tiem_thuc));

      metricValues(report, "the-gioi-ben-ngoai", "repeated", expected.lap);
      expect(metricValue(report, "the-gioi-ben-ngoai", "repeated")).toBe(expected.lap);
      expect(metricValue(report, "the-gioi-ben-ngoai", "attitude")).toBe(expected.thai_do);
      expect(metricValue(report, "the-gioi-ben-ngoai", "interaction")).toBe(expected.tuong_tac);

      // Phát triển bản thân
      metricValues(report, "phat-trien-ban-than", "missing", expected.bai_hoc_nghiep);
      metricValues(report, "phat-trien-ban-than", "debts", expected.no_nghiep);
      expect(metricValue(report, "phat-trien-ban-than", "debts")).toBe(expected.no_nghiep.split(",").join(", "));

      // Định hướng sự nghiệp
      expect(metricValue(report, "dinh-huong-su-nghiep", "personalYear")).toBe(expected.nam_ca_nhan);
      expect(metricValue(report, "dinh-huong-su-nghiep", "destiny")).toBe(expected.su_menh);
      expect(metricValue(report, "dinh-huong-su-nghiep", "lifePath")).toBe(expected.duong_doi);
      expect(metricValue(report, "dinh-huong-su-nghiep", "birthNumber")).toBe(expected.ngay_sinh);
      expect(metricValue(report, "dinh-huong-su-nghiep", "maturity")).toBe(expected.truong_thanh);
      expect(metricValue(report, "dinh-huong-su-nghiep", "passion")).toBe(expected.dam_me);

      // Nguồn lực hỗ trợ
      expect(metricValue(report, "nguon-luc-ho-tro", "soulInteraction")).toBe(expected.noi_tam_tuong_tac);
      expect(metricValue(report, "nguon-luc-ho-tro", "destinyLifePath")).toBe(expected.su_menh_duong_doi);

      // Biểu đồ chặng đường đời: 3 gốc + 4 đỉnh kèm khoảng tuổi
      const chart = report.lifePathChart;
      const [day, month, year, p1, p2, p3, p4] = expected.bieu_do_duong_doi;
      expect([chart.day, chart.month, chart.year]).toEqual([day, month, year]);
      expect(chart.pinnacles.map((node) => node.value)).toEqual([p1, p2, p3, p4]);
      expect(chart.pinnacles[0].range).toBe(`0 – ${expected.age_range}`);
      expect(chart.pinnacles[1].range).toBe(`${expected.age_range + 1} – ${expected.age_range + 9}`);
      expect(chart.pinnacles[2].range).toBe(`${expected.age_range + 10} – ${expected.age_range + 18}`);
      expect(chart.pinnacles[3].range).toBe(`${expected.age_range + 19} – ${expected.age_range + 27}`);

      // Biểu đồ ngày sinh và họ tên
      expect(report.birthChart).toEqual(Object.fromEntries(Object.entries(expected.bieu_do_ngay_sinh).map(([k, v]) => [Number(k), v])));
      expect(report.nameChart).toEqual(Object.fromEntries(Object.entries(expected.bieu_do_ho_ten).map(([k, v]) => [Number(k), v])));

      // Ikigai
      expect(report.ikigai.passion).toEqual(expected.ikigai.dam_me.map((item) => item.trim()));
      expect(report.ikigai.mission).toBe(expected.ikigai.su_menh);
      expect(report.ikigai.expertise).toEqual(expected.ikigai.chuyen_mon);
      expect(report.ikigai.career).toEqual(expected.ikigai.su_nghiep);
    });
  }
});

describe("calculateNumerologyReport — 8 chỉ số nền khớp bản đầy đủ", () => {
  for (const testCase of golden as unknown as GoldenCase[]) {
    it(`${testCase.name} (${testCase.birthDate})`, () => {
      const report = calculateNumerologyReport(testCase.name, testCase.birthDate, REFERENCE_YEAR);
      const expected = testCase.expect;
      const byKey = Object.fromEntries(report.metrics.map((item) => [item.key, item.value]));

      expect(byKey.lifePath).toBe(expected.duong_doi);
      expect(byKey.destiny).toBe(expected.su_menh);
      expect(byKey.soul).toBe(expected.noi_tam);
      expect(byKey.attitude).toBe(expected.thai_do);
      expect(byKey.personalYear).toBe(expected.nam_ca_nhan);
      expect(byKey.interaction).toBe(expected.tuong_tac);
      expect(byKey.maturity).toBe(expected.truong_thanh);
      expect(byKey.peaks).toBe(expected.bieu_do_duong_doi.slice(3).join(" · "));
    });
  }
});
