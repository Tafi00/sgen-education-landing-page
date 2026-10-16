import { Model, type Doc } from "../db/model.js";

export const SiteSetting = new Model<SiteSettingDoc>({
  table: "site_settings",
  fields: {
    singleton: { kind: "text" },
    brand: { kind: "json" },
    contact: { kind: "json" },
    socials: { kind: "json" },
    seo: { kind: "json" },
    notification: { kind: "json" },
    payment: { kind: "json" },
    featureFlags: { kind: "json" },
    legal: { kind: "json" },
  },
});

export type SiteSettingShape = {
  brand: { name: string; tagline: string; logoDark: string; logoLight: string; hotline: string };
  contact: {
    company: string;
    phone: string;
    phoneAlt: string;
    email: string;
    address: string;
    officeAddress: string;
    workingHours: string;
    mapEmbed: string;
  };
  socials: { facebook: string; youtube: string; tiktok: string; zalo: string };
  seo: { defaultTitle: string; defaultDescription: string; ogImage: string; keywords: string[] };
  notification: {
    emailEnabled: boolean;
    resendApiKeyEnc: string;
    resendFrom: string;
    resendTo: string;
    telegramEnabled: boolean;
    telegramBotTokenEnc: string;
    telegramChatId: string;
    notifyOnLead: boolean;
    notifyOnOrder: boolean;
  };
  payment: { bankName: string; bankBin: string; accountNumber: string; accountName: string; transferNote: string };
  featureFlags: { memberLogin: boolean; vipPurchase: boolean; simTool: boolean; quizTools: boolean };
  legal: { disclaimer: string; refundPolicy: string };
};

/**
 * Giá trị mặc định của Site Settings. PostgreSQL lưu từng nhóm dưới dạng jsonb
 * nên mặc định phải được trộn ở tầng ứng dụng (thay cho default của Mongoose).
 */
export const SETTINGS_DEFAULTS: SiteSettingShape = {
  brand: {
    name: "SGEN Education",
    tagline: "Kiến thức chuẩn — Công nghệ mạnh — Tương lai vững chắc.",
    logoDark: "/assets/brand/sgen-logo-dark-v2.webp",
    logoLight: "/assets/brand/sgen-logo-light-footer-v2.webp",
    hotline: "0903.891.839",
  },
  contact: {
    company: "Công ty TNHH SGEN Education",
    phone: "0903891839",
    phoneAlt: "0982935131",
    email: "sgen.vn@gmail.com",
    address: "400/6 Mã Lò, Phường Bình Hưng Hòa, Thành Phố Hồ Chí Minh",
    officeAddress: "",
    workingHours: "08:00 – 20:00 (Thứ 2 – Chủ nhật)",
    mapEmbed: "",
  },
  socials: { facebook: "", youtube: "", tiktok: "", zalo: "" },
  seo: {
    defaultTitle: "SGEN Education — Thần số học ứng dụng",
    defaultDescription: "SGEN Education — Thần số học Pythagoras và định hướng phát triển toàn diện.",
    ogImage: "",
    keywords: [],
  },
  notification: {
    emailEnabled: false,
    resendApiKeyEnc: "",
    resendFrom: "SGEN Education <onboarding@resend.dev>",
    resendTo: "",
    telegramEnabled: false,
    telegramBotTokenEnc: "",
    telegramChatId: "",
    notifyOnLead: true,
    notifyOnOrder: true,
  },
  payment: { bankName: "", bankBin: "", accountNumber: "", accountName: "", transferNote: "Nội dung chuyển khoản ghi đúng mã đơn hàng." },
  featureFlags: { memberLogin: true, vipPurchase: true, simTool: true, quizTools: true },
  legal: {
    disclaimer:
      "Nội dung trên SGEN Education mang tính tham khảo theo hệ phương pháp giáo dục và huyền học ứng dụng, không thay thế tư vấn y tế, pháp lý hoặc tài chính.",
    refundPolicy: "",
  },
};

export type SiteSettingDoc = Doc & SiteSettingShape & { singleton: string; createdAt: Date; updatedAt: Date };
