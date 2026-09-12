import { Router } from "express";
import { z } from "zod";
import { Entitlement, LookupReport, Member, Order } from "../../models/index.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { currentMember, hashPassword, requireMember, verifyPassword } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rateLimit.js";
import { memberLoginSchema, memberRegisterSchema } from "../schemas.js";
import { randomToken } from "../../services/crypto.js";

export const publicMemberRouter = Router();

const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;

function startMemberSession(req: Parameters<typeof currentMember>[0], member: { id: string; email: string; name: string }) {
  const { promise, resolve } = Promise.withResolvers<void>();
  req.session.regenerate((error) => {
    if (error) throw new AppError(500, "Không tạo được phiên đăng nhập.", "session_error");
    req.session.memberId = member.id;
    req.session.memberEmail = member.email;
    req.session.memberName = member.name;
    req.session.csrfToken = randomToken();
    req.session.save((saveError) => {
      if (saveError) throw new AppError(500, "Không lưu được phiên đăng nhập.", "session_error");
      resolve();
    });
  });
  return promise;
}

publicMemberRouter.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = memberRegisterSchema.parse(req.body);
    const existing = await Member.findOne({ email: parsed.email.toLowerCase() });
    if (existing) throw new AppError(409, "Email này đã được đăng ký. Vui lòng đăng nhập.", "email_taken");
    const member = await Member.create({
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      phone: parsed.phone ?? "",
      birthDate: parsed.birthDate ?? "",
      passwordHash: await hashPassword(parsed.password),
      consentAt: new Date(),
    });
    await startMemberSession(req, { id: String(member._id), email: member.email, name: member.name });
    res.status(201).json({ member: { id: String(member._id), name: member.name, email: member.email } });
  }),
);

publicMemberRouter.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const parsed = memberLoginSchema.parse(req.body);
    const member = await Member.findOne({ email: parsed.email.toLowerCase() }).select("+passwordHash");
    if (!member) throw new AppError(401, "Email hoặc mật khẩu chưa đúng.", "invalid_credentials");
    if (member.lockedUntil && member.lockedUntil > new Date()) {
      throw new AppError(423, `Tài khoản đang tạm khoá. Vui lòng thử lại sau ${LOCK_MINUTES} phút.`, "locked");
    }
    if (!(await verifyPassword(parsed.password, member.passwordHash))) {
      member.failedLogins += 1;
      if (member.failedLogins >= MAX_FAILED_LOGINS) {
        member.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        member.failedLogins = 0;
      }
      await member.save();
      throw new AppError(401, "Email hoặc mật khẩu chưa đúng.", "invalid_credentials");
    }
    member.failedLogins = 0;
    member.lockedUntil = null;
    member.lastLoginAt = new Date();
    await member.save();
    await startMemberSession(req, { id: String(member._id), email: member.email, name: member.name });
    res.json({ member: { id: String(member._id), name: member.name, email: member.email } });
  }),
);

publicMemberRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    req.session.destroy(() => {
      res.clearCookie("sgen_member");
      res.json({ ok: true });
    });
  }),
);

publicMemberRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const member = currentMember(req);
    if (!member) {
      res.json({ member: null, entitlements: [] });
      return;
    }
    const entitlements = await Entitlement.find({
      memberId: member.id,
      active: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    }).lean();
    res.json({ member, entitlements });
  }),
);

publicMemberRouter.patch(
  "/me",
  requireMember,
  asyncHandler(async (req, res) => {
    const member = currentMember(req)!;
    const parsed = z
      .object({ name: z.string().min(2).max(160).optional(), phone: z.string().max(40).optional(), birthDate: z.string().max(20).optional() })
      .parse(req.body);
    const updated = await Member.findByIdAndUpdate(member.id, { $set: parsed }, { new: true }).lean();
    res.json({ member: { id: String(updated?._id), name: updated?.name, email: updated?.email } });
  }),
);

publicMemberRouter.delete(
  "/me",
  requireMember,
  asyncHandler(async (req, res) => {
    const member = currentMember(req)!;
    await Promise.all([
      LookupReport.updateMany({ memberId: member.id }, { $unset: { memberId: "" } }),
      Entitlement.updateMany({ memberId: member.id }, { $set: { active: false } }),
      Member.findByIdAndDelete(member.id),
    ]);
    req.session.destroy(() => res.json({ ok: true }));
  }),
);

publicMemberRouter.get(
  "/reports",
  requireMember,
  asyncHandler(async (req, res) => {
    const member = currentMember(req)!;
    const reports = await LookupReport.find({ memberId: member.id }).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ items: reports });
  }),
);

publicMemberRouter.get(
  "/orders",
  requireMember,
  asyncHandler(async (req, res) => {
    const member = currentMember(req)!;
    const orders = await Order.find({ memberId: member.id }).sort({ createdAt: -1 }).lean();
    res.json({ items: orders });
  }),
);
