import { createApp } from "./app.js";
import { ensureBootstrap } from "./db/bootstrap.js";
import { connectDb, connectDbInBackground, dbState } from "./db.js";
import { env } from "./env.js";

/** Không để lỗi nền (ví dụ PostgreSQL tạm thời không truy cập được) làm sập tiến trình. */
process.on("unhandledRejection", (reason) => {
  console.error("[api] promise bị từ chối không xử lý:", reason instanceof Error ? reason.message : reason);
});
process.on("uncaughtException", (error) => {
  console.error("[api] lỗi không bắt được:", error instanceof Error ? error.message : error);
});

/**
 * Kết nối DB rồi nạp dữ liệu tối thiểu (seed/admin đầu tiên) trước khi mở cổng, để môi trường
 * mới deploy xong là dùng được ngay. Nếu DB chưa sẵn sàng, server vẫn khởi động và thử lại nền.
 */
async function boot() {
  try {
    await connectDb();
    await ensureBootstrap();
  } catch (error) {
    console.error("[api] bỏ qua bước nạp dữ liệu đầu:", error instanceof Error ? error.message : error);
    connectDbInBackground();
  }
}

await boot();

const app = createApp();
const server = app.listen(env.port, () => {
  console.log(`[api] SGEN CMS API đang chạy tại http://127.0.0.1:${env.port} (db: ${dbState.status})`);
  console.log(`[api] upload dir: ${env.uploadDir}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
