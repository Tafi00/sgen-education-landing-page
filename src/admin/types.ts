export type ColumnKind = "text" | "badge" | "date" | "number" | "image" | "boolean" | "currency";

export type FieldKind =
  | "text"
  | "email"
  | "number"
  | "textarea"
  | "richtext"
  | "select"
  | "checkbox"
  | "date"
  | "datetime"
  | "image"
  | "tags"
  | "list"
  | "keyvalue"
  | "blocks"
  | "relation"
  | "syllabus"
  | "sections"
  | "options"
  | "faqs";

export type FilterKind = "select" | "boolean" | "date" | "text" | "number";

export type ColumnConfig = {
  key: string;
  label: string;
  kind?: ColumnKind;
  sortable?: boolean;
  width?: string;
  /** Cột tham chiếu bản ghi khác: hiển thị nhãn thay vì ObjectId thô. */
  relation?: { endpoint: string; labelKey: string; secondaryKey?: string };
};

export type FieldOption = { value: string; label: string };

export type FieldConfig = {
  name: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  wide?: boolean;
  options?: FieldOption[];
  rows?: number;
  step?: number;
  /** Ẩn khỏi form tạo mới nhưng hiện khi sửa (ví dụ slug tự sinh). */
  onlyWhenEditing?: boolean;
  /** Nguồn dữ liệu cho kind "relation": chọn bản ghi liên quan từ API. */
  relation?: { endpoint: string; labelKey: string; secondaryKey?: string; valueKey?: string; query?: Record<string, string> };
  section?: string;
};

export type FilterConfig = {
  key: string;
  label: string;
  kind: FilterKind;
  options?: FieldOption[];
  /** Nguồn động cho bộ lọc chọn: tải danh sách từ API thay vì khai báo cứng. */
  relation?: { endpoint: string; labelKey: string; secondaryKey?: string };
};

export type ResourceConfig = {
  key: string;
  label: string;
  labelPlural: string;
  description: string;
  endpoint: string;
  basePath: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  filters: FilterConfig[];
  searchPlaceholder?: string;
  defaultSort: string;
  defaultDir?: "asc" | "desc";
  canCreate: boolean;
  detailKind?: "form" | "lead" | "order" | "member" | "media";
};
