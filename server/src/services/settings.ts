import { SETTINGS_DEFAULTS, SiteSetting, type SiteSettingDoc, type SiteSettingShape } from "../models/settings.js";
import { decryptSecret, maskSecret } from "./crypto.js";

/**
 * Trộn giá trị mặc định vào tài liệu settings: PostgreSQL lưu từng nhóm dưới dạng jsonb
 * nên bản ghi cũ có thể thiếu khoá mới thêm (thay cho default của Mongoose trước đây).
 */
function withDefaults(doc: SiteSettingDoc): SiteSettingDoc {
  for (const [group, defaults] of Object.entries(SETTINGS_DEFAULTS)) {
    const stored = (doc[group] ?? {}) as Record<string, unknown>;
    (doc as unknown as Record<string, unknown>)[group] = { ...(defaults as Record<string, unknown>), ...stored };
  }
  return doc;
}

export async function loadSettings() {
  const existing = await SiteSetting.findOne({ singleton: "site" });
  if (existing) return withDefaults(existing as SiteSettingDoc);
  return withDefaults((await SiteSetting.create({ singleton: "site" })) as SiteSettingDoc);
}

export type NotificationSecrets = {
  resendApiKey: string;
  telegramBotToken: string;
};

export function readNotificationSecrets(doc: SiteSettingShape): NotificationSecrets {
  const notification = doc.notification;
  return {
    resendApiKey: decryptSecret(String(notification.resendApiKeyEnc ?? "")),
    telegramBotToken: decryptSecret(String(notification.telegramBotTokenEnc ?? "")),
  };
}

/** Payload cho admin: secret luôn ở dạng mask, kèm cờ cho biết đã cấu hình hay chưa. */
export function toAdminSettings(doc: SiteSettingDoc) {
  const plain = doc.toObject();
  const notification = { ...(plain.notification as Record<string, unknown>) };
  const secrets = readNotificationSecrets(doc);
  const resendEnc = String(notification.resendApiKeyEnc ?? "");
  const telegramEnc = String(notification.telegramBotTokenEnc ?? "");
  delete notification.resendApiKeyEnc;
  delete notification.telegramBotTokenEnc;
  return {
    ...plain,
    notification: {
      ...notification,
      resendApiKeyMasked: maskSecret(secrets.resendApiKey),
      telegramBotTokenMasked: maskSecret(secrets.telegramBotToken),
      hasResendApiKey: resendEnc.length > 0,
      hasTelegramBotToken: telegramEnc.length > 0,
    },
  };
}

/** Site settings công khai: không chứa secret, không chứa cấu hình ngân hàng. */
export function toPublicSettings(doc: SiteSettingShape) {
  return {
    brand: doc.brand,
    contact: doc.contact,
    socials: doc.socials,
    seo: doc.seo,
    featureFlags: doc.featureFlags,
    legal: { disclaimer: doc.legal?.disclaimer ?? "", refundPolicy: doc.legal?.refundPolicy ?? "" },
  };
}
