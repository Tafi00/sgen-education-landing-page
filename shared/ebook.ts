/**
 * Mã xuất ebook Thần số học.
 *
 * - Bản demo (20 trang, giống file PDF hiện có trên web): mỗi mã 100 lượt xuất, dành cho cộng tác viên.
 * - Bản ebook đầy đủ: các combo 3 / 5 / 10 / 30 / 50 / 100 ebook, mỗi lượt xuất = 1 ebook.
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
  /** Tiền tố đứng đầu mã để nhìn là biết loại. */
  prefix: string;
  summary: string;
};

export const EBOOK_PLANS: Record<EbookPlanKey, EbookPlan> = {
  demo: { key: "demo", label: "Bản demo 20 trang", edition: "demo", quota: 100, prefix: "DEMO", summary: "100 lượt xuất ebook demo" },
  combo3: { key: "combo3", label: "Combo 3 ebook", edition: "full", quota: 3, prefix: "C03", summary: "3 lượt xuất ebook đầy đủ" },
  combo5: { key: "combo5", label: "Combo 5 ebook", edition: "full", quota: 5, prefix: "C05", summary: "5 lượt xuất ebook đầy đủ" },
  combo10: { key: "combo10", label: "Combo 10 ebook", edition: "full", quota: 10, prefix: "C10", summary: "10 lượt xuất ebook đầy đủ" },
  combo30: { key: "combo30", label: "Combo 30 ebook", edition: "full", quota: 30, prefix: "C30", summary: "30 lượt xuất ebook đầy đủ" },
  combo50: { key: "combo50", label: "Combo 50 ebook", edition: "full", quota: 50, prefix: "C50", summary: "50 lượt xuất ebook đầy đủ" },
  combo100: { key: "combo100", label: "Combo 100 ebook", edition: "full", quota: 100, prefix: "C100", summary: "100 lượt xuất ebook đầy đủ" },
};

export const EBOOK_PLAN_KEYS = Object.keys(EBOOK_PLANS) as EbookPlanKey[];

export const EBOOK_EDITION_LABEL: Record<EbookEdition, string> = {
  demo: "Demo 20 trang",
  full: "Ebook đầy đủ",
};

/** Bỏ ký tự dễ nhầm (0/O, 1/I/L) để người nhận gõ tay không sai. */
export const EBOOK_CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/** Chuẩn hoá mã người dùng nhập: chữ hoa, bỏ khoảng trắng; chấp nhận thiếu dấu gạch. */
export function normalizeEbookCode(raw: string): string {
  return String(raw ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

/** Dạng hiển thị: DEMO-7KQ2-M9XP (tiền tố + 2 nhóm 4 ký tự). */
export function formatEbookCode(compact: string): string {
  const clean = normalizeEbookCode(compact);
  const body = clean.slice(-8);
  const prefix = clean.slice(0, clean.length - 8);
  if (clean.length <= 8) return clean;
  return `${prefix}-${body.slice(0, 4)}-${body.slice(4)}`;
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
