import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import express, { type Express } from "express";
import session, { MemoryStore, type SessionData } from "express-session";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isDbConnectionError } from "../db/connectionErrors";
import { ResilientSessionStore } from "../db/sessionStore";
import { errorHandler } from "../middleware/errors";

const servers: Server[] = [];
let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
});

async function listen(app: Express) {
  const server = app.listen(0);
  servers.push(server);
  await new Promise((resolve) => server.once("listening", resolve));
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

const timeoutError = () => new Error("Connection terminated due to connection timeout");
const loggedHeadersSent = () => consoleError.mock.calls.some((args) => args.map(String).join(" ").includes("ERR_HTTP_HEADERS_SENT"));

describe("isDbConnectionError", () => {
  it("nhận ra lỗi không tới được PostgreSQL", () => {
    expect(isDbConnectionError(timeoutError())).toBe(true);
    expect(isDbConnectionError(new Error("timeout exceeded when trying to connect"))).toBe(true);
    expect(isDbConnectionError(Object.assign(new Error("connect ECONNREFUSED"), { code: "ECONNREFUSED" }))).toBe(true);
    expect(isDbConnectionError(Object.assign(new Error("terminating connection"), { code: "57P01" }))).toBe(true);
    expect(isDbConnectionError(Object.assign(new Error("connection failure"), { code: "08006" }))).toBe(true);
  });

  it("không nhầm lỗi câu lệnh SQL hay lỗi thường", () => {
    expect(isDbConnectionError(Object.assign(new Error("duplicate key"), { code: "23505" }))).toBe(false);
    expect(isDbConnectionError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isDbConnectionError("Connection terminated")).toBe(false);
  });
});

describe("errorHandler", () => {
  it("chỉ ghi log khi lỗi đến sau lúc đã gửi phản hồi, không gây ERR_HTTP_HEADERS_SENT", async () => {
    const app = express();
    app.get("/late", (_req, res, next) => {
      res.json({ ok: true });
      next(timeoutError());
    });
    app.use(errorHandler);
    const response = await fetch(`${await listen(app)}/late`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(loggedHeadersSent()).toBe(false);
    expect(consoleError).toHaveBeenCalledWith("[api] lỗi sau khi đã gửi phản hồi:", "Connection terminated due to connection timeout");
  });

  it("trả 503 kèm thông báo tiếng Việt khi mất kết nối DB", async () => {
    const app = express();
    app.get("/db", (_req, _res, next) => next(timeoutError()));
    app.use(errorHandler);
    const response = await fetch(`${await listen(app)}/db`);
    expect(response.status).toBe(503);
    expect(response.headers.get("retry-after")).toBe("30");
    expect(await response.json()).toEqual({
      error: { code: "db_unavailable", message: "Hệ thống dữ liệu đang tạm gián đoạn. Vui lòng thử lại sau ít phút." },
    });
  });
});

/** Store giả lập PostgreSQL có thể bật/tắt lỗi kết nối. */
class FlakyStore extends MemoryStore {
  down = false;
  get(sid: string, callback: (err: unknown, session?: SessionData | null) => void) {
    if (this.down) setImmediate(() => callback(timeoutError()));
    else super.get(sid, callback);
  }
  set(sid: string, data: SessionData, callback?: (err?: unknown) => void) {
    if (this.down) setImmediate(() => callback?.(timeoutError()));
    else super.set(sid, data, callback);
  }
}

function sessionApp(store: ResilientSessionStore) {
  const app = express();
  app.use(session({ secret: "test-secret", resave: false, saveUninitialized: true, store }));
  app.get("/whoami", (req, res) => {
    if (req.session) req.session.csrfToken ??= "token";
    res.json({ hasSession: Boolean(req.session) });
  });
  app.use(errorHandler);
  return app;
}

describe("ResilientSessionStore", () => {
  it("lưu phiên thất bại sau khi trả lời: một response duy nhất, chuyển sang chế độ không phiên rồi tự kết nối lại", async () => {
    const inner = new FlakyStore();
    let dbUp = false;
    const store = new ResilientSessionStore(inner, () => (dbUp ? Promise.resolve() : Promise.reject(timeoutError())), 20);
    const disconnected = vi.fn();
    const connected = vi.fn();
    store.on("disconnect", disconnected);
    store.on("connect", connected);
    const base = await listen(sessionApp(store));

    inner.down = true;
    const first = await fetch(`${base}/whoami`);
    expect(first.status).toBe(200);
    expect(await first.json()).toEqual({ hasSession: true });
    expect(disconnected).toHaveBeenCalledTimes(1);
    expect(loggedHeadersSent()).toBe(false);

    // Store đã ngắt: express-session bỏ qua phiên thay vì chờ DB.
    const second = await fetch(`${base}/whoami`);
    expect(await second.json()).toEqual({ hasSession: false });

    inner.down = false;
    dbUp = true;
    await vi.waitFor(() => expect(connected).toHaveBeenCalledTimes(1));
    const third = await fetch(`${base}/whoami`);
    expect(await third.json()).toEqual({ hasSession: true });
    expect(loggedHeadersSent()).toBe(false);
  });

  it("đọc phiên thất bại: trả đúng một response 503 và giữ nguyên cookie phiên cũ", async () => {
    const inner = new FlakyStore();
    const store = new ResilientSessionStore(inner, () => new Promise(() => {}), 20);
    const base = await listen(sessionApp(store));

    const login = await fetch(`${base}/whoami`);
    const cookie = login.headers.get("set-cookie")?.split(";")[0] ?? "";
    expect(cookie).toMatch(/^connect\.sid=/);

    inner.down = true;
    const response = await fetch(`${base}/whoami`, { headers: { cookie } });
    expect(response.status).toBe(503);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(((await response.json()) as { error: { code: string } }).error.code).toBe("db_unavailable");
    expect(loggedHeadersSent()).toBe(false);
  });

  it("lỗi ghi phiên không phải do kết nối vẫn được báo (không bị nuốt)", async () => {
    const inner = new MemoryStore();
    inner.set = (_sid, _data, callback) => callback?.(new Error("value too long for type"));
    const store = new ResilientSessionStore(inner, () => Promise.resolve(), 20);
    const base = await listen(sessionApp(store));
    const response = await fetch(`${base}/whoami`);
    expect(response.status).toBe(200);
    await vi.waitFor(() => expect(consoleError).toHaveBeenCalledWith("[api] lỗi sau khi đã gửi phản hồi:", "value too long for type"));
    expect(loggedHeadersSent()).toBe(false);
  });
});
