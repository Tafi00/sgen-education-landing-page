import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, Check, ClipboardCopy, Download, Info, Link2, Loader2, Lock, LockOpen, Plus, Search, Settings2, Trash2, X } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { DataTable } from "../../components/admin/DataTable";
import { useToast } from "../../components/ui/Toast";
import { EBOOK_EDITION_LABEL, EBOOK_PLANS, EBOOK_PLAN_KEYS, EBOOK_STATE_LABEL, formatEbookCode, type EbookCodeState, type EbookPlanKey } from "../../../shared/ebook";
import type { ColumnConfig } from "../../admin/types";

type CodeRow = {
  _id: string;
  code: string;
  display: string;
  plan: EbookPlanKey;
  planLabel: string;
  edition: "demo" | "full";
  quota: number;
  used: number;
  remaining: number;
  status: "active" | "disabled";
  state: EbookCodeState;
  holderName: string;
  holderContact: string;
  note: string;
  batchId: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
};

type ListResponse = { items: CodeRow[]; total: number; page: number; pageSize: number; totalPages: number };
type ExportRow = { _id: string; customerName: string; birthDate: string; customerPhone?: string; edition: string; status?: "success" | "failed"; error?: string; createdAt: string };

const STATE_BADGE: Record<EbookCodeState, string> = {
  active: "active",
  exhausted: "pending",
  expired: "expired",
  disabled: "cancelled",
};

const COLUMNS: ColumnConfig[] = [
  { key: "display", label: "Mã", sortable: true },
  { key: "holderName", label: "Người nhận" },
  { key: "used", label: "Đã dùng", sortable: true },
  { key: "state", label: "Trạng thái" },
  { key: "createdAt", label: "Tạo lúc", sortable: true },
];

const SORT_KEYS: Record<string, string> = { display: "code", used: "used", createdAt: "createdAt", lastUsedAt: "lastUsedAt" };

function linkFor(code: string) {
  return `${window.location.origin}/ebook?ma=${encodeURIComponent(code)}`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

function downloadCsv(rows: CodeRow[], filename: string) {
  const header = ["Mã", "Gói", "Số lượt", "Người nhận", "Liên hệ", "Đường dẫn tự đăng nhập"];
  const lines = rows.map((row) =>
    [row.display, row.planLabel, row.quota, row.holderName, row.holderContact, linkFor(row.code)].map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
  );
  const blob = new Blob([`﻿${[header.join(","), ...lines].join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function StateBadge({ state }: { state: EbookCodeState }) {
  return <span className={`status-badge status-badge--${STATE_BADGE[state]}`}>{EBOOK_STATE_LABEL[state]}</span>;
}

function Usage({ row }: { row: CodeRow }) {
  const percent = Math.min(100, Math.round((row.used / Math.max(1, row.quota)) * 100));
  return (
    <span className="ebook-usage">
      <b>
        {row.used}/{row.quota}
      </b>
      <i aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </i>
    </span>
  );
}

export function EbookCodesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  // ---- Tạo mã ----
  const [plan, setPlan] = useState<EbookPlanKey>("demo");
  const [count, setCount] = useState("1");
  const [holderName, setHolderName] = useState("");
  const [holderContact, setHolderContact] = useState("");
  const [note, setNote] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");
  const [createError, setCreateError] = useState("");
  const [generated, setGenerated] = useState<CodeRow[]>([]);
  const [copied, setCopied] = useState("");

  // ---- Danh sách ----
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const pageSize = 20;

  const [detail, setDetail] = useState<CodeRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CodeRow | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin", "ebook-codes", page, sort, dir, search, planFilter, stateFilter],
    queryFn: () =>
      api.get<ListResponse>("/api/admin/ebook-codes", {
        query: { page, pageSize, sort: SORT_KEYS[sort] ?? sort, dir, q: search, plan: planFilter, state: stateFilter },
      }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin", "ebook-codes"] });

  const generateMutation = useMutation({
    mutationFn: () =>
      api.post<{ items: CodeRow[] }>("/api/admin/ebook-codes/generate", {
        plan,
        count: Number(count),
        holderName: holderName.trim() || undefined,
        holderContact: holderContact.trim() || undefined,
        note: note.trim() || undefined,
        expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
      }),
    onSuccess: async (result) => {
      setGenerated(result.items);
      setCreateError("");
      toast.success("Đã tạo mã", `${result.items.length} mã ${EBOOK_PLANS[plan].label} đã sẵn sàng để cấp.`);
      await refresh();
    },
    onError: (error) => setCreateError(errorMessage(error)),
  });

  const toggleMutation = useMutation({
    mutationFn: (row: CodeRow) => api.patch(`/api/admin/ebook-codes/${row._id}`, { status: row.status === "active" ? "disabled" : "active" }),
    onSuccess: async (_result, row) => {
      toast.success(row.status === "active" ? "Đã khoá mã" : "Đã mở lại mã", formatEbookCode(row.code));
      await refresh();
    },
    onError: (error) => toast.error("Không cập nhật được", errorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (row: CodeRow) => api.del(`/api/admin/ebook-codes/${row._id}`),
    onSuccess: async () => {
      toast.success("Đã xoá mã", "Mã và lịch sử xuất file của mã đã được xoá.");
      setPendingDelete(null);
      await refresh();
    },
    onError: (error) => {
      setPendingDelete(null);
      toast.error("Không xoá được", errorMessage(error));
    },
  });

  const submitGenerate = (event: FormEvent) => {
    event.preventDefault();
    const n = Number(count);
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      setCreateError("Số lượng mã phải từ 1 đến 100.");
      return;
    }
    if (expiresInDays && (!Number.isInteger(Number(expiresInDays)) || Number(expiresInDays) < 1)) {
      setCreateError("Số ngày hiệu lực phải là số nguyên dương, hoặc để trống nếu mã không hết hạn.");
      return;
    }
    setCreateError("");
    generateMutation.mutate();
  };

  const flashCopied = async (key: string, text: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(key);
      window.setTimeout(() => setCopied((current) => (current === key ? "" : current)), 1800);
    } else {
      toast.error("Không sao chép được", "Trình duyệt chặn thao tác sao chép. Hãy bôi đen và sao chép thủ công.");
    }
  };

  const selectedPlan = EBOOK_PLANS[plan];
  const rows = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const hasFilters = Boolean(search || stateFilter || planFilter !== "all");

  const onSort = (key: string) => {
    if (sort === key) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(key);
      setDir("desc");
    }
    setPage(1);
  };

  const renderCell = (row: CodeRow, column: ColumnConfig) => {
    switch (column.key) {
      case "display":
        return (
          <span className="relation-cell">
            <code className="ebook-code">{row.display}</code>
            <span className="relation-cell__sub">{row.planLabel}</span>
          </span>
        );
      case "holderName":
        return (
          <span className="relation-cell">
            <span className="relation-cell__label">{row.holderName || "—"}</span>
            {row.holderContact ? <span className="relation-cell__sub">{row.holderContact}</span> : null}
          </span>
        );
      case "used":
        return <Usage row={row} />;
      case "state":
        return <StateBadge state={row.state} />;
      case "createdAt":
        return formatDateTime(row.createdAt);
      default:
        return "—";
    }
  };

  const planOptions = useMemo(() => EBOOK_PLAN_KEYS.map((key) => EBOOK_PLANS[key]), []);

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Mã ebook</h1>
          <p>Tạo mã xuất ebook cho cộng tác viên (bản Demo 3 chỉ số, 100 lượt) và học viên (combo 3–100 ebook). Người nhận vào trang /ebook, nhập mã là tải được file.</p>
        </div>
        <div className="admin-page__actions">
          <a className="btn btn--secondary" href="/ebook" target="_blank" rel="noreferrer">
            <BookOpen aria-hidden="true" /> Mở trang /ebook
          </a>
        </div>
      </header>

      <div className="admin-banner admin-banner--info">
        <Info aria-hidden="true" />
        Khi xuất, người dùng chọn bản “Demo 3 chỉ số” hoặc “Đầy đủ” (mã demo chỉ chọn được bản Demo). Cả hai bản hiện dùng mẫu 18 trang (luận giải chi tiết 3 chỉ số Sứ mệnh, Đường đời, Đam mê, trang tổng hợp đầy đủ) cho tới khi có tệp mẫu ebook đầy đủ. Hồ sơ khách hàng và lịch sử xuất xem ở mục Khách hàng.
      </div>

      <form className="admin-card" onSubmit={submitGenerate} noValidate>
        <h2>Tạo mã mới</h2>
        <div className="admin-form__grid">
          <div className="field">
            <label className="field__label" htmlFor="ebook-plan">Gói</label>
            <span className="field__control">
              <select id="ebook-plan" value={plan} onChange={(event) => setPlan(event.target.value as EbookPlanKey)}>
                {planOptions.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label} — {item.quota} lượt
                  </option>
                ))}
              </select>
            </span>
            <p className="field__hint">{selectedPlan.edition === "demo" ? "Dành cho cộng tác viên. Hết 100 lượt thì cấp mã mới." : "Mỗi lượt xuất = 1 ebook đầy đủ."}</p>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ebook-count">Số lượng mã cần tạo</label>
            <span className="field__control">
              <input id="ebook-count" type="number" min={1} max={100} inputMode="numeric" value={count} onChange={(event) => setCount(event.target.value)} />
            </span>
            <p className="field__hint">Tối đa 100 mã mỗi lần.</p>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ebook-holder">Người nhận / cộng tác viên</label>
            <span className="field__control">
              <input id="ebook-holder" value={holderName} maxLength={120} placeholder="Ví dụ: CTV Nguyễn Văn A" onChange={(event) => setHolderName(event.target.value)} />
            </span>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ebook-contact">Liên hệ (không bắt buộc)</label>
            <span className="field__control">
              <input id="ebook-contact" value={holderContact} maxLength={120} placeholder="Số điện thoại hoặc Zalo" onChange={(event) => setHolderContact(event.target.value)} />
            </span>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ebook-note">Ghi chú nội bộ</label>
            <span className="field__control">
              <input id="ebook-note" value={note} maxLength={300} placeholder="Ví dụ: đợt tập huấn tháng 11" onChange={(event) => setNote(event.target.value)} />
            </span>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="ebook-expires">Hết hạn sau (ngày)</label>
            <span className="field__control">
              <input id="ebook-expires" type="number" min={1} inputMode="numeric" value={expiresInDays} placeholder="Để trống = không hết hạn" onChange={(event) => setExpiresInDays(event.target.value)} />
            </span>
          </div>
        </div>
        {createError ? (
          <p className="admin-error" role="alert" style={{ marginTop: 12 }}>
            <AlertTriangle aria-hidden="true" /> {createError}
          </p>
        ) : null}
        <div className="admin-form__bar">
          <div />
          <div className="admin-form__bar-end">
            <button type="submit" className="btn btn--primary" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <Plus aria-hidden="true" />}
              Tạo {Number(count) > 1 ? `${count} mã` : "mã"}
            </button>
          </div>
        </div>
      </form>

      {generated.length ? (
        <div className="admin-card ebook-generated">
          <div className="admin-panel__head">
            <h2>Đã tạo {generated.length} mã — gửi cho người nhận</h2>
            <div className="admin-page__actions">
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => void flashCopied("all", generated.map((row) => row.display).join("\n"))}>
                {copied === "all" ? <Check aria-hidden="true" /> : <ClipboardCopy aria-hidden="true" />} Sao chép tất cả mã
              </button>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => downloadCsv(generated, `ma-ebook-${generated[0]?.batchId ?? "moi"}.csv`)}>
                <Download aria-hidden="true" /> Tải CSV
              </button>
              <button type="button" className="btn btn--secondary btn--sm" onClick={() => setGenerated([])}>
                <X aria-hidden="true" /> Ẩn
              </button>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Gói</th>
                  <th>Đường dẫn tự đăng nhập</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {generated.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <code className="ebook-code">{row.display}</code>
                    </td>
                    <td>{row.planLabel}</td>
                    <td className="ebook-link">{linkFor(row.code)}</td>
                    <td className="data-table__actions">
                      <div className="data-table__actions-inner">
                        <button type="button" className="table-action" title="Sao chép mã" aria-label="Sao chép mã" onClick={() => void flashCopied(`c-${row._id}`, row.display)}>
                          {copied === `c-${row._id}` ? <Check aria-hidden="true" /> : <ClipboardCopy aria-hidden="true" />}
                        </button>
                        <button type="button" className="table-action" title="Sao chép đường dẫn" aria-label="Sao chép đường dẫn" onClick={() => void flashCopied(`l-${row._id}`, linkFor(row.code))}>
                          {copied === `l-${row._id}` ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="admin-toolbar">
        <form
          className="admin-toolbar__search"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(searchDraft.trim());
            setPage(1);
          }}
        >
          <Search aria-hidden="true" />
          <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Tìm theo mã, người nhận, ghi chú…" aria-label="Tìm mã ebook" />
          <button type="submit" className="btn btn--secondary">Tìm</button>
        </form>
        <label className="admin-toolbar__page-size">
          Gói
          <select
            value={planFilter}
            onChange={(event) => {
              setPlanFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả</option>
            {planOptions.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-toolbar__page-size">
          Trạng thái
          <select
            value={stateFilter}
            onChange={(event) => {
              setStateFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            {(Object.keys(EBOOK_STATE_LABEL) as EbookCodeState[]).map((key) => (
              <option key={key} value={key}>
                {EBOOK_STATE_LABEL[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <DataTable<CodeRow>
        columns={COLUMNS}
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        sort={sort}
        dir={dir}
        loading={listQuery.isLoading}
        error={listQuery.isError ? errorMessage(listQuery.error) : undefined}
        emptyTitle={hasFilters ? "Không có mã nào khớp bộ lọc" : "Chưa có mã ebook nào"}
        emptyHint={hasFilters ? "Thử đổi từ khoá hoặc bỏ bớt bộ lọc." : "Dùng form phía trên để tạo mã đầu tiên."}
        filtered={hasFilters}
        onSort={onSort}
        onPageChange={setPage}
        onRowClick={setDetail}
        renderCell={renderCell}
        rowActions={(row) => (
          <>
            <button type="button" className="table-action" title="Sao chép mã" aria-label="Sao chép mã" onClick={(event) => { event.stopPropagation(); void flashCopied(`t-${row._id}`, row.display); }}>
              {copied === `t-${row._id}` ? <Check aria-hidden="true" /> : <ClipboardCopy aria-hidden="true" />}
            </button>
            <button type="button" className="table-action" title="Sao chép đường dẫn tự đăng nhập" aria-label="Sao chép đường dẫn" onClick={(event) => { event.stopPropagation(); void flashCopied(`k-${row._id}`, linkFor(row.code)); }}>
              {copied === `k-${row._id}` ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
            </button>
            <button type="button" className="table-action" title="Chi tiết, thêm lượt, lịch sử" aria-label="Chi tiết" onClick={(event) => { event.stopPropagation(); setDetail(row); }}>
              <Settings2 aria-hidden="true" />
            </button>
            <button type="button" className="table-action" title={row.status === "active" ? "Khoá mã" : "Mở lại mã"} aria-label={row.status === "active" ? "Khoá mã" : "Mở lại mã"} onClick={(event) => { event.stopPropagation(); toggleMutation.mutate(row); }}>
              {row.status === "active" ? <Lock aria-hidden="true" /> : <LockOpen aria-hidden="true" />}
            </button>
          </>
        )}
      />

      {detail ? (
        <CodeDetailDialog
          key={detail._id}
          row={rows.find((item) => item._id === detail._id) ?? detail}
          onClose={() => setDetail(null)}
          onChanged={refresh}
          onDelete={(target) => {
            setDetail(null);
            setPendingDelete(target);
          }}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xoá mã ebook này?"
        description={pendingDelete ? `Mã ${pendingDelete.display} và lịch sử xuất file sẽ bị xoá, người đang giữ mã không dùng được nữa.` : ""}
        confirmLabel="Xoá mã"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) await deleteMutation.mutateAsync(pendingDelete);
        }}
      />
    </section>
  );
}

function CodeDetailDialog({ row, onClose, onChanged, onDelete }: { row: CodeRow; onClose: () => void; onChanged: () => Promise<unknown>; onDelete: (row: CodeRow) => void }) {
  const toast = useToast();
  const [holderName, setHolderName] = useState(row.holderName);
  const [holderContact, setHolderContact] = useState(row.holderContact);
  const [note, setNote] = useState(row.note);
  const [addQuota, setAddQuota] = useState("");
  const [expiresAt, setExpiresAt] = useState(row.expiresAt ? row.expiresAt.slice(0, 10) : "");
  const [error, setError] = useState("");

  const historyQuery = useQuery({
    queryKey: ["admin", "ebook-codes", row._id, "exports"],
    queryFn: () => api.get<{ items: ExportRow[] }>(`/api/admin/ebook-codes/${row._id}/exports`),
  });

  const save = useMutation({
    mutationFn: () =>
      api.patch(`/api/admin/ebook-codes/${row._id}`, {
        holderName,
        holderContact,
        note,
        addQuota: addQuota ? Number(addQuota) : undefined,
        expiresAt: expiresAt ? new Date(`${expiresAt}T23:59:59`).toISOString() : null,
      }),
    onSuccess: async () => {
      toast.success("Đã lưu", `Mã ${row.display} đã được cập nhật.`);
      setAddQuota("");
      await onChanged();
      onClose();
    },
    onError: (err) => setError(errorMessage(err)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (addQuota && (!Number.isInteger(Number(addQuota)) || Number(addQuota) < 1)) {
      setError("Số lượt cộng thêm phải là số nguyên dương.");
      return;
    }
    setError("");
    save.mutate();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`Chi tiết mã ${row.display}`} onClick={onClose}>
      <form className="confirm-dialog ebook-detail" onSubmit={submit} onClick={(event) => event.stopPropagation()}>
        <header>
          <BookOpen aria-hidden="true" />
          <div>
            <h2>{row.display}</h2>
            <p>
              {row.planLabel} · đã dùng {row.used}/{row.quota} lượt · <StateBadge state={row.state} />
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="admin-form__grid">
          <div className="field">
            <label className="field__label" htmlFor="d-holder">Người nhận</label>
            <span className="field__control">
              <input id="d-holder" value={holderName} maxLength={120} onChange={(event) => setHolderName(event.target.value)} />
            </span>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="d-contact">Liên hệ</label>
            <span className="field__control">
              <input id="d-contact" value={holderContact} maxLength={120} onChange={(event) => setHolderContact(event.target.value)} />
            </span>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="d-add">Cộng thêm lượt</label>
            <span className="field__control">
              <input id="d-add" type="number" min={1} inputMode="numeric" value={addQuota} placeholder="Ví dụ: 10" onChange={(event) => setAddQuota(event.target.value)} />
            </span>
          </div>
          <div className="field">
            <label className="field__label" htmlFor="d-exp">Hết hạn vào ngày</label>
            <span className="field__control">
              <input id="d-exp" type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
            </span>
            <p className="field__hint">Để trống nếu mã không hết hạn.</p>
          </div>
          <div className="field field--wide admin-form__cell--wide">
            <label className="field__label" htmlFor="d-note">Ghi chú nội bộ</label>
            <span className="field__control">
              <input id="d-note" value={note} maxLength={300} onChange={(event) => setNote(event.target.value)} />
            </span>
          </div>
        </div>

        <div>
          <h3 className="ebook-history__title">Lịch sử xuất file</h3>
          {historyQuery.isLoading ? (
            <p className="muted">
              <Loader2 className="spin" aria-hidden="true" /> Đang tải…
            </p>
          ) : historyQuery.isError ? (
            <p className="admin-error">{errorMessage(historyQuery.error)}</p>
          ) : (historyQuery.data?.items.length ?? 0) === 0 ? (
            <p className="muted">Mã chưa được dùng lần nào.</p>
          ) : (
            <div className="admin-table-wrap ebook-history">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Họ tên</th>
                    <th>Ngày sinh</th>
                    <th>Số điện thoại</th>
                    <th>Loại ebook</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {historyQuery.data?.items.map((item) => (
                    <tr key={item._id}>
                      <td>{formatDateTime(item.createdAt)}</td>
                      <td>{item.customerName || "—"}</td>
                      <td>{item.birthDate || "—"}</td>
                      <td>{item.customerPhone || "—"}</td>
                      <td>{EBOOK_EDITION_LABEL[item.edition as keyof typeof EBOOK_EDITION_LABEL] ?? item.edition}</td>
                      <td>
                        <span className={`status-badge status-badge--${item.status === "failed" ? "cancelled" : "active"}`} title={item.error || undefined}>
                          {item.status === "failed" ? "Lỗi tạo file" : "Thành công"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {error ? (
          <p className="admin-error" role="alert">
            <AlertTriangle aria-hidden="true" /> {error}
          </p>
        ) : null}

        <footer>
          <button type="button" className="btn btn--danger btn--sm ebook-detail__delete" onClick={() => onDelete(row)}>
            <Trash2 aria-hidden="true" /> Xoá mã
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={onClose}>
            Đóng
          </button>
          <button type="submit" className="btn btn--primary btn--sm" disabled={save.isPending}>
            {save.isPending ? <Loader2 className="spin" aria-hidden="true" /> : null}
            Lưu thay đổi
          </button>
        </footer>
      </form>
    </div>
  );
}
