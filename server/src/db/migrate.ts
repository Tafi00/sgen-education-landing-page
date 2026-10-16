import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { query } from "./pool.js";

const here = path.dirname(fileURLToPath(import.meta.url));
/**
 * `schema.sql` được tìm ở nhiều vị trí vì file này chạy ở 2 dạng: `tsx` (dev, cùng thư mục)
 * và bundle `dist-server/index.js` (Dockerfile copy schema.sql ra cạnh bundle). Các script
 * `dist-server/scripts/*.js` (seed, create-admin) nằm sâu hơn một cấp nên tìm thêm ở thư mục cha.
 */
const SCHEMA_CANDIDATES = [
  path.join(here, "schema.sql"),
  path.join(here, "db", "schema.sql"),
  path.join(here, "..", "schema.sql"),
  path.join(process.cwd(), "server", "src", "db", "schema.sql"),
  path.join(here, "..", "server", "src", "db", "schema.sql"),
];

function schemaFile() {
  const found = SCHEMA_CANDIDATES.find((candidate) => fs.existsSync(candidate));
  if (!found) throw new Error(`Không tìm thấy schema.sql. Đã thử: ${SCHEMA_CANDIDATES.join(", ")}`);
  return found;
}

/** Chạy toàn bộ DDL (idempotent) để mọi môi trường tự dựng đủ bảng khi khởi động. */
export async function migrate() {
  const sql = fs.readFileSync(schemaFile(), "utf8");
  await query(sql);
}

if (process.argv[1] && process.argv[1].endsWith("migrate.ts")) {
  migrate()
    .then(() => {
      console.log("[db] đã áp dụng schema PostgreSQL.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[db] lỗi áp dụng schema:", error instanceof Error ? error.message : error);
      process.exit(1);
    });
}
