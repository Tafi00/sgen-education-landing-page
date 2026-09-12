# Tự đánh giá: đối chiếu yêu cầu khách hàng với bản hiện tại

> **Đính chính 12/09/2026** — bản audit mới và đầy đủ hơn ở `docs/audit-toan-dien.md`. Ba điểm trong tài liệu này đã không còn đúng:
> 1. Mục 12 (AGENTS.md) ghi “editor không truy cập orders/members/audit” — thực tế **editor đọc và xoá được** các module đó qua API (xem P0-2 trong audit mới).
> 2. Mục 12 ghi “0 vùng chạm < 44px” — còn link email ở footer cao 20px trên mọi trang (P2-6).
> 3. Mục 11 ghi “chữ dưới 12px gần như đã xử lý hết” — còn 2–7 chỗ/trang mobile (P2-5).

Ngày rà: 12/09/2026. Cách kiểm: đọc lại feedback gốc, đối chiếu code, chạy trình duyệt thật (390×844 và 1440×900), chạy `npm run smoke` / `npm test` / `npm run typecheck` / `npm run build`.
Mức đánh giá: **Đạt** · **Đạt một phần** · **Chưa đạt**. Mọi mục "Đạt" đều có bằng chứng đo được, không đánh giá theo cảm tính.

---

## 1. GIAO DIỆN — ô tra cứu nền trắng

**Mức: Đạt.**

| Yêu cầu | Thực tế | Bằng chứng |
| --- | --- | --- |
| Ô tra cứu nền trắng để trang không tối, không mỏi mắt | Toàn bộ ô nhập dùng token `--field-bg: #ffffff`, chữ `#1b1a35`, `color-scheme: light` | Audit 102/102 ô trên 14 route (desktop + mobile) đều `rgb(255,255,255)`, tương phản chữ thấp nhất 16.86:1 |
| "Hoặc ô màu trắng nền màu đất nhạt" (tham chiếu simkinhdich) | Khối ảnh trong CMS dùng nền `#faf7f1` (đất nhạt), các ô tra cứu công khai dùng trắng tuyệt đối | `src/styles/forms.css` (`--field-bg-soft`) |
| Tham chiếu 2 site còn lại | Đã đối chiếu: tracuuthansohoc (ô trắng trên nền sáng), thayphongthuy.vn (ô trắng, chữ đậm) | `artifacts/screenshots/verification-*.png` |

Lỗi phát sinh đã sửa trong quá trình làm: nhãn field trên nền tối từng có tương phản 2.0:1 → nay 53/53 nhãn và 5/5 gợi ý đạt ≥4.5:1.

---

## 2. THANH CÔNG CỤ — 9 menu cấp 1

**Mức: Đạt (một điểm khác biệt nhỏ cần khách xác nhận).**

| Menu khách yêu cầu | Route | Trạng thái |
| --- | --- | --- |
| GIỚI THIỆU | `/gioi-thieu` + 4 mục con | Đạt |
| TRA CỨU THẦN SỐ HỌC | `/tra-cuu` + 3 công cụ | Đạt |
| DỊCH VỤ | `/dich-vu` + 3 gói | Đạt một phần (xem mục 5) |
| PHONG THỦY SIM SỐ ĐIỆN THOẠI | `/sim-phong-thuy/boi-sim` | Đạt |
| CÔNG CỤ PHONG THỦY | `/cong-cu-phong-thuy` + 3 công cụ | Đạt |
| KHÓA HỌC | `/khoa-hoc` | Đạt |
| FREE TOOLS | `/free-tools` | Đạt |
| BLOG | `/blog`, `/blog/kien-thuc` | Đạt |
| ĐĂNG NHẬP | `/dang-nhap`, `/dang-ky`, `/tai-khoan` | Đạt |

Khác biệt: "Đăng nhập" đặt ở cụm riêng góc phải thanh header (kèm nút hotline) thay vì nằm trong dãy 8 menu nội dung — cần khách xác nhận hoặc gộp vào dãy.

---

## 3. GIỚI THIỆU (Tầm nhìn / Sứ mệnh / Giá trị cốt lõi / Liên hệ)

**Mức: Đạt.**

- 4 trang riêng: `/gioi-thieu/tam-nhin`, `/gioi-thieu/su-menh`, `/gioi-thieu/gia-tri-cot-loi`, `/lien-he` + trang hub `/gioi-thieu`; nội dung soạn trong CMS (khối `richText`, `cards`, `timeline`, `values`, `cta`, `faq`, `contactInfo`, `map`).
- Trang Liên hệ: thông tin công ty, giờ làm việc, form gửi lead (lưu Mongo + thông báo), breadcrumb, khối bản đồ có nút "Chỉ đường".
- Đã sửa lỗi nội dung: trước đây khối bản đồ rỗng in hướng dẫn nội bộ ("Vào CMS → Cài đặt…") ra trang công khai — nay thay bằng khối thân thiện.
- Sự cố bạn gặp: trang Giới thiệu hiện render bình thường ở cả dev và production (đã sweep 31 route, 9 link trong mục Giới thiệu, 0 lỗi). Lỗi trước đó là màn hình overlay khi file đang được sửa; đã bổ sung **trang lỗi có lối thoát** (nút tải lại, về trang chủ, gọi SGEN) thay cho màn hình trắng "Unexpected Application Error".

---

## 4. TRA CỨU THẦN SỐ HỌC (Thần số học / DISC / MBTI)

**Mức: Đạt (sâu hơn mức tham chiếu).**

- Thần số học: 8 chỉ số, form có tên thường dùng, kết quả lưu + link chia sẻ có token, empty state gọn trên mobile.
- DISC: 16 nhóm câu hỏi forced-choice (chọn giống nhất / ít giống nhất), 12 tổ hợp kết quả luận giải.
- MBTI: 48 câu theo 4 cặp xu hướng, 16 nhóm kết quả.
- Chấm điểm ở server (client không nhận được khoá đáp án) — đã kiểm bằng test khẳng định payload không chứa `dimension`/`pole`.
- Lưu ý pháp lý: đây là bộ đề **tự soạn theo khung tham chiếu**, không sao chép đề bản quyền; trang ghi rõ "không phải công cụ chẩn đoán tâm lý".

---

## 5. DỊCH VỤ (Mua VIP / Xem trọn đời / Định hướng nghề nghiệp)

**Mức: Đạt một phần — thiếu phần quan trọng nhất là nội dung trả phí.**

| Hạng mục | Trạng thái |
| --- | --- |
| 3 gói dịch vụ (VIP 90 ngày, trọn đời, định hướng nghề nghiệp) | Đạt |
| Trang chi tiết gói: giá gốc + % tiết kiệm, quyền lợi, đối tượng, quy trình 4 bước, gói khác, chính sách hoàn tiền | Đạt |
| Đặt mua: tạo đơn + mã đơn + VietQR + upload biên lai + trang trạng thái đơn | Đạt |
| Admin duyệt đơn → cấp quyền (entitlement) → thu hồi quyền | Đạt (đã kiểm bằng smoke test: duyệt đơn tạo entitlement) |
| **Nội dung trả phí (báo cáo VIP / bản đồ trọn đời)** | **Chưa đạt** — mới có hạ tầng quyền, chưa có trang nội dung chuyên sâu để khách trả tiền nhận được |
| Cổng thanh toán tự động | Chưa có (đang chuyển khoản + admin xác nhận theo thiết kế chờ khách chốt) |
| Giá | Là số tạm, cần khách xác nhận |

Đây là điểm tôi đánh giá **chưa thoả mãn**: khách mua VIP/trọn đời sẽ chưa nhận được gì khác ngoài việc "thấy quyền đã cấp" trong tài khoản.

---

## 6. PHONG THỦY SIM SỐ ĐIỆN THOẠI

**Mức: Đạt.**

- Trang giới thiệu phương pháp + phần mềm bói sim nhập số điện thoại, ngày/giờ sinh, giới tính.
- Kết quả gồm: **hình quẻ Kinh Dịch** (6 hào, quẻ chủ/hỗ/biến), ngũ hành dãy số (hành vượng/khuyết), âm dương, 5 lớp phương pháp có điểm và kết luận, đối chiếu bản mệnh (Nhật chủ, hành hỗ trợ), kèm cảnh báo mỗi trường phái luận một khác.
- Nhận diện nhà mạng, chuẩn hoá +84, chặn số không hợp lệ.
- Khác tham chiếu simkinhdich: chưa có danh mục sim để chọn/mua/so sánh (khách chưa yêu cầu; nếu muốn cần bổ sung danh mục + tồn kho + giá).

---

## 7. CÔNG CỤ PHONG THỦY (Gieo quẻ / Tứ Trụ / Xem ngày)

**Mức: Đạt.**

- Gieo quẻ Kinh Dịch: gieo 3 đồng xu, tự cuộn tới kết quả, luận quẻ chủ/biến/hào động, nút về đầu công cụ.
- Tứ Trụ Bát Tự: lá số 4 trụ (2×2 trên mobile), thập thần, nạp âm, vượng suy Nhật chủ, ngũ hành, 10 đại vận.
- Xem ngày (đã nâng theo tham chiếu thayphongthuy.vn): can chi năm/tháng/ngày, nạp âm ngày, tiết khí, âm lịch, thần trực/trực/28 tú, **hướng hỷ thần – tài thần – tam sát**, tuổi hợp/xung, sao tốt/xấu có mô tả, bảng 12 giờ kèm can chi giờ + lục nhâm + quý nhân/không vong/xung ngày + nên/kỵ, ghi chú phương pháp.
- Hạn chế đã biết: bảng dữ liệu tham chiếu năng lượng ngày phủ 01/01/2026–31/12/2028; ngoài khoảng này công cụ vẫn chạy bằng bộ luật chung (không có điểm năng lượng tham chiếu).

---

## 8. KHÓA HỌC

**Mức: Đạt về cấu trúc, chờ khách duyệt nội dung.**

- 11 khóa đúng danh sách khách liệt kê, mỗi khóa có trang chi tiết riêng (đề cương buổi, kết quả đạt được, đối tượng, FAQ, form đăng ký, khóa cùng nhóm, thanh CTA dính đáy trên mobile).
- Danh sách có tìm kiếm, lọc trong 1 popover, sắp xếp, phân trang, toàn bộ trạng thái nằm trên URL.
- Cần khách: duyệt đề cương/học phí và cấp **5 ảnh bìa thật** cho 5 khóa mới (đang dùng ảnh tạm).

---

## 9. FREE TOOLS

**Mức: Đạt** (đã chỉnh theo cách trình bày của tracuuthansohoc.com).

- Thanh mục lục 4 nhóm dính dưới header, cuộn ngang trên mobile.
- Nhóm "Tính nhanh chỉ số": 10 mục accordion **có form tính ngay tại chỗ** (8 chỉ số theo ngày sinh + 2 chỉ số theo tên), kết quả kèm luận giải ngắn và link xem chi tiết.
- Nhóm công cụ miễn phí khác: 4 công cụ dạng accordion có form tính ngay.
- Nhóm công cụ phong thủy: dẫn sang 3 công cụ.
- Khối "Ý nghĩa các con số" (1–9, 11, 22) với link xem chi tiết.
- Ô tìm kiếm lọc theo tên (không dấu).

---

## 10. BLOG

**Mức: Đạt về cấu trúc, chờ khách duyệt nội dung.**

- `/blog/kien-thuc` theo cấu trúc tham chiếu: chip chuyên mục (kèm số bài) → từng section chuyên mục có bài nổi bật, lưới bài, **hộp CTA công cụ theo chủ đề**, link "Xem thêm", khối giới thiệu cuối trang.
- `/blog`: tìm kiếm + chuyên mục + phân trang (URL state); `/blog/:slug`: metadata (tác giả, ngày, phút đọc), thẻ tag, chia sẻ, mục lục đặt trước nội dung có scroll-spy, bài trước/kế, bài liên quan theo chuyên mục và tag.
- Nội dung: 12 bài (6 chuyển từ landing page, 6 mới tự soạn) — cần khách duyệt và bổ sung thêm.

---

## 11. ĐĂNG NHẬP

**Mức: Đạt.**

- Thành viên: đăng nhập, đăng ký (có đồng ý xử lý dữ liệu), quên mật khẩu, `/tai-khoan` (hồ sơ, lịch sử tra cứu, đơn hàng, quyền nội dung), khoá tạm sau 5 lần sai, xoá dữ liệu cá nhân.
- Quản trị: `/admin` riêng, hai vai trò admin/editor, mật khẩu băm bcrypt, phiên lưu Mongo, CSRF cho mọi thao tác ghi, tài khoản đầu tiên tạo bằng `npm run create-admin` (không hardcode).

---

## 12. Quy tắc trong AGENTS.md

| Quy tắc | Mức | Ghi chú |
| --- | --- | --- |
| MongoDB (không Postgres/Prisma) | Đạt | Mongoose, 19 collection |
| Ảnh lưu `UPLOAD_DIR`, phục vụ `/uploads`, DB chỉ giữ `/uploads/...` | Đạt | Có sinh biến thể WebP; smoke test khẳng định file tồn tại trên đĩa và phục vụ công khai |
| Không base64 trong Mongo | Đạt | Ô ảnh trong CMS upload qua API thay vì nhúng base64 |
| Giữ UI landing page | Đạt | 8 section gốc giữ nguyên, chỉ tinh chỉnh responsive |
| Admin kế thừa ngôn ngữ thiết kế | Đạt | Dùng chung token màu/font, nền sáng cho dashboard |
| Bảo vệ mọi trang/API admin + vai trò admin/editor | Đạt | Smoke test: gọi API admin không phiên → 401; thiếu CSRF → 403 |
| Listing: search/sort/filter 1 popover/phân trang/URL state | Đạt | Áp cho cả 12 module CMS và danh sách khóa học, blog công khai |
| Detail: route riêng, card/tab, sticky bar, confirm, toast, empty/loading/error | Đạt | Trang chi tiết thành viên 4 tab; lead/đơn hàng có card + timeline |
| Ảnh: upload / xem trước / thay / xoá | Đạt | `ImageField` trong mọi form |
| Notification: Resend + Telegram cấu hình trong Site Settings, mask secret, lưu lead trước, không chặn lead, có gửi thử, nội dung có nguồn + link admin | Đạt | Smoke test: secret lưu dạng mã hoá `v1:…`, API chỉ trả mask; đổi secret mà bỏ trống thì giữ nguyên |
| Nội dung hardcode → seed, CMS không rỗng, public có fallback | Đạt | `npm run seed` tạo 11 khóa, 12 bài, 5 trang, 8 khối, 3 gói, đề DISC/MBTI; API down vẫn render bằng defaults (đã test) |
| Module nghiệp vụ theo domain | Đạt | Course, Service, Order, Entitlement, Quiz, Media, Lead, Post, Page, Section |

---

## 13. Tổng hợp: những gì CHƯA đạt hoặc cần khách quyết

| # | Việc | Mức ảnh hưởng | Đề xuất |
| --- | --- | --- | --- |
| 1 | **Nội dung trả phí VIP / trọn đời chưa có** (chỉ có hạ tầng quyền) | Cao — ảnh hưởng trực tiếp doanh thu | Khách chốt nội dung báo cáo trả phí; tôi làm trang báo cáo đầy đủ khoá theo entitlement |
| 2 | Chưa có cổng thanh toán tự động | Trung bình | Giữ chuyển khoản + duyệt tay, hoặc cắm VNPay/MoMo theo hợp đồng |
| 3 | Giá dịch vụ/khóa học là số tạm | Trung bình | Khách cấp bảng giá chính thức |
| 4 | 5 ảnh bìa khóa học mới là ảnh tạm | Trung bình | Khách cấp ảnh đúng chủ đề |
| 5 | Đề cương 11 khóa, 12 bài blog, nội dung 4 trang giới thiệu do tôi soạn | Trung bình | Khách duyệt/chỉnh để đúng giọng thương hiệu |
| 6 | Thông báo chưa gửi thật (cần API key Resend + bot token Telegram của khách) | Trung bình | Khách nhập trong Site Settings, bấm "Gửi thử" để xác nhận |
| 7 | Prerender SEO đầy đủ chưa làm (đã có meta server-side theo route, sitemap 47 URL, robots) | Thấp | Làm khi khách chạy SEO/quảng cáo |
| 8 | Chưa có danh mục sim để chọn/mua/so sánh như simkinhdich | Thấp (ngoài phạm vi yêu cầu) | Bổ sung nếu khách muốn bán sim |
| 9 | Dữ liệu tham chiếu năng lượng ngày hết 31/12/2028 | Thấp | Chuyển sang tính hoàn toàn bằng bộ luật hoặc sinh lại dữ liệu |
| 10 | DISC/MBTI là bộ đề tự soạn theo khung tham chiếu | Thấp (pháp lý) | Khách đồng ý cách ghi chú hiện tại hoặc mua bản quyền công cụ chuẩn |
| 11 | Vài nhãn eyebrow ~11px còn nhỏ; chưa có E2E test tự động trong repo | Thấp | Dọn ở đợt polish; thêm Playwright nếu khách cần CI |
| 12 | "Đăng nhập" nằm ở cụm riêng, không nằm trong dãy 9 menu | Thấp | Gộp vào dãy menu nếu khách muốn đúng như bảng feedback |

---

## 14. Kết luận tự đánh giá

- **Đạt đầy đủ:** giao diện ô tra cứu (I), thanh công cụ 9 menu, Giới thiệu, Tra cứu (3 công cụ), Phong thủy sim, Công cụ phong thủy (3 công cụ), Khóa học (cấu trúc), Free tools, Blog (cấu trúc), Đăng nhập, và 13/13 nhóm quy tắc AGENTS.md.
- **Đạt một phần:** Dịch vụ — thiếu nội dung trả phí thực tế và thanh toán tự động.
- **Chưa làm (ngoài yêu cầu hoặc chờ quyết định):** danh mục sim, prerender SEO, E2E tự động.

Nói thẳng: phần **hạ tầng và trải nghiệm** đã đủ để khách dùng thử và thu lead; phần **sản phẩm trả phí** mới xong khung, chưa có "món hàng" để giao cho người mua VIP/trọn đời. Đó là việc cần chốt tiếp theo.
