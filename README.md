# SGEN Education landing page

Landing page React/TypeScript được dựng từ 8 ảnh tham chiếu trong `sections/`, sử dụng bộ asset đã tách trong `assets/`.

## Chạy dự án

```bash
npm install
npm run dev
```

Build production và kiểm tra type:

```bash
npm run typecheck
npm run build
```

## Cấu trúc chính

- `src/components/sections/`: 8 nhóm nội dung của landing page.
- `src/components/layout/`: Header và Footer.
- `src/components/ui/`: component dùng lại như reveal, button, badge và icon orb.
- `src/styles/`: design tokens, responsive và animation.
- `assets/manifest.json`: danh sách asset được website sử dụng.

## UX/UI và animation

- Menu mobile phủ toàn màn hình, khóa cuộn nền khi mở.
- Tab công cụ và tab con số có trạng thái ARIA, nội dung cập nhật thật.
- Form tra cứu và tư vấn có trạng thái focus, validation và thông báo thành công.
- Reveal khi cuộn, số bay nhẹ, quỹ đạo chuyển động, glow thở, hover card và zoom thumbnail.
- Hỗ trợ `prefers-reduced-motion` và nút quay lại đầu trang.
- Responsive đã kiểm tra tại desktop 1280/1440px và mobile 390px.

