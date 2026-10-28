/**
 * Mã xuất ebook Thần số học.
 *
 * - Bản "Demo 3 chỉ số" (Sứ mệnh, Đường đời, Đam mê) và bản ebook đầy đủ đều có các gói 1 / 3 / 5 / 10 / 30 / 50 / 100
 *   ebook để quản trị giao cho từng đối tượng; mỗi lượt xuất = 1 ebook.
 *
 * Khi xuất, người dùng chọn loại ebook (`EbookEdition`). Mã demo chỉ xuất được bản Demo; mã bản đầy đủ xuất được cả
 * hai bản — mỗi lượt xuất (bản nào cũng vậy) trừ 1 lượt của mã.
 *
 * Quản trị viên tạo mã ở /admin/ma-ebook. Người dùng nhập mã (hoặc mở đường dẫn có mã) ở /ebook,
 * được tự động đăng nhập bằng mã và xuất file cho tới khi hết lượt.
 *
 * Cùng bảng mã còn có "Mã học viên" ba cấp (gói `hocvien1` / `hocvien2` / `hocvien3`, tiền tố HV1 / HV2 / HV3): không
 * xuất ebook, chỉ mở khoá phần chi tiết của các công cụ — cấp 1: Sim số điện thoại, Bát Cực Linh Số; cấp 2: thêm Gieo
 * quẻ (kèm Phụ lục 64 quẻ); cấp 3: thêm Xem ngày. Mã cấp cao dùng được mọi phần của cấp thấp hơn. Học viên nhập mã ở
 * chính các công cụ đó.
 */

export type EbookEdition = "demo" | "full";

/**
 * Khoá gói lưu trong CSDL. `demo` là gói Demo 100 ebook có từ đầu (các mã đã cấp vẫn trỏ về khoá này);
 * `combo…` là các gói bản đầy đủ.
 */
export type EbookPlanKey =
  | "demo1"
  | "demo3"
  | "demo5"
  | "demo10"
  | "demo30"
  | "demo50"
  | "demo"
  | "combo1"
  | "combo3"
  | "combo5"
  | "combo10"
  | "combo30"
  | "combo50"
  | "combo100"
  | "hocvien1"
  | "hocvien2"
  | "hocvien3";

export type EbookPlan = {
  key: EbookPlanKey;
  /** `ebook` = mã xuất ebook; `student` = mã học viên mở khoá công cụ (không có lượt xuất). */
  kind: "ebook" | "student";
  /** Cấp của mã học viên (chỉ có ở `kind: "student"`). */
  level?: StudentLevel;
  label: string;
  edition: EbookEdition;
  /** Số lượt xuất file của mỗi mã. */
  quota: number;
  /**
   * Tiền tố đứng đầu mã để nhìn là biết loại và số ebook: DEMO01…DEMO100 = bản Demo, FULL01…FULL100 = bản đầy đủ.
   * Mã cấp trước khi đổi tiền tố (DEMO-…, C03-…) vẫn dùng được.
   */
  prefix: string;
  summary: string;
};

export type StudentLevel = 1 | 2 | 3;

/** Cấp tối thiểu để mở từng công cụ. */
export const STUDENT_FEATURE_LEVEL = { sim: 1, gieoQue: 2, xemNgay: 3 } as const satisfies Record<string, StudentLevel>;

/** Những gì mỗi cấp mở thêm so với cấp dưới. */
export const STUDENT_LEVEL_SCOPE: Record<StudentLevel, string> = {
  1: "Sim số điện thoại, Bát Cực Linh Số",
  2: "Sim, Bát Cực Linh Số và Gieo quẻ (kèm Phụ lục 64 quẻ)",
  3: "Sim, Bát Cực Linh Số, Gieo quẻ và Xem ngày",
};

function studentPlan(key: EbookPlanKey, level: StudentLevel): EbookPlan {
  return {
    key,
    kind: "student",
    level,
    label: `Học viên cấp ${level}`,
    // Không dùng để xuất ebook: `edition` chỉ để điền cột bắt buộc, `quota` = 0.
    edition: "full",
    quota: 0,
    prefix: `HV${level}`,
    summary: `Mở khoá chi tiết ${STUDENT_LEVEL_SCOPE[level]}`,
  };
}

function plan(key: EbookPlanKey, edition: EbookEdition, quota: number): EbookPlan {
  const demo = edition === "demo";
  return {
    key,
    kind: "ebook",
    label: `${demo ? "Demo" : "Full"} ${quota} ebook`,
    edition,
    quota,
    prefix: `${demo ? "DEMO" : "FULL"}${String(quota).padStart(2, "0")}`,
    summary: `${quota} lượt xuất ebook ${demo ? "Demo 3 chỉ số" : "đầy đủ"}`,
  };
}

export const EBOOK_PLANS: Record<EbookPlanKey, EbookPlan> = {
  demo1: plan("demo1", "demo", 1),
  demo3: plan("demo3", "demo", 3),
  demo5: plan("demo5", "demo", 5),
  demo10: plan("demo10", "demo", 10),
  demo30: plan("demo30", "demo", 30),
  demo50: plan("demo50", "demo", 50),
  demo: plan("demo", "demo", 100),
  combo1: plan("combo1", "full", 1),
  combo3: plan("combo3", "full", 3),
  combo5: plan("combo5", "full", 5),
  combo10: plan("combo10", "full", 10),
  combo30: plan("combo30", "full", 30),
  combo50: plan("combo50", "full", 50),
  combo100: plan("combo100", "full", 100),
  hocvien1: studentPlan("hocvien1", 1),
  hocvien2: studentPlan("hocvien2", 2),
  hocvien3: studentPlan("hocvien3", 3),
};

export const STUDENT_PLAN_KEYS = ["hocvien1", "hocvien2", "hocvien3"] as const satisfies readonly EbookPlanKey[];

/** Cấp của mã học viên (0 = không phải mã học viên). */
export function studentLevel(plan: string | null | undefined): StudentLevel | 0 {
  return plan ? (EBOOK_PLANS[plan as EbookPlanKey]?.level ?? 0) : 0;
}

/** Mã học viên (mở khoá công cụ), không phải mã xuất ebook. */
export function isStudentPlan(plan: string | null | undefined): boolean {
  return studentLevel(plan) > 0;
}

export const EBOOK_PLAN_KEYS = Object.keys(EBOOK_PLANS) as EbookPlanKey[];

export const EBOOK_EDITION_LABEL: Record<EbookEdition, string> = {
  demo: "Demo 3 chỉ số",
  full: "Ebook đầy đủ",
};

/** Tên hai lựa chọn hiển thị ở trang /ebook. */
export const EBOOK_EDITION_CHOICES: Record<EbookEdition, { title: string; description: string }> = {
  demo: { title: "Bản ebook TSH Demo 3 chỉ số", description: "Ebook chi tiết gồm 3 chỉ số: Sứ mệnh, Đường đời, Đam mê." },
  full: { title: "Bản ebook TSH đầy đủ", description: "Hơn 70 trang: đủ 5 chương, luận giải mọi chỉ số và các biểu đồ." },
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

/** Mã học viên không có lượt nên không bao giờ "hết lượt"; `used` của mã học viên là số lần nhập mã. */
export function ebookCodeState(
  code: { plan?: string; status: string; quota: number; used: number; expiresAt?: string | Date | null },
  now = new Date(),
): EbookCodeState {
  if (code.status !== "active") return "disabled";
  if (code.expiresAt && new Date(code.expiresAt).getTime() <= now.getTime()) return "expired";
  if (!isStudentPlan(code.plan) && code.used >= code.quota) return "exhausted";
  return "active";
}

export const EBOOK_STATE_LABEL: Record<EbookCodeState, string> = {
  active: "Đang dùng được",
  exhausted: "Hết lượt",
  expired: "Hết hạn",
  disabled: "Đã khoá",
};
