import { useEffect, useMemo, useRef } from "react";
import { CheckCircle2, ClipboardCopy, Download, Eye, ExternalLink, HelpCircle, Smartphone } from "lucide-react";
import { copyText } from "../../app/copyText";
import { Button, ButtonAnchor } from "../ui/Button";
import { useToast } from "../ui/Toast";
import { EBOOK_LINK_DAYS } from "../../../shared/ebook";
import { detectInAppBrowser, openInBrowserHref } from "../../../shared/in-app-browser";
import "../../styles/ebook-file.css";

export type EbookFile = {
  token: string;
  filename: string;
  customerName: string;
  birthDate: string;
  edition: "demo" | "full";
  editionLabel: string;
  createdAt: string;
  expiresAt: string | null;
};

/**
 * Khối tải file ebook, dùng ở trang /ebook và trang /ebook/tai/<token> (link gửi qua Zalo). File tải bằng đường dẫn thật,
 * không cần đăng nhập, nên mở được ở Chrome/Safari khi trình duyệt trong Zalo không lưu được file. Khách lớn tuổi hay gặp
 * trường hợp này nên hướng dẫn ghi ngay trên trang.
 */
export function EbookFilePanel({ file, autoStart = false }: { file: EbookFile; autoStart?: boolean }) {
  const toast = useToast();
  const browser = useMemo(() => detectInAppBrowser(navigator.userAgent), []);
  const fileUrl = `/api/ebook/file/${file.token}`;
  const pageUrl = `${window.location.origin}/ebook/tai/${file.token}`;
  const openHref = browser ? openInBrowserHref(pageUrl, browser.os) : null;
  const browserName = browser?.os === "ios" ? "Safari" : "Chrome";
  const linkRef = useRef<HTMLAnchorElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const startedFor = useRef("");

  // Khối này hiện phía trên form đang bấm: đưa vào tầm nhìn để khách thấy ngay nút tải và hướng dẫn.
  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [file.token]);

  // Trong trình duyệt nhúng không tự tải: khách có thể thấy báo "đã tải" mà không có file, nên để khách chọn cách mở.
  useEffect(() => {
    if (!autoStart || browser || startedFor.current === file.token) return;
    startedFor.current = file.token;
    linkRef.current?.click();
  }, [autoStart, browser, file.token]);

  const copyLink = async () => {
    if (await copyText(pageUrl)) toast.success("Đã sao chép đường dẫn", `Dán vào ${browserName} để tải file.`);
    else toast.error("Không sao chép được", "Vui lòng thử nút mở bằng trình duyệt.");
  };

  return (
    <section ref={panelRef} className="ebook-file" aria-label={`File ebook của ${file.customerName}`}>
      <div className="ebook-file__head">
        <CheckCircle2 aria-hidden="true" />
        <div>
          <strong>File ebook của {file.customerName} đã sẵn sàng</strong>
          <small>
            {file.editionLabel} · Tải lại nhiều lần không trừ thêm lượt, trong {EBOOK_LINK_DAYS} ngày.
          </small>
        </div>
      </div>

      {browser ? (
        <div className="ebook-file__warn">
          <p>
            <Smartphone aria-hidden="true" />
            <span>
              Bạn đang mở trang trong <strong>{browser.name}</strong>. {browser.name} thường không lưu được file về điện thoại. Hãy mở bằng {browserName} để tải:
            </span>
          </p>
          {openHref ? (
            <ButtonAnchor variant="primary" block href={openHref}>
              <ExternalLink aria-hidden="true" /> Mở bằng {browserName} để tải file
            </ButtonAnchor>
          ) : null}
          <p className="ebook-file__hint">
            Nút trên không mở được? Bấm dấu <b>⋮</b> hoặc <b>⋯</b> ở góc trên màn hình, chọn <b>Mở bằng trình duyệt</b>. Hoặc sao chép đường dẫn rồi dán vào {browserName}.
          </p>
        </div>
      ) : null}

      <div className="ebook-file__actions">
        <ButtonAnchor ref={linkRef} variant={browser ? "secondary" : "primary"} block href={fileUrl} download={file.filename}>
          <Download aria-hidden="true" /> {browser ? "Thử tải ngay tại đây" : "Tải file PDF về máy"}
        </ButtonAnchor>
        <ButtonAnchor variant="secondary" href={`${fileUrl}?xem=1`} target="_blank" rel="noreferrer">
          <Eye aria-hidden="true" /> Xem file
        </ButtonAnchor>
        <Button type="button" variant="secondary" onClick={() => void copyLink()}>
          <ClipboardCopy aria-hidden="true" /> Sao chép đường dẫn
        </Button>
      </div>

      <details className="ebook-file__help">
        <summary>
          <HelpCircle aria-hidden="true" /> Đã tải nhưng không thấy file?
        </summary>
        <ul>
          <li>
            <strong>Điện thoại Android:</strong> mở ứng dụng <em>Tệp của tôi</em> (hoặc <em>Files</em>), vào mục <em>Tải xuống</em> / <em>Download</em>.
          </li>
          <li>
            <strong>iPhone:</strong> mở ứng dụng <em>Tệp</em>, vào mục <em>Tải về</em>.
          </li>
          <li>
            Tên file: <code>{file.filename}</code>
          </li>
          <li>Vẫn không thấy: gọi SGEN, chúng tôi gửi lại file cho bạn. Bạn không mất lượt xuất.</li>
        </ul>
      </details>
    </section>
  );
}
