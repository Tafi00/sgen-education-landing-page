import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, Cake, Loader2, Phone, Search, X } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { DataTable } from "../../components/admin/DataTable";
import { formatPhone } from "../../../shared/phone";
import type { ColumnConfig } from "../../admin/types";

type CustomerRow = {
  _id: string;
  name: string;
  /** YYYY-MM-DD */
  birthDate: string;
  birthMonth: number;
  birthDay: number;
  phone: string;
  source: "lookup" | "ebook";
  createdAt: string;
  exportCount: number;
  lastExportAt: string | null;
  editions: { key: "demo" | "full"; label: string }[];
};

type ListResponse = { items: CustomerRow[]; total: number; page: number; pageSize: number; totalPages: number };

type ExportRow = { _id: string; edition: string; editionLabel: string; status: "success" | "failed"; error: string; createdAt: string; customerPhone: string; codeDisplay: string; holderName: string | null };
type ReportRow = { _id: string; title: string; createdAt: string; source: string };
type DetailResponse = { item: CustomerRow; exports: ExportRow[]; reports: ReportRow[] };

const COLUMNS: ColumnConfig[] = [
  { key: "name", label: "Khách hàng", sortable: true },
  { key: "phone", label: "Số điện thoại" },
  { key: "birthDate", label: "Ngày sinh", sortable: true },
  { key: "editions", label: "Ebook đã xuất" },
  { key: "lastExportAt", label: "Xuất gần nhất", sortable: true },
  { key: "createdAt", label: "Tạo lúc", sortable: true },
];

const SOURCE_LABEL: Record<CustomerRow["source"], string> = { lookup: "Từ bước tra cứu", ebook: "Từ lần xuất ebook" };

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** YYYY-MM-DD → DD/MM/YYYY (không qua Date để không lệch múi giờ). */
function formatBirthDate(value: string) {
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value || "—";
}

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);
const DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

export function CustomersPage() {
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [edition, setEdition] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [detail, setDetail] = useState<CustomerRow | null>(null);
  const pageSize = 20;

  const listQuery = useQuery({
    queryKey: ["admin", "customers", page, sort, dir, search, birthMonth, birthDay, edition],
    queryFn: () => api.get<ListResponse>("/api/admin/customers", { query: { page, pageSize, sort, dir, q: search, birthMonth, birthDay, edition } }),
  });

  const rows = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const hasFilters = Boolean(search || birthMonth || birthDay || edition);

  const onSort = (key: string) => {
    if (sort === key) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(key);
      setDir(key === "name" ? "asc" : "desc");
    }
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setSearchDraft("");
    setBirthMonth("");
    setBirthDay("");
    setEdition("");
    setPage(1);
  };

  const renderCell = (row: CustomerRow, column: ColumnConfig) => {
    switch (column.key) {
      case "name":
        return (
          <span className="relation-cell">
            <span className="relation-cell__label">{row.name}</span>
            <span className="relation-cell__sub">{SOURCE_LABEL[row.source]}</span>
          </span>
        );
      case "phone":
        return <span title={row.phone}>{formatPhone(row.phone)}</span>;
      case "birthDate":
        return formatBirthDate(row.birthDate);
      case "editions":
        return row.exportCount ? (
          <span className="customer-editions">
            {row.editions.map((item) => (
              <span key={item.key} className={`status-badge status-badge--${item.key === "full" ? "active" : "pending"}`}>
                {item.label}
              </span>
            ))}
            <small>{row.exportCount} lượt</small>
          </span>
        ) : (
          <span className="muted">Chưa xuất</span>
        );
      case "lastExportAt":
        return formatDateTime(row.lastExportAt);
      case "createdAt":
        return formatDateTime(row.createdAt);
      default:
        return "—";
    }
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    setSearch(searchDraft.trim());
    setPage(1);
  };

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Khách hàng</h1>
          <p>Hồ sơ khách hàng đã để lại số điện thoại ở bước tra cứu hoặc được xuất ebook. Tìm theo họ tên hoặc số điện thoại, lọc theo ngày/tháng sinh để chăm sóc sinh nhật.</p>
        </div>
      </header>

      <div className="admin-toolbar">
        <form className="admin-toolbar__search" onSubmit={submitSearch}>
          <Search aria-hidden="true" />
          <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Tìm theo họ tên hoặc số điện thoại…" aria-label="Tìm khách hàng" />
          <button type="submit" className="btn btn--secondary">Tìm</button>
        </form>
        <label className="admin-toolbar__page-size">
          Tháng sinh
          <select
            value={birthMonth}
            onChange={(event) => {
              setBirthMonth(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                Tháng {month}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-toolbar__page-size">
          Ngày sinh
          <select
            value={birthDay}
            onChange={(event) => {
              setBirthDay(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                Ngày {day}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-toolbar__page-size">
          Loại ebook đã xuất
          <select
            value={edition}
            onChange={(event) => {
              setEdition(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            <option value="demo">Demo 3 chỉ số</option>
            <option value="full">Ebook đầy đủ</option>
          </select>
        </label>
        {hasFilters ? (
          <button type="button" className="btn btn--secondary" onClick={resetFilters}>
            <X aria-hidden="true" /> Bỏ lọc
          </button>
        ) : null}
      </div>

      <DataTable<CustomerRow>
        columns={COLUMNS}
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        sort={sort}
        dir={dir}
        loading={listQuery.isLoading}
        error={listQuery.isError ? errorMessage(listQuery.error) : undefined}
        emptyTitle={hasFilters ? "Không có khách hàng nào khớp bộ lọc" : "Chưa có khách hàng nào"}
        emptyHint={hasFilters ? "Thử đổi từ khoá hoặc bỏ bớt bộ lọc." : "Khách hàng xuất hiện khi có người nhập số điện thoại ở bước tra cứu hoặc xuất ebook."}
        filtered={hasFilters}
        onSort={onSort}
        onPageChange={setPage}
        onRowClick={setDetail}
        renderCell={renderCell}
        rowActions={(row) => (
          <button type="button" className="table-action" title="Xem hồ sơ và lịch sử xuất" aria-label="Xem hồ sơ" onClick={(event) => { event.stopPropagation(); setDetail(row); }}>
            <BookOpen aria-hidden="true" />
          </button>
        )}
      />

      {detail ? <CustomerDetailDialog key={detail._id} row={detail} onClose={() => setDetail(null)} /> : null}
    </section>
  );
}

function CustomerDetailDialog({ row, onClose }: { row: CustomerRow; onClose: () => void }) {
  const detailQuery = useQuery({
    queryKey: ["admin", "customers", row._id, "detail"],
    queryFn: () => api.get<DetailResponse>(`/api/admin/customers/${row._id}`),
  });
  const customer = detailQuery.data?.item ?? row;
  const exportsList = detailQuery.data?.exports ?? [];
  const reports = detailQuery.data?.reports ?? [];

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Hồ sơ khách hàng ${customer.name}`} onClick={onClose}>
      <div className="confirm-dialog ebook-detail" onClick={(event) => event.stopPropagation()}>
        <header>
          <Phone aria-hidden="true" />
          <div>
            <h2>{customer.name}</h2>
            <p>
              {formatPhone(customer.phone)} · <Cake aria-hidden="true" style={{ width: 14, height: 14, verticalAlign: "-2px" }} /> {formatBirthDate(customer.birthDate)}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X aria-hidden="true" />
          </button>
        </header>

        <dl className="customer-facts">
          <div>
            <dt>Số điện thoại (lưu dạng chuỗi)</dt>
            <dd>{customer.phone}</dd>
          </div>
          <div>
            <dt>Nguồn tạo hồ sơ</dt>
            <dd>{SOURCE_LABEL[customer.source]}</dd>
          </div>
          <div>
            <dt>Tạo lúc</dt>
            <dd>{formatDateTime(customer.createdAt)}</dd>
          </div>
          <div>
            <dt>Đã xuất thành công</dt>
            <dd>{customer.exportCount} lượt</dd>
          </div>
        </dl>

        <div>
          <h3 className="ebook-history__title">Lịch sử xuất ebook</h3>
          {detailQuery.isLoading ? (
            <p className="muted">
              <Loader2 className="spin" aria-hidden="true" /> Đang tải…
            </p>
          ) : detailQuery.isError ? (
            <p className="admin-error">
              <AlertTriangle aria-hidden="true" /> {errorMessage(detailQuery.error)}
            </p>
          ) : exportsList.length === 0 ? (
            <p className="muted">Chưa xuất ebook lần nào.</p>
          ) : (
            <div className="admin-table-wrap ebook-history">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Loại ebook</th>
                    <th>Trạng thái</th>
                    <th>Mã thực hiện</th>
                  </tr>
                </thead>
                <tbody>
                  {exportsList.map((item) => (
                    <tr key={item._id}>
                      <td>{formatDateTime(item.createdAt)}</td>
                      <td>{item.editionLabel}</td>
                      <td>
                        <span className={`status-badge status-badge--${item.status === "success" ? "active" : "cancelled"}`} title={item.error || undefined}>
                          {item.status === "success" ? "Thành công" : "Lỗi tạo file"}
                        </span>
                      </td>
                      <td>
                        {item.codeDisplay || "—"}
                        {item.holderName ? <small className="muted"> · {item.holderName}</small> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {reports.length ? (
          <div>
            <h3 className="ebook-history__title">Báo cáo tra cứu gắn với hồ sơ</h3>
            <ul className="customer-reports">
              {reports.map((report) => (
                <li key={report._id}>
                  <a href={`/admin/tra-cuu/${report._id}`}>{report.title || "Báo cáo Thần số học"}</a>
                  <small className="muted"> · {formatDateTime(report.createdAt)}</small>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <footer>
          <button type="button" className="btn btn--secondary btn--sm" onClick={onClose}>
            Đóng
          </button>
        </footer>
      </div>
    </div>
  );
}
