import "express-session";

declare module "express-session" {
  interface SessionData {
    adminId?: string;
    adminRole?: "admin" | "editor";
    adminEmail?: string;
    adminName?: string;
    memberId?: string;
    memberEmail?: string;
    memberName?: string;
    csrfToken?: string;
    /** Mã ebook đang đăng nhập ở trang /ebook. */
    ebookCodeId?: string;
    /** Mã học viên đang mở khoá chi tiết các công cụ (Sim, Gieo quẻ, Xem ngày). */
    studentCodeId?: string;
  }
}
