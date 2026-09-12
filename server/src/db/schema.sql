-- Schema PostgreSQL cho SGEN Education (thay MongoDB/Mongoose).
-- Quy ước: tên cột trùng tên trường trong tài liệu; dữ liệu phức tạp dùng jsonb, mảng chuỗi dùng text[].
-- Toàn bộ câu lệnh idempotent để chạy lại an toàn mỗi lần khởi động.

CREATE TABLE IF NOT EXISTS "users" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "passwordHash" text NOT NULL,
  "role" text NOT NULL DEFAULT 'editor',
  "status" text NOT NULL DEFAULT 'active',
  "mustChangePassword" boolean NOT NULL DEFAULT false,
  "lastLoginAt" timestamptz,
  "failedLogins" integer NOT NULL DEFAULT 0,
  "lockedUntil" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "members" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "phone" text NOT NULL DEFAULT '',
  "birthDate" text NOT NULL DEFAULT '',
  "passwordHash" text NOT NULL,
  "status" text NOT NULL DEFAULT 'active',
  "consentAt" timestamptz,
  "lastLoginAt" timestamptz,
  "failedLogins" integer NOT NULL DEFAULT 0,
  "lockedUntil" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "site_settings" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "singleton" text NOT NULL DEFAULT 'site' UNIQUE,
  "brand" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "contact" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "socials" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "seo" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "notification" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "payment" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "featureFlags" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "legal" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "pages" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "eyebrow" text NOT NULL DEFAULT '',
  "accent" text NOT NULL DEFAULT '',
  "description" text NOT NULL DEFAULT '',
  "blocks" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "status" text NOT NULL DEFAULT 'published',
  "seo" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "pages_status_idx" ON "pages" ("status");

CREATE TABLE IF NOT EXISTS "sections" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "data" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "order" integer NOT NULL DEFAULT 0,
  "visible" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "course_categories" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "order" integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "courses" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "coverImage" text NOT NULL DEFAULT '',
  "categorySlug" text NOT NULL DEFAULT '',
  "level" text NOT NULL DEFAULT 'Nền tảng',
  "durationLabel" text NOT NULL DEFAULT '',
  "sessionCount" integer NOT NULL DEFAULT 0,
  "mode" text NOT NULL DEFAULT 'Học trực tuyến có tương tác',
  "price" bigint NOT NULL DEFAULT 0,
  "priceNote" text NOT NULL DEFAULT 'Liên hệ để nhận ưu đãi',
  "teacher" text NOT NULL DEFAULT '',
  "summary" text NOT NULL DEFAULT '',
  "content" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "syllabus" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "outcomes" text[] NOT NULL DEFAULT '{}',
  "forWhom" text[] NOT NULL DEFAULT '{}',
  "faqs" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "order" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'published',
  "seo" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "courses_status_order_idx" ON "courses" ("status", "order");
CREATE INDEX IF NOT EXISTS "courses_category_idx" ON "courses" ("categorySlug");
CREATE INDEX IF NOT EXISTS "courses_level_idx" ON "courses" ("level");

CREATE TABLE IF NOT EXISTS "post_categories" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "order" integer NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "posts" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "title" text NOT NULL,
  "cover" text NOT NULL DEFAULT '',
  "categorySlug" text NOT NULL DEFAULT 'kien-thuc',
  "tags" text[] NOT NULL DEFAULT '{}',
  "excerpt" text NOT NULL DEFAULT '',
  "content" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "blocks" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "author" text NOT NULL DEFAULT 'SGEN Education',
  "readMinutes" integer NOT NULL DEFAULT 4,
  "publishedAt" timestamptz NOT NULL DEFAULT now(),
  "status" text NOT NULL DEFAULT 'published',
  "featured" boolean NOT NULL DEFAULT false,
  "seo" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "posts_status_published_idx" ON "posts" ("status", "publishedAt");
CREATE INDEX IF NOT EXISTS "posts_category_idx" ON "posts" ("categorySlug");

CREATE TABLE IF NOT EXISTS "service_packages" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "tagline" text NOT NULL DEFAULT '',
  "price" bigint NOT NULL DEFAULT 0,
  "compareAtPrice" bigint NOT NULL DEFAULT 0,
  "priceNote" text NOT NULL DEFAULT '',
  "durationLabel" text NOT NULL DEFAULT '',
  "description" text NOT NULL DEFAULT '',
  "deliverables" text[] NOT NULL DEFAULT '{}',
  "audience" text[] NOT NULL DEFAULT '{}',
  "coverImage" text NOT NULL DEFAULT '',
  "entitlementType" text NOT NULL DEFAULT '',
  "entitlementDays" integer NOT NULL DEFAULT 0,
  "ctaLabel" text NOT NULL DEFAULT 'Đăng ký ngay',
  "isFeatured" boolean NOT NULL DEFAULT false,
  "order" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'published',
  "seo" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "service_packages_status_idx" ON "service_packages" ("status", "order");

CREATE TABLE IF NOT EXISTS "leads" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "phone" text NOT NULL DEFAULT '',
  "email" text NOT NULL DEFAULT '',
  "birthDate" text NOT NULL DEFAULT '',
  "message" text NOT NULL DEFAULT '',
  "source" text NOT NULL DEFAULT 'landing',
  "sourceLabel" text NOT NULL DEFAULT '',
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "status" text NOT NULL DEFAULT 'new',
  "assignedTo" uuid,
  "note" text NOT NULL DEFAULT '',
  "notification" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "leads_status_created_idx" ON "leads" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "leads_source_idx" ON "leads" ("source");

CREATE TABLE IF NOT EXISTS "orders" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "viewToken" text NOT NULL DEFAULT '',
  "memberId" uuid,
  "customerName" text NOT NULL DEFAULT '',
  "customerPhone" text NOT NULL DEFAULT '',
  "customerEmail" text NOT NULL DEFAULT '',
  "serviceSlug" text NOT NULL,
  "serviceName" text NOT NULL,
  "amount" bigint NOT NULL DEFAULT 0,
  "method" text NOT NULL DEFAULT 'bank_transfer',
  "status" text NOT NULL DEFAULT 'pending',
  "proofImage" text NOT NULL DEFAULT '',
  "paidAt" timestamptz,
  "adminNote" text NOT NULL DEFAULT '',
  "entitlementGrantedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "orders_status_created_idx" ON "orders" ("status", "createdAt");
CREATE INDEX IF NOT EXISTS "orders_member_idx" ON "orders" ("memberId");
CREATE INDEX IF NOT EXISTS "orders_service_idx" ON "orders" ("serviceSlug");
CREATE INDEX IF NOT EXISTS "orders_view_token_idx" ON "orders" ("viewToken");

CREATE TABLE IF NOT EXISTS "entitlements" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "memberId" uuid NOT NULL,
  "type" text NOT NULL,
  "orderId" uuid,
  "grantedAt" timestamptz NOT NULL DEFAULT now(),
  "expiresAt" timestamptz,
  "active" boolean NOT NULL DEFAULT true,
  "grantedBy" uuid,
  "note" text NOT NULL DEFAULT '',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "entitlements_member_active_idx" ON "entitlements" ("memberId", "active");

CREATE TABLE IF NOT EXISTS "media_assets" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "filename" text NOT NULL,
  "url" text NOT NULL,
  "mime" text NOT NULL DEFAULT '',
  "size" integer NOT NULL DEFAULT 0,
  "width" integer NOT NULL DEFAULT 0,
  "height" integer NOT NULL DEFAULT 0,
  "alt" text NOT NULL DEFAULT '',
  "folder" text NOT NULL DEFAULT 'general',
  "variants" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "refCount" integer NOT NULL DEFAULT 0,
  "uploadedBy" uuid,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "media_assets_folder_idx" ON "media_assets" ("folder");

CREATE TABLE IF NOT EXISTS "notification_logs" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "channel" text NOT NULL,
  "target" text NOT NULL DEFAULT '',
  "subject" text NOT NULL DEFAULT '',
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "status" text NOT NULL DEFAULT 'sent',
  "error" text NOT NULL DEFAULT '',
  "relatedLeadId" uuid,
  "relatedOrderId" uuid,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "notification_logs_channel_idx" ON "notification_logs" ("channel", "createdAt");

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "actorId" uuid,
  "actorEmail" text NOT NULL DEFAULT '',
  "action" text NOT NULL,
  "collectionName" text NOT NULL DEFAULT '',
  "documentId" text NOT NULL DEFAULT '',
  "diff" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "audit_logs_created_idx" ON "audit_logs" ("createdAt");

CREATE TABLE IF NOT EXISTS "lookup_reports" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "type" text NOT NULL,
  "title" text NOT NULL DEFAULT '',
  "inputs" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "result" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "memberId" uuid,
  "leadId" uuid,
  "shareToken" text NOT NULL DEFAULT '',
  "shareExpiresAt" timestamptz,
  "source" text NOT NULL DEFAULT '',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "lookup_reports_type_created_idx" ON "lookup_reports" ("type", "createdAt");
CREATE INDEX IF NOT EXISTS "lookup_reports_member_idx" ON "lookup_reports" ("memberId");
CREATE UNIQUE INDEX IF NOT EXISTS "lookup_reports_share_token_idx" ON "lookup_reports" ("shareToken") WHERE "shareToken" <> '';

CREATE TABLE IF NOT EXISTS "quiz_sets" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" text NOT NULL,
  "version" integer NOT NULL DEFAULT 1,
  "title" text NOT NULL,
  "instructions" text NOT NULL DEFAULT '',
  "scale" text NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "quiz_sets_key_version_key" UNIQUE ("key", "version")
);

CREATE TABLE IF NOT EXISTS "quiz_items" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "setId" uuid NOT NULL,
  "itemId" text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  "text" text NOT NULL,
  "options" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "quiz_items_set_item_key" UNIQUE ("setId", "itemId")
);
CREATE INDEX IF NOT EXISTS "quiz_items_set_order_idx" ON "quiz_items" ("setId", "order");

CREATE TABLE IF NOT EXISTS "quiz_results" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" text NOT NULL,
  "code" text NOT NULL,
  "title" text NOT NULL,
  "summary" text NOT NULL DEFAULT '',
  "strengths" text[] NOT NULL DEFAULT '{}',
  "cautions" text[] NOT NULL DEFAULT '{}',
  "careers" text[] NOT NULL DEFAULT '{}',
  "growth" text[] NOT NULL DEFAULT '{}',
  "relationships" text[] NOT NULL DEFAULT '{}',
  "teaming" text[] NOT NULL DEFAULT '{}',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "quiz_results_key_code_key" UNIQUE ("key", "code")
);

-- Bảng phiên đăng nhập của connect-pg-simple (thay connect-mongo).
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL PRIMARY KEY,
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS "session_expire_idx" ON "session" ("expire");

-- Cột audit dùng để lọc nhanh trên trang Nhật ký hoạt động.
CREATE INDEX IF NOT EXISTS "audit_logs_document_idx" ON "audit_logs" ("documentId");
