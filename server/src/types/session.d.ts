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
  }
}
