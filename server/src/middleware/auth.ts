import type { NextFunction, Request, RequestHandler, Response } from "express";
import bcrypt from "bcryptjs";
import { AppError } from "./errors.js";

const BCRYPT_ROUNDS = 11;

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

export function currentAdmin(req: Request) {
  if (!req.session?.adminId) return null;
  return {
    id: req.session.adminId,
    role: req.session.adminRole ?? "editor",
    email: req.session.adminEmail ?? "",
    name: req.session.adminName ?? "",
  };
}

export function currentMember(req: Request) {
  if (!req.session?.memberId) return null;
  return {
    id: req.session.memberId,
    email: req.session.memberEmail ?? "",
    name: req.session.memberName ?? "",
  };
}

/** Bảo vệ toàn bộ API admin; tham số roles giới hạn theo vai trò. */
export function requireAdmin(...roles: ("admin" | "editor")[]): RequestHandler {
  const allowed = roles.length ? roles : (["admin", "editor"] as const);
  return (req: Request, _res: Response, next: NextFunction) => {
    const admin = currentAdmin(req);
    if (!admin) {
      next(new AppError(401, "Bạn cần đăng nhập để tiếp tục.", "unauthenticated"));
      return;
    }
    if (!allowed.includes(admin.role)) {
      next(new AppError(403, "Tài khoản của bạn không có quyền thực hiện thao tác này.", "forbidden"));
      return;
    }
    next();
  };
}

/** Thông báo khi quản trị đã khoá tài khoản thành viên (khác khoá tạm do nhập sai mật khẩu). */
export const MEMBER_LOCKED_MESSAGE = "Tài khoản đã bị khoá. Vui lòng liên hệ SGEN.";

export function requireMember(req: Request, res: Response, next: NextFunction) {
  if (!currentMember(req)) {
    next(
      res.locals.memberLocked
        ? new AppError(403, MEMBER_LOCKED_MESSAGE, "account_locked")
        : new AppError(401, "Bạn cần đăng nhập tài khoản thành viên.", "unauthenticated"),
    );
    return;
  }
  next();
}

export function requireRole(role: "admin" | "editor"): RequestHandler {
  return requireAdmin(role);
}
