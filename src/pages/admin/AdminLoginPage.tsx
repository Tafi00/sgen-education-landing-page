import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Eye, EyeOff, Info, Loader2, Lock, LogIn, Mail, ShieldCheck } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { TextField } from "../../components/form/Field";
import { useToast } from "../../components/ui/Toast";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor";
  mustChangePassword?: boolean;
};

type SessionResponse = { admin: AdminUser | null };

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const toast = useToast();

  const meQuery = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => api.get<SessionResponse>("/api/admin/auth/me"),
    staleTime: 60 * 1000,
    retry: 0,
  });

  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  if (meQuery.data?.admin) {
    return <Navigate to={from} replace />;
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    try {
      // Gọi endpoint an toàn trước để máy chủ cấp cookie CSRF cho lần POST kế tiếp.
      try {
        await api.get<SessionResponse>("/api/admin/auth/me");
      } catch {
        // Bỏ qua: cookie CSRF đã được cấp ở lần gọi này; lỗi thật sẽ lộ ra ở bước đăng nhập.
      }
      const result = await api.post<SessionResponse>("/api/admin/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      const admin = result.admin;
      queryClient.setQueryData<SessionResponse>(["admin-session"], { admin });
      toast.success("Đăng nhập thành công", admin ? `Xin chào ${admin.name}.` : undefined);
      navigate(from, { replace: true });
    } catch (submitError) {
      setPassword("");
      setError(errorMessage(submitError));
      toast.error("Đăng nhập thất bại", errorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="admin-login-stage">
      <section className="admin-login-card">
        <header>
          <h1>
            <ShieldCheck aria-hidden="true" /> Đăng nhập quản trị
          </h1>
          <p>Dùng tài khoản quản trị để quản lý nội dung, leads và đơn hàng.</p>
        </header>

        <form className="admin-form" onSubmit={submit} noValidate>
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="username"
            placeholder="admin@sgen.vn"
            icon={<Mail aria-hidden="true" />}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={submitting}
          />
          <div className="admin-password-field">
            <TextField
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              icon={<Lock aria-hidden="true" />}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={submitting}
            />
            <button
              type="button"
              className="admin-password-field__toggle"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              aria-pressed={showPassword}
              disabled={submitting}
            >
              {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </button>
          </div>

          {error ? (
            <p className="admin-login-error" role="alert">
              <AlertTriangle aria-hidden="true" /> {error}
            </p>
          ) : null}

          <button type="submit" className="button button--primary" disabled={submitting || !email || !password}>
            {submitting ? <Loader2 className="spin" aria-hidden="true" /> : <LogIn aria-hidden="true" />}
            {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>

        <p className="admin-login-hint">
          <Info aria-hidden="true" /> Tài khoản đầu tiên tạo bằng lệnh <code>npm run create-admin</code>.
        </p>
      </section>
    </main>
  );
}
