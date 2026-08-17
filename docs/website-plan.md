# Kế hoạch dựng landing page SGEN Education

## 1. Mục tiêu hình ảnh

Trang đích giữ đúng tinh thần của 8 ảnh tham chiếu: giáo dục cao cấp, thần số học Pythagoras, không gian vũ trụ tím, xen kẽ section tối và sáng. Không khóa chiều cao section hoặc canh pixel tuyệt đối; ưu tiên nhịp bố cục, độ tương phản và khả năng co giãn theo nội dung.

Nguyên tắc dựng:

- Chữ, card, form, tab, button, đường viền và glow được dựng bằng HTML/CSS.
- Các số trang trí nền là text/pseudo-element, không phải ảnh.
- Icon giao diện dùng `lucide-react`; không raster hóa các icon phổ thông.
- Chỉ dùng ảnh cho nền giàu texture, minh họa đặc biệt, hình chương trình và thumbnail blog.
- Dùng hai nền chính xuyên suốt để toàn trang đồng nhất và giảm số asset phải tải.

## 2. Hệ typography đề xuất

### Font

- Display/heading: `Montserrat`, fallback `Arial`, `sans-serif`.
- Body/UI: `Be Vietnam Pro`, fallback `Arial`, `sans-serif`.
- Cả hai hỗ trợ tiếng Việt tốt. Montserrat tạo khối tiêu đề chắc, hiện đại; Be Vietnam Pro dễ đọc cho form, mô tả và nội dung dài.

### Cấp chữ

| Token | Dùng cho | Gợi ý |
| --- | --- | --- |
| `display-xl` | Hero title | `clamp(2.5rem, 5vw, 4.6rem)`, 800, line-height 1.05 |
| `display-lg` | Tiêu đề section | `clamp(2rem, 4vw, 3.6rem)`, 800, line-height 1.1 |
| `heading-md` | Tiêu đề card lớn | `clamp(1.4rem, 2vw, 2rem)`, 700 |
| `heading-sm` | Card/tool title | `1.1–1.35rem`, 700 |
| `body-lg` | Lead/subtitle | `1.08–1.25rem`, 400–500, line-height 1.65 |
| `body-md` | Nội dung mặc định | `1rem`, 400, line-height 1.65 |
| `label` | Tab, badge, button | `0.875–1rem`, 600–700, letter-spacing nhẹ |

Không đặt font-size riêng cho mọi breakpoint. Dùng `clamp()` cho display, còn body giữ gần 16px để dễ đọc.

## 3. Design tokens nền tảng

```css
:root {
  --font-display: "Montserrat", Arial, sans-serif;
  --font-body: "Be Vietnam Pro", Arial, sans-serif;

  --ink: #0b0a46;
  --ink-soft: #41436b;
  --night: #07042f;
  --night-2: #12064d;
  --violet: #5b22e8;
  --violet-bright: #7c3cff;
  --lavender: #c7a4ff;
  --magenta: #e81391;
  --surface: rgba(255, 255, 255, 0.9);
  --surface-dark: rgba(24, 10, 79, 0.78);
  --line: rgba(108, 67, 230, 0.22);
  --line-on-dark: rgba(206, 164, 255, 0.68);

  --gradient-cta: linear-gradient(100deg, #e7138f, #5a22ea);
  --shadow-card: 0 14px 36px rgba(44, 22, 116, 0.12);
  --shadow-glow: 0 0 28px rgba(132, 65, 255, 0.34);
  --radius-card: 20px;
  --radius-pill: 999px;
  --content-width: 1320px;
  --section-space: clamp(72px, 8vw, 120px);
}
```

## 4. Cấu trúc section

### 01 — Header + hero + tra cứu

- Header dạng pill trắng, logo trái, nav phải; mobile chuyển sang nút menu.
- Hero desktop chia hai cột: thông điệp bên trái, form tra cứu glassmorphism bên phải.
- Hàng 3 lợi ích ở cuối hero dùng card trắng; mobile xếp dọc.
- Dùng nền `cosmic-dark.webp`; số trang trí dựng bằng text tuyệt đối, constellation đã nằm trong nền.

### 02 — Công cụ tính nhanh

- Nền sáng `cosmic-light.webp`.
- Badge + heading + subtitle căn giữa, tab 3 mục, grid 4 cột × 2 hàng.
- Icon dùng Lucide đặt trong vòng tròn gradient. Card có hover nâng nhẹ và sáng viền.
- Tablet 2 cột; mobile 1 cột hoặc carousel ngang có snap.

### 03 — Ý nghĩa các con số

- Nền tối `cosmic-dark-clean.webp`, dãy tab số 1–9, 11, 22 cuộn ngang trên mobile.
- Nội dung card chia đôi: asset số đang chọn và phần luận giải.
- Số 1 dùng `numeral-1-cosmic.webp`; các số còn lại dùng glyph và quỹ đạo CSS để tối ưu dung lượng.

### 04 — Giới thiệu SGEN/Pythagoras

- Section sáng, desktop hai cột lệch 50/50.
- Cột trái là nội dung + 3 giá trị + CTA; cột phải là panel tối chứa `pythagoras-cosmic.webp` và phần giới thiệu.
- Trên mobile đặt minh họa sau đoạn giới thiệu, không cố giữ chiều cao bằng desktop.

### 05 — Tầm nhìn & phương pháp

- Nền tối `cosmic-dark-clean.webp`, heading căn giữa, ba card phương pháp nối bằng đường quỹ đạo CSS.
- Dùng ba asset trong `assets/methods`; hàng giá trị cuối dùng Lucide.
- Mobile bỏ đường nối phức tạp và xếp card dọc.

### 06 — Chương trình đào tạo

- Nền sáng, grid 3 × 2.
- Mỗi card có ảnh tròn riêng trong `assets/programs`, số thứ tự, tiêu đề, mô tả và CTA.
- Tablet 2 cột, mobile 1 cột; ảnh giữ kích thước theo card thay vì đặt kích thước cố định toàn trang.

### 07 — Kiến thức/blog

- Nền sáng, bento grid như mẫu: một bài lớn, hai bài nhỏ bên phải, một bài ngang phía dưới.
- 4 thumbnail đã tách trong `assets/blog`.
- Mobile chuyển thành danh sách card ảnh trên/chữ dưới theo cùng một pattern.

### 08 — Tư vấn + footer

- Khối tư vấn nền sáng chia hai cột: lợi ích/liên hệ và form.
- Footer nền tối dùng `cosmic-dark.webp`, logo sáng, 3 cột thông tin và hành tinh phát sáng ở mép dưới.
- Form có trạng thái focus, lỗi, gửi thành công; icon form dùng Lucide.

## 5. Icon mapping đề xuất

Thư viện: `lucide-react`.

- Navigation/action: `Menu`, `X`, `ArrowRight`, `ChevronRight`.
- Hero/form: `UserRound`, `VenusAndMars`, `CalendarDays`, `ShieldCheck`, `BookOpen`, `Target`.
- Tool/card: `BriefcaseBusiness`, `Heart`, `Smile`, `ChartNoAxesCombined`, `TrendingUp`, `Sparkles`.
- Giá trị/đào tạo: `GraduationCap`, `Star`, `Rocket`, `Lightbulb`, `Fingerprint`, `House`, `Landmark`.
- Contact/footer: `Mail`, `Phone`, `MessageSquareText`, `MapPin`, `Building2`.

Ba icon phương pháp và sáu minh họa chương trình đã có asset riêng, không thay bằng icon library.

## 6. Kế hoạch triển khai bước tiếp theo

1. Khởi tạo Vite + React + TypeScript; dùng CSS variables và component CSS để kiểm soát hiệu ứng tốt hơn.
2. Tạo component nền: `Container`, `SectionHeading`, `PillBadge`, `GradientButton`, `GlassCard`, `IconOrb`.
3. Dựng header, hero và form tra cứu trước; khóa typography, màu và spacing chung.
4. Dựng các section sáng/tối theo thứ tự, tái sử dụng hai background chính.
5. Thêm dữ liệu mảng cho tools, numbers, programs và posts để tránh lặp markup.
6. Thêm responsive, keyboard focus, reduced-motion và lazy-loading cho ảnh dưới màn hình đầu.
7. So sánh theo từng ảnh section ở desktop; chỉ chỉnh tỷ lệ/nhịp lớn, không đuổi pixel tuyệt đối.
8. Chạy kiểm tra build, responsive, contrast, form states và dung lượng asset.

## 7. Tiêu chí hoàn thành giao diện

- Nhìn tổng thể nhận ra đúng website trong ảnh: xen kẽ sáng/tối, tím vũ trụ, card trắng/glass, CTA gradient.
- Không dùng screenshot nguyên section làm nền thay cho HTML.
- Nội dung co giãn tốt từ mobile đến desktop, không overflow.
- Tất cả asset trong manifest tải được, có `alt` phù hợp và không phụ thuộc thư mục sinh ảnh ngoài workspace.
- Icon có stroke/size nhất quán; typography tiếng Việt không lỗi dấu.
