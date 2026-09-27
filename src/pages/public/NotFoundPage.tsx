import { Compass, Home, Search } from "lucide-react";
import { ButtonLink, ButtonRow } from "../../components/ui/Button";
import { PageHero } from "../../components/ui/Layout";

export function NotFoundPage() {
  return (
    <PageHero
      className="not-found-page"
      eyebrow="Không tìm thấy trang"
      eyebrowIcon={Compass}
      title="Đường dẫn này không tồn tại"
      description="Có thể liên kết đã thay đổi sau khi SGEN nâng cấp website. Bạn có thể bắt đầu lại từ trang chủ, tra cứu thần số học hoặc bộ công cụ miễn phí."
      actions={
        <ButtonRow>
          <ButtonLink variant="primary" to="/">
            <Home aria-hidden="true" /> Về trang chủ
          </ButtonLink>
          <ButtonLink variant="secondary" to="/tra-cuu">
            <Search aria-hidden="true" /> Tra cứu thần số học
          </ButtonLink>
          <ButtonLink variant="secondary" to="/free-tools">
            Công cụ miễn phí
          </ButtonLink>
        </ButtonRow>
      }
    />
  );
}
