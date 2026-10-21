/**
 * Số điện thoại khách hàng — dùng chung cho form tra cứu, trang xuất ebook (client) và API (server).
 *
 * - Luôn lưu và truyền dạng CHUỖI để giữ số 0 đầu và mã quốc gia (`+84…`).
 * - Chấp nhận khoảng trắng, dấu chấm, gạch ngang, ngoặc khi nhập; chuẩn hoá về `0912345678` / `+84912345678`.
 * - Không dùng cho "Tên thường dùng" hay bất kỳ phép tính chỉ số thần số học nào.
 */

export type PhoneResult = { ok: true; value: string } | { ok: false; message: string };

const SEPARATORS = /[\s.\-()]/g;

export const PHONE_REQUIRED_MESSAGE = "Vui lòng nhập số điện thoại khách hàng.";
export const PHONE_INVALID_MESSAGE = "Số điện thoại chưa hợp lệ. Ví dụ: 0912 345 678 hoặc +84 912 345 678.";

/** Chuẩn hoá chuỗi người dùng nhập; trả về lý do khi không hợp lệ. */
export function normalizePhone(raw: unknown): PhoneResult {
  const text = String(raw ?? "").trim();
  if (!text) return { ok: false, message: PHONE_REQUIRED_MESSAGE };

  // Chỉ cho phép chữ số, dấu +, và các ký tự phân tách thông dụng.
  if (/[^\d+\s.\-()]/.test(text)) return { ok: false, message: PHONE_INVALID_MESSAGE };

  let compact = text.replace(SEPARATORS, "");
  // "00" là tiền tố quốc tế thay cho "+".
  if (compact.startsWith("00")) compact = `+${compact.slice(2)}`;
  if (compact.includes("+") && !compact.startsWith("+")) return { ok: false, message: PHONE_INVALID_MESSAGE };
  if ((compact.match(/\+/g) ?? []).length > 1) return { ok: false, message: PHONE_INVALID_MESSAGE };

  const international = compact.startsWith("+");
  const digits = international ? compact.slice(1) : compact;
  if (!/^\d+$/.test(digits)) return { ok: false, message: PHONE_INVALID_MESSAGE };

  if (international) {
    // E.164: mã quốc gia + số thuê bao, tối đa 15 chữ số; mã quốc gia không bắt đầu bằng 0.
    if (digits.length < 8 || digits.length > 15 || digits.startsWith("0")) return { ok: false, message: PHONE_INVALID_MESSAGE };
    // Số Việt Nam viết dạng quốc tế: +84 + 9 chữ số (bỏ số 0 đầu).
    if (digits.startsWith("84") && digits.length !== 11) return { ok: false, message: PHONE_INVALID_MESSAGE };
    return { ok: true, value: `+${digits}` };
  }

  // Dạng trong nước (Việt Nam): bắt đầu bằng 0, 10 chữ số (di động / cố định hiện hành).
  if (!digits.startsWith("0") || digits.length !== 10) return { ok: false, message: PHONE_INVALID_MESSAGE };
  return { ok: true, value: digits };
}

/** Dạng hiển thị dễ đọc: 0912 345 678, +84 912 345 678. Giá trị gốc không thay đổi. */
export function formatPhone(value: string): string {
  const result = normalizePhone(value);
  if (!result.ok) return value;
  const phone = result.value;
  if (phone.startsWith("+84")) return `+84 ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;
  if (phone.startsWith("+")) return phone;
  return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
}

/** Chuỗi chỉ gồm chữ số, dùng để tìm kiếm so khớp mọi cách viết (0912…, +84912…, 84912…). */
export function phoneSearchKey(raw: string): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.startsWith("84") && digits.length === 11) return `0${digits.slice(2)}`;
  return digits;
}
