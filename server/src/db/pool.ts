import pg from "pg";
import { env } from "../env.js";

/**
 * PostgreSQL là nguồn dữ liệu duy nhất của hệ thống (xem `docs/audit-toan-dien.md`).
 * `pg` trả int8 dạng chuỗi để tránh mất mát; giá trị tiền của SGEN nằm dưới 2^53 nên
 * chuyển về number cho khớp kiểu dữ liệu mà tầng API vẫn đang trả.
 */
pg.types.setTypeParser(pg.types.builtins.INT8, (value: string) => Number(value));

let connectionString = env.databaseUrl;
let activePool: pg.Pool | null = null;

/** Cho phép script (seed/smoke) trỏ sang database khác trước khi pool được tạo. */
export function setConnectionString(uri: string) {
  connectionString = uri;
  activePool = null;
}

export function getPool() {
  if (!activePool) {
    activePool = new pg.Pool({
      connectionString,
      max: env.databasePoolSize,
      connectionTimeoutMillis: 8000,
      idleTimeoutMillis: 30_000,
      application_name: "sgen-cms",
    });
    activePool.on("error", (error) => {
      console.error("[db] lỗi kết nối nhàn rỗi trong pool:", error.message);
    });
  }
  return activePool;
}

export async function query<R extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params: unknown[] = []) {
  return getPool().query<R>(text, params as never[]);
}

export async function closePool() {
  if (!activePool) return;
  await activePool.end();
  activePool = null;
}

/** Chuỗi kết nối đã che mật khẩu để ghi log. */
export function safeConnectionString() {
  return connectionString.replace(/\/\/[^@/]*@/, "//***@");
}
