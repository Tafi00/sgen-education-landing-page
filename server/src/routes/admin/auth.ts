import { Router } from "express";
import { z } from "zod";
import { AuditLog, User } from "../../models/index.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { currentAdmin, hashPassword, requireAdmin, verifyPassword } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import { randomToken } from "../../services/crypto.js";

export const adminAuthPublicRouter = Router();
export const adminAuthAdminRouter = Router();

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

adminAuthPublicRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const admin = currentAdmin(req);
    if (!admin) {
      res.json({ admin: null });
      return;
    }
    const record = await User.findById(admin.id).lean();
    res.json({
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, mustChangePassword: Boolean(record?.mustChangePassword) },
    });
  }),
);

adminAuthPublicRouter.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const user = await User.findOne({ email: parsed.email.toLowerCase() }).select("+passwordHash");
    if (!user || user.status !== "active") throw new AppError(401, "Email hoặc mật khẩu chưa đúng.", "invalid_credentials");
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError(423, `Tài khoản đang tạm khoá. Vui lòng thử lại sau ${LOCK_MINUTES} phút.`, "locked");
    }
    if (!(await verifyPassword(parsed.password, user.passwordHash))) {
      user.failedLogins += 1;
      if (user.failedLogins >= MAX_FAILED) {
        user.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        user.failedLogins = 0;
      }
      await user.save();
      throw new AppError(401, "Email hoặc mật khẩu chưa đúng.", "invalid_credentials");
    }
    user.failedLogins = 0;
    user.lockedUntil = null;
    user.lastLoginAt = new Date();
    await user.save();

    const { promise, resolve } = Promise.withResolvers<void>();
    req.session.regenerate((error) => {
      if (error) throw new AppError(500, "Không tạo được phiên đăng nhập.", "session_error");
      req.session.adminId = String(user._id);
      req.session.adminRole = user.role as "admin" | "editor";
      req.session.adminEmail = user.email;
      req.session.adminName = user.name;
      req.session.csrfToken = randomToken();
      req.session.save((saveError) => {
        if (saveError) throw new AppError(500, "Không lưu được phiên đăng nhập.", "session_error");
        resolve();
      });
    });
    await promise;

    await AuditLog.create({ actorId: user._id, actorEmail: user.email, action: "login", collectionName: "users", documentId: String(user._id) });
    res.json({ admin: { id: String(user._id), name: user.name, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword } });
  }),
);

adminAuthPublicRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("sgen_admin");
      res.json({ ok: true });
    });
  }),
);

adminAuthAdminRouter.post(
  "/password",
  asyncHandler(async (req, res) => {
    const admin = currentAdmin(req);
    if (!admin) throw new AppError(401, "Bạn cần đăng nhập để tiếp tục.", "unauthenticated");
    const parsed = z
      .object({ currentPassword: z.string().min(1), newPassword: z.string().min(8, "Mật khẩu mới cần ít nhất 8 ký tự.").max(200) })
      .parse(req.body);
    const user = await User.findById(admin.id).select("+passwordHash");
    if (!user) throw new AppError(404, "Không tìm thấy tài khoản.", "not_found");
    if (!(await verifyPassword(parsed.currentPassword, user.passwordHash))) {
      throw new AppError(401, "Mật khẩu hiện tại chưa đúng.", "invalid_credentials");
    }
    user.passwordHash = await hashPassword(parsed.newPassword);
    user.mustChangePassword = false;
    await user.save();
    res.json({ ok: true });
  }),
);

/** Quản lý tài khoản quản trị: chỉ admin được tạo/sửa/khoá. */
adminAuthAdminRouter.get(
  "/users",
  requireAdmin("admin"),
  asyncHandler(async (_req, res) => {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 }).lean();
    res.json({ items: users });
  }),
);

adminAuthAdminRouter.post(
  "/users",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const parsed = z
      .object({
        name: z.string().min(2).max(160),
        email: z.string().email().max(200),
        role: z.enum(["admin", "editor"]),
        password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự.").max(200),
      })
      .parse(req.body);
    const exists = await User.findOne({ email: parsed.email.toLowerCase() });
    if (exists) throw new AppError(409, "Email này đã được dùng cho một tài khoản khác.", "email_taken");
    const created = await User.create({
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      role: parsed.role,
      passwordHash: await hashPassword(parsed.password),
      mustChangePassword: true,
    });
    res.status(201).json({ item: { id: String(created._id), name: created.name, email: created.email, role: created.role } });
  }),
);

adminAuthAdminRouter.patch(
  "/users/:id",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const parsed = z
      .object({
        name: z.string().min(2).max(160).optional(),
        role: z.enum(["admin", "editor"]).optional(),
        status: z.enum(["active", "locked"]).optional(),
        password: z.string().min(8).max(200).optional(),
      })
      .parse(req.body);
    const admin = currentAdmin(req)!;
    if (req.params.id === admin.id && parsed.status === "locked") {
      throw new AppError(422, "Bạn không thể tự khoá tài khoản đang đăng nhập.", "invalid_operation");
    }
    const update: Record<string, unknown> = { ...parsed };
    delete update.password;
    if (parsed.password) {
      update.passwordHash = await hashPassword(parsed.password);
      update.mustChangePassword = true;
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true }).select("-passwordHash").lean();
    if (!updated) throw new AppError(404, "Không tìm thấy tài khoản.", "not_found");
    res.json({ item: updated });
  }),
);

adminAuthAdminRouter.delete(
  "/users/:id",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const admin = currentAdmin(req)!;
    if (req.params.id === admin.id) throw new AppError(422, "Bạn không thể tự xoá tài khoản đang đăng nhập.", "invalid_operation");
    const remainingAdmins = await User.countDocuments({ role: "admin", _id: { $ne: req.params.id } });
    const target = await User.findById(req.params.id).lean();
    if (!target) throw new AppError(404, "Không tìm thấy tài khoản.", "not_found");
    if (target.role === "admin" && remainingAdmins === 0) {
      throw new AppError(422, "Hệ thống cần ít nhất một tài khoản admin.", "last_admin");
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  }),
);
