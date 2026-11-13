import type { NextFunction, Request, Response } from "express";
import { Member } from "../models/index.js";

/** Bỏ phần thành viên khỏi phiên nhưng giữ phiên: cùng cookie còn có thể chứa phiên quản trị. */
export function clearMemberSession(req: Request) {
  if (!req.session) return;
  delete req.session.memberId;
  delete req.session.memberEmail;
  delete req.session.memberName;
}

/**
 * Phiên thành viên chỉ còn hiệu lực khi tài khoản còn tồn tại và chưa bị quản trị khoá.
 * Chạy trước mọi API: thành viên bị khoá (hoặc bị xoá) được đăng xuất ngay ở request kế tiếp,
 * và `res.locals.memberLocked` báo cho route biết lý do để hiện thông báo rõ ràng.
 */
export async function dropInactiveMemberSession(req: Request, res: Response, next: NextFunction) {
  const memberId = req.session?.memberId;
  if (!memberId) {
    next();
    return;
  }
  try {
    const member = await Member.findById(memberId).lean();
    if (!member || member.status === "locked") {
      clearMemberSession(req);
      if (member) res.locals.memberLocked = true;
    }
    next();
  } catch (error) {
    next(error);
  }
}
