import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Eye, KeyRound, Loader2, Lock, Save, Trash2, Unlock, X } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { StatusBadge } from "../../components/admin/ResourceList";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { SelectField, TextField, TextareaField } from "../../components/form/Field";
import { useToast } from "../../components/ui/Toast";
import { LOOKUP_LABELS, type LookupResultPayload, type LookupType, type ResultBlock } from "../../../shared/lookup-types";

type MemberItem = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  status: string;
  consentAt?: string | null;
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type EntitlementItem = {
  _id: string;
  type: string;
  active: boolean;
  grantedAt?: string | null;
  expiresAt?: string | null;
  note?: string;
};

type OrderItem = {
  _id: string;
  code: string;
  serviceName: string;
  amount: number;
  method?: string;
  status: string;
  createdAt?: string;
};

type LookupItem = {
  _id: string;
  type: LookupType;
  title: string;
  source?: string;
  result?: LookupResultPayload;
  createdAt?: string;
};

type TabKey = "profile" | "entitlements" | "orders" | "lookups";

const TABS: { key: TabKey; label: string }[] = [
  { key: "profile", label: "Hồ sơ" },
  { key: "entitlements", label: "Quyền nội dung" },
  { key: "orders", label: "Đơn hàng" },
  { key: "lookups", label: "Lịch sử tra cứu" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Đang hoạt động" },
  { value: "locked", label: "Đang khoá" },
];

const ENTITLEMENT_TYPES = [
  { value: "vip-numerology", label: "VIP Thần số học" },
  { value: "lifetime", label: "Trọn đời" },
];

const ENTITLEMENT_LABELS: Record<string, string> = Object.fromEntries(ENTITLEMENT_TYPES.map((item) => [item.value, item.label]));

const BLOCK_LABELS: Record<string, string> = {
  metrics: "Chỉ số",
  text: "Nội dung",
  score: "Điểm số",
  table: "Bảng",
  cards: "Thẻ nội dung",
  badges: "Nhãn",
  section: "Nhóm",
  chart3x3: "Biểu đồ 3×3",
  pinnacles: "Chặng đường đời",
  ikigai: "Ikigai",
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

type ResultRow = { key: string; value: string };

/** Chuyển các khối kết quả tra cứu thành dòng nhãn — giá trị để hiển thị, không dump JSON thô. */
function buildResultRows(blocks: ResultBlock[]): ResultRow[] {
  const rows: ResultRow[] = [];
  let group = "";
  for (const block of blocks) {
    if (block.kind === "section") {
      group = block.title;
      continue;
    }
    const heading = `${group ? `${group} · ` : ""}${"heading" in block && block.heading ? block.heading : BLOCK_LABELS[block.kind] || "Kết quả"}`;
    switch (block.kind) {
      case "metrics":
        for (const item of block.items) {
          rows.push({ key: `${heading} · ${item.label}`, value: `${item.value}${item.note ? ` (${item.note})` : ""}` });
        }
        break;
      case "score":
        for (const item of block.items) {
          rows.push({
            key: `${heading} · ${item.label}`,
            value: `${item.value}${item.max ? `/${item.max}` : ""}${item.note ? ` (${item.note})` : ""}`,
          });
        }
        break;
      case "text":
        rows.push({
          key: heading,
          value: [block.paragraphs.join(" "), (block.bullets ?? []).join(" • ")].filter(Boolean).join(" • ") || "—",
        });
        break;
      case "table":
        for (const row of block.rows) {
          rows.push({ key: `${heading} · ${row[0] ?? "—"}`, value: row.slice(1).join(" · ") || "—" });
        }
        if (!block.rows.length) rows.push({ key: heading, value: "—" });
        break;
      case "cards":
        for (const card of block.items) {
          rows.push({ key: `${heading} · ${card.title}`, value: card.text });
        }
        break;
      case "badges":
        rows.push({ key: heading, value: block.items.map((item) => item.label).join(" · ") || "—" });
        break;
      case "chart3x3":
        rows.push({
          key: heading,
          value: Object.entries(block.counts)
            .map(([digit, count]) => `${digit}×${count}`)
            .join(" · ") || "—",
        });
        break;
      case "pinnacles":
        rows.push({ key: `${heading} · Gốc`, value: block.bases.map((base) => `${base.label} ${base.value}`).join(" · ") });
        for (const [index, pinnacle] of block.pinnacles.entries()) {
          rows.push({ key: `${heading} · Đỉnh ${index + 1}${pinnacle.range ? ` (${pinnacle.range})` : ""}`, value: pinnacle.value });
        }
        break;
      case "ikigai":
        rows.push({ key: `${heading} · Đam mê`, value: block.passion.join(", ") || "—" });
        rows.push({ key: `${heading} · Sứ mệnh`, value: block.mission || "—" });
        rows.push({ key: `${heading} · Chuyên môn`, value: block.expertise.join(", ") || "—" });
        rows.push({ key: `${heading} · Sự nghiệp`, value: block.career.join(", ") || "—" });
        break;
    }
  }
  return rows;
}

export function MemberDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [tab, setTab] = useState<TabKey>("profile");
  const [form, setForm] = useState({ name: "", phone: "", birthDate: "", status: "active" });
  const [initial, setInitial] = useState({ name: "", phone: "", birthDate: "", status: "active" });
  const [confirmProfile, setConfirmProfile] = useState(false);
  const [confirmLock, setConfirmLock] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(false);
  const [issuedPassword, setIssuedPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [grantType, setGrantType] = useState("vip-numerology");
  const [grantDays, setGrantDays] = useState("");
  const [grantNote, setGrantNote] = useState("");
  const [revokeTarget, setRevokeTarget] = useState<EntitlementItem | null>(null);
  const [activeLookup, setActiveLookup] = useState<LookupItem | null>(null);

  const memberQuery = useQuery({
    queryKey: ["admin", "members", id],
    enabled: Boolean(id),
    queryFn: () => api.get<{ item: MemberItem }>(`/api/admin/members/${id}`),
  });
  const member = memberQuery.data?.item;

  const entitlementsQuery = useQuery({
    queryKey: ["admin", "members", id, "entitlements"],
    enabled: Boolean(id) && tab === "entitlements",
    queryFn: () => api.get<{ items: EntitlementItem[] }>("/api/admin/entitlements", { query: { memberId: id, pageSize: 100 } }),
  });

  const ordersQuery = useQuery({
    queryKey: ["admin", "members", id, "orders", member?.email ?? ""],
    enabled: Boolean(id) && tab === "orders" && Boolean(member?.email),
    queryFn: () => api.get<{ items: OrderItem[] }>("/api/admin/orders", { query: { q: member?.email ?? "", pageSize: 100 } }),
  });

  const lookupsQuery = useQuery({
    queryKey: ["admin", "members", id, "lookups"],
    enabled: Boolean(id) && tab === "lookups",
    queryFn: () => api.get<{ items: LookupItem[]; total: number }>("/api/admin/lookups", { query: { memberId: id, pageSize: 100 } }),
  });

  useEffect(() => {
    if (!member) return;
    const next = {
      name: member.name ?? "",
      phone: member.phone ?? "",
      birthDate: member.birthDate ?? "",
      status: member.status ?? "active",
    };
    setForm(next);
    setInitial(next);
  }, [member]);

  const profileMutation = useMutation({
    mutationFn: (payload: { name: string; phone: string; birthDate: string; status: string }) =>
      api.patch<{ item: MemberItem }>(`/api/admin/members/${id}`, payload),
    onSuccess: async () => {
      toast.success("Đã lưu hồ sơ thành viên");
      setConfirmProfile(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
    },
    onError: (error) => {
      setConfirmProfile(false);
      toast.error("Không lưu được hồ sơ", errorMessage(error));
    },
  });

  const lockMutation = useMutation({
    mutationFn: (next: "active" | "locked") => api.post<{ item: MemberItem }>(`/api/admin/members/${id}/status`, { status: next }),
    onSuccess: async (_result, next) => {
      toast.success(next === "locked" ? "Đã khoá tài khoản" : "Đã mở khoá tài khoản");
      setConfirmLock(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
    },
    onError: (error) => {
      setConfirmLock(false);
      toast.error("Không đổi được trạng thái tài khoản", errorMessage(error));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (next: string) => api.post<{ ok: boolean }>(`/api/admin/members/${id}/password`, { password: next }),
    onSuccess: async (_result, next) => {
      toast.success("Đã đặt lại mật khẩu");
      setConfirmPassword(false);
      setIssuedPassword(next);
      setPassword("");
    },
    onError: (error) => {
      setConfirmPassword(false);
      toast.error("Không đặt lại được mật khẩu", errorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`/api/admin/members/${id}`),
    onSuccess: async () => {
      toast.success("Đã xoá thành viên");
      setConfirmDelete(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", "members"] });
      navigate("/admin/thanh-vien");
    },
    onError: (error) => {
      setConfirmDelete(false);
      toast.error("Không xoá được thành viên", errorMessage(error));
    },
  });

  const grantMutation = useMutation({
    mutationFn: () =>
      api.post<{ item: EntitlementItem }>("/api/admin/entitlements", {
        memberId: id,
        type: grantType,
        days: grantDays === "" ? undefined : Number(grantDays),
        note: grantNote,
      }),
    onSuccess: async () => {
      toast.success("Đã cấp quyền nội dung");
      setGrantDays("");
      setGrantNote("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "members", id, "entitlements"] });
    },
    onError: (error) => toast.error("Không cấp được quyền", errorMessage(error)),
  });

  const revokeMutation = useMutation({
    mutationFn: (entitlementId: string) => api.patch<{ item: EntitlementItem }>(`/api/admin/entitlements/${entitlementId}`, { active: false }),
    onSuccess: async () => {
      toast.success("Đã thu hồi quyền nội dung");
      setRevokeTarget(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "members", id, "entitlements"] });
    },
    onError: (error) => {
      setRevokeTarget(null);
      toast.error("Không thu hồi được quyền", errorMessage(error));
    },
  });

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);
  const profileCompleted = Boolean(member?.consentAt);

  const lookupDetail = useMemo(() => {
    const result = activeLookup?.result;
    return { headline: result?.headline ?? "", rows: buildResultRows(result?.blocks ?? []) };
  }, [activeLookup]);

  if (memberQuery.isLoading) {
    return (
      <section className="admin-page admin-loading">
        <Loader2 className="spin" aria-hidden="true" />
        <p>Đang tải chi tiết thành viên…</p>
      </section>
    );
  }

  if (memberQuery.isError || !member) {
    return (
      <section className="admin-page">
        <Link to="/admin/thanh-vien" className="admin-back">
          <ArrowLeft aria-hidden="true" /> Danh sách thành viên
        </Link>
        <p className="admin-error" role="alert">
          <AlertTriangle aria-hidden="true" /> {errorMessage(memberQuery.error ?? new Error("Không tìm thấy thành viên."))}
        </p>
      </section>
    );
  }

  const submitProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.status !== member.status) {
      setConfirmProfile(true);
      return;
    }
    profileMutation.mutate(form);
  };

  const submitPassword = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password.length < 8) return;
    setConfirmPassword(true);
  };

  const submitGrant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    grantMutation.mutate();
  };

  const nextStatus = member.status === "locked" ? "active" : "locked";

  return (
    <section className="admin-page">
      <Link to="/admin/thanh-vien" className="admin-back">
        <ArrowLeft aria-hidden="true" /> Danh sách thành viên
      </Link>

      <header className="admin-page__header">
        <div>
          <h1>{member.name}</h1>
          <p className="admin-page__meta">
            <StatusBadge status={member.status} />
            <span className="muted">Tạo {formatDateTime(member.createdAt)}</span>
            <span className="muted">Đăng nhập gần nhất {formatDateTime(member.lastLoginAt)}</span>
            <span className="muted">{member.email}</span>
          </p>
        </div>
      </header>

      <div className="admin-panel">
        <div className="admin-page__actions" role="tablist" aria-label="Mục chi tiết thành viên">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              className={`button ${tab === item.key ? "button--primary" : "button--ghost"}`}
              onClick={() => setTab(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "profile" ? (
        <form className="admin-card admin-form" onSubmit={submitProfile}>
          <h2>Hồ sơ thành viên</h2>
          <div className="admin-form__grid">
            <TextField label="Họ tên" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <TextField label="Điện thoại" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <TextField
              label="Ngày sinh"
              type="date"
              value={form.birthDate}
              onChange={(event) => setForm({ ...form, birthDate: event.target.value })}
            />
            <SelectField
              label="Trạng thái"
              value={form.status}
              options={STATUS_OPTIONS}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
              hint="Đổi trạng thái sẽ được xác nhận trước khi lưu."
            />
            <TextField label="Email đăng nhập" value={member.email} disabled hint="Email dùng để đăng nhập, không đổi tại đây." />
            <TextField label="Đồng ý xử lý dữ liệu" value={profileCompleted ? `Đã đồng ý ${formatDateTime(member.consentAt)}` : "Chưa ghi nhận"} disabled />
          </div>
          {profileMutation.isError ? (
            <p className="admin-error" role="alert">
              <AlertTriangle aria-hidden="true" /> {errorMessage(profileMutation.error)}
            </p>
          ) : null}
          <div className="admin-form__bar">
            <div>
              <button type="button" className="button button--ghost" onClick={() => setForm(initial)} disabled={profileMutation.isPending || !dirty}>
                Huỷ thay đổi
              </button>
              <button type="submit" className="button button--primary" disabled={profileMutation.isPending || !dirty}>
                {profileMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
                Lưu thay đổi
              </button>
            </div>
          </div>
        </form>
      ) : null}

      {tab === "entitlements" ? (
        <>
          <div className="admin-card">
            <h2>Quyền nội dung hiện có</h2>
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
                      <th scope="col">Hết hạn</th>
                      <th scope="col">Trạng thái</th>
                      <th scope="col">Ghi chú</th>
                      <th scope="col">Thao tác</th>
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
                          <td>{textValue(entitlement.note)}</td>
                          <td>
                            <button
                              type="button"
                              className="button button--danger"
                              disabled={!entitlement.active || revokeMutation.isPending}
                              onClick={() => setRevokeTarget(entitlement)}
                            >
                              Thu hồi
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <form className="admin-card admin-form" onSubmit={submitGrant}>
            <h2>Cấp quyền mới</h2>
            <div className="admin-form__grid">
              <SelectField label="Loại quyền" value={grantType} options={ENTITLEMENT_TYPES} onChange={(event) => setGrantType(event.target.value)} />
              <TextField
                label="Số ngày hiệu lực"
                type="number"
                min={0}
                max={3650}
                value={grantDays}
                hint="Để trống để cấp không giới hạn."
                onChange={(event) => setGrantDays(event.target.value)}
              />
              <TextareaField label="Ghi chú" wide rows={3} value={grantNote} onChange={(event) => setGrantNote(event.target.value)} />
            </div>
            <div className="admin-form__bar">
              <div>
                <button type="submit" className="button button--primary" disabled={grantMutation.isPending}>
                  {grantMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : null}
                  Cấp quyền
                </button>
              </div>
            </div>
          </form>
        </>
      ) : null}

      {tab === "orders" ? (
        <div className="admin-card">
          <h2>Đơn hàng của thành viên</h2>
          {!member.email ? (
            <p className="muted">Thành viên chưa có email để đối chiếu đơn hàng.</p>
          ) : ordersQuery.isLoading ? (
            <p className="admin-loading">
              <Loader2 className="spin" aria-hidden="true" /> Đang tải đơn hàng…
            </p>
          ) : ordersQuery.isError ? (
            <p className="admin-error" role="alert">
              <AlertTriangle aria-hidden="true" /> {errorMessage(ordersQuery.error)}
            </p>
          ) : (ordersQuery.data?.items.length ?? 0) === 0 ? (
            <p className="muted">Chưa có đơn hàng nào khớp email {member.email}.</p>
          ) : (
            <div className="data-table__scroll">
              <table className="data-table">
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
          )}
        </div>
      ) : null}

      {tab === "lookups" ? (
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
            <p className="muted">Thành viên chưa thực hiện tra cứu nào.</p>
          ) : (
            <div className="data-table__scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th scope="col">Loại</th>
                    <th scope="col">Tiêu đề</th>
                    <th scope="col">Nguồn</th>
                    <th scope="col">Thời gian</th>
                    <th scope="col">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {lookupsQuery.data?.items.map((lookup) => (
                    <tr key={lookup._id}>
                      <td>{LOOKUP_LABELS[lookup.type] ?? lookup.type}</td>
                      <td>{textValue(lookup.title)}</td>
                      <td>{textValue(lookup.source)}</td>
                      <td>{formatDateTime(lookup.createdAt)}</td>
                      <td>
                        <button type="button" className="button button--ghost" onClick={() => setActiveLookup(lookup)}>
                          <Eye aria-hidden="true" /> Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      <div className="admin-card">
        <h2>Khu vực hành động nguy hiểm</h2>
        <div className="admin-alerts">
          <article className="is-danger">
            <AlertTriangle aria-hidden="true" />
            <div>
              <strong>Cẩn trọng</strong>
              <span>Các thao tác dưới đây ảnh hưởng trực tiếp tới quyền truy cập của khách hàng. Hãy xác nhận trước khi thực hiện.</span>
            </div>
          </article>
        </div>

        <section>
          <h3>Khoá / mở khoá tài khoản</h3>
          <p className="muted">
            Trạng thái hiện tại: <StatusBadge status={member.status} />
          </p>
          <button
            type="button"
            className={`button ${member.status === "locked" ? "button--primary" : "button--danger"}`}
            disabled={lockMutation.isPending}
            onClick={() => setConfirmLock(true)}
          >
            {member.status === "locked" ? <Unlock aria-hidden="true" /> : <Lock aria-hidden="true" />}
            {member.status === "locked" ? "Mở khoá tài khoản" : "Khoá tài khoản"}
          </button>
        </section>

        <form className="admin-form" onSubmit={submitPassword}>
          <h3>Đặt lại mật khẩu</h3>
          <p className="muted">Tạo mật khẩu mới tối thiểu 8 ký tự rồi gửi trực tiếp cho khách hàng.</p>
          <TextField
            label="Mật khẩu mới"
            type="text"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tối thiểu 8 ký tự"
          />
          {issuedPassword ? (
            <div className="admin-alerts">
              <article className="is-info">
                <KeyRound aria-hidden="true" />
                <div>
                  <strong>Mật khẩu vừa đặt</strong>
                  <span>
                    <code>{issuedPassword}</code> — chỉ hiển thị một lần, hãy sao chép và gửi cho khách ngay.
                  </span>
                </div>
              </article>
            </div>
          ) : null}
          <div className="admin-form__bar">
            <div>
              <button type="submit" className="button button--primary" disabled={password.length < 8 || passwordMutation.isPending}>
                {passwordMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <KeyRound aria-hidden="true" />}
                Đặt lại mật khẩu
              </button>
            </div>
          </div>
        </form>

        <section>
          <h3>Xoá thành viên</h3>
          <p className="muted">Xoá vĩnh viễn hồ sơ thành viên. Hành động này không thể hoàn tác.</p>
          <button type="button" className="button button--danger" disabled={deleteMutation.isPending} onClick={() => setConfirmDelete(true)}>
            <Trash2 aria-hidden="true" /> Xoá thành viên
          </button>
        </section>
      </div>

      <ConfirmDialog
        open={confirmProfile}
        title="Đổi trạng thái tài khoản?"
        description={`Trạng thái thành viên sẽ chuyển sang "${STATUS_OPTIONS.find((option) => option.value === form.status)?.label ?? form.status}".`}
        confirmLabel="Xác nhận lưu"
        tone="primary"
        onCancel={() => setConfirmProfile(false)}
        onConfirm={() => profileMutation.mutateAsync(form).then(() => undefined)}
      />

      <ConfirmDialog
        open={confirmLock}
        title={nextStatus === "locked" ? "Khoá tài khoản thành viên?" : "Mở khoá tài khoản thành viên?"}
        description={
          nextStatus === "locked"
            ? "Thành viên sẽ không thể đăng nhập cho tới khi được mở khoá."
            : "Thành viên sẽ có thể đăng nhập trở lại ngay sau khi mở khoá."
        }
        confirmLabel={nextStatus === "locked" ? "Khoá tài khoản" : "Mở khoá"}
        tone={nextStatus === "locked" ? "danger" : "primary"}
        onCancel={() => setConfirmLock(false)}
        onConfirm={() => lockMutation.mutateAsync(nextStatus).then(() => undefined)}
      />

      <ConfirmDialog
        open={confirmPassword}
        title="Đặt lại mật khẩu?"
        description="Mật khẩu hiện tại của thành viên sẽ bị thay thế. Hệ thống sẽ hiển thị mật khẩu mới một lần để bạn gửi cho khách."
        confirmLabel="Đặt lại mật khẩu"
        tone="danger"
        onCancel={() => setConfirmPassword(false)}
        onConfirm={() => passwordMutation.mutateAsync(password).then(() => undefined)}
      />

      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title="Thu hồi quyền nội dung?"
        description={
          revokeTarget
            ? `Quyền "${ENTITLEMENT_LABELS[revokeTarget.type] ?? revokeTarget.type}" của thành viên sẽ bị vô hiệu hoá.`
            : undefined
        }
        confirmLabel="Thu hồi"
        tone="danger"
        onCancel={() => setRevokeTarget(null)}
        onConfirm={() => (revokeTarget ? revokeMutation.mutateAsync(revokeTarget._id).then(() => undefined) : undefined)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Xoá thành viên này?"
        description={`Hồ sơ "${member.name}" sẽ bị xoá vĩnh viễn khỏi hệ thống. Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá thành viên"
        tone="danger"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutateAsync().then(() => undefined)}
      />

      {activeLookup ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Chi tiết báo cáo ${activeLookup.title}`}
          onClick={() => setActiveLookup(null)}
        >
          <article className="confirm-dialog confirm-dialog--primary" onClick={(event) => event.stopPropagation()}>
            <header>
              <Eye aria-hidden="true" />
              <div>
                <h2>{activeLookup.title || "Báo cáo tra cứu"}</h2>
                <p>
                  {(LOOKUP_LABELS[activeLookup.type] ?? activeLookup.type) + (activeLookup.createdAt ? ` · ${formatDateTime(activeLookup.createdAt)}` : "")}
                </p>
              </div>
              <button type="button" onClick={() => setActiveLookup(null)} aria-label="Đóng">
                <X aria-hidden="true" />
              </button>
            </header>
            <div className="confirm-dialog__body">
              {lookupDetail.headline ? <strong>{lookupDetail.headline}</strong> : null}
              {lookupDetail.rows.length ? (
                <div className="admin-form__grid">
                  {lookupDetail.rows.map((row, index) => (
                    <p key={`${row.key}-${index}`}>
                      <span className="muted">{row.key}</span>
                      <strong>{row.value}</strong>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="muted">Báo cáo không có dữ liệu chi tiết.</p>
              )}
            </div>
            <footer>
              <button type="button" className="button button--ghost" onClick={() => setActiveLookup(null)}>
                Đóng
              </button>
            </footer>
          </article>
        </div>
      ) : null}
    </section>
  );
}
