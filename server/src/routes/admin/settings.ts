import { Router } from "express";
import { AuditLog } from "../../models/index.js";
import { asyncHandler, AppError } from "../../middleware/errors.js";
import { requireAdmin } from "../../middleware/auth.js";
import { encryptSecret } from "../../services/crypto.js";
import { loadSettings, toAdminSettings } from "../../services/settings.js";
import { sendTestNotification } from "../../services/notifications.js";
import { notificationSettingsSchema, settingsUpdateSchema } from "../schemas.js";

export const adminSettingsRouter = Router();

adminSettingsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const settings = await loadSettings();
    res.json({ settings: toAdminSettings(settings) });
  }),
);

/**
 * Cập nhật site settings. Secret chỉ bị ghi đè khi admin nhập giá trị mới;
 * bỏ trống thì giữ nguyên, dùng cờ clear* để xoá hẳn.
 */
adminSettingsRouter.patch(
  "/",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const parsed = settingsUpdateSchema.parse(req.body);
    const settings = await loadSettings();
    /** Ghi từng khoá một để không cần ép kiểu subdocument và bỏ qua giá trị undefined. */
    const applyGroup = (group: string, patch: Record<string, unknown> | undefined) => {
      if (!patch) return;
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined) continue;
        settings.set(`${group}.${key}`, value);
      }
    };
    applyGroup("brand", parsed.brand);
    applyGroup("contact", parsed.contact);
    applyGroup("socials", parsed.socials);
    applyGroup("seo", parsed.seo);
    applyGroup("payment", parsed.payment);
    applyGroup("featureFlags", parsed.featureFlags);
    applyGroup("legal", parsed.legal);
    if (parsed.notification) {
      const { resendApiKey, telegramBotToken, clearResendApiKey, clearTelegramBotToken, ...rest } = notificationSettingsSchema.parse(parsed.notification);
      applyGroup("notification", rest);
      if (clearResendApiKey) settings.set("notification.resendApiKeyEnc", "");
      else if (resendApiKey) settings.set("notification.resendApiKeyEnc", encryptSecret(resendApiKey));
      if (clearTelegramBotToken) settings.set("notification.telegramBotTokenEnc", "");
      else if (telegramBotToken) settings.set("notification.telegramBotTokenEnc", encryptSecret(telegramBotToken));
    }
    await settings.save();
    const admin = req.session.adminId;
    await AuditLog.create({
      actorId: admin,
      actorEmail: req.session.adminEmail ?? "",
      action: "settings.update",
      collectionName: "site_settings",
      diff: { keys: Object.keys(parsed) },
    });
    res.json({ settings: toAdminSettings(settings) });
  }),
);

adminSettingsRouter.post(
  "/notifications/test",
  requireAdmin("admin"),
  asyncHandler(async (req, res) => {
    const channel = ["resend", "telegram", "both"].includes(String(req.body?.channel)) ? (String(req.body.channel) as "resend" | "telegram" | "both") : "both";
    const settings = await loadSettings();
    const results = await sendTestNotification(settings, channel);
    res.json({ results });
  }),
);

adminSettingsRouter.get(
  "/health",
  asyncHandler(async (_req, res) => {
    const settings = await loadSettings();
    if (!settings) throw new AppError(503, "Chưa đọc được cấu hình.", "settings_unavailable");
    res.json({ ok: true });
  }),
);
