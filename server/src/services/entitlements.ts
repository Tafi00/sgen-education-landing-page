import { Entitlement, ServicePackage, type OrderDoc } from "../models/index.js";
import { AppError } from "../middleware/errors.js";

export async function grantEntitlementForOrder(order: OrderDoc & { _id: unknown }, grantedBy?: string) {
  if (!order.memberId) {
    throw new AppError(422, "Đơn hàng chưa gắn tài khoản thành viên nên không thể cấp quyền tự động.", "missing_member");
  }
  const service = await ServicePackage.findOne({ slug: order.serviceSlug }).lean();
  if (!service?.entitlementType) {
    throw new AppError(422, "Gói dịch vụ này không kèm quyền truy cập nội dung trả phí.", "no_entitlement");
  }
  const existing = await Entitlement.findOne({ memberId: order.memberId, orderId: order._id, active: true });
  if (existing) return existing;
  const days = Number(service.entitlementDays ?? 0);
  return Entitlement.create({
    memberId: order.memberId,
    type: service.entitlementType,
    orderId: order._id,
    expiresAt: service.entitlementType === "lifetime" || days <= 0 ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    grantedBy: grantedBy ?? null,
    note: `Cấp tự động từ đơn ${order.code}`,
  });
}

export async function revokeOrderEntitlements(orderId: string) {
  const result = await Entitlement.updateMany({ orderId, active: true }, { $set: { active: false } });
  return result.modifiedCount ?? 0;
}
