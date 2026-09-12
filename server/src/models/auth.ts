import { Model, type Doc } from "../db/model.js";

/**
 * Bảng tài khoản quản trị và thành viên.
 * `passwordHash` được đánh dấu `sensitive`: mặc định không nạp, muốn dùng phải
 * gọi `.select("+passwordHash")` — nhờ vậy hash không thể lọt ra API do sơ suất.
 */
export const User = new Model<UserDoc>({
  table: "users",
  fields: {
    email: { kind: "text" },
    name: { kind: "text" },
    passwordHash: { kind: "text", sensitive: true },
    role: { kind: "text" },
    status: { kind: "text" },
    mustChangePassword: { kind: "bool" },
    lastLoginAt: { kind: "date" },
    failedLogins: { kind: "int" },
    lockedUntil: { kind: "date" },
  },
});

export const Member = new Model<MemberDoc>({
  table: "members",
  fields: {
    email: { kind: "text" },
    name: { kind: "text" },
    phone: { kind: "text" },
    birthDate: { kind: "text" },
    passwordHash: { kind: "text", sensitive: true },
    status: { kind: "text" },
    consentAt: { kind: "date" },
    lastLoginAt: { kind: "date" },
    failedLogins: { kind: "int" },
    lockedUntil: { kind: "date" },
  },
});

export type UserDoc = Doc & {
  email: string;
  name: string;
  passwordHash: string;
  role: "admin" | "editor";
  status: "active" | "locked";
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  failedLogins: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type MemberDoc = Doc & {
  email: string;
  name: string;
  phone: string;
  birthDate: string;
  passwordHash: string;
  status: "active" | "locked";
  consentAt: Date | null;
  lastLoginAt: Date | null;
  failedLogins: number;
  lockedUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
