import { PhoneCall } from "lucide-react";
import { useSiteSettings } from "../../api/hooks";
import "../../styles/expert-callout.css";

/** Số di động 10 chữ số hiển thị dạng 0903.891.839 như các ấn phẩm của SGEN; dạng khác giữ nguyên. */
export function formatHotline(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `${digits.slice(0, 4)}.${digits.slice(4, 7)}.${digits.slice(7)}` : value.trim();
}

/**
 * Khối kêu gọi "Liên hệ Chuyên Gia" (khách yêu cầu nội dung "động"): biểu tượng điện thoại rung nhẹ, viền chuyển màu,
 * số điện thoại bấm gọi được. Số lấy từ Quản trị → Cài đặt → Liên hệ: `primary` chỉ số chính, `all` thêm số phụ.
 * Người dùng bật "giảm chuyển động" thì khối đứng yên.
 */
export function ExpertCallout({
  title,
  phones = "all",
  tone = "light",
  className = "",
}: {
  title: string;
  phones?: "all" | "primary";
  tone?: "light" | "dark";
  className?: string;
}) {
  const { settings } = useSiteSettings();
  const numbers = [settings.contact.phone || settings.brand.hotline, phones === "all" ? settings.contact.phoneAlt : ""]
    .map((value) => value.trim())
    .filter(Boolean);
  if (numbers.length === 0) return null;
  return (
    <aside className={`expert-callout expert-callout--${tone} ${className}`.trim()} aria-label={title}>
      <span className="expert-callout__icon" aria-hidden="true">
        <PhoneCall />
      </span>
      <div className="expert-callout__copy">
        <strong>{title}</strong>
        <span className="expert-callout__phones">
          {numbers.map((phone) => (
            <a key={phone} href={`tel:${phone.replace(/[^\d+]/g, "")}`}>
              {formatHotline(phone)}
            </a>
          ))}
        </span>
      </div>
    </aside>
  );
}
