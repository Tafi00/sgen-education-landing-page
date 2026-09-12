import { env } from "../env.js";
import { hashPassword } from "../middleware/auth.js";
import { User } from "../models/index.js";
import { seedAll } from "../scripts/seed.js";

/**
 * Bảo đảm môi trường mới luôn dùng được ngay sau khi deploy:
 * 1. `SEED_ON_BOOT=true` → nạp nội dung mặc định (idempotent, không ghi đè nội dung đã sửa).
 * 2. Có `ADMIN_EMAIL` + `ADMIN_PASSWORD` và chưa tồn tại tài khoản → tạo admin đầu tiên,
 *    bắt buộc đổi mật khẩu ở lần đăng nhập kế tiếp.
 *
 * Không hardcode credential: mọi giá trị đến từ biến môi trường của môi trường chạy.
 */
export async function ensureBootstrap() {
  if (env.seedOnBoot) {
    const summary = await seedAll(false);
    console.log(`[bootstrap] seed — ${summary}`);
  }

  if (!env.adminEmail || !env.adminPassword) return;
  const email = env.adminEmail.toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) return;
  await User.create({
    email,
    name: env.adminName || "Quản trị SGEN",
    role: "admin",
    passwordHash: await hashPassword(env.adminPassword),
    mustChangePassword: true,
  });
  console.log(`[bootstrap] đã tạo tài khoản admin đầu tiên: ${email} (đổi mật khẩu ở lần đăng nhập đầu).`);
}
