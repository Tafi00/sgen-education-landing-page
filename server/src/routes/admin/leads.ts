import { Router } from "express";
import { Lead } from "../../models/index.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { dispatchLeadNotifications, buildLeadSummary } from "../../services/notifications.js";
import { loadSettings } from "../../services/settings.js";

export const adminLeadRouter = Router();

adminLeadRouter.post(
  "/:id/notify",
  asyncHandler(async (req, res) => {
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw new AppError(404, "Không tìm thấy lead.", "not_found");
    const settings = await loadSettings();
    dispatchLeadNotifications(lead, settings);
    res.json({ ok: true, queued: true, preview: buildLeadSummary(lead) });
  }),
);

adminLeadRouter.get(
  "/export/csv",
  asyncHandler(async (req, res) => {
    const status = String(req.query.status ?? "");
    const filter = status && status !== "all" ? { status } : {};
    const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(2000).lean();
    const header = ["Ngày", "Họ tên", "Điện thoại", "Email", "Ngày sinh", "Nguồn", "Trạng thái", "Nội dung"];
    const rows = leads.map((lead) => [
      new Date(lead.createdAt as unknown as string).toLocaleString("vi-VN"),
      lead.name,
      lead.phone ?? "",
      lead.email ?? "",
      lead.birthDate ?? "",
      lead.sourceLabel || lead.source || "",
      lead.status,
      (lead.message ?? "").replace(/\s+/g, " "),
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="sgen-leads-${Date.now()}.csv"`);
    res.send(`\uFEFF${csv}`);
  }),
);
