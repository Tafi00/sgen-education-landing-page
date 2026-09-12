import { Router } from "express";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { Course, CourseCategory, Page, Post, PostCategory, Section, ServicePackage } from "../../models/index.js";
import { loadSettings, toPublicSettings } from "../../services/settings.js";

export const publicContentRouter = Router();

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

publicContentRouter.get(
  "/settings",
  asyncHandler(async (_req, res) => {
    const settings = await loadSettings();
    res.json({ settings: toPublicSettings(settings) });
  }),
);

/** Gói dữ liệu khởi động cho SPA: settings + menu + danh mục + gói dịch vụ. */
publicContentRouter.get(
  "/bootstrap",
  asyncHandler(async (_req, res) => {
    const [settings, sections, courseCategories, postCategories, services] = await Promise.all([
      loadSettings(),
      Section.find({ visible: true }).sort({ order: 1 }).lean(),
      CourseCategory.find().sort({ order: 1 }).lean(),
      PostCategory.find().sort({ order: 1 }).lean(),
      ServicePackage.find({ status: "published" }).sort({ order: 1 }).lean(),
    ]);
    res.json({
      settings: toPublicSettings(settings),
      sections,
      courseCategories,
      postCategories,
      services,
    });
  }),
);

publicContentRouter.get(
  "/pages/*",
  asyncHandler(async (req, res) => {
    const slug = String(req.params[0] ?? "");
    const page = await Page.findOne({ slug, status: "published" }).lean();
    if (!page) throw new AppError(404, "Không tìm thấy trang.", "not_found");
    res.json({ page });
  }),
);

publicContentRouter.get(
  "/sections",
  asyncHandler(async (req, res) => {
    const keys = String(req.query.keys ?? "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean);
    const filter = keys.length ? { key: { $in: keys }, visible: true } : { visible: true };
    const sections = await Section.find(filter).sort({ order: 1 }).lean();
    res.json({ sections });
  }),
);

publicContentRouter.get(
  "/courses",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const pageSize = Math.min(48, Math.max(4, Number(req.query.pageSize ?? 24) || 24));
    const filter: Record<string, unknown> = { status: "published" };
    if (req.query.category) filter.categorySlug = String(req.query.category);
    if (req.query.level) filter.level = String(req.query.level);
    if (req.query.q) filter.title = { $regex: escapeRegex(String(req.query.q)), $options: "i" };
    const sortField = ["order", "price", "title", "createdAt"].includes(String(req.query.sort)) ? String(req.query.sort) : "order";
    const direction = String(req.query.dir ?? "asc") === "desc" ? -1 : 1;
    const [items, total] = await Promise.all([
      Course.find(filter).sort({ [sortField]: direction }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      Course.countDocuments(filter),
    ]);
    res.json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }),
);

publicContentRouter.get(
  "/courses/:slug",
  asyncHandler(async (req, res) => {
    const course = await Course.findOne({ slug: req.params.slug, status: "published" }).lean();
    if (!course) throw new AppError(404, "Không tìm thấy khóa học.", "not_found");
    res.json({ course });
  }),
);

publicContentRouter.get(
  "/posts",
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const pageSize = Math.min(48, Math.max(4, Number(req.query.pageSize ?? 12) || 12));
    const filter: Record<string, unknown> = { status: "published", publishedAt: { $lte: new Date() } };
    if (req.query.category) filter.categorySlug = String(req.query.category);
    if (req.query.q) filter.title = { $regex: escapeRegex(String(req.query.q)), $options: "i" };
    const [items, total] = await Promise.all([
      Post.find(filter).sort({ publishedAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      Post.countDocuments(filter),
    ]);
    res.json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }),
);

publicContentRouter.get(
  "/posts/:slug",
  asyncHandler(async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug, status: "published" }).lean();
    if (!post) throw new AppError(404, "Không tìm thấy bài viết.", "not_found");
    const related = await Post.find({ status: "published", slug: { $ne: post.slug }, categorySlug: post.categorySlug })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();
    res.json({ post, related });
  }),
);

publicContentRouter.get(
  "/categories",
  asyncHandler(async (_req, res) => {
    const [courseCategories, postCategories] = await Promise.all([
      CourseCategory.find().sort({ order: 1 }).lean(),
      PostCategory.find().sort({ order: 1 }).lean(),
    ]);
    res.json({ courseCategories, postCategories });
  }),
);

publicContentRouter.get(
  "/services",
  asyncHandler(async (_req, res) => {
    const services = await ServicePackage.find({ status: "published" }).sort({ order: 1 }).lean();
    res.json({ items: services });
  }),
);

publicContentRouter.get(
  "/services/:slug",
  asyncHandler(async (req, res) => {
    const service = await ServicePackage.findOne({ slug: req.params.slug, status: "published" }).lean();
    if (!service) throw new AppError(404, "Không tìm thấy gói dịch vụ.", "not_found");
    res.json({ service });
  }),
);
