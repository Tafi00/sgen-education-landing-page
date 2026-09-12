/**
 * Kiểu dữ liệu cho nội dung mặc định của SGEN Education.
 *
 * Bộ dữ liệu này phục vụ hai việc:
 * 1. Là nguồn seed cho PostgreSQL (`npm run seed`) — nội dung hardcode cũ chuyển thành dữ liệu CMS.
 * 2. Là bản fallback khi API không sẵn sàng, để trang công khai không bao giờ trắng nội dung.
 */

export type ContentBlock = {
  type: PageBlockType;
  props: Record<string, unknown>;
  order: number;
};

export type PageBlockType =
  | "hero"
  | "richText"
  | "stats"
  | "cards"
  | "timeline"
  | "faq"
  | "cta"
  | "contactInfo"
  | "map"
  | "courses"
  | "posts"
  | "services"
  | "values";

export type DefaultCourse = {
  slug: string;
  title: string;
  coverImage: string;
  categorySlug: string;
  level: string;
  durationLabel: string;
  sessionCount: number;
  mode: string;
  price: number;
  priceNote: string;
  teacher: string;
  summary: string;
  /** Khối nội dung tự do soạn trong CMS (đề cương chi tiết, hình ảnh, cam kết…). */
  content?: ContentBlock[];
  syllabus: { title: string; details: string }[];
  outcomes: string[];
  forWhom: string[];
  faqs: { question: string; answer: string }[];
  order: number;
};

export type DefaultPost = {
  slug: string;
  title: string;
  cover: string;
  categorySlug: string;
  tags: string[];
  excerpt: string;
  content: { heading?: string; paragraphs: string[]; bullets?: string[] }[];
  /** Tác giả hiển thị; dữ liệu seed để trống sẽ dùng mặc định của CMS. */
  author?: string;
  readMinutes: number;
  publishedAt: string;
  featured: boolean;
};

export type DefaultPage = {
  slug: string;
  title: string;
  eyebrow: string;
  accent: string;
  description: string;
  blocks: ContentBlock[];
};

export type DefaultService = {
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAtPrice: number;
  priceNote: string;
  durationLabel: string;
  description: string;
  deliverables: string[];
  audience: string[];
  coverImage: string;
  entitlementType: "" | "vip-numerology" | "lifetime";
  entitlementDays: number;
  ctaLabel: string;
  isFeatured: boolean;
  order: number;
};

export type DefaultSection = {
  key: string;
  name: string;
  type: string;
  data: Record<string, unknown>;
  order: number;
  visible: boolean;
};

export const COURSE_CATEGORY_NAMES: Record<string, string> = {
  "than-so-hoc": "Thần số học & khám phá bản thân",
  "ky-thuat-luan-so": "Kỹ thuật luận số & Kinh Dịch",
  "phong-thuy-ung-dung": "Phong thủy ứng dụng",
};

export const POST_CATEGORY_NAMES: Record<string, string> = {
  "kien-thuc": "Kiến thức Thần số học",
  "ung-dung": "Ứng dụng thực tiễn",
  "moi-quan-he": "Mối quan hệ",
  "phong-thuy": "Phong thủy",
};
