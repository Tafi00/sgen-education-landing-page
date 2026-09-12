import { Router } from "express";
import { z } from "zod";
import { LookupReport, Member } from "../../models/index.js";
import { requireAdmin } from "../../middleware/auth.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { hashPassword } from "../../middleware/auth.js";

export const adminLookupRouter = Router();

/**
 * Danh sách báo cáo tra cứu cho CMS: lọc theo loại, thành viên, lead, khoảng ngày
 * và tìm theo tiêu đề/nguồn.
 */
adminLookupRouter.get(
  "/",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(5, Number(req.query.pageSize ?? 20) || 20));
    const filter: Record<string, unknown> = {};
    if (req.query.type) filter.type = String(req.query.type);
    if (req.query.memberId) filter.memberId = String(req.query.memberId);
    if (req.query.leadId) filter.leadId = String(req.query.leadId);
    if (req.query.source) filter.source = String(req.query.source);
    if (req.query.from) filter.createdAt = { $gte: new Date(String(req.query.from)) };
    if (req.query.q) {
      const keyword = String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [{ title: { $regex: keyword, $options: "i" } }, { source: { $regex: keyword, $options: "i" } }];
    }
    const [items, total] = await Promise.all([
      LookupReport.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      LookupReport.countDocuments(filter),
    ]);
    res.json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }),
);

adminLookupRouter.get(
  "/:id",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const report = await LookupReport.findById(req.params.id).lean();
    if (!report) throw new AppError(404, "Không tìm thấy báo cáo tra cứu.", "not_found");
    res.json({ item: report });
  }),
);

adminLookupRouter.delete(
  "/:id",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const deleted = await LookupReport.findByIdAndDelete(req.params.id);
    if (!deleted) throw new AppError(404, "Không tìm thấy báo cáo tra cứu.", "not_found");
    res.json({ ok: true });
  }),
);

export const adminMemberActionRouter = Router();

/** Đặt lại mật khẩu thành viên: admin tạo mật khẩu tạm và gửi cho khách. */
adminMemberActionRouter.post(
  "/:id/password",
  asyncHandler(async (req, res) => {
    const parsed = z.object({ password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự.").max(200) }).parse(req.body);
    const member = await Member.findById(req.params.id);
    if (!member) throw new AppError(404, "Không tìm thấy thành viên.", "not_found");
    member.passwordHash = await hashPassword(parsed.password);
    member.failedLogins = 0;
    member.lockedUntil = null;
    await member.save();
    res.json({ ok: true });
  }),
);

/** Khoá hoặc mở khoá tài khoản thành viên. */
adminMemberActionRouter.post(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const parsed = z.object({ status: z.enum(["active", "locked"]) }).parse(req.body);
    const member = await Member.findByIdAndUpdate(req.params.id, { $set: { status: parsed.status } }, { new: true }).lean();
    if (!member) throw new AppError(404, "Không tìm thấy thành viên.", "not_found");
    res.json({ item: member });
  }),
);
