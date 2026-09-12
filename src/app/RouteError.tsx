import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

/** Trang lỗi dùng chung: thay màn hình trắng "Unexpected Application Error" của React Router. */
export function RouteErrorPage() {
  const error = useRouteError();
  const isRouteError = isRouteErrorResponse(error);
  const status = isRouteError ? error.status : 500;
  const detail = (() => {
    if (isRouteError) return error.statusText || "Không tìm thấy nội dung.";
    if (error instanceof Error) return error.message;
    return "Có lỗi không xác định.";
  })();

  return (
    <section className="route-error">
      <div className="container route-error__inner">
        <span className="route-error__icon">
          <AlertTriangle aria-hidden="true" />
        </span>
        <h1>Trang này đang gặp sự cố</h1>
        <p>
          Rất tiếc, nội dung bạn mở chưa tải được. Bạn có thể thử tải lại, quay về trang chủ hoặc tiếp tục với các công cụ tra cứu.
        </p>
        <code className="route-error__detail">
          {status}: {detail}
        </code>
        <div className="route-error__actions">
          <button type="button" className="page-primary" onClick={() => window.location.reload()}>
            <RefreshCw aria-hidden="true" /> Tải lại trang
          </button>
          <Link className="button button--ghost" to="/">
            <Home aria-hidden="true" /> Về trang chủ
          </Link>
          <Link className="button button--ghost" to="/tra-cuu">
            Tra cứu thần số học
          </Link>
          <a className="button button--ghost" href="tel:0903891839">
            Gọi SGEN: 0903.891.839
          </a>
        </div>
      </div>
    </section>
  );
}
