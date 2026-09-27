/**
 * Khu vực thành viên.
 *
 * - `MemberLoginPage` (`/dang-nhap`) và `MemberRegisterPage` (`/dang-ky`) gọi API
 *   member, sau khi thành công chuyển về `/tai-khoan`.
 * - `MemberAccountPage` (`/tai-khoan`) hiển thị hồ sơ, quyền VIP, lịch sử tra cứu,
 *   đơn hàng; có đăng xuất và xoá dữ liệu cá nhân kèm hộp thoại xác nhận.
 *   Khi chưa đăng nhập, trang hiển thị form đăng nhập kèm link đăng ký.
 */
import { useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Crown,
  History,
  Info,
  Loader2,
  LogOut,
  Orbit,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { useSiteSettings } from "../../api/hooks";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { FieldShell, TextField } from "../../components/form/Field";
import { useToast } from "../../components/ui/Toast";
import { LOOKUP_LABELS } from "../../../shared/lookup-types";

const DARK_STYLE = { "--page-dark-bg": "url(/assets/backgrounds/cosmic-dark-clean.webp)" } as CSSProperties;
const LIGHT_STYLE = { "--page-light-bg": "url(/assets/backgrounds/cosmic-light.webp)" } as CSSProperties;

const ENTITLEMENT_LABELS: Record<string, string> = {
  "vip-numerology": "VIP Thần số học",
  lifetime: "Thần số học trọn đời",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xác nhận",
  paid: "Đã thanh toán",
  cancelled: "Đã huỷ",
  expired: "Hết hạn",
};

type Member = { id: string; name: string; email: string };

type Entitlement = { _id?: string; type: string; grantedAt?: string; expiresAt?: string | null };

type MemberReport = {
  _id: string;
  type: string;
  title: string;
  createdAt: string;
  shareToken?: string;
  result?: { headline?: string; subhead?: string };
};

type MemberOrder = {
  _id: string;
  code: string;
  status: string;
  amount: number;
  serviceName: string;
  createdAt: string;
  viewToken?: string;
};

type MeResponse = { member: Member | null; entitlements: Entitlement[] };

function formatDate(value?: string | null) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatPrice(value: number) {
  return value > 0 ? `${value.toLocaleString("vi-VN")} đ` : "—";
}

function lookupLabel(type: string) {
  return (LOOKUP_LABELS as Record<string, string>)[type] ?? "Kết quả tra cứu";
}

export function MemberLoginPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missing: { email?: string; password?: string } = {};
    if (!email.trim()) missing.email = "Vui lòng nhập email đã đăng ký.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) missing.email = "Email chưa đúng định dạng.";
    if (!password) missing.password = "Vui lòng nhập mật khẩu.";
    if (missing.email || missing.password) {
      setFieldErrors(missing);
      return;
    }
    setSubmitting(true);
    setFieldErrors({});
    setFormError("");
    try {
      await api.post("/api/members/login", { email: email.trim(), password });
      toast.success("Đăng nhập thành công", "Bạn có thể xem lịch sử tra cứu và đơn hàng của mình.");
      navigate("/tai-khoan");
    } catch (caught) {
      setFormError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="login-stage ux-member" style={DARK_STYLE}>
      <div className="container login-grid">
        <div className="login-welcome">
          <span className="page-kicker">
            <Orbit aria-hidden="true" /> Khu vực thành viên
          </span>
          <h1>Tài khoản SGEN</h1>
          <p>
            Đăng nhập để xem lại kết quả tra cứu đã lưu, theo dõi đơn hàng và quản lý quyền truy cập nội dung VIP của bạn.
          </p>
          <div>
            <span>
              <ShieldCheck aria-hidden="true" /> Phiên đăng nhập bảo mật, không lộ token trong trình duyệt
            </span>
            <span>
              <History aria-hidden="true" /> Lưu lịch sử tra cứu theo tài khoản
            </span>
            <span>
              <Crown aria-hidden="true" /> Quản lý quyền VIP và gói trọn đời
            </span>
          </div>
        </div>

        <form className="login-card" onSubmit={submit} noValidate>
          <header>
            <small>Đăng nhập</small>
            <h2>Chào bạn trở lại</h2>
            <p>Dùng email đã đăng ký để tiếp tục.</p>
          </header>

          <div className="admin-form">
            <div className="admin-form__grid">
              <TextField
                label="Email"
                type="email"
                required
                wide
                value={email}
                error={fieldErrors.email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="ban@email.com"
              />
              <TextField
                label="Mật khẩu"
                type="password"
                required
                wide
                value={password}
                error={fieldErrors.password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Tối thiểu 8 ký tự"
              />
            </div>

            {formError ? (
              <p className="admin-error">
                <AlertTriangle aria-hidden="true" /> {formError}
              </p>
            ) : null}

            <button className="button button--primary" type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="spin" aria-hidden="true" /> : <UserRound aria-hidden="true" />}
              {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
          </div>

          <footer>
            Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link>
          </footer>
        </form>
      </div>
    </section>
  );
}

export function MemberRegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string; consent?: string }>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missing: { name?: string; email?: string; password?: string; consent?: string } = {};
    if (name.trim().length < 2) missing.name = "Vui lòng nhập họ tên (ít nhất 2 ký tự).";
    if (!email.trim()) missing.email = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) missing.email = "Email chưa đúng định dạng.";
    if (password.length < 8) missing.password = "Mật khẩu cần ít nhất 8 ký tự.";
    if (!consent) missing.consent = "Vui lòng đồng ý điều khoản xử lý dữ liệu để tiếp tục.";
    if (Object.keys(missing).length) {
      setFieldErrors(missing);
      return;
    }
    setSubmitting(true);
    setFieldErrors({});
    setFormError("");
    try {
      await api.post("/api/members/register", {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        consent: true,
      });
      toast.success("Đã tạo tài khoản", "Bạn đã được đăng nhập và có thể dùng khu vực thành viên.");
      navigate("/tai-khoan");
    } catch (caught) {
      setFormError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="login-stage ux-member" style={DARK_STYLE}>
      <div className="container login-grid">
        <div className="login-welcome">
          <span className="page-kicker">
            <Orbit aria-hidden="true" /> Tài khoản mới
          </span>
          <h1>Đăng ký thành viên</h1>
          <p>Một tài khoản giúp bạn giữ lại kết quả tra cứu, theo dõi đơn hàng và quản lý quyền truy cập nội dung VIP.</p>
          <div>
            <span>
              <ShieldCheck aria-hidden="true" /> Dữ liệu dùng cho mục đích tư vấn và quản lý quyền truy cập
            </span>
            <span>
              <History aria-hidden="true" /> Xem lại lịch sử tra cứu bất cứ lúc nào
            </span>
            <span>
              <Crown aria-hidden="true" /> Nâng cấp gói VIP khi cần
            </span>
          </div>
        </div>

        <form className="login-card" onSubmit={submit} noValidate>
          <header>
            <small>Đăng ký</small>
            <h2>Tạo tài khoản</h2>
            <p>Chỉ cần email và mật khẩu, bạn có thể bổ sung thông tin sau.</p>
          </header>

          <div className="admin-form">
            <div className="admin-form__grid">
              <TextField
                label="Họ và tên"
                required
                value={name}
                error={fieldErrors.name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Nguyễn Văn A"
              />
              <TextField
                label="Số điện thoại"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                hint="Không bắt buộc."
                placeholder="09xx xxx xxx"
              />
              <TextField
                label="Email"
                type="email"
                required
                wide
                value={email}
                error={fieldErrors.email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="ban@email.com"
              />
              <TextField
                label="Mật khẩu"
                type="password"
                required
                wide
                value={password}
                error={fieldErrors.password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                hint={fieldErrors.password ? undefined : "Tối thiểu 8 ký tự."}
              />
            </div>

            <FieldShell wide error={fieldErrors.consent}>
              <label className="field__checkbox">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => {
                    setConsent(event.target.checked);
                    if (fieldErrors.consent) setFieldErrors((prev) => ({ ...prev, consent: undefined }));
                  }}
                />
                <span>Tôi đồng ý để SGEN Education xử lý dữ liệu cá nhân nhằm cung cấp dịch vụ và liên hệ tư vấn.</span>
              </label>
            </FieldShell>

            {formError ? (
              <p className="admin-error">
                <AlertTriangle aria-hidden="true" /> {formError}
              </p>
            ) : null}

            <button className="button button--primary" type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="spin" aria-hidden="true" /> : <UserRound aria-hidden="true" />}
              {submitting ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
            </button>
          </div>

          <footer>
            Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
          </footer>
        </form>
      </div>
    </section>
  );
}

export function MemberAccountPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { settings } = useSiteSettings();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const me = useQuery({
    queryKey: ["member", "me"],
    retry: 1,
    queryFn: () => api.get<MeResponse>("/api/members/me"),
  });
  const member = me.data?.member ?? null;
  const entitlements = me.data?.entitlements ?? [];

  const reports = useQuery({
    queryKey: ["member", "reports"],
    enabled: Boolean(member),
    retry: 1,
    queryFn: () => api.get<{ items: MemberReport[] }>("/api/members/reports"),
  });
  const orders = useQuery({
    queryKey: ["member", "orders"],
    enabled: Boolean(member),
    retry: 1,
    queryFn: () => api.get<{ items: MemberOrder[] }>("/api/members/orders"),
  });

  const logout = async () => {
    setBusy(true);
    try {
      await api.post("/api/members/logout");
      queryClient.clear();
      toast.success("Đã đăng xuất", "Hẹn gặp lại bạn ở lần tra cứu tiếp theo.");
      navigate("/");
    } catch (caught) {
      toast.error("Chưa đăng xuất được", errorMessage(caught));
    } finally {
      setBusy(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.del("/api/members/me");
      queryClient.clear();
      toast.success("Đã xoá dữ liệu cá nhân", "Tài khoản và quyền truy cập của bạn đã được gỡ bỏ.");
      navigate("/");
    } catch (caught) {
      toast.error("Chưa xoá được dữ liệu", errorMessage(caught));
    }
  };

  if (me.isLoading) {
    return (
      <section className="page-light-section" style={LIGHT_STYLE}>
        <div className="container">
          <p className="admin-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang kiểm tra phiên đăng nhập…
          </p>
        </div>
      </section>
    );
  }

  if (me.isError || !member) {
    return (
      <>
        <section className="page-light-section" style={LIGHT_STYLE}>
          <div className="container">
            <div className="admin-alerts">
              <article className="is-info">
                <Info aria-hidden="true" />
                <div>
                  <strong>Bạn chưa đăng nhập</strong>
                  <p>Đăng nhập để xem hồ sơ, lịch sử tra cứu, đơn hàng và quyền VIP của mình. Nếu chưa có tài khoản, bạn đăng ký ngay bên dưới.</p>
                </div>
              </article>
            </div>
          </div>
        </section>
        <MemberLoginPage />
      </>
    );
  }

  return (
    <>
      <section className="page-hero" style={DARK_STYLE}>
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <span className="page-kicker">
              <UserRound aria-hidden="true" /> Khu vực thành viên
            </span>
            <h1>
              <span className="page-hero__title-line">{member.name}</span>
              <em className="page-hero__title-line">tài khoản của tôi</em>
            </h1>
            <p>{member.email}</p>
          </div>
        </div>
      </section>

      <section className="page-light-section ux-account" style={LIGHT_STYLE}>
        <div className="container">
          <div className="lookup-workspace__grid">
            <div className="admin-card">
              <div className="admin-panel__head">
                <h2>Hồ sơ</h2>
              </div>
              <div className="admin-quick-grid">
                <div className="admin-quick">
                  Họ và tên
                  <small>{member.name}</small>
                </div>
                <div className="admin-quick">
                  Email
                  <small>{member.email}</small>
                </div>
              </div>
              <div className="admin-page__actions">
                <button className="button button--ghost" type="button" onClick={() => void logout()} disabled={busy}>
                  <LogOut aria-hidden="true" /> Đăng xuất
                </button>
                <button className="button button--danger" type="button" onClick={() => setConfirmDelete(true)}>
                  <Trash2 aria-hidden="true" /> Xoá dữ liệu cá nhân
                </button>
              </div>
              <p className="admin-hint">
                <Info aria-hidden="true" /> Xoá dữ liệu cá nhân sẽ gỡ tài khoản, lịch sử tra cứu và quyền truy cập nội dung của bạn.
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-panel__head">
                <h2>Quyền VIP</h2>
                <Link to="/dich-vu">Xem gói dịch vụ</Link>
              </div>
              {entitlements.length ? (
                <div className="admin-quick-grid">
                  {entitlements.map((entitlement, index) => (
                    <div className="admin-quick" key={entitlement._id ?? `${entitlement.type}-${index}`}>
                      <span>
                        <Crown aria-hidden="true" /> {ENTITLEMENT_LABELS[entitlement.type] ?? entitlement.type}
                      </span>
                      <small>
                        {entitlement.expiresAt
                          ? `Hết hạn ${formatDate(entitlement.expiresAt)}`
                          : "Không giới hạn thời gian"}
                        {entitlement.grantedAt ? ` · Cấp ngày ${formatDate(entitlement.grantedAt)}` : ""}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="admin-hint">
                  <Info aria-hidden="true" /> Tài khoản chưa có quyền VIP. Bạn có thể đặt mua gói dịch vụ để mở khoá nội dung chuyên sâu.
                </p>
              )}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-panel__head">
              <h2>Lịch sử tra cứu</h2>
            </div>
            {reports.isLoading ? (
              <p className="admin-loading">
                <Loader2 className="spin" aria-hidden="true" /> Đang tải lịch sử…
              </p>
            ) : reports.data?.items.length ? (
              <div className="article-list">
                {reports.data.items.map((report, index) => (
                  <article key={report._id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <small>
                        {lookupLabel(report.type)} · {formatDate(report.createdAt)}
                      </small>
                      <h3>{report.title || report.result?.headline || lookupLabel(report.type)}</h3>
                      {report.result?.subhead ? <p>{report.result.subhead}</p> : null}
                    </div>
                    <Link to={`/tra-cuu/ket-qua/${report._id}${report.shareToken ? `?token=${report.shareToken}` : ""}`} aria-label="Mở lại kết quả tra cứu">
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-hint">
                <Info aria-hidden="true" /> Chưa có kết quả tra cứu nào gắn với tài khoản này.{" "}
                <Link to="/tra-cuu">Bắt đầu tra cứu</Link>
              </p>
            )}
          </div>

          <div className="admin-card">
            <div className="admin-panel__head">
              <h2>Đơn hàng</h2>
            </div>
            {orders.isLoading ? (
              <p className="admin-loading">
                <Loader2 className="spin" aria-hidden="true" /> Đang tải đơn hàng…
              </p>
            ) : orders.data?.items.length ? (
              <div className="article-list">
                {orders.data.items.map((order, index) => (
                  <article key={order._id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <small>
                        {order.code} · {formatDate(order.createdAt)} · {formatPrice(order.amount)}
                      </small>
                      <h3>{order.serviceName}</h3>
                      <p>
                        <span className={`status-badge status-badge--${order.status}`}>
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </p>
                    </div>
                    <Link
                      to={`/dich-vu/don-hang/${order.code}${order.viewToken ? `?token=${order.viewToken}` : ""}`}
                      aria-label={`Xem đơn ${order.code}`}
                    >
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="admin-hint">
                <Info aria-hidden="true" /> Bạn chưa có đơn hàng nào. <Link to="/dich-vu">Xem các gói dịch vụ</Link>
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="page-dark-section" style={DARK_STYLE}>
        <div className="container">
          <div className="privacy-banner">
            <ShieldCheck aria-hidden="true" />
            <div>
              <strong>Quyền riêng tư dữ liệu</strong>
              <span>
                {settings.legal.disclaimer} Bạn có thể yêu cầu xoá toàn bộ dữ liệu cá nhân bất cứ lúc nào bằng nút “Xoá dữ liệu cá nhân” phía trên.
              </span>
            </div>
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={confirmDelete}
        tone="danger"
        title="Xoá dữ liệu cá nhân?"
        description="Tài khoản, lịch sử tra cứu và quyền truy cập nội dung của bạn sẽ bị gỡ bỏ. Hành động này không thể hoàn tác."
        confirmLabel="Xoá vĩnh viễn"
        cancelLabel="Giữ lại tài khoản"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={deleteAccount}
      />
    </>
  );
}
