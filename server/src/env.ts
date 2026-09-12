import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function loadDotEnvFile() {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^["']|["']$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnvFile();

const isProduction = (process.env.NODE_ENV ?? "development") === "production";
const dataDir = path.resolve(ROOT, process.env.DATA_DIR ?? ".data");

function persistentSecret(fileName: string) {
  const fromEnv = process.env[fileName === "settings.key" ? "SETTINGS_ENC_KEY" : "SESSION_SECRET"];
  if (fromEnv && fromEnv.length >= 16) return fromEnv;
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, fileName);
  if (fs.existsSync(file)) {
    const stored = fs.readFileSync(file, "utf8").trim();
    if (stored.length >= 16) return stored;
  }
  const generated = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(file, generated, { mode: 0o600 });
  if (isProduction) {
    console.warn(`[env] ${fileName} chưa được cấu hình — đã sinh khoá mới tại ${file}. Hãy sao lưu file này.`);
  }
  return generated;
}

export const env = {
  isProduction,
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/postgres",
  databasePoolSize: Number(process.env.DATABASE_POOL_SIZE ?? 10),
  sessionSecret: persistentSecret("session.key"),
  settingsKey: persistentSecret("settings.key"),
  uploadDir: path.resolve(ROOT, process.env.UPLOAD_DIR ?? "uploads"),
  dataDir,
  publicOrigin: process.env.PUBLIC_ORIGIN ?? "http://127.0.0.1:5173",
  webDistDir: path.resolve(ROOT, "dist"),
  /** Nạp nội dung mặc định khi khởi động nếu database còn trống (deploy môi trường mới). */
  seedOnBoot: (process.env.SEED_ON_BOOT ?? "").toLowerCase() === "true",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  adminName: process.env.ADMIN_NAME ?? "Quản trị SGEN",
};

export type Env = typeof env;
