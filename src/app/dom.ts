/**
 * `document.querySelector` ném lỗi khi hash không phải selector hợp lệ
 * (ví dụ `#/admin/don-hang`). Trả về null thay vì làm sập cả trang.
 */
export function safeQuerySelector(selector: string): Element | null {
  try {
    return document.querySelector(selector);
  } catch {
    return null;
  }
}
