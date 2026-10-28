import { Router } from "express";
import { z } from "zod";
import {
  EBOOK_PLAN_KEYS,
  EBOOK_PLANS,
  ebookCodePrefix,
  ebookCodeState,
  formatEbookCode,
  isStudentPlan,
  STUDENT_PLAN_KEYS,
  validateEbookSuffix,
  type EbookPlanKey,
} from "../../../../shared/ebook.js";
import { asyncHandler, AppError, parseBody } from "../../middleware/errors.js";
import { requireAdmin } from "../../middleware/auth.js";
import { query } from "../../db/pool.js";
import { AuditLog, EbookCode, EbookExport, type EbookCodeDoc } from "../../models/index.js";
import { generateEbookCodes, isUniqueViolation } from "../../services/ebookCodes.js";

/**
 * Quản trị mã xuất ebook và mã học viên: tạo hàng loạt hoặc tự đặt đuôi mã, tra cứu, khoá/mở, cộng thêm lượt (mã ebook),
 * xem lịch sử xuất file.
 */
export const adminEbookRouter = Router();

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const generateSchema = z.object({
  plan: z.enum(EBOOK_PLAN_KEYS as [EbookPlanKey, ...EbookPlanKey[]]),
  count: z.number().int().min(1, "Số lượng mã tối thiểu là 1.").max(100, "Mỗi lần tạo tối đa 100 mã."),
  holderName: z.string().max(120).optional(),
  holderContact: z.string().max(120).optional(),
  note: z.string().max(300).optional(),
  expiresInDays: z.number().int().min(1).max(3650).optional(),
  /** Đuôi mã tự đặt (VD: "AnhVinh" → DEMO-ANHVINH); bỏ trống = sinh ngẫu nhiên. */
  suffix: z.string().max(60).optional(),
});

/** Chuẩn hoá đuôi mã tự đặt; chuỗi rỗng = không đặt. */
function parseSuffix(raw: string | undefined) {
  if (!raw?.trim()) return "";
  const result = validateEbookSuffix(raw);
  if (!result.ok) throw new AppError(422, result.message, "invalid_suffix");
  return result.value;
}

const updateSchema = z.object({
  status: z.enum(["active", "disabled"]).optional(),
  holderName: z.string().max(120).optional(),
  holderContact: z.string().max(120).optional(),
  note: z.string().max(300).optional(),
  /** Cộng thêm lượt xuất vào mã hiện có. */
  addQuota: z.number().int().min(1).max(10000).optional(),
  expiresAt: z.string().max(40).nullable().optional(),
  /** Đổi đuôi mã (giữ tiền tố). Đường dẫn tự đăng nhập cũ hết dùng được; người đang đăng nhập không bị ảnh hưởng. */
  suffix: z.string().max(60).optional(),
});

function present(doc: EbookCodeDoc) {
  return {
    ...doc,
    display: formatEbookCode(doc.code, doc.suffix),
    remaining: Math.max(0, doc.quota - doc.used),
    state: ebookCodeState(doc),
    planLabel: EBOOK_PLANS[doc.plan as EbookPlanKey]?.label ?? doc.plan,
  };
}

async function audit(req: { session: { adminId?: string; adminEmail?: string } }, action: string, documentId: string, diff: Record<string, unknown>) {
  await AuditLog.create({
    actorId: req.session.adminId,
    actorEmail: req.session.adminEmail ?? "",
    action,
    collectionName: "ebook_codes",
    documentId,
    diff,
  });
}

adminEbookRouter.use(requireAdmin("admin"));

adminEbookRouter.get("/plans", (_req, res) => {
  res.json({ plans: Object.values(EBOOK_PLANS) });
});

adminEbookRouter.post(
  "/generate",
  asyncHandler(async (req, res) => {
    const input = parseBody(generateSchema, req.body);
    const items = await generateEbookCodes({ ...input, suffix: parseSuffix(input.suffix), createdBy: req.session.adminId ?? null });
    await audit(req, "ebook.generate", items[0]?.batchId ?? "", { plan: input.plan, count: items.length, holder: input.holderName ?? "" });
    res.status(201).json({ items: items.map(present), batchId: items[0]?.batchId ?? "" });
  }),
);

const SORTS: Record<string, string> = { createdAt: `"createdAt"`, used: `"used"`, code: `"code"`, lastUsedAt: `"lastUsedAt"` };

adminEbookRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(5, Number(req.query.pageSize ?? 20) || 20));
    const where: string[] = [];
    const params: unknown[] = [];
    const add = (value: unknown) => {
      params.push(value);
      return `$${params.length}`;
    };

    const keyword = String(req.query.q ?? "").trim();
    if (keyword) {
      const like = add(`%${keyword.replace(/[%_\\]/g, "\\$&")}%`);
      const compact = add(`%${keyword.toUpperCase().replace(/[^A-Z0-9]/g, "")}%`);
      where.push(`("code" ILIKE ${compact} OR "holderName" ILIKE ${like} OR "holderContact" ILIKE ${like} OR "note" ILIKE ${like})`);
    }
    const plan = String(req.query.plan ?? "");
    if (plan && plan !== "all") where.push(`"plan" = ${add(plan)}`);
    const batch = String(req.query.batchId ?? "");
    if (batch) where.push(`"batchId" = ${add(batch)}`);
    const state = String(req.query.state ?? "");
    // Mã học viên không có lượt (quota 0) nên không bao giờ "hết lượt" — giống ebookCodeState.
    if (state === "disabled") where.push(`"status" <> 'active'`);
    else if (state === "expired") where.push(`"status" = 'active' AND "expiresAt" IS NOT NULL AND "expiresAt" <= now()`);
    else if (state === "exhausted") where.push(`"status" = 'active' AND ("expiresAt" IS NULL OR "expiresAt" > now()) AND "used" >= "quota" AND "plan" <> ALL(${add(STUDENT_PLAN_KEYS)})`);
    else if (state === "active") where.push(`"status" = 'active' AND ("expiresAt" IS NULL OR "expiresAt" > now()) AND ("used" < "quota" OR "plan" = ANY(${add(STUDENT_PLAN_KEYS)}))`);

    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sortKey = SORTS[String(req.query.sort ?? "")] ?? SORTS.createdAt;
    const dir = String(req.query.dir ?? "desc") === "asc" ? "ASC" : "DESC";

    const totalResult = await query<{ count: number }>(`SELECT count(*)::int AS count FROM "ebook_codes" ${clause}`, params);
    const total = totalResult.rows[0]?.count ?? 0;
    const rows = await query<EbookCodeDoc>(
      `SELECT * FROM "ebook_codes" ${clause} ORDER BY ${sortKey} ${dir} NULLS LAST, "_id" LIMIT ${add(pageSize)} OFFSET ${add((page - 1) * pageSize)}`,
      params,
    );
    res.json({ items: rows.rows.map(present), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }),
);

adminEbookRouter.get(
  "/summary",
  asyncHandler(async (_req, res) => {
    const result = await query<{ plan: string; codes: number; quota: number; used: number }>(
      `SELECT "plan", count(*)::int AS codes, coalesce(sum("quota"),0)::int AS quota, coalesce(sum("used"),0)::int AS used FROM "ebook_codes" GROUP BY "plan"`,
    );
    res.json({ plans: result.rows });
  }),
);

adminEbookRouter.get(
  "/:id/exports",
  asyncHandler(async (req, res) => {
    if (!ID_PATTERN.test(req.params.id)) throw new AppError(400, "ID không hợp lệ.", "invalid_id");
    const items = await EbookExport.find({ codeId: req.params.id }).sort({ createdAt: -1 }).limit(200).lean();
    res.json({ items });
  }),
);

adminEbookRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!ID_PATTERN.test(req.params.id)) throw new AppError(400, "ID không hợp lệ.", "invalid_id");
    const input = parseBody(updateSchema, req.body);
    const doc = await EbookCode.findById(req.params.id);
    if (!doc) throw new AppError(404, "Không tìm thấy mã ebook.", "not_found");
    const diff: Record<string, unknown> = {};
    if (input.status !== undefined && input.status !== doc.status) {
      diff.status = input.status;
      doc.status = input.status;
    }
    for (const key of ["holderName", "holderContact", "note"] as const) {
      if (input[key] !== undefined && input[key] !== doc[key]) {
        doc[key] = input[key] as string;
        diff[key] = input[key];
      }
    }
    if (input.addQuota && isStudentPlan(doc.plan)) throw new AppError(422, "Mã học viên không có lượt xuất ebook nên không cộng lượt được.", "student_code_quota");
    if (input.addQuota) {
      doc.quota += input.addQuota;
      diff.addQuota = input.addQuota;
    }
    if (input.suffix !== undefined) {
      const suffix = parseSuffix(input.suffix);
      if (!suffix) throw new AppError(422, "Vui lòng nhập đuôi mã mới.", "invalid_suffix");
      const code = `${ebookCodePrefix(doc.code, doc.suffix)}${suffix}`;
      if (code !== doc.code) {
        diff.code = { from: formatEbookCode(doc.code, doc.suffix), to: formatEbookCode(code, suffix) };
        doc.code = code;
        doc.suffix = suffix;
      }
    }
    if (input.expiresAt !== undefined) {
      const next = input.expiresAt ? new Date(input.expiresAt) : null;
      if (next && Number.isNaN(next.getTime())) throw new AppError(422, "Ngày hết hạn không hợp lệ.", "invalid_date");
      doc.expiresAt = next;
      diff.expiresAt = next ? next.toISOString() : null;
    }
    try {
      await doc.save();
    } catch (error) {
      if (isUniqueViolation(error)) throw new AppError(409, `Mã ${formatEbookCode(doc.code, doc.suffix)} đã có. Vui lòng chọn đuôi mã khác.`, "code_taken");
      throw error;
    }
    if (Object.keys(diff).length) await audit(req, "ebook.update", String(doc._id), { code: doc.code, ...diff });
    res.json({ item: present(doc.toObject() as EbookCodeDoc) });
  }),
);

adminEbookRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!ID_PATTERN.test(req.params.id)) throw new AppError(400, "ID không hợp lệ.", "invalid_id");
    const doc = await EbookCode.findByIdAndDelete(req.params.id);
    if (!doc) throw new AppError(404, "Không tìm thấy mã ebook.", "not_found");
    await EbookExport.deleteMany({ codeId: req.params.id });
    await audit(req, "ebook.delete", req.params.id, { code: doc.code });
    res.json({ ok: true });
  }),
);
