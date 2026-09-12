import crypto from "node:crypto";
import { connectDb, disconnectDb } from "../db.js";
import { User } from "../models/index.js";
import { hashPassword } from "../middleware/auth.js";

/**
 * Tạo tài khoản admin đầu tiên. Không hardcode credential: lấy từ biến môi trường
 * ADMIN_EMAIL/ADMIN_PASSWORD hoặc sinh mật khẩu ngẫu nhiên rồi in ra một lần.
 */
async function createAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const name = (process.env.ADMIN_NAME ?? "Quản trị SGEN").trim();
  const providedPassword = process.env.ADMIN_PASSWORD ?? "";
  const force = process.argv.includes("--force");

  if (!email) {
    console.error("[create-admin] thiếu ADMIN_EMAIL. Ví dụ: ADMIN_EMAIL=admin@sgen.vn ADMIN_PASSWORD=... npm run create-admin");
    process.exit(1);
  }

  await connectDb();
  const existing = await User.findOne({ email });
  if (existing && !force) {
    console.error(`[create-admin] tài khoản ${email} đã tồn tại. Dùng --force để đặt lại mật khẩu.`);
    await disconnectDb();
    process.exit(1);
  }

  const password = providedPassword || `Sgen-${crypto.randomBytes(6).toString("base64url")}`;
  const passwordHash = await hashPassword(password);

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.role = "admin";
    existing.status = "active";
    existing.mustChangePassword = true;
    await existing.save();
    console.log(`[create-admin] đã đặt lại mật khẩu cho ${email}. Mật khẩu mới: ${password}`);
  } else {
    await User.create({ email, name, role: "admin", passwordHash, mustChangePassword: true });
    const admins = await User.countDocuments({ role: "admin" });
    console.log(`[create-admin] đã tạo admin ${email} (tổng số admin: ${admins}).`);
    console.log(`[create-admin] mật khẩu tạm thời: ${password}`);
  }
  console.log("[create-admin] hãy đổi mật khẩu ngay sau lần đăng nhập đầu tiên tại /admin.");
  await disconnectDb();
}

createAdmin().catch((error) => {
  console.error("[create-admin] lỗi:", error instanceof Error ? error.message : error);
  process.exit(1);
});
