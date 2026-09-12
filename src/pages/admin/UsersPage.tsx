import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, KeyRound, Loader2, Lock, Plus, Save, ShieldCheck, Trash2, Unlock } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { SelectField, TextField } from "../../components/form/Field";
import { useToast } from "../../components/ui/Toast";

type AdminRole = "admin" | "editor";
type AdminStatus = "active" | "locked";

type UserRecord = {
  _id: string;
  name: string;
  email: string;
  role: AdminRole;
  status?: AdminStatus;
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
};

type SessionResponse = { admin: { id: string; name: string; email: string; role: AdminRole; mustChangePassword?: boolean } | null };

const ROLE_OPTIONS = [
  { value: "admin", label: "Quản trị viên" },
  { value: "editor", label: "Biên tập viên" },
];

const ROLE_LABELS: Record<AdminRole, string> = { admin: "Quản trị viên", editor: "Biên tập viên" };

function formatDateTime(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", email: "", role: "editor" as AdminRole, password: "" });
  const [pendingDelete, setPendingDelete] = useState<UserRecord | null>(null);
  const [resetTarget, setResetTarget] = useState<UserRecord | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const meQuery = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => api.get<SessionResponse>("/api/admin/auth/me"),
    staleTime: 60 * 1000,
  });
  const currentAdmin = meQuery.data?.admin ?? null;

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api.get<{ items: UserRecord[] }>("/api/admin/auth/users"),
  });

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; email: string; role: AdminRole; password: string }) =>
      api.post<{ item: UserRecord }>("/api/admin/auth/users", payload),
    onSuccess: async (result) => {
      toast.success("Đã tạo tài khoản", `${result.item.name} (${result.item.email}).`);
      setCreateForm({ name: "", email: "", role: "editor", password: "" });
      setCreateOpen(false);
      await invalidateUsers();
    },
    onError: (error) => toast.error("Không tạo được tài khoản", errorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      api.patch<{ item: UserRecord }>(`/api/admin/auth/users/${id}`, patch),
    onSuccess: async () => {
      toast.success("Đã cập nhật tài khoản");
      setResetTarget(null);
      setResetPassword("");
      await invalidateUsers();
    },
    onError: (error) => toast.error("Không cập nhật được", errorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del<{ ok: boolean }>(`/api/admin/auth/users/${id}`),
    onSuccess: async () => {
      toast.success("Đã xoá tài khoản");
      setPendingDelete(null);
      await invalidateUsers();
    },
    onError: (error) => {
      setPendingDelete(null);
      toast.error("Không xoá được tài khoản", errorMessage(error));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) => api.post<{ ok: boolean }>("/api/admin/auth/password", payload),
    onSuccess: async () => {
      toast.success("Đã đổi mật khẩu", "Hãy dùng mật khẩu mới cho lần đăng nhập kế tiếp.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin-session"] });
    },
    onError: (error) => toast.error("Không đổi được mật khẩu", errorMessage(error)),
  });

  const submitCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate({
      name: createForm.name.trim(),
      email: createForm.email.trim().toLowerCase(),
      role: createForm.role,
      password: createForm.password,
    });
  };

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận chưa khớp", "Vui lòng nhập lại mật khẩu xác nhận.");
      return;
    }
    passwordMutation.mutate({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
  };

  const users = usersQuery.data?.items ?? [];

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Tài khoản quản trị</h1>
          <p>Quản lý tài khoản đăng nhập vào CMS. Bạn không thể tự khoá hoặc tự xoá tài khoản đang đăng nhập, và hệ thống luôn cần ít nhất một quản trị viên.</p>
        </div>
        <button type="button" className="button button--primary" onClick={() => setCreateOpen((open) => !open)}>
          <Plus aria-hidden="true" /> Thêm tài khoản
        </button>
      </header>

      {currentAdmin?.mustChangePassword ? (
        <p className="admin-error" role="alert">
          <AlertTriangle aria-hidden="true" /> Tài khoản của bạn đang yêu cầu đổi mật khẩu. Hãy dùng mục “Đổi mật khẩu của tôi” bên dưới.
        </p>
      ) : null}

      {createOpen ? (
        <form className="admin-card card admin-form" onSubmit={submitCreate}>
          <h2>Tạo tài khoản mới</h2>
          <div className="admin-form__grid">
            <TextField
              label="Họ tên"
              required
              value={createForm.name}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <TextField
              label="Email"
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            <SelectField
              label="Vai trò"
              value={createForm.role}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, role: e.target.value as AdminRole }))}
              options={ROLE_OPTIONS}
            />
            <TextField
              label="Mật khẩu ban đầu"
              type="password"
              required
              hint="Tối thiểu 8 ký tự. Người dùng sẽ được yêu cầu đổi khi đăng nhập."
              value={createForm.password}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
            />
          </div>
          <div className="admin-form__bar">
            <button type="button" className="button button--ghost" onClick={() => setCreateOpen(false)} disabled={createMutation.isPending}>
              Đóng
            </button>
            <button type="submit" className="button button--primary" disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
              Tạo tài khoản
            </button>
          </div>
        </form>
      ) : null}

      <div className="admin-card">
        <h2>Danh sách tài khoản</h2>
        {usersQuery.isLoading ? (
          <p className="admin-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải danh sách…
          </p>
        ) : usersQuery.isError ? (
          <p className="admin-error" role="alert">
            <AlertTriangle aria-hidden="true" /> {errorMessage(usersQuery.error)}
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Đăng nhập gần nhất</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = currentAdmin?.id === user._id;
                const isLocked = user.status === "locked";
                return (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name}</strong>
                      <br />
                      <span className="muted">{user.email}</span>
                      {isSelf ? <span className="status-badge status-badge--active">Bạn</span> : null}
                      {user.mustChangePassword ? <span className="status-badge status-badge--pending">Cần đổi mật khẩu</span> : null}
                    </td>
                    <td>
                      <SelectField
                        label=""
                        value={user.role}
                        aria-label={`Vai trò của ${user.name}`}
                        onChange={(e) => updateMutation.mutate({ id: user._id, patch: { role: e.target.value } })}
                        options={ROLE_OPTIONS}
                        disabled={updateMutation.isPending}
                      />
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${isLocked ? "locked" : "active"}`}>
                        {isLocked ? "Đang khoá" : "Đang hoạt động"}
                      </span>
                    </td>
                    <td>{formatDateTime(user.lastLoginAt)}</td>
                    <td>
                      <div className="admin-page__actions">
                        <button
                          type="button"
                          className="button button--ghost"
                          onClick={() => updateMutation.mutate({ id: user._id, patch: { status: isLocked ? "active" : "locked" } })}
                          disabled={isSelf || updateMutation.isPending}
                          title={isSelf ? "Không thể tự khoá tài khoản đang đăng nhập" : undefined}
                        >
                          {isLocked ? <Unlock aria-hidden="true" /> : <Lock aria-hidden="true" />}
                          {isLocked ? "Mở khoá" : "Khoá"}
                        </button>
                        <button
                          type="button"
                          className="button button--ghost"
                          onClick={() => { setResetTarget(user); setResetPassword(""); }}
                          disabled={updateMutation.isPending}
                        >
                          <KeyRound aria-hidden="true" /> Đặt lại mật khẩu
                        </button>
                        <button
                          type="button"
                          className="button button--danger"
                          onClick={() => setPendingDelete(user)}
                          disabled={isSelf}
                          title={isSelf ? "Không thể tự xoá tài khoản đang đăng nhập" : undefined}
                        >
                          <Trash2 aria-hidden="true" /> Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!users.length ? (
                <tr>
                  <td colSpan={5}>Chưa có tài khoản nào.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        )}
        <p className="admin-hint">
          <ShieldCheck aria-hidden="true" /> Quy tắc: không tự khoá/xoá chính mình và hệ thống luôn cần ít nhất một tài khoản quản trị viên.
        </p>
      </div>

      <form className="admin-card card admin-form" onSubmit={submitPassword}>
        <h2>Đổi mật khẩu của tôi</h2>
        <div className="admin-form__grid">
          <TextField
            label="Mật khẩu hiện tại"
            type="password"
            autoComplete="current-password"
            required
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
          />
          <TextField
            label="Mật khẩu mới"
            type="password"
            autoComplete="new-password"
            required
            hint="Tối thiểu 8 ký tự."
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
          />
          <TextField
            label="Xác nhận mật khẩu mới"
            type="password"
            autoComplete="new-password"
            required
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          />
        </div>
        <div className="admin-form__bar">
          <button type="submit" className="button button--primary" disabled={passwordMutation.isPending}>
            {passwordMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <KeyRound aria-hidden="true" />}
            Đổi mật khẩu
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(resetTarget)}
        title={`Đặt lại mật khẩu cho ${resetTarget?.name ?? ""}?`}
        description="Người dùng sẽ phải đổi mật khẩu ở lần đăng nhập kế tiếp."
        confirmLabel="Đặt lại"
        tone="primary"
        onCancel={() => setResetTarget(null)}
        onConfirm={() => {
          if (!resetTarget || !resetPassword) return;
          return updateMutation.mutateAsync({ id: resetTarget._id, patch: { password: resetPassword } }).then(() => undefined);
        }}
      >
        <TextField
          label="Mật khẩu mới"
          type="password"
          autoComplete="new-password"
          required
          value={resetPassword}
          onChange={(e) => setResetPassword(e.target.value)}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Xoá tài khoản ${pendingDelete?.name ?? ""}?`}
        description="Hành động này không thể hoàn tác."
        confirmLabel="Xoá vĩnh viễn"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => (pendingDelete ? deleteMutation.mutateAsync(pendingDelete._id).then(() => undefined) : undefined)}
      />
    </section>
  );
}
