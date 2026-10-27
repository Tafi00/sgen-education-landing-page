import { Router, type Request } from "express";
import { z } from "zod";
import { ebookCodeState, formatEbookCode, isStudentPlan } from "../../../../shared/ebook.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import type { EbookCodeDoc } from "../../models/index.js";
import { findEbookCode, loadEbookCode, recordStudentCodeUse } from "../../services/ebookCodes.js";

/**
 * Mã học viên (gói `hocvien`, tiền tố HV, tạo ở Quản trị → Mã ebook): học viên nhập mã một lần ở các công cụ
 * Sim, Gieo quẻ, Xem ngày để xem phần chi tiết; phiên ghi `studentCodeId`. Mã bị khoá / hết hạn thì phiên tự hết.
 */
export const publicStudentRouter = Router();

const redeemSchema = z.object({ code: z.string().trim().min(1, "Vui lòng nhập mã học viên.").max(60) });

const STATE_MESSAGE = {
  disabled: "Mã học viên này đã bị khoá. Vui lòng liên hệ SGEN để được hỗ trợ.",
  expired: "Mã học viên này đã hết hạn. Vui lòng liên hệ SGEN để được cấp mã mới.",
} as const;

/** Thông tin an toàn trả cho học viên (không lộ người nhận, ghi chú nội bộ). */
function publicStudentInfo(doc: EbookCodeDoc) {
  return { display: formatEbookCode(doc.code, doc.suffix), expiresAt: doc.expiresAt };
}

async function currentStudentCode(req: Request) {
  const id = req.session?.studentCodeId;
  if (!id) return null;
  const doc = await loadEbookCode(id);
  if (!doc || !isStudentPlan(doc.plan) || ebookCodeState(doc) !== "active") {
    delete req.session.studentCodeId;
    return null;
  }
  return doc;
}

publicStudentRouter.post(
  "/redeem",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { code } = redeemSchema.parse(req.body);
    const doc = await findEbookCode(code);
    if (!doc) throw new AppError(404, "Mã không đúng. Vui lòng kiểm tra lại từng ký tự.", "code_not_found");
    if (!isStudentPlan(doc.plan)) {
      throw new AppError(422, "Đây là mã xuất ebook, không phải mã học viên. Mã ebook dùng ở trang Xuất ebook.", "not_student_code");
    }
    const state = ebookCodeState(doc);
    if (state === "disabled" || state === "expired") throw new AppError(403, STATE_MESSAGE[state], `code_${state}`);
    req.session.studentCodeId = doc._id as string;
    await recordStudentCodeUse(doc._id as string);
    res.json({ student: publicStudentInfo(doc) });
  }),
);

publicStudentRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const doc = await currentStudentCode(req);
    res.json({ student: doc ? publicStudentInfo(doc) : null });
  }),
);

publicStudentRouter.post("/logout", (req, res) => {
  delete req.session.studentCodeId;
  res.json({ ok: true });
});
