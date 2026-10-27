import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { PhoneCall } from "lucide-react";
import { useSiteSettings } from "../../api/hooks";
import "../../styles/expert-callout.css";

/** Số di động 10 chữ số hiển thị dạng 0903.891.839 như các ấn phẩm của SGEN; dạng khác giữ nguyên. */
export function formatHotline(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}` : value.trim();
}

/** Link Zalo từ Cài đặt → Mạng xã hội: chấp nhận link đầy đủ hoặc số điện thoại; trống thì mở Zalo theo số chính. */
function zaloHref(value: string, fallbackPhone: string) {
  const text = value.trim();
  if (/^https?:\/\//i.test(text)) return text;
  const digits = (text || fallbackPhone).replace(/\D/g, "");
  return digits ? `https://zalo.me/${digits}` : "";
}

function ZaloMark() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <rect width="48" height="48" rx="12" fill="#0068ff" />
      <path d="M17 9h14a13 13 0 0 1 0 26H19l-8 5 2.5-7.2A13 13 0 0 1 17 9z" fill="#fff" />
      <text x="24" y="26.4" textAnchor="middle" fill="#0068ff" fontFamily="Arial, Helvetica, sans-serif" fontSize="11" fontWeight="700">
        Zalo
      </text>
    </svg>
  );
}

/**
 * Thanh "Liên hệ Chuyên Gia" dính đáy màn hình (khách: thay vì chèn giữa các mục, cho hiện xuyên suốt để lúc nào cũng
 * thấy). Gồm số chính, số phụ (Quản trị → Cài đặt → Liên hệ) và nút Zalo; biểu tượng điện thoại rung, nút số có vệt sáng.
 * Người dùng bật "giảm chuyển động" thì thanh đứng yên.
 */
export function ExpertContactBar({
  title,
  altFirst = false,
}: {
  title: string;
  /** Hiện số phụ trước số chính (trang /ebook ghi theo lời khách: 0902… - 0903…). */
  altFirst?: boolean;
}) {
  const { settings } = useSiteSettings();
  const primary = (settings.contact.phone || settings.brand.hotline).trim();
  const alt = settings.contact.phoneAlt.trim();
  const phones = (altFirst ? [alt, primary] : [primary, alt]).filter(Boolean);
  // Nút Zalo luôn theo số chính dù thứ tự hiển thị đổi.
  const zalo = zaloHref(settings.socials.zalo ?? "", primary);
  const visible = phones.length > 0 || Boolean(zalo);
  const barRef = useRef<HTMLElement>(null);

  /** Ghi chiều cao thanh vào CSS var để chừa chỗ cuối trang và đẩy nút lên đầu trang lên trên thanh. */
  useEffect(() => {
    const node = barRef.current;
    if (!visible || !node) return;
    const body = document.body;
    const apply = () => body.style.setProperty("--expert-bar-h", `${Math.ceil(node.getBoundingClientRect().height)}px`);
    body.classList.add("has-expert-bar");
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => {
      observer.disconnect();
      body.classList.remove("has-expert-bar");
      body.style.removeProperty("--expert-bar-h");
    };
  }, [visible]);

  if (!visible) return null;
  return createPortal(
    <aside ref={barRef} className="expert-bar" aria-label={title}>
      <span className="expert-bar__icon" aria-hidden="true">
        <PhoneCall />
      </span>
      <strong className="expert-bar__title">{title}</strong>
      <span className="expert-bar__actions">
        {phones.map((phone) => (
          <a key={phone} className="expert-bar__phone" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
            {formatHotline(phone)}
          </a>
        ))}
        {zalo && (
          <a className="expert-bar__zalo" href={zalo} target="_blank" rel="noreferrer" aria-label="Nhắn Zalo cho chuyên gia">
            <ZaloMark />
          </a>
        )}
      </span>
    </aside>,
    document.body,
  );
}
