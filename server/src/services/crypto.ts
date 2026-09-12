import crypto from "node:crypto";
import { env } from "../env.js";

const ALGORITHM = "aes-256-gcm";

function key() {
  return crypto.createHash("sha256").update(env.settingsKey).digest();
}

export function encryptSecret(plain: string) {
  if (!plain) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64url")}:${tag.toString("base64url")}:${encrypted.toString("base64url")}`;
}

export function decryptSecret(stored: string) {
  if (!stored || !stored.startsWith("v1:")) return "";
  const [, ivPart, tagPart, payloadPart] = stored.split(":");
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key(), Buffer.from(ivPart, "base64url"));
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(payloadPart, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

/** Chỉ hiển thị 4 ký tự cuối để admin biết đang có secret nào mà không lộ giá trị. */
export function maskSecret(value: string) {
  if (!value) return "";
  const tail = value.slice(-4);
  return `••••••••${tail}`;
}

export function generateOrderCode() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `SGEN${stamp}${crypto.randomInt(1000, 9999)}`;
}

export function randomToken(bytes = 24) {
  return crypto.randomBytes(bytes).toString("base64url");
}
