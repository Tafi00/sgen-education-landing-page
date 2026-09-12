# SGEN Education — website + CMS (PostgreSQL)

Website SGEN Education (Thần số học, DISC/MBTI, phong thủy ứng dụng) kèm CMS quản trị nội dung trên MongoDB.
Giao diện công khai giữ nguyên bố cục landing page cũ; các module nội dung đọc từ CMS và có bản dự phòng trong repo.

## Kiến trúc

- `src/` — React 19 + TypeScript + react-router v7 (SPA, tải trang theo nhu cầu).
- `shared/` — engine dùng chung cho cả client và server: `numerology.ts`, `menh-thu/*` (âm lịch, tứ trụ, quẻ dịch, hồ sơ ngày), `sim/` (luận sim), `quiz/` (DISC, MBTI).
- `server/` — Express + Mongoose: API công khai, API quản trị, upload ảnh, thông báo lead, phục vụ `dist/` và `/uploads`.
- `public/assets/` — ảnh tĩnh dùng chung; ảnh tải lên nằm trong `UPLOAD_DIR` và được phục vụ tại `/uploads/...`.

## Chạy dự án

```bash
npm install
cp .env.example .env          # điền MONGODB_URI và các khoá
npm run seed                  # nạp nội dung mặc định (11 khóa học, 12 bài blog, 5 trang, 3 gói dịch vụ, đề DISC/MBTI)
ADMIN_EMAIL=admin@sgen.vn npm run create-admin   # tạo admin đầu tiên, mật khẩu in ra một lần
npm run dev                   # Vite (5173) + API (4000)
```

Không có MongoDB sẵn? Chạy `npm run dev:memory` để dùng MongoDB tạm trong bộ nhớ (đã seed sẵn, mất dữ liệu khi dừng).

### Lệnh thường dùng

| Lệnh | Việc |
| --- | --- |
| `npm run dev` | Chạy song song website + API |
| `npm run dev:memory` | API + CMS với MongoDB trong bộ nhớ, tự seed |
| `npm run build` | Typecheck, build SPA và bundle server vào `dist-server/` |
| `npm start` | Chạy bản production (phục vụ `dist/`, `/uploads`, `/sitemap.xml`) |
| `npm run seed` | Nạp nội dung mặc định, không ghi đè nội dung đã sửa (`seed:force` để ghi đè) |
| `npm run create-admin` | Tạo/đặt lại mật khẩu admin đầu tiên |
| `npm run smoke` | Kiểm thử end-to-end API trên MongoDB tạm: seed, tra cứu, lead, upload, đơn hàng, phân quyền |
| `npm test` | Unit test engine dùng chung (vitest) |
| `npm run typecheck` | Typecheck app + server |

## Phân quyền

- `/admin` — CMS, yêu cầu đăng nhập. Hai vai trò: `admin` (toàn quyền, gồm người dùng/cài đặt/đơn hàng) và `editor` (nội dung: khóa học, blog, trang, media, trắc nghiệm, dịch vụ).
- `/tai-khoan` — khu vực thành viên: lịch sử tra cứu, đơn hàng, quyền nội dung trả phí.
- Mật khẩu băm bằng bcrypt; phiên lưu trong MongoDB qua cookie httpOnly; thao tác ghi yêu cầu mã CSRF.

## Thông báo lead

Resend và Telegram được cấu hình trong `/admin/cai-dat` (không dùng biến môi trường):

1. Bật kênh, nhập API key/bot token và người nhận. Secret được mã hoá AES-256-GCM khi lưu, chỉ trả về dạng mask; bỏ trống ô nhập nghĩa là giữ nguyên giá trị cũ.
2. Nút “Gửi thử thông báo” kiểm tra từng kênh và ghi kết quả vào `/admin/thong-bao`.
3. Lead luôn được lưu vào MongoDB trước; lỗi gửi thông báo không làm hỏng lượt gửi của khách và được ghi lại kèm nút gửi lại.

## Nội dung và dữ liệu

- Nội dung công khai đọc từ MongoDB; nếu API/CSDL chưa sẵn sàng, giao diện tự dùng bộ dữ liệu trong `src/data/defaults/` nên trang không trắng.
- `npm run seed` là idempotent: chỉ tạo bản ghi còn thiếu, không ghi đè nội dung đã chỉnh trong CMS.
- Ảnh tải lên lưu trong `UPLOAD_DIR`, sinh biến thể WebP (480/960/1920) và phục vụ công khai tại `/uploads/...`; MongoDB chỉ giữ đường dẫn.

## CMS quản trị (/admin)

Khung quản trị theo chuẩn dashboard: sidebar nhóm chức năng có **tìm nhanh menu** và **thu gọn/mở rộng** (nhớ trạng thái), topbar có tên trang + **breadcrumb** + link **Mở website**, nội dung nền sáng dễ đọc lâu.

| Nhóm | Module |
| --- | --- |
| Tổng quan | Bảng điều khiển: 9 thẻ số liệu (kèm doanh thu đã xác nhận và so sánh tuần này/tuần trước), cảnh báo cấu hình, **Việc cần làm**, **Hoạt động gần đây** |
| Nội dung | Khóa học, Nhóm khóa học, Blog, Chuyên mục, Trang nội dung, Khối trang chủ, Dịch vụ, Thư viện ảnh |
| Kinh doanh | Leads, Báo cáo tra cứu, Đơn hàng, Quyền nội dung, Thành viên |
| Trắc nghiệm | Bộ câu hỏi, Câu hỏi (kèm phương án), Luận giải kết quả |
| Hệ thống | Nhật ký hoạt động, Lịch sử thông báo, Cài đặt website, Tài khoản quản trị |

Điểm đáng chú ý:

- **Danh sách**: header bảng dính khi cuộn, skeleton khi tải, tổng kết “Đang hiển thị n / tổng bản ghi”, **hành động theo dòng** (Sửa · Xem trên web · Ẩn/Hiện · Xoá), chọn nhiều để xử lý hàng loạt, xuất CSV cho Leads, lọc trong một popover có chip + số lượng, toàn bộ trạng thái nằm trên URL.
- **Cột quan hệ hiển thị nhãn** (bộ đề, thành viên…) thay vì ObjectId.
- **Form**: chia tab theo nhóm (Thông tin chung / Nội dung / Giá & xuất bản / SEO), bộ đếm ký tự, **xem trước trên Google**, khối tổng hợp lỗi có link nhảy tới trường, thanh hành động dính đáy có trạng thái lưu (“Chưa lưu thay đổi” · “Đang lưu…” · “Đã lưu lúc …”), nút Lưu tắt khi không có thay đổi, nút “Xem trên web”.
- **Ảnh**: ô ảnh trong form có xem trước, tải tệp mới, **chọn từ thư viện** (hộp thoại có tìm kiếm/lọc/phân trang) và xoá; thư viện ảnh có kéo-thả nhiều tệp kèm tiến độ, sửa alt tại chỗ, sao chép đường dẫn, xoá từng tệp hoặc hàng loạt, chuyển chế độ lưới/bảng.
- **Nhật ký hoạt động**: ghi lại đăng nhập, cập nhật cài đặt, duyệt đơn và thay đổi nội dung; lọc theo hành động hoặc bản ghi; chi tiết hiển thị dạng nhãn–giá trị.
- Phân quyền: `admin` toàn quyền; `editor` chỉ nhóm nội dung (không thấy Cài đặt, Đơn hàng, Thành viên, Tài khoản quản trị).

## Trang chi tiết

| Trang | Nội dung chính |
| --- | --- |
| `/khoa-hoc/:slug` | Chip thông tin (cấp độ, số buổi, thời lượng, hình thức, giảng viên), khối nội dung soạn trong CMS, đề cương, kết quả đạt được, đối tượng phù hợp, FAQ, form đăng ký, khóa cùng nhóm, chia sẻ liên kết, thanh CTA cố định trên mobile |
| `/dich-vu/:slug` | Giá và mức tiết kiệm, quyền lợi kèm theo (VIP/trọn đời), chính sách hoàn tiền, quy trình mua 4 bước, gói khác, form đặt mua + VietQR, trang trạng thái đơn có tải biên lai |
| `/blog/:slug` | Metadata (tác giả, ngày, thời lượng đọc, chuyên mục, nhãn nổi bật), thẻ tag, chia sẻ, mục lục có scroll-spy, bài trước/kế, bài liên quan theo chuyên mục và tag |
| `/admin/thanh-vien/:id` | 4 tab: hồ sơ, quyền nội dung (cấp/thu hồi), đơn hàng, lịch sử tra cứu; khu hành động nguy hiểm (khoá, đặt lại mật khẩu, xoá) |
| `/admin/leads/:id` | Thông tin khách, dữ liệu tra cứu dạng bảng, trạng thái thông báo, người phụ trách, báo cáo và đơn hàng liên quan, gửi lại thông báo, xuất CSV |
| `/admin/don-hang/:id` | Thông tin đơn, biên lai, thành viên liên kết, quyền đã cấp, dòng thời gian trạng thái, duyệt/huỷ/cấp/thu hồi quyền |
| `/admin/tra-cuu` và `/admin/tra-cuu/:id` | Danh sách báo cáo tra cứu có bộ lọc, chi tiết dựng lại đúng khối kết quả công khai |

Trình soạn nội dung trong CMS: khối trang (thêm/xoá/đổi thứ tự, sửa văn bản, danh sách mục dạng JSON có kiểm tra), câu hỏi trắc nghiệm kèm đáp án (mã, nội dung, nhóm/cực), chọn thành viên và bộ đề bằng dropdown thay vì dán ID.

## Trạng thái UX sau rà soát mobile

Đợt sửa UX/UI (chi tiết trong `docs/ux-fix-plan.md`) đã hoàn tất 4 nhóm việc chính:

- **Header**: đo chiều cao thật vào `--header-h`, tự ẩn khi cuộn xuống và hiện lại khi cuộn lên (mobile/tablet), nền đặc khi hiển thị, logo trái – menu phải, tài khoản/hotline chuyển vào drawer.
- **Nhịp dọc – vùng chạm – cỡ chữ**: `--section-space` mobile còn ~48–68px, sàn chữ 12px cho nhãn/meta, vùng chạm ≥44px, nút chính ≥48px, focus bàn phím nhìn thấy rõ.
- **Trang chủ**: tab công cụ và dãy số cuộn ngang 1 hàng, thẻ công cụ 1 cột dạng hàng ngang, chương trình còn 3 thẻ + nút xem tất cả, blog dạng danh sách, ảnh và khoảng cách gọn lại (chiều cao mobile 12.063px → ~9.475px).
- **Trang công cụ/catalog/CMS**: empty state thần số học thu còn ≤96px, DISC/MBTI chọn đáp án bằng thẻ radio, thanh tiến độ dính dưới header, Xem ngày có dải ngày dính + bảng giờ 1 cột, bộ lọc khóa học gom vào popover, mục lục bài viết lên trước nội dung, thanh CTA khóa học còn 1 hàng 69px, bảng CMS chuyển dạng thẻ trên mobile, sidebar có overlay và khoá cuộn.

Đo lại ở 390px trên 23 route: **không route nào tràn ngang**, tổng vùng chạm dưới 44px giảm từ 100+ xuống còn vài link phụ, chữ dưới 12px gần như đã xử lý hết.

## Triển khai production

Repo có sẵn `Dockerfile` (2 giai đoạn: build Vite + esbuild, runtime chỉ giữ dependencies production).

```bash
docker build -t sgen-education .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/postgres" \
  -e PUBLIC_ORIGIN="https://your-domain" \
  -e SESSION_SECRET="<chuỗi ngẫu nhiên ≥ 32 ký tự>" \
  -e SETTINGS_ENC_KEY="<chuỗi ngẫu nhiên ≥ 32 ký tự>" \
  -v sgen_uploads:/app/uploads \
  sgen-education
```

- Tiến trình tự áp schema PostgreSQL khi khởi động (`server/src/db/schema.sql`, idempotent).
- Nạp nội dung mặc định và tạo admin đầu tiên ngay trong container:

```bash
node dist-server/seed.js
ADMIN_EMAIL=admin@domain ADMIN_PASSWORD='<mật khẩu mạnh>' node dist-server/create-admin.js
```

- Volume `/app/uploads` là **bắt buộc** nếu muốn giữ ảnh đã tải lên qua các lần deploy.
- Biến môi trường bắt buộc khi chạy thật: `DATABASE_URL`, `PUBLIC_ORIGIN`, `SESSION_SECRET`, `SETTINGS_ENC_KEY`.

## Ghi chú vận hành

- Bảng năng lượng ngày trong `shared/menh-thu/reference-day-energy.generated.ts` phủ 01/01/2026–31/12/2028; ngoài khoảng này công cụ Xem ngày vẫn chạy bằng bộ luật tính toán chung (không có điểm năng lượng tham chiếu).
- Dữ liệu tra cứu chỉ lưu khi người dùng bấm lưu/chia sẻ; link chia sẻ có token và hết hạn sau 30 ngày. Thành viên có thể xoá dữ liệu cá nhân trong `/tai-khoan`.
- Giá trong dữ liệu seed và nội dung 5 khóa học mới là bản tạm — cần khách xác nhận trước khi công bố.
