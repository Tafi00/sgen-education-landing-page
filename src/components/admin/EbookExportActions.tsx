import { Download, Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { api, errorMessage } from "../../api/client";
import { copyText } from "../../app/copyText";
import { useToast } from "../ui/Toast";
import { EBOOK_LINK_DAYS } from "../../../shared/ebook";

/**
 * Lấy lại file khách đã xuất: không lưu file, máy chủ dựng lại từ họ tên, ngày sinh, số điện thoại đã lưu và không trừ
 * lượt của mã. Quản trị tải file về rồi gửi, hoặc sao chép đường dẫn dán vào Zalo cho khách.
 */
export function EbookExportActions({ exportId }: { exportId: string }) {
  const toast = useToast();
  const [linking, setLinking] = useState(false);

  const copyLink = async () => {
    setLinking(true);
    try {
      const { path } = await api.post<{ path: string }>(`/api/admin/ebook-codes/exports/${exportId}/link`);
      const url = `${window.location.origin}${path}`;
      if (await copyText(url)) toast.success("Đã sao chép đường dẫn", `Dán vào Zalo gửi khách. Khách mở là tải được trong ${EBOOK_LINK_DAYS} ngày, không trừ lượt.`);
      // Safari chặn sao chép sau khi chờ máy chủ: hiện đường dẫn để quản trị tự sao chép.
      else window.prompt("Sao chép đường dẫn này rồi gửi cho khách:", url);
    } catch (error) {
      toast.error("Không tạo được đường dẫn", errorMessage(error));
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="data-table__actions-inner">
      <a className="table-action" href={`/api/admin/ebook-codes/exports/${exportId}/file`} download title="Tải lại file PDF (không trừ lượt)" aria-label="Tải lại file PDF">
        <Download aria-hidden="true" />
      </a>
      <button type="button" className="table-action" title="Sao chép đường dẫn gửi khách" aria-label="Sao chép đường dẫn gửi khách" disabled={linking} onClick={() => void copyLink()}>
        {linking ? <Loader2 className="spin" aria-hidden="true" /> : <Link2 aria-hidden="true" />}
      </button>
    </div>
  );
}
