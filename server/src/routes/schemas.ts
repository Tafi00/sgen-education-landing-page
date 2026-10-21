import { z } from "zod";
import { normalizePhone, PHONE_INVALID_MESSAGE } from "../../../shared/phone.js";

export const statusEnum = z.enum(["draft", "published", "archived"]);

const seoSchema = z
  .object({
    title: z.string().max(200).optional(),
    description: z.string().max(400).optional(),
    ogImage: z.string().max(500).optional(),
  })
  .partial();

const blockSchema = z.object({
  _id: z.string().optional(),
  type: z.string().min(1).max(60),
  props: z.record(z.unknown()).default({}),
  order: z.number().default(0),
});

export const courseCategorySchema = z.object({
  slug: z.string().min(1).max(120).optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(600).optional(),
  order: z.number().optional(),
});

export const courseSchema = z.object({
  slug: z.string().min(1).max(140).optional(),
  title: z.string().min(2).max(240),
  coverImage: z.string().max(500).optional(),
  categorySlug: z.string().max(140).optional(),
  level: z.string().max(80).optional(),
  durationLabel: z.string().max(80).optional(),
  sessionCount: z.number().min(0).max(200).optional(),
  mode: z.string().max(200).optional(),
  price: z.number().min(0).max(2_000_000_000).optional(),
  priceNote: z.string().max(200).optional(),
  teacher: z.string().max(160).optional(),
  summary: z.string().max(1200).optional(),
  content: z.array(blockSchema).optional(),
  syllabus: z.array(z.object({ title: z.string().max(300), details: z.string().max(1000).optional() })).optional(),
  outcomes: z.array(z.string().max(400)).optional(),
  forWhom: z.array(z.string().max(400)).optional(),
  faqs: z.array(z.object({ question: z.string().max(400), answer: z.string().max(2000) })).optional(),
  order: z.number().optional(),
  status: statusEnum.optional(),
  seo: seoSchema.optional(),
});

export const postCategorySchema = z.object({
  slug: z.string().min(1).max(120).optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(600).optional(),
  order: z.number().optional(),
});

export const postSchema = z.object({
  slug: z.string().min(1).max(160).optional(),
  title: z.string().min(2).max(240),
  cover: z.string().max(500).optional(),
  categorySlug: z.string().max(140).optional(),
  tags: z.array(z.string().max(80)).optional(),
  excerpt: z.string().max(600).optional(),
  content: z.array(blockSchema).optional(),
  author: z.string().max(160).optional(),
  readMinutes: z.number().min(1).max(120).optional(),
  publishedAt: z.coerce.date().optional(),
  status: statusEnum.optional(),
  featured: z.boolean().optional(),
  seo: seoSchema.optional(),
});

export const pageSchemaInput = z.object({
  slug: z.string().min(1).max(140).optional(),
  title: z.string().min(2).max(240),
  eyebrow: z.string().max(200).optional(),
  accent: z.string().max(200).optional(),
  description: z.string().max(800).optional(),
  blocks: z.array(blockSchema).optional(),
  status: statusEnum.optional(),
  seo: seoSchema.optional(),
});

export const sectionSchemaInput = z.object({
  key: z.string().min(1).max(80),
  name: z.string().min(1).max(200),
  type: z.string().min(1).max(80),
  data: z.record(z.unknown()).optional(),
  order: z.number().optional(),
  visible: z.boolean().optional(),
});

export const serviceSchema = z.object({
  slug: z.string().min(1).max(140).optional(),
  name: z.string().min(2).max(240),
  tagline: z.string().max(300).optional(),
  price: z.number().min(0).max(2_000_000_000).optional(),
  compareAtPrice: z.number().min(0).max(2_000_000_000).optional(),
  priceNote: z.string().max(200).optional(),
  durationLabel: z.string().max(120).optional(),
  description: z.string().max(2000).optional(),
  deliverables: z.array(z.string().max(400)).optional(),
  audience: z.array(z.string().max(400)).optional(),
  coverImage: z.string().max(500).optional(),
  entitlementType: z.enum(["", "vip-numerology", "lifetime"]).optional(),
  entitlementDays: z.number().min(0).max(3650).optional(),
  ctaLabel: z.string().max(80).optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().optional(),
  status: statusEnum.optional(),
  seo: seoSchema.optional(),
});

export const memberSchemaInput = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  birthDate: z.string().max(20).optional(),
  status: z.enum(["active", "locked"]).optional(),
});

export const userSchemaInput = z.object({
  name: z.string().min(2).max(160),
  email: z.string().email().max(200),
  role: z.enum(["admin", "editor"]),
  status: z.enum(["active", "locked"]).optional(),
  password: z.string().min(8).max(200).optional(),
});

export const leadUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "won", "lost"]).optional(),
  note: z.string().max(4000).optional(),
  assignedTo: z.string().nullable().optional(),
});

export const orderUpdateSchema = z.object({
  status: z.enum(["pending", "paid", "cancelled", "expired"]).optional(),
  adminNote: z.string().max(2000).optional(),
  customerName: z.string().max(160).optional(),
  customerPhone: z.string().max(40).optional(),
  customerEmail: z.string().max(200).optional(),
});

export const mediaMetaSchema = z.object({
  alt: z.string().max(300).optional(),
  folder: z.string().max(60).optional(),
});

export const quizSetSchema = z.object({
  key: z.enum(["disc", "mbti"]),
  version: z.number().min(1).max(99).optional(),
  title: z.string().min(2).max(240),
  instructions: z.string().max(2000).optional(),
  scale: z.enum(["disc-most-least", "mbti-two-choice"]),
  active: z.boolean().optional(),
});

export const quizItemSchema = z.object({
  setId: z.string().min(1),
  itemId: z.string().min(1).max(60),
  order: z.number().optional(),
  text: z.string().min(2).max(600),
  options: z
    .array(
      z.object({
        optionId: z.string().min(1).max(60),
        label: z.string().min(1).max(300),
        dimension: z.string().max(10).optional(),
        pole: z.string().max(4).optional(),
      }),
    )
    .min(2)
    .max(6),
});

export const quizResultSchemaInput = z.object({
  key: z.enum(["disc", "mbti"]),
  code: z.string().min(1).max(8),
  title: z.string().min(2).max(240),
  summary: z.string().max(2000).optional(),
  strengths: z.array(z.string().max(400)).optional(),
  cautions: z.array(z.string().max(400)).optional(),
  careers: z.array(z.string().max(400)).optional(),
  growth: z.array(z.string().max(400)).optional(),
  relationships: z.array(z.string().max(400)).optional(),
  teaming: z.array(z.string().max(400)).optional(),
});

export const notificationSettingsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  resendFrom: z.string().max(300).optional(),
  resendTo: z.string().max(300).optional(),
  telegramEnabled: z.boolean().optional(),
  telegramChatId: z.string().max(120).optional(),
  notifyOnLead: z.boolean().optional(),
  notifyOnOrder: z.boolean().optional(),
  /** Giá trị mới ở dạng plain; bỏ trống nghĩa là giữ nguyên secret hiện có. */
  resendApiKey: z.string().max(300).optional(),
  telegramBotToken: z.string().max(300).optional(),
  clearResendApiKey: z.boolean().optional(),
  clearTelegramBotToken: z.boolean().optional(),
});

export const contactSettingsSchema = z.object({
  company: z.string().max(200).optional(),
  phone: z.string().max(40).optional(),
  phoneAlt: z.string().max(40).optional(),
  email: z.string().max(200).optional(),
  address: z.string().max(400).optional(),
  officeAddress: z.string().max(400).optional(),
  workingHours: z.string().max(200).optional(),
  mapEmbed: z.string().max(4000).optional(),
});

export const brandSettingsSchema = z.object({
  name: z.string().max(200).optional(),
  tagline: z.string().max(300).optional(),
  logoDark: z.string().max(500).optional(),
  logoLight: z.string().max(500).optional(),
  hotline: z.string().max(40).optional(),
});

export const seoSettingsSchema = z.object({
  defaultTitle: z.string().max(200).optional(),
  defaultDescription: z.string().max(400).optional(),
  ogImage: z.string().max(500).optional(),
  keywords: z.array(z.string().max(80)).optional(),
});

export const paymentSettingsSchema = z.object({
  bankName: z.string().max(200).optional(),
  bankBin: z.string().max(40).optional(),
  accountNumber: z.string().max(60).optional(),
  accountName: z.string().max(200).optional(),
  transferNote: z.string().max(400).optional(),
});

export const featureFlagSchema = z.object({
  memberLogin: z.boolean().optional(),
  vipPurchase: z.boolean().optional(),
  simTool: z.boolean().optional(),
  quizTools: z.boolean().optional(),
});

export const legalSettingsSchema = z.object({
  disclaimer: z.string().max(2000).optional(),
  refundPolicy: z.string().max(4000).optional(),
});

export const settingsUpdateSchema = z.object({
  brand: brandSettingsSchema.optional(),
  contact: contactSettingsSchema.optional(),
  socials: z.record(z.string().max(500)).optional(),
  seo: seoSettingsSchema.optional(),
  notification: notificationSettingsSchema.optional(),
  payment: paymentSettingsSchema.optional(),
  featureFlags: featureFlagSchema.optional(),
  legal: legalSettingsSchema.optional(),
});

/* --------------------------- công khai --------------------------- */

export const leadCreateSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên.").max(160),
  phone: z
    .string()
    .max(40)
    .optional()
    .transform((value) => value?.trim() ?? ""),
  email: z.string().max(200).optional().transform((value) => value?.trim() ?? ""),
  birthDate: z.string().max(20).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(120).optional(),
  sourceLabel: z.string().max(200).optional(),
  payload: z.record(z.unknown()).optional(),
  /** Bẫy chống bot: trường ẩn phải để trống. */
  company: z.string().max(200).optional(),
  consent: z.boolean().optional(),
});

export const memberRegisterSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên.").max(160),
  email: z.string().email("Email chưa hợp lệ.").max(200),
  phone: z.string().max(40).optional(),
  birthDate: z.string().max(20).optional(),
  password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự.").max(200),
  consent: z.literal(true, { errorMap: () => ({ message: "Vui lòng đồng ý điều khoản xử lý dữ liệu." }) }),
});

export const memberLoginSchema = z.object({
  email: z.string().email("Email chưa hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export const orderCreateSchema = z.object({
  serviceSlug: z.string().min(1),
  customerName: z.string().min(2).max(160),
  customerPhone: z.string().min(8).max(40),
  customerEmail: z.string().max(200).optional(),
});

export const lookupRequestSchema = z.object({
  type: z.enum(["numerology", "disc", "mbti", "sim", "batu", "iching", "xem-ngay"]),
  inputs: z.record(z.unknown()),
  save: z.boolean().optional(),
  leadId: z.string().max(40).optional(),
  source: z.string().max(120).optional(),
});

export const quizScoreSchema = z.object({
  answers: z.record(z.string().max(80)),
  save: z.boolean().optional(),
});

export const numerologyLookupSchema = z.object({
  name: z.string().min(2, "Vui lòng nhập họ tên.").max(160),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh cần theo định dạng YYYY-MM-DD."),
  commonName: z.string().max(160).optional(),
  referenceYear: z.number().min(1900).max(2200).optional(),
});

/**
 * Số điện thoại khách hàng: chuẩn hoá và kiểm tra bằng đúng bộ luật dùng ở giao diện (`shared/phone.ts`),
 * kết quả là CHUỖI đã chuẩn hoá. Bắt buộc khi xuất ebook; ở bước tra cứu số điện thoại là tuỳ chọn (rỗng = bỏ qua).
 */
const normalizedPhone = (allowEmpty: boolean) =>
  z
    .string()
    .max(40, PHONE_INVALID_MESSAGE)
    .transform((raw, ctx): string => {
      if (allowEmpty && raw.trim() === "") return "";
      const result = normalizePhone(raw);
      if (!result.ok) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.message });
        return z.NEVER;
      }
      return result.value;
    });

/** Bước tra cứu: họ tên + ngày sinh (+ số điện thoại tuỳ chọn). Số điện thoại KHÔNG phải đầu vào tính chỉ số. */
export const numerologyLookupWithPhoneSchema = numerologyLookupSchema.extend({ phone: normalizedPhone(true).optional() });

/** Xuất ebook: bắt buộc số điện thoại khách hàng và loại ebook. */
export const ebookExportSchema = numerologyLookupSchema.omit({ commonName: true }).extend({
  phone: normalizedPhone(false),
  edition: z.enum(["demo", "full"], { errorMap: () => ({ message: "Vui lòng chọn loại ebook." }) }),
  reportId: z.string().uuid().optional(),
});

export const simLookupSchema = z.object({
  phone: z.string().min(9, "Số điện thoại cần ít nhất 9 chữ số.").max(20),
  birthDate: z.string().max(20).optional(),
  birthTime: z.string().max(10).optional(),
  gender: z.enum(["Nam", "Nữ"]).optional(),
});
