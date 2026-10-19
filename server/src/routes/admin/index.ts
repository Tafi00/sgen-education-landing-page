import { Router } from "express";
import { z } from "zod";
import { slugify } from "../../../../shared/slug.js";
import {
  Course,
  CourseCategory,
  Entitlement,
  Lead,
  MediaAsset,
  Member,
  NotificationLog,
  Order,
  Page,
  Post,
  PostCategory,
  QuizItem,
  QuizResult,
  QuizSet,
  Section,
  ServicePackage,
} from "../../models/index.js";
import { createCrudRouter } from "../../services/crud.js";
import { asyncHandler } from "../../middleware/errors.js";
import { hashPassword, requireAdmin } from "../../middleware/auth.js";
import { adminAuthAdminRouter } from "./auth.js";
import { adminDashboardRouter } from "./dashboard.js";
import { adminEbookRouter } from "./ebook.js";
import { adminLeadRouter } from "./leads.js";
import { adminLookupRouter, adminMemberActionRouter } from "./lookups.js";
import { adminMediaRouter } from "./media.js";
import { adminOrderRouter } from "./orders.js";
import { adminSettingsRouter } from "./settings.js";
import {
  courseCategorySchema,
  courseSchema,
  leadUpdateSchema,
  mediaMetaSchema,
  memberSchemaInput,
  orderUpdateSchema,
  pageSchemaInput,
  postCategorySchema,
  postSchema,
  quizItemSchema,
  quizResultSchemaInput,
  quizSetSchema,
  sectionSchemaInput,
  serviceSchema,
} from "../schemas.js";

/** Slug tự sinh từ tên khi admin không nhập, giữ nguyên slug đã có khi cập nhật. */
function withSlug(data: Record<string, unknown>, sourceField: string, mode: "create" | "update") {
  if (mode === "update" && !data.slug) return data;
  const explicit = typeof data.slug === "string" ? data.slug.trim() : "";
  const source = typeof data[sourceField] === "string" ? String(data[sourceField]) : "";
  const slug = explicit || slugify(source);
  return slug ? { ...data, slug } : data;
}

export const adminApiRouter = Router();

adminApiRouter.use("/auth", adminAuthAdminRouter);
adminApiRouter.use("/dashboard", adminDashboardRouter);
adminApiRouter.use("/settings", adminSettingsRouter);
adminApiRouter.use("/ebook-codes", adminEbookRouter);

adminApiRouter.use("/media", adminMediaRouter);
adminApiRouter.use(
  "/media",
  createCrudRouter({
    model: MediaAsset,
    label: "tệp",
      roles: ["admin", "editor"],
    searchFields: ["filename", "alt"],
    filterFields: { folder: "string", mime: "string" },
    sortFields: ["createdAt", "filename", "size"],
    updateSchema: mediaMetaSchema,
  }),
);

adminApiRouter.use("/leads", adminLeadRouter);
adminApiRouter.use(
  "/leads",
  createCrudRouter({
    model: Lead,
    label: "lead",
    searchFields: ["name", "phone", "email", "message", "source"],
    filterFields: { status: "string", source: "string", createdAt: "date" },
    sortFields: ["createdAt", "status", "name"],
    updateSchema: leadUpdateSchema,
  }),
);

adminApiRouter.use("/orders", adminOrderRouter);
adminApiRouter.use(
  "/orders",
  createCrudRouter({
    model: Order,
    label: "đơn hàng",
    searchFields: ["code", "customerName", "customerPhone", "customerEmail", "serviceName"],
    filterFields: { status: "string", method: "string", serviceSlug: "string", createdAt: "date" },
    sortFields: ["createdAt", "amount", "status", "code"],
    updateSchema: orderUpdateSchema,
  }),
);

adminApiRouter.use("/lookups", adminLookupRouter);

adminApiRouter.use(
  "/entitlements",
  createCrudRouter({
    model: Entitlement,
    label: "quyền truy cập",
    searchFields: ["type", "note"],
    filterFields: { type: "string", active: "boolean", memberId: "objectId" },
    sortFields: ["createdAt", "expiresAt", "type"],
    createSchema: z.object({
      memberId: z.string().min(1),
      type: z.enum(["vip-numerology", "lifetime"]),
      days: z.number().min(0).max(3650).optional(),
      note: z.string().max(500).optional(),
    }),
    transform: (data) => ({
      memberId: data.memberId,
      type: data.type,
      note: data.note ?? "",
      expiresAt: data.type === "lifetime" || !data.days ? null : new Date(Date.now() + Number(data.days) * 24 * 60 * 60 * 1000),
    }),
    updateSchema: z.object({ active: z.boolean().optional(), note: z.string().max(500).optional() }),
  }),
);

adminApiRouter.use(
  "/members",
  createCrudRouter({
    model: Member,
    label: "thành viên",
    searchFields: ["name", "email", "phone"],
    filterFields: { status: "string" },
    sortFields: ["createdAt", "lastLoginAt", "name"],
    createSchema: z.object({
      name: z.string().min(2).max(160),
      email: z.string().email().max(200),
      phone: z.string().max(40).optional(),
      birthDate: z.string().max(20).optional(),
      password: z.string().min(8).max(200),
    }),
    transform: async (data, mode) => {
      if (mode === "update") return data;
      const { password, ...rest } = data as { password: string; email: string };
      return { ...rest, email: String(rest.email).toLowerCase(), passwordHash: await hashPassword(password), consentAt: new Date() };
    },
    updateSchema: memberSchemaInput.partial(),
  }),
);

adminApiRouter.use(
  "/courses",
  createCrudRouter({
    model: Course,
    label: "khóa học",
      roles: ["admin", "editor"],
    searchFields: ["title", "summary", "slug"],
    filterFields: { status: "string", level: "string", categorySlug: "string" },
    sortFields: ["order", "createdAt", "title", "price"],
    createSchema: courseSchema,
    updateSchema: courseSchema.partial(),
    transform: (data, mode) => withSlug(data, "title", mode),
  }),
);

adminApiRouter.use(
  "/course-categories",
  createCrudRouter({
    model: CourseCategory,
    label: "nhóm khóa học",
      roles: ["admin", "editor"],
    searchFields: ["name", "slug"],
    filterFields: {},
    sortFields: ["order", "name"],
    createSchema: courseCategorySchema,
    updateSchema: courseCategorySchema.partial(),
    transform: (data, mode) => withSlug(data, "name", mode),
  }),
);

adminApiRouter.use(
  "/posts",
  createCrudRouter({
    model: Post,
    label: "bài viết",
      roles: ["admin", "editor"],
    searchFields: ["title", "excerpt", "slug", "tags"],
    filterFields: { status: "string", categorySlug: "string", featured: "boolean" },
    sortFields: ["publishedAt", "createdAt", "title"],
    createSchema: postSchema,
    updateSchema: postSchema.partial(),
    transform: (data, mode) => withSlug(data, "title", mode),
  }),
);

adminApiRouter.use(
  "/post-categories",
  createCrudRouter({
    model: PostCategory,
    label: "chuyên mục",
      roles: ["admin", "editor"],
    searchFields: ["name", "slug"],
    filterFields: {},
    sortFields: ["order", "name"],
    createSchema: postCategorySchema,
    updateSchema: postCategorySchema.partial(),
    transform: (data, mode) => withSlug(data, "name", mode),
  }),
);

adminApiRouter.use(
  "/pages",
  createCrudRouter({
    model: Page,
    label: "trang nội dung",
      roles: ["admin", "editor"],
    searchFields: ["title", "slug", "description"],
    filterFields: { status: "string" },
    sortFields: ["updatedAt", "title", "slug"],
    createSchema: pageSchemaInput,
    updateSchema: pageSchemaInput.partial(),
    transform: (data, mode) => withSlug(data, "title", mode),
  }),
);

adminApiRouter.use(
  "/sections",
  createCrudRouter({
    model: Section,
    label: "khối nội dung",
      roles: ["admin", "editor"],
    searchFields: ["key", "name", "type"],
    filterFields: { type: "string", visible: "boolean" },
    sortFields: ["order", "key", "updatedAt"],
    createSchema: sectionSchemaInput,
    updateSchema: sectionSchemaInput.partial(),
  }),
);

adminApiRouter.use(
  "/services",
  createCrudRouter({
    model: ServicePackage,
    label: "gói dịch vụ",
      roles: ["admin", "editor"],
    searchFields: ["name", "slug", "description"],
    filterFields: { status: "string", isFeatured: "boolean" },
    sortFields: ["order", "price", "name"],
    createSchema: serviceSchema,
    updateSchema: serviceSchema.partial(),
    transform: (data, mode) => withSlug(data, "name", mode),
  }),
);

adminApiRouter.use(
  "/quiz-sets",
  createCrudRouter({
    model: QuizSet,
    label: "bộ câu hỏi",
      roles: ["admin", "editor"],
    searchFields: ["title", "key"],
    filterFields: { key: "string", active: "boolean" },
    sortFields: ["updatedAt", "key", "version"],
    createSchema: quizSetSchema,
    updateSchema: quizSetSchema.partial(),
  }),
);

adminApiRouter.use(
  "/quiz-items",
  createCrudRouter({
    model: QuizItem,
    label: "câu hỏi",
      roles: ["admin", "editor"],
    searchFields: ["itemId", "text"],
    filterFields: { setId: "objectId" },
    sortFields: ["order", "createdAt"],
    createSchema: quizItemSchema,
    updateSchema: quizItemSchema.partial(),
  }),
);

adminApiRouter.use(
  "/quiz-results",
  createCrudRouter({
    model: QuizResult,
    label: "kết quả trắc nghiệm",
      roles: ["admin", "editor"],
    searchFields: ["code", "title", "summary"],
    filterFields: { key: "string" },
    sortFields: ["code", "updatedAt"],
    createSchema: quizResultSchemaInput,
    updateSchema: quizResultSchemaInput.partial(),
  }),
);

adminApiRouter.use(
  "/notifications",
  createCrudRouter({
    model: NotificationLog,
    label: "log thông báo",
    searchFields: ["target", "subject", "error"],
    filterFields: { channel: "string", status: "string" },
    sortFields: ["createdAt", "status", "channel"],
  }),
);

adminApiRouter.get(
  "/overview/health",
  requireAdmin("admin"),
  asyncHandler(async (_req, res) => {
    const [leads, orders, media] = await Promise.all([Lead.countDocuments({}), Order.countDocuments({}), MediaAsset.countDocuments({})]);
    res.json({ ok: true, counts: { leads, orders, media } });
  }),
);
