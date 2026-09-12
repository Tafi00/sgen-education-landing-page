import { query } from "./pool.js";

/**
 * Lớp model tối giản trên PostgreSQL, giữ đúng tập API mà mã nghiệp vụ đang dùng
 * (`find/findOne/findById/countDocuments/create/findByIdAndUpdate/findByIdAndDelete/
 *  updateOne/updateMany/deleteMany/deleteOne` + `sort/limit/skip/select/lean`).
 *
 * Quy ước:
 * - Tên cột trùng tên trường trong tài liệu, viết hoa thường trong dấu nháy kép.
 * - Trường phức tạp (blocks, seo, options, payload…) lưu `jsonb`, mảng chuỗi lưu `text[]`.
 * - Trường `sensitive` (passwordHash) mặc định không được nạp; muốn lấy phải `.select("+passwordHash")`.
 */

export type FieldKind = "text" | "int" | "float" | "bool" | "date" | "json" | "uuid" | "textarray";

export type FieldSpec = {
  kind: FieldKind;
  /** Không nạp theo mặc định; phải yêu cầu rõ bằng `.select("+tenTruong")`. */
  sensitive?: boolean;
};

export type TableSpec = {
  table: string;
  fields: Record<string, FieldSpec>;
};

export type SortSpec = Record<string, 1 | -1 | "asc" | "desc" | "ASC" | "DESC">;
type Filter = Record<string, unknown>;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";

function quote(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function isOperatorObject(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || value instanceof Date || Array.isArray(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key) => key.startsWith("$"));
}

class Compiler {
  params: unknown[] = [];

  constructor(private spec: TableSpec) {}

  param(value: unknown) {
    this.params.push(value);
    return `$${this.params.length}`;
  }

  /** Cột hệ thống của mọi bảng (không khai báo trong `TableSpec.fields`). */
  private kindOf(field: string): FieldKind | undefined {
    if (field === "createdAt" || field === "updatedAt") return "date";
    return this.spec.fields[field]?.kind;
  }

  /** Chuyển giá trị JS sang dạng driver hiểu được cho từng loại cột. */
  value(field: string, value: unknown): unknown {
    const kind = this.kindOf(field);
    if (value === undefined || value === null) return null;
    /** Trường lạ (không khai báo): chuyển nguyên trạng để driver tự xử lý (Date, mảng…). */
    if (!kind) return value;
    switch (kind) {
      case "json":
        return JSON.stringify(value);
      case "uuid": {
        const text = String(value);
        // id sai định dạng không được làm sập truy vấn: coi như không khớp bản ghi nào.
        return UUID_RE.test(text) ? text : NIL_UUID;
      }
      case "date":
        return value instanceof Date ? value : new Date(String(value));
      case "bool":
        return Boolean(value);
      case "int":
      case "float":
        return Number(value);
      case "textarray":
        return Array.isArray(value) ? value.map((item) => String(item)) : [];
      default:
        return typeof value === "string" ? value : String(value);
    }
  }

  /** Biểu thức cột, hỗ trợ đường dẫn lồng trong jsonb (`notification.resend`). */
  fieldRef(field: string) {
    const dot = field.indexOf(".");
    if (dot > 0) {
      const head = field.slice(0, dot);
      if (this.spec.fields[head]?.kind === "json") {
        const path = field
          .slice(dot + 1)
          .split(".")
          .map((part) => `'${part.replace(/'/g, "''")}'`)
          .join(",");
        return { expr: `(${quote(head)} #>> ARRAY[${path}])`, kind: "text" as FieldKind };
      }
    }
    return { expr: quote(field), kind: this.kindOf(field) ?? ("text" as FieldKind) };
  }

  condition(field: string, value: unknown): string {
    const { expr, kind } = this.fieldRef(field);
    if (isOperatorObject(value)) {
      const parts: string[] = [];
      for (const [operator, operand] of Object.entries(value)) {
        switch (operator) {
          case "$ne":
            parts.push(operand === null ? `${expr} IS NOT NULL` : `${expr} IS DISTINCT FROM ${this.param(this.value(field, operand))}`);
            break;
          case "$in": {
            const values = Array.isArray(operand) ? operand : [];
            if (!values.length) parts.push("false");
            else parts.push(`${expr} IN (${values.map((item) => this.param(this.value(field, item))).join(", ")})`);
            break;
          }
          case "$nin": {
            const values = Array.isArray(operand) ? operand : [];
            if (values.length) parts.push(`${expr} NOT IN (${values.map((item) => this.param(this.value(field, item))).join(", ")})`);
            break;
          }
          case "$gt":
            parts.push(`${expr} > ${this.param(this.value(field, operand))}`);
            break;
          case "$gte":
            parts.push(`${expr} >= ${this.param(this.value(field, operand))}`);
            break;
          case "$lt":
            parts.push(`${expr} < ${this.param(this.value(field, operand))}`);
            break;
          case "$lte":
            parts.push(`${expr} <= ${this.param(this.value(field, operand))}`);
            break;
          case "$regex": {
            const flags = String((value as Record<string, unknown>).$options ?? "");
            parts.push(`${expr} ${flags.includes("i") ? "~*" : "~"} ${this.param(String(operand))}`);
            break;
          }
          case "$options":
            break;
          case "$exists":
            parts.push(operand ? `${expr} IS NOT NULL` : `${expr} IS NULL`);
            break;
          default:
            throw new Error(`Toán tử ${operator} chưa được lớp PostgreSQL hỗ trợ (cột ${field}).`);
        }
      }
      return parts.length ? parts.join(" AND ") : "true";
    }
    if (value === null || value === undefined) return `${expr} IS NULL`;
    if (kind === "json") return `${expr} = ${this.param(this.value(field, value))}::jsonb`;
    return `${expr} = ${this.param(this.value(field, value))}`;
  }

  where(filter?: Filter): string {
    if (!filter) return "";
    const clauses: string[] = [];
    for (const [key, value] of Object.entries(filter)) {
      if (value === undefined) continue;
      if (key === "$or" || key === "$and") {
        const list = (Array.isArray(value) ? value : [])
          .map((item) => this.where(item as Filter))
          .filter((part) => part && part !== "true");
        if (!list.length) continue;
        const joiner = key === "$or" ? " OR " : " AND ";
        clauses.push(`(${list.map((part) => `(${part})`).join(joiner)})`);
        continue;
      }
      clauses.push(this.condition(key, value));
    }
    return clauses.join(" AND ");
  }
}

export type Row = Record<string, unknown>;

/**
 * Dạng dữ liệu trả về khi gọi `.lean()`: giữ nguyên kiểu trường nhưng **không có**
 * phương thức tài liệu (`save`, `deleteOne`…). Kiểu TS giữ nguyên `T` để mã nghiệp vụ
 * đọc trường thuận tiện; chỉ gọi phương thức khi đã bỏ `.lean()`.
 */
export type Plain<T> = T;

const META = Symbol("pgModelMeta");

type DocMeta = { model: Model; fields: string[] };

export class Doc {
  [key: string]: unknown;
  /** Khoá chính uuid, mọi bảng đều có. */
  declare _id: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  async save(): Promise<this> {
    const meta = (this as unknown as { [META]: DocMeta })[META];
    if (!meta) throw new Error("save() chỉ dùng được trên bản ghi đọc từ PostgreSQL.");
    await meta.model.updateById(String(this._id), this, meta.fields);
    return this;
  }

  toObject(_options?: unknown): Row {
    const meta = (this as unknown as { [META]: DocMeta })[META];
    const fields = meta ? meta.fields : Object.keys(this);
    const plain: Row = {};
    for (const field of fields) plain[field] = (this as Row)[field];
    return plain;
  }

  async deleteOne() {
    const meta = (this as unknown as { [META]: DocMeta })[META];
    if (!meta) throw new Error("deleteOne() chỉ dùng được trên bản ghi đọc từ PostgreSQL.");
    await meta.model.deleteMany({ _id: this._id });
    return { deletedCount: 1 };
  }

  /** Gán giá trị theo đường dẫn (`brand.name`, `notification.telegramChatId`). */
  set(path: string, value: unknown) {
    const parts = path.split(".");
    let node = this as unknown as Record<string, unknown>;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const key = parts[index];
      const next = node[key];
      if (!next || typeof next !== "object" || Array.isArray(next)) node[key] = {};
      node = node[key] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = value;
  }
}

export class SelectQuery<T> implements PromiseLike<T> {
  private sortSpec?: SortSpec;
  private limitValue?: number;
  private skipValue?: number;
  private selectSpec?: string;
  private leanMode = false;

  constructor(
    private model: Model<Doc>,
    private filter?: Filter,
    private many = true,
  ) {}

  sort(spec: SortSpec) {
    this.sortSpec = { ...(this.sortSpec ?? {}), ...spec };
    return this;
  }

  limit(value: number) {
    this.limitValue = value;
    return this;
  }

  skip(value: number) {
    this.skipValue = value;
    return this;
  }

  select(spec: string) {
    this.selectSpec = spec;
    return this;
  }

  lean<TLean = Plain<T>>() {
    this.leanMode = true;
    return this as unknown as SelectQuery<TLean>;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.run().then(onfulfilled ?? undefined, onrejected ?? undefined);
  }

  private async run(): Promise<T> {
    const compiler = new Compiler(this.model.spec);
    const where = compiler.where(this.filter);
    const fields = this.model.resolveFields(this.selectSpec);
    const selectList = fields.map(quote).join(", ");
    const sql = [
      `SELECT ${selectList} FROM ${quote(this.model.spec.table)}`,
      where ? `WHERE ${where}` : "",
      this.model.orderBy(this.sortSpec, compiler),
      this.limitValue === undefined ? "" : `LIMIT ${this.model.literal(this.limitValue, compiler)}`,
      this.skipValue === undefined ? "" : `OFFSET ${this.model.literal(this.skipValue, compiler)}`,
    ]
      .filter(Boolean)
      .join(" ");

    const result = await query(sql, compiler.params);
    if (!this.many) {
      const row = result.rows[0] as Row | undefined;
      return (row ? (this.leanMode ? row : this.model.hydrate(row, fields)) : null) as T;
    }
    const rows = result.rows as Row[];
    return (this.leanMode ? rows : rows.map((row) => this.model.hydrate(row, fields))) as T;
  }
}

/** Kết quả một thao tác ghi: await được, đồng thời hỗ trợ `.select()` / `.lean()` như truy vấn đọc. */
export class DocMutation<T extends Doc | null> implements PromiseLike<T> {
  private selectSpec?: string;
  private leanMode = false;

  constructor(private thunk: () => Promise<Row | null>, private model: Model<Doc>, private many = false) {
    void this.many;
  }

  select(spec: string) {
    this.selectSpec = spec;
    return this;
  }

  lean() {
    this.leanMode = true;
    return this;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    const run = this.thunk().then((row) => {
      if (!row) return null as unknown as T;
      const fields = this.model.resolveFields(this.selectSpec);
      return (this.leanMode ? row : this.model.hydrate(row, fields)) as unknown as T;
    });
    return run.then(onfulfilled ?? undefined, onrejected ?? undefined);
  }
}

export class Model<TDoc extends Doc = Doc> {
  constructor(readonly spec: TableSpec) {}

  /** Giá trị nguyên (LIMIT/OFFSET) đưa thẳng vào SQL sau khi ép kiểu số. */
  literal(value: number, compiler: Compiler) {
    const numeric = Math.trunc(Number(value));
    if (!Number.isFinite(numeric) || numeric < 0) return compiler.param(0);
    return String(numeric);
  }

  orderBy(sort: SortSpec | undefined, compiler: Compiler) {
    void compiler;
    if (!sort) return "";
    const parts: string[] = [];
    for (const [field, direction] of Object.entries(sort)) {
      const systemColumn = field === "_id" || field === "createdAt" || field === "updatedAt";
      if (!systemColumn && !this.spec.fields[field]) continue;
      const dir = direction === 1 || direction === "asc" || direction === "ASC" ? "ASC" : "DESC";
      parts.push(`${quote(field)} ${dir}`);
    }
    return parts.length ? `ORDER BY ${parts.join(", ")}` : "";
  }

  /** Danh sách cột theo `select`: mặc định mọi cột trừ cột `sensitive`. */
  resolveFields(select?: string): string[] {
    const all = ["_id", ...Object.keys(this.spec.fields), "createdAt", "updatedAt"];
    const sensitive = new Set(Object.entries(this.spec.fields).filter(([, spec]) => spec.sensitive).map(([name]) => name));
    if (!select) return all.filter((field) => !sensitive.has(field));
    const tokens = select.split(/[\s,]+/).filter(Boolean);
    const inclusive = tokens.filter((token) => !token.startsWith("-") && !token.startsWith("+"));
    if (inclusive.length) {
      const extra = tokens.filter((token) => token.startsWith("+")).map((token) => token.slice(1));
      const wanted = new Set([...inclusive, ...extra]);
      return all.filter((field) => wanted.has(field));
    }
    const removed = new Set(tokens.filter((token) => token.startsWith("-")).map((token) => token.slice(1)));
    const added = tokens.filter((token) => token.startsWith("+")).map((token) => token.slice(1));
    return all.filter((field) => (!sensitive.has(field) && !removed.has(field)) || added.includes(field));
  }

  hydrate(row: Row, fields: string[]): TDoc {
    const doc = Object.create(Doc.prototype) as Doc;
    for (const field of fields) doc[field] = row[field] ?? null;
    Object.defineProperty(doc, META, { value: { model: this, fields }, enumerable: false });
    return doc as TDoc;
  }

  columns(fields: string[]): string[] {
    return fields.filter((field) => this.spec.fields[field]);
  }

  bind(compiler: Compiler, field: string, value: unknown) {
    return compiler.param(compiler.value(field, value));
  }

  find(filter?: Filter, options?: { sort?: SortSpec; limit?: number; skip?: number; select?: string; lean?: boolean }) {
    const query = new SelectQuery<TDoc[]>(this, filter, true);
    if (options?.sort) query.sort(options.sort);
    if (options?.limit !== undefined) query.limit(options.limit);
    if (options?.skip !== undefined) query.skip(options.skip);
    if (options?.select) query.select(options.select);
    if (options?.lean) query.lean();
    return query;
  }

  findOne(filter?: Filter, options?: { select?: string; sort?: SortSpec }) {
    const query = new SelectQuery<TDoc | null>(this, filter, false);
    if (options?.select) query.select(options.select);
    if (options?.sort) query.sort(options.sort);
    query.limit(1);
    return query;
  }

  findById(id: unknown, options?: { select?: string }) {
    return this.findOne({ _id: id }, options);
  }

  countDocuments(filter?: Filter) {
    const compiler = new Compiler(this.spec);
    const where = compiler.where(filter);
    const sql = `SELECT count(*)::int AS count FROM ${quote(this.spec.table)}${where ? ` WHERE ${where}` : ""}`;
    return query<{ count: number }>(sql, compiler.params).then((result) => Number(result.rows[0]?.count ?? 0));
  }

  async create(data: Row): Promise<TDoc> {
    const fields = this.columns(Object.keys(data).filter((field) => data[field] !== undefined));
    const compiler = new Compiler(this.spec);
    const values = fields.map((field) => this.bind(compiler, field, data[field]));
    const visible = this.resolveFields();
    const sql = [
      `INSERT INTO ${quote(this.spec.table)} (${fields.map(quote).join(", ")})`,
      `VALUES (${values.join(", ") || "DEFAULT VALUES"})`,
      `RETURNING ${visible.map(quote).join(", ")}`,
    ]
      .filter(Boolean)
      .join(" ");
    const statement = fields.length ? sql : `INSERT INTO ${quote(this.spec.table)} DEFAULT VALUES RETURNING ${visible.map(quote).join(", ")}`;
    const result = await query(statement, compiler.params);
    return this.hydrate(result.rows[0] as Row, visible);
  }

  private async applyUpdate(filter: Filter, update: Row): Promise<Row[]> {
    const compiler = new Compiler(this.spec);
    const assignments: string[] = [];
    const source = update.$set && typeof update.$set === "object" ? (update.$set as Row) : update;
    for (const [field, value] of Object.entries(source)) {
      if (field.startsWith("$")) continue;
      const dot = field.indexOf(".");
      if (dot > 0) {
        const head = field.slice(0, dot);
        if (this.spec.fields[head]?.kind !== "json") throw new Error(`Không hỗ trợ cập nhật trường lồng ${field}.`);
        const path = field
          .slice(dot + 1)
          .split(".")
          .map((part) => `"${part.replace(/"/g, '""')}"`)
          .join(",");
        assignments.push(`${quote(head)} = jsonb_set(COALESCE(${quote(head)}, '{}'::jsonb), '{${field
          .slice(dot + 1)
          .split(".")
          .map((part) => part.replace(/'/g, "''"))
          .join(",")}}', ${compiler.param(JSON.stringify(value ?? null))}::jsonb, true)`);
        void path;
        continue;
      }
      if (!this.spec.fields[field]) continue;
      assignments.push(`${quote(field)} = ${this.bind(compiler, field, value)}`);
    }
    assignments.push(`${quote("updatedAt")} = now()`);
    const where = compiler.where(filter);
    const sql = `UPDATE ${quote(this.spec.table)} SET ${assignments.join(", ")}${where ? ` WHERE ${where}` : ""} RETURNING *`;
    const result = await query(sql, compiler.params);
    return result.rows as Row[];
  }

  findByIdAndUpdate(id: unknown, update: Row, options?: { new?: boolean }) {
    return new DocMutation<TDoc | null>(
      async () => {
        const rows = await this.applyUpdate({ _id: id }, update);
        return options?.new === false ? null : (rows[0] ?? null);
      },
      this as unknown as Model<Doc>,
    );
  }

  async findByIdAndDelete(id: unknown): Promise<TDoc | null> {
    const result = await query(`DELETE FROM ${quote(this.spec.table)} WHERE ${quote("_id")} = $1 RETURNING *`, [
      new Compiler(this.spec).value("_id", id),
    ]);
    const row = result.rows[0] as Row | undefined;
    return row ? this.hydrate(row, Object.keys(row)) : null;
  }

  async updateOne(filter: Filter, update: Row) {
    const rows = await this.applyUpdate(filter, update);
    return { modifiedCount: rows.length, matchedCount: rows.length };
  }

  async updateMany(filter: Filter, update: Row) {
    const rows = await this.applyUpdate(filter, update);
    return { modifiedCount: rows.length, matchedCount: rows.length };
  }

  async deleteMany(filter: Filter) {
    const compiler = new Compiler(this.spec);
    const where = compiler.where(filter);
    const result = await query(`DELETE FROM ${quote(this.spec.table)}${where ? ` WHERE ${where}` : ""}`, compiler.params);
    return { deletedCount: result.rowCount ?? 0 };
  }

  async deleteOne(filter: Filter) {
    const compiler = new Compiler(this.spec);
    const where = compiler.where(filter);
    const result = await query(
      `DELETE FROM ${quote(this.spec.table)} WHERE ${quote("_id")} = (SELECT ${quote("_id")} FROM ${quote(this.spec.table)}${
        where ? ` WHERE ${where}` : ""
      } LIMIT 1)`,
      compiler.params,
    );
    return { deletedCount: result.rowCount ?? 0 };
  }

  /**
   * Dùng khi tài liệu đã bị sửa tại chỗ rồi gọi `save()`.
   * Ghi cả trường được gán thêm sau khi đọc (ví dụ `member.passwordHash = …`) — tương đương
   * cách Mongoose theo dõi đường dẫn bị sửa, tránh việc gán mà không được lưu.
   */
  async updateById(id: string, doc: Row, fields: string[]) {
    const assigned = Object.keys(doc).filter((key) => !key.startsWith("__"));
    const writable = this.columns([...new Set([...fields, ...assigned])]).filter((field) => field !== "_id" && field !== "createdAt");
    if (!writable.length) return;
    const compiler = new Compiler(this.spec);
    const assignments = writable.map((field) => `${quote(field)} = ${this.bind(compiler, field, doc[field])}`);
    compiler.param(id);
    const sql = `UPDATE ${quote(this.spec.table)} SET ${assignments.join(", ")}, ${quote("updatedAt")} = now() WHERE ${quote(
      "_id",
    )} = $${compiler.params.length}`;
    await query(sql, compiler.params);
  }
}
