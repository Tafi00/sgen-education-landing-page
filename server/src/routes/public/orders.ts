import { Router } from "express";
import { Order, ServicePackage } from "../../models/index.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { currentMember } from "../../middleware/auth.js";
import { publicFormLimiter } from "../../middleware/rateLimit.js";
import { generateOrderCode, randomToken } from "../../services/crypto.js";
import { imageUpload, storeUploadedImage } from "../../services/media.js";
import { loadSettings } from "../../services/settings.js";
import { orderCreateSchema } from "../schemas.js";

export const publicOrderRouter = Router();

type PaymentInfo = {
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  transferNote: string;
  qrUrl: string;
};

async function paymentInfoFor(order: { amount: number; code: string }): Promise<PaymentInfo> {
  const settings = await loadSettings();
  const payment = settings.payment;
  const bankBin = payment.bankBin;
  const accountNumber = payment.accountNumber;
  const query = new URLSearchParams({
    amount: String(order.amount),
    addInfo: order.code,
    accountName: payment.accountName,
  });
  return {
    bankName: payment.bankName,
    bankBin,
    accountNumber,
    accountName: payment.accountName,
    transferNote: payment.transferNote,
    qrUrl: bankBin && accountNumber ? `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png?${query.toString()}` : "",
  };
}

function assertOrderAccess(
  order: { viewToken?: string | null; memberId?: unknown },
  memberId: string | null,
  token: string,
) {
  const ownerMatch = memberId && order.memberId && String(order.memberId) === memberId;
  const tokenMatch = order.viewToken && token && order.viewToken === token;
  if (!ownerMatch && !tokenMatch) {
    throw new AppError(403, "Bạn không có quyền xem đơn hàng này.", "forbidden");
  }
}

publicOrderRouter.post(
  "/",
  publicFormLimiter,
  asyncHandler(async (req, res) => {
    const settings = await loadSettings();
    if (!settings.featureFlags?.vipPurchase) {
      throw new AppError(503, "Tính năng đặt mua đang tạm đóng. Vui lòng liên hệ SGEN để được hỗ trợ.", "feature_disabled");
    }
    const parsed = orderCreateSchema.parse(req.body);
    const service = await ServicePackage.findOne({ slug: parsed.serviceSlug, status: "published" }).lean();
    if (!service) throw new AppError(404, "Không tìm thấy gói dịch vụ.", "not_found");
    const member = currentMember(req);
    const order = await Order.create({
      code: generateOrderCode(),
      viewToken: randomToken(12),
      memberId: member?.id ?? null,
      customerName: parsed.customerName,
      customerPhone: parsed.customerPhone,
      customerEmail: parsed.customerEmail ?? member?.email ?? "",
      serviceSlug: service.slug,
      serviceName: service.name,
      amount: service.price,
      method: "vietqr",
    });
    res.status(201).json({
      order: { code: order.code, status: order.status, amount: order.amount, serviceName: order.serviceName, viewToken: order.viewToken },
      payment: await paymentInfoFor({ amount: order.amount, code: order.code }),
    });
  }),
);

publicOrderRouter.get(
  "/:code",
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ code: req.params.code }).lean();
    if (!order) throw new AppError(404, "Không tìm thấy đơn hàng.", "not_found");
    const member = currentMember(req);
    assertOrderAccess(order, member?.id ?? null, String(req.query.token ?? ""));
    res.json({
      order: {
        code: order.code,
        status: order.status,
        amount: order.amount,
        serviceName: order.serviceName,
        serviceSlug: order.serviceSlug,
        proofImage: order.proofImage,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
        adminNote: order.adminNote,
      },
      payment: order.status === "pending" ? await paymentInfoFor(order) : null,
    });
  }),
);

publicOrderRouter.post(
  "/:code/proof",
  publicFormLimiter,
  imageUpload.single("proof"),
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ code: req.params.code });
    if (!order) throw new AppError(404, "Không tìm thấy đơn hàng.", "not_found");
    const member = currentMember(req);
    assertOrderAccess(order, member?.id ?? null, String(req.query.token ?? ""));
    if (order.status !== "pending") throw new AppError(409, "Đơn hàng không còn ở trạng thái chờ xác nhận.", "invalid_state");
    if (!req.file) throw new AppError(422, "Vui lòng chọn ảnh biên lai chuyển khoản.", "missing_file");
    const asset = await storeUploadedImage({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      folder: "payment-proofs",
      alt: `Biên lai đơn ${order.code}`,
    });
    order.proofImage = asset.url;
    await order.save();
    res.status(201).json({ ok: true, proofImage: asset.url });
  }),
);
