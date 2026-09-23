/**
 * Trang dịch vụ công khai.
 *
 * - `ServicesListPage` (`/dich-vu`): ba gói dịch vụ kèm giá, quyền lợi và badge nổi bật.
 * - `ServiceDetailPage` (`/dich-vu/:slug`): chi tiết gói và form đặt mua
 *   (`POST /api/orders`); sau khi tạo đơn hiển thị thông tin chuyển khoản trả về.
 * - `OrderStatusPage` (`/dich-vu/don-hang/:code?token=...`): trạng thái đơn, hướng
 *   dẫn chuyển khoản và form tải biên lai (`POST /api/orders/:code/proof`).
 */
import { useState, type CSSProperties, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Info,
  KeyRound,
  Loader2,
  Mail,
  PackageCheck,
  Phone,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users,
} from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { useService, useServices, useSiteSettings } from "../../api/hooks";
import { FieldShell, TextField } from "../../components/form/Field";
import { useToast } from "../../components/ui/Toast";

const DARK_STYLE = { "--page-dark-bg": "url(/assets/backgrounds/cosmic-dark-clean.webp)" } as CSSProperties;
const LIGHT_STYLE = { "--page-light-bg": "url(/assets/backgrounds/cosmic-light.webp)" } as CSSProperties;

const ORDER_STATUS: Record<string, string> = {
  pending: "Chờ xác nhận",
  paid: "Đã thanh toán",
  cancelled: "Đã huỷ",
  expired: "Hết hạn",
};

type PaymentInfo = {
  bankName: string;
  bankBin: string;
  accountNumber: string;
  accountName: string;
  transferNote: string;
  qrUrl: string;
};

type CreatedOrder = {
  code: string;
  status: string;
  amount: number;
  serviceName: string;
  viewToken: string;
};

type OrderDetail = {
  code: string;
  status: string;
  amount: number;
  serviceName: string;
  serviceSlug: string;
  proofImage: string;
  paidAt: string | null;
  createdAt: string;
  adminNote: string;
};

function formatPrice(value: number) {
  return value > 0 ? `${value.toLocaleString("vi-VN")} đ` : "Liên hệ";
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`status-badge status-badge--${status}`}>{ORDER_STATUS[status] ?? status}</span>;
}

function PaymentPanel({ payment, amount, code, viewToken }: { payment: PaymentInfo; amount: number; code: string; viewToken?: string }) {
  const rows = [
    { label: "Ngân hàng", value: payment.bankName },
    { label: "Số tài khoản", value: payment.accountNumber },
    { label: "Chủ tài khoản", value: payment.accountName },
    { label: "Số tiền", value: formatPrice(amount) },
    { label: "Nội dung chuyển khoản", value: payment.transferNote || code },
  ].filter((row) => row.value);

  return (
    <div className="lookup-workspace__grid">
      <div className="admin-card">
        <div className="admin-panel__head">
          <h2>Thông tin chuyển khoản</h2>
          <span className="admin-hint">Mã đơn {code}</span>
        </div>
        <div className="admin-quick-grid">
          {rows.map((row) => (
            <div className="admin-quick" key={row.label}>
              {row.label}
              <small>{row.value}</small>
            </div>
          ))}
        </div>
        <p className="admin-hint">
          <Info aria-hidden="true" /> Vui lòng giữ đúng nội dung chuyển khoản để SGEN đối chiếu nhanh. Đơn được xác nhận trong giờ làm việc.
        </p>
      </div>

      <div className="admin-card">
        <div className="admin-panel__head">
          <h2>Quét mã để thanh toán</h2>
        </div>
        {payment.qrUrl ? (
          <img src={payment.qrUrl} alt={`Mã QR chuyển khoản cho đơn ${code}`} style={{ width: "min(260px, 100%)", borderRadius: 14 }} />
        ) : (
          <p className="admin-hint">
            <QrCode aria-hidden="true" /> Chưa cấu hình thông tin ngân hàng trong CMS nên chưa tạo được mã QR. Vui lòng chuyển khoản theo thông tin bên cạnh.
          </p>
        )}
        <div className="admin-page__actions">
          <Link className="button button--primary" to={`/dich-vu/don-hang/${code}${viewToken ? `?token=${viewToken}` : ""}`}>
            Xem trạng thái đơn <ArrowRight aria-hidden="true" />
          </Link>
          <Link className="button button--ghost" to="/dich-vu">
            Về danh sách dịch vụ
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ServicesListPage() {
  const { services, isLoading } = useServices();

  return (
    <>
      <section className="page-hero" style={DARK_STYLE}>
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <span className="page-kicker">
              <Sparkles aria-hidden="true" /> Dịch vụ SGEN
            </span>
            <h1>
              <span className="page-hero__title-line">Đồng hành</span>
              <em className="page-hero__title-line">theo từng mục tiêu</em>
            </h1>
            <p>
              Ba gói dịch vụ cho ba nhu cầu khác nhau: đi sâu cùng chuyên gia, sở hữu học liệu trọn đời hoặc một buổi định hướng nghề nghiệp.
            </p>
          </div>
        </div>
      </section>

      <section className="page-light-section ux-service" style={LIGHT_STYLE}>
        <div className="container">
          <header className="page-section-heading page-section-heading--light">
            <span>Gói dịch vụ</span>
            <h2>Chọn hình thức đồng hành phù hợp</h2>
            <p>Xem nhanh thời lượng, quyền lợi và mức giá để chọn gói phù hợp với mục tiêu của bạn.</p>
          </header>

          {isLoading && !services.length ? (
            <p className="admin-loading">
              <Loader2 className="spin" aria-hidden="true" /> Đang tải danh sách dịch vụ…
            </p>
          ) : services.length ? (
            <div className="service-grid">
              {services.map((service, index) => (
                <article className={`service-card${service.isFeatured ? " service-card--featured" : ""}`} key={service.slug}>
                  <div className="service-card__media">
                    {service.coverImage ? <img src={service.coverImage} alt="" loading="lazy" /> : <PackageCheck aria-hidden="true" />}
                    <span className="service-grid__number">{String(index + 1).padStart(2, "0")}</span>
                    {service.isFeatured ? <span className="service-card__badge"><Sparkles aria-hidden="true" /> Được chọn nhiều</span> : null}
                  </div>
                  <div className="service-card__meta">{service.durationLabel || "Linh hoạt"}</div>
                  <h3>{service.name}</h3>
                  <p className="service-card__tagline">{service.tagline}</p>
                  <div className="service-card__price">
                    <strong>{formatPrice(service.price)}</strong>
                    {service.compareAtPrice > service.price ? <s> {formatPrice(service.compareAtPrice)}</s> : null}
                  </div>
                  <ul>
                    {service.deliverables.slice(0, 3).map((item) => (
                      <li key={item}>
                        <CheckCircle2 aria-hidden="true" /> {item}
                      </li>
                    ))}
                  </ul>
                  <Link to={`/dich-vu/${service.slug}`} aria-label={`Xem chi tiết ${service.name}`}>
                    Xem gói dịch vụ <ArrowRight aria-hidden="true" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-search">
              <Info aria-hidden="true" />
              <h2>Chưa có gói dịch vụ nào</h2>
              <p>Danh sách gói đang được cập nhật. Bạn liên hệ SGEN để được tư vấn trực tiếp.</p>
              <Link className="page-primary" to="/lien-he">
                Liên hệ tư vấn <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          )}

          {services.length ? (
            <div className="service-compare">
              <h2>So sánh nhanh các gói</h2>
              <table className="service-compare__table">
                <thead>
                  <tr>
                    <th scope="col">Gói dịch vụ</th>
                    <th scope="col">Học phí</th>
                    <th scope="col">Thời lượng</th>
                    <th scope="col">Quyền lợi chính</th>
                    <th scope="col">Đăng ký</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.slug}>
                      <th scope="row">
                        {service.name}
                        {service.isFeatured ? <span className="service-compare__flag">Được chọn nhiều</span> : null}
                      </th>
                      <td data-label="Học phí">
                        <strong>{formatPrice(service.price)}</strong>
                        {service.compareAtPrice > service.price ? <s> {formatPrice(service.compareAtPrice)}</s> : null}
                      </td>
                      <td data-label="Thời lượng">{service.durationLabel || "Đang cập nhật"}</td>
                      <td data-label="Quyền lợi chính">{service.deliverables.slice(0, 3).join(" · ") || "Đang cập nhật"}</td>
                      <td data-label="Đăng ký">
                        <Link className="button button--ghost" to={`/dich-vu/${service.slug}`}>
                          {service.ctaLabel || "Xem chi tiết"} <ArrowRight aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div className="process-card">
            <h2>Đăng ký trong 4 bước</h2>
            <div>
              <span>
                <b>1</b> Chọn gói phù hợp
              </span>
              <span>
                <b>2</b> Điền thông tin liên hệ
              </span>
              <span>
                <b>3</b> Chuyển khoản theo mã QR
              </span>
              <span>
                <b>4</b> Gửi biên lai và chờ xác nhận
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function ServiceDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { service, isLoading, notFound } = useService(slug);
  const { services } = useServices();
  const { settings } = useSiteSettings();
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ order: CreatedOrder; payment: PaymentInfo } | null>(null);

  if (isLoading && !service) {
    return (
      <section className="page-light-section">
        <div className="container">
          <p className="admin-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải gói dịch vụ…
          </p>
        </div>
      </section>
    );
  }

  if (notFound || !service) {
    return (
      <section className="page-light-section ux-service" style={LIGHT_STYLE}>
        <div className="container empty-search">
          <AlertTriangle aria-hidden="true" />
          <h2>Không tìm thấy gói dịch vụ</h2>
          <p>Gói này có thể đã được đổi đường dẫn hoặc tạm ẩn. Bạn xem lại danh sách gói dịch vụ đang mở bán.</p>
          <Link className="page-primary" to="/dich-vu">
            <ArrowLeft aria-hidden="true" /> Về danh sách dịch vụ
          </Link>
        </div>
      </section>
    );
  }

  const purchaseDisabled = settings.featureFlags.vipPurchase === false;
  const hasDiscount = service.compareAtPrice > service.price && service.compareAtPrice > 0;
  const savingsPercent = hasDiscount ? Math.round((1 - service.price / service.compareAtPrice) * 100) : 0;
  const entitlementDays = service.entitlementDays > 0 ? service.entitlementDays : 30;
  const otherServices = services.filter((item) => item.slug !== service.slug).slice(0, 2);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setFormError("Vui lòng nhập họ tên (ít nhất 2 ký tự).");
      return;
    }
    if (phone.replace(/\D/g, "").length < 8) {
      setFormError("Vui lòng nhập số điện thoại hợp lệ để SGEN liên hệ xác nhận.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const result = await api.post<{ order: CreatedOrder; payment: PaymentInfo }>("/api/orders", {
        serviceSlug: service.slug,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim(),
      });
      setCreated(result);
      toast.success("Đã tạo đơn hàng", `Mã đơn ${result.order.code}. Vui lòng chuyển khoản theo hướng dẫn.`);
    } catch (caught) {
      setFormError(errorMessage(caught));
      toast.error("Chưa tạo được đơn hàng", errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-hero" style={DARK_STYLE}>
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <Link className="article-back" to="/dich-vu">
              <ArrowLeft aria-hidden="true" /> Tất cả dịch vụ
            </Link>
            <span className="page-kicker">
              <Sparkles aria-hidden="true" /> {service.durationLabel || "Dịch vụ SGEN"}
            </span>
            <h1>
              <span className="page-hero__title-line">{service.name}</span>
            </h1>
            <p>{service.tagline}</p>
            <a className="page-primary" href="#dat-mua">
              {service.ctaLabel || "Đặt mua"} <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="page-light-section ux-service" style={LIGHT_STYLE}>
        <div className="container">
          <div className="featured-course">
            <div>
              <span>Học phí gói dịch vụ</span>
              <h2>
                {formatPrice(service.price)}
                {hasDiscount ? <s> {formatPrice(service.compareAtPrice)}</s> : null}
              </h2>
              {hasDiscount ? (
                <p>
                  <BadgeCheck aria-hidden="true" /> Tiết kiệm {savingsPercent}% so với giá niêm yết {formatPrice(service.compareAtPrice)}.
                </p>
              ) : null}
              {service.priceNote && !/CMS/i.test(service.priceNote) ? <p>{service.priceNote}</p> : null}
              <ul>
                {hasDiscount ? (
                  <li>
                    <CheckCircle2 aria-hidden="true" /> Giá niêm yết {formatPrice(service.compareAtPrice)}
                  </li>
                ) : null}
                {service.durationLabel ? (
                  <li>
                    <CheckCircle2 aria-hidden="true" /> Thời lượng: {service.durationLabel}
                  </li>
                ) : null}
                <li>
                  <CheckCircle2 aria-hidden="true" /> Hình thức: chuyển khoản ngân hàng hoặc quét mã VietQR
                </li>
              </ul>
              <a href="#dat-mua">{purchaseDisabled ? "Xem cách liên hệ" : service.ctaLabel || "Đặt mua ngay"} <ArrowRight aria-hidden="true" /></a>
            </div>
            {service.coverImage ? (
              <img src={service.coverImage} alt={service.name} />
            ) : (
              <div className="empty-search">
                <PackageCheck aria-hidden="true" />
                <p>Gói dịch vụ đang được cập nhật ảnh bìa.</p>
              </div>
            )}
          </div>

          {service.entitlementType ? (
            <div className="entitlement-note">
              <strong>
                <KeyRound aria-hidden="true" /> Quyền lợi kèm theo
              </strong>
              <ul>
                {service.entitlementType === "vip-numerology" ? (
                  <li>
                    Mở khoá trọn bộ luận giải VIP trong <b>{entitlementDays} ngày</b> kể từ khi quyền được cấp.
                  </li>
                ) : null}
                {service.entitlementType === "lifetime" ? <li>Quyền xem nội dung trọn đời, không giới hạn thời gian.</li> : null}
                <li>
                  Bạn cần <Link to="/dang-nhap">đăng nhập tài khoản</Link> đã dùng khi đặt mua để sử dụng quyền lợi này.
                </li>
                <li>Quyền được cấp tự động sau khi SGEN xác nhận thanh toán của đơn hàng.</li>
              </ul>
            </div>
          ) : null}

          <header className="page-section-heading page-section-heading--light">
            <span>Mô tả</span>
            <h2>Gói dịch vụ bao gồm</h2>
          </header>
          <div className="story-copy">
            <p>{service.description}</p>
          </div>
          <div className="article-list">
            {service.deliverables.map((item) => (
              <article key={item}>
                <span>
                  <PackageCheck aria-hidden="true" />
                </span>
                <div>
                  <h3>{item}</h3>
                </div>
              </article>
            ))}
          </div>

          {service.audience.length ? (
            <>
              <header className="page-section-heading page-section-heading--light">
                <span>Đối tượng</span>
                <h2>Phù hợp với ai</h2>
              </header>
              <div className="article-list">
                {service.audience.map((item) => (
                  <article key={item}>
                    <span>
                      <Users aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{item}</h3>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {settings.legal.refundPolicy.trim() ? (
            <>
              <header className="page-section-heading page-section-heading--light">
                <span>Chính sách</span>
                <h2>Chính sách hoàn tiền</h2>
              </header>
              <div className="story-copy">
                <p>{settings.legal.refundPolicy}</p>
              </div>
            </>
          ) : null}

          <div className="process-card">
            <h2>Quy trình mua gói dịch vụ</h2>
            <div>
              <span>
                <b>1</b> Điền thông tin đặt mua
              </span>
              <span>
                <b>2</b> Chuyển khoản theo mã đơn
              </span>
              <span>
                <b>3</b> Tải biên lai chuyển khoản
              </span>
              <span>
                <b>4</b> Nhận quyền sau khi xác nhận
              </span>
            </div>
          </div>

          {settings.legal.disclaimer.trim() ? (
            <div className="privacy-banner">
              <ShieldCheck aria-hidden="true" />
              <div>
                <strong>Lưu ý quan trọng</strong>
                <span>{settings.legal.disclaimer}</span>
              </div>
            </div>
          ) : null}

          {otherServices.length ? (
            <section className="service-related" aria-labelledby="service-related-title">
              <header className="service-related__heading">
                <div>
                  <span>Khám phá thêm</span>
                  <h2 id="service-related-title">Gói dịch vụ khác</h2>
                  <p>Chọn hướng đồng hành phù hợp với thời gian và mục tiêu của bạn.</p>
                </div>
                <Link to="/dich-vu">Xem tất cả gói <ArrowRight aria-hidden="true" /></Link>
              </header>
              <div className="service-grid service-related__grid">
                {otherServices.map((item, index) => (
                  <article className="service-related__card" key={item.slug}>
                    <div className="service-related__image">
                      {item.coverImage ? <img src={item.coverImage} alt="" loading="lazy" /> : <PackageCheck aria-hidden="true" />}
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div className="service-related__body">
                    <span className="service-related__duration">{item.durationLabel || "Linh hoạt"}</span>
                    <h3>{item.name}</h3>
                    <p>{item.tagline}</p>
                    <div className="service-related__price">
                      <strong>{formatPrice(item.price)}</strong>
                      {item.compareAtPrice > item.price ? <s> {formatPrice(item.compareAtPrice)}</s> : null}
                    </div>
                    <Link to={`/dich-vu/${item.slug}`} aria-label={`Xem chi tiết ${item.name}`}>
                      Xem chi tiết <ArrowRight aria-hidden="true" />
                    </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>

      <section className="page-light-section ux-service" style={LIGHT_STYLE}>
        <div className="container" id="dat-mua">
          <header className="page-section-heading page-section-heading--light">
            <span>Đặt mua</span>
            <h2>Hoàn tất đăng ký</h2>
            <p>Sau khi gửi, hệ thống tạo mã đơn và hiển thị hướng dẫn chuyển khoản kèm mã QR.</p>
          </header>

          {purchaseDisabled ? (
            <div className="admin-alerts">
              <article className="is-warn">
                <Info aria-hidden="true" />
                <div>
                  <strong>Tính năng đặt mua đang tạm đóng</strong>
                  <p>Vui lòng liên hệ SGEN qua trang liên hệ để được hỗ trợ đăng ký gói dịch vụ này.</p>
                </div>
              </article>
            </div>
          ) : created ? (
            <PaymentPanel payment={created.payment} amount={created.order.amount} code={created.order.code} viewToken={created.order.viewToken} />
          ) : (
            <div className="lookup-workspace__grid">
              <form className="admin-card service-checkout__form" onSubmit={submit}>
                <div className="admin-form">
                  <div className="admin-form__grid">
                    <TextField
                      label="Họ và tên"
                      required
                      icon={<UserRound aria-hidden="true" />}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Nguyễn Văn A"
                    />
                    <TextField
                      label="Số điện thoại"
                      required
                      icon={<Phone aria-hidden="true" />}
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="09xx xxx xxx"
                    />
                    <TextField
                      label="Email"
                      type="email"
                      wide
                      icon={<Mail aria-hidden="true" />}
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      hint="Không bắt buộc, dùng để gửi xác nhận đơn hàng."
                      placeholder="ban@email.com"
                    />
                  </div>

                  <p className="admin-hint">
                    <ShieldCheck aria-hidden="true" /> Khi gửi thông tin, bạn đồng ý để SGEN xử lý dữ liệu phục vụ đơn hàng và hiểu rằng quyền truy cập
                    được cấp sau khi SGEN xác nhận thanh toán.
                  </p>

                  {formError ? (
                    <p className="admin-error">
                      <AlertTriangle aria-hidden="true" /> {formError}
                    </p>
                  ) : null}

                  <button className="button button--primary" type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
                    {submitting ? "Đang tạo đơn…" : `Đặt mua ${service.name}`}
                  </button>

                  <p className="admin-hint">
                    <ShieldCheck aria-hidden="true" /> SGEN không lưu thông tin thẻ hay tài khoản ngân hàng của bạn.
                  </p>
                </div>
              </form>

              <aside className="admin-card service-checkout__summary">
                <div className="admin-panel__head">
                  <h2>Đơn hàng của bạn</h2>
                </div>
                <div className="service-checkout__total"><span>{service.name}</span><strong>{formatPrice(service.price)}</strong></div>
                {service.durationLabel ? <p className="service-checkout__duration">Thời lượng: {service.durationLabel}</p> : null}
                <h3 className="service-checkout__subheading">Bao gồm</h3>
                <div className="article-list">
                  {service.deliverables.map((item) => (
                    <article key={item}>
                      <span>
                        <CheckCircle2 aria-hidden="true" />
                      </span>
                      <div>
                        <h3>{item}</h3>
                      </div>
                    </article>
                  ))}
                </div>
                {service.priceNote && !/CMS/i.test(service.priceNote) ? <p className="admin-hint"><Info aria-hidden="true" /> {service.priceNote}</p> : null}
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function OrderStatusPage() {
  const { code = "" } = useParams<{ code: string }>();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const toast = useToast();
  const queryClient = useQueryClient();
  const { settings } = useSiteSettings();
  const [proof, setProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploaded, setUploaded] = useState("");

  const query = useQuery({
    queryKey: ["order", code, token],
    enabled: Boolean(code),
    retry: 1,
    queryFn: () => api.get<{ order: OrderDetail; payment: PaymentInfo | null }>(`/api/orders/${code}`, { query: { token } }),
  });

  const order = query.data?.order;
  const payment = query.data?.payment ?? null;

  const uploadProof = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!proof) {
      setUploadError("Vui lòng chọn ảnh biên lai chuyển khoản.");
      return;
    }
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("proof", proof);
      const result = await api.upload<{ ok: boolean; proofImage: string }>(
        `/api/orders/${code}/proof?token=${encodeURIComponent(token)}`,
        formData,
      );
      setUploaded(result.proofImage);
      setProof(null);
      await queryClient.invalidateQueries({ queryKey: ["order", code, token] });
      toast.success("Đã gửi biên lai", "SGEN sẽ xác nhận đơn trong giờ làm việc.");
    } catch (caught) {
      setUploadError(errorMessage(caught));
      toast.error("Chưa gửi được biên lai", errorMessage(caught));
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="page-light-section" style={LIGHT_STYLE}>
      <div className="container">
        <Link className="admin-back" to="/dich-vu">
          <ArrowLeft aria-hidden="true" /> Danh sách dịch vụ
        </Link>

        {query.isLoading ? (
          <p className="admin-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải đơn hàng…
          </p>
        ) : query.isError ? (
          <div className="empty-search">
            <AlertTriangle aria-hidden="true" />
            <h2>Không mở được đơn hàng</h2>
            <p>{errorMessage(query.error)}</p>
            <p className="admin-hint">
              <Info aria-hidden="true" /> Bạn cần mở đúng liên kết có token mà hệ thống trả về khi tạo đơn, hoặc đăng nhập bằng tài khoản đã dùng để đặt mua.
            </p>
            <div className="admin-page__actions">
              <Link className="button button--primary" to="/dang-nhap">
                Đăng nhập tài khoản
              </Link>
              <Link className="button button--ghost" to="/lien-he">
                Liên hệ SGEN
              </Link>
            </div>
          </div>
        ) : order ? (
          <>
            <header className="page-section-heading page-section-heading--light">
              <span>Đơn hàng {order.code}</span>
              <h1>{order.serviceName}</h1>
              <p>
                Tạo lúc {formatDateTime(order.createdAt)} · Số tiền {formatPrice(order.amount)} · <StatusBadge status={order.status} />
              </p>
            </header>

            {order.status === "paid" ? (
              <div className="admin-alerts">
                <article className="is-info">
                  <ShieldCheck aria-hidden="true" />
                  <div>
                    <strong>Đơn đã được xác nhận</strong>
                    <p>
                      Thanh toán ghi nhận lúc {formatDateTime(order.paidAt)}. Quyền truy cập được cấp cho tài khoản thành viên dùng để đặt mua gói này
                      {order.serviceSlug === "than-so-hoc-tron-doi" ? " (thời hạn trọn đời)." : "."}
                    </p>
                  </div>
                </article>
              </div>
            ) : null}

            {order.status === "pending" && payment ? (
              <PaymentPanel payment={payment} amount={order.amount} code={order.code} viewToken={token} />
            ) : null}

            <div className="lookup-workspace__grid">
              <form className="admin-card" onSubmit={uploadProof}>
                <div className="admin-panel__head">
                  <h2>Gửi biên lai chuyển khoản</h2>
                </div>
                <div className="admin-form">
                  <FieldShell label="Ảnh biên lai" hint="Chấp nhận ảnh chụp màn hình hoặc ảnh chụp giấy chuyển khoản.">
                    <span className="field__control">
                      <Upload aria-hidden="true" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                          setProof(event.target.files?.[0] ?? null);
                          setUploadError("");
                        }}
                        disabled={order.status !== "pending"}
                      />
                    </span>
                  </FieldShell>

                  {order.status !== "pending" ? (
                    <p className="admin-hint">
                      <Info aria-hidden="true" /> Đơn không còn ở trạng thái chờ xác nhận nên không thể gửi thêm biên lai.
                    </p>
                  ) : null}

                  {uploadError ? (
                    <p className="admin-error">
                      <AlertTriangle aria-hidden="true" /> {uploadError}
                    </p>
                  ) : null}

                  <button className="button button--primary" type="submit" disabled={uploading || order.status !== "pending"}>
                    {uploading ? <Loader2 className="spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
                    {uploading ? "Đang tải lên…" : "Gửi biên lai"}
                  </button>
                </div>
              </form>

              <aside className="admin-card">
                <div className="admin-panel__head">
                  <h2>Trạng thái xử lý</h2>
                </div>
                <div className="admin-quick-grid">
                  <div className="admin-quick">
                    Trạng thái
                    <small>{ORDER_STATUS[order.status] ?? order.status}</small>
                  </div>
                  <div className="admin-quick">
                    Ngày tạo
                    <small>{formatDateTime(order.createdAt)}</small>
                  </div>
                  <div className="admin-quick">
                    Thanh toán
                    <small>{formatDateTime(order.paidAt)}</small>
                  </div>
                  <div className="admin-quick">
                    Mã đơn
                    <small>{order.code}</small>
                  </div>
                </div>

                {order.adminNote ? (
                  <p className="admin-hint">
                    <Info aria-hidden="true" /> Ghi chú từ SGEN: {order.adminNote}
                  </p>
                ) : null}

                {order.proofImage || uploaded ? (
                  <img
                    src={uploaded || order.proofImage}
                    alt={`Biên lai đơn ${order.code}`}
                    style={{ width: "100%", borderRadius: 14, marginTop: 14 }}
                  />
                ) : null}
              </aside>
            </div>

            <div className="detail-actions">
              {settings.brand.hotline ? (
                <a className="button button--ghost" href={`tel:${settings.brand.hotline.replace(/[^\d+]/g, "")}`}>
                  <Phone aria-hidden="true" /> Hotline {settings.brand.hotline}
                </a>
              ) : null}
              {settings.contact.email ? (
                <a
                  className="button button--ghost"
                  href={`mailto:${settings.contact.email}?subject=${encodeURIComponent(`Hỗ trợ đơn hàng ${order.code}`)}`}
                >
                  <Mail aria-hidden="true" /> Email hỗ trợ
                </a>
              ) : null}
              <Link className="button button--ghost" to="/lien-he">
                Trang liên hệ <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
