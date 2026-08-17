# Asset audit

## Kết quả QA

- Manifest hiện có 20 asset sử dụng trực tiếp.
- Không có đường dẫn thiếu.
- Tất cả asset được đánh dấu `transparent` đều có kênh alpha thật; minh họa lớn dùng WebP alpha, logo/icon dùng PNG RGBA.
- Sáu hình chương trình bản `-v2.png` đã được kiểm tra trực quan: không còn số thứ tự, tiêu đề hoặc nền card dính ở cạnh.
- Background và thumbnail blog là ảnh opaque có chủ đích.
- Đĩa tím của icon phương pháp/chương trình là một phần của huy hiệu; chỉ vùng bên ngoài huy hiệu được tách trong suốt.

## Coverage theo section

| Section | Raster asset | Thành phần dựng bằng code | Trạng thái |
| --- | --- | --- | --- |
| Header + Hero | Logo, nền tối có hành tinh | Nav, form, số trang trí, icon | Đủ |
| Công cụ tính nhanh | Nền sáng | Card, tab, Lucide icon | Đủ |
| Ý nghĩa các con số | Nền tối không hành tinh, số 1 cosmic | Tab số, nội dung, feature icon | Đủ cho trạng thái trong mẫu |
| Giới thiệu SGEN | Pythagoras cutout, nền sáng | Công thức/hình học SVG, text, CTA | Đủ |
| Tầm nhìn & phương pháp | Nền tối không hành tinh, 3 method badge | Đường quỹ đạo SVG/CSS, text | Đủ |
| Chương trình đào tạo | Nền sáng, 6 program badge | Card, số thứ tự, CTA | Đủ |
| Blog | Nền sáng, 4 thumbnail | Bento card và text | Đủ |
| Tư vấn + Footer | Nền sáng, nền tối có hành tinh, logo sáng | Form, contact icon, links | Đủ |

## Asset tùy chọn, không chặn bước dựng

- Minh họa cosmic riêng cho các số 2–9, 11 và 22, nếu mỗi tab cần một hình độc lập thay vì dùng numeral dựng bằng CSS.
- Favicon/app icon chỉ chứa biểu tượng chữ S.
- Open Graph/social sharing image.

Ba nhóm trên không xuất hiện như tài nguyên độc lập trong bộ screenshot nên chưa cần tạo ở giai đoạn tái dựng landing page.
