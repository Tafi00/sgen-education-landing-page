import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, BadgeCheck, Ban, Loader2, Receipt, Save, ShieldOff } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { RESOURCES } from "../../admin/resources";
import { ResourceList, StatusBadge, formatCellValue } from "../../components/admin/ResourceList";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { TextareaField } from "../../components/form/Field";
import { useToast } from "../../components/ui/Toast";

type OrderItem = {
  _id: string;
  code: string;
  serviceSlug: string;
  serviceName: string;
  amount: number;
  method?: string;
  status: string;
  proofImage?: string;
  paidAt?: string | null;
  adminNote?: string;
  entitlementGrantedAt?: string | null;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  memberId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ActionKey = "approve" | "cancel" | "grant" | "revoke";

type AuditItem = { _id: string; action: string; actorEmail?: string; createdAt?: string };

type EntitlementItem = {
  _id: string;
  type: string;
  active: boolean;
  grantedAt?: string | null;
  expiresAt?: string | null;
  note?: string;
};

const AUDIT_ACTIONS: Record<string, string> = {
  "order.approve": "Xác nhận thanh toán",
  "order.cancel": "Huỷ đơn hàng",
  "order.grant": "Cấp quyền nội dung",
  "order.revoke": "Thu hồi quyền nội dung",
  "order.update": "Cập nhật đơn hàng",
};

const ENTITLEMENT_LABELS: Record<string, string> = {
  "vip-numerology": "VIP Thần số học",
  lifetime: "Trọn đời",
};

const ACTIONS: Record<ActionKey, { label: string; title: string; description: string; tone: "danger" | "primary" }> = {
  approve: {
    label: "Xác nhận đã thanh toán",
    title: "Xác nhận đơn đã thanh toán?",
    description: "Đơn chuyển sang trạng thái đã thanh toán và hệ thống sẽ tự cấp quyền nội dung tương ứng.",
    tone: "primary",
  },
  cancel: {
    label: "Huỷ đơn",
    title: "Huỷ đơn hàng này?",
    description: "Đơn chuyển sang trạng thái đã huỷ và mọi quyền nội dung đã cấp từ đơn sẽ bị thu hồi.",
    tone: "danger",
  },
  grant: {
    label: "Cấp quyền",
    title: "Cấp quyền nội dung cho đơn này?",
    description: "Hệ thống cấp quyền truy cập nội dung trả phí theo gói của đơn hàng.",
    tone: "primary",
  },
  revoke: {
    label: "Thu hồi quyền",
    title: "Thu hồi quyền nội dung của đơn?",
    description: "Các quyền nội dung được cấp từ đơn hàng này sẽ bị vô hiệu hoá.",
    tone: "danger",
  },
};

const METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Chuyển khoản",
  vietqr: "VietQR",
};

function formatDateTime(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatCurrency(value: unknown) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function textValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function orderCell(row: Record<string, unknown>, key: string): ReactNode {
  if (key === "status") return <StatusBadge status={String(row.status ?? "")} />;
  if (key === "amount") return formatCellValue(row.amount, "currency");
  if (key === "createdAt") return formatCellValue(row.createdAt, "date");
  return formatCellValue(row[key], undefined);
}

export function OrdersListPage() {
  return <ResourceList config={RESOURCES.orders} renderCell={orderCell} />;
}

export function OrderDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [adminNote, setAdminNote] = useState("");
  const [pendingAction, setPendingAction] = useState<ActionKey | null>(null);

  const orderQuery = useQuery({
    queryKey: ["admin", "orders", id],
    queryFn: () => api.get<{ item: OrderItem }>(`/api/admin/orders/${id}`),
    enabled: Boolean(id),
  });
  const order = orderQuery.data?.item;

  const auditQuery = useQuery({
    queryKey: ["admin", "orders", id, "audit"],
    enabled: Boolean(id),
    queryFn: () => api.get<{ items: AuditItem[] }>("/api/admin/dashboard/audit", { query: { documentId: id, pageSize: 50 } }),
  });

  const memberId = order?.memberId ?? "";
  const entitlementsQuery = useQuery({
    queryKey: ["admin", "orders", id, "entitlements", memberId],
    enabled: Boolean(memberId),
    queryFn: () => api.get<{ items: EntitlementItem[] }>("/api/admin/entitlements", { query: { memberId, pageSize: 100 } }),
  });

  useEffect(() => {
    if (!order) return;
    setAdminNote(order.adminNote ?? "");
  }, [order]);

  const actionMutation = useMutation({
    mutationFn: (key: ActionKey) => api.post(`/api/admin/orders/${id}/${key}`, key === "cancel" ? { note: adminNote } : undefined),
    onSuccess: async (_result, key) => {
      toast.success(ACTIONS[key].label + " thành công");
      setPendingAction(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (error) => {
      setPendingAction(null);
      toast.error("Thao tác thất bại", errorMessage(error));
    },
  });

  const noteMutation = useMutation({
    mutationFn: (payload: { adminNote: string }) => api.patch<{ item: OrderItem }>(`/api/admin/orders/${id}`, payload),
    onSuccess: async () => {
      toast.success("Đã lưu ghi chú");
      await queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
    onError: (error) => toast.error("Không lưu được ghi chú", errorMessage(error)),
  });

  if (orderQuery.isLoading) {
    return (
      <section className="admin-page admin-loading">
        <Loader2 className="spin" aria-hidden="true" />
        <p>Đang tải chi tiết đơn hàng…</p>
      </section>
    );
  }

  if (orderQuery.isError || !order) {
    return (
      <section className="admin-page">
        <Link to="/admin/don-hang" className="admin-back">
          <ArrowLeft aria-hidden="true" /> Danh sách đơn hàng
        </Link>
        <p className="admin-error" role="alert">
          <AlertTriangle aria-hidden="true" /> {errorMessage(orderQuery.error ?? new Error("Không tìm thấy đơn hàng."))}
        </p>
      </section>
    );
  }

  const submitNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    noteMutation.mutate({ adminNote });
  };

  const pending = pendingAction ? ACTIONS[pendingAction] : null;

  return (
    <section className="admin-page">
      <Link to="/admin/don-hang" className="admin-back">
        <ArrowLeft aria-hidden="true" /> Danh sách đơn hàng
      </Link>

      <header className="admin-page__header">
        <div>
          <h1>Đơn {order.code}</h1>
          <p className="admin-page__meta">
            <StatusBadge status={order.status} />
            <span className="muted">Tạo lúc {formatDateTime(order.createdAt)}</span>
          </p>
        </div>
      </header>

      <div className="admin-card">
        <h2>Thông tin đơn hàng</h2>
        <div className="admin-form__grid">
          <p>
            <span className="muted">Mã đơn</span>
            <strong>{textValue(order.code)}</strong>
          </p>
          <p>
            <span className="muted">Gói dịch vụ</span>
            <strong>{textValue(order.serviceName)}</strong>
          </p>
          <p>
            <span className="muted">Số tiền</span>
            <strong>{formatCurrency(order.amount)}</strong>
          </p>
          <p>
            <span className="muted">Phương thức</span>
            <strong>{METHOD_LABELS[order.method ?? ""] ?? textValue(order.method)}</strong>
          </p>
          <p>
            <span className="muted">Khách hàng</span>
            <strong>{textValue(order.customerName)}</strong>
          </p>
          <p>
            <span className="muted">Điện thoại</span>
            <strong>{textValue(order.customerPhone)}</strong>
          </p>
          <p>
            <span className="muted">Email</span>
            <strong>{textValue(order.customerEmail)}</strong>
          </p>
          <p>
            <span className="muted">Thời điểm tạo</span>
            <strong>{formatDateTime(order.createdAt)}</strong>
          </p>
          <p>
            <span className="muted">Xác nhận thanh toán</span>
            <strong>{formatDateTime(order.paidAt)}</strong>
          </p>
          <p>
            <span className="muted">Cấp quyền gần nhất</span>
            <strong>{formatDateTime(order.entitlementGrantedAt)}</strong>
          </p>
        </div>
      </div>

      <div className="admin-card">
        <h2>Thành viên liên kết</h2>
        {order.memberId ? (
          <p>
            Đơn được gắn với tài khoản thành viên. <Link to={`/admin/thanh-vien/${order.memberId}`}>Mở hồ sơ thành viên</Link>
          </p>
        ) : (
          <p className="muted">Đơn không gắn tài khoản thành viên.</p>
        )}
      </div>

      {order.memberId ? (
        <div className="admin-card">
          <h2>Quyền đã cấp cho thành viên</h2>
          {entitlementsQuery.isLoading ? (
            <p className="admin-loading">
              <Loader2 className="spin" aria-hidden="true" /> Đang tải quyền nội dung…
            </p>
          ) : entitlementsQuery.isError ? (
            <p className="admin-error" role="alert">
              <AlertTriangle aria-hidden="true" /> {errorMessage(entitlementsQuery.error)}
            </p>
          ) : (entitlementsQuery.data?.items.length ?? 0) === 0 ? (
            <p className="muted">Thành viên chưa có quyền nội dung nào.</p>
          ) : (
            <div className="data-table__scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Loại quyền</th>
                    <th scope="col">Ngày cấp</th>
                    <th scope="col">Hạn dùng</th>
                    <th scope="col">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {entitlementsQuery.data?.items.map((entitlement) => {
                    const expired = Boolean(entitlement.expiresAt && new Date(entitlement.expiresAt).getTime() < Date.now());
                    return (
                      <tr key={entitlement._id}>
                        <td>{ENTITLEMENT_LABELS[entitlement.type] ?? entitlement.type}</td>
                        <td>{formatDateTime(entitlement.grantedAt)}</td>
                        <td>{entitlement.expiresAt ? formatDateTime(entitlement.expiresAt) : "Không giới hạn"}</td>
                        <td>
                          {entitlement.active ? <StatusBadge status={expired ? "expired" : "active"} /> : <span className="status-badge status-badge--expired">Đã thu hồi</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <p className="admin-hint">Nút Cấp quyền ở khu thao tác chỉ hoạt động khi đơn hàng gắn với thành viên.</p>
        </div>
      ) : null}

      <div className="admin-card">
        <h2>Dòng thời gian trạng thái</h2>
        {auditQuery.isLoading ? (
          <p className="admin-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải lịch sử thao tác…
          </p>
        ) : auditQuery.isError ? (
          <p className="admin-error" role="alert">
            <AlertTriangle aria-hidden="true" /> {errorMessage(auditQuery.error)}
          </p>
        ) : (auditQuery.data?.items.length ?? 0) === 0 ? (
          <p className="muted">Chưa có ghi nhận thao tác nào cho đơn hàng này.</p>
        ) : (
          <div className="data-table__scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Thời gian</th>
                  <th scope="col">Người thực hiện</th>
                  <th scope="col">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {auditQuery.data?.items.map((entry) => (
                  <tr key={entry._id}>
                    <td>{formatDateTime(entry.createdAt)}</td>
                    <td>{textValue(entry.actorEmail)}</td>
                    <td>{AUDIT_ACTIONS[entry.action] ?? entry.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-card">
        <h2>Ảnh biên lai</h2>
        {order.proofImage ? (
          <div className="admin-media-card">
            <a href={order.proofImage} target="_blank" rel="noreferrer">
              <img src={order.proofImage} alt={`Biên lai đơn ${order.code}`} />
            </a>
            <a className="button button--ghost" href={order.proofImage} target="_blank" rel="noreferrer">
              <Receipt aria-hidden="true" /> Mở ảnh ở tab mới
            </a>
          </div>
        ) : (
          <p className="muted">Khách chưa tải lên ảnh biên lai.</p>
        )}
      </div>

      <div className="admin-card">
        <h2>Thao tác xử lý</h2>
        <div className="admin-page__actions">
          <button
            type="button"
            className="button button--primary"
            onClick={() => setPendingAction("approve")}
            disabled={actionMutation.isPending || order.status === "paid"}
          >
            <BadgeCheck aria-hidden="true" /> Xác nhận đã thanh toán
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setPendingAction("grant")}
            disabled={actionMutation.isPending}
          >
            <BadgeCheck aria-hidden="true" /> Cấp quyền
          </button>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => setPendingAction("revoke")}
            disabled={actionMutation.isPending}
          >
            <ShieldOff aria-hidden="true" /> Thu hồi quyền
          </button>
          <button
            type="button"
            className="button button--danger"
            onClick={() => setPendingAction("cancel")}
            disabled={actionMutation.isPending || order.status === "cancelled"}
          >
            <Ban aria-hidden="true" /> Huỷ đơn
          </button>
        </div>
      </div>

      <form className="admin-card card admin-form" onSubmit={submitNote}>
        <h2>Ghi chú quản trị</h2>
        <TextareaField
          label="Ghi chú"
          rows={4}
          wide
          value={adminNote}
          onChange={(event) => setAdminNote(event.target.value)}
          placeholder="Ví dụ: đã đối chiếu sao kê ngân hàng ngày…"
        />
        <div className="admin-form__bar">
          <button type="button" className="button button--ghost" onClick={() => navigate("/admin/don-hang")} disabled={noteMutation.isPending}>
            Quay lại
          </button>
          <button type="submit" className="button button--primary" disabled={noteMutation.isPending}>
            {noteMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
            Lưu ghi chú
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pending?.title ?? ""}
        description={pending?.description}
        confirmLabel={pending?.label ?? "Xác nhận"}
        tone={pending?.tone ?? "danger"}
        onCancel={() => setPendingAction(null)}
        onConfirm={() => (pendingAction ? actionMutation.mutateAsync(pendingAction).then(() => undefined) : undefined)}
      />
    </section>
  );
}
