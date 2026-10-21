import { phoneSearchKey } from "../../../shared/phone.js";
import { query } from "../db/pool.js";
import type { CustomerDoc } from "../models/index.js";

/** Bỏ dấu tiếng Việt, hạ chữ thường: dùng để tìm kiếm "tung" ra "TÙNG". */
export function searchKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Khoá chống trùng: giữ dấu (hai tên khác dấu là hai người khác nhau), bỏ khác biệt hoa/thường và khoảng trắng. */
export function nameKey(value: string) {
  return value.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();
}

export type CustomerInput = {
  name: string;
  /** YYYY-MM-DD (đã kiểm tra định dạng ở tầng API). */
  birthDate: string;
  /** Số điện thoại đã chuẩn hoá bằng `normalizePhone`. */
  phone: string;
  source: "lookup" | "ebook";
  codeId?: string | null;
};

/**
 * Tạo hoặc lấy lại hồ sơ khách hàng theo (họ tên, ngày sinh, số điện thoại).
 * Xuất ebook lại cho cùng một người luôn trả về đúng hồ sơ cũ — không sinh bản ghi trùng.
 */
export async function upsertCustomer(input: CustomerInput): Promise<CustomerDoc> {
  const name = input.name.replace(/\s+/g, " ").trim();
  const [, month, day] = input.birthDate.split("-").map(Number);
  const result = await query<CustomerDoc>(
    `INSERT INTO "customers" ("name", "nameKey", "nameSearch", "birthDate", "birthMonth", "birthDay", "phone", "phoneKey", "source", "codeId")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT ("nameKey", "birthDate", "phoneKey")
     DO UPDATE SET "name" = EXCLUDED."name", "phone" = EXCLUDED."phone", "updatedAt" = now()
     RETURNING *`,
    [name, nameKey(name), searchKey(name), input.birthDate, month, day, input.phone, phoneSearchKey(input.phone), input.source, input.codeId ?? null],
  );
  return result.rows[0];
}
