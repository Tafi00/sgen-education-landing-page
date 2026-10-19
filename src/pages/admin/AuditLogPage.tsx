import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Search, X } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { DataTable, formatCellValue } from "../../components/admin/DataTable";
import type { ColumnConfig } from "../../admin/types";
import { RESOURCES, type ResourceKey } from "../../admin/resources";

export type AuditRow = {
  _id: string;
  actorEmail?: string;
  action?: string;
  collectionName?: string;
  documentId?: string;
  diff?: unknown;
  createdAt?: string;
};

type AuditResponse = {
  items: AuditRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Nhãn tiếng Việt cho các hành động đã biết (xem server/src/routes/admin). */
const ACTION_LABELS: Record<string, string> = {
  login: "Đăng nhập",
  logout: "Đăng xuất",
  "settings.update": "Cập nhật cài đặt website",
  "order.approve": "Duyệt đơn hàng",
  "order.cancel": "Huỷ đơn hàng",
  "order.create": "Tạo đơn hàng",
  "order.update": "Cập nhật đơn hàng",
  "order.delete": "Xoá đơn hàng",
  "lead.create": "Tạo lead",
  "lead.update": "Cập nhật lead",
  "lead.delete": "Xoá lead",
  "media.upload": "Tải tệp lên",
  "media.delete": "Xoá tệp",
  "user.create": "Tạo tài khoản",
  "user.update": "Cập nhật tài khoản",
  "user.delete": "Xoá tài khoản",
  "ebook.generate": "Tạo mã ebook",
  "ebook.update": "Cập nhật mã ebook",
  "ebook.delete": "Xoá mã ebook",
};

const ACTION_VERBS: Record<string, string> = {
  create: "Tạo mới",
  update: "Cập nhật",
  delete: "Xoá",
  publish: "Xuất bản",
  archive: "Lưu trữ",
  approve: "Duyệt",
  reject: "Từ chối",
  login: "Đăng nhập",
  logout: "Đăng xuất",
};

const COLLECTION_LABELS: Record<string, string> = {
  users: "Tài khoản quản trị",
  site_settings: "Cài đặt website",
  leads: "Leads",
  orders: "Đơn hàng",
  lookups: "Báo cáo tra cứu",
  media: "Thư viện ảnh",
  notifications: "Thông báo",
};

/** Dịch khoá bộ sưu tập sang nhãn hiển thị. */
export function collectionLabel(name?: string) {
  if (!name) return "Hệ thống";
  const resource = RESOURCES[name as ResourceKey];
  if (resource) return resource.labelPlural;
  return COLLECTION_LABELS[name] ?? "Hệ thống";
}

/** Dịch mã hành động sang tiếng Việt; không hiển thị chữ tiếng Anh trên giao diện. */
export function actionLabel(action?: string) {
  if (!action) return "Hoạt động khác";
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  const [head, tail] = action.split(".");
  if (tail && ACTION_VERBS[head]) return `${ACTION_VERBS[head]} ${collectionLabel(tail).toLowerCase()}`;
  if (ACTION_VERBS[action]) return ACTION_VERBS[action];
  return "Hoạt động khác";
}

/** Tông màu cho nhãn hành động theo mức độ ảnh hưởng. */
export function actionTone(action?: string) {
  if (!action) return "neutral";
  if (action.includes("delete") || action.includes("cancel") || action.includes("reject")) return "danger";
  if (action.includes("create") || action.includes("approve") || action === "login") return "positive";
  return "neutral";
}

const DIFF_LABELS: Record<string, string> = {
  code: "Mã đơn",
  entitlementId: "Quyền đã cấp",
  keys: "Khoá cài đặt",
  status: "Trạng thái",
  id: "Mã bản ghi",
  title: "Tiêu đề",
  slug: "Slug",
};

function formatDiffValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.map((item) => formatDiffValue(item)).join(", ") : "—";
  if (typeof value === "object") {
    const parts = Object.entries(value as Record<string, unknown>).map(([key, nested]) => `${key}: ${formatDiffValue(nested)}`);
    return parts.join("; ") || "—";
  }
  if (typeof value === "boolean") return value ? "Có" : "Không";
  return String(value);
}

/** Biến `diff` thành các cặp nhãn–giá trị, không dump JSON thô. */
export function diffEntries(diff: unknown): { label: string; value: string }[] {
  if (!diff || typeof diff !== "object" || Array.isArray(diff)) return [];
  return Object.entries(diff as Record<string, unknown>).map(([key, value]) => ({
    label: DIFF_LABELS[key] ?? key,
    value: formatDiffValue(value),
  }));
}

function DiffList({ diff }: { diff: unknown }) {
  const entries = diffEntries(diff);
  if (entries.length === 0) return <span className="muted">Không có chi tiết</span>;
  return (
    <dl className="audit-diff">
      {entries.map((entry, index) => (
        <div className="audit-diff__row" key={`${entry.label}-${index}`}>
          <dt>{entry.label}</dt>
          <dd>{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const COLUMNS: ColumnConfig[] = [
  { key: "createdAt", label: "Thời gian", kind: "date", width: "150px" },
  { key: "actorEmail", label: "Người thực hiện" },
  { key: "action", label: "Hành động", width: "190px" },
  { key: "target", label: "Đối tượng" },
  { key: "diff", label: "Chi tiết" },
];

export function AuditLogPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const documentId = params.get("documentId") ?? "";
  const action = params.get("action") ?? "";
  const [docDraft, setDocDraft] = useState(documentId);

  useEffect(() => {
    setDocDraft(documentId);
  }, [documentId]);

  const auditQuery = useQuery({
    queryKey: ["admin", "audit", page, documentId],
    queryFn: () =>
      api.get<AuditResponse>("/api/admin/dashboard/audit", {
        query: { page, pageSize: 30, documentId: documentId || undefined },
      }),
  });

  const items = auditQuery.data?.items ?? [];
  const actionOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const item of items) if (item.action) seen.add(item.action);
    return [...seen].sort((a, b) => actionLabel(a).localeCompare(actionLabel(b), "vi"));
  }, [items]);

  const rows = useMemo(() => (action ? items.filter((item) => item.action === action) : items), [items, action]);

  const updateParams = (patch: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next, { replace: true });
  };

  const resetFilters = () => setParams(new URLSearchParams(), { replace: true });
  const hasFilters = Boolean(documentId || action);

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Nhật ký hoạt động</h1>
          <p>Ghi lại các thao tác quản trị: đăng nhập, duyệt đơn hàng, cập nhật cài đặt và thay đổi nội dung.</p>
        </div>
        <div className="admin-page__actions">
          <button type="button" className="button button--ghost" onClick={() => void auditQuery.refetch()} disabled={auditQuery.isFetching}>
            <RefreshCw className={auditQuery.isFetching ? "spin" : undefined} aria-hidden="true" /> Làm mới
          </button>
        </div>
      </header>

      <div className="admin-panel">
        <div className="admin-toolbar">
          <form
            className="admin-toolbar__search"
            onSubmit={(event) => {
              event.preventDefault();
              updateParams({ documentId: docDraft.trim(), page: undefined });
            }}
            role="search"
          >
            <Search aria-hidden="true" />
            <input
              type="search"
              value={docDraft}
              onChange={(event) => setDocDraft(event.target.value)}
              placeholder="Tìm theo mã bản ghi (documentId)…"
              aria-label="Tìm theo mã bản ghi"
            />
            <button type="submit" className="button button--primary">
              Lọc
            </button>
          </form>

          <label className="admin-toolbar__page-size">
            <span>Hành động</span>
            <select value={action} onChange={(event) => updateParams({ action: event.target.value || undefined, page: undefined })}>
              <option value="">Tất cả</option>
              {actionOptions.map((value) => (
                <option key={value} value={value}>
                  {actionLabel(value)}
                </option>
              ))}
            </select>
          </label>

          {hasFilters ? (
            <button type="button" className="button button--ghost" onClick={resetFilters}>
              <X aria-hidden="true" /> Xoá bộ lọc
            </button>
          ) : null}
        </div>

        {documentId ? (
          <p className="admin-hint muted">
            Đang lọc theo mã bản ghi <code>{documentId}</code>.
          </p>
        ) : null}

        <DataTable<AuditRow>
          columns={COLUMNS}
          rows={rows}
          total={auditQuery.data?.total ?? 0}
          page={auditQuery.data?.page ?? page}
          pageSize={auditQuery.data?.pageSize ?? 30}
          sort="createdAt"
          dir="desc"
          loading={auditQuery.isPending}
          error={auditQuery.isError ? errorMessage(auditQuery.error) : undefined}
          emptyTitle="Chưa có hoạt động nào được ghi nhận"
          emptyHint="Nhật ký sẽ hiển thị các thao tác quản trị ngay khi chúng được thực hiện."
          filtered={hasFilters}
          onSort={() => undefined}
          onPageChange={(next) => updateParams({ page: next > 1 ? String(next) : undefined })}
          renderCell={(row, column) => {
            if (column.key === "action") {
              return <span className={`audit-action audit-action--${actionTone(row.action)}`}>{actionLabel(row.action)}</span>;
            }
            if (column.key === "target") {
              const id = row.documentId && row.documentId.length > 10 ? `${row.documentId.slice(0, 6)}…${row.documentId.slice(-3)}` : row.documentId ?? "";
              return (
                <span className="audit-target">
                  <strong>{collectionLabel(row.collectionName)}</strong>
                  {id ? <code title={row.documentId}>{id}</code> : <span className="muted">Không gắn bản ghi</span>}
                </span>
              );
            }
            if (column.key === "actorEmail") {
              return row.actorEmail ? String(row.actorEmail) : <span className="muted">Hệ thống</span>;
            }
            if (column.key === "diff") return <DiffList diff={row.diff} />;
            return formatCellValue((row as unknown as Record<string, unknown>)[column.key], column.kind);
          }}
        />
      </div>
    </section>
  );
}
