import { describe, expect, it } from "vitest";
import { EBOOK_PLANS, EBOOK_PLAN_KEYS, ebookCodeState, formatEbookCode, normalizeEbookCode } from "../ebook";

describe("gói mã ebook", () => {
  it("demo 100 lượt, combo đúng số ebook", () => {
    expect(EBOOK_PLANS.demo).toMatchObject({ quota: 100, edition: "demo" });
    expect(EBOOK_PLAN_KEYS.filter((key) => key !== "demo").map((key) => EBOOK_PLANS[key].quota)).toEqual([3, 5, 10, 30, 50, 100]);
    for (const key of EBOOK_PLAN_KEYS.filter((item) => item !== "demo")) expect(EBOOK_PLANS[key].edition).toBe("full");
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

describe("trạng thái mã", () => {
  const base = { status: "active", quota: 3, used: 0, expiresAt: null };
  it("dùng được / hết lượt / hết hạn / bị khoá", () => {
    expect(ebookCodeState(base)).toBe("active");
    expect(ebookCodeState({ ...base, used: 3 })).toBe("exhausted");
    expect(ebookCodeState({ ...base, expiresAt: new Date(Date.now() - 1000) })).toBe("expired");
    expect(ebookCodeState({ ...base, status: "disabled" })).toBe("disabled");
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
