import { describe, expect, it } from "vitest";
import { formatPhone, normalizePhone, phoneSearchKey } from "../phone";

const ok = (raw: string) => {
  const result = normalizePhone(raw);
  if (!result.ok) throw new Error(`"${raw}" bị từ chối: ${result.message}`);
  return result.value;
};

describe("normalizePhone", () => {
  it("giữ số 0 đầu và lưu dạng chuỗi", () => {
    expect(ok("0912345678")).toBe("0912345678");
    expect(typeof ok("0912345678")).toBe("string");
  });

  it("bỏ khoảng trắng, dấu chấm, gạch, ngoặc", () => {
    expect(ok("0912 345 678")).toBe("0912345678");
    expect(ok("0912.345.678")).toBe("0912345678");
    expect(ok("(0912) 345-678")).toBe("0912345678");
  });

  it("giữ mã quốc gia và đổi 00 thành +", () => {
    expect(ok("+84 912 345 678")).toBe("+84912345678");
    expect(ok("0084912345678")).toBe("+84912345678");
    expect(ok("+1 415 555 2671")).toBe("+14155552671");
  });

  it("từ chối số rỗng, chữ cái, sai độ dài", () => {
    for (const raw of ["", "   ", "abc", "09123abc78", "091234567", "09123456789", "+0912345678", "+84 91234567", "+84 9123456789", "12345", "0912+345678", "+84+912345678"]) {
      expect(normalizePhone(raw).ok, raw).toBe(false);
    }
  });

  it("thông báo lỗi khác nhau cho bỏ trống và sai định dạng", () => {
    const empty = normalizePhone("");
    const bad = normalizePhone("12345");
    expect(empty.ok || empty.message).toMatch(/nhập số điện thoại/);
    expect(bad.ok || bad.message).toMatch(/chưa hợp lệ/);
  });
});

describe("formatPhone / phoneSearchKey", () => {
  it("định dạng dễ đọc nhưng không đổi giá trị gốc", () => {
    expect(formatPhone("0912345678")).toBe("0912 345 678");
    expect(formatPhone("+84912345678")).toBe("+84 912 345 678");
    expect(formatPhone("+14155552671")).toBe("+14155552671");
    expect(formatPhone("không phải số")).toBe("không phải số");
  });

  it("khoá tìm kiếm khớp mọi cách viết số Việt Nam", () => {
    expect(phoneSearchKey("+84 912 345 678")).toBe("0912345678");
    expect(phoneSearchKey("84912345678")).toBe("0912345678");
    expect(phoneSearchKey("0912.345.678")).toBe("0912345678");
  });
});
