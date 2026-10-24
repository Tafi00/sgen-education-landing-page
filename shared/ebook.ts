/**
 * Mã xuất ebook Thần số học.
 *
 * - Bản "Demo 3 chỉ số" (Sứ mệnh, Đường đời, Đam mê): mỗi mã 100 lượt xuất, dành cho cộng tác viên.
 * - Bản ebook đầy đủ: các combo 3 / 5 / 10 / 30 / 50 / 100 ebook, mỗi lượt xuất = 1 ebook.
 *
 * Khi xuất, người dùng chọn loại ebook (`EbookEdition`). Mã demo chỉ xuất được bản Demo; mã combo xuất được cả hai
 * bản — mỗi lượt xuất (bản nào cũng vậy) trừ 1 lượt của mã.
 *
 * Quản trị viên tạo mã ở /admin/ma-ebook. Người dùng nhập mã (hoặc mở đường dẫn có mã) ở /ebook,
 * được tự động đăng nhập bằng mã và xuất file cho tới khi hết lượt.
 */

export type EbookEdition = "demo" | "full";

export type EbookPlanKey = "demo" | "combo3" | "combo5" | "combo10" | "combo30" | "combo50" | "combo100";

export type EbookPlan = {
  key: EbookPlanKey;
  label: string;
  edition: EbookEdition;
  /** Số lượt xuất file của mỗi mã. */
  quota: number;
  /** Tiền tố đứng đầu mã để nhìn là biết loại: DEMO… = bản Demo, FULL… = bản đầy đủ (kèm số ebook của combo). */
  prefix: string;
  summary: string;
};

export const EBOOK_PLANS: Record<EbookPlanKey, EbookPlan> = {
  demo: { key: "demo", label: "Bản Demo 3 chỉ số", edition: "demo", quota: 100, prefix: "DEMO", summary: "100 lượt xuất ebook Demo 3 chỉ số" },
  combo3: { key: "combo3", label: "Combo 3 ebook", edition: "full", quota: 3, prefix: "FULL03", summary: "3 lượt xuất ebook đầy đủ" },
  combo5: { key: "combo5", label: "Combo 5 ebook", edition: "full", quota: 5, prefix: "FULL05", summary: "5 lượt xuất ebook đầy đủ" },
  combo10: { key: "combo10", label: "Combo 10 ebook", edition: "full", quota: 10, prefix: "FULL10", summary: "10 lượt xuất ebook đầy đủ" },
  combo30: { key: "combo30", label: "Combo 30 ebook", edition: "full", quota: 30, prefix: "FULL30", summary: "30 lượt xuất ebook đầy đủ" },
  combo50: { key: "combo50", label: "Combo 50 ebook", edition: "full", quota: 50, prefix: "FULL50", summary: "50 lượt xuất ebook đầy đủ" },
  combo100: { key: "combo100", label: "Combo 100 ebook", edition: "full", quota: 100, prefix: "FULL100", summary: "100 lượt xuất ebook đầy đủ" },
};

export const EBOOK_PLAN_KEYS = Object.keys(EBOOK_PLANS) as EbookPlanKey[];

export const EBOOK_EDITION_LABEL: Record<EbookEdition, string> = {
  demo: "Demo 3 chỉ số",
  full: "Ebook đầy đủ",
};

/** Tên hai lựa chọn hiển thị ở trang /ebook. */
export const EBOOK_EDITION_CHOICES: Record<EbookEdition, { title: string; description: string }> = {
  demo: { title: "Bản ebook TSH Demo 3 chỉ số", description: "Ebook chi tiết gồm 3 chỉ số: Sứ mệnh, Đường đời, Đam mê." },
  full: { title: "Bản ebook TSH đầy đủ", description: "Bản đầy đủ của báo cáo Thần số học." },
};

/** Mã demo chỉ xuất được bản Demo; mã combo (bản đầy đủ) xuất được cả hai bản. */
export function ebookAllowsEdition(codeEdition: EbookEdition, requested: EbookEdition): boolean {
  return codeEdition === "full" || requested === "demo";
}

/** Bỏ ký tự dễ nhầm (0/O, 1/I/L) để người nhận gõ tay không sai. */
export const EBOOK_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Chuẩn hoá mã người dùng nhập: chữ hoa, bỏ khoảng trắng; chấp nhận thiếu dấu gạch. */
export function normalizeEbookCode(raw: string): string {
  return String(raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/**
 * Dạng hiển thị: DEMO-7KQ2-M9XP (tiền tố + 2 nhóm 4 ký tự ngẫu nhiên). Mã có đuôi do quản trị tự đặt (`suffix`, lưu
 * riêng trong CSDL) hiển thị dạng tiền tố + đuôi: DEMO-ANHVINH.
 */
export function formatEbookCode(compact: string, suffix = ""): string {
  const clean = normalizeEbookCode(compact);
  if (suffix && clean.length > suffix.length && clean.endsWith(suffix)) return `${clean.slice(0, -suffix.length)}-${suffix}`;
  const body = clean.slice(-8);
  const prefix = clean.slice(0, clean.length - 8);
  if (clean.length <= 8) return clean;
  return `${prefix}-${body.slice(0, 4)}-${body.slice(4)}`;
}

/** Tiền tố của mã đã có (DEMO, FULL03, C03 cũ…): bỏ đuôi tự đặt, hoặc bỏ 8 ký tự ngẫu nhiên. */
export function ebookCodePrefix(compact: string, suffix = ""): string {
  const clean = normalizeEbookCode(compact);
  if (suffix && clean.length > suffix.length && clean.endsWith(suffix)) return clean.slice(0, -suffix.length);
  return clean.slice(0, Math.max(0, clean.length - 8));
}

export const EBOOK_SUFFIX_MIN = 4;
export const EBOOK_SUFFIX_MAX = 20;

/** Đuôi mã tự đặt: bỏ dấu tiếng Việt (Vĩnh → VINH, Đức → DUC), chữ hoa, chỉ giữ chữ và số. */
export function normalizeEbookSuffix(raw: string): string {
  return String(raw ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

export type EbookSuffixResult = { ok: true; value: string } | { ok: false; message: string };

export function validateEbookSuffix(raw: string): EbookSuffixResult {
  const value = normalizeEbookSuffix(raw);
  if (value.length < EBOOK_SUFFIX_MIN || value.length > EBOOK_SUFFIX_MAX) {
    return { ok: false, message: `Đuôi mã cần từ ${EBOOK_SUFFIX_MIN} đến ${EBOOK_SUFFIX_MAX} chữ cái hoặc chữ số (không tính dấu).` };
  }
  return { ok: true, value };
}

export type EbookCodeState = "active" | "exhausted" | "expired" | "disabled";

export function ebookCodeState(code: { status: string; quota: number; used: number; expiresAt?: string | Date | null }, now = new Date()): EbookCodeState {
  if (code.status !== "active") return "disabled";
  if (code.expiresAt && new Date(code.expiresAt).getTime() <= now.getTime()) return "expired";
  if (code.used >= code.quota) return "exhausted";
  return "active";
}

export const EBOOK_STATE_LABEL: Record<EbookCodeState, string> = {
  active: "Đang dùng được",
  exhausted: "Hết lượt",
  expired: "Hết hạn",
  disabled: "Đã khoá",
};
