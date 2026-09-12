import { Router, type RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import type { Model } from "../db/model.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler, AppError, parseBody } from "../middleware/errors.js";

type FilterKind = "string" | "number" | "boolean" | "objectId" | "date";

export type CrudOptions = {
  model: Model;
  /** Tên hiển thị dùng trong thông báo lỗi. */
  label: string;
  searchFields: string[];
  filterFields: Record<string, FilterKind>;
  sortFields: string[];
  createSchema?: ZodTypeAny;
  updateSchema?: ZodTypeAny;
  /** Chuẩn hoá dữ liệu trước khi ghi (slug, mặc định, quan hệ…). */
  transform?: (data: Record<string, unknown>, mode: "create" | "update") => Record<string, unknown> | Promise<Record<string, unknown>>;
  /** Kiểm tra nghiệp vụ trước khi ghi; ném AppError để chặn. */
  guard?: (data: Record<string, unknown>, mode: "create" | "update", id?: string) => Promise<void>;
  /**
   * Vai trò được phép thao tác module này. Mặc định **chỉ `admin`**: module kinh doanh và
   * dữ liệu cá nhân (leads, orders, members…) không mở cho `editor`. Module nội dung phải
   * khai báo rõ `["admin", "editor"]`.
   */
  roles?: ("admin" | "editor")[];
};

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function buildQuery(query: Record<string, unknown>, options: CrudOptions) {
  const filter: Record<string, unknown> = {};
  const keyword = String(query.q ?? "").trim();
  if (keyword) {
    filter.$or = options.searchFields.map((field) => ({ [field]: { $regex: keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }));
  }
  for (const [field, kind] of Object.entries(options.filterFields)) {
    const raw = query[field];
    if (raw === undefined || raw === "" || raw === "all") continue;
    if (kind === "boolean") filter[field] = raw === "true" || raw === true;
    else if (kind === "number") filter[field] = Number(raw);
    else if (kind === "objectId") {
      if (!ID_PATTERN.test(String(raw))) throw new AppError(422, `Giá trị lọc ${field} không hợp lệ.`, "invalid_filter");
      filter[field] = raw;
    } else if (kind === "date") filter[field] = { $gte: new Date(String(raw)) };
    else filter[field] = Array.isArray(raw) ? { $in: raw.map(String) } : String(raw);
  }
  return filter;
}

function buildSort(query: Record<string, unknown>, options: CrudOptions) {
  const requested = String(query.sort ?? "");
  const field = options.sortFields.includes(requested) ? requested : options.sortFields[0] ?? "createdAt";
  const direction = String(query.dir ?? "desc") === "asc" ? 1 : -1;
  return { [field]: direction } as Record<string, 1 | -1>;
}

export function createCrudRouter(options: CrudOptions) {
  const router = Router();
  const model = options.model;
  const allow: RequestHandler = requireAdmin(...(options.roles ?? ["admin"]));

  router.get(
    "/",
    allow,
    asyncHandler(async (req, res) => {
      const page = Math.max(1, Number(req.query.page ?? 1) || 1);
      const pageSize = Math.min(100, Math.max(5, Number(req.query.pageSize ?? 20) || 20));
      const filter = buildQuery(req.query as Record<string, unknown>, options);
      const sort = buildSort(req.query as Record<string, unknown>, options);
      const [items, total] = await Promise.all([
        model.find(filter).sort(sort).skip((page - 1) * pageSize).limit(pageSize).lean(),
        model.countDocuments(filter),
      ]);
      res.json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
    }),
  );

  router.get(
    "/:id",
    allow,
    asyncHandler(async (req, res) => {
      if (!ID_PATTERN.test(req.params.id)) throw new AppError(400, "ID không hợp lệ.", "invalid_id");
      const doc = await model.findById(req.params.id).lean();
      if (!doc) throw new AppError(404, `Không tìm thấy ${options.label}.`, "not_found");
      res.json({ item: doc });
    }),
  );

  if (options.createSchema) {
    router.post(
      "/",
      allow,
      asyncHandler(async (req, res) => {
        const parsed = parseBody(options.createSchema!, req.body) as Record<string, unknown>;
        const data = options.transform ? await options.transform(parsed, "create") : parsed;
        await options.guard?.(data, "create");
        const created = await model.create(data);
        res.status(201).json({ item: created.toObject() });
      }),
    );
  }

  if (options.updateSchema) {
    router.patch(
      "/:id",
      allow,
      asyncHandler(async (req, res) => {
        if (!ID_PATTERN.test(req.params.id)) throw new AppError(400, "ID không hợp lệ.", "invalid_id");
        const parsed = parseBody(options.updateSchema!, req.body) as Record<string, unknown>;
        const data = options.transform ? await options.transform(parsed, "update") : parsed;
        await options.guard?.(data, "update", req.params.id);
        const updated = await model.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
        if (!updated) throw new AppError(404, `Không tìm thấy ${options.label}.`, "not_found");
        res.json({ item: updated.toObject() });
      }),
    );
  }

  router.delete(
    "/:id",
    allow,
    asyncHandler(async (req, res) => {
      if (!ID_PATTERN.test(req.params.id)) throw new AppError(400, "ID không hợp lệ.", "invalid_id");
      const deleted = await model.findByIdAndDelete(req.params.id);
      if (!deleted) throw new AppError(404, `Không tìm thấy ${options.label}.`, "not_found");
      res.json({ ok: true });
    }),
  );

  router.post(
    "/bulk",
    allow,
    asyncHandler(async (req, res) => {
      const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((id: unknown) => ID_PATTERN.test(String(id))) : [];
      if (!ids.length) throw new AppError(422, "Chưa chọn bản ghi nào.", "empty_selection");
      const action = String(req.body?.action ?? "");
      if (action === "delete") {
        const result = await model.deleteMany({ _id: { $in: ids } });
        res.json({ ok: true, affected: result.deletedCount ?? 0 });
        return;
      }
      if (action === "status") {
        const status = String(req.body?.status ?? "");
        const result = await model.updateMany({ _id: { $in: ids } }, { $set: { status } });
        res.json({ ok: true, affected: result.modifiedCount ?? 0 });
        return;
      }
      throw new AppError(422, "Hành động không được hỗ trợ.", "unsupported_action");
    }),
  );

  return router;
}
