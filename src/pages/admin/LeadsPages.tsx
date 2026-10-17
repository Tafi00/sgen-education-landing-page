import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, BellRing, Download, Loader2, Save } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { RESOURCES } from "../../admin/resources";
import { ResourceList, StatusBadge, formatCellValue } from "../../components/admin/ResourceList";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { SelectField, TextareaField } from "../../components/form/Field";
import { useToast } from "../../components/ui/Toast";
import { LOOKUP_LABELS, RESULTS_DISCLAIMER, type LookupType } from "../../../shared/lookup-types";

type LeadNotification = {
  resend?: string;
  telegram?: string;
  attempts?: number;
  lastError?: string;
  lastAttemptAt?: string | null;
};

type LeadItem = {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  birthDate?: string;
  message?: string;
  source?: string;
  sourceLabel?: string;
  payload?: unknown;
  status: string;
  note?: string;
  assignedTo?: string | null;
  notification?: LeadNotification;
  createdAt?: string;
  updatedAt?: string;
};

type AdminUser = { _id: string; name: string; email: string; role: string };

type LookupItem = {
  _id: string;
  type: LookupType;
  title: string;
  source?: string;
  createdAt?: string;
};

type RelatedOrder = {
  _id: string;
  code: string;
  serviceName: string;
  amount: number;
  status: string;
  createdAt?: string;
};

const STATUS_OPTIONS = [
  { value: "new", label: "Mới" },
  { value: "contacted", label: "Đã liên hệ" },
  { value: "won", label: "Chốt" },
  { value: "lost", label: "Không tiếp tục" },
];

function formatDateTime(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function textValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function formatCurrency(value: unknown) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

/** Chuyển payload tra cứu thành các dòng khoá — giá trị, không dump JSON thô. */
function buildPayloadRows(payload: unknown): { key: string; value: string }[] {
  const rows: { key: string; value: string }[] = [];
  if (!payload || typeof payload !== "object") return rows;
  const walk = (prefix: string, value: unknown) => {
    if (value === null || value === undefined || value === "") {
      rows.push({ key: prefix, value: "—" });
      return;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        rows.push({ key: prefix, value: "—" });
        return;
      }
      if (value.every((item) => item === null || typeof item !== "object")) {
        rows.push({ key: prefix, value: value.map((item) => String(item)).join(", ") });
        return;
      }
      value.forEach((item, index) => walk(`${prefix} #${index + 1}`, item));
      return;
    }
    if (typeof value === "object") {
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        walk(prefix ? `${prefix} · ${key}` : key, nested);
      }
      return;
    }
    rows.push({ key: prefix, value: String(value) });
  };
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) walk(key, value);
  return rows;
}

function leadCell(row: Record<string, unknown>, key: string): ReactNode {
  if (key === "status") return <StatusBadge status={String(row.status ?? "")} />;
  const notification = row.notification as LeadNotification | undefined;
  if (key === "notification.resend") return <StatusBadge status={notification?.resend ?? "skipped"} />;
  if (key === "notification.telegram") return <StatusBadge status={notification?.telegram ?? "skipped"} />;
  if (key === "createdAt") return formatCellValue(row.createdAt, "date");
  return formatCellValue(row[key], undefined);
}

export function LeadsListPage() {
  return <ResourceList config={RESOURCES.leads} renderCell={leadCell} />;
}

export function LeadDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [confirming, setConfirming] = useState(false);

  const leadQuery = useQuery({
    queryKey: ["admin", "leads", id],
    queryFn: () => api.get<{ item: LeadItem }>(`/api/admin/leads/${id}`),
    enabled: Boolean(id),
  });
  const lead = leadQuery.data?.item;

  const usersQuery = useQuery({
    queryKey: ["admin", "auth-users"],
    queryFn: () => api.get<{ items: AdminUser[] }>("/api/admin/auth/users"),
    retry: false,
  });

  const lookupsQuery = useQuery({
    queryKey: ["admin", "leads", id, "lookups"],
    enabled: Boolean(id),
    queryFn: () => api.get<{ items: LookupItem[]; total: number }>("/api/admin/lookups", { query: { leadId: id, pageSize: 100 } }),
  });

  const orderKeyword = lead?.phone || lead?.email || "";
  const ordersQuery = useQuery({
    queryKey: ["admin", "leads", id, "orders", orderKeyword],
    enabled: Boolean(orderKeyword),
    queryFn: () => api.get<{ items: RelatedOrder[] }>("/api/admin/orders", { query: { q: orderKeyword, pageSize: 100 } }),
  });

  useEffect(() => {
    if (!lead) return;
    setStatus(lead.status);
    setNote(lead.note ?? "");
    setAssignedTo(lead.assignedTo ?? "");
  }, [lead]);

  const notifyMutation = useMutation({
    mutationFn: () => api.post<{ ok: boolean; queued: boolean }>(`/api/admin/leads/${id}/notify`),
    onSuccess: async () => {
      toast.success("Đã gửi lại thông báo", "Hệ thống đang xử lý gửi lại cho các kênh đang bật.");
      await queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
    },
    onError: (error) => toast.error("Không gửi được thông báo", errorMessage(error)),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { status: string; note: string; assignedTo: string | null }) =>
      api.patch<{ item: LeadItem }>(`/api/admin/leads/${id}`, payload),
    onSuccess: async () => {
      toast.success("Đã cập nhật lead");
      setConfirming(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
    },
    onError: (error) => {
      setConfirming(false);
      toast.error("Không lưu được thay đổi", errorMessage(error));
    },
  });

  const payloadRows = useMemo(() => buildPayloadRows(lead?.payload), [lead?.payload]);

  if (leadQuery.isLoading) {
    return (
      <section className="admin-page admin-loading">
        <Loader2 className="spin" aria-hidden="true" />
        <p>Đang tải chi tiết lead…</p>
      </section>
    );
  }

  if (leadQuery.isError || !lead) {
    return (
      <section className="admin-page">
        <Link to="/admin/leads" className="admin-back">
          <ArrowLeft aria-hidden="true" /> Danh sách leads
        </Link>
        <p className="admin-error" role="alert">
          <AlertTriangle aria-hidden="true" /> {errorMessage(leadQuery.error ?? new Error("Không tìm thấy lead."))}
        </p>
      </section>
    );
  }

  const notification = lead.notification ?? {};
  const users = usersQuery.data?.items ?? [];
  const currentAssigneeName = lead.assignedTo
    ? users.find((user) => user._id === lead.assignedTo)?.name ?? "Không xác định"
    : "Chưa phân công";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status !== lead.status) {
      setConfirming(true);
      return;
    }
    saveMutation.mutate({ status, note, assignedTo: assignedTo || null });
  };

  return (
    <section className="admin-page">
      <Link to="/admin/leads" className="admin-back">
        <ArrowLeft aria-hidden="true" /> Danh sách leads
      </Link>

      <header className="admin-page__header">
        <div>
          <h1>{lead.name}</h1>
          <p className="admin-page__meta">
            <StatusBadge status={lead.status} />
            <span className="muted">Tạo lúc {formatDateTime(lead.createdAt)}</span>
            <span className="muted">Cập nhật {formatDateTime(lead.updatedAt)}</span>
          </p>
        </div>
        <div className="admin-page__actions">
          <a className="button button--ghost" href="/api/admin/leads/export/csv" download>
            <Download aria-hidden="true" /> Xuất CSV
          </a>
        </div>
      </header>

      <div className="admin-card">
        <h2>Thông tin khách</h2>
        <div className="admin-form__grid">
          <p>
            <span className="muted">Họ tên</span>
            <strong>{textValue(lead.name)}</strong>
          </p>
          <p>
            <span className="muted">Điện thoại</span>
            <strong>{textValue(lead.phone)}</strong>
          </p>
          <p>
            <span className="muted">Email</span>
            <strong>{textValue(lead.email)}</strong>
          </p>
          <p>
            <span className="muted">Ngày sinh</span>
            <strong>{textValue(lead.birthDate)}</strong>
          </p>
          <p>
            <span className="muted">Nguồn</span>
            <strong>{textValue(lead.sourceLabel || lead.source)}</strong>
          </p>
          <p>
            <span className="muted">Thời điểm</span>
            <strong>{formatDateTime(lead.createdAt)}</strong>
          </p>
        </div>
      </div>

      <div className="admin-card">
        <h2>Nội dung tin nhắn</h2>
        <p>{lead.message?.trim() ? lead.message : <span className="muted">Khách không để lại lời nhắn.</span>}</p>
      </div>

      <div className="admin-card">
        <h2>Dữ liệu tra cứu</h2>
        {payloadRows.length ? (
          <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Trường</th>
                <th>Giá trị</th>
              </tr>
            </thead>
            <tbody>
              {payloadRows.map((row) => (
                <tr key={row.key}>
                  <td>{row.key}</td>
                  <td>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <p className="muted">Khách không gửi kèm dữ liệu tra cứu nào.</p>
        )}
        <p className="admin-hint">{RESULTS_DISCLAIMER}</p>
      </div>

      <div className="admin-card">
        <h2>Lịch sử tra cứu</h2>
        {lookupsQuery.isLoading ? (
          <p className="admin-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải báo cáo tra cứu…
          </p>
        ) : lookupsQuery.isError ? (
          <p className="admin-error" role="alert">
            <AlertTriangle aria-hidden="true" /> {errorMessage(lookupsQuery.error)}
          </p>
        ) : (lookupsQuery.data?.items.length ?? 0) === 0 ? (
          <p className="muted">Lead chưa có báo cáo tra cứu nào.</p>
        ) : (
          <div className="data-table__scroll">
            <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Loại</th>
                  <th scope="col">Tiêu đề</th>
                  <th scope="col">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {lookupsQuery.data?.items.map((lookup) => (
                  <tr key={lookup._id}>
                    <td>{LOOKUP_LABELS[lookup.type] ?? lookup.type}</td>
                    <td>{textValue(lookup.title)}</td>
                    <td>{formatDateTime(lookup.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {(ordersQuery.data?.items.length ?? 0) > 0 ? (
        <div className="admin-card">
          <h2>Đơn hàng liên quan</h2>
          <div className="data-table__scroll">
            <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Mã đơn</th>
                  <th scope="col">Gói dịch vụ</th>
                  <th scope="col">Số tiền</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Thời điểm</th>
                </tr>
              </thead>
              <tbody>
                {ordersQuery.data?.items.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <Link to={`/admin/don-hang/${order._id}`}>{order.code}</Link>
                    </td>
                    <td>{textValue(order.serviceName)}</td>
                    <td>{formatCurrency(order.amount)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </div>
      ) : null}

      <div className="admin-card">
        <h2>Trạng thái thông báo</h2>
        <div className="admin-form__grid">
          <p>
            <span className="muted">Email (Resend)</span>
            <StatusBadge status={notification.resend ?? "skipped"} />
          </p>
          <p>
            <span className="muted">Telegram</span>
            <StatusBadge status={notification.telegram ?? "skipped"} />
          </p>
          <p>
            <span className="muted">Số lần thử</span>
            <strong>{notification.attempts ?? 0}</strong>
          </p>
          <p>
            <span className="muted">Lần thử gần nhất</span>
            <strong>{formatDateTime(notification.lastAttemptAt)}</strong>
          </p>
        </div>
        {notification.lastError ? (
          <p className="admin-error">
            <AlertTriangle aria-hidden="true" /> Lỗi gần nhất: {notification.lastError}
          </p>
        ) : null}
        <button
          type="button"
          className="button button--ghost"
          onClick={() => notifyMutation.mutate()}
          disabled={notifyMutation.isPending}
        >
          {notifyMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <BellRing aria-hidden="true" />}
          Gửi lại thông báo
        </button>
      </div>

      <form className="admin-card card admin-form" onSubmit={submit}>
        <h2>Cập nhật trạng thái, phụ trách &amp; ghi chú</h2>
        <div className="admin-form__grid">
          <SelectField
            label="Trạng thái"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            options={STATUS_OPTIONS}
          />
          <SelectField
            label="Người phụ trách"
            value={assignedTo}
            disabled={usersQuery.isError}
            onChange={(event) => setAssignedTo(event.target.value)}
            options={[{ value: "", label: "Chưa phân công" }, ...users.map((user) => ({ value: user._id, label: `${user.name} (${user.email})` }))]}
            hint="Gán lead cho một tài khoản quản trị để theo dõi."
          />
          <TextareaField
            label="Ghi chú nội bộ"
            rows={4}
            wide
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Ví dụ: đã gọi tư vấn, khách hẹn gọi lại…"
          />
        </div>
        <p className="admin-hint">Người phụ trách hiện tại: {currentAssigneeName}</p>
        {usersQuery.isError ? <p className="admin-hint">Bạn không có quyền xem danh sách nhân viên.</p> : null}
        <div className="admin-form__bar">
          <button type="button" className="button button--ghost" onClick={() => navigate("/admin/leads")} disabled={saveMutation.isPending}>
            Quay lại
          </button>
          <button type="submit" className="button button--primary" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            Lưu thay đổi
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={confirming}
        title="Đổi trạng thái lead?"
        description={`Trạng thái sẽ chuyển sang "${STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status}".`}
        confirmLabel="Xác nhận đổi"
        tone="primary"
        onCancel={() => setConfirming(false)}
        onConfirm={() => saveMutation.mutateAsync({ status, note, assignedTo: assignedTo || null }).then(() => undefined)}
      />
    </section>
  );
}
