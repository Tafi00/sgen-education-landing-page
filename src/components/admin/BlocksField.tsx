import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react";

export type BlockRow = { type: string; props: Record<string, unknown>; order: number };

const BLOCK_TYPES = [
  { value: "hero", label: "hero — mở đầu trang" },
  { value: "richText", label: "richText — đoạn văn" },
  { value: "cards", label: "cards — lưới thẻ có tiêu đề" },
  { value: "stats", label: "stats — dãy số liệu" },
  { value: "timeline", label: "timeline — các bước" },
  { value: "values", label: "values — giá trị cốt lõi" },
  { value: "faq", label: "faq — câu hỏi thường gặp" },
  { value: "cta", label: "cta — khối kêu gọi hành động" },
  { value: "contactInfo", label: "contactInfo — thông tin liên hệ" },
  { value: "map", label: "map — bản đồ nhúng" },
  { value: "courses", label: "courses — danh sách khóa học" },
  { value: "posts", label: "posts — danh sách bài viết" },
  { value: "services", label: "services — danh sách dịch vụ" },
];

const ITEM_SHAPES: Record<string, string> = {
  cards: '[{ "title": "…", "text": "…", "meta": "…" }]',
  timeline: '[{ "title": "…", "text": "…" }]',
  faq: '[{ "question": "…", "answer": "…" }]',
  stats: '[{ "value": "06", "label": "chuyên đề" }]',
  values: '[{ "title": "…", "text": "…" }]',
  hero: "[]",
  courses: "[]",
  posts: "[]",
  services: "[]",
};

type BlocksFieldProps = {
  label: string;
  hint?: string;
  blocks: BlockRow[];
  onChange: (blocks: BlockRow[]) => void;
};

function BlockCard({
  block,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: {
  block: BlockRow;
  index: number;
  total: number;
  onChange: (block: BlockRow) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  const [itemsText, setItemsText] = useState(() => (block.props.items ? JSON.stringify(block.props.items, null, 2) : ""));
  const [itemsError, setItemsError] = useState("");

  const setProp = (key: string, value: unknown) => {
    const props = { ...block.props };
    if (value === "" || value === undefined) delete props[key];
    else props[key] = value;
    onChange({ ...block, props });
  };

  const lines = (key: string) => (Array.isArray(block.props[key]) ? (block.props[key] as string[]).join("\n") : "");
  const supportsItems = ["cards", "timeline", "faq", "stats", "values"].includes(block.type);

  return (
    <article className="block-editor__card">
      <header>
        <span className="block-editor__index">{index + 1}</span>
        <select value={block.type} onChange={(event) => onChange({ ...block, type: event.target.value })} aria-label="Loại khối">
          {BLOCK_TYPES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="block-editor__tools">
          <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Di chuyển lên">
            <ArrowUp aria-hidden="true" />
          </button>
          <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Di chuyển xuống">
            <ArrowDown aria-hidden="true" />
          </button>
          <button type="button" className="is-danger" onClick={onRemove} aria-label="Xoá khối">
            <Trash2 aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="block-editor__grid">
        <label>
          <span>Tiêu đề khối</span>
          <input value={String(block.props.heading ?? "")} onChange={(event) => setProp("heading", event.target.value)} />
        </label>
        <label>
          <span>Nhãn nhỏ</span>
          <input value={String(block.props.eyebrow ?? "")} onChange={(event) => setProp("eyebrow", event.target.value)} />
        </label>
        <label className="is-wide">
          <span>Đoạn mở đầu (text)</span>
          <textarea rows={2} value={String(block.props.text ?? "")} onChange={(event) => setProp("text", event.target.value)} />
        </label>
        <label className="is-wide">
          <span>Đoạn văn (mỗi dòng một đoạn)</span>
          <textarea
            rows={3}
            value={lines("paragraphs")}
            onChange={(event) => setProp("paragraphs", event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))}
          />
        </label>
        <label className="is-wide">
          <span>Gạch đầu dòng (mỗi dòng một mục)</span>
          <textarea
            rows={3}
            value={lines("bullets")}
            onChange={(event) => setProp("bullets", event.target.value.split("\n").map((line) => line.trim()).filter(Boolean))}
          />
        </label>

        {block.type === "cta" ? (
          <>
            <label>
              <span>Nút chính — nhãn</span>
              <input value={String(block.props.primaryLabel ?? "")} onChange={(event) => setProp("primaryLabel", event.target.value)} />
            </label>
            <label>
              <span>Nút chính — đường dẫn</span>
              <input value={String(block.props.primaryHref ?? "")} onChange={(event) => setProp("primaryHref", event.target.value)} />
            </label>
            <label>
              <span>Nút phụ — nhãn</span>
              <input value={String(block.props.secondaryLabel ?? "")} onChange={(event) => setProp("secondaryLabel", event.target.value)} />
            </label>
            <label>
              <span>Nút phụ — đường dẫn</span>
              <input value={String(block.props.secondaryHref ?? "")} onChange={(event) => setProp("secondaryHref", event.target.value)} />
            </label>
          </>
        ) : null}

        {block.type === "map" ? (
          <label className="is-wide">
            <span>Liên kết nhúng bản đồ</span>
            <input
              value={String(block.props.embed ?? "")}
              placeholder="https://www.google.com/maps/embed?..."
              onChange={(event) => setProp("embed", event.target.value)}
            />
          </label>
        ) : null}

        {block.type === "hero" ? (
          <>
            <label>
              <span>Tiêu đề chính</span>
              <input value={String(block.props.title ?? "")} onChange={(event) => setProp("title", event.target.value)} />
            </label>
            <label>
              <span>Dòng nhấn</span>
              <input value={String(block.props.accent ?? "")} onChange={(event) => setProp("accent", event.target.value)} />
            </label>
          </>
        ) : null}

        {supportsItems ? (
          <label className="is-wide">
            <span>Danh sách mục — JSON</span>
            <textarea
              rows={5}
              value={itemsText}
              placeholder={ITEM_SHAPES[block.type]}
              onChange={(event) => {
                const text = event.target.value;
                setItemsText(text);
                if (!text.trim()) {
                  setItemsError("");
                  setProp("items", undefined);
                  return;
                }
                try {
                  const parsed: unknown = JSON.parse(text);
                  if (!Array.isArray(parsed)) throw new Error("Cần một mảng JSON");
                  setItemsError("");
                  setProp("items", parsed);
                } catch (error) {
                  setItemsError(error instanceof Error ? error.message : "JSON chưa hợp lệ");
                }
              }}
            />
            {itemsError ? (
              <em className="block-editor__error">
                <AlertTriangle aria-hidden="true" /> {itemsError}
              </em>
            ) : (
              <em className="block-editor__shape">Ví dụ: {ITEM_SHAPES[block.type]}</em>
            )}
          </label>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Trình soạn khối nội dung cho trang CMS: mỗi khối có loại, các trường văn bản
 * thông dụng và ô JSON cho danh sách mục (có kiểm tra hợp lệ ngay khi nhập).
 */
export function BlocksField({ label, hint, blocks, onChange }: BlocksFieldProps) {
  const update = (index: number, block: BlockRow) => {
    const next = [...blocks];
    next[index] = block;
    onChange(next.map((item, order) => ({ ...item, order })));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((item, order) => ({ ...item, order })));
  };

  return (
    <div className="block-editor field--wide">
      <div className="block-editor__head">
        <div>
          <strong>{label}</strong>
          {hint ? <p className="field__hint">{hint}</p> : null}
        </div>
        <button type="button" className="button button--ghost" onClick={() => onChange([...blocks, { type: "richText", props: {}, order: blocks.length }])}>
          <Plus aria-hidden="true" /> Thêm khối
        </button>
      </div>

      {blocks.length === 0 ? <p className="block-editor__empty">Trang này chưa có khối nội dung nào.</p> : null}

      {blocks.map((block, index) => (
        <BlockCard
          key={index}
          block={block}
          index={index}
          total={blocks.length}
          onChange={(next) => update(index, next)}
          onRemove={() => onChange(blocks.filter((_, itemIndex) => itemIndex !== index).map((item, order) => ({ ...item, order })))}
          onMove={(direction) => move(index, direction)}
        />
      ))}
    </div>
  );
}
