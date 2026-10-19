import { Router, type Request } from "express";
import { z } from "zod";
import { ebookCodeState } from "../../../../shared/ebook.js";
import { calculateFullNumerologyReport } from "../../../../shared/numerology.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { authLimiter, lookupLimiter } from "../../middleware/rateLimit.js";
import { EbookExport } from "../../models/index.js";
import { consumeEbookCredit, findEbookCode, loadEbookCode, publicEbookInfo, refundEbookCredit } from "../../services/ebookCodes.js";
import { buildEbookPdf } from "../../services/ebookPdf.js";
import { numerologyLookupSchema } from "../schemas.js";

/**
 * Người dùng nhập mã ebook (hoặc mở đường dẫn có mã) để tự động đăng nhập, rồi xuất file.
 * Mỗi lần xuất thành công trừ 1 lượt của mã; tạo file lỗi thì hoàn lại lượt.
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
  if (!doc) {
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

publicEbookRouter.post(
  "/export",
  lookupLimiter,
  asyncHandler(async (req, res) => {
    const doc = await currentCode(req);
    if (!doc) throw new AppError(401, "Vui lòng nhập mã ebook để tiếp tục.", "unauthenticated");
    const input = numerologyLookupSchema.parse(req.body);

    // Tính trước để dữ liệu sai không làm mất lượt; chỉ trừ lượt khi sắp tạo file.
    const full = calculateFullNumerologyReport(input.name, input.birthDate, input.referenceYear ?? new Date().getFullYear(), input.commonName);

    const consumed = await consumeEbookCredit(doc._id as string);
    if (!consumed) {
      const state = ebookCodeState(doc) === "active" ? "exhausted" : ebookCodeState(doc);
      throw new AppError(403, STATE_MESSAGE[state as keyof typeof STATE_MESSAGE] ?? STATE_MESSAGE.exhausted, `code_${state}`);
    }

    let pdf: Uint8Array;
    try {
      pdf = await buildEbookPdf(consumed.edition, full);
    } catch (error) {
      await refundEbookCredit(doc._id as string);
      throw error;
    }

    await EbookExport.create({
      codeId: doc._id,
      edition: consumed.edition,
      customerName: full.displayName,
      birthDate: input.birthDate,
      ip: req.ip ?? "",
    });

    const slug = full.displayName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "ket-qua";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ebook-than-so-hoc-${slug}.pdf"`);
    res.setHeader("X-Ebook-Remaining", String(Math.max(0, consumed.quota - consumed.used)));
    res.send(Buffer.from(pdf));
  }),
);
