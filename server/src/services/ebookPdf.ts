import type { NumerologyFullReport } from "../../../shared/numerology.js";
import type { EbookEdition } from "../../../shared/ebook.js";
import { buildNumerologyPdf } from "./numerologyPdf.js";

/**
 * Tạo file ebook theo loại.
 *
 * - `demo`: mẫu 18 trang đang dùng trên web (nút "Tải PDF" ở trang kết quả).
 * - `full`: HIỆN dùng chung mẫu demo cho tới khi có tệp mẫu ebook đầy đủ. Khi có mẫu mới, chỉ cần
 *   thay nhánh `full` bên dưới bằng hàm dựng file đầy đủ; toàn bộ hệ thống mã/lượt giữ nguyên.
 */
export async function buildEbookPdf(edition: EbookEdition, report: NumerologyFullReport): Promise<Uint8Array> {
  if (edition === "full") return buildNumerologyPdf(report);
  return buildNumerologyPdf(report);
}
