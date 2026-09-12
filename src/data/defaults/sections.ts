import type { DefaultSection } from "./types";

/**
 * Cấu hình các khối trang chủ, theo đúng thứ tự đang render trong `src/App.tsx`.
 *
 * `data` để rỗng vì nội dung hiện vẫn nằm trong từng component; CMS có thể bổ sung
 * dần khi các khối được chuyển sang đọc dữ liệu.
 */
export const defaultSections: DefaultSection[] = [
  { key: "hero", name: "Khối mở đầu", type: "hero", data: {}, order: 1, visible: true },
  { key: "quickTools", name: "Công cụ nhanh", type: "quickTools", data: {}, order: 2, visible: true },
  { key: "numbers", name: "Con số & chỉ số", type: "numbers", data: {}, order: 3, visible: true },
  { key: "about", name: "Giới thiệu SGEN", type: "about", data: {}, order: 4, visible: true },
  { key: "methods", name: "Phương pháp", type: "methods", data: {}, order: 5, visible: true },
  { key: "programs", name: "Chương trình đào tạo", type: "programs", data: {}, order: 6, visible: true },
  { key: "blog", name: "Bài viết mới", type: "blog", data: {}, order: 7, visible: true },
  { key: "consultation", name: "Đăng ký tư vấn", type: "consultation", data: {}, order: 8, visible: true },
] satisfies DefaultSection[];
