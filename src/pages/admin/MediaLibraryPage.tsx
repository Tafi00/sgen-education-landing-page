import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  FolderPlus,
  Image,
  LayoutGrid,
  List,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { TextField } from "../../components/form/Field";
import { useToast } from "../../components/ui/Toast";

export type MediaVariant = { label?: string; url: string; width: number };

export type MediaAsset = {
  _id: string;
  filename: string;
  url: string;
  mime: string;
  size: number;
  width: number;
  height: number;
  alt: string;
  folder: string;
  variants?: MediaVariant[];
  refCount?: number;
  createdAt: string;
};

export type MediaListResponse = { items: MediaAsset[]; total: number; page: number; pageSize: number; totalPages: number };

const DEFAULT_PAGE_SIZE = 24;
const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];
const SORT_FIELDS = ["createdAt", "filename", "size"];
const MAX_BYTES = 12 * 1024 * 1024;
const MAX_FILES = 20;
const VIEW_KEY = "sgen.admin.media.view";

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Mới tải lên trước" },
  { value: "createdAt:asc", label: "Cũ nhất trước" },
  { value: "filename:asc", label: "Tên tệp A → Z" },
  { value: "size:desc", label: "Dung lượng lớn nhất" },
];

type MediaView = "grid" | "table";

type QueueItem = {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
};

export function formatFileSize(bytes: number) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString("vi-VN")} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} MB`;
}

/** Chuẩn hoá tên thư mục giống `safeFolderName` phía backend. */
export function safeFolderName(folder: string) {
  const cleaned = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase();
  return cleaned || "general";
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function previewUrl(asset: MediaAsset) {
  return (
    asset.variants?.find((variant) => variant.width === 960)?.url ??
    asset.variants?.find((variant) => variant.width === 480)?.url ??
    asset.url
  );
}

/** Tải 1 tệp lên kèm tiến độ thật (XHR) — server nhận từng tệp ở trường `files`. */
function uploadFileWithProgress(file: File, folder: string, onProgress: (ratio: number) => void): Promise<MediaAsset> {
  // `Promise.withResolvers` không nằm trong lib ES2022 của cấu hình dự án,
  // nên buộc phải dùng dạng executor cho API XHR.
  return new Promise<MediaAsset>((resolve, reject) => {
    const formData = new FormData();
    formData.append("folder", folder);
    formData.append("files", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media/upload");
    xhr.withCredentials = true;
    const csrf = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith("sgen_csrf="))
      ?.slice("sgen_csrf=".length);
    if (csrf) xhr.setRequestHeader("x-csrf-token", csrf);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const payload = JSON.parse(xhr.responseText) as { items?: MediaAsset[] };
          const item = payload.items?.[0];
          if (item) resolve(item);
          else reject(new Error("Máy chủ không trả về tệp nào."));
        } catch {
          reject(new Error("Phản hồi từ máy chủ không hợp lệ."));
        }
        return;
      }
      let message = `Tải lên thất bại (${xhr.status}).`;
      try {
        const payload = JSON.parse(xhr.responseText) as { error?: { message?: string } };
        if (payload.error?.message) message = payload.error.message;
      } catch {
        /* giữ thông báo mặc định */
      }
      reject(new Error(message));
    };
    xhr.onerror = () => reject(new Error("Lỗi kết nối khi tải lên."));
    xhr.send(formData);
  });
}

export function MediaLibraryPage() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const q = params.get("q") ?? "";
  const folder = params.get("folder") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const rawPageSize = Number(params.get("pageSize") ?? "");
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize) ? rawPageSize : DEFAULT_PAGE_SIZE;
  const sort = SORT_FIELDS.includes(params.get("sort") ?? "") ? (params.get("sort") as string) : "createdAt";
  const dir = params.get("dir") === "asc" ? "asc" : "desc";

  const [searchDraft, setSearchDraft] = useState(q);
  const [uploadFolder, setUploadFolder] = useState(folder || "general");
  const [newFolderMode, setNewFolderMode] = useState(false);
  const [newFolderDraft, setNewFolderDraft] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<MediaAsset | null>(null);
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false);
  const [view, setView] = useState<MediaView>(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === "table" ? "table" : "grid";
    } catch {
      return "grid";
    }
  });

  const previewsRef = useRef<string[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* bỏ qua khi trình duyệt chặn localStorage */
    }
  }, [view]);

  useEffect(() => {
    return () => {
      for (const url of previewsRef.current) URL.revokeObjectURL(url);
    };
  }, []);

  useEffect(() => {
    setSearchDraft(q);
  }, [q]);

  const updateParams = useCallback(
    (patch: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const mediaQuery = useQuery({
    queryKey: ["admin", "media", { page, pageSize, q, folder, sort, dir }],
    queryFn: () =>
      api.get<MediaListResponse>("/api/admin/media", { query: { page, pageSize, q, folder, sort, dir } }),
  });

  const foldersQuery = useQuery({
    queryKey: ["admin", "media", "folders"],
    queryFn: () => api.get<MediaListResponse>("/api/admin/media", { query: { page: 1, pageSize: 100 } }),
    staleTime: 60_000,
  });

  const folders = useMemo(() => {
    const set = new Set<string>(["general"]);
    for (const item of foldersQuery.data?.items ?? []) {
      if (item.folder) set.add(item.folder);
    }
    if (folder) set.add(folder);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
  }, [foldersQuery.data, folder]);

  const effectiveUploadFolder = newFolderMode ? safeFolderName(newFolderDraft) : safeFolderName(uploadFolder);

  const invalidateMedia = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "media"] });
  }, [queryClient]);

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; alt?: string; folder?: string }) => {
      const body: { alt?: string; folder?: string } = {};
      if (payload.alt !== undefined) body.alt = payload.alt;
      if (payload.folder !== undefined) body.folder = payload.folder;
      return api.patch(`/api/admin/media/${payload.id}`, body);
    },
    onSuccess: async () => {
      toast.success("Đã lưu thông tin tệp");
      await invalidateMedia();
    },
    onError: (error) => toast.error("Không lưu được", errorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/api/admin/media/${id}`),
    onSuccess: async () => {
      toast.success("Đã xoá tệp", "Tệp đã được xoá khỏi thư viện và ổ đĩa.");
      setPendingDelete(null);
      await invalidateMedia();
    },
    onError: (error) => toast.error("Không xoá được", errorMessage(error)),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.post<{ affected: number }>("/api/admin/media/bulk-delete", { ids }),
    onSuccess: async (result, ids) => {
      toast.success("Đã xoá tệp", `${result?.affected ?? ids.length} tệp đã được xoá khỏi thư viện.`);
      setSelected([]);
      setPendingBulkDelete(false);
      await invalidateMedia();
    },
    onError: (error) => {
      setPendingBulkDelete(false);
      toast.error("Không xoá được", errorMessage(error));
    },
  });

  const items = mediaQuery.data?.items ?? [];
  const total = mediaQuery.data?.total ?? 0;
  const totalPages = mediaQuery.data?.totalPages ?? 1;
  const filtered = Boolean(q) || Boolean(folder);
  const allSelected = items.length > 0 && items.every((asset) => selected.includes(asset._id));

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (!incoming.length) return;
      const accepted: QueueItem[] = [];
      const rejected: string[] = [];
      let count = queue.length;
      for (const file of incoming) {
        if (!file.type.startsWith("image/")) {
          rejected.push(`${file.name}: không phải tệp ảnh`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          rejected.push(`${file.name}: vượt quá 12MB`);
          continue;
        }
        if (count >= MAX_FILES) {
          rejected.push(`${file.name}: vượt quá ${MAX_FILES} tệp`);
          continue;
        }
        const preview = URL.createObjectURL(file);
        previewsRef.current.push(preview);
        accepted.push({ id: `${file.name}-${file.size}-${Date.now()}-${count}`, file, preview, status: "pending", progress: 0 });
        count += 1;
      }
      if (accepted.length) setQueue((current) => [...current, ...accepted]);
      if (rejected.length) toast.error("Một số tệp bị bỏ qua", rejected.slice(0, 3).join(" · "));
    },
    [queue.length, toast],
  );

  const removeQueueItem = useCallback((id: string) => {
    setQueue((current) => {
      const target = current.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.preview);
        previewsRef.current = previewsRef.current.filter((url) => url !== target.preview);
      }
      return current.filter((item) => item.id !== id);
    });
  }, []);

  const runUpload = useCallback(async () => {
    if (!queue.length || uploading) return;
    setUploading(true);
    const target = effectiveUploadFolder;
    const snapshot = queue;
    let ok = 0;
    let failed = 0;
    for (const item of snapshot) {
      setQueue((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: "uploading", progress: 0, error: undefined } : entry)));
      try {
        await uploadFileWithProgress(item.file, target, (ratio) => {
          setQueue((current) => current.map((entry) => (entry.id === item.id ? { ...entry, progress: ratio } : entry)));
        });
        ok += 1;
        setQueue((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status: "done", progress: 1 } : entry)));
      } catch (error) {
        failed += 1;
        setQueue((current) =>
          current.map((entry) => (entry.id === item.id ? { ...entry, status: "error", progress: 0, error: errorMessage(error) } : entry)),
        );
      }
    }
    setUploading(false);
    if (ok > 0) {
      toast.success("Đã tải ảnh lên", `${ok} tệp đã được thêm vào thư mục “${target}”.`);
      await invalidateMedia();
    }
    if (failed > 0) toast.error("Một số tệp tải lên thất bại", `${failed} tệp chưa tải được, hãy thử lại.`);
    // Giữ lại các tệp lỗi để người dùng thử lại; xoá các tệp đã tải thành công.
    setQueue((current) => {
      for (const entry of current) {
        if (entry.status === "done") {
          URL.revokeObjectURL(entry.preview);
          previewsRef.current = previewsRef.current.filter((url) => url !== entry.preview);
        }
      }
      return current.filter((entry) => entry.status === "error");
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [queue, uploading, effectiveUploadFolder, toast, invalidateMedia]);

  const copyPath = useCallback(
    async (asset: MediaAsset) => {
      try {
        await navigator.clipboard.writeText(asset.url);
        toast.success("Đã sao chép đường dẫn", asset.url);
      } catch {
        toast.error("Không sao chép được", `Hãy sao chép thủ công: ${asset.url}`);
      }
    },
    [toast],
  );

  const openAsset = useCallback((asset: MediaAsset) => {
    window.open(asset.url, "_blank", "noopener,noreferrer");
  }, []);

  const saveAlt = useCallback(
    (asset: MediaAsset, value: string) => {
      if (value === (asset.alt ?? "")) return;
      updateMutation.mutate({ id: asset._id, alt: value });
    },
    [updateMutation],
  );

  const toggleSelect = useCallback((id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelected((current) => (allSelected ? current.filter((id) => !items.some((asset) => asset._id === id)) : Array.from(new Set([...current, ...items.map((asset) => asset._id)]))));
  }, [allSelected, items]);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const renderCard = (asset: MediaAsset) => {
    const isSelected = selected.includes(asset._id);
    return (
      <article className={`admin-media-card ${isSelected ? "is-selected" : ""}`} key={asset._id}>
        <div className="admin-media-card__head">
          <label className="media-check">
            <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(asset._id)} aria-label={`Chọn tệp ${asset.filename}`} />
          </label>
        </div>
        <button type="button" className="admin-media-card__thumb" onClick={() => openAsset(asset)} title="Mở trong tab mới">
          <img src={previewUrl(asset)} alt={asset.alt || asset.filename} loading="lazy" />
        </button>
        <div className="admin-media-card__meta">
          <strong title={asset.filename}>{asset.filename}</strong>
          <span className="muted">
            {formatFileSize(asset.size)}
            {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
          </span>
          <span className="muted">{formatDate(asset.createdAt)}</span>
          <span className="muted">Thư mục: {asset.folder || "general"}</span>
        </div>
        <label className="admin-media-card__alt">
          <span>Mô tả alt</span>
          <input
            value={altDrafts[asset._id] ?? asset.alt ?? ""}
            placeholder="Mô tả nội dung ảnh…"
            onChange={(event) => setAltDrafts((current) => ({ ...current, [asset._id]: event.target.value }))}
            onBlur={(event) => saveAlt(asset, event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
          />
        </label>
        <div className="admin-media-card__actions">
          <button type="button" className="button button--ghost" onClick={() => void copyPath(asset)}>
            <Copy aria-hidden="true" /> Sao chép đường dẫn
          </button>
          <button type="button" className="button button--ghost" onClick={() => openAsset(asset)}>
            <ExternalLink aria-hidden="true" /> Mở
          </button>
          <button type="button" className="button button--danger" onClick={() => setPendingDelete(asset)}>
            <Trash2 aria-hidden="true" /> Xoá
          </button>
        </div>
      </article>
    );
  };

  const renderTable = () => (
    <div className="data-table">
      <div className="data-table__scroll">
        <table>
          <thead>
            <tr>
              <th className="data-table__select">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} aria-label="Chọn tất cả tệp trên trang" />
              </th>
              <th>Tệp</th>
              <th>Thư mục</th>
              <th>Dung lượng</th>
              <th>Kích thước</th>
              <th>Ngày tải</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items.map((asset) => (
              <tr key={asset._id} className={selected.includes(asset._id) ? "is-hovered" : undefined}>
                <td className="data-table__select">
                  <input type="checkbox" checked={selected.includes(asset._id)} onChange={() => toggleSelect(asset._id)} aria-label={`Chọn tệp ${asset.filename}`} />
                </td>
                <td>
                  <div className="media-cell">
                    <img src={previewUrl(asset)} alt={asset.alt || asset.filename} loading="lazy" />
                    <div>
                      <strong title={asset.filename}>{asset.filename}</strong>
                      <span className="muted">{asset.alt || "Chưa có mô tả alt"}</span>
                    </div>
                  </div>
                </td>
                <td>{asset.folder || "general"}</td>
                <td>{formatFileSize(asset.size)}</td>
                <td>{asset.width && asset.height ? `${asset.width}×${asset.height}` : "—"}</td>
                <td>{formatDate(asset.createdAt)}</td>
                <td>
                  <div className="media-row-actions">
                    <button type="button" className="button button--ghost" onClick={() => void copyPath(asset)} title="Sao chép đường dẫn">
                      <Copy aria-hidden="true" />
                    </button>
                    <button type="button" className="button button--ghost" onClick={() => openAsset(asset)} title="Mở trong tab mới">
                      <ExternalLink aria-hidden="true" />
                    </button>
                    <button type="button" className="button button--danger" onClick={() => setPendingDelete(asset)} title="Xoá tệp">
                      <Trash2 aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <h1>Thư viện ảnh</h1>
          <p>Tải lên, chỉnh sửa thông tin và quản lý toàn bộ tệp dùng trên website.</p>
        </div>
      </header>

      <div className="admin-panel">
        <div className="admin-panel__head">
          <h2>Tải ảnh mới</h2>
          <p className="muted">Kéo-thả tệp vào khung bên dưới hoặc bấm để chọn từ máy.</p>
        </div>

        <div
          className={`dropzone ${dragging ? "is-dragging" : ""} ${uploading ? "is-busy" : ""}`}
          role="button"
          tabIndex={0}
          aria-label="Khu vực tải ảnh lên"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
          }}
          onDrop={onDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />
          <Upload aria-hidden="true" />
          <strong>Kéo-thả ảnh vào đây</strong>
          <span className="muted">hoặc bấm để chọn tệp · JPG, PNG, WebP, AVIF, SVG, PDF · tối đa 12MB/tệp, 20 tệp</span>
        </div>

        <div className="dropzone__folder">
          <label className="field">
            <span className="field__label">Thư mục lưu</span>
            <span className="field__control">
              <select
                value={newFolderMode ? "__new__" : uploadFolder}
                onChange={(event) => {
                  if (event.target.value === "__new__") {
                    setNewFolderMode(true);
                    setNewFolderDraft("");
                  } else {
                    setNewFolderMode(false);
                    setUploadFolder(event.target.value);
                  }
                }}
              >
                {(folders.includes(uploadFolder) ? folders : [uploadFolder, ...folders]).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
                <option value="__new__">+ Thư mục mới…</option>
              </select>
            </span>
            <span className="field__hint">
              {newFolderMode ? `Sẽ lưu vào thư mục “${effectiveUploadFolder}”.` : "Chỉ gồm chữ, số và dấu gạch ngang."}
            </span>
          </label>
          {newFolderMode ? (
            <TextField
              label="Tên thư mục mới"
              placeholder="Ví dụ: khoa-hoc"
              value={newFolderDraft}
              onChange={(event) => setNewFolderDraft(event.target.value)}
              icon={<FolderPlus aria-hidden="true" />}
            />
          ) : null}
        </div>

        {queue.length ? (
          <ul className="upload-queue">
            {queue.map((item) => (
              <li className={`upload-queue__item is-${item.status}`} key={item.id}>
                <img src={item.preview} alt="" />
                <div className="upload-queue__info">
                  <strong title={item.file.name}>{item.file.name}</strong>
                  <span className="muted">{formatFileSize(item.file.size)}</span>
                  {item.status === "uploading" ? (
                    <span className="upload-queue__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(item.progress * 100)}>
                      <span style={{ width: `${Math.round(item.progress * 100)}%` }} />
                    </span>
                  ) : null}
                  {item.status === "done" ? (
                    <span className="upload-queue__ok">
                      <Check aria-hidden="true" /> Đã tải lên
                    </span>
                  ) : null}
                  {item.status === "error" ? <span className="upload-queue__error">{item.error}</span> : null}
                </div>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={() => removeQueueItem(item.id)}
                  disabled={uploading}
                  aria-label={`Xoá ${item.file.name} khỏi danh sách`}
                >
                  <X aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="admin-form__bar">
          <span className="muted">{queue.length ? `${queue.length} tệp đã chọn` : "Chưa chọn tệp nào"}</span>
          <div>
            {queue.length ? (
              <button type="button" className="button button--ghost" onClick={() => setQueue([])} disabled={uploading}>
                Bỏ chọn tất cả
              </button>
            ) : null}
            <button type="button" className="button button--primary" disabled={!queue.length || uploading} onClick={() => void runUpload()}>
              {uploading ? <Loader2 className="spin" aria-hidden="true" /> : <Upload aria-hidden="true" />} Tải lên{queue.length ? ` ${queue.length} tệp` : ""}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-toolbar">
        <form
          className="admin-toolbar__search"
          onSubmit={(event) => {
            event.preventDefault();
            updateParams({ q: searchDraft.trim(), page: 1 });
          }}
        >
          <Search aria-hidden="true" />
          <input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Tìm theo tên tệp hoặc mô tả alt…" />
          <button type="submit" className="button button--ghost">
            Tìm
          </button>
        </form>

        <label className="admin-toolbar__page-size">
          <span>Thư mục</span>
          <select
            value={folder}
            onChange={(event) => updateParams({ folder: event.target.value, page: 1 })}
          >
            <option value="">Tất cả thư mục</option>
            {folders.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-toolbar__page-size">
          <span>Sắp xếp</span>
          <select
            value={`${sort}:${dir}`}
            onChange={(event) => {
              const [nextSort, nextDir] = event.target.value.split(":");
              updateParams({ sort: nextSort, dir: nextDir, page: 1 });
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-toolbar__page-size">
          <span>Mỗi trang</span>
          <select
            value={pageSize}
            onChange={(event) => {
              const next = Number(event.target.value);
              updateParams({ pageSize: next === DEFAULT_PAGE_SIZE ? "" : next, page: 1 });
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="media-view-toggle" role="group" aria-label="Chế độ xem">
          <button
            type="button"
            className={view === "grid" ? "is-active" : ""}
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
            title="Xem dạng lưới"
          >
            <LayoutGrid aria-hidden="true" /> Lưới
          </button>
          <button
            type="button"
            className={view === "table" ? "is-active" : ""}
            aria-pressed={view === "table"}
            onClick={() => setView("table")}
            title="Xem dạng bảng"
          >
            <List aria-hidden="true" /> Bảng
          </button>
        </div>
      </div>

      {selected.length ? (
        <div className="admin-bulk">
          <strong>{selected.length} tệp đã chọn</strong>
          <button type="button" className="button button--ghost" onClick={() => setSelected([])}>
            Bỏ chọn
          </button>
          <button type="button" className="button button--danger" onClick={() => setPendingBulkDelete(true)}>
            <Trash2 aria-hidden="true" /> Xoá đã chọn
          </button>
        </div>
      ) : null}

      {mediaQuery.isPending ? (
        <>
          <p className="admin-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải thư viện ảnh…
          </p>
          <div className="admin-media-grid" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <div className="media-skeleton-card" key={index}>
                <div className="media-skeleton media-skeleton--thumb" />
                <div className="media-skeleton media-skeleton--line" />
                <div className="media-skeleton media-skeleton--line media-skeleton--short" />
              </div>
            ))}
          </div>
        </>
      ) : mediaQuery.isError ? (
        <div className="data-table__state data-table__state--error">
          <Image aria-hidden="true" />
          <strong>Không tải được thư viện ảnh</strong>
          <p>{errorMessage(mediaQuery.error)}</p>
          <button type="button" className="button button--primary" onClick={() => void mediaQuery.refetch()}>
            <RefreshCw aria-hidden="true" /> Thử lại
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Image aria-hidden="true" />
          <strong>{filtered ? "Không có tệp nào khớp bộ lọc" : "Thư viện ảnh đang trống"}</strong>
          <p>{filtered ? "Thử xoá từ khoá hoặc bộ lọc thư mục." : "Tải lên ảnh đầu tiên để dùng cho khóa học, blog và trang nội dung."}</p>
          {filtered ? (
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                setSearchDraft("");
                updateParams({ q: "", folder: "", page: 1 });
              }}
            >
              <X aria-hidden="true" /> Xoá bộ lọc
            </button>
          ) : null}
        </div>
      ) : (
        <>
          {view === "grid" ? <div className="admin-media-grid">{items.map(renderCard)}</div> : renderTable()}

          <footer className="data-table__footer">
            <span>
              {total > 0 ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} trên ${total} tệp` : "0 tệp"}
            </span>
            <div className="data-table__pager">
              <button type="button" onClick={() => updateParams({ page: page - 1 })} disabled={page <= 1} aria-label="Trang trước">
                <ChevronLeft aria-hidden="true" />
              </button>
              <span>
                Trang {page}/{totalPages}
              </span>
              <button type="button" onClick={() => updateParams({ page: page + 1 })} disabled={page >= totalPages} aria-label="Trang sau">
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </footer>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xoá tệp này?"
        description={pendingDelete ? `${pendingDelete.filename} sẽ bị xoá khỏi thư viện và ổ đĩa. Hành động này không thể hoàn tác.` : undefined}
        confirmLabel="Xoá vĩnh viễn"
        onCancel={() => setPendingDelete(null)}
        onConfirm={async () => {
          if (pendingDelete) await deleteMutation.mutateAsync(pendingDelete._id);
        }}
      />

      <ConfirmDialog
        open={pendingBulkDelete}
        title="Xoá các tệp đã chọn?"
        description={`${selected.length} tệp sẽ bị xoá khỏi thư viện và ổ đĩa. Hành động này không thể hoàn tác.`}
        confirmLabel="Xoá vĩnh viễn"
        onCancel={() => setPendingBulkDelete(false)}
        onConfirm={async () => {
          if (selected.length) await bulkDeleteMutation.mutateAsync(selected);
        }}
      />
    </section>
  );
}
