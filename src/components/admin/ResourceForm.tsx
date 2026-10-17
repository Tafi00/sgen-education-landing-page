import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, ExternalLink, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import type { FieldConfig, ResourceConfig } from "../../admin/types";
import { ImageField, TextField, TextareaField } from "../form/Field";
import { BlocksField, type BlockRow } from "./BlocksField";
import { RelationField } from "./RelationField";
import { ConfirmDialog } from "./ConfirmDialog";
import { StatusBadge, publicUrlFor } from "./ResourceList";
import { useToast } from "../ui/Toast";

type Row = Record<string, unknown>;

const GENERAL_SECTION = "Thông tin chung";

const STATUS_OPTIONS = [
  { value: "draft", label: "Bản nháp" },
  { value: "published", label: "Đã đăng" },
  { value: "archived", label: "Lưu trữ" },
];

/** Giới hạn ký tự mặc định cho các trường SEO khi hint chưa nêu rõ. */
const SEO_LIMITS: Record<string, number> = { "seo.title": 60, "seo.description": 160 };

function defaultForField(field: FieldConfig): unknown {
  if (field.kind === "checkbox") return false;
  if (field.kind === "number") return 0;
  if (field.kind === "tags" || field.kind === "list") return [];
  if (field.kind === "blocks" || field.kind === "syllabus" || field.kind === "faqs" || field.kind === "sections" || field.kind === "options") return [];
  if (field.kind === "keyvalue") return {};
  return "";
}

/** Chuyển giá trị form sang kiểu dữ liệu API mong đợi. */
function toPayloadValue(field: FieldConfig, value: unknown) {
  switch (field.kind) {
    case "number":
      return value === "" || value === null || value === undefined ? 0 : Number(value);
    case "checkbox":
      return Boolean(value);
    case "options":
      return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") : [];
    case "tags":
    case "list":
      return Array.isArray(value) ? value : String(value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
    case "datetime":
      return value ? new Date(String(value)).toISOString() : null;
    default:
      return value;
  }
}

function toFormValue(field: FieldConfig, value: unknown): unknown {
  if (value === null || value === undefined) return defaultForField(field);
  if (field.kind === "datetime") {
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? "" : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
  return value;
}

function sectionOf(field: FieldConfig) {
  return field.section ?? GENERAL_SECTION;
}

/** Giới hạn ký tự gợi ý cho text/textarea; null nghĩa là không hiện bộ đếm. */
function charLimitFor(field: FieldConfig): number | null {
  if (field.kind !== "text" && field.kind !== "textarea") return null;
  const configured = SEO_LIMITS[field.name] ?? Number(field.hint?.match(/(\d+)\s*ký tự/)?.[1] ?? 0);
  if (configured > 0) return configured;
  return field.hint?.includes("ký tự") ? 0 : null;
}

function truncate(value: string, limit: number) {
  return value.length > limit ? `${value.slice(0, limit - 1).trimEnd()}…` : value;
}

/** Xem trước cách nội dung hiển thị trên kết quả tìm kiếm Google. */
function SeoPreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <section className="admin-card seo-preview">
      <h2 className="seo-preview__heading">Xem trước trên Google</h2>
      <div className="seo-preview__card">
        <span className="seo-preview__url">{url}</span>
        <span className="seo-preview__title">{truncate(title || "Tiêu đề trang", 60)}</span>
        <span className="seo-preview__desc">{truncate(description || "Mô tả ngắn hiển thị bên dưới tiêu đề trên trang kết quả tìm kiếm.", 160)}</span>
      </div>
    </section>
  );
}

/** Bộ nhập dạng repeater cho syllabus / faqs / blocks. */
function RepeaterField({
  label,
  hint,
  items,
  onChange,
  template,
  columns,
}: {
  label: string;
  hint?: string;
  items: Row[];
  onChange: (items: Row[]) => void;
  template: Row;
  columns: { key: string; label: string; kind: "text" | "textarea" | "select" | "lines"; options?: { value: string; label: string }[] }[];
}) {
  return (
    <div className="repeater field--wide">
      <div className="repeater__head">
        <div>
          <strong>{label}</strong>
          {hint ? <p className="field__hint">{hint}</p> : null}
        </div>
        <button type="button" className="button button--ghost" onClick={() => onChange([...items, { ...template }])}>
          <Plus aria-hidden="true" /> Thêm dòng
        </button>
      </div>
      {items.length === 0 ? <p className="repeater__empty">Chưa có nội dung nào.</p> : null}
      {items.map((item, index) => (
        <div className="repeater__row" key={index}>
          {columns.map((column) =>
            column.kind === "lines" ? (
              <label key={column.key}>
                <span>{column.label}</span>
                <textarea
                  rows={3}
                  value={Array.isArray(item[column.key]) ? (item[column.key] as string[]).join("\n") : String(item[column.key] ?? "")}
                  onChange={(event) => {
                    const next = [...items];
                    next[index] = { ...item, [column.key]: event.target.value.split("\n").map((line) => line.trim()).filter(Boolean) };
                    onChange(next);
                  }}
                />
              </label>
            ) : column.kind === "textarea" ? (
              <label key={column.key}>
                <span>{column.label}</span>
                <textarea
                  rows={2}
                  value={String(item[column.key] ?? "")}
                  onChange={(event) => {
                    const next = [...items];
                    next[index] = { ...item, [column.key]: event.target.value };
                    onChange(next);
                  }}
                />
              </label>
            ) : column.kind === "select" ? (
              <label key={column.key}>
                <span>{column.label}</span>
                <select
                  value={String(item[column.key] ?? "")}
                  onChange={(event) => {
                    const next = [...items];
                    next[index] = { ...item, [column.key]: event.target.value };
                    onChange(next);
                  }}
                >
                  {column.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label key={column.key}>
                <span>{column.label}</span>
                <input
                  value={String(item[column.key] ?? "")}
                  onChange={(event) => {
                    const next = [...items];
                    next[index] = { ...item, [column.key]: event.target.value };
                    onChange(next);
                  }}
                />
              </label>
            ),
          )}
          <button
            type="button"
            className="repeater__remove"
            aria-label="Xoá dòng"
            onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}

/** Render một trường theo loại cấu hình. Tách riêng để phần tab chỉ lo bố cục. */
function FieldControl({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldConfig;
  value: unknown;
  error?: string;
  onChange: (next: unknown) => void;
}) {
  if (field.kind === "image") {
    return <ImageField label={field.label} value={String(value ?? "")} onChange={onChange} hint={field.hint} error={error} wide={field.wide} />;
  }
  if (field.kind === "checkbox") {
    return (
      <div className="field field--wide">
        <label className="field__checkbox">
          <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} />
          <span>{field.label}</span>
        </label>
        {field.hint ? <p className="field__hint">{field.hint}</p> : null}
      </div>
    );
  }
  if (field.kind === "select") {
    return (
      <label className={`field ${field.wide ? "field--wide" : ""}`}>
        <span className="field__label">{field.label}</span>
        <span className="field__control">
          <select value={String(value ?? "")} onChange={(event) => onChange(event.target.value)}>
            <option value="">Chọn…</option>
            {(field.options ?? (field.name === "status" ? STATUS_OPTIONS : [])).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </span>
        {error ? <p className="field__error">{error}</p> : field.hint ? <p className="field__hint">{field.hint}</p> : null}
      </label>
    );
  }
  if (field.kind === "syllabus") {
    return (
      <RepeaterField
        label={field.label}
        hint={field.hint}
        items={(Array.isArray(value) ? value : []) as Row[]}
        onChange={onChange}
        template={{ title: "", details: "" }}
        columns={[
          { key: "title", label: "Tên buổi", kind: "text" },
          { key: "details", label: "Nội dung", kind: "textarea" },
        ]}
      />
    );
  }
  if (field.kind === "faqs") {
    return (
      <RepeaterField
        label={field.label}
        hint={field.hint}
        items={(Array.isArray(value) ? value : []) as Row[]}
        onChange={onChange}
        template={{ question: "", answer: "" }}
        columns={[
          { key: "question", label: "Câu hỏi", kind: "text" },
          { key: "answer", label: "Trả lời", kind: "textarea" },
        ]}
      />
    );
  }
  if (field.kind === "sections") {
    return (
      <RepeaterField
        label={field.label}
        hint={field.hint}
        items={(Array.isArray(value) ? value : []) as Row[]}
        onChange={onChange}
        template={{ heading: "", paragraphs: [], bullets: [] }}
        columns={[
          { key: "heading", label: "Tiêu đề mục", kind: "text" },
          { key: "paragraphs", label: "Đoạn văn (mỗi dòng một đoạn)", kind: "lines" },
          { key: "bullets", label: "Gạch đầu dòng (mỗi dòng một mục)", kind: "lines" },
        ]}
      />
    );
  }
  if (field.kind === "blocks") {
    return (
      <BlocksField
        label={field.label}
        hint={field.hint ?? "Mỗi khối là một phần nội dung của trang, có thể đổi thứ tự."}
        blocks={(Array.isArray(value) ? value : []) as BlockRow[]}
        onChange={onChange}
      />
    );
  }
  if (field.kind === "options") {
    return (
      <RepeaterField
        label={field.label}
        hint={field.hint ?? "DISC: mỗi phương án thuộc D/I/S/C. MBTI: mỗi phương án thuộc cực tương ứng."}
        items={(Array.isArray(value) ? value : []) as Row[]}
        onChange={onChange}
        template={{ optionId: "", label: "", dimension: "", pole: "" }}
        columns={[
          { key: "optionId", label: "Mã phương án", kind: "text" },
          { key: "label", label: "Nội dung", kind: "textarea" },
          {
            key: "dimension",
            label: "Nhóm / cặp",
            kind: "select",
            options: [
              { value: "D", label: "D" },
              { value: "I", label: "I" },
              { value: "S", label: "S" },
              { value: "C", label: "C" },
              { value: "EI", label: "EI" },
              { value: "SN", label: "SN" },
              { value: "TF", label: "TF" },
              { value: "JP", label: "JP" },
            ],
          },
          {
            key: "pole",
            label: "Cực",
            kind: "select",
            options: ["E", "I", "S", "N", "T", "F", "J", "P"].map((pole) => ({ value: pole, label: pole })),
          },
        ]}
      />
    );
  }
  if (field.kind === "relation" && field.relation) {
    return (
      <RelationField
        label={field.label}
        hint={field.hint}
        required={field.required}
        value={String(value ?? "")}
        onChange={onChange}
        source={field.relation}
      />
    );
  }
  if (field.kind === "tags" || field.kind === "list") {
    const text = Array.isArray(value) ? (value as string[]).join("\n") : String(value ?? "");
    return (
      <TextareaField
        label={field.label}
        hint={field.hint ?? "Mỗi dòng một mục."}
        rows={5}
        wide={field.wide}
        value={text}
        onChange={(event) => onChange(event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))}
      />
    );
  }
  if (field.kind === "textarea" || field.kind === "richtext") {
    return (
      <TextareaField
        label={field.label}
        hint={field.hint}
        rows={field.rows ?? (field.kind === "richtext" ? 8 : 4)}
        wide={field.wide ?? field.kind === "richtext"}
        error={error}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  return (
    <TextField
      label={field.label}
      hint={field.hint}
      placeholder={field.placeholder}
      error={error}
      wide={field.wide}
      type={field.kind === "number" ? "number" : field.kind === "date" || field.kind === "datetime" ? (field.kind === "date" ? "date" : "datetime-local") : field.kind === "email" ? "email" : "text"}
      value={String(value ?? "")}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function ResourceForm({ config, children }: { config: ResourceConfig; children?: ReactNode }) {
  const { id } = useParams<{ id: string }>();
  const isCreate = !id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<Row>({});
  const [initial, setInitial] = useState<Row>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState(GENERAL_SECTION);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  /** Trường cần cuộn tới sau khi đổi tab (đặt trong effect để chờ DOM cập nhật). */
  const pendingJump = useRef<string | null>(null);

  /** Ghi chiều cao thanh hành động vào CSS var để nội dung cuối form không bị che. */
  useEffect(() => {
    const node = barRef.current;
    if (!node) return;
    const apply = () => document.documentElement.style.setProperty("--admin-bar-h", `${Math.ceil(node.getBoundingClientRect().height)}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--admin-bar-h");
    };
  }, []);

  const detailQuery = useQuery({
    queryKey: ["admin", config.key, id],
    enabled: Boolean(id),
    queryFn: () => api.get<{ item: Row }>(`${config.endpoint}/${id}`),
  });

  useEffect(() => {
    if (!detailQuery.data?.item) return;
    const item = detailQuery.data.item;
    const next: Row = {};
    for (const field of config.fields) next[field.name] = toFormValue(field, item[field.name]);
    next.status = item.status ?? "draft";
    setForm(next);
    setInitial(next);
    setSavedAt(null);
  }, [config.fields, detailQuery.data]);

  useEffect(() => {
    if (!isCreate) return;
    const next: Row = {};
    for (const field of config.fields) next[field.name] = defaultForField(field);
    /** Đặt sau vòng lặp để không bị giá trị mặc định của trường `status` ghi đè. */
    next.status = "draft";
    setForm(next);
    setInitial(next);
  }, [config.fields, isCreate]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  const saveMutation = useMutation({
    mutationFn: async (statusOverride?: string) => {
      const payload: Row = {};
      for (const field of config.fields) {
        if (isCreate && field.onlyWhenEditing) continue;
        const value = toPayloadValue(field, form[field.name]);
        /** Khi tạo mới, bỏ qua trường để trống để API dùng giá trị mặc định của schema. */
        if (isCreate && value === "") continue;
        payload[field.name] = value;
      }
      payload.status = statusOverride ?? (typeof form.status === "string" && form.status ? form.status : "draft");
      return isCreate ? api.post<{ item: Row }>(config.endpoint, payload) : api.patch<{ item: Row }>(`${config.endpoint}/${id}`, payload);
    },
    onSuccess: async (result) => {
      toast.success(isCreate ? `Đã tạo ${config.label}` : `Đã lưu ${config.label}`, "Thay đổi đã được ghi vào cơ sở dữ liệu.");
      await queryClient.invalidateQueries({ queryKey: ["admin", config.key] });
      const newId = String((result as { item?: { _id?: string } }).item?._id ?? id ?? "");
      if (isCreate && newId) {
        navigate(`${config.basePath}/${newId}`, { replace: true });
      } else {
        setInitial(form);
        setSavedAt(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
      }
    },
    onError: (error) => {
      if (error instanceof Error && "fields" in error && Array.isArray((error as { fields?: { path: string; message: string }[] }).fields)) {
        const fieldErrors: Record<string, string> = {};
        for (const item of (error as { fields: { path: string; message: string }[] }).fields) fieldErrors[item.path] = item.message;
        setErrors(fieldErrors);
        /** Mở đúng tab chứa lỗi đầu tiên để người dùng thấy ngay. */
        const firstPath = (error as { fields: { path: string }[] }).fields[0]?.path;
        const firstField = config.fields.find((field) => field.name === firstPath);
        if (firstField) setActiveSection(sectionOf(firstField));
      }
      toast.error("Không lưu được", errorMessage(error));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.del(`${config.endpoint}/${id}`),
    onSuccess: async () => {
      toast.success("Đã xoá", `${config.label} đã được xoá khỏi hệ thống.`);
      await queryClient.invalidateQueries({ queryKey: ["admin", config.key] });
      navigate(config.basePath);
    },
    onError: (error) => toast.error("Không xoá được", errorMessage(error)),
  });

  const goBack = () => {
    if (dirty) {
      setConfirmDiscard(true);
      return;
    }
    navigate(config.basePath);
  };

  const visibleFields = useMemo(() => config.fields.filter((field) => !(field.onlyWhenEditing && isCreate)), [config.fields, isCreate]);
  const sections = useMemo(() => [...new Set(visibleFields.map(sectionOf))], [visibleFields]);
  const currentSection = sections.includes(activeSection) ? activeSection : (sections[0] ?? GENERAL_SECTION);
  const sectionFields = visibleFields.filter((field) => sectionOf(field) === currentSection);

  const errorEntries = useMemo(
    () =>
      Object.entries(errors).map(([name, message]) => {
        const field = config.fields.find((item) => item.name === name);
        return { name, label: field?.label ?? name, section: field ? sectionOf(field) : GENERAL_SECTION, message };
      }),
    [errors, config.fields],
  );

  useEffect(() => {
    const target = pendingJump.current;
    if (!target) return;
    pendingJump.current = null;
    document.getElementById(`field-${target}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentSection]);

  const jumpToField = (name: string, section: string) => {
    if (section === currentSection) {
      document.getElementById(`field-${name}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    pendingJump.current = name;
    setActiveSection(section);
  };

  const hasSeo = config.fields.some((field) => field.name.startsWith("seo."));
  const publicUrl = form.status === "published" ? publicUrlFor(config.key, form.slug) : null;
  const seoTitle = String(form["seo.title"] || form.title || form.name || "");
  const seoDescription = String(form["seo.description"] || form.summary || form.excerpt || form.description || "");
  const seoUrl = publicUrl ?? `${config.basePath}/${String(form.slug ?? "")}`;

  const saveStatus = saveMutation.isPending
    ? "Đang lưu…"
    : dirty
      ? "Chưa lưu thay đổi"
      : savedAt
        ? `Đã lưu lúc ${savedAt}`
        : "Đã đồng bộ";

  return (
    <section className="admin-page admin-page--form">
      <header className="admin-page__header">
        <div>
          <button type="button" className="admin-back" onClick={goBack}>
            <ArrowLeft aria-hidden="true" /> Quay lại {config.labelPlural.toLowerCase()}
          </button>
          <h1>
            {isCreate ? `Thêm ${config.label}` : String(form.title ?? form.name ?? form.code ?? detailQuery.data?.item?.slug ?? config.label)}
          </h1>
          <div className="admin-page__meta">
            <StatusBadge status={String(form.status ?? "draft")} />
            {detailQuery.data?.item ? (
              <span>
                Cập nhật {new Date(String(detailQuery.data.item.updatedAt ?? Date.now())).toLocaleString("vi-VN")}
                {detailQuery.data.item.createdAt ? ` · Tạo ${new Date(String(detailQuery.data.item.createdAt)).toLocaleString("vi-VN")}` : ""}
              </span>
            ) : (
              <span>Bản ghi mới chưa được lưu</span>
            )}
          </div>
        </div>
        <div className="admin-page__actions">
          {publicUrl ? (
            <a className="button button--ghost" href={publicUrl} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden="true" /> Xem trên web
            </a>
          ) : null}
          {!isCreate && form.status !== "published" ? (
            <button type="button" className="button button--ghost" onClick={() => setConfirmStatus("published")}>
              Đăng
            </button>
          ) : null}
          {!isCreate && form.status === "published" ? (
            <button type="button" className="button button--ghost" onClick={() => setConfirmStatus("draft")}>
              Bỏ đăng
            </button>
          ) : null}
          {!isCreate ? (
            <button type="button" className="button button--danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 aria-hidden="true" /> Xoá
            </button>
          ) : null}
        </div>
      </header>

      {detailQuery.isLoading ? (
        <p className="admin-loading">
          <Loader2 className="spin" aria-hidden="true" /> Đang tải dữ liệu…
        </p>
      ) : detailQuery.isError ? (
        <p className="admin-error">{errorMessage(detailQuery.error)}</p>
      ) : (
        <form
          className="admin-form"
          onSubmit={(event) => {
            event.preventDefault();
            setErrors({});
            saveMutation.mutate(undefined);
          }}
        >
          {errorEntries.length ? (
            <div className="admin-form__errors" role="alert">
              <strong className="admin-form__errors-title">
                <AlertTriangle aria-hidden="true" /> Có {errorEntries.length} trường chưa hợp lệ
              </strong>
              <ul>
                {errorEntries.map((entry) => (
                  <li key={entry.name}>
                    <button type="button" onClick={() => jumpToField(entry.name, entry.section)}>
                      {entry.label}
                    </button>
                    <span>{entry.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {sections.length > 1 ? (
            <div className="form-tabs" role="tablist" aria-label="Nhóm trường">
              {sections.map((section) => {
                const invalidCount = visibleFields.filter((field) => sectionOf(field) === section && errors[field.name]).length;
                return (
                  <button
                    key={section}
                    type="button"
                    role="tab"
                    aria-selected={section === currentSection}
                    className={`form-tab${section === currentSection ? " is-active" : ""}`}
                    onClick={() => setActiveSection(section)}
                  >
                    {section}
                    {invalidCount ? (
                      <span className="form-tab__warning" title={`${invalidCount} trường chưa hợp lệ`} aria-label={`${invalidCount} trường chưa hợp lệ`} />
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          <section className="admin-card" aria-label={currentSection}>
            <h2 className="admin-card__title">{currentSection}</h2>
            <div className="admin-form__grid">
              {sectionFields.map((field) => {
                const limit = charLimitFor(field);
                const rawValue = form[field.name];
                const length = Array.isArray(rawValue) ? rawValue.join("\n").length : String(rawValue ?? "").length;
                return (
                  <div
                    className={`admin-form__cell${field.wide ? " admin-form__cell--wide" : ""}`}
                    id={`field-${field.name}`}
                    key={field.name}
                  >
                    {limit !== null ? (
                      <span className={`field-counter${limit > 0 && length > limit ? " is-over" : ""}`}>
                        {length}
                        {limit > 0 ? `/${limit}` : ""}
                      </span>
                    ) : null}
                    <FieldControl
                      field={field}
                      value={rawValue}
                      error={errors[field.name]}
                      onChange={(next) => setForm((current) => ({ ...current, [field.name]: next }))}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          {hasSeo && currentSection === "SEO" ? (
            <SeoPreview title={seoTitle} description={seoDescription} url={`sgen.edu.vn${seoUrl}`} />
          ) : null}

          {children}

          <div className="admin-form__bar" ref={barRef}>
            <div>
              <button type="button" className="button button--ghost" onClick={goBack}>
                Quay lại
              </button>
              <button type="button" className="button button--ghost" onClick={() => { setForm(initial); setErrors({}); }} disabled={!dirty}>
                Huỷ thay đổi
              </button>
            </div>
            <div className="admin-form__bar-end">
              <span className={`admin-form__status${dirty ? " is-dirty" : ""}`}>{saveStatus}</span>
              <button type="submit" className="button button--primary" disabled={saveMutation.isPending || (!isCreate && !dirty)}>
                {saveMutation.isPending ? <Loader2 className="spin" aria-hidden="true" /> : <Save aria-hidden="true" />}
                {isCreate ? `Tạo ${config.label}` : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title={`Xoá ${config.label} này?`}
        description="Dữ liệu sẽ bị xoá khỏi hệ thống và không thể hoàn tác."
        confirmLabel="Xoá vĩnh viễn"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => { await deleteMutation.mutateAsync(); }}
      />
      <ConfirmDialog
        open={Boolean(confirmStatus)}
        title={confirmStatus === "published" ? "Đăng nội dung này?" : "Bỏ đăng nội dung này?"}
        description={confirmStatus === "published" ? "Nội dung sẽ hiển thị công khai trên website." : "Nội dung sẽ ẩn khỏi website cho tới khi được đăng lại."}
        confirmLabel={confirmStatus === "published" ? "Đăng ngay" : "Bỏ đăng"}
        tone="primary"
        onCancel={() => setConfirmStatus(null)}
        onConfirm={async () => {
          saveMutation.mutate(confirmStatus ?? "draft");
          setConfirmStatus(null);
        }}
      />
      <ConfirmDialog
        open={confirmDiscard}
        title="Bạn có thay đổi chưa lưu"
        description="Rời trang sẽ mất các thay đổi hiện tại."
        confirmLabel="Rời trang"
        cancelLabel="Ở lại"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          navigate(config.basePath);
        }}
      />
      {!isCreate ? (
        <p className="admin-hint">
          Cần xem bản công khai? <Link to={config.basePath}>Về danh sách</Link>
        </p>
      ) : null}
    </section>
  );
}
