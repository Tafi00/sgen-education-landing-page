import { Router, type Request } from "express";
import { z } from "zod";
import { ebookAllowsEdition, ebookCodeState, isStudentPlan } from "../../../../shared/ebook.js";
import { calculateFullNumerologyReport } from "../../../../shared/numerology.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { authLimiter, lookupLimiter } from "../../middleware/rateLimit.js";
import { EbookExport, LookupReport, type LookupReportDoc } from "../../models/index.js";
import { nameKey, upsertCustomer } from "../../services/customers.js";
import { consumeEbookCredit, findEbookCode, loadEbookCode, publicEbookInfo, refundEbookCredit } from "../../services/ebookCodes.js";
import { buildEbookPdf } from "../../services/ebookPdf.js";
import { ebookExportSchema } from "../schemas.js";

/**
 * Người dùng nhập mã ebook (hoặc mở đường dẫn có mã) để tự động đăng nhập, rồi xuất file.
 * Mỗi lần xuất thành công trừ 1 lượt của mã; tạo file lỗi thì hoàn lại lượt.
 *
 * Mỗi lượt xuất gắn với hồ sơ khách hàng (họ tên, ngày sinh, số điện thoại — bắt buộc, kiểm tra cả ở máy chủ)
 * và loại ebook (Demo 3 chỉ số / đầy đủ). Lịch sử chỉ ghi "success" khi file đã tạo xong.
 */
export const publicEbookRouter = Router();

const redeemSchema = z.object({ code: z.string().min(1, "Vui lòng nhập mã.").max(60) });

const STATE_MESSAGE = {
  disabled: "Mã này đã bị khoá. Vui lòng liên hệ SGEN để được hỗ trợ.",
  expired: "Mã này đã hết hạn. Vui lòng liên hệ SGEN để được cấp mã mới.",
  exhausted: "Mã này đã dùng hết lượt xuất. Vui lòng liên hệ SGEN để được cấp mã mới.",
} as const;

async function currentCode(req: Request) {
  const id = req.session?.ebookCodeId;
  if (!id) return null;
  const doc = await loadEbookCode(id);
  if (!doc || isStudentPlan(doc.plan)) {
    delete req.session.ebookCodeId;
    return null;
  }
  return doc;
}

publicEbookRouter.post(
  "/redeem",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { code } = redeemSchema.parse(req.body);
    const doc = await findEbookCode(code);
    if (!doc) throw new AppError(404, "Mã không đúng. Vui lòng kiểm tra lại từng ký tự.", "code_not_found");
    if (isStudentPlan(doc.plan)) {
      throw new AppError(422, "Đây là mã học viên, dùng để mở khoá chi tiết ở các công cụ Sim, Gieo quẻ, Xem ngày — không dùng để xuất ebook.", "student_code");
    }
    const state = ebookCodeState(doc);
    if (state !== "active") throw new AppError(403, STATE_MESSAGE[state], `code_${state}`);
    req.session.ebookCodeId = doc._id as string;
    res.json({ code: publicEbookInfo(doc) });
  }),
);

publicEbookRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const doc = await currentCode(req);
    res.json({ code: doc ? publicEbookInfo(doc) : null });
  }),
);

publicEbookRouter.post("/logout", (req, res) => {
  delete req.session.ebookCodeId;
  res.json({ ok: true });
});

/** Gắn báo cáo tra cứu vừa xem vào hồ sơ khách hàng, nếu đúng là báo cáo của người này. */
async function linkReportToCustomer(reportId: string | undefined, customerId: string, name: string, birthDate: string) {
  if (!reportId) return null;
  const report = await LookupReport.findById(reportId).lean<LookupReportDoc>();
  const inputs = (report?.inputs ?? {}) as { name?: string; birthDate?: string };
  if (!report || report.type !== "numerology" || inputs.birthDate !== birthDate || nameKey(String(inputs.name ?? "")) !== nameKey(name)) return null;
  if (!report.customerId) await LookupReport.updateOne({ _id: reportId, customerId: null }, { customerId });
  return reportId;
}

publicEbookRouter.post(
  "/export",
  lookupLimiter,
  asyncHandler(async (req, res) => {
    const doc = await currentCode(req);
    if (!doc) throw new AppError(401, "Vui lòng nhập mã ebook để tiếp tục.", "unauthenticated");
    // Kiểm tra cả họ tên, ngày sinh, loại ebook và số điện thoại (bắt buộc) trước khi trừ lượt.
    const input = ebookExportSchema.parse(req.body);
    if (!ebookAllowsEdition(doc.edition, input.edition)) {
      throw new AppError(403, "Mã này chỉ xuất được bản ebook Demo 3 chỉ số. Vui lòng chọn bản Demo hoặc liên hệ SGEN để được cấp mã ebook đầy đủ.", "edition_not_allowed");
    }

    // Tính trước để dữ liệu sai không làm mất lượt; chỉ trừ lượt khi sắp tạo file.
    const full = calculateFullNumerologyReport(input.name, input.birthDate, input.referenceYear ?? new Date().getFullYear());

    const consumed = await consumeEbookCredit(doc._id as string);
    if (!consumed) {
      const state = ebookCodeState(doc) === "active" ? "exhausted" : ebookCodeState(doc);
      throw new AppError(403, STATE_MESSAGE[state as keyof typeof STATE_MESSAGE] ?? STATE_MESSAGE.exhausted, `code_${state}`);
    }

    const record = (status: "success" | "failed", extra: { customerId?: string; reportId?: string | null; error?: string } = {}) =>
      EbookExport.create({
        codeId: doc._id,
        edition: input.edition,
        customerName: full.displayName,
        birthDate: input.birthDate,
        customerId: extra.customerId ?? null,
        customerPhone: input.phone,
        reportId: extra.reportId ?? null,
        status,
        error: (extra.error ?? "").slice(0, 300),
        ip: req.ip ?? "",
      });

    let pdf: Uint8Array;
    try {
      // Số điện thoại trong file là số của KHÁCH HÀNG trong hồ sơ, không phải thông tin của mã đang đăng nhập.
      pdf = await buildEbookPdf(input.edition, full, { phone: input.phone });
    } catch (error) {
      await refundEbookCredit(doc._id as string);
      // Lỗi tạo file: ghi nhận "failed" (không phải xuất thành công) để quản trị theo dõi; lỗi ghi log không che lỗi gốc.
      await record("failed", { error: error instanceof Error ? error.message : String(error) }).catch(() => undefined);
      throw error;
    }

    try {
      // File đã tạo xong → lưu hồ sơ khách hàng (xuất lại cho cùng một người luôn trả về đúng hồ sơ cũ, không tạo bản ghi
      // trùng) rồi mới ghi lịch sử "success".
      const customer = await upsertCustomer({ name: full.displayName, birthDate: input.birthDate, phone: input.phone, source: "ebook", codeId: doc._id as string });
      const reportId = await linkReportToCustomer(input.reportId, customer._id, input.name, input.birthDate);
      await record("success", { customerId: customer._id, reportId });
    } catch (error) {
      // Không ghi được hồ sơ / lịch sử thì không giao file: hoàn lượt để người dùng thử lại.
      await refundEbookCredit(doc._id as string);
      throw error;
    }

    const slug = full.displayName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ket-qua";
    const suffix = input.edition === "demo" ? "demo-3-chi-so" : "day-du";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ebook-than-so-hoc-${suffix}-${slug}.pdf"`);
    res.setHeader("X-Ebook-Remaining", String(Math.max(0, consumed.quota - consumed.used)));
    res.send(Buffer.from(pdf));
  }),
);
