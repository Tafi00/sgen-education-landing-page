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

-- Mã xuất ebook (demo 100 lượt / combo 3–100 ebook) và nhật ký mỗi lượt xuất file.
CREATE TABLE IF NOT EXISTS "ebook_codes" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" text NOT NULL UNIQUE,
  "plan" text NOT NULL,
  "edition" text NOT NULL DEFAULT 'demo',
  "quota" integer NOT NULL,
  "used" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'active',
  "holderName" text NOT NULL DEFAULT '',
  "holderContact" text NOT NULL DEFAULT '',
  "note" text NOT NULL DEFAULT '',
  "batchId" text NOT NULL DEFAULT '',
  "expiresAt" timestamptz,
  "lastUsedAt" timestamptz,
  "createdBy" uuid,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "ebook_codes_plan_created_idx" ON "ebook_codes" ("plan", "createdAt");
CREATE INDEX IF NOT EXISTS "ebook_codes_batch_idx" ON "ebook_codes" ("batchId");
-- Đuôi mã do quản trị tự đặt (VD: DEMO-ANHVINH). Rỗng = mã ngẫu nhiên tiền tố + 8 ký tự.
ALTER TABLE "ebook_codes" ADD COLUMN IF NOT EXISTS "suffix" text NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS "ebook_exports" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "codeId" uuid NOT NULL,
  "edition" text NOT NULL DEFAULT 'demo',
  "customerName" text NOT NULL DEFAULT '',
  "birthDate" text NOT NULL DEFAULT '',
  "ip" text NOT NULL DEFAULT '',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "ebook_exports_code_created_idx" ON "ebook_exports" ("codeId", "createdAt");

-- Hồ sơ khách hàng (người được xuất ebook / để lại số điện thoại ở bước tra cứu).
-- Mỗi hồ sơ là duy nhất theo (họ tên chuẩn hoá, ngày sinh, số điện thoại) nên xuất lại không tạo bản ghi trùng.
-- Số điện thoại luôn là chuỗi (giữ số 0 đầu và mã quốc gia); "phoneKey" chỉ phục vụ tìm kiếm / chống trùng.
CREATE TABLE IF NOT EXISTS "customers" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "nameKey" text NOT NULL,
  "nameSearch" text NOT NULL DEFAULT '',
  "birthDate" text NOT NULL,
  "birthMonth" integer NOT NULL,
  "birthDay" integer NOT NULL,
  "phone" text NOT NULL,
  "phoneKey" text NOT NULL,
  "source" text NOT NULL DEFAULT 'ebook',
  "codeId" uuid,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "customers_identity_idx" ON "customers" ("nameKey", "birthDate", "phoneKey");
CREATE INDEX IF NOT EXISTS "customers_phone_idx" ON "customers" ("phoneKey");
CREATE INDEX IF NOT EXISTS "customers_birthday_idx" ON "customers" ("birthMonth", "birthDay");
CREATE INDEX IF NOT EXISTS "customers_created_idx" ON "customers" ("createdAt");

-- Báo cáo tra cứu gắn với hồ sơ khách hàng (số điện thoại không nằm trong "inputs" để không lộ qua link chia sẻ).
ALTER TABLE "lookup_reports" ADD COLUMN IF NOT EXISTS "customerId" uuid;
CREATE INDEX IF NOT EXISTS "lookup_reports_customer_idx" ON "lookup_reports" ("customerId");

-- Lịch sử xuất ebook: gắn hồ sơ khách hàng, loại ebook, trạng thái. Chỉ dòng "success" mới là xuất thành công.
ALTER TABLE "ebook_exports" ADD COLUMN IF NOT EXISTS "customerId" uuid;
ALTER TABLE "ebook_exports" ADD COLUMN IF NOT EXISTS "customerPhone" text NOT NULL DEFAULT '';
ALTER TABLE "ebook_exports" ADD COLUMN IF NOT EXISTS "reportId" uuid;
ALTER TABLE "ebook_exports" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'success';
ALTER TABLE "ebook_exports" ADD COLUMN IF NOT EXISTS "error" text NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS "ebook_exports_customer_created_idx" ON "ebook_exports" ("customerId", "createdAt");

-- 24/10/2026: khách đổi số "Điện thoại phụ" 0982.935.131 → 0902.931.839. Chỉ sửa bản ghi còn đúng số cũ,
-- nên chạy lại mỗi lần khởi động vẫn an toàn và không đè số khác do quản trị nhập.
UPDATE "site_settings"
SET "contact" = jsonb_set("contact", '{phoneAlt}', '"0902931839"'), "updatedAt" = now()
WHERE "contact"->>'phoneAlt' = '0982935131';

-- 28/10/2026: mã học viên chia 3 cấp (hocvien1 Sim + Bát Cực, hocvien2 thêm Gieo quẻ, hocvien3 thêm Xem ngày). Mã đã cấp
-- trước đó (gói "hocvien", mở mọi công cụ) thành cấp 3 để học viên không mất quyền; chạy lại mỗi lần khởi động vẫn an toàn.
UPDATE "ebook_codes" SET "plan" = 'hocvien3', "updatedAt" = now() WHERE "plan" = 'hocvien';

-- 02/11/2026: khách mở trang từ Zalo báo đã tải nhưng không thấy file. Không lưu file PDF (tạo lại được từ họ tên, ngày
-- sinh, số điện thoại đã lưu); mỗi lượt xuất có đường dẫn tải riêng, tải lại không trừ lượt.
ALTER TABLE "ebook_exports" ADD COLUMN IF NOT EXISTS "downloadToken" text NOT NULL DEFAULT '';
ALTER TABLE "ebook_exports" ADD COLUMN IF NOT EXISTS "downloadExpiresAt" timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS "ebook_exports_download_token_idx" ON "ebook_exports" ("downloadToken") WHERE "downloadToken" <> '';

-- 02/11/2026: khóa học video. Mã khóa học (gói "khoahoc", tiền tố KH) nằm cùng bảng mã, gắn với một khóa qua "courseSlug".
ALTER TABLE "ebook_codes" ADD COLUMN IF NOT EXISTS "courseSlug" text NOT NULL DEFAULT '';

-- Bài giảng video của khóa học: file tải lên ("videoFile", không public) hoặc link YouTube/Vimeo/Bunny ("videoUrl").
CREATE TABLE IF NOT EXISTS "course_lessons" (
  "_id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseSlug" text NOT NULL,
  "section" text NOT NULL DEFAULT '',
  "title" text NOT NULL,
  "description" text NOT NULL DEFAULT '',
  "kind" text NOT NULL DEFAULT 'lecture',
  "videoFile" text NOT NULL DEFAULT '',
  "videoUrl" text NOT NULL DEFAULT '',
  "durationSeconds" integer NOT NULL DEFAULT 0,
  "isPreview" boolean NOT NULL DEFAULT false,
  "order" integer NOT NULL DEFAULT 0,
  "status" text NOT NULL DEFAULT 'published',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "course_lessons_course_order_idx" ON "course_lessons" ("courseSlug", "order");

-- 02/11/2026: đường dẫn khóa Thần số học trên web thật bị sửa thành "than-so-hoc-can-ban va nang-cao" (có dấu cách) nên menu
-- Khóa học → Thần số học báo không tìm thấy. Đưa về đường dẫn mà menu trỏ tới; chỉ đổi đúng giá trị này nên chạy lại vẫn an toàn.
UPDATE "courses" SET "slug" = 'than-so-hoc-can-ban', "updatedAt" = now()
WHERE "slug" = 'than-so-hoc-can-ban va nang-cao' AND NOT EXISTS (SELECT 1 FROM "courses" WHERE "slug" = 'than-so-hoc-can-ban');
UPDATE "ebook_codes" SET "courseSlug" = 'than-so-hoc-can-ban' WHERE "courseSlug" = 'than-so-hoc-can-ban va nang-cao';
UPDATE "course_lessons" SET "courseSlug" = 'than-so-hoc-can-ban' WHERE "courseSlug" = 'than-so-hoc-can-ban va nang-cao';

-- 02/11/2026: 5 video phần cơ bản khóa Thần số học (YouTube không công khai của kênh Phạm Bá Nha) chia thành các đoạn ngắn theo nội
-- dung, phần thảo luận tách riêng; mỗi bài phát một khoảng start/end của video. Chỉ áp dụng khi khóa chưa có bài (hoặc còn nguyên 5 bài
-- cả buổi đã thêm trước đó) và quản trị chưa từng sửa bài giảng, nên bài đã sửa hay đã xoá ở trang quản trị không bị đụng tới.
DELETE FROM "course_lessons"
WHERE "courseSlug" = 'than-so-hoc-can-ban'
  AND "videoUrl" IN ('https://www.youtube.com/watch?v=Dfhxrk_PpRM', 'https://www.youtube.com/watch?v=PQDsXIGVIOo', 'https://www.youtube.com/watch?v=pogtdcQH-sA', 'https://www.youtube.com/watch?v=9gMQ18w2JLE', 'https://www.youtube.com/watch?v=jQkyctGSEzc')
  AND NOT EXISTS (SELECT 1 FROM "audit_logs" WHERE "collectionName" = 'course_lessons');

INSERT INTO "course_lessons" ("courseSlug", "section", "title", "kind", "videoUrl", "durationSeconds", "order")
SELECT 'than-so-hoc-can-ban', v."section", v."title", v."kind", v."url", v."seconds", v."order"
FROM (VALUES
  ('Ngày 1', 'Làm quen lớp, vì sao nên học thần số học, nội quy, giới thiệu thầy', 'lecture', 'https://www.youtube.com/watch?v=Dfhxrk_PpRM&end=622', 622, 1),
  ('Ngày 1', 'Cách học qua từ khóa, lịch 6 buổi, thần số học là gì và Pythagoras', 'lecture', 'https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=622&end=1127', 505, 2),
  ('Ngày 1', '11 mục đích của thần số học và bình chọn mục đích được quan tâm', 'lecture', 'https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=1127&end=1687', 560, 3),
  ('Ngày 1', 'Thảo luận: Cảm nhận của học viên sau coaching về nội tâm và hạnh phúc', 'discussion', 'https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=1687&end=2180', 493, 4),
  ('Ngày 1', 'Thảo luận: Học viên chia sẻ về nợ nghiệp, thấu hiểu và giúp cộng đồng', 'discussion', 'https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=2180&end=2772', 592, 5),
  ('Ngày 1', 'Cách tính chỉ số đường đời, ví dụ lá số Elon Musk và thực hành tính', 'lecture', 'https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=2772&end=3474', 702, 6),
  ('Ngày 1', 'Thái dương hệ, liên hệ với các con số và năng lượng số 1, 2, 3', 'lecture', 'https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=3474&end=4455', 981, 7),
  ('Ngày 1', 'Thảo luận: Trải nghiệm của người số 3, may mắn, quý nhân, tặng lá số', 'discussion', 'https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=4455&end=5014', 559, 8),
  ('Ngày 1', 'Ý nghĩa nét viết các con số, năng lượng số 4 và số 5', 'lecture', 'https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=5014&end=5544', 530, 9),
  ('Ngày 1', 'Thảo luận: Năng lượng số 6, ôm đồm, giúp người và cách giữ cân bằng', 'discussion', 'https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=5544&end=5986', 442, 10),
  ('Ngày 1', 'Năng lượng số 7, phối hợp các con số trong nhóm, cảm nhận và tổng kết', 'lecture', 'https://www.youtube.com/watch?v=Dfhxrk_PpRM&start=5986', 770, 11),
  ('Ngày 2', 'Ý nghĩa cơ bản số 8, 9, 11/2, 22/4 và tổng quan trang số liệu báo cáo', 'lecture', 'https://www.youtube.com/watch?v=PQDsXIGVIOo&end=548', 548, 12),
  ('Ngày 2', 'Thế giới bên trong và bên ngoài: 9 chỉ số, ví dụ lá số Elon Musk', 'lecture', 'https://www.youtube.com/watch?v=PQDsXIGVIOo&start=548&end=1332', 784, 13),
  ('Ngày 2', 'Chỉ số phát triển bản thân, định hướng sự nghiệp và biểu đồ Ikigai', 'lecture', 'https://www.youtube.com/watch?v=PQDsXIGVIOo&start=1332&end=2044', 712, 14),
  ('Ngày 2', 'Thảo luận: số 1, số 2 đối chiếu lá số của học viên, trực giác là gì', 'discussion', 'https://www.youtube.com/watch?v=PQDsXIGVIOo&start=2044&end=2787', 743, 15),
  ('Ngày 2', 'Thảo luận: số 3, số 4 đối chiếu từ khóa với lá số của học viên', 'discussion', 'https://www.youtube.com/watch?v=PQDsXIGVIOo&start=2787&end=3353', 566, 16),
  ('Ngày 2', 'Thảo luận: số 5 – thích tự do, quyết định vội, làm nhiều việc cùng lúc', 'discussion', 'https://www.youtube.com/watch?v=PQDsXIGVIOo&start=3353&end=3975', 622, 17),
  ('Ngày 2', 'Thảo luận: số 6 – bao dung, ôm đồm, học từ chối và tự chữa lành', 'discussion', 'https://www.youtube.com/watch?v=PQDsXIGVIOo&start=3975&end=4573', 598, 18),
  ('Ngày 2', 'Thảo luận: số 7 – chiêm nghiệm, bậc thầy trí tuệ, năm cá nhân đổi khi nào', 'discussion', 'https://www.youtube.com/watch?v=PQDsXIGVIOo&start=4573&end=5165', 592, 19),
  ('Ngày 2', 'Thảo luận: số 8 – tham vọng, tiền bạc, cân bằng vật chất và tinh thần', 'discussion', 'https://www.youtube.com/watch?v=PQDsXIGVIOo&start=5165&end=5667', 502, 20),
  ('Ngày 2', 'Giải đáp về tiền bạc: cái túi càn khôn, ước mơ lớn và hiểu chính mình', 'lecture', 'https://www.youtube.com/watch?v=PQDsXIGVIOo&start=5667', 382, 21),
  ('Ngày 3', 'Số 9 và kết nối: nguyên tắc 3B (bàn, bạn, bán), khơi gợi để khách nói', 'lecture', 'https://www.youtube.com/watch?v=pogtdcQH-sA&end=758', 758, 22),
  ('Ngày 3', 'Thảo luận: học viên đối chiếu số 9 và chia sẻ kinh nghiệm áp dụng 3B', 'discussion', 'https://www.youtube.com/watch?v=pogtdcQH-sA&start=758&end=1279', 521, 23),
  ('Ngày 3', 'Thảo luận: ý nghĩa số vua 11/2, 22/4 và đối chiếu lá số của học viên', 'discussion', 'https://www.youtube.com/watch?v=pogtdcQH-sA&start=1279&end=1871', 592, 24),
  ('Ngày 3', 'Cách tính chỉ số sứ mệnh: ví dụ Elon Musk, đặt tên và bài tập thực hành', 'lecture', 'https://www.youtube.com/watch?v=pogtdcQH-sA&start=1871&end=2775', 904, 25),
  ('Ngày 3', 'Ý nghĩa sứ mệnh 1 đến 4: ưu nhược điểm, ví dụ từ lá số của học viên', 'lecture', 'https://www.youtube.com/watch?v=pogtdcQH-sA&start=2775&end=3502', 727, 26),
  ('Ngày 3', 'Thảo luận: ý nghĩa sứ mệnh 5, nói thẳng và rèn chậm lại trước khi nói', 'discussion', 'https://www.youtube.com/watch?v=pogtdcQH-sA&start=3502&end=3965', 463, 27),
  ('Ngày 3', 'Ý nghĩa sứ mệnh 6, 7, 8 và vì sao phải luận cả lá số, không luận rời', 'lecture', 'https://www.youtube.com/watch?v=pogtdcQH-sA&start=3965', 611, 28),
  ('Ngày 4', 'Thảo luận: luận lá số và số điện thoại của học viên', 'discussion', 'https://www.youtube.com/watch?v=9gMQ18w2JLE&end=583', 583, 29),
  ('Ngày 4', 'Tín hiệu chu kỳ suy, đồng hồ sinh học và vì sao nghiệp cứ lặp lại', 'lecture', 'https://www.youtube.com/watch?v=9gMQ18w2JLE&start=583&end=986', 403, 30),
  ('Ngày 4', 'Năng lượng số xấu: hai chuyện chủ doanh nghiệp, gieo quẻ và đổi số', 'lecture', 'https://www.youtube.com/watch?v=9gMQ18w2JLE&start=986&end=1579', 593, 31),
  ('Ngày 4', 'Sứ mệnh số 9: ý nghĩa, trải nghiệm học viên và hướng tạo thu nhập', 'lecture', 'https://www.youtube.com/watch?v=9gMQ18w2JLE&start=1579&end=2226', 647, 32),
  ('Ngày 4', 'Thảo luận: sứ mệnh 11/2, 22/4 và chia sẻ của học viên', 'discussion', 'https://www.youtube.com/watch?v=9gMQ18w2JLE&start=2226&end=2610', 384, 33),
  ('Ngày 4', 'Nợ nghiệp là gì, ba chiếc hộp của đời người và tần số năng lượng', 'lecture', 'https://www.youtube.com/watch?v=9gMQ18w2JLE&start=2610&end=3150', 540, 34),
  ('Ngày 4', 'Mở cam tương tác, đúng sai do góc nhìn và thoát chuỗi chồng nghiệp', 'lecture', 'https://www.youtube.com/watch?v=9gMQ18w2JLE&start=3150&end=3572', 422, 35),
  ('Ngày 4', 'Cách gieo hạt: luận từng chỉ số, không nói hết một lần để giữ khách', 'lecture', 'https://www.youtube.com/watch?v=9gMQ18w2JLE&start=3572&end=4050', 478, 36),
  ('Ngày 4', 'Cách tính nợ nghiệp, đọc trên lá số; ý nghĩa 13/4, 14/5, 16/7, 19/1', 'lecture', 'https://www.youtube.com/watch?v=9gMQ18w2JLE&start=4050&end=4908', 858, 37),
  ('Ngày 4', 'Vì sao nam Văn nữ Thị: năng lượng số 1 và sự cân bằng của phụ nữ', 'lecture', 'https://www.youtube.com/watch?v=9gMQ18w2JLE&start=4908&end=5549', 641, 38),
  ('Ngày 4', 'Thảo luận: câu hỏi về nợ nghiệp trên lá số, cảm nhận và dặn dò', 'discussion', 'https://www.youtube.com/watch?v=9gMQ18w2JLE&start=5549', 343, 39),
  ('Ngày 5', 'Thảo luận: cách xem nợ nghiệp trên lá số của học viên và cách hóa giải', 'discussion', 'https://www.youtube.com/watch?v=jQkyctGSEzc&end=632', 632, 40),
  ('Ngày 5', 'Thảo luận: lá số đỉnh 8, nhiều số 5, số 9 mạnh; dùng số học để giao tiếp', 'discussion', 'https://www.youtube.com/watch?v=jQkyctGSEzc&start=632&end=1301', 669, 41),
  ('Ngày 5', 'Thảo luận: cảm nhận sau coaching, quà lớp nâng cao, luận thêm một lá số', 'discussion', 'https://www.youtube.com/watch?v=jQkyctGSEzc&start=1301&end=2018', 717, 42),
  ('Ngày 5', 'Công thức tính nợ nghiệp ở đường đời, sứ mệnh và nợ nghiệp là gì', 'lecture', 'https://www.youtube.com/watch?v=jQkyctGSEzc&start=2018&end=2537', 519, 43),
  ('Ngày 5', 'Sáu chìa khóa thành công: tam giác 1-3-5 và vai trò của mối quan hệ', 'lecture', 'https://www.youtube.com/watch?v=jQkyctGSEzc&start=2537&end=3112', 575, 44),
  ('Ngày 5', 'Tam giác 2-4-6, chìa khóa tâm linh và vì sao cần mối quan hệ chất lượng', 'lecture', 'https://www.youtube.com/watch?v=jQkyctGSEzc&start=3112&end=3695', 583, 45),
  ('Ngày 5', 'Công thức thành công của Napoleon Hill: tài năng, đam mê, thầy, niềm tin', 'lecture', 'https://www.youtube.com/watch?v=jQkyctGSEzc&start=3695&end=4164', 469, 46),
  ('Ngày 5', 'Sáu quy luật vận mệnh hóa giải nợ nghiệp, bốn bước gieo hạt, thiền cà phê', 'lecture', 'https://www.youtube.com/watch?v=jQkyctGSEzc&start=4164&end=4931', 767, 47),
  ('Ngày 5', 'Quy luật trong ngoài: hình ảnh tâm trí tạo kết quả; ba bước luật hấp dẫn', 'lecture', 'https://www.youtube.com/watch?v=jQkyctGSEzc&start=4931&end=5802', 871, 48),
  ('Ngày 5', 'Thảo luận: cảm nhận sau 5 buổi, vì sao số 7 không xấu, phân biệt với 16/7', 'discussion', 'https://www.youtube.com/watch?v=jQkyctGSEzc&start=5802&end=6313', 511, 49),
  ('Ngày 5', 'Thảo luận: sách nên đọc, ngôn từ theo đối tượng, học viên cũ chia sẻ', 'discussion', 'https://www.youtube.com/watch?v=jQkyctGSEzc&start=6313', 848, 50)
) AS v("section", "title", "kind", "url", "seconds", "order")
WHERE EXISTS (SELECT 1 FROM "courses" WHERE "slug" = 'than-so-hoc-can-ban')
  AND NOT EXISTS (SELECT 1 FROM "course_lessons" WHERE "courseSlug" = 'than-so-hoc-can-ban')
  AND NOT EXISTS (SELECT 1 FROM "audit_logs" WHERE "collectionName" = 'course_lessons');
