import { Link } from "react-router-dom";
import { Compass, Home, Search } from "lucide-react";

export function NotFoundPage() {
  return (
    <section className="page-dark-section not-found-page" style={{ "--page-dark-bg": "url(/assets/backgrounds/cosmic-dark-clean.webp)" } as React.CSSProperties}>
      <div className="container not-found-page__inner">
        <span className="page-kicker">
          <Compass aria-hidden="true" /> Không tìm thấy trang
        </span>
        <h1>Đường dẫn này không tồn tại</h1>
        <p>
          Có thể liên kết đã thay đổi sau khi SGEN nâng cấp website. Bạn có thể bắt đầu lại từ trang chủ, tra cứu thần số học hoặc bộ công cụ miễn phí.
        </p>
        <div className="not-found-page__actions">
          <Link className="page-primary" to="/">
            <Home aria-hidden="true" /> Về trang chủ
          </Link>
          <Link className="button button--ghost" to="/tra-cuu">
            <Search aria-hidden="true" /> Tra cứu thần số học
          </Link>
          <Link className="button button--ghost" to="/free-tools">
            Công cụ miễn phí
          </Link>
        </div>
      </div>
    </section>
  );
}
