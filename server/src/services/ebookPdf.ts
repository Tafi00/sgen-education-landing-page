import type { NumerologyFullReport } from "../../../shared/numerology.js";
import type { EbookEdition } from "../../../shared/ebook.js";
import { buildNumerologyPdf } from "./numerologyPdf.js";

export type EbookPdfInput = {
  /** Số điện thoại của khách hàng trong hồ sơ (không phải số của tài khoản/mã đang đăng nhập). */
  phone: string;
};

/**
 * Tạo file ebook theo loại.
 *
 * - `demo`: bản "Demo 3 chỉ số" — cùng mẫu 18 trang, trang tổng hợp chỉ hiện Sứ mệnh, Đường đời, Đam mê.
 * - `full`: bản đầy đủ — HIỆN dùng mẫu 18 trang với đủ mọi chỉ số, cho tới khi có tệp mẫu ebook đầy đủ. Khi có mẫu
 *   mới, chỉ cần thay nhánh `full` bằng hàm dựng file đầy đủ; toàn bộ hệ thống mã/lượt/khách hàng giữ nguyên.
 *
 * Cả hai bản đều điền số điện thoại khách hàng vào dòng "ĐIỆN THOẠI" của trang Thông tin cá nhân.
 */
export async function buildEbookPdf(edition: EbookEdition, report: NumerologyFullReport, input: EbookPdfInput): Promise<Uint8Array> {
  if (edition === "full") return buildNumerologyPdf(report, { phone: input.phone, edition: "full" });
  return buildNumerologyPdf(report, { phone: input.phone, edition: "demo" });
}
