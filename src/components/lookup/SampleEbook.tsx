import { useCallback, useState } from "react";
import { BookOpen } from "lucide-react";
import { AppendixReader, type AppendixDocument } from "../fengshui/AppendixReader";
import "../../styles/sample-ebook.css";

/**
 * Ebook Thần số học mẫu (bản đầy đủ của Elon Reeve Musk, 28/06/1971) để khách hình dung file PDF sẽ nhận và muốn lấy
 * file của mình (khách yêu cầu 28/10/2026). Chỉ xem ảnh từng trang, không phát hành PDF; ảnh sinh bằng
 * `scripts/render_ebook_mau.py`.
 */
const SAMPLE_EBOOK: AppendixDocument = {
  title: "Ebook Thần số học — Elon Reeve Musk",
  kicker: "Ebook mẫu · chỉ xem trực tuyến",
  pagesDir: "/assets/ebook-mau",
  pageCount: 72,
  // Chân trang ebook đánh số từ bìa = "Trang 0".
  firstPrintedPage: 0,
  pageWidth: 900,
  pageHeight: 1274,
};

/** Thẻ "Ebook Mẫu" đặt dưới nút Tra cứu ngay (trang chủ và trang Tra cứu Thần số học). */
export function SampleEbook({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button type="button" className={`sample-ebook ${className}`.trim()} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <span className="sample-ebook__cover" aria-hidden="true">
          <img src={`${SAMPLE_EBOOK.pagesDir}/bia-nho.webp`} alt="" width={320} height={453} loading="lazy" decoding="async" />
        </span>
        <span className="sample-ebook__copy">
          <span className="sample-ebook__badge">Ebook Mẫu</span>
          <strong>Thần số học của Elon Reeve Musk</strong>
          <span className="sample-ebook__text">Xem trước file PDF {SAMPLE_EBOOK.pageCount} trang bạn sẽ nhận: 5 chương, đủ các chỉ số và biểu đồ.</span>
          <span className="sample-ebook__cta">
            <BookOpen aria-hidden="true" /> Xem ebook mẫu
          </span>
        </span>
      </button>
      {open ? <AppendixReader doc={SAMPLE_EBOOK} onClose={close} /> : null}
    </>
  );
}
