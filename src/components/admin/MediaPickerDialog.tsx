import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Image, Loader2, Search, Upload, X } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { useToast } from "../ui/Toast";

type PickerAsset = {
  _id: string;
  filename: string;
  url: string;
  alt?: string;
  folder?: string;
  variants?: { label?: string; url: string; width: number }[];
};

type PickerListResponse = { items: PickerAsset[]; total: number; page: number; pageSize: number; totalPages: number };

const PICKER_PAGE_SIZE = 24;
const MEDIA_QUERY_ROOT = ["admin", "media"] as const;

export type MediaPickerDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  title?: string;
};

/** Hộp chọn ảnh dùng chung cho form CMS và các trình soạn thảo. */
export function MediaPickerDialog({ open, onClose, onSelect, title = "Chọn ảnh từ thư viện" }: MediaPickerDialogProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchDraft, setSearchDraft] = useState("");
  const [q, setQ] = useState("");
  const [folder, setFolder] = useState("");
  const [page, setPage] = useState(1);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) setPage(1);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const mediaQuery = useQuery({
    queryKey: [...MEDIA_QUERY_ROOT, "picker", { page, q, folder }],
    queryFn: () =>
      api.get<PickerListResponse>("/api/admin/media", { query: { page, pageSize: PICKER_PAGE_SIZE, q, folder } }),
    enabled: open,
  });

  const foldersQuery = useQuery({
    queryKey: [...MEDIA_QUERY_ROOT, "folders"],
    queryFn: () => api.get<PickerListResponse>("/api/admin/media", { query: { page: 1, pageSize: 100 } }),
    enabled: open,
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

  const items = mediaQuery.data?.items ?? [];
  const total = mediaQuery.data?.total ?? 0;
  const totalPages = mediaQuery.data?.totalPages ?? 1;
  const filtered = Boolean(q) || Boolean(folder);

  const choose = (asset: PickerAsset) => {
    onSelect(asset.url);
    onClose();
  };

  const uploadNew = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("folder", folder || "cms");
      for (const file of files) formData.append("files", file);
      const result = await api.upload<{ items: PickerAsset[] }>("/api/admin/media/upload", formData);
      toast.success("Đã tải ảnh lên", `${result.items.length} tệp đã được thêm vào thư viện.`);
      await queryClient.invalidateQueries({ queryKey: MEDIA_QUERY_ROOT });
    } catch (error) {
      toast.error("Tải ảnh thất bại", errorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop media-picker-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <article className="media-picker" onClick={(event) => event.stopPropagation()}>
        <header className="media-picker__head">
          <div>
            <h2>{title}</h2>
            <p className="muted">Bấm vào ảnh để chọn, hoặc tải tệp mới lên thư viện.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="media-picker__toolbar">
          <form
            className="admin-toolbar__search"
            onSubmit={(event) => {
              event.preventDefault();
              setQ(searchDraft.trim());
              setPage(1);
            }}
          >
            <Search aria-hidden="true" />
            <input
              ref={searchRef}
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              placeholder="Tìm theo tên tệp hoặc mô tả alt…"
            />
            <button type="submit" className="button button--ghost">
              Tìm
            </button>
          </form>

          <label className="admin-toolbar__page-size">
            <span>Thư mục</span>
            <select
              value={folder}
              onChange={(event) => {
                setFolder(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả thư mục</option>
              {folders.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="button button--ghost media-picker__upload">
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(event) => {
                void uploadNew(Array.from(event.target.files ?? []));
                event.target.value = "";
              }}
            />
            {uploading ? <Loader2 className="spin" aria-hidden="true" /> : <Upload aria-hidden="true" />}
            {uploading ? "Đang tải lên…" : "Tải tệp mới"}
          </label>
        </div>

        <div className="media-picker__body">
          {mediaQuery.isPending ? (
            <p className="admin-loading">
              <Loader2 className="spin" aria-hidden="true" /> Đang tải thư viện ảnh…
            </p>
          ) : mediaQuery.isError ? (
            <div className="data-table__state data-table__state--error">
              <Image aria-hidden="true" />
              <strong>Không tải được thư viện ảnh</strong>
              <p>{errorMessage(mediaQuery.error)}</p>
              <button type="button" className="button button--primary" onClick={() => void mediaQuery.refetch()}>
                Thử lại
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <Image aria-hidden="true" />
              <strong>{filtered ? "Không có tệp nào khớp bộ lọc" : "Thư viện ảnh đang trống"}</strong>
              <p>{filtered ? "Thử xoá từ khoá hoặc bộ lọc thư mục." : "Tải lên ảnh đầu tiên để dùng trong nội dung."}</p>
            </div>
          ) : (
            <div className="media-picker__grid">
              {items.map((asset) => (
                <button type="button" className="media-picker__item" key={asset._id} onClick={() => choose(asset)} title={asset.filename}>
                  <img
                    src={
                      asset.variants?.find((variant) => variant.width === 480)?.url ??
                      asset.variants?.find((variant) => variant.width === 960)?.url ??
                      asset.url
                    }
                    alt={asset.alt || asset.filename}
                    loading="lazy"
                  />
                  <span>{asset.filename}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {total > 0 ? (
          <footer className="data-table__footer">
            <span>
              {total} tệp · Trang {page}/{totalPages}
            </span>
            <div className="data-table__pager">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1} aria-label="Trang trước">
                <ChevronLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page >= totalPages}
                aria-label="Trang sau"
              >
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
          </footer>
        ) : null}
      </article>
    </div>
  );
}
