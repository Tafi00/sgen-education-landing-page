import type { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, type ZodTypeAny, type z } from "zod";

export class AppError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code = "error") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(handler: AsyncRoute): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response) {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: { code: "not_found", message: `Không tìm thấy ${req.method} ${req.originalUrl}` } });
    return;
  }
  res.status(404).send("Not found");
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(422).json({
      error: {
        code: "validation_error",
        message: "Dữ liệu gửi lên không hợp lệ.",
        fields: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
    });
    return;
  }
  const pgCode = typeof error === "object" && error !== null && "code" in error ? String((error as { code: unknown }).code) : "";
  /** 23505: vi phạm ràng buộc duy nhất. */
  if (pgCode === "23505") {
    const detail = "detail" in (error as object) ? String((error as { detail?: string }).detail ?? "") : "";
    const field = /\(([^)]+)\)=/.exec(detail)?.[1];
    res.status(409).json({
      error: {
        code: "duplicate_key",
        message: `Giá trị đã tồn tại${field ? ` ở trường ${field}` : ""}. Vui lòng chọn giá trị khác.`,
      },
    });
    return;
  }
  /** 23503: khoá ngoại không tồn tại; 22P02: giá trị sai định dạng (uuid, số…). */
  if (pgCode === "23503" || pgCode === "22P02" || pgCode === "23502") {
    res.status(422).json({ error: { code: "invalid_reference", message: "Dữ liệu tham chiếu không hợp lệ hoặc thiếu trường bắt buộc." } });
    return;
  }
  if (error instanceof AppError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } });
    return;
  }
  if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    const keyValue = "keyValue" in error ? error.keyValue : undefined;
    const fields = typeof keyValue === "object" && keyValue !== null ? Object.keys(keyValue) : [];
    res.status(409).json({
      error: {
        code: "duplicate_key",
        message: `Giá trị đã tồn tại${fields.length ? `: ${fields.join(", ")}` : ""}. Vui lòng chọn giá trị khác.`,
      },
    });
    return;
  }
  if (error instanceof Error && error.name === "MulterError") {
    res.status(422).json({ error: { code: "upload_error", message: "Tệp tải lên không hợp lệ hoặc vượt quá dung lượng cho phép (12MB)." } });
    return;
  }
  const message = error instanceof Error ? error.message : String(error);
  console.error("[api] lỗi không xử lý:", message);
  res.status(500).json({ error: { code: "internal_error", message: env_friendly(message) } });
}

function env_friendly(message: string) {
  return process.env.NODE_ENV === "production" ? "Có lỗi xảy ra phía máy chủ." : message;
}

export function parseBody<T extends ZodTypeAny>(schema: T, body: unknown): z.infer<T> {
  return schema.parse(body);
}

export function parseQuery<T extends ZodTypeAny>(schema: T, query: unknown): z.infer<T> {
  return schema.parse(query);
}
