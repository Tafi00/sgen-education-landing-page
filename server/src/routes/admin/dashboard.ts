import { Router } from "express";
import { AuditLog, Course, Lead, LookupReport, MediaAsset, Member, Order, Post } from "../../models/index.js";
import { requireAdmin } from "../../middleware/auth.js";
import { asyncHandler } from "../../middleware/errors.js";
import { loadSettings, toAdminSettings } from "../../services/settings.js";
import { dbState } from "../../db.js";

export const adminDashboardRouter = Router();

adminDashboardRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const [leadsToday, leadsNew, ordersPending, reportsToday, members, courses, posts, media, recentLeads, recentOrders, settings] = await Promise.all([
      Lead.countDocuments({ createdAt: { $gte: startOfToday } }),
      Lead.countDocuments({ status: "new" }),
      Order.countDocuments({ status: "pending" }),
      LookupReport.countDocuments({ createdAt: { $gte: startOfToday } }),
      Member.countDocuments({}),
      Course.countDocuments({}),
      Post.countDocuments({}),
      MediaAsset.countDocuments({}),
      Lead.find().sort({ createdAt: -1 }).limit(6).lean(),
      Order.find().sort({ createdAt: -1 }).limit(6).lean(),
      loadSettings(),
    ]);
    const failedNotifications = await Lead.countDocuments({ "notification.lastError": { $ne: "" } });
    res.json({
      stats: { leadsToday, leadsNew, ordersPending, reportsToday, members, courses, posts, media, failedNotifications },
      leads: recentLeads,
      orders: recentOrders,
      db: dbState.status,
      notification: {
        emailEnabled: Boolean(settings.notification?.emailEnabled),
        telegramEnabled: Boolean(settings.notification?.telegramEnabled),
      },
      settings: toAdminSettings(settings),
    });
  }),
);

adminDashboardRouter.get(
  "/audit",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page ?? 1) || 1);
    const pageSize = Math.min(100, Math.max(10, Number(req.query.pageSize ?? 30) || 30));
    const filter: Record<string, unknown> = {};
    if (req.query.documentId) filter.documentId = String(req.query.documentId);
    if (req.query.collectionName) filter.collectionName = String(req.query.collectionName);
    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize).lean(),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  }),
);
