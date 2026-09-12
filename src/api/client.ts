export type ApiFieldError = { path: string; message: string };

export class ApiError extends Error {
  status: number;
  code: string;
  fields: ApiFieldError[];

  constructor(status: number, code: string, message: string, fields: ApiFieldError[] = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

type RequestOptions = {
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  formData?: FormData;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  return `${url.pathname}${url.search}`;
}

async function request<T>(method: "GET" | "POST" | "PATCH" | "DELETE", path: string, body?: unknown, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (!options.formData && body !== undefined) headers["Content-Type"] = "application/json";
  if (method !== "GET") {
    const csrf = readCookie("sgen_csrf");
    if (csrf) headers["x-csrf-token"] = csrf;
  }
  const response = await fetch(buildUrl(path, options.query), {
    method,
    headers,
    credentials: "same-origin",
    signal: options.signal,
    body: options.formData ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  const contentType = response.headers.get("content-type") ?? "";
  const payload: unknown = contentType.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const error = typeof payload === "object" && payload !== null && "error" in payload ? payload.error : null;
    const code = error && typeof error === "object" && "code" in error ? String(error.code) : "request_failed";
    const message = error && typeof error === "object" && "message" in error ? String(error.message) : `Yêu cầu thất bại (${response.status})`;
    const fields =
      error && typeof error === "object" && "fields" in error && Array.isArray(error.fields)
        ? (error.fields as ApiFieldError[])
        : [];
    throw new ApiError(response.status, code, message, fields);
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("POST", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("PATCH", path, body, options),
  del: <T>(path: string, body?: unknown, options?: RequestOptions) => request<T>("DELETE", path, body, options),
  upload: <T>(path: string, formData: FormData) => request<T>("POST", path, undefined, { formData }),
};

export function errorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Có lỗi không xác định.";
}
