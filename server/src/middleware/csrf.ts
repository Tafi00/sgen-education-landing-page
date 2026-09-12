import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { env } from "../env.js";
import { AppError } from "./errors.js";

const CSRF_COOKIE = "sgen_csrf";
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHOD: Record<string, true> = { GET: true, HEAD: true, OPTIONS: true };

export function issueCsrfToken(req: Request, res: Response, next: NextFunction) {
  if (!req.session) {
    next();
    return;
  }
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(24).toString("base64url");
  res.cookie(CSRF_COOKIE, req.session.csrfToken, {
    httpOnly: false,
    sameSite: "lax",
    secure: env.cookieSecure,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  next();
}

/** Double-submit cookie: request đổi dữ liệu phải gửi token khớp token trong phiên. */
export function requireCsrf(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHOD[req.method]) {
    next();
    return;
  }
  const expected = req.session?.csrfToken;
  const provided = req.get(CSRF_HEADER) ?? "";
  if (
    !expected ||
    !provided ||
    provided.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected))
  ) {
    next(new AppError(403, "Phiên làm việc đã hết hạn hoặc thiếu mã xác thực. Vui lòng tải lại trang.", "csrf_failed"));
    return;
  }
  next();
}

export { CSRF_COOKIE, CSRF_HEADER };
