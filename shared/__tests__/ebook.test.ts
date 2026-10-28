import { describe, expect, it } from "vitest";
import {
  EBOOK_PLANS,
  EBOOK_PLAN_KEYS,
  ebookCodePrefix,
  ebookCodeState,
  formatEbookCode,
  isStudentPlan,
  normalizeEbookCode,
  normalizeEbookSuffix,
  STUDENT_FEATURE_LEVEL,
  STUDENT_PLAN_KEYS,
  studentLevel,
  validateEbookSuffix,
} from "../ebook";

describe("gói mã ebook", () => {
  it("bản Demo và bản đầy đủ đều có gói 1 / 3 / 5 / 10 / 30 / 50 / 100 ebook", () => {
    const quotas = (edition: "demo" | "full") =>
      EBOOK_PLAN_KEYS.filter((key) => EBOOK_PLANS[key].kind === "ebook" && EBOOK_PLANS[key].edition === edition).map((key) => EBOOK_PLANS[key].quota);
    expect(quotas("demo")).toEqual([1, 3, 5, 10, 30, 50, 100]);
    expect(quotas("full")).toEqual([1, 3, 5, 10, 30, 50, 100]);
    // Mã Demo 100 lượt đã cấp vẫn trỏ về khoá "demo".
    expect(EBOOK_PLANS.demo).toMatchObject({ quota: 100, edition: "demo", prefix: "DEMO100" });
    expect(EBOOK_PLANS.demo1).toMatchObject({ label: "Demo 1 ebook", prefix: "DEMO01" });
    expect(EBOOK_PLANS.combo1).toMatchObject({ label: "Full 1 ebook", edition: "full", prefix: "FULL01" });
  });

  it("mã học viên ba cấp: tiền tố HV1–HV3, không có lượt xuất ebook", () => {
    expect(EBOOK_PLANS.hocvien1).toMatchObject({ kind: "student", level: 1, label: "Học viên cấp 1", prefix: "HV1", quota: 0 });
    expect(EBOOK_PLANS.hocvien3).toMatchObject({ kind: "student", level: 3, prefix: "HV3" });
    expect(EBOOK_PLAN_KEYS.filter((key) => isStudentPlan(key))).toEqual([...STUDENT_PLAN_KEYS]);
    expect(STUDENT_PLAN_KEYS.map(studentLevel)).toEqual([1, 2, 3]);
    expect(studentLevel("combo3")).toBe(0);
    // Mã HV-… cấp trước khi chia cấp (gói cũ "hocvien") được schema.sql đổi thành hocvien3; bản thân khoá cũ không còn.
    expect(isStudentPlan("hocvien")).toBe(false);
    expect(formatEbookCode("HV27KQ2M9XP")).toBe("HV2-7KQ2-M9XP");
    expect(formatEbookCode("HV1ANHA", "ANHA")).toBe("HV1-ANHA");
    expect(formatEbookCode("HV7KQ2M9XP")).toBe("HV-7KQ2-M9XP");
  });

  it("cấp cao dùng được phần của cấp thấp: Sim cấp 1, Gieo quẻ cấp 2, Xem ngày cấp 3", () => {
    expect(STUDENT_FEATURE_LEVEL).toEqual({ sim: 1, gieoQue: 2, xemNgay: 3 });
    const opens = (plan: string) => Object.entries(STUDENT_FEATURE_LEVEL).filter(([, need]) => studentLevel(plan) >= need).map(([feature]) => feature);
    expect(opens("hocvien1")).toEqual(["sim"]);
    expect(opens("hocvien2")).toEqual(["sim", "gieoQue"]);
    expect(opens("hocvien3")).toEqual(["sim", "gieoQue", "xemNgay"]);
  });

  it("tiền tố mỗi gói là duy nhất", () => {
    const prefixes = EBOOK_PLAN_KEYS.map((key) => EBOOK_PLANS[key].prefix);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });
});

describe("chuẩn hoá và hiển thị mã", () => {
  it("bỏ khoảng trắng, dấu gạch, không phân biệt hoa thường", () => {
    expect(normalizeEbookCode(" demo-2qym nvx9 ")).toBe("DEMO2QYMNVX9");
    expect(normalizeEbookCode("c100-d47u-uf6q")).toBe("C100D47UUF6Q");
  });

  it("định dạng tiền tố + 2 nhóm 4 ký tự", () => {
    expect(formatEbookCode("DEMO2QYMNVX9")).toBe("DEMO-2QYM-NVX9");
    expect(formatEbookCode("C100D47UUF6Q")).toBe("C100-D47U-UF6Q");
    expect(formatEbookCode("C03N5PAJPV2")).toBe("C03-N5PA-JPV2");
  });
});

describe("đuôi mã tự đặt", () => {
  it("bỏ dấu tiếng Việt, chữ hoa, chỉ giữ chữ và số", () => {
    expect(normalizeEbookSuffix("Anh Vĩnh 01")).toBe("ANHVINH01");
    expect(normalizeEbookSuffix("Đức-CTV")).toBe("DUCCTV");
  });

  it("độ dài 4–20 ký tự sau chuẩn hoá", () => {
    expect(validateEbookSuffix("Vĩnh")).toEqual({ ok: true, value: "VINH" });
    expect(validateEbookSuffix("ab!").ok).toBe(false);
    expect(validateEbookSuffix("A".repeat(21)).ok).toBe(false);
  });

  it("hiển thị tiền tố + đuôi, kể cả khi đuôi dài 8 ký tự hoặc tiền tố có số", () => {
    expect(formatEbookCode("DEMOANHVINH", "ANHVINH")).toBe("DEMO-ANHVINH");
    expect(formatEbookCode("FULL100ABCDEFGH", "ABCDEFGH")).toBe("FULL100-ABCDEFGH");
    expect(formatEbookCode("FULL1001234", "01234")).toBe("FULL10-01234");
  });

  it("tiền tố của mã có sẵn để đổi đuôi", () => {
    expect(ebookCodePrefix("DEMO5ET3RK8W")).toBe("DEMO");
    expect(ebookCodePrefix("FULL03N5PAJPV2")).toBe("FULL03");
    expect(ebookCodePrefix("C03N5PAJPV2")).toBe("C03");
    expect(ebookCodePrefix("DEMOANHVINH", "ANHVINH")).toBe("DEMO");
  });
});

describe("trạng thái mã", () => {
  const base = { status: "active", quota: 3, used: 0, expiresAt: null };
  it("dùng được / hết lượt / hết hạn / bị khoá", () => {
    expect(ebookCodeState(base)).toBe("active");
    expect(ebookCodeState({ ...base, used: 3 })).toBe("exhausted");
    expect(ebookCodeState({ ...base, expiresAt: new Date(Date.now() - 1000) })).toBe("expired");
    expect(ebookCodeState({ ...base, status: "disabled" })).toBe("disabled");
  });
  it("mã học viên không bao giờ hết lượt; vẫn hết hạn / bị khoá như mã ebook", () => {
    const student = { plan: "hocvien2", status: "active", quota: 0, used: 12, expiresAt: null };
    expect(ebookCodeState(student)).toBe("active");
    expect(ebookCodeState({ ...student, expiresAt: new Date(Date.now() - 1000) })).toBe("expired");
    expect(ebookCodeState({ ...student, status: "disabled" })).toBe("disabled");
  });
  it("hết hạn được ưu tiên hơn hết lượt; khoá ưu tiên cao nhất", () => {
    expect(ebookCodeState({ ...base, used: 3, expiresAt: new Date(Date.now() - 1000) })).toBe("expired");
    expect(ebookCodeState({ ...base, status: "disabled", used: 3 })).toBe("disabled");
  });
});

describe("loại ebook được phép theo mã", () => {
  it("mã demo chỉ xuất bản Demo; mã combo xuất được cả hai bản", async () => {
    const { ebookAllowsEdition, EBOOK_EDITION_CHOICES } = await import("../ebook");
    expect(ebookAllowsEdition("demo", "demo")).toBe(true);
    expect(ebookAllowsEdition("demo", "full")).toBe(false);
    expect(ebookAllowsEdition("full", "demo")).toBe(true);
    expect(ebookAllowsEdition("full", "full")).toBe(true);
    expect(EBOOK_EDITION_CHOICES.demo.title).toBe("Bản ebook TSH Demo 3 chỉ số");
    expect(EBOOK_EDITION_CHOICES.full.title).toBe("Bản ebook TSH đầy đủ");
  });
});
