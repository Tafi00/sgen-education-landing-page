/**
 * Hồ sơ đang tra cứu, giữ lại khi bấm "TẢI PDF" → trang /ebook → nhập mã đăng nhập.
 *
 * Lưu ở `sessionStorage` (chỉ trong tab, mất khi đóng tab) chứ không đưa vào đường dẫn để họ tên, ngày sinh và số điện thoại
 * không lộ ra thanh địa chỉ hay lịch sử trình duyệt. Mọi thao tác đều có try/catch vì trình duyệt có thể chặn storage.
 */
export type EbookDraft = {
  name: string;
  /** YYYY-MM-DD */
  birthDate: string;
  /** Số điện thoại khách hàng đã nhập ở bước tra cứu (chuỗi, có thể rỗng). */
  phone: string;
  /** Báo cáo tra cứu tương ứng, để gắn vào đúng hồ sơ khách hàng khi xuất. */
  reportId?: string;
};

const KEY = "sgen.ebook.draft";

export function saveEbookDraft(draft: EbookDraft) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // storage bị chặn: người dùng nhập lại ở trang ebook.
  }
}

export function loadEbookDraft(): EbookDraft | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<EbookDraft>;
    if (typeof value.name !== "string" || typeof value.birthDate !== "string") return null;
    return {
      name: value.name,
      birthDate: value.birthDate,
      phone: typeof value.phone === "string" ? value.phone : "",
      reportId: typeof value.reportId === "string" ? value.reportId : undefined,
    };
  } catch {
    return null;
  }
}

export function clearEbookDraft() {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // bỏ qua
  }
}
