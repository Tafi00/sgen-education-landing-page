import path from "node:path";
import { Router, type Request } from "express";
import { z } from "zod";
import { ebookCodeState, formatEbookCode, isStudentPlan, STUDENT_FEATURE_LEVEL, studentLevel } from "../../../../shared/ebook.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import type { EbookCodeDoc } from "../../models/index.js";
import { findEbookCode, loadEbookCode, recordStudentCodeUse } from "../../services/ebookCodes.js";

/**
 * Mã học viên ba cấp (gói hocvien1–3, tiền tố HV1–HV3, tạo ở Quản trị → Mã ebook): học viên nhập mã một lần ở các
 * công cụ để xem phần chi tiết — cấp 1 Sim + Bát Cực, cấp 2 thêm Gieo quẻ và Phụ lục 64 quẻ, cấp 3 thêm Xem ngày; phiên
 * ghi `studentCodeId`. Mã bị khoá / hết hạn thì phiên tự hết.
 */
export const publicStudentRouter = Router();

const redeemSchema = z.object({ code: z.string().trim().min(1, "Vui lòng nhập mã học viên.").max(60) });

const STATE_MESSAGE = {
  disabled: "Mã học viên này đã bị khoá. Vui lòng liên hệ SGEN để được hỗ trợ.",
  expired: "Mã học viên này đã hết hạn. Vui lòng liên hệ SGEN để được cấp mã mới.",
} as const;

/** Thông tin an toàn trả cho học viên (không lộ người nhận, ghi chú nội bộ). */
function publicStudentInfo(doc: EbookCodeDoc) {
  return { display: formatEbookCode(doc.code, doc.suffix), level: studentLevel(doc.plan), expiresAt: doc.expiresAt };
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

/** Ảnh từng trang Phụ lục 64 quẻ (scripts/render_phu_luc_64_que.py) — không nằm trong public/, chỉ trả cho học viên. */
const PHU_LUC_DIR = path.resolve(process.cwd(), "assets/phu-luc-64-que/trang");
const PHU_LUC_PAGE = /^trang-\d{3}\.webp$/;

publicStudentRouter.get(
  "/phu-luc/:file",
  asyncHandler(async (req, res) => {
    if (!PHU_LUC_PAGE.test(req.params.file)) throw new AppError(404, "Không tìm thấy trang tài liệu.", "not_found");
    const doc = await currentStudentCode(req);
    if (!doc || studentLevel(doc.plan) < STUDENT_FEATURE_LEVEL.gieoQue) {
      throw new AppError(403, "Phụ lục 64 quẻ dành cho học viên có mã cấp 2 trở lên.", "student_required");
    }
    res.sendFile(path.join(PHU_LUC_DIR, req.params.file), { headers: { "Cache-Control": "private, max-age=86400" } }, (error) => {
      if (error && !res.headersSent) res.status(404).json({ error: { code: "not_found", message: "Không tìm thấy trang tài liệu." } });
    });
  }),
);

publicStudentRouter.post("/logout", (req, res) => {
  delete req.session.studentCodeId;
  res.json({ ok: true });
});
