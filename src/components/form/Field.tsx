import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ImagePlus, Images, Loader2, X } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { MediaPickerDialog } from "../admin/MediaPickerDialog";

type FieldShellProps = {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  wide?: boolean;
  children: ReactNode;
  htmlFor?: string;
};

export function FieldShell({ label, hint, error, required, wide, children, htmlFor }: FieldShellProps) {
  return (
    <div className={`field ${wide ? "field--wide" : ""} ${error ? "field--invalid" : ""}`}>
      {label ? (
        <label className="field__label" htmlFor={htmlFor}>
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </label>
      ) : null}
      {children}
      {error ? <p className="field__error">{error}</p> : hint ? <p className="field__hint">{hint}</p> : null}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  wide?: boolean;
  icon?: ReactNode;
  loading?: boolean;
};

export function TextField({ label, hint, error, wide, icon, loading, ...props }: TextFieldProps) {
  const id = useId();
  const inputId = props.id ?? id;
  return (
    <FieldShell label={label} hint={hint} error={error} required={props.required} wide={wide} htmlFor={inputId}>
      <span className={`field__control ${icon ? "field__control--icon" : ""}`}>
        {icon}
        <input id={inputId} {...props} aria-invalid={error ? true : undefined} />
        {loading ? <Loader2 className="field__spinner" aria-hidden="true" /> : null}
      </span>
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  wide?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function SelectField({ label, hint, error, wide, options, placeholder, ...props }: SelectFieldProps) {
  const id = useId();
  const selectId = props.id ?? id;
  return (
    <FieldShell label={label} hint={hint} error={error} required={props.required} wide={wide} htmlFor={selectId}>
      <span className="field__control">
        <select id={selectId} {...props} aria-invalid={error ? true : undefined}>
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </span>
    </FieldShell>
  );
}

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  wide?: boolean;
};

export function TextareaField({ label, hint, error, wide, ...props }: TextareaFieldProps) {
  const id = useId();
  const textareaId = props.id ?? id;
  return (
    <FieldShell label={label} hint={hint} error={error} required={props.required} wide={wide} htmlFor={textareaId}>
      <span className="field__control field__control--textarea">
        <textarea id={textareaId} {...props} aria-invalid={error ? true : undefined} />
      </span>
    </FieldShell>
  );
}

type ImageFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  error?: string;
  wide?: boolean;
};

/** Ô ảnh dùng chung cho CMS: xem trước, thay bằng URL, tải tệp mới hoặc xoá. */
export function ImageField({ label, value, onChange, hint, error, wide }: ImageFieldProps) {
  const id = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "cms");
      const result = await api.upload<{ items: { url: string }[] }>("/api/admin/media/upload", formData);
      const url = result.items[0]?.url ?? "";
      if (url) onChange(url);
    } catch (caught) {
      setUploadError(errorMessage(caught));
    } finally {
      setUploading(false);
    }
  };

  return (
    <FieldShell label={label} hint={hint} error={error ?? uploadError} wide={wide} htmlFor={id}>
      <div className="image-field">
        <div className="image-field__preview">
          {value ? <img src={value} alt="" /> : <ImagePlus aria-hidden="true" />}
        </div>
        <div className="image-field__body">
          <input
            id={id}
            className="image-field__url"
            value={value}
            placeholder="/uploads/... hoặc /assets/..."
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="image-field__actions">
            <button type="button" className="image-field__pick" onClick={() => setPickerOpen(true)}>
              <Images aria-hidden="true" /> Chọn từ thư viện
            </button>
            <label className="image-field__upload">
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void uploadFile(file);
                }}
              />
              {uploading ? <Loader2 className="field__spinner" aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
              {uploading ? "Đang tải lên…" : "Tải ảnh lên"}
            </label>
            {value ? (
              <button type="button" className="image-field__remove" onClick={() => onChange("")}>
                <X aria-hidden="true" /> Xoá ảnh
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <MediaPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setPickerOpen(false);
        }}
      />
    </FieldShell>
  );
}

type CheckboxFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
};

/** Ô tích chuẩn (đồng ý điều khoản, tùy chọn bật/tắt). */
export function CheckboxField({ label, className = "", ...props }: CheckboxFieldProps) {
  return (
    <label className={`field__checkbox ${className}`.trim()}>
      <input type="checkbox" {...props} />
      <span>{label}</span>
    </label>
  );
}
