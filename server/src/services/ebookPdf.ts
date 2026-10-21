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
 * - `demo`: bản "Demo 3 chỉ số" — ebook chi tiết chỉ có 3 chỉ số (Sứ mệnh, Đường đời, Đam mê), đúng file PDF 18 trang đang
 *   có trên web. Trang tổng hợp vẫn hiện đầy đủ (xem `DEMO_LOCKS_SUMMARY` nếu sau này cần khóa bớt).
 * - `full`: bản đầy đủ — HIỆN dùng cùng mẫu 18 trang cho tới khi có tệp mẫu ebook đầy đủ (luận giải mọi chỉ số). Khi có
 *   mẫu mới, chỉ cần thay nhánh `full` bằng hàm dựng file đầy đủ; toàn bộ hệ thống mã/lượt/khách hàng giữ nguyên.
 *
 * Cả hai bản đều điền số điện thoại khách hàng vào dòng "ĐIỆN THOẠI" của trang Thông tin cá nhân.
 */
export async function buildEbookPdf(edition: EbookEdition, report: NumerologyFullReport, input: EbookPdfInput): Promise<Uint8Array> {
  if (edition === "full") return buildNumerologyPdf(report, { phone: input.phone, edition: "full" });
  return buildNumerologyPdf(report, { phone: input.phone, edition: "demo" });
}
