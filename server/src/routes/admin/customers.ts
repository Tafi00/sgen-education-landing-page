import { Router } from "express";
import { EBOOK_EDITION_LABEL, formatEbookCode } from "../../../../shared/ebook.js";
import { phoneSearchKey } from "../../../../shared/phone.js";
import { requireAdmin } from "../../middleware/auth.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { query } from "../../db/pool.js";
import { searchKey } from "../../services/customers.js";
import type { CustomerDoc } from "../../models/index.js";

/**
 * Khách hàng đã để lại số điện thoại (bước tra cứu) hoặc được xuất ebook.
 * Quản trị xem/tìm theo họ tên hoặc số điện thoại, xem ngày sinh, loại ebook và lịch sử xuất,
 * lọc theo ngày/tháng sinh để chăm sóc sinh nhật. Dữ liệu chứa số điện thoại nên chỉ vai trò `admin` truy cập được.
 */
export const adminCustomerRouter = Router();

const ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

adminCustomerRouter.use(requireAdmin("admin"));

const SORTS: Record<string, string> = {
  createdAt: `c."createdAt"`,
  name: `c."nameSearch"`,
  birthDate: `c."birthMonth", c."birthDay"`,
  lastExportAt: `s."lastExportAt"`,
  exportCount: `s."exportCount"`,
};

type CustomerRow = CustomerDoc & { exportCount: number; lastExportAt: string | null; editions: string[] | null };

function presentCustomer(row: CustomerRow) {
  return {
    ...row,
    exportCount: Number(row.exportCount ?? 0),
    editions: (row.editions ?? []).map((edition) => ({ key: edition, label: EBOOK_EDITION_LABEL[edition as keyof typeof EBOOK_EDITION_LABEL] ?? edition })),
  };
}

adminCustomerRouter.get(
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

    // Tìm theo họ tên (không phân biệt dấu/hoa thường) hoặc số điện thoại (mọi cách viết: 0912…, +84912…).
    const keyword = String(req.query.q ?? "").trim();
    if (keyword) {
      const escape = (value: string) => value.replace(/[%_\\]/g, "\\$&");
      const nameLike = add(`%${escape(searchKey(keyword))}%`);
      const clauses = [`c."nameSearch" LIKE ${nameLike}`];
      const digits = phoneSearchKey(keyword);
      if (digits.length >= 3 && /^[\d\s.+()-]+$/.test(keyword)) clauses.push(`c."phoneKey" LIKE ${add(`%${escape(digits)}%`)}`);
      where.push(`(${clauses.join(" OR ")})`);
    }

    // Lọc ngày/tháng sinh (dương lịch) phục vụ chăm sóc sinh nhật.
    const month = Number(req.query.birthMonth);
    if (Number.isInteger(month) && month >= 1 && month <= 12) where.push(`c."birthMonth" = ${add(month)}`);
    const day = Number(req.query.birthDay);
    if (Number.isInteger(day) && day >= 1 && day <= 31) where.push(`c."birthDay" = ${add(day)}`);

    const edition = String(req.query.edition ?? "");
    if (edition === "demo" || edition === "full") {
      where.push(`EXISTS (SELECT 1 FROM "ebook_exports" e WHERE e."customerId" = c."_id" AND e."status" = 'success' AND e."edition" = ${add(edition)})`);
    }

    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const sortKey = SORTS[String(req.query.sort ?? "")] ?? SORTS.createdAt;
    const dir = String(req.query.dir ?? "desc") === "asc" ? "ASC" : "DESC";
    const orderBy = sortKey
      .split(",")
      .map((part) => `${part.trim()} ${dir} NULLS LAST`)
      .join(", ");

    const stats = `LEFT JOIN LATERAL (
      SELECT count(*) FILTER (WHERE e."status" = 'success')::int AS "exportCount",
             max(e."createdAt") FILTER (WHERE e."status" = 'success') AS "lastExportAt",
             array_agg(DISTINCT e."edition") FILTER (WHERE e."status" = 'success') AS "editions"
        FROM "ebook_exports" e WHERE e."customerId" = c."_id"
    ) s ON true`;

    const totalResult = await query<{ count: number }>(`SELECT count(*)::int AS count FROM "customers" c ${clause}`, params);
    const total = totalResult.rows[0]?.count ?? 0;
    const rows = await query<CustomerRow>(
      `SELECT c.*, s."exportCount", s."lastExportAt", s."editions"
         FROM "customers" c ${stats} ${clause}
        ORDER BY ${orderBy}, c."_id" LIMIT ${add(pageSize)} OFFSET ${add((page - 1) * pageSize)}`,
      params,
    );
    res.json({ items: rows.rows.map(presentCustomer), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }),
);

adminCustomerRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!ID_PATTERN.test(req.params.id)) throw new AppError(400, "ID không hợp lệ.", "invalid_id");
    const customer = await query<CustomerRow>(
      `SELECT c.*, s."exportCount", s."lastExportAt", s."editions"
         FROM "customers" c
         LEFT JOIN LATERAL (
           SELECT count(*) FILTER (WHERE e."status" = 'success')::int AS "exportCount",
                  max(e."createdAt") FILTER (WHERE e."status" = 'success') AS "lastExportAt",
                  array_agg(DISTINCT e."edition") FILTER (WHERE e."status" = 'success') AS "editions"
             FROM "ebook_exports" e WHERE e."customerId" = c."_id"
         ) s ON true
        WHERE c."_id" = $1`,
      [req.params.id],
    );
    const row = customer.rows[0];
    if (!row) throw new AppError(404, "Không tìm thấy khách hàng.", "not_found");

    const exports = await query<{ _id: string; edition: string; status: string; error: string; createdAt: string; customerPhone: string; code: string | null; holderName: string | null }>(
      `SELECT e."_id", e."edition", e."status", e."error", e."createdAt", e."customerPhone", k."code", k."holderName"
         FROM "ebook_exports" e LEFT JOIN "ebook_codes" k ON k."_id" = e."codeId"
        WHERE e."customerId" = $1 ORDER BY e."createdAt" DESC LIMIT 200`,
      [req.params.id],
    );
    const reports = await query<{ _id: string; title: string; createdAt: string; source: string }>(
      `SELECT "_id", "title", "createdAt", "source" FROM "lookup_reports" WHERE "customerId" = $1 ORDER BY "createdAt" DESC LIMIT 50`,
      [req.params.id],
    );
    res.json({
      item: presentCustomer(row),
      exports: exports.rows.map((item) => ({
        ...item,
        editionLabel: EBOOK_EDITION_LABEL[item.edition as keyof typeof EBOOK_EDITION_LABEL] ?? item.edition,
        codeDisplay: item.code ? formatEbookCode(item.code) : "",
        code: undefined,
      })),
      reports: reports.rows,
    });
  }),
);
