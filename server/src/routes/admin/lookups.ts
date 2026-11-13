import { Router } from "express";
import { z } from "zod";
import { AuditLog, LookupReport, Member } from "../../models/index.js";
import { hashPassword, requireAdmin } from "../../middleware/auth.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";

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

/** Thao tác trên tài khoản khách: chỉ vai trò admin, giống các module dữ liệu cá nhân khác. */
adminMemberActionRouter.use(requireAdmin("admin"));

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function memberIdOf(raw: string) {
  if (!ID_PATTERN.test(raw)) throw new AppError(400, "ID không hợp lệ.", "invalid_id");
  return raw;
}

async function auditMember(req: { session: { adminId?: string; adminEmail?: string } }, action: string, documentId: string, diff: Record<string, unknown>) {
  await AuditLog.create({
    actorId: req.session.adminId,
    actorEmail: req.session.adminEmail ?? "",
    action,
    collectionName: "members",
    documentId,
    diff,
  });
}

/** Form quản trị không gửi trường để trống, nên mỗi trường bắt buộc cần thông báo "thiếu" riêng. */
const memberCreateSchema = z.object({
  name: z.string({ required_error: "Vui lòng nhập họ tên." }).trim().min(2, "Vui lòng nhập họ tên.").max(160),
  email: z.string({ required_error: "Vui lòng nhập email." }).trim().email("Email chưa hợp lệ.").max(200),
  phone: z.string().max(40).optional(),
  birthDate: z.string().max(20).optional(),
  password: z.string({ required_error: "Vui lòng nhập mật khẩu tạm." }).min(8, "Mật khẩu tạm cần ít nhất 8 ký tự.").max(200),
  /** Form quản trị gửi "draft" khi chưa chọn: bỏ qua để dùng mặc định "active". */
  status: z.enum(["active", "locked"]).optional().catch(undefined),
});

/** Quản trị tạo tài khoản thành viên với mật khẩu tạm để gửi cho khách. Nhật ký không ghi mật khẩu. */
adminMemberActionRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const { password, email, ...rest } = memberCreateSchema.parse(req.body);
    const normalizedEmail = email.toLowerCase();
    if (await Member.findOne({ email: normalizedEmail })) {
      throw new AppError(409, "Email này đã có tài khoản thành viên.", "email_taken");
    }
    const member = await Member.create({
      ...rest,
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      consentAt: new Date(),
    });
    await auditMember(req, "member.create", String(member._id), { email: member.email });
    res.status(201).json({ item: member.toObject() });
  }),
);

/** Đặt lại mật khẩu thành viên: admin tạo mật khẩu tạm và gửi cho khách. Nhật ký không ghi mật khẩu. */
adminMemberActionRouter.post(
  "/:id/password",
  asyncHandler(async (req, res) => {
    const id = memberIdOf(req.params.id);
    const parsed = z.object({ password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự.").max(200) }).parse(req.body);
    const member = await Member.findById(id);
    if (!member) throw new AppError(404, "Không tìm thấy thành viên.", "not_found");
    member.passwordHash = await hashPassword(parsed.password);
    member.failedLogins = 0;
    member.lockedUntil = null;
    await member.save();
    await auditMember(req, "member.password_reset", id, { email: member.email });
    res.json({ ok: true });
  }),
);

/**
 * Khoá hoặc mở khoá tài khoản thành viên. Khoá thì khách không đăng nhập được và phiên đang mở
 * bị đăng xuất ở request kế tiếp; mở khoá thì xoá luôn khoá tạm do nhập sai mật khẩu.
 */
adminMemberActionRouter.post(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const id = memberIdOf(req.params.id);
    const parsed = z.object({ status: z.enum(["active", "locked"]) }).parse(req.body);
    const patch = parsed.status === "active" ? { status: parsed.status, failedLogins: 0, lockedUntil: null } : { status: parsed.status };
    const member = await Member.findByIdAndUpdate(id, { $set: patch }, { new: true }).lean();
    if (!member) throw new AppError(404, "Không tìm thấy thành viên.", "not_found");
    await auditMember(req, parsed.status === "locked" ? "member.lock" : "member.unlock", id, { email: member.email });
    res.json({ item: member });
  }),
);
