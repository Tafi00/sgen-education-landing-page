/** Thông báo chung khi API không tới được PostgreSQL. */
export const DB_UNAVAILABLE_MESSAGE = "Hệ thống dữ liệu đang tạm gián đoạn. Vui lòng thử lại sau ít phút.";

/**
 * Mã lỗi cho thấy không tới được máy chủ PostgreSQL (khác với lỗi của chính câu lệnh SQL):
 * lỗi mạng của Node, lớp 08 (connection exception), 57P0x (máy chủ đang tắt) và 53300 (hết kết nối).
 */
const NETWORK_CODES = new Set(["ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN", "EHOSTUNREACH", "ENETUNREACH", "EPIPE"]);
const PG_UNAVAILABLE_CODES = new Set(["57P01", "57P02", "57P03", "53300"]);

/** pg-pool không gắn mã lỗi cho timeout khi mở kết nối, chỉ có thông điệp. */
const CONNECTION_MESSAGE_RE = /connection terminated|connection timeout|timeout exceeded when trying to connect|client has encountered a connection error/i;

export function isDbConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as { code?: unknown }).code;
  if (typeof code === "string" && (NETWORK_CODES.has(code) || PG_UNAVAILABLE_CODES.has(code) || /^08[0-9A-Z]{3}$/.test(code))) {
    return true;
  }
  return CONNECTION_MESSAGE_RE.test(error.message);
}
