# Audit toàn diện — SGEN Education (12/09/2026)

Cách kiểm: đọc mã nguồn, chạy `typecheck` / `build` / `test` / `smoke`, mở trình duyệt thật (Chromium 1440×900 + 390×844) trên 21 route công khai và 19 route CMS, gọi API thật bằng 4 phiên (admin, editor, member, ẩn danh), đối chiếu `AGENTS.md` và feedback PDF của khách. Mọi mục dưới đây đều kèm bằng chứng tái lập được.

Kết quả tổng hợp: **39/39 test · 26/26 smoke · typecheck sạch · build OK · 0 lỗi console · 0 tràn ngang** trên cả 40 route đã kiểm.

---

## 1. Tóm tắt điều hành

| Nhóm | Trạng thái |
| --- | --- |
| 9 mục menu theo feedback khách | **Đạt** (8 mục nội dung + Đăng nhập riêng ở góc phải header) |
| CMS theo `AGENTS.md` | **Đạt** phần lớn quy tắc UX; 3 lỗi cần sửa bên dưới |
| Backend MongoDB + auth + upload + thông báo + seed | **Đạt** |
| Nội dung trả phí (VIP / trọn đời) | **Chưa có** — mới có hạ tầng quyền (entitlement) |
| Bảo mật | **2 lỗi cần sửa ngay** (rò rỉ hash mật khẩu; vai trò editor quá rộng) |
| Vận hành | Chưa có CI, chưa có tài liệu triển khai production |

---

## 2. Đã hoàn thiện

### 2.1 Đối chiếu 9 mục feedback khách

| # | Mục khách yêu cầu | Route | Nguồn dữ liệu | Trạng thái |
| --- | --- | --- | --- | --- |
| 1 | GIỚI THIỆU: tầm nhìn, sứ mệnh, giá trị cốt lõi, liên hệ | `/gioi-thieu` + 3 trang con + `/lien-he` | CMS (`pages`) + fallback | Đạt |
| 2 | TRA CỨU: thần số học, DISC, MBTI | `/tra-cuu` + 3 công cụ | Engine trong `shared/`, đề trong `quiz_*` | Đạt |
| 3 | DỊCH VỤ: VIP, trọn đời, định hướng nghề nghiệp | `/dich-vu` + `/dich-vu/:slug` + đơn hàng | CMS (`services`) | Đạt một phần — thiếu nội dung trả phí |
| 4 | PHONG THỦY SIM SỐ ĐIỆN THOẠI: phần mềm bói sim | `/sim-phong-thuy/boi-sim` | Engine `shared/sim` (5 lớp phân tích) | Đạt |
| 5 | CÔNG CỤ PHONG THỦY: gieo quẻ, tứ trụ, xem ngày | `/cong-cu-phong-thuy/*` | Engine `shared/menh-thu` | Đạt |
| 6 | KHÓA HỌC (11 nhóm khách liệt kê) | `/khoa-hoc`, `/khoa-hoc/:slug` | CMS (`courses`) — 11 khóa | Đạt |
| 7 | FREE TOOLS theo cách trình bày tham chiếu | `/free-tools` | Engine client + CMS | Đạt |
| 8 | BLOG theo cách trình bày tham chiếu | `/blog`, `/blog/kien-thuc`, `/blog/:slug` | CMS (`posts`) — 12 bài | Đạt |
| 9 | ĐĂNG NHẬP | `/dang-nhap`, `/dang-ky`, `/quen-mat-khau`, `/tai-khoan` | MongoDB `members` | Đạt |
| I | Ô tra cứu nền trắng, không tối/mỏi mắt | Toàn site | — | Đạt: 0/… ô nhập nền tối, 0 ô tương phản < 4.5:1 |

Bằng chứng: sweep 21 route ở 1440×900 và 390×844 — không route nào có ô nhập nền tối, không ô nào có tương phản chữ < 4.5:1, không tràn ngang, không lỗi console.

### 2.2 CMS theo `AGENTS.md`

| Quy tắc | Trạng thái | Bằng chứng |
| --- | --- | --- |
| Listing chỉ list/search/filter/sort/paginate | Đạt | `ResourceList.tsx` |
| Create/detail/edit là route riêng | Đạt | `src/app/router.tsx` (`/new`, `/:id`) |
| Filter trong 1 popover, có số filter, Apply/Reset/Close | Đạt | `FilterPopover.tsx:68-151` |
| Chip lọc + “Xoá tất cả” | Đạt | `FilterPopover.tsx:76-87` |
| Phân trang: số trang, tổng, page size, trước/sau | Đạt | `DataTable.tsx:205-216` |
| Trạng thái nằm trên URL | Đạt | `ResourceList.tsx:82-96` |
| Empty state phân biệt “không có dữ liệu” vs “không khớp lọc” | Đạt | `DataTable.tsx:162` |
| Loading/error/empty state | Đạt | `ResourceList.tsx:336-340`, `MediaLibraryPage.tsx:762-778` |
| Confirm cho xoá / publish / unpublish / đổi trạng thái | Đạt | `ResourceList.tsx:352-381`, `ResourceForm.tsx:705-724` |
| Confirm khi rời form có thay đổi | Đạt | `ResourceForm.tsx:725` |
| Sticky action bar + trạng thái lưu | Đạt | `ResourceForm.tsx` (thanh dưới), đo trên trình duyệt |
| Ảnh: tải lên / xem trước / thay / xoá | Đạt | `ImageField` trong `src/components/form/Field.tsx` + `MediaPickerDialog` |
| Detail dạng card/tab, không dump JSON | **Một phần** | Xem phát hiện P1-4 |
| Destructive tách khỏi primary | Đạt | Ảnh `cms-forms-*`, `cms-audit-*` |
| Sidebar nhóm chức năng + tìm nhanh + thu gọn | Đạt | `AdminLayout.tsx`, ảnh `cms2-dashboard2.png` |
| Breadcrumb + link “Mở website” | Đạt | Ảnh `cms-audit-log-desktop.png` |
| Ảnh lưu `UPLOAD_DIR`, phục vụ `/uploads`, DB giữ `/uploads/...` | Đạt | Upload thật: `201` → `uploads/audit/…webp`, `GET /uploads/audit/…webp` → `200 image/webp` |
| Không base64 trong Mongo | Đạt | `server/src/services/media.ts` dùng multer + sharp |
| Secret thông báo mask, chỉ thay khi nhập mới | Đạt | `server/src/services/settings.ts:24-41`, `crypto.ts:32`, smoke #169 |
| Gửi thử thông báo | Đạt | `POST /api/admin/settings/notifications/test` → `200`, log ghi vào `notification_logs` |
| Lead lưu DB trước, lỗi gửi không chặn | Đạt | `POST /api/leads` → `201` trước khi gọi kênh gửi |
| Phân quyền admin/editor | **Chưa đạt** | Xem phát hiện P0-2 |

### 2.3 Backend, dữ liệu, vận hành

- **API công khai chạy thật**: `/api/settings`, `/api/courses`, `/api/courses/:slug`, `/api/posts`, `/api/services`, `/api/sections`, `/api/categories`, `/api/quiz/*`, `/api/lookups/*`, `/api/leads`, `/api/members/*`, `/api/orders/*`.
- **Nội dung công khai render từ CMS, không hardcode**: sửa tiêu đề khóa học trong CMS → trang công khai đổi ngay (`Thần số học căn bản (CMS-AUDIT)`); chuyển sang bản nháp → biến mất khỏi danh sách công khai.
- **CMS không rỗng sau seed**: khóa học 11 · nhóm khóa học 3 · bài viết 12 · chuyên mục 4 · trang nội dung 5 · khối trang chủ 8 · dịch vụ 3 · bộ câu hỏi 2 · câu hỏi 64 · kết quả trắc nghiệm 28 · media 4.
- **Tra cứu lưu thật**: chạy form thần số học trên trình duyệt → `lookup_reports` tăng 0 → 1, kết quả có 8 chỉ số.
- **Thành viên chạy thật**: đăng ký qua UI → tự đăng nhập → `/tai-khoan`.
- **SEO**: meta/title/OG/canonical được chèn phía server theo route, `sitemap.xml` 200 (4.135 byte), `robots.txt` chặn `/admin`, `/tai-khoan`, và `/admin` có `noindex`.
- **Chất lượng mã**: 0 `console.log` sót trong `src/`, 0 `TODO/FIXME`, 1 chỗ `any` (trong script smoke), không có file mồ côi, `dist/` và `uploads/` không bị commit.

---

## 3. Phát hiện cần sửa

### P0 — bảo mật, sửa ngay

**P0-1. API admin trả về `passwordHash` của thành viên.**
`GET /api/admin/members` và `GET /api/admin/members/:id` trả nguyên trường `passwordHash` (bcrypt `$2b$11$…`) về trình duyệt. Hash không bao giờ nên rời server (rủi ro dò mật khẩu offline nếu log/phiên bị lộ; editor cũng đọc được — xem P0-2).
Bằng chứng: gọi API bằng phiên admin → field `passwordHash` có trong payload.
Hướng sửa: `createCrudRouter` cho `Member` bỏ `passwordHash` khi trả (`select("-passwordHash")` / projection ở `server/src/services/crud.ts`), thêm test smoke khẳng định payload không chứa hash.

**P0-2. Vai trò `editor` đọc và xoá được toàn bộ dữ liệu kinh doanh + dữ liệu cá nhân.**
`app.ts` gắn `requireAdmin()` (cho cả `admin` và `editor`) trước `adminApiRouter`, còn `createCrudRouter` không nhận tham số vai trò → mọi module dùng factory này đều mở với editor: `leads`, `orders`, `members`, `entitlements`, `lookups`, `notifications`, `dashboard/audit`.
Bằng chứng (phiên editor thật):

| Thao tác | Kết quả |
| --- | --- |
| `GET /api/admin/leads` · `/orders` · `/members` · `/entitlements` · `/lookups` · `/notifications` · `/dashboard/audit` | `200` |
| `PATCH /api/admin/leads/:id` | `200` (sửa được) |
| `POST /api/admin/leads/bulk` `{action:"delete"}` | `200 affected:1` |
| `POST /api/admin/members/bulk` `{action:"delete"}` | `200 affected:1` |
| `GET /api/admin/settings` | `200` (đọc được; ghi `403`) |
| `PATCH /api/admin/settings` · `GET /api/admin/auth/users` · gửi thử thông báo | `403` (đúng) |

Điều này lệch với tài liệu `docs/feedback-plan.md` §7 (“editor … không truy cập orders, members, audit_logs”).
Hướng sửa: cho `createCrudRouter` nhận `roles` và gắn `requireAdmin("admin")` cho `leads/orders/members/entitlements/lookups/notifications/audit`; giữ editor cho nội dung; thêm smoke test kiểm 2 vai trò.

### P1 — hành vi nội dung

**P1-3. Nội dung ở trạng thái nháp vẫn hiển thị công khai qua bộ dữ liệu mặc định.**
Khóa học chuyển sang `draft`: API công khai trả 404 và biến khỏi danh sách (đúng), nhưng trang chi tiết `/khoa-hoc/:slug` vẫn render nội dung mặc định trong repo (`Thần số học căn bản`) thay vì trang “không tìm thấy”.
Nguyên nhân: `useCourse/usePage/usePost/useService` rơi về `src/data/defaults/*` bất cứ khi nào không có dữ liệu, không phân biệt lỗi mạng với việc bản ghi bị ẩn/xoá.
Ảnh hưởng: khách ẩn nội dung nhưng nội dung cũ vẫn hiện (kể cả với công cụ tìm kiếm); ngược lại nếu khách xoá một trang mẫu thì trang đó “sống lại”.
Hướng sửa: chỉ fallback khi lỗi mạng/5xx; gặp 404 thì hiện trạng thái không tìm thấy (hoặc ghi đè bằng cờ `CMS_STRICT`).

**P1-4. Trang chi tiết báo cáo tra cứu còn in JSON thô.**
`src/pages/admin/LookupDetailPage.tsx:103` dùng `JSON.stringify(value)` cho giá trị lồng nhau → hiển thị chuỗi JSON trong bảng chi tiết, trái tinh thần “detail dùng card/nhãn–giá trị, không dump JSON”. Mức độ nhẹ (chỉ với trường lồng nhau), hướng sửa: render đệ quy thành cặp nhãn–giá trị.

### P2 — chi tiết nhỏ

**P2-5. Chữ nhỏ hơn sàn 12px cam kết.** `.course-card__level` = 10.56px (7 chỗ ở `/khoa-hoc` mobile), dòng bản quyền/legal ở footer = 10.56px (mọi trang). `docs/ux-fix-plan.md` ghi “chữ dưới 12px gần như đã xử lý hết” — thực tế còn 2–7 chỗ/trang.

**P2-6. Vùng chạm nhỏ ở footer.** Link email `sgen.vn@gmail.com` cao 20px, icon “Gửi email cho SGEN” 24×20px (2 chỗ/trang, mọi trang). Tài liệu ghi “còn vài link phụ” — đúng, nhưng nên nâng lên ≥44px.

**P2-7. Thiếu dữ liệu có cấu trúc (JSON-LD).** Có meta, OG, canonical, sitemap, robots nhưng không có `application/ld+json` cho Course/Article/BreadcrumbList — ảnh hưởng hiển thị rich result trên Google.

---

## 4. Nợ kỹ thuật & vận hành

| # | Vấn đề | Bằng chứng | Mức |
| --- | --- | --- | --- |
| 4-1 | **CSS phân tán**: 19 file, 14.972 dòng, 55 selector được khai báo ở ≥2 file (`final.css`, `responsive.css` và bộ `ux-*.css` ghi đè lên nhau). Sửa một chỗ phải kiểm 2–3 file | đếm tự động trên `src/styles` | Trung bình |
| 4-2 | **Bundle nặng**: chunk `metaphysics` 894,61 kB (gzip 213,75 kB), JS chính 502 kB (gzip 148 kB), CSS 230,73 kB (gzip 43,98 kB) | `npm run build` | Trung bình — nên lazy-load công cụ phong thủy |
| 4-3 | **Không có CI**: không `.github/workflows`, không chạy typecheck/test/smoke tự động | `ls .github` → không tồn tại | Trung bình |
| 4-4 | **Không có tài liệu triển khai production**: README thiếu mục build–deploy (biến môi trường, reverse proxy, HTTPS/`secure` cookie, sao lưu Mongo + `uploads/`, sao lưu `.data/` chứa khoá) | `README.md:105-109` | Trung bình |
| 4-5 | **Không Docker/compose** để dựng môi trường | không có `Dockerfile` | Thấp |
| 4-6 | **Rác kiểm thử**: `uploads/` còn 34 file (940 KB) do smoke test sinh; DB in-memory reset nhưng file thì ở lại | `find uploads -type f` | Thấp |
| 4-7 | **Test chưa phủ**: 39 test chỉ cho quiz DISC/MBTI + engine sim; engine thần số học (`shared/numerology.ts`), mệnh lý (`metaphysics.ts`), toàn bộ route CMS, luồng auth, media, đơn hàng chưa có test đơn vị; không có E2E | `shared/**/__tests__` | Trung bình |
| 4-8 | **Tài liệu lệch thực tế**: `docs/client-requirements-audit.md` và `docs/feedback-plan.md` khẳng định editor bị chặn khỏi nhóm kinh doanh và “0 vùng chạm < 44px” — cả hai không còn đúng | đối chiếu P0-2, P2-5, P2-6 | Nhẹ |

---

## 5. Chưa hoàn thiện / chờ khách quyết

| # | Hạng mục | Trạng thái hiện tại | Cần gì để xong |
| --- | --- | --- | --- |
| 5-1 | **Nội dung trả phí VIP / trọn đời** | Có gói, đơn hàng, duyệt đơn, cấp/thu quyền; khách mua xong chỉ thấy “quyền đã cấp”, chưa có trang báo cáo chuyên sâu | Khách chốt báo cáo gồm những gì |
| 5-2 | **Cổng thanh toán tự động** | Đang chuyển khoản + VietQR + admin duyệt tay (theo thiết kế) | Khách chọn VNPay/MoMo nếu muốn |
| 5-3 | **Giá và ảnh bìa** | Giá là số tạm; 5 ảnh bìa khóa học mới là ảnh tạm | Khách cấp bảng giá + ảnh |
| 5-4 | **Nội dung do tôi soạn** | 11 đề cương khóa, 12 bài blog, 4 trang giới thiệu | Khách duyệt/chỉnh giọng thương hiệu |
| 5-5 | **Thông báo thật** | UI + gửi thử hoạt động; chưa gửi được ra ngoài vì chưa có khoá | Khách nhập Resend API key + Telegram bot token trong Site Settings, bấm “Gửi thử” |
| 5-6 | **Prerender SEO** | Đã có meta server-side, sitemap, robots; SPA vẫn cần JS để hiện nội dung | Làm khi khách chạy SEO/quảng cáo |
| 5-7 | **Danh mục sim để bán** | Chưa có (chỉ có phần mềm bói sim) | Ngoài phạm vi feedback; cần nếu khách muốn bán sim |
| 5-8 | **Bộ đề DISC/MBTI** | Tự soạn theo khung tham chiếu, có ghi chú “không phải công cụ chẩn đoán” | Khách đồng ý cách ghi chú hoặc mua bản quyền bộ đề chuẩn |

---

## 6. Đề xuất thứ tự xử lý

1. **Trong tuần này** — P0-1 (bỏ `passwordHash` khỏi payload), P0-2 (gắn vai trò cho nhóm kinh doanh), P1-3 (không fallback khi nội dung đã bị ẩn). Mỗi việc kèm smoke test khẳng định lại.
2. **Sau đó** — P1-4, P2-5, P2-6, P2-7; dọn `uploads/` rác; bổ sung JSON-LD.
3. **Song song** — tài liệu triển khai production (4-4) + workflow CI chạy typecheck/test/smoke (4-3).
4. **Khi khách chốt nội dung** — làm trang báo cáo trả phí (5-1), đây là việc lớn còn lại của dự án.
5. **Dọn dẹp dài hạn** — gộp lớp CSS (4-1), lazy-load công cụ phong thủy (4-2), bổ sung test cho engine thần số học và route CMS (4-7).

---

## 7. Bằng chứng đã thu thập

- Lệnh: `npm run typecheck` (sạch) · `npm run build` (OK) · `npm test` (39/39) · `npm run smoke` (26/26).
- Trình duyệt: sweep 21 route công khai + 19 route CMS (desktop 1440×900, mobile 390×844) — 0 lỗi console, 0 tràn ngang, 0 ô nhập nền tối, 0 tương phản thấp.
- Ảnh: `artifacts/screenshots/cms2-*.png`, `cms-*.png`, `audit-public-numerology-result.png`, `audit-admin-mobile-courses.png`, `audit-public-tai-khoan.png`.
- API: phiên admin tạo editor, phiên editor thử đọc/ghi/xoá 12 endpoint, upload ảnh thật và kiểm tra file trên đĩa + phục vụ qua `/uploads`, chèn/sửa/hoàn nguyên khóa học để kiểm luồng CMS → công khai.
