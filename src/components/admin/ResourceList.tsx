import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, ExternalLink, Eye, EyeOff, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import type { ColumnConfig, ResourceConfig } from "../../admin/types";
import { DataTable, formatCellValue } from "./DataTable";
import { FilterPopover, type FilterValues } from "./FilterPopover";
import { ConfirmDialog } from "./ConfirmDialog";
import { useToast } from "../ui/Toast";

export type ListResponse<T> = { items: T[]; total: number; page: number; pageSize: number; totalPages: number };

type Row = Record<string, unknown> & { _id?: string };

/** Tiền tố đường dẫn công khai của từng loại nội dung (để "Xem trên web"). */
const PUBLIC_BASE: Record<string, string> = {
  courses: "/khoa-hoc",
  posts: "/blog",
  services: "/dich-vu",
  pages: "/gioi-thieu",
};

/** Đường dẫn công khai của một bản ghi theo loại tài nguyên, null nếu không có trang công khai. */
export function publicUrlFor(resourceKey: string, slug: unknown): string | null {
  const base = PUBLIC_BASE[resourceKey];
  const clean = String(slug ?? "").trim().replace(/^\/+/, "");
  if (!base || !clean) return null;
  /** Trang nội dung lưu slug kèm tiền tố (ví dụ `gioi-thieu/tam-nhin`). */
  if (resourceKey === "pages") return /^(gioi-thieu|lien-he)(\/|$)/.test(clean) ? `/${clean}` : `/gioi-thieu/${clean}`;
  return `${base}/${clean}`;
}

export function StatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    published: "Đã đăng",
    draft: "Bản nháp",
    archived: "Lưu trữ",
    new: "Mới",
    contacted: "Đã liên hệ",
    won: "Chốt",
    lost: "Không tiếp tục",
    pending: "Chờ xác nhận",
    paid: "Đã thanh toán",
    cancelled: "Đã huỷ",
    expired: "Hết hạn",
    active: "Đang hoạt động",
    locked: "Đang khoá",
    sent: "Đã gửi",
    failed: "Thất bại",
    skipped: "Bỏ qua",
  };
  return <span className={`status-badge status-badge--${status}`}>{label[status] ?? status}</span>;
}

/** Ô tham chiếu: tải danh sách liên quan và hiển thị nhãn thay vì ObjectId. */
function RelationCell({ relation, value }: { relation: NonNullable<ColumnConfig["relation"]>; value: unknown }) {
  const id = value === null || value === undefined || value === "" ? "" : String(value);
  const query = useQuery({
    queryKey: ["admin-relation", relation.endpoint],
    queryFn: () => api.get<ListResponse<Row>>(relation.endpoint, { query: { pageSize: 100 } }),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(id),
  });

  if (!id) return <span className="muted">—</span>;
  if (query.isLoading) return <span className="muted">…</span>;

  const item = (query.data?.items ?? []).find((entry) => String(entry._id ?? "") === id);
  if (!item) return <span className="muted">—</span>;

  const secondary = relation.secondaryKey ? item[relation.secondaryKey] : undefined;
  return (
    <span className="relation-cell">
      <span className="relation-cell__label">{String(item[relation.labelKey] ?? id)}</span>
      {secondary ? <span className="relation-cell__sub">{String(secondary)}</span> : null}
    </span>
  );
}

export function ResourceList({ config, renderCell }: { config: ResourceConfig; renderCell?: (row: Row, key: string) => ReactNode }) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [pendingRowDelete, setPendingRowDelete] = useState<Row | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{ row: Row; status: "published" | "draft" } | null>(null);
  const [searchDraft, setSearchDraft] = useState(params.get("q") ?? "");

  const page = Number(params.get("page") ?? 1) || 1;
  const pageSize = Number(params.get("pageSize") ?? 20) || 20;
  const sort = params.get("sort") ?? config.defaultSort;
  const dir = (params.get("dir") ?? config.defaultDir ?? "desc") as "asc" | "desc";
  const q = params.get("q") ?? "";

  const filters = useMemo<FilterValues>(() => {
    const result: FilterValues = {};
    for (const filter of config.filters) result[filter.key] = params.get(`f_${filter.key}`) ?? "";
    return result;
  }, [config.filters, params]);

  const hasFilters = Object.values(filters).some((value) => value && value !== "all");
  const supportsPublish = config.fields.some(
    (field) => field.name === "status" && field.options?.some((option) => option.value === "published"),
  );

  const listQuery = useQuery({
    queryKey: ["admin", config.key, page, pageSize, sort, dir, q, JSON.stringify(filters)],
    queryFn: () =>
      api.get<ListResponse<Row>>(config.endpoint, {
        query: { page, pageSize, sort, dir, q, ...Object.fromEntries(Object.entries(filters).map(([key, value]) => [key, value])) },
      }),
  });

  const updateParams = (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "" || value === "all") next.delete(key);
      else next.set(key, String(value));
    }
    setParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams(params);
    for (const filter of config.filters) next.delete(`f_${filter.key}`);
    next.set("page", "1");
    setParams(next, { replace: true });
  };

  const bulkMutation = useMutation({
    mutationFn: (action: "delete" | "status") => api.post(config.endpoint + "/bulk", { ids: selected, action, status: "published" }),
    onSuccess: async () => {
      toast.success("Đã cập nhật", `${selected.length} bản ghi đã được xử lý.`);
      setSelected([]);
      setPendingDelete(false);
      await queryClient.invalidateQueries({ queryKey: ["admin", config.key] });
    },
    onError: (error) => toast.error("Không thực hiện được", errorMessage(error)),
  });

  const rowStatusMutation = useMutation({
    mutationFn: (input: { id: string; status: "published" | "draft" }) => api.patch(`${config.endpoint}/${input.id}`, { status: input.status }),
    onSuccess: async (_result, input) => {
      toast.success(input.status === "published" ? "Đã đăng nội dung" : "Đã ẩn nội dung", `${config.label} đã được cập nhật trạng thái.`);
      setPendingStatus(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", config.key] });
    },
    onError: (error) => {
      setPendingStatus(null);
      toast.error("Không cập nhật được trạng thái", errorMessage(error));
    },
  });

  const rowDeleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`${config.endpoint}/${id}`),
    onSuccess: async () => {
      toast.success("Đã xoá", `${config.label} đã được xoá khỏi hệ thống.`);
      setPendingRowDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", config.key] });
    },
    onError: (error) => {
      setPendingRowDelete(null);
      toast.error("Không xoá được", errorMessage(error));
    },
  });

  const rows = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;

  const renderRowActions = (row: Row) => {
    const id = String(row._id ?? "");
    const published = row.status === "published";
    const publicUrl = published ? publicUrlFor(config.key, row.slug) : null;
    return (
      <>
        <Link
          className="table-action"
          to={`${config.basePath}/${id}`}
          title="Sửa"
          aria-label="Sửa"
          onClick={(event) => event.stopPropagation()}
        >
          <Pencil aria-hidden="true" />
        </Link>
        {publicUrl ? (
          <a
            className="table-action"
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            title="Xem trên web"
            aria-label="Xem trên web"
            onClick={(event) => event.stopPropagation()}
          >
            <ExternalLink aria-hidden="true" />
          </a>
        ) : null}
        {supportsPublish ? (
          <button
            type="button"
            className="table-action"
            title={published ? "Ẩn khỏi website" : "Đăng lên website"}
            aria-label={published ? "Ẩn khỏi website" : "Đăng lên website"}
            onClick={(event) => {
              event.stopPropagation();
              setPendingStatus({ row, status: published ? "draft" : "published" });
            }}
          >
            {published ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </button>
        ) : null}
        <button
          type="button"
          className="table-action table-action--danger"
          title={`Xoá ${config.label}`}
          aria-label={`Xoá ${config.label}`}
          onClick={(event) => {
            event.stopPropagation();
            setPendingRowDelete(row);
          }}
        >
          <Trash2 aria-hidden="true" />
        </button>
      </>
    );
  };

  const cellRenderer = (row: Row, column: ColumnConfig): ReactNode => {
    if (column.relation) return <RelationCell relation={column.relation} value={row[column.key]} />;
    if (renderCell) return renderCell(row, column.key);
    return formatCellValue(row[column.key], column.kind);
  };

  const exportHref = config.key === "leads" ? `/api/admin/leads/export/csv${filters.status && filters.status !== "all" ? `?status=${encodeURIComponent(filters.status)}` : ""}` : null;

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>{config.labelPlural}</h1>
          <p>{config.description}</p>
        </div>
        <div className="admin-page__actions">
          {exportHref ? (
            <a className="button button--ghost" href={exportHref}>
              <Download aria-hidden="true" /> Xuất CSV
            </a>
          ) : null}
          {config.canCreate ? (
            <Link className="button button--primary" to={`${config.basePath}/new`}>
              <Plus aria-hidden="true" /> Thêm mới
            </Link>
          ) : null}
        </div>
      </header>

      <div className="admin-toolbar">
        <form
          className="admin-toolbar__search"
          onSubmit={(event) => {
            event.preventDefault();
            updateParams({ q: searchDraft, page: 1 });
          }}
        >
          <Search aria-hidden="true" />
          <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder={config.searchPlaceholder ?? "Tìm kiếm…"} />
          <button type="submit" className="button button--ghost">
            Tìm
          </button>
        </form>

        <FilterPopover
          filters={config.filters}
          values={filters}
          onApply={(values) => {
            const next = new URLSearchParams(params);
            for (const filter of config.filters) next.delete(`f_${filter.key}`);
            for (const [key, value] of Object.entries(values)) {
              if (value && value !== "all") next.set(`f_${key}`, value);
            }
            next.set("page", "1");
            setParams(next, { replace: true });
          }}
        />

        <label className="admin-toolbar__page-size">
          <span>Hiển thị</span>
          <select value={pageSize} onChange={(event) => updateParams({ pageSize: event.target.value, page: 1 })}>
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-list-summary">
        <span>
          Đang hiển thị <strong>{rows.length}</strong> / <strong>{total}</strong> bản ghi
          {q ? ` cho từ khoá “${q}”` : ""}
        </span>
        {hasFilters ? (
          <button type="button" className="button button--ghost" onClick={clearFilters}>
            Xoá lọc
          </button>
        ) : null}
      </div>

      {selected.length ? (
        <div className="admin-bulk">
          <span>Đã chọn {selected.length} bản ghi</span>
          <button type="button" className="button button--ghost" onClick={() => bulkMutation.mutate("status")}>
            Đăng hàng loạt
          </button>
          <button type="button" className="button button--danger" onClick={() => setPendingDelete(true)}>
            <Trash2 aria-hidden="true" /> Xoá đã chọn
          </button>
          <button type="button" className="button button--ghost" onClick={() => setSelected([])}>
            Bỏ chọn
          </button>
        </div>
      ) : null}

      <DataTable
        columns={config.columns}
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        sort={sort}
        dir={dir}
        loading={listQuery.isLoading}
        error={listQuery.isError ? errorMessage(listQuery.error) : undefined}
        emptyTitle={`Chưa có ${config.label} nào`}
        filtered={Boolean(q) || hasFilters}
        onSort={(key) => updateParams({ sort: key, dir: sort === key && dir === "desc" ? "asc" : "desc" })}
        onPageChange={(nextPage) => updateParams({ page: nextPage })}
        onRowClick={(row) => {
          if (row._id) navigate(`${config.basePath}/${row._id}`);
        }}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        renderCell={cellRenderer}
        rowActions={renderRowActions}
      />

      <ConfirmDialog
        open={pendingDelete}
        title={`Xoá ${selected.length} bản ghi?`}
        description="Hành động này không thể hoàn tác."
        confirmLabel="Xoá vĩnh viễn"
        onCancel={() => setPendingDelete(false)}
        onConfirm={async () => { await bulkMutation.mutateAsync("delete"); }}
      />

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title={pendingStatus?.status === "published" ? "Đăng nội dung này?" : "Ẩn nội dung này?"}
        description={
          pendingStatus?.status === "published"
            ? `“${String(pendingStatus?.row.title ?? pendingStatus?.row.name ?? config.label)}” sẽ hiển thị công khai trên website.`
            : `“${String(pendingStatus?.row.title ?? pendingStatus?.row.name ?? config.label)}” sẽ ẩn khỏi website cho tới khi được đăng lại.`
        }
        confirmLabel={pendingStatus?.status === "published" ? "Đăng ngay" : "Ẩn ngay"}
        tone="primary"
        onCancel={() => setPendingStatus(null)}
        onConfirm={async () => {
          if (!pendingStatus) return;
          await rowStatusMutation.mutateAsync({ id: String(pendingStatus.row._id ?? ""), status: pendingStatus.status });
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingRowDelete)}
        title={`Xoá ${config.label} này?`}
        description="Dữ liệu sẽ bị xoá khỏi hệ thống và không thể hoàn tác."
        confirmLabel="Xoá vĩnh viễn"
        onCancel={() => setPendingRowDelete(null)}
        onConfirm={async () => {
          if (!pendingRowDelete) return;
          await rowDeleteMutation.mutateAsync(String(pendingRowDelete._id ?? ""));
        }}
      />
    </section>
  );
}

export { formatCellValue };
