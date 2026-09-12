import { useQuery } from "@tanstack/react-query";
import { api, errorMessage } from "../../api/client";
import type { FieldOption } from "../../admin/types";

type RelationSource = {
  endpoint: string;
  labelKey: string;
  /** Khoá phụ hiển thị nhỏ bên dưới nhãn chính (ví dụ email hoặc slug). */
  secondaryKey?: string;
  valueKey?: string;
  query?: Record<string, string>;
};

type RelationRecord = Record<string, unknown>;

function readPath(record: RelationRecord, path: string) {
  return path.split(".").reduce<unknown>((value, key) => (typeof value === "object" && value !== null ? (value as Record<string, unknown>)[key] : undefined), record);
}

/**
 * Ô chọn bản ghi liên quan (thành viên, bộ câu hỏi, nhóm…): tải danh sách từ API
 * và hiển thị nhãn thân thiện thay vì bắt admin dán ObjectId.
 */
export function RelationField({
  label,
  hint,
  value,
  onChange,
  source,
  required,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  source: RelationSource;
  required?: boolean;
}) {
  const query = useQuery({
    queryKey: ["relation", source.endpoint, source.query],
    queryFn: () => api.get<{ items: RelationRecord[] }>(source.endpoint, { query: { pageSize: 100, ...(source.query ?? {}) } }),
    staleTime: 60 * 1000,
  });

  const options: FieldOption[] = (query.data?.items ?? []).map((item) => {
    const rawValue = source.valueKey ? readPath(item, source.valueKey) : item._id;
    const primary = String(readPath(item, source.labelKey) ?? "(không tên)");
    const secondary = source.secondaryKey ? String(readPath(item, source.secondaryKey) ?? "") : "";
    return { value: String(rawValue ?? ""), label: secondary ? `${primary} — ${secondary}` : primary };
  });

  const missingCurrent = Boolean(value) && !options.some((option) => option.value === value);

  return (
    <label className="field">
      <span className="field__label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <span className="field__control">
        <select value={value} onChange={(event) => onChange(event.target.value)} disabled={query.isLoading}>
          <option value="">{query.isLoading ? "Đang tải danh sách…" : "Chọn…"}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {missingCurrent ? <option value={value}>{value} (không còn trong danh sách)</option> : null}
        </select>
      </span>
      {query.isError ? <p className="field__error">{errorMessage(query.error)}</p> : hint ? <p className="field__hint">{hint}</p> : null}
    </label>
  );
}
