import { createApp } from "./app.js";
import { connectDbInBackground, dbState } from "./db.js";
import { env } from "./env.js";

/** Không để lỗi nền (ví dụ PostgreSQL tạm thời không truy cập được) làm sập tiến trình. */
process.on("unhandledRejection", (reason) => {
  console.error("[api] promise bị từ chối không xử lý:", reason instanceof Error ? reason.message : reason);
});
process.on("uncaughtException", (error) => {
  console.error("[api] lỗi không bắt được:", error instanceof Error ? error.message : error);
});

connectDbInBackground();

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
