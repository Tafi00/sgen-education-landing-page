import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { ColumnConfig } from "../../admin/types";

export type DataTableProps<T> = {
  columns: ColumnConfig[];
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  sort: string;
  dir: "asc" | "desc";
  loading?: boolean;
  error?: string;
  emptyTitle: string;
  emptyHint?: string;
  filtered?: boolean;
  onSort: (key: string) => void;
  onPageChange: (page: number) => void;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  renderCell?: (row: T, column: ColumnConfig) => ReactNode;
  /** Cột hành động cuối bảng, canh phải. */
  rowActions?: (row: T) => ReactNode;
  /** Số dòng skeleton khi đang tải (mặc định 4). */
  skeletonRows?: number;
};

const CARD_MODE_QUERY = "(max-width: 767px)";

/** Mobile hẹp: bảng đổi sang dạng thẻ (CSS `.data-table--cards` trong admin.css). */
function useCardMode() {
  const [cardMode, setCardMode] = useState(() => typeof window !== "undefined" && window.matchMedia(CARD_MODE_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(CARD_MODE_QUERY);
    const sync = () => setCardMode(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return cardMode;
}

function formatDate(value: unknown) {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatCellValue(value: unknown, kind: ColumnConfig["kind"]): ReactNode {
  if (value === null || value === undefined || value === "") return "—";
  if (kind === "date") return formatDate(value);
  if (kind === "boolean") return value ? "Có" : "Không";
  if (kind === "currency") return `${Number(value).toLocaleString("vi-VN")} đ`;
  if (kind === "number") return Number(value).toLocaleString("vi-VN");
  return String(value);
}

export function DataTable<T extends { _id?: string }>({
  columns,
  rows,
  total,
  page,
  pageSize,
  sort,
  dir,
  loading,
  error,
  emptyTitle,
  emptyHint,
  filtered,
  onSort,
  onPageChange,
  onRowClick,
  selectable,
  selectedIds = [],
  onSelectionChange,
  renderCell,
  rowActions,
  skeletonRows = 4,
}: DataTableProps<T>) {
  const [hovered, setHovered] = useState<string | null>(null);
  const cardMode = useCardMode();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const columnCount = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allSelected = rows.length > 0 && rows.every((row) => row._id && selectedSet.has(row._id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    if (allSelected) onSelectionChange(selectedIds.filter((id) => !rows.some((row) => row._id === id)));
    else onSelectionChange([...new Set([...selectedIds, ...rows.map((row) => row._id).filter((id): id is string => Boolean(id))])]);
  };

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(selectedSet.has(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]);
  };

  return (
    <div className={`data-table ${cardMode ? "data-table--cards" : ""}`}>
      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              {selectable ? (
                <th className="data-table__select">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Chọn tất cả" />
                </th>
              ) : null}
              {columns.map((column) => (
                <th key={column.key} style={column.width ? { width: column.width } : undefined}>
                  {column.sortable ? (
                    <button type="button" className={`data-table__sort ${sort === column.key ? "is-active" : ""}`} onClick={() => onSort(column.key)}>
                      {column.label}
                      {sort === column.key ? dir === "asc" ? <ArrowUp aria-hidden="true" /> : <ArrowDown aria-hidden="true" /> : null}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              {rowActions ? <th className="data-table__actions" aria-label="Hành động" /> : null}
            </tr>
          </thead>
          <tbody aria-busy={loading ? true : undefined}>
            {loading ? (
              Array.from({ length: Math.max(3, Math.min(5, skeletonRows)) }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="data-table__skeleton">
                  {selectable ? (
                    <td className="data-table__select">
                      <span className="skeleton skeleton--check" />
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td key={column.key}>
                      <span className="skeleton" />
                    </td>
                  ))}
                  {rowActions ? (
                    <td className="data-table__actions">
                      <span className="skeleton skeleton--short" />
                    </td>
                  ) : null}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columnCount} className="data-table__state data-table__state--error">
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="data-table__state">
                  <Inbox aria-hidden="true" />
                  <strong>{filtered ? "Không có bản ghi nào khớp bộ lọc" : emptyTitle}</strong>
                  <p>{filtered ? "Thử xoá bộ lọc hoặc đổi từ khoá tìm kiếm." : emptyHint ?? "Dữ liệu sẽ xuất hiện ở đây sau khi bạn thêm mới."}</p>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const id = row._id ?? "";
                return (
                  <tr
                    key={id}
                    className={hovered === id ? "is-hovered" : ""}
                    onMouseEnter={() => setHovered(id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => onRowClick?.(row)}
                    style={onRowClick ? { cursor: "pointer" } : undefined}
                  >
                    {selectable ? (
                      <td className="data-table__select" onClick={(event) => event.stopPropagation()}>
                        <label className="data-table__check">
                          <input type="checkbox" checked={selectedSet.has(id)} onChange={() => toggleRow(id)} aria-label="Chọn bản ghi" />
                        </label>
                      </td>
                    ) : null}
                    {columns.map((column) => (
                      <td key={column.key} data-label={column.label}>
                        {renderCell ? renderCell(row, column) : formatCellValue((row as Record<string, unknown>)[column.key], column.kind)}
                      </td>
                    ))}
                    {rowActions ? (
                      <td className="data-table__actions" onClick={(event) => event.stopPropagation()}>
                        <div className="data-table__actions-inner">{rowActions(row)}</div>
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <footer className="data-table__footer">
        <span>
          {total > 0 ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} trên ${total} bản ghi` : "0 bản ghi"}
          {selectedIds.length > 0 ? <em className="data-table__selected">Đã chọn {selectedIds.length}</em> : null}
        </span>
        <div className="data-table__pager">
          <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Trang trước">
            <ChevronLeft aria-hidden="true" />
          </button>
          <span>
            Trang {page}/{totalPages}
          </span>
          <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Trang sau">
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
      </footer>
    </div>
  );
}
