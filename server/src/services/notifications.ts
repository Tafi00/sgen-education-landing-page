import { env } from "../env.js";
import { Lead, NotificationLog, type LeadDoc } from "../models/index.js";
import type { SiteSettingShape } from "../models/settings.js";
import { readNotificationSecrets } from "./settings.js";

type Channel = "resend" | "telegram";
type ChannelStatus = "sent" | "failed" | "skipped";

type ChannelResult = { channel: Channel; status: ChannelStatus; target: string; error: string };

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

export function leadAdminLink(leadId: string) {
  return `${env.publicOrigin.replace(/\/$/, "")}/admin/leads/${leadId}`;
}

type LeadLike = {
  _id: unknown;
  name: string;
  phone?: string | null;
  email?: string | null;
  birthDate?: string | null;
  message?: string | null;
  source?: string | null;
  sourceLabel?: string | null;
  payload?: unknown;
};

export function buildLeadSummary(lead: LeadLike) {
  const payload = (lead.payload ?? {}) as Record<string, unknown>;
  const payloadLines = Object.entries(payload)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .slice(0, 8)
    .map(([key, value]) => `- ${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`);
  return [
    `Khách hàng: ${lead.name}`,
    lead.phone ? `Điện thoại: ${lead.phone}` : "",
    lead.email ? `Email: ${lead.email}` : "",
    lead.birthDate ? `Ngày sinh: ${lead.birthDate}` : "",
    `Nguồn: ${lead.sourceLabel || lead.source || "website"}`,
    lead.message ? `Nội dung: ${lead.message}` : "",
    payloadLines.length ? `Dữ liệu tra cứu:\n${payloadLines.join("\n")}` : "",
    `Chi tiết: ${leadAdminLink(String(lead._id))}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendViaResend(apiKey: string, from: string, to: string, subject: string, text: string): Promise<ChannelResult> {
  if (!apiKey || !to) return { channel: "resend", status: "skipped", target: to, error: "Chưa cấu hình API key hoặc email nhận." };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: from || "SGEN Education <onboarding@resend.dev>", to: [to], subject, html: `<pre style="font-family:inherit;white-space:pre-wrap">${escapeHtml(text)}</pre>` }),
    });
    if (!response.ok) {
      const detail = await response.text();
      return { channel: "resend", status: "failed", target: to, error: `HTTP ${response.status}: ${detail.slice(0, 300)}` };
    }
    return { channel: "resend", status: "sent", target: to, error: "" };
  } catch (error) {
    return { channel: "resend", status: "failed", target: to, error: error instanceof Error ? error.message : String(error) };
  }
}

async function sendViaTelegram(botToken: string, chatId: string, text: string): Promise<ChannelResult> {
  if (!botToken || !chatId) return { channel: "telegram", status: "skipped", target: chatId, error: "Chưa cấu hình bot token hoặc chat id." };
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    });
    if (!response.ok) {
      const detail = await response.text();
      return { channel: "telegram", status: "failed", target: chatId, error: `HTTP ${response.status}: ${detail.slice(0, 300)}` };
    }
    return { channel: "telegram", status: "sent", target: chatId, error: "" };
  } catch (error) {
    return { channel: "telegram", status: "failed", target: chatId, error: error instanceof Error ? error.message : String(error) };
  }
}

async function deliver(channel: Channel, settings: SiteSettingShape, subject: string, text: string): Promise<ChannelResult> {
  const secrets = readNotificationSecrets(settings);
  const notification = settings.notification;
  if (channel === "resend") {
    if (!notification.emailEnabled) return { channel, status: "skipped", target: "", error: "Kênh email đang tắt." };
    return sendViaResend(secrets.resendApiKey, notification.resendFrom, notification.resendTo, subject, text);
  }
  if (!notification.telegramEnabled) return { channel, status: "skipped", target: "", error: "Kênh Telegram đang tắt." };
  return sendViaTelegram(secrets.telegramBotToken, notification.telegramChatId, text);
}

async function deliverWithRetry(channel: Channel, settings: SiteSettingShape, subject: string, text: string) {
  let result = await deliver(channel, settings, subject, text);
  for (let attempt = 1; attempt < 3 && result.status === "failed"; attempt += 1) {
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, 1500 * attempt);
    await promise;
    result = await deliver(channel, settings, subject, text);
  }
  await NotificationLog.create({
    channel,
    target: result.target,
    subject,
    payload: { preview: text.slice(0, 500) },
    status: result.status,
    error: result.error,
  });
  return result;
}

/**
 * Gửi thông báo lead ở chế độ nền: lead đã được lưu trước đó và lỗi thông báo
 * không bao giờ làm hỏng request của khách.
 */
export function dispatchLeadNotifications(lead: LeadDoc & { _id: unknown }, settings: SiteSettingShape) {
  const notification = settings.notification;
  if (!notification.notifyOnLead) return;
  const text = buildLeadSummary(lead as LeadLike);
  const subject = `[SGEN] Lead mới: ${lead.name}${lead.phone ? ` — ${lead.phone}` : ""}`;
  void (async () => {
    const results: ChannelResult[] = [];
    if (notification.emailEnabled) results.push(await deliverWithRetry("resend", settings, subject, text));
    if (notification.telegramEnabled) results.push(await deliverWithRetry("telegram", settings, subject, text));
    if (!results.length) return;
    const failed = results.filter((item) => item.status === "failed");
    await Lead.updateOne(
      { _id: lead._id },
      {
        $set: {
          "notification.resend": results.find((item) => item.channel === "resend")?.status ?? "skipped",
          "notification.telegram": results.find((item) => item.channel === "telegram")?.status ?? "skipped",
          "notification.attempts": results.length,
          "notification.lastError": failed.map((item) => `${item.channel}: ${item.error}`).join(" | ").slice(0, 500),
          "notification.lastAttemptAt": new Date(),
        },
      },
    );
  })();
}

export async function sendTestNotification(settings: SiteSettingShape, channel: Channel | "both") {
  const text = [
    "Thông báo thử từ SGEN CMS.",
    `Thời điểm: ${new Date().toLocaleString("vi-VN")}`,
    `Trang quản trị: ${env.publicOrigin.replace(/\/$/, "")}/admin`,
  ].join("\n");
  const channels: Channel[] = channel === "both" ? ["resend", "telegram"] : [channel];
  const results: ChannelResult[] = [];
  for (const item of channels) {
    const result = await deliver(item, settings, "[SGEN] Thông báo thử", text);
    await NotificationLog.create({
      channel: item,
      target: result.target,
      subject: "[SGEN] Thông báo thử",
      payload: { preview: text },
      status: result.status,
      error: result.error,
    });
    results.push(result);
  }
  return results;
}
