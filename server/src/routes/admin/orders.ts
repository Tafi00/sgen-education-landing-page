import { Router } from "express";
import { AuditLog, Order } from "../../models/index.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { requireAdmin } from "../../middleware/auth.js";
import { grantEntitlementForOrder, revokeOrderEntitlements } from "../../services/entitlements.js";

export const adminOrderRouter = Router();

adminOrderRouter.post(
  "/:id/approve",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError(404, "Không tìm thấy đơn hàng.", "not_found");
    if (order.status === "paid") throw new AppError(409, "Đơn hàng đã được xác nhận trước đó.", "invalid_state");
    order.status = "paid";
    order.paidAt = new Date();
    await order.save();
    let entitlementId = "";
    try {
      const entitlement = await grantEntitlementForOrder(order, req.session.adminId);
      entitlementId = String(entitlement._id);
      order.entitlementGrantedAt = new Date();
      await order.save();
    } catch (error) {
      entitlementId = "";
      order.adminNote = [order.adminNote, error instanceof Error ? error.message : String(error)].filter(Boolean).join(" | ");
      await order.save();
    }
    await AuditLog.create({
      actorId: req.session.adminId,
      actorEmail: req.session.adminEmail ?? "",
      action: "order.approve",
      collectionName: "orders",
      documentId: String(order._id),
      diff: { code: order.code, entitlementId },
    });
    res.json({ item: order.toObject(), entitlementId });
  }),
);

adminOrderRouter.post(
  "/:id/cancel",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError(404, "Không tìm thấy đơn hàng.", "not_found");
    order.status = "cancelled";
    if (req.body?.note) order.adminNote = String(req.body.note).slice(0, 2000);
    await order.save();
    const revoked = await revokeOrderEntitlements(String(order._id));
    res.json({ item: order.toObject(), revoked });
  }),
);

adminOrderRouter.post(
  "/:id/grant",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError(404, "Không tìm thấy đơn hàng.", "not_found");
    const entitlement = await grantEntitlementForOrder(order, req.session.adminId);
    res.json({ entitlement: entitlement.toObject() });
  }),
);

adminOrderRouter.post(
  "/:id/revoke",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const revoked = await revokeOrderEntitlements(req.params.id);
    res.json({ ok: true, revoked });
  }),
);
