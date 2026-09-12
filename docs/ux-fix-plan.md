# Plan sửa UX/UI — SGEN Education (đợt 1)

Nguồn: tự rà từng màn bằng trình duyệt thật (Chromium, 390×844 mobile + 1440×900 desktop), chụp ảnh và đo layout.
Ảnh bằng chứng: `artifacts/screenshots/ux-mobile-*.png`, `ux-desktop-*.png`.
Phạm vi: toàn bộ trang công khai + CMS. Ưu tiên mobile vì đó là nơi lỗi nặng nhất.

---

## 1. Kết luận nhanh

Giao diện desktop ở mức chấp nhận được (bảng CMS, hero, tools section rõ ràng). **Mobile đang có 5 lỗi hệ thống lặp lại ở mọi trang**, cộng thêm lỗi riêng của từng trang:

| # | Lỗi hệ thống | Bằng chứng | Ảnh hưởng |
| --- | --- | --- | --- |
| S1 | **Header pill trong suốt 96% nên chữ phía sau hiện mờ** ("chữ ma") khi cuộn, và eyebrow của section bị pill che khi cuộn tới đầu section | `ux-mobile-home-04/05`, `ux-mobile-course-detail`, `ux-mobile-blog-article`, `ux-mobile-contact` | Mọi trang, nặng nhất khi đọc bài/khóa học |
| S2 | **Không có khoảng bù cho header cố định**: section đầu tiên và các mỏ neo (#tu-van, #dang-ky) nằm dưới header | đo `scroll-margin-top` chỉ áp cho `section[id]`; các khối con không có | Mọi trang |
| S3 | **Nút cuộn lên đầu trang đè nội dung** (56px, góc phải dưới) | `ux-mobile-blog-article`, `ux-mobile-contact`, `ux-mobile-service-detail` | Trang dài |
| S4 | **Nhịp dọc không đều**: khoảng trống 200–300px giữa các khối, có khối cao 2.400px+ | `ux-mobile-xem-ngay`, `ux-mobile-service-detail`; đo `tallSections` ở nhiều route | Toàn site |
| S5 | **Nền tối/sáng cắt ngang đột ngột** giữa hai section | `ux-mobile-contact` (sáng → tím → sáng), `ux-mobile-blog-article` | Trang có xen kẽ section |

Ngoài ra đo được: **tap target < 40px xuất hiện 15 lần ở trang chủ, 27 lần ở /blog, 18 lần ở /khoa-hoc, 12 lần ở /tra-cuu/mbti**; chữ < 11px có ở mọi trang (2–5 chỗ/trang).

---

## 2. P0 — Lỗi chặn đọc nội dung (sửa trước, ảnh hưởng mọi trang)

### P0.1 — Header: bù chỗ, tự ẩn khi cuộn xuống, gọn lại trên mobile
**File:** `src/components/layout/SiteHeader.tsx`, `src/styles/nav.css`, `src/styles/responsive.css`, `src/styles/global.css`

- Đo chiều cao header thật (mobile hiện ~64–70px) và ghi vào CSS var: `document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`)` bằng `ResizeObserver` trong `SiteHeader`.
- Dùng biến đó cho: `html { scroll-padding-top: calc(var(--header-h) + 12px) }`, `:target, section[id], [id] { scroll-margin-top: calc(var(--header-h) + 16px) }`.
- **Tự ẩn khi cuộn xuống, hiện khi cuộn lên** (mobile + tablet): `translateY(-110%)` khi `scrollY` tăng và > 200px; hiện lại khi cuộn lên hoặc dừng 400ms. Điều này xoá hẳn hiệu ứng “chữ ma” sau pill và trả lại ~70px chiều cao.
- Khi hiện lại, đổi nền pill sang đặc 100% (`background: #fff`) và tăng bóng để không nhìn xuyên chữ.
- **Sắp xếp lại header mobile**: `[logo] … [hamburger]`, bỏ nút login icon-mũi-tên đang nằm trái logo; đưa “Đăng nhập/ Tài khoản” vào trong drawer (mục cuối) kèm nhãn rõ.
- Bỏ hoặc thu nhỏ thanh progress gradient trên mobile (hiện là một vạch tím lơ lửng dưới pill, trông như lỗi): chỉ hiện ≥768px, cao 2px, sát mép trong pill.

**Nghiệm thu:** mọi route, tại 390px: đo khoảng cách header-bottom → phần tử nội dung đầu tiên ≥ 8px khi ở vị trí cuộn tự nhiên; ảnh chụp 3 màn không còn chữ mờ sau header; tap target của nút menu/login ≥ 44px.

### P0.2 — Nút “lên đầu trang” không được đè nội dung
**File:** `src/components/ui/ScrollToTop.tsx`, `src/styles/final.css` (hoặc `admin.css`)

- Kích thước 44px trên mobile (hiện 56px), lệch phải 12px, đáy `calc(16px + safe-area)`.
- Ẩn khi có `.detail-sticky` đang hiện (dùng `:has()` hoặc class body `has-sticky-cta`), ẩn khi cách đáy trang < 120px.
- Đảm bảo không chồng lên mục lục/bảng ở cuối bài.

### P0.3 — Trang chủ, khối “Kết quả sẽ hiển thị tại đây” chiếm gần 1 màn hình
**File:** `src/pages/public/NumerologyPage.tsx` (khối empty state)

- Mobile: thu thành dải mỏng cao ≤ 96px (icon 24px + 2 dòng chữ + link “Xem ví dụ kết quả”), chỉ mở rộng khi có kết quả.
- Desktop: giữ nguyên panel lớn.

### P0.4 — Lỗi hiển thị hướng dẫn nội bộ cho khách ở trang Liên hệ
**File:** `src/pages/public/AboutPages.tsx` (khối `map` trong BlockRenderer)

- Khi `settings.contact.mapEmbed` rỗng: **không** hiển thị “Vào CMS → Cài đặt website → …”. Thay bằng khối thân thiện: “Bản đồ đang được cập nhật” + địa chỉ + nút “Chỉ đường” (Google Maps search URL từ địa chỉ).
- Hướng dẫn cấu hình chỉ hiện trong CMS (Site Settings), không ở public.

### P0.5 — Thẻ khóa học trùng dữ liệu và chip bị bóp
**File:** `src/pages/public/CoursesPages.tsx` (meta card), `src/styles/pages.css`

- Meta hiện in `durationLabel · sessionCount buổi` → trùng khi `durationLabel` đã là “8 buổi”. Sửa: chỉ hiển thị `durationLabel` nếu có, ngược lại `${sessionCount} buổi`; thêm cấp độ bằng badge riêng.
- Mobile ≤560px: card 1 cột, ảnh bìa tỉ lệ 16/10 phía trên, chip cấp độ 1 dòng (không wrap), ẩn mô tả dài sau “Xem chi tiết”.

### P0.6 — Sticky bar form CMS che field cuối
**File:** `src/components/admin/ResourceForm.tsx`, `src/pages/admin/SettingsPage.tsx`, `src/styles/admin.css`

- Đo chiều cao `.admin-form__bar` và bù `padding-bottom` cho form (như cách trang chi tiết khóa học đã làm).
- Toast hiện chồng lên sticky bar: đẩy `.toast-stack` lên trên bar khi bar đang hiện (đặt `bottom: calc(var(--admin-bar-h) + 16px)`).

### P0.7 — Admin login: dòng gợi ý wrap lỗi
**File:** `src/pages/admin/AdminLoginPage.tsx`

- Dòng “Tài khoản đầu tiên tạo bằng lệnh `npm run create-admin`” đang dùng flex 2 cột → chuyển thành `<p>` thường, lệnh bọc `<code>`, không dùng flex ngang.

---

## 3. P1 — Sửa theo section / page

### 3.1 Trang chủ

| Section | Vấn đề (ảnh) | Cách sửa | File |
| --- | --- | --- | --- |
| Hero | Form chiếm gần 2 màn hình mobile; 3 chip tin cậy + 2 CTA đẩy form xuống dưới màn đầu | Giảm `padding-top` hero mobile còn ~64px; rút 2 CTA thành 1 hàng 2 nút nhỏ; chip tin cậy chuyển thành 1 dòng cuộn ngang | `hero.css`, `HeroSection.tsx` |
| Tools | Tab 3 mục wrap 2 hàng, gạch chân lệch; lưới 4 card 2 cột bị bóp (`01`) | Tab → thanh cuộn ngang 1 hàng (`overflow-x:auto`, `scroll-snap`), nhãn ngắn: “Chỉ số”, “Miễn phí”, “Phong thủy”; lưới 1 cột ≤560px, card dạng hàng ngang (icon trái, tiêu đề + nút phải) | `tools-numbers.css`, `ToolsSection.tsx` |
| Numbers | 11 tab số wrap 2 hàng; đoạn luận giải dài 1.200px | Tab số → cuộn ngang; nội dung cắt còn 4 dòng + “Đọc thêm” trên mobile | `tools-numbers.css`, `NumbersSection.tsx` |
| About | Ảnh Pythagoras lớn, 3 giá trị + journey line cao | Mobile: ảnh max-height 260px, bỏ journey line hoặc chuyển thành 2×2 gọn | `content.css`, `AboutSection.tsx` |
| Methods | 3 card cao, eyebrow bị header che | Card dạng ngang (badge 64px + text), khoảng cách section 56px | `content.css`, `MethodsSection.tsx` |
| Programs | Badge số “01” đè ảnh; card cao ~500px; nút CTA full-width | Đưa số vào góc card không chồng ảnh; mobile: ảnh trái 88px + nội dung phải, CTA căn trái; 6 card → 3 card + “Xem tất cả 11 khóa học” | `content.css`, `ProgramsSection.tsx` |
| Blog | Carousel peek nhỏ, không affordance, card cao | Mobile: danh sách 1 cột 3 bài (ảnh 16/9 trên, tiêu đề dưới) + link “Xem tất cả”; desktop giữ bento | `content.css`, `BlogSection.tsx` |
| Consultation | Form 5 field cao; thiếu cam kết thời gian phản hồi | Gộp Họ tên + Điện thoại 1 hàng; thêm dòng “SGEN phản hồi trong 24h làm việc” | `final.css`, `ConsultationSection.tsx` |

### 3.2 Trang công cụ / tra cứu

| Page | Vấn đề | Cách sửa | File |
| --- | --- | --- | --- |
| `/tra-cuu/than-so-hoc` | Empty state chiếm 1 màn (P0.3); form 3 field + checkbox dài; thiếu bước “xem ví dụ” | Gộp empty state; checkbox consent rút 1 dòng; thêm link “Xem ví dụ một bản đồ số học” | `NumerologyPage.tsx`, `pages.css` |
| `/tra-cuu/disc`, `/tra-cuu/mbti` | Chọn đáp án bằng `<select>` to, khó quét mắt; nút “Bước trước” trông như disabled; thanh tiến độ bị header che | Chuyển sang **radio dạng card** (1 hàng, chọn là highlight); nút phụ đổi sang viền đậm hơn; progress dính dưới header bằng `top: var(--header-h)` | `QuizRunner.tsx`, `pages.css` |
| `/cong-cu-phong-thuy/xem-ngay` | Khoảng trống lớn giữa khối; bảng giờ lặp nhãn; không thấy ngày đang xem khi cuộn | Dải “ngày đang xem + điều hướng ±1 ngày” dính trên; bảng giờ 1 cột mobile có nhãn giờ + điểm; bỏ nhãn lặp | `CalendarToolView.tsx`, `FengShuiPages.tsx`, `fengshui-tools.css` |
| `/cong-cu-phong-thuy/gieo-que-kinh-dich`, `.../tu-tru-bat-tu` | Form nhập dài, kết quả nằm dưới xa | Sau khi bấm, tự cuộn tới kết quả + nút “Về đầu công cụ” | `IChingToolView.tsx`, `BaziToolView.tsx` |
| `/free-tools` | Hub dài ~8.000px, khó tìm công cụ | Thêm ô tìm kiếm + nhóm thu gọn (accordion) + mỏ neo; mobile 1 cột | `FreeToolsPages.tsx` |

### 3.3 Catalog và nội dung

| Page | Vấn đề | Cách sửa | File |
| --- | --- | --- | --- |
| `/khoa-hoc` | Meta trùng (P0.5); bộ lọc là dãy chip hàng ngang chiếm 2 hàng | Gom lọc vào 1 popover “Bộ lọc (n)” như CMS, giữ chip đã áp dụng; mobile 1 cột card | `CoursesPages.tsx`, `pages.css` |
| `/khoa-hoc/:slug` | Cardinal “01/02/03” lệch khỏi chữ và bị cắt; sticky CTA đang **2 hàng, cao 169px** (đo ở 390px); nhãn “KHÓA HỌC PHÙ HỢP VỚI AI” quá to | Sửa grid list (số 28px + gap 12px, không absolute); sticky CTA 1 hàng: giá + nút chính (flex 1) + icon chia sẻ/hotline; hạ cấp heading phụ xuống 1.05rem | `CoursesPages.tsx`, `forms.css`, `pages.css` |
| `/blog` | Card 2 chip tag + ảnh, cột bị bóp | Mobile: list 1 cột, tag tối đa 1, hiện ngày + phút đọc trên 1 dòng | `BlogPages.tsx`, `pages.css` |
| `/blog/:slug` | Mục lục nằm **sau** toàn bộ bài (đo: bài 1006–1961px, mục lục bắt đầu 1985px); dark card “Công cụ liên quan” lệch tông | Đưa mục lục lên ngay sau excerpt, dạng `<details>` thu gọn trên mobile; đổi card CTA sang nền sáng | `BlogPages.tsx`, `pages.css` |
| `/dich-vu` + `/:slug` | Nhiều khoảng trống; thẻ quyền lợi nhồi chữ; thiếu so sánh gói | Thêm bảng so sánh 3 gói (desktop) / danh sách gọn (mobile); thẻ quyền lợi 2 cột mobile; giảm khoảng cách section | `ServicePages.tsx`, `pages.css` |
| `/lien-he` | Nền cắt ngang; card 2 cột nhồi; hướng dẫn CMS lộ ra (P0.4) | Section liên hệ dùng 1 nền sáng; card thông tin 1 cột mobile; thêm nút Zalo/gọi | `AboutPages.tsx`, `BlockRenderer.tsx`, `pages.css` |
| Trang giới thiệu | Block cards/timeline spacing rộng, thiếu breadcrumb | Chuẩn hoá `--section-space` mobile 56px; thêm breadcrumb ở đầu trang | `BlockRenderer.tsx`, `pages.css` |

### 3.4 CMS (mobile)

| Màn | Vấn đề (ảnh `ux-mobile-admin-courses`) | Cách sửa | File |
| --- | --- | --- | --- |
| Bảng dữ liệu | Cột bị bóp, chữ wrap 3 dòng, cột sau bị cắt không có chỉ báo cuộn | ≤768px: chuyển `DataTable` sang **card list** (mỗi hàng thành card có nhãn–giá trị, ẩn cột phụ); desktop giữ bảng | `DataTable.tsx`, `admin.css` |
| Sidebar | Mở sidebar không có overlay, không khoá cuộn nền | Thêm overlay mờ + `body` khoá cuộn khi mở | `AdminLayout.tsx`, `admin.css` |
| Settings | Sticky bar che field (P0.6); tab 8 mục chiếm 3 hàng | Tab cuộn ngang 1 hàng; bar cao 64px + bù padding | `SettingsPage.tsx`, `admin.css` |
| Form dài | Nút Lưu/Huỷ chìm, thiếu nhãn trạng thái | Bar có nhãn “Đã lưu lúc …” + nút phụ nhỏ hơn | `ResourceForm.tsx`, `admin.css` |

---

## 4. P2 — Design system và chi tiết nhỏ (làm sau, rẻ)

1. **Chuẩn hoá nút**: hiện có 40/42/46/50/52/58px. Đặt 3 cỡ: `sm 36`, `md 44`, `lg 52`; mobile mọi nút chính ≥ 48px.
2. **Chữ nhỏ**: nâng sàn 12px cho mọi nhãn/chip/meta trên mobile (hiện có 10–11px). Bớt lạm dụng CHỮ HOA ở heading phụ — chỉ giữ uppercase cho eyebrow.
3. **Khung ảnh chương trình**: ảnh hiện 96×107, 96×111, 96×113 → ép khung vuông 1:1 + `object-fit: cover`.
4. **Tap target**: danh sách < 40px (chip tag, nút chấm carousel, link breadcrumb) → thêm padding dọc để đạt 44px.
5. **Focus ring**: kiểm tra tab-order và viền focus trên nền tối (một số nút dùng viền trắng mờ, không thấy khi focus bàn phím).
6. **Empty/loading**: đồng nhất khối empty state (icon 32px, tiêu đề 1 dòng, mô tả 1–2 dòng, 1 CTA).
7. **Ảnh minh hoạ trùng**: numeral/method/program có ảnh tối giống nhau ở 3 khu vực — cân nhắc dùng ảnh khác nhau để phân biệt ngữ cảnh.

---

## 5. Thứ tự thực hiện đề xuất

| Đợt | Nội dung | Ghi chú |
| --- | --- | --- |
| 1 | P0.1 → P0.7 | Sửa ở file layout/CSS dùng chung; mọi trang hưởng lợi ngay |
| 2 | Trang chủ (3.1) + P0.5 | Đây là mặt tiền, khách xem đầu tiên |
| 3 | Công cụ & tra cứu (3.2) + catalog (3.3) | Nhóm trang tạo giá trị chính |
| 4 | CMS mobile (3.4) | Nội bộ, có thể song song đợt 3 |
| 5 | P2 design system | Dọn cuối, tránh sửa lại nhiều lần |

Mỗi đợt đều phải chụp lại ảnh 390/768/1440 cho các màn bị ảnh hưởng để so sánh trước–sau.

## 6. Nghiệm thu chung cho từng đợt

- Đo tự động ở 390px: không phần tử nội dung nào nằm sau header ở vị trí cuộn tự nhiên (khoảng cách ≥ 8px).
- Tap target: 100% phần tử tương tác ≥ 44×44px (hiện: 15–27 vi phạm/trang ở trang chủ, /blog, /khoa-hoc).
- Không còn cặp giá trị trùng trong meta card khóa học.
- Không còn nội dung hướng dẫn nội bộ (CMS, env) xuất hiện trên trang công khai.
- Chiều cao trang chủ mobile giảm ≥ 25% (hiện ~12.000px) sau đợt 2.
- Ảnh chụp lại từng màn ở 390/768/1440 lưu trong `artifacts/screenshots/` để đối chiếu.

---

## Kết quả triển khai (cập nhật sau khi sửa)

| Nhóm | Trước | Sau |
| --- | --- | --- |
| Tràn ngang (390px) | 0 route | 0 route (giữ nguyên) |
| Chiều cao trang chủ mobile | 12.063px | ~9.475px (−21%) |
| Vùng chạm < 44px (trang chủ / blog / khóa học) | 15 / 27 / 18 | 0 / 0 / 0 |
| Chữ < 12px (trang chủ / liên hệ / xem ngày) | 3 / 4 / 20 | 0 / 0 / 1 |
| Header đè nội dung (/tra-cuu/than-so-hoc) | −23px | +13px |
| Thanh CTA khóa học mobile | 169px (2 hàng) | 69px (1 hàng) |
| Mục lục bài viết | sau nội dung (1985px) | trước nội dung |
| Trang Liên hệ lộ hướng dẫn CMS | có | không |
| Meta thẻ khóa học | “8 buổi · 8 buổi” | “8 buổi · 2.900.000 đ” |

Đã sửa thêm hai lỗi nền phát hiện trong quá trình làm:
1. `.app-shell { overflow: hidden }` tạo scroll container và vô hiệu hoá mọi `position: sticky` bên trong → đổi sang `overflow-x: clip`.
2. Nền header bán trong suốt gây “chữ ma” khi cuộn → nền đặc khi header hiển thị, kèm tự ẩn khi cuộn xuống.

Còn lại (mức nhỏ, không chặn): vài nhãn eyebrow ~11px ở trang bài viết và widget “Khóa học liên quan”.
