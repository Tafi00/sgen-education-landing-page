import type { NumerologyFullReport } from "../../../shared/numerology.js";
import type { EbookEdition } from "../../../shared/ebook.js";
import { buildFullNumerologyPdf } from "./numerologyFullPdf.js";
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
 * - `full`: bản đầy đủ ~73 trang theo Mục lục của bộ PDF gốc — đủ 5 chương, mọi chỉ số đều có trang giới thiệu và trang
 *   luận giải theo con số, cùng biểu đồ chặng đường đời, Ikigai, biểu đồ ngày sinh/họ tên (`numerologyFullPdf.ts`).
 *
 * Cả hai bản đều điền số điện thoại khách hàng vào dòng "ĐIỆN THOẠI" của trang Thông tin cá nhân.
 */
export async function buildEbookPdf(edition: EbookEdition, report: NumerologyFullReport, input: EbookPdfInput): Promise<Uint8Array> {
  if (edition === "full") return buildFullNumerologyPdf(report, { phone: input.phone });
  return buildNumerologyPdf(report, { phone: input.phone, edition: "demo" });
}
