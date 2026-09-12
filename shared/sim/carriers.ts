/**
 * Chuẩn hoá số điện thoại Việt Nam và nhận diện nhà mạng.
 *
 * Input: chuỗi số điện thoại do người dùng nhập (có thể chứa khoảng trắng,
 * dấu chấm, gạch ngang hoặc tiền tố quốc tế +84 / 84).
 * Output: chuỗi 10 chữ số dạng nội địa (bắt đầu bằng 0) và tên nhà mạng.
 *
 * Quy tắc: bỏ mọi ký tự phân cách, quy tiền tố +84 hoặc 84 về 0; số không
 * đúng 10 chữ số hoặc chứa ký tự không hợp lệ sẽ bị từ chối bằng một lỗi
 * tiếng Việt. Nhà mạng được tra theo bảng đầu số cố định bên dưới, không
 * khớp bảng thì trả "Không xác định".
 */

export type CarrierName =
  | "Viettel"
  | "Vinaphone"
  | "Mobifone"
  | "Vietnamobile"
  | "Gmobile"
  | "Itelecom"
  | "Không xác định";

/** Nhà mạng tra theo đúng 3 chữ số đầu (ưu tiên trước dải 2 chữ số). */
const EXACT_PREFIX: Record<string, CarrierName> = {
  "086": "Viettel",
  "096": "Viettel",
  "097": "Viettel",
  "098": "Viettel",
  "091": "Vinaphone",
  "094": "Vinaphone",
  "089": "Mobifone",
  "090": "Mobifone",
  "093": "Mobifone",
  "052": "Vietnamobile",
  "056": "Vietnamobile",
  "058": "Vietnamobile",
  "092": "Vietnamobile",
  "059": "Gmobile",
  "099": "Gmobile",
  "087": "Itelecom",
};

/** Nhà mạng tra theo 2 chữ số đầu cho phần còn lại của các dải đầu số. */
const RANGE_PREFIX: Record<string, CarrierName> = {
  "03": "Viettel",
  "07": "Mobifone",
  "08": "Vinaphone",
};

/**
 * Chuẩn hoá số điện thoại về dạng nội địa 10 chữ số.
 *
 * @param raw Chuỗi người dùng nhập.
 * @returns Chuỗi 10 chữ số bắt đầu bằng "0".
 * @throws Error khi chuỗi rỗng, chứa ký tự không hợp lệ hoặc không đủ 10 chữ số.
 */
export function normalizePhone(raw: string): string {
  if (typeof raw !== "string" || raw.trim() === "") {
    throw new Error("Số điện thoại không hợp lệ: vui lòng nhập số điện thoại.");
  }

  const cleaned = raw.trim().replace(/[\s.\-()]/g, "");
  if (!/^\+?\d+$/.test(cleaned)) {
    throw new Error(
      "Số điện thoại không hợp lệ: chỉ được chứa chữ số, khoảng trắng, dấu chấm, gạch ngang hoặc dấu + ở đầu.",
    );
  }

  let national: string;
  if (cleaned.startsWith("+84")) {
    national = `0${cleaned.slice(3)}`;
  } else if (cleaned.startsWith("84") && cleaned.length === 11) {
    national = `0${cleaned.slice(2)}`;
  } else {
    national = cleaned;
  }

  if (!/^0\d{9}$/.test(national)) {
    throw new Error(
      "Số điện thoại không hợp lệ: cần đúng 10 chữ số bắt đầu bằng 0 (hoặc dạng +84…).",
    );
  }

  return national;
}

/**
 * Nhận diện nhà mạng từ số điện thoại đã chuẩn hoá (hoặc chuỗi 10 chữ số).
 *
 * @param phone Chuỗi 10 chữ số dạng nội địa.
 * @returns Tên nhà mạng, hoặc "Không xác định" nếu không khớp bảng đầu số.
 */
export function detectCarrier(phone: string): CarrierName {
  const exact = EXACT_PREFIX[phone.slice(0, 3)];
  if (exact) return exact;
  return RANGE_PREFIX[phone.slice(0, 2)] ?? "Không xác định";
}
