import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";
import sharp from "sharp";
import { createApp } from "../app.js";
import { connectDb, disconnectDb } from "../db.js";
import { setConnectionString } from "../db/pool.js";
import { env } from "../env.js";
import { hashPassword } from "../middleware/auth.js";
import { Entitlement, Lead, MediaAsset, Order, SiteSetting, User } from "../models/index.js";
import { seedAll } from "./seed.js";

type Jar = { cookies: Map<string, string> };

const results: { name: string; ok: boolean; detail: string }[] = [];

function record(name: string, ok: boolean, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

/**
 * Gọi API trong kiểm thử. Payload trả về là JSON tùy endpoint nên để kiểu `any`
 * cho gọn phần khẳng định — đây là script kiểm thử, không phải mã sản phẩm.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function call(
  base: string,
  pathname: string,
  options: { method?: string; body?: unknown; jar?: Jar; formData?: FormData; raw?: boolean } = {},
): Promise<{ status: number; payload: any }> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.jar) {
    const cookieHeader = [...options.jar.cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
    if (cookieHeader) headers.Cookie = cookieHeader;
    const csrf = options.jar.cookies.get("sgen_csrf");
    if (csrf && options.method && options.method !== "GET") headers["x-csrf-token"] = csrf;
  }
  const response = await fetch(`${base}${pathname}`, {
    method: options.method ?? "GET",
    headers,
    body: options.formData ?? (options.body === undefined ? undefined : JSON.stringify(options.body)),
  });
  for (const cookie of response.headers.getSetCookie?.() ?? []) {
    const [pair] = cookie.split(";");
    const separator = pair.indexOf("=");
    if (separator > 0) options.jar?.cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
  const contentType = response.headers.get("content-type") ?? "";
  const payload = options.raw ? await response.text() : contentType.includes("json") ? await response.json() : await response.text();
  return { status: response.status, payload };
}

/** Ảnh PNG 600x400 để kiểm thử luồng upload và sinh biến thể theo bề rộng. */
async function samplePng() {
  return sharp({ create: { width: 600, height: 400, channels: 3, background: "#5a22e8" } }).png().toBuffer();
}

/**
 * Smoke test chạy trên database PostgreSQL riêng (`sgen_smoke`) để không đụng dữ liệu thật.
 * Database được tạo tự động nếu chưa có, sau đó schema + seed + admin kiểm thử được dựng lại.
 */
async function prepareSmokeDatabase() {
  const base = new URL(env.databaseUrl);
  const admin = new Client({ connectionString: `${base.protocol}//${base.username}:${base.password}@${base.host}/postgres` });
  await admin.connect();
  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = 'sgen_smoke'");
  if (!exists.rowCount) await admin.query('CREATE DATABASE "sgen_smoke"');
  await admin.end();
  base.pathname = "/sgen_smoke";
  setConnectionString(base.toString());
  await connectDb();
}

async function resetSmokeDatabase() {
  const { getPool } = await import("../db/pool.js");
  const { rows } = await getPool().query<{ tablename: string }>(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'session'",
  );
  if (!rows.length) return;
  await getPool().query(`TRUNCATE ${rows.map((row) => `"${row.tablename}"`).join(", ")} RESTART IDENTITY CASCADE`);
}

async function run() {
  await prepareSmokeDatabase();
  await resetSmokeDatabase();
  const seedSummary = await seedAll(false);
  console.log(`[smoke] seed — ${seedSummary}\n`);

  await User.create({
    email: "admin@sgen.test",
    name: "Quản trị kiểm thử",
    role: "admin",
    passwordHash: await hashPassword("SgenTest123"),
  });

  const server = createApp().listen(0);
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Không lấy được cổng kiểm thử.");
  const base = `http://127.0.0.1:${address.port}`;

  /* ------------------------------ công khai ------------------------------ */
  const health = await call(base, "/api/health");
  record("health trả trạng thái DB", health.status === 200 && health.payload.db === "connected", `db=${health.payload.db}`);

  const courses = await call(base, "/api/courses");
  record("danh sách khóa học từ PostgreSQL", courses.payload.total === 11, `total=${courses.payload.total}`);

  const pages = await call(base, "/api/pages/gioi-thieu/tam-nhin");
  record("trang nội dung tầm nhìn đọc từ CMS", pages.status === 200 && pages.payload.page.slug === "gioi-thieu/tam-nhin");

  const posts = await call(base, "/api/posts");
  record("blog có 12 bài seed", posts.payload.total === 12, `total=${posts.payload.total}`);

  const quiz = await call(base, "/api/quiz/disc");
  const quizJson = JSON.stringify(quiz.payload);
  record(
    "bộ đề DISC không lộ khoá chấm điểm",
    quiz.status === 200 && quiz.payload.quiz.items.length === 16 && !quizJson.includes("dimension") && !quizJson.includes("pole"),
    `items=${quiz.payload.quiz.items.length}`,
  );

  const numerology = await call(base, "/api/lookups/numerology", {
    method: "POST",
    body: { inputs: { name: "Nguyễn Minh Anh", birthDate: "1996-03-12" }, source: "/tra-cuu/than-so-hoc" },
  });
  const metricBlock = numerology.payload.report?.blocks?.find((block: { kind: string }) => block.kind === "metrics");
  record("tra cứu thần số học trả 8 chỉ số", numerology.status === 200 && metricBlock?.items?.length === 8, `items=${metricBlock?.items?.length}`);

  const sim = await call(base, "/api/lookups/sim", { method: "POST", body: { inputs: { phone: "0987654321", birthDate: "1990-05-05" } } });
  record("luận sim trả điểm tổng và các lớp phân tích", sim.status === 200 && typeof sim.payload.report?.subhead === "string", `headline=${sim.payload.report?.headline}`);

  const discScore = await call(base, "/api/quiz/disc/score", {
    method: "POST",
    body: {
      inputs: {
        answers: Object.fromEntries(
          Array.from({ length: 16 }, (_, index) => {
            const id = `d${String(index + 1).padStart(2, "0")}`;
            return [`${id}.most`, `${id}-a`];
          }),
        ),
      },
    },
  });
  record("chấm điểm DISC trả kết quả", discScore.status === 200 && String(discScore.payload.report?.headline).includes("DISC"), String(discScore.payload.report?.headline));

  const lead = await call(base, "/api/leads", {
    method: "POST",
    body: { name: "Trần Văn Khách", phone: "0900000001", email: "khach@example.com", message: "Cần tư vấn", source: "trang-chu/tu-van", consent: true },
  });
  const storedLead = await Lead.findById(lead.payload.id).lean();
  record("lead được lưu vào PostgreSQL trước khi thông báo", lead.status === 201 && Boolean(storedLead), `id=${lead.payload.id}`);

  const blockedAdmin = await call(base, "/api/admin/courses");
  record("API admin bị chặn khi chưa đăng nhập", blockedAdmin.status === 401, `status=${blockedAdmin.status}`);

  /* -------------------------------- admin -------------------------------- */
  const adminJar: Jar = { cookies: new Map() };
  await call(base, "/api/admin/auth/me", { jar: adminJar });
  const noCsrf = await call(base, "/api/admin/auth/login", { method: "POST", body: { email: "admin@sgen.test", password: "SgenTest123" } });
  record("thiếu mã CSRF bị từ chối", noCsrf.status === 403, `status=${noCsrf.status}`);

  const login = await call(base, "/api/admin/auth/login", {
    method: "POST",
    body: { email: "admin@sgen.test", password: "SgenTest123" },
    jar: adminJar,
  });
  record("đăng nhập admin bằng mật khẩu băm", login.status === 200 && login.payload.admin?.role === "admin");

  const adminCourses = await call(base, "/api/admin/courses?pageSize=50", { jar: adminJar });
  record("admin đọc được danh sách khóa học", adminCourses.status === 200 && adminCourses.payload.total === 11, `total=${adminCourses.payload.total}`);

  const created = await call(base, "/api/admin/courses", {
    method: "POST",
    jar: adminJar,
    body: { title: "Khóa học kiểm thử smoke", level: "Nền tảng", price: 1000000, priceNote: "Giá tham khảo", status: "published" },
  });
  record("tạo khóa học sinh slug tự động", created.status === 201 && created.payload.item?.slug === "khoa-hoc-kiem-thu-smoke", `slug=${created.payload.item?.slug}`);

  const invalid = await call(base, "/api/admin/courses", { method: "POST", jar: adminJar, body: { title: "x" } });
  record("validate từ chối dữ liệu sai", invalid.status === 422);

  const settingsPatch = await call(base, "/api/admin/settings", {
    method: "PATCH",
    jar: adminJar,
    body: { notification: { emailEnabled: true, resendApiKey: "re_test_secret_1234", telegramEnabled: true, telegramBotToken: "123456:ABC-secret" } },
  });
  const patchedSettings = settingsPatch.payload.settings?.notification;
  const storedSettings = await SiteSetting.findOne({ singleton: "site" }).lean();
  const storedNotification = storedSettings?.notification;
  const rawResponse = JSON.stringify(settingsPatch.payload);
  record(
    "secret được mã hoá trong DB và chỉ trả về dạng mask",
    settingsPatch.status === 200 &&
      Boolean(storedNotification?.resendApiKeyEnc?.startsWith("v1:")) &&
      !rawResponse.includes("re_test_secret_1234") &&
      patchedSettings?.resendApiKeyMasked?.endsWith("1234"),
    `masked=${patchedSettings?.resendApiKeyMasked}`,
  );

  const keepSecret = await call(base, "/api/admin/settings", { method: "PATCH", jar: adminJar, body: { notification: { resendFrom: "SGEN <no-reply@sgen.vn>" } } });
  const keptSettings = await SiteSetting.findOne({ singleton: "site" }).lean();
  record(
    "bỏ trống secret thì giữ nguyên giá trị cũ",
    keepSecret.status === 200 && keptSettings?.notification?.resendApiKeyEnc === storedNotification?.resendApiKeyEnc,
  );

  const formData = new FormData();
  formData.append("files", new Blob([await samplePng()], { type: "image/png" }), "smoke.png");
  formData.append("folder", "smoke");
  const uploaded = await call(base, "/api/admin/media/upload", { method: "POST", jar: adminJar, formData });
  const assetUrl: string = uploaded.payload.items?.[0]?.url ?? "";
  const filePath = path.join(env.uploadDir, assetUrl.replace("/uploads/", ""));
  record(
    "upload ghi tệp vào UPLOAD_DIR và lưu URL /uploads",
    uploaded.status === 201 && assetUrl.startsWith("/uploads/") && fs.existsSync(filePath),
    assetUrl,
  );
  const served = await fetch(`${base}${assetUrl}`);
  record("ảnh upload phục vụ công khai qua /uploads", served.status === 200 && (served.headers.get("content-type") ?? "").includes("image"));

  const mediaDoc = await MediaAsset.findOne({ url: assetUrl }).lean();
  record("media lưu biến thể WebP", Boolean(mediaDoc) && (mediaDoc?.variants?.length ?? 0) > 0, `variants=${mediaDoc?.variants?.length}`);

  const csv = await call(base, "/api/admin/leads/export/csv", { jar: adminJar, raw: true });
  record("xuất CSV leads", csv.status === 200 && String(csv.payload).includes("Trần Văn Khách"));

  /* --------------------------- thành viên và đơn --------------------------- */
  const memberJar: Jar = { cookies: new Map() };
  await call(base, "/api/members/me", { jar: memberJar });
  const registered = await call(base, "/api/members/register", {
    method: "POST",
    jar: memberJar,
    body: { name: "Khách VIP", email: "vip@example.com", password: "MatKhau123", consent: true },
  });
  record("đăng ký thành viên và tạo phiên", registered.status === 201 && Boolean(registered.payload.member?.id));

  const order = await call(base, "/api/orders", {
    method: "POST",
    jar: memberJar,
    body: { serviceSlug: "vip-than-so-hoc", customerName: "Khách VIP", customerPhone: "0900000002", customerEmail: "vip@example.com" },
  });
  record("tạo đơn hàng kèm mã và token xem", order.status === 201 && Boolean(order.payload.order?.code) && Boolean(order.payload.order?.viewToken), `code=${order.payload.order?.code}`);

  const hiddenOrder = await call(base, `/api/orders/${order.payload.order?.code}`);
  record("đơn hàng không lộ khi thiếu token", hiddenOrder.status === 403, `status=${hiddenOrder.status}`);

  const approved = await call(base, `/api/admin/orders/${(await Order.findOne({ code: order.payload.order?.code }).lean())?._id}/approve`, {
    method: "POST",
    jar: adminJar,
  });
  const entitlement = await Entitlement.findOne({ type: "vip-numerology", active: true }).lean();
  record("duyệt đơn cấp quyền nội dung trả phí", approved.status === 200 && Boolean(entitlement), `entitlement=${Boolean(entitlement)}`);

  const reports = await call(base, "/api/members/reports", { jar: memberJar });
  record("thành viên xem được lịch sử tra cứu", reports.status === 200 && Array.isArray(reports.payload.items));

  /* ---------------------- phân quyền & bảo vệ dữ liệu ---------------------- */
  const editorEmail = `editor.${Date.now()}@sgen.test`;
  const createdEditor = await call(base, "/api/admin/auth/users", {
    method: "POST",
    jar: adminJar,
    body: { name: "Biên tập viên", email: editorEmail, role: "editor", password: "EditorTest123" },
  });
  const editorJar: Jar = { cookies: new Map() };
  await call(base, "/api/admin/auth/me", { jar: editorJar });
  const editorLogin = await call(base, "/api/admin/auth/login", { method: "POST", jar: editorJar, body: { email: editorEmail, password: "EditorTest123" } });
  record(
    "tạo và đăng nhập được tài khoản editor",
    createdEditor.status === 201 && editorLogin.status === 200 && editorLogin.payload.admin?.role === "editor",
    `create=${createdEditor.status} login=${editorLogin.status}`,
  );

  const editorCourses = await call(base, "/api/admin/courses", { jar: editorJar });
  record("editor quản trị được nội dung (khóa học)", editorCourses.status === 200, `status=${editorCourses.status}`);

  const businessPaths = ["/api/admin/leads", "/api/admin/orders", "/api/admin/members", "/api/admin/entitlements", "/api/admin/lookups", "/api/admin/dashboard/audit"];
  const editorBusiness = await Promise.all(businessPaths.map((pathname) => call(base, pathname, { jar: editorJar })));
  record(
    "editor bị chặn khỏi dữ liệu kinh doanh và dữ liệu cá nhân",
    editorBusiness.every((response) => response.status === 403),
    editorBusiness.map((response, index) => `${businessPaths[index].split("/").pop()}=${response.status}`).join(" "),
  );

  const editorDelete = lead.payload?.id
    ? await call(base, "/api/admin/leads/bulk", { method: "POST", jar: editorJar, body: { ids: [lead.payload.id], action: "delete" } })
    : { status: 0 };
  record("editor không xoá được lead của khách", editorDelete.status === 403, `status=${editorDelete.status}`);

  const memberForHash = await call(base, "/api/admin/members", { jar: adminJar });
  const memberPayload = JSON.stringify(memberForHash.payload);
  record(
    "API thành viên không trả passwordHash",
    memberForHash.status === 200 && !memberPayload.includes("passwordHash") && !memberPayload.includes("$2b$"),
    `keys=${Object.keys(memberForHash.payload.items?.[0] ?? {}).join(",")}`,
  );

  const adminForHash = await call(base, "/api/admin/auth/users", { jar: adminJar });
  record(
    "API tài khoản quản trị không trả passwordHash",
    adminForHash.status === 200 && !JSON.stringify(adminForHash.payload).includes("passwordHash"),
    `status=${adminForHash.status}`,
  );

  /* -------------------------------- tổng kết ------------------------------- */
  server.close();
  await disconnectDb();

  const failed = results.filter((item) => !item.ok);
  console.log(`\n[smoke] ${results.length - failed.length}/${results.length} kiểm tra đạt.`);
  if (failed.length) {
    console.error(`[smoke] thất bại: ${failed.map((item) => item.name).join(", ")}`);
    process.exit(1);
  }
  assert.equal(failed.length, 0);
}

run().catch((error) => {
  console.error("[smoke] lỗi:", error);
  process.exit(1);
});
