import type { NextFunction, Request, RequestHandler, Response } from "express";
import rateLimit from "express-rate-limit";
import { dbState } from "../db.js";
import { AppError } from "./errors.js";

export function limiter(options: { windowMs: number; max: number; message: string }): RequestHandler {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new AppError(429, options.message, "rate_limited")),
  });
}

export const authLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút.",
});

export const publicFormLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  message: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.",
});

export const lookupLimiter = limiter({
  windowMs: 10 * 60 * 1000,
  max: 90,
  message: "Bạn đã tra cứu quá nhanh. Vui lòng chờ một lát.",
});

export function requireDb(_req: Request, _res: Response, next: NextFunction) {
  if (dbState.status !== "connected") {
    next(new AppError(503, "Hệ thống dữ liệu đang khởi động. Vui lòng thử lại sau vài giây.", "db_unavailable"));
    return;
  }
  next();
}
