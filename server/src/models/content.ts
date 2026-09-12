import { Model, type Doc } from "../db/model.js";

/** Trường SEO dùng chung cho page/course/post/service (lưu trong cột jsonb `seo`). */
export type SeoFields = { title?: string; description?: string; ogImage?: string };

export const CONTENT_STATUS = ["draft", "published", "archived"] as const;

export const Page = new Model<PageDoc>({
  table: "pages",
  fields: {
    slug: { kind: "text" },
    title: { kind: "text" },
    eyebrow: { kind: "text" },
    accent: { kind: "text" },
    description: { kind: "text" },
    blocks: { kind: "json" },
    status: { kind: "text" },
    seo: { kind: "json" },
  },
});

export const Section = new Model({
  table: "sections",
  fields: {
    key: { kind: "text" },
    name: { kind: "text" },
    type: { kind: "text" },
    data: { kind: "json" },
    order: { kind: "int" },
    visible: { kind: "bool" },
  },
});

export const CourseCategory = new Model({
  table: "course_categories",
  fields: {
    slug: { kind: "text" },
    name: { kind: "text" },
    description: { kind: "text" },
    order: { kind: "int" },
  },
});

export const Course = new Model<CourseDoc>({
  table: "courses",
  fields: {
    slug: { kind: "text" },
    title: { kind: "text" },
    coverImage: { kind: "text" },
    categorySlug: { kind: "text" },
    level: { kind: "text" },
    durationLabel: { kind: "text" },
    sessionCount: { kind: "int" },
    mode: { kind: "text" },
    price: { kind: "int" },
    priceNote: { kind: "text" },
    teacher: { kind: "text" },
    summary: { kind: "text" },
    content: { kind: "json" },
    syllabus: { kind: "json" },
    outcomes: { kind: "textarray" },
    forWhom: { kind: "textarray" },
    faqs: { kind: "json" },
    order: { kind: "int" },
    status: { kind: "text" },
    seo: { kind: "json" },
  },
});

export const PostCategory = new Model({
  table: "post_categories",
  fields: {
    slug: { kind: "text" },
    name: { kind: "text" },
    description: { kind: "text" },
    order: { kind: "int" },
  },
});

export const Post = new Model<PostDoc>({
  table: "posts",
  fields: {
    slug: { kind: "text" },
    title: { kind: "text" },
    cover: { kind: "text" },
    categorySlug: { kind: "text" },
    tags: { kind: "textarray" },
    excerpt: { kind: "text" },
    content: { kind: "json" },
    blocks: { kind: "json" },
    author: { kind: "text" },
    readMinutes: { kind: "int" },
    publishedAt: { kind: "date" },
    status: { kind: "text" },
    featured: { kind: "bool" },
    seo: { kind: "json" },
  },
});

export const ServicePackage = new Model<ServicePackageDoc>({
  table: "service_packages",
  fields: {
    slug: { kind: "text" },
    name: { kind: "text" },
    tagline: { kind: "text" },
    price: { kind: "int" },
    compareAtPrice: { kind: "int" },
    priceNote: { kind: "text" },
    durationLabel: { kind: "text" },
    description: { kind: "text" },
    deliverables: { kind: "textarray" },
    audience: { kind: "textarray" },
    coverImage: { kind: "text" },
    entitlementType: { kind: "text" },
    entitlementDays: { kind: "int" },
    ctaLabel: { kind: "text" },
    isFeatured: { kind: "bool" },
    order: { kind: "int" },
    status: { kind: "text" },
    seo: { kind: "json" },
  },
});

export type PageDoc = Doc & {
  slug: string;
  title: string;
  eyebrow: string;
  accent: string;
  description: string;
  blocks: { _id?: string; type: string; props: Record<string, unknown>; order: number }[];
  status: (typeof CONTENT_STATUS)[number];
  seo: SeoFields;
  createdAt: Date;
  updatedAt: Date;
};

export type CourseDoc = Doc & {
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
  content: unknown[];
  syllabus: { title?: string; details?: string }[];
  outcomes: string[];
  forWhom: string[];
  faqs: { question?: string; answer?: string }[];
  order: number;
  status: (typeof CONTENT_STATUS)[number];
  seo: SeoFields;
  createdAt: Date;
  updatedAt: Date;
};

export type PostDoc = Doc & {
  slug: string;
  title: string;
  cover: string;
  categorySlug: string;
  tags: string[];
  excerpt: string;
  content: { heading?: string; paragraphs?: string[]; bullets?: string[] }[];
  blocks: unknown[];
  author: string;
  readMinutes: number;
  publishedAt: Date;
  status: (typeof CONTENT_STATUS)[number];
  featured: boolean;
  seo: SeoFields;
  createdAt: Date;
  updatedAt: Date;
};

export type ServicePackageDoc = Doc & {
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
  entitlementType: string;
  entitlementDays: number;
  ctaLabel: string;
  isFeatured: boolean;
  order: number;
  status: (typeof CONTENT_STATUS)[number];
  seo: SeoFields;
  createdAt: Date;
  updatedAt: Date;
};
