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
import { PDFDocument } from "pdf-lib";
import { Customer, EbookCode, EbookExport, Entitlement, Lead, LookupReport, MediaAsset, Order, SiteSetting, User } from "../models/index.js";
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

/** Gọi API xuất ebook: giữ cookie phiên như trình duyệt; trả PDF hoặc JSON tùy phản hồi. */
async function callBinary(base: string, pathname: string, body: unknown, jar: Jar) {
  const cookieHeader = [...jar.cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
  const response = await fetch(`${base}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/pdf,application/json", ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
    body: JSON.stringify(body),
  });
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/pdf")) return { status: response.status, bytes: new Uint8Array(await response.arrayBuffer()), payload: null as unknown, headers: response.headers };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { status: response.status, bytes: null, payload: (await response.json()) as any, headers: response.headers };
}

/** Tải file ebook bằng đường dẫn, không gửi cookie: như khi mở link ở Chrome sau khi xuất trong Zalo. */
async function fetchExportFile(base: string, token: string | undefined, query = "") {
  const response = await fetch(`${base}/api/ebook/file/${token}${query}`);
  const isPdf = (response.headers.get("content-type") ?? "").includes("application/pdf");
  return { status: response.status, disposition: response.headers.get("content-disposition") ?? "", bytes: isPdf ? new Uint8Array(await response.arrayBuffer()) : null };
}

/** Gửi một phần video (nhị phân) lên API quản trị, kèm cookie phiên và CSRF. */
async function postChunk(base: string, pathname: string, chunk: Buffer, jar: Jar) {
  const response = await fetch(`${base}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream", Cookie: [...jar.cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; "), "x-csrf-token": jar.cookies.get("sgen_csrf") ?? "" },
    body: new Uint8Array(chunk),
  });
  return { status: response.status, payload: (await response.json()) as { received?: number } };
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

  const businessPaths = ["/api/admin/leads", "/api/admin/orders", "/api/admin/members", "/api/admin/entitlements", "/api/admin/lookups", "/api/admin/dashboard/audit", "/api/admin/customers"];
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

  /* ------------------- số điện thoại, khách hàng và xuất ebook ------------------- */
  const customerLookup = await call(base, "/api/lookups/numerology", {
    method: "POST",
    body: { inputs: { name: "Phạm Thanh Tùng", birthDate: "2010-09-02", phone: "0912 345 678" }, save: true, source: "/" },
  });
  const lookupId: string = customerLookup.payload.report?.id;
  const lookupToken: string = customerLookup.payload.report?.shareToken;
  const lookupRow = await LookupReport.findById(lookupId).lean();
  record(
    "tra cứu kèm số điện thoại lưu hồ sơ khách hàng, SĐT không nằm trong inputs",
    customerLookup.status === 200 && Boolean(lookupRow?.customerId) && !JSON.stringify(lookupRow?.inputs).includes("0912") && !JSON.stringify(lookupRow?.result).includes("0912"),
  );

  const sharedReport = await call(base, `/api/lookups/${lookupId}?token=${lookupToken}`);
  record(
    "link chia sẻ kết quả không lộ số điện thoại hay hồ sơ khách hàng",
    sharedReport.status === 200 && !JSON.stringify(sharedReport.payload).includes("0912") && !("customerId" in (sharedReport.payload.report ?? {})),
  );

  const badPhoneLookup = await call(base, "/api/lookups/numerology", { method: "POST", body: { inputs: { name: "Nguyễn Văn An", birthDate: "1990-05-17", phone: "12345" } } });
  record(
    "tra cứu với số điện thoại sai bị từ chối ở máy chủ",
    badPhoneLookup.status === 422 && badPhoneLookup.payload.error?.fields?.some((field: { path: string }) => field.path === "inputs.phone" || field.path === "phone"),
    JSON.stringify(badPhoneLookup.payload.error?.fields),
  );

  const directPdf = await call(base, `/api/lookups/${lookupId}/pdf?token=${lookupToken}`);
  record("PDF không còn tải trực tiếp, bắt buộc qua trang ebook", directPdf.status === 404, `status=${directPdf.status}`);

  const demoCode = await call(base, "/api/admin/ebook-codes/generate", { method: "POST", jar: adminJar, body: { plan: "demo", count: 1 } });
  const fullCode = await call(base, "/api/admin/ebook-codes/generate", { method: "POST", jar: adminJar, body: { plan: "combo3", count: 1 } });
  const demoJar: Jar = { cookies: new Map() };
  const fullJar: Jar = { cookies: new Map() };
  const anonymousJar: Jar = { cookies: new Map() };
  await call(base, "/api/ebook/me", { jar: demoJar });
  await call(base, "/api/ebook/me", { jar: fullJar });
  await call(base, "/api/ebook/redeem", { method: "POST", jar: demoJar, body: { code: demoCode.payload.items[0].code } });
  await call(base, "/api/ebook/redeem", { method: "POST", jar: fullJar, body: { code: fullCode.payload.items[0].code } });
  const demoDoc = await EbookCode.findOne({ plan: "demo" }).lean();
  const fullDoc = await EbookCode.findOne({ plan: "combo3" }).lean();

  // Mã học viên (HV-…): chỉ mở khoá chi tiết công cụ Sim / Gieo quẻ / Xem ngày, không xuất ebook; mã ebook không mở khoá công cụ.
  const studentCode = (await call(base, "/api/admin/ebook-codes/generate", { method: "POST", jar: adminJar, body: { plan: "hocvien2", count: 1 } })).payload.items?.[0];
  const studentJar: Jar = { cookies: new Map() };
  await call(base, "/api/hoc-vien/me", { jar: studentJar });
  const studentAtEbook = await call(base, "/api/ebook/redeem", { method: "POST", jar: studentJar, body: { code: studentCode?.code } });
  const ebookAtStudent = await call(base, "/api/hoc-vien/redeem", { method: "POST", jar: studentJar, body: { code: demoCode.payload.items[0].code } });
  record("mã học viên không xuất ebook; mã ebook không mở khoá công cụ", studentAtEbook.status === 422 && ebookAtStudent.status === 422, `${studentAtEbook.status}/${ebookAtStudent.status}`);
  const studentRedeem = await call(base, "/api/hoc-vien/redeem", { method: "POST", jar: studentJar, body: { code: studentCode?.display } });
  const studentMe = await call(base, "/api/hoc-vien/me", { jar: studentJar });
  record(
    "nhập mã học viên (HV2-…) mở khoá công cụ cho phiên, kèm cấp của mã",
    studentRedeem.status === 200 && studentMe.payload.student?.display === studentCode?.display && studentMe.payload.student?.level === 2,
    `status=${studentRedeem.status} level=${studentMe.payload.student?.level}`,
  );
  const appendixAnonymous = await call(base, "/api/hoc-vien/phu-luc/trang-001.webp", { jar: anonymousJar, raw: true });
  const appendixStudent = await fetch(`${base}/api/hoc-vien/phu-luc/trang-001.webp`, {
    headers: { Cookie: [...studentJar.cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ") },
  });
  const appendixBadName = await call(base, "/api/hoc-vien/phu-luc/..%2F..%2Fpackage.json", { jar: studentJar, raw: true });
  record(
    "Phụ lục 64 quẻ chỉ trả ảnh cho học viên đã nhập mã",
    appendixAnonymous.status === 403 && appendixStudent.status === 200 && (appendixStudent.headers.get("content-type") ?? "").includes("webp") && appendixBadName.status === 404,
    `${appendixAnonymous.status}/${appendixStudent.status}/${appendixBadName.status}`,
  );
  // Cấp 1 (Sim, Bát Cực) chưa được xem Phụ lục 64 quẻ của Gieo quẻ (cấp 2).
  const levelOneCode = (await call(base, "/api/admin/ebook-codes/generate", { method: "POST", jar: adminJar, body: { plan: "hocvien1", count: 1 } })).payload.items?.[0];
  const levelOneJar: Jar = { cookies: new Map() };
  await call(base, "/api/hoc-vien/me", { jar: levelOneJar });
  await call(base, "/api/hoc-vien/redeem", { method: "POST", jar: levelOneJar, body: { code: levelOneCode?.code } });
  const levelOneAppendix = await call(base, "/api/hoc-vien/phu-luc/trang-001.webp", { jar: levelOneJar, raw: true });
  record("mã học viên cấp 1 không xem được Phụ lục 64 quẻ (cần cấp 2)", levelOneAppendix.status === 403, `status=${levelOneAppendix.status}`);
  await call(base, `/api/admin/ebook-codes/${studentCode?._id}`, { method: "PATCH", jar: adminJar, body: { status: "disabled" } });
  const afterDisable = await call(base, "/api/hoc-vien/me", { jar: studentJar });
  record("khoá mã học viên thì phiên mất quyền ngay", afterDisable.payload.student === null);

  const person = { name: "Phạm Thanh Tùng", birthDate: "2010-09-02", reportId: lookupId };
  const anonymous = await callBinary(base, "/api/ebook/export", { ...person, phone: "0912345678", edition: "demo" }, anonymousJar);
  record("chưa đăng nhập (chưa nhập mã) thì không xuất được ebook", anonymous.status === 401, `status=${anonymous.status}`);

  const noPhone = await callBinary(base, "/api/ebook/export", { ...person, edition: "demo" }, demoJar);
  const blankPhone = await callBinary(base, "/api/ebook/export", { ...person, phone: "   ", edition: "demo" }, demoJar);
  const badPhone = await callBinary(base, "/api/ebook/export", { ...person, phone: "09123abc78", edition: "full" }, fullJar);
  const hasPhoneError = (result: { status: number; payload: any }) => result.status === 422 && result.payload?.error?.fields?.some((field: { path: string }) => field.path === "phone");
  record("xuất ebook thiếu / sai số điện thoại bị chặn ở máy chủ (cả hai bản)", hasPhoneError(noPhone) && hasPhoneError(blankPhone) && hasPhoneError(badPhone), `${noPhone.status}/${blankPhone.status}/${badPhone.status}`);
  const afterBlocked = await EbookCode.findById(demoDoc?._id).lean();
  record("xuất bị chặn không trừ lượt và không ghi lịch sử", afterBlocked?.used === 0 && (await EbookExport.countDocuments({})) === 0);

  const demoForbidden = await callBinary(base, "/api/ebook/export", { ...person, phone: "0912345678", edition: "full" }, demoJar);
  record("mã demo không xuất được bản đầy đủ", demoForbidden.status === 403 && demoForbidden.payload?.error?.code === "edition_not_allowed", `status=${demoForbidden.status}`);

  const demoExport = await callBinary(base, "/api/ebook/export", { ...person, phone: "0912 345 678", edition: "demo" }, demoJar);
  const demoToken = (demoExport.payload as { file?: { token?: string } } | null)?.file?.token;
  const demoFile = await fetchExportFile(base, demoToken);
  const demoPages = demoFile.bytes ? (await PDFDocument.load(demoFile.bytes)).getPageCount() : 0;
  record("xuất bản Demo trả đường dẫn tải; tải không cần phiên được file PDF 18 trang", demoExport.status === 200 && demoFile.status === 200 && demoPages === 18 && demoFile.disposition.startsWith("attachment"), `status=${demoExport.status}/${demoFile.status} pages=${demoPages}`);

  const fullExport = await callBinary(base, "/api/ebook/export", { ...person, phone: "+84 912 345 678", edition: "full" }, fullJar);
  const fullToken = (fullExport.payload as { file?: { token?: string } } | null)?.file?.token;
  const fullFile = await fetchExportFile(base, fullToken);
  const fullPages = fullFile.bytes ? (await PDFDocument.load(fullFile.bytes)).getPageCount() : 0;
  record("xuất bản đầy đủ: tải theo đường dẫn được file PDF hơn 70 trang", fullExport.status === 200 && fullFile.status === 200 && fullPages > 70, `status=${fullExport.status}/${fullFile.status} pages=${fullPages}`);

  const profiles = await Customer.find({ nameSearch: "pham thanh tung" }).lean();
  record(
    "xuất lại (cả viết 0912… lẫn +84912…) không tạo hồ sơ khách hàng trùng",
    profiles.length === 1 && profiles[0].birthDate === "2010-09-02" && profiles[0].phoneKey === "0912345678",
    `profiles=${profiles.length}`,
  );
  const exportRows = await EbookExport.find({}).sort({ createdAt: 1 }).lean();
  record(
    "lịch sử xuất ghi hồ sơ khách, loại ebook, số điện thoại và trạng thái thành công",
    exportRows.length === 2 &&
      exportRows.every((row) => row.status === "success" && row.customerId === profiles[0]._id && row.customerPhone.replace("+84", "0").endsWith("912345678")) &&
      exportRows[0].edition === "demo" &&
      exportRows[1].edition === "full",
    exportRows.map((row) => `${row.edition}:${row.status}:${row.customerPhone}`).join(" "),
  );
  const usedAfter = await EbookCode.findById(fullDoc?._id).lean();
  record("mỗi lượt xuất thành công trừ đúng 1 lượt của mã", usedAfter?.used === 1);

  // Lỗi tạo file (tên không có chữ cái → không chọn được trang theo con số): hoàn lượt, ghi "failed", không ghi "success".
  const brokenExport = await callBinary(base, "/api/ebook/export", { name: "123 456", birthDate: "1990-01-01", phone: "0987654321", edition: "full" }, fullJar);
  const afterBroken = await EbookCode.findById(fullDoc?._id).lean();
  const failedRows = await EbookExport.find({ status: "failed" }).lean();
  record(
    "lỗi tạo file hoàn lại lượt, ghi trạng thái lỗi và không ghi thành xuất thành công",
    brokenExport.status >= 400 &&
      afterBroken?.used === 1 &&
      failedRows.length === 1 &&
      !failedRows[0].customerId &&
      (await EbookExport.countDocuments({ status: "success" })) === 2 &&
      (await Customer.countDocuments({ nameSearch: "123 456" })) === 0,
    `status=${brokenExport.status} used=${afterBroken?.used} failed=${failedRows.length}`,
  );

  const customerList = await call(base, "/api/admin/customers?q=tung", { jar: adminJar });
  record("quản trị tìm khách theo họ tên không phân biệt dấu", customerList.status === 200 && customerList.payload.items.some((item: { name: string }) => item.name === "Phạm Thanh Tùng"), `total=${customerList.payload.total}`);
  const byPhone = await Promise.all(["0912345678", "0912 345 678", "+84912345678", "912345"].map((q) => call(base, `/api/admin/customers?q=${encodeURIComponent(q)}`, { jar: adminJar })));
  record("quản trị tìm khách theo số điện thoại (mọi cách viết)", byPhone.every((response) => response.payload.items?.some((item: { phoneKey: string }) => item.phoneKey === "0912345678")), byPhone.map((response) => response.payload.total).join("/"));
  const byBirthday = await call(base, "/api/admin/customers?birthMonth=9&birthDay=2", { jar: adminJar });
  const wrongBirthday = await call(base, "/api/admin/customers?birthMonth=1", { jar: adminJar });
  record(
    "quản trị lọc khách theo ngày/tháng sinh",
    byBirthday.payload.items?.some((item: { name: string }) => item.name === "Phạm Thanh Tùng") && !wrongBirthday.payload.items?.some((item: { name: string }) => item.name === "Phạm Thanh Tùng"),
  );
  const target = customerList.payload.items.find((item: { name: string }) => item.name === "Phạm Thanh Tùng");
  const customerDetail = await call(base, `/api/admin/customers/${target?._id}`, { jar: adminJar });
  record(
    "chi tiết khách gồm ngày sinh, số điện thoại, hai loại ebook và lịch sử xuất",
    customerDetail.status === 200 &&
      customerDetail.payload.item.birthDate === "2010-09-02" &&
      customerDetail.payload.item.phoneKey === "0912345678" &&
      customerDetail.payload.item.exportCount === 2 &&
      customerDetail.payload.exports.filter((item: { status: string }) => item.status === "success").length === 2 &&
      customerDetail.payload.reports.length >= 1,
    `exports=${customerDetail.payload.exports?.length}`,
  );

  /* ------------------- tải lại file, lấy lại file ở quản trị ------------------ */
  const usedBeforeRefetch = (await EbookCode.findById(fullDoc?._id).lean())?.used;
  const secondDownload = await fetchExportFile(base, fullToken);
  const viewInline = await fetchExportFile(base, fullToken, "?xem=1");
  const fileInfo = await call(base, `/api/ebook/file/${fullToken}/info`);
  const fullExportRow = await EbookExport.findOne({ downloadToken: fullToken }).lean();
  const adminFile = await fetch(`${base}/api/admin/ebook-codes/exports/${fullExportRow?._id}/file`, { headers: { Cookie: [...adminJar.cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ") } });
  const adminBytes = (adminFile.headers.get("content-type") ?? "").includes("pdf") ? new Uint8Array(await adminFile.arrayBuffer()) : null;
  const adminPages = adminBytes ? (await PDFDocument.load(adminBytes)).getPageCount() : 0;
  const anonymousAdminFile = await fetch(`${base}/api/admin/ebook-codes/exports/${fullExportRow?._id}/file`);
  const adminLink = await call(base, `/api/admin/ebook-codes/exports/${fullExportRow?._id}/link`, { method: "POST", jar: adminJar });
  const usedAfterRefetch = (await EbookCode.findById(fullDoc?._id).lean())?.used;
  record(
    "tải lại, xem file, quản trị lấy lại file đều không trừ lượt; người ngoài không lấy được qua API quản trị",
    secondDownload.status === 200 && viewInline.disposition.startsWith("inline") && fileInfo.payload.file?.customerName === "Phạm Thanh Tùng" && fileInfo.payload.file?.customerPhone === undefined && adminPages > 70 && anonymousAdminFile.status === 401 && adminLink.payload.path === `/ebook/tai/${fullToken}` && usedAfterRefetch === usedBeforeRefetch,
    `${secondDownload.status}/${fileInfo.status}/${adminPages}/${anonymousAdminFile.status} used=${usedBeforeRefetch}→${usedAfterRefetch}`,
  );
  const recentFiles = await call(base, "/api/ebook/exports", { jar: fullJar });
  record("danh sách file đã xuất của mã gồm file vừa xuất, không gồm lượt lỗi", recentFiles.payload.items?.length === 1 && recentFiles.payload.items[0].token === fullToken, `items=${recentFiles.payload.items?.length}`);

  await EbookExport.updateOne({ downloadToken: fullToken }, { downloadExpiresAt: new Date(Date.now() - 1000) });
  const expiredFile = await fetchExportFile(base, fullToken);
  const badToken = await fetchExportFile(base, "khong-co-duong-dan-nay-trong-he-thong");
  const renewedLink = await call(base, `/api/admin/ebook-codes/exports/${fullExportRow?._id}/link`, { method: "POST", jar: adminJar });
  const renewedFile = await fetchExportFile(base, String(renewedLink.payload.path ?? "").split("/").pop());
  record("đường dẫn hết hạn báo 410, đường dẫn sai báo 404, quản trị cấp được link mới", expiredFile.status === 410 && badToken.status === 404 && renewedFile.status === 200, `${expiredFile.status}/${badToken.status}/${renewedFile.status}`);

  const oneCode = (await call(base, "/api/admin/ebook-codes/generate", { method: "POST", jar: adminJar, body: { plan: "demo1", count: 1 } })).payload.items?.[0];
  const oneJar: Jar = { cookies: new Map() };
  await call(base, "/api/ebook/me", { jar: oneJar });
  await call(base, "/api/ebook/redeem", { method: "POST", jar: oneJar, body: { code: oneCode?.code } });
  await callBinary(base, "/api/ebook/export", { ...person, phone: "0912345678", edition: "demo" }, oneJar);
  const otherBrowserJar: Jar = { cookies: new Map() };
  await call(base, "/api/ebook/me", { jar: otherBrowserJar });
  const exhaustedRedeem = await call(base, "/api/ebook/redeem", { method: "POST", jar: otherBrowserJar, body: { code: oneCode?.code } });
  const exhaustedList = await call(base, "/api/ebook/exports", { jar: otherBrowserJar });
  const exhaustedExport = await callBinary(base, "/api/ebook/export", { ...person, phone: "0912345678", edition: "demo" }, otherBrowserJar);
  record(
    "mã hết lượt vẫn đăng nhập ở trình duyệt khác để tải lại file đã xuất, nhưng không xuất mới được",
    exhaustedRedeem.status === 200 && exhaustedRedeem.payload.code?.state === "exhausted" && exhaustedList.payload.items?.length === 1 && exhaustedExport.status === 403,
    `${exhaustedRedeem.status}/${exhaustedList.payload.items?.length}/${exhaustedExport.status}`,
  );

  /* ------------------------------ khóa học video ----------------------------- */
  const courseSlug = "than-so-hoc-can-ban";
  const noCourseCode = await call(base, "/api/admin/ebook-codes/generate", { method: "POST", jar: adminJar, body: { plan: "khoahoc", count: 1 } });
  const courseCode = (await call(base, "/api/admin/ebook-codes/generate", { method: "POST", jar: adminJar, body: { plan: "khoahoc", count: 1, courseSlug } })).payload.items?.[0];
  const otherCourseCode = (await call(base, "/api/admin/ebook-codes/generate", { method: "POST", jar: adminJar, body: { plan: "khoahoc", count: 1, courseSlug: "gieo-que-kinh-dich" } })).payload.items?.[0];
  record("mã khóa học bắt buộc chọn khóa, tiền tố KH, không bao giờ hết lượt", noCourseCode.status === 422 && courseCode?.display?.startsWith("KH-") && courseCode?.state === "active", `${noCourseCode.status} ${courseCode?.display}`);

  // File thử: đầu file MP4 hợp lệ, chia 2 phần để đi qua đường tải từng phần.
  const videoBytes = Buffer.concat([Buffer.from([0, 0, 0, 24]), Buffer.from("ftypisom"), Buffer.alloc(9_000_000, 7)]);
  const started = await call(base, "/api/admin/course-lessons/uploads", { method: "POST", jar: adminJar });
  const uploadPath = `/api/admin/course-lessons/uploads/${started.payload.uploadId}`;
  const firstChunk = await postChunk(base, `${uploadPath}/chunk?offset=0`, videoBytes.subarray(0, 8_000_000), adminJar);
  const resentChunk = await postChunk(base, `${uploadPath}/chunk?offset=0`, videoBytes.subarray(0, 8_000_000), adminJar);
  const secondChunk = await postChunk(base, `${uploadPath}/chunk?offset=8000000`, videoBytes.subarray(8_000_000), adminJar);
  const finished = await call(base, `${uploadPath}/finish`, { method: "POST", jar: adminJar, body: { filename: "01 - Bài mở đầu.mp4" } });
  record("video tải lên từng phần, gửi lại phần đã nhận không ghi trùng", firstChunk.status === 200 && resentChunk.status === 200 && secondChunk.payload.received === videoBytes.length && finished.payload.size === videoBytes.length, `size=${finished.payload.size}`);

  const fakeStart = await call(base, "/api/admin/course-lessons/uploads", { method: "POST", jar: adminJar });
  const fakePath = `/api/admin/course-lessons/uploads/${fakeStart.payload.uploadId}`;
  await postChunk(base, `${fakePath}/chunk?offset=0`, Buffer.from("day khong phai video, chi la chu"), adminJar);
  const fakeFinish = await call(base, `${fakePath}/finish`, { method: "POST", jar: adminJar, body: { filename: "gia.mp4" } });
  record("file không phải video bị từ chối", fakeFinish.status === 422, `status=${fakeFinish.status}`);

  const lesson = await call(base, "/api/admin/course-lessons", { method: "POST", jar: adminJar, body: { courseSlug, title: "Bài mở đầu", section: "Video 1", videoFile: finished.payload.videoFile, durationSeconds: 754 } });
  const previewLesson = await call(base, "/api/admin/course-lessons", { method: "POST", jar: adminJar, body: { courseSlug, title: "Học thử trên YouTube", videoUrl: "https://youtu.be/dQw4w9WgXcQ", isPreview: true } });
  const draftLesson = await call(base, "/api/admin/course-lessons", { method: "POST", jar: adminJar, body: { courseSlug, title: "Bài nháp", videoUrl: "https://vimeo.com/123456789", status: "draft" } });
  const badLink = await call(base, "/api/admin/course-lessons", { method: "POST", jar: adminJar, body: { courseSlug, title: "Link sai", videoUrl: "https://example.com/khong-phai-video" } });
  const noVideo = await call(base, "/api/admin/course-lessons", { method: "POST", jar: adminJar, body: { courseSlug, title: "Không có video" } });
  record("thêm bài giảng từ file và link; link không phát được hoặc thiếu video bị từ chối", lesson.status === 201 && previewLesson.status === 201 && draftLesson.status === 201 && badLink.status === 422 && noVideo.status === 422, `${lesson.status}/${previewLesson.status}/${badLink.status}/${noVideo.status}`);

  const learnerJar: Jar = { cookies: new Map() };
  const learnBefore = await call(base, `/api/khoa-hoc/${courseSlug}/hoc`, { jar: learnerJar });
  const lockedVideoUrl = `/api/khoa-hoc/video/${lesson.payload.item._id}`;
  const cookieOf = (jar: Jar) => [...jar.cookies.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
  const videoLocked = await fetch(`${base}${lockedVideoUrl}`, { headers: { Cookie: cookieOf(learnerJar) } });
  const lockedRow = learnBefore.payload.lessons?.find((item: { title: string }) => item.title === "Bài mở đầu");
  const previewRow = learnBefore.payload.lessons?.find((item: { title: string }) => item.title === "Học thử trên YouTube");
  record(
    "chưa nhập mã: bài khoá không lộ nguồn video, bài học thử xem được, bài nháp bị ẩn, video trả 403",
    learnBefore.payload.access === null && lockedRow?.locked === true && lockedRow?.source === null && previewRow?.locked === false && previewRow?.source?.type === "embed" && learnBefore.payload.lessons?.length === 2 && videoLocked.status === 403,
    `lessons=${learnBefore.payload.lessons?.length} video=${videoLocked.status}`,
  );
  const directUpload = await fetch(`${base}/uploads/.course-videos/${finished.payload.videoFile}`);
  record("không tải được video qua đường /uploads công khai", directUpload.status >= 400, `status=${directUpload.status}`);

  const wrongCourse = await call(base, `/api/khoa-hoc/${courseSlug}/redeem`, { method: "POST", jar: learnerJar, body: { code: otherCourseCode?.code } });
  const ebookAtCourse = await call(base, `/api/khoa-hoc/${courseSlug}/redeem`, { method: "POST", jar: learnerJar, body: { code: oneCode?.code } });
  const courseAtEbook = await call(base, "/api/ebook/redeem", { method: "POST", jar: learnerJar, body: { code: courseCode?.code } });
  const courseAtStudent = await call(base, "/api/hoc-vien/redeem", { method: "POST", jar: learnerJar, body: { code: courseCode?.code } });
  record("mã khóa khác, mã ebook không mở được khóa; mã khóa học không xuất ebook, không mở công cụ", wrongCourse.status === 422 && ebookAtCourse.status === 422 && courseAtEbook.status === 422 && courseAtStudent.status === 422, `${wrongCourse.status}/${ebookAtCourse.status}/${courseAtEbook.status}/${courseAtStudent.status}`);

  const redeemCourse = await call(base, `/api/khoa-hoc/${courseSlug}/redeem`, { method: "POST", jar: learnerJar, body: { code: courseCode?.display } });
  const learnAfter = await call(base, `/api/khoa-hoc/${courseSlug}/hoc`, { jar: learnerJar });
  const videoWhole = await fetch(`${base}${lockedVideoUrl}`, { headers: { Cookie: cookieOf(learnerJar), Range: "bytes=0-99" } });
  const videoChunkLength = (await videoWhole.arrayBuffer()).byteLength;
  record(
    "nhập đúng mã: mở mọi bài của khóa, video phát được và tua được (Range 206)",
    redeemCourse.status === 200 && learnAfter.payload.access?.display === courseCode?.display && learnAfter.payload.lessons?.every((item: { locked: boolean; source: unknown }) => !item.locked && item.source) && videoWhole.status === 206 && videoChunkLength === 100,
    `${redeemCourse.status}/${videoWhole.status}/${videoChunkLength}`,
  );
  const otherCourseLearn = await call(base, "/api/khoa-hoc/gieo-que-kinh-dich/hoc", { jar: learnerJar });
  record("mã của khóa này không mở khóa khác", otherCourseLearn.payload.access === null, `access=${JSON.stringify(otherCourseLearn.payload.access)}`);

  await call(base, `/api/admin/ebook-codes/${courseCode?._id}`, { method: "PATCH", jar: adminJar, body: { status: "disabled" } });
  const videoDisabled = await fetch(`${base}${lockedVideoUrl}`, { headers: { Cookie: cookieOf(learnerJar) } });
  record("khoá mã khóa học thì học viên mất quyền xem ngay", videoDisabled.status === 403, `status=${videoDisabled.status}`);

  const reordered = await call(base, "/api/admin/course-lessons/reorder", { method: "POST", jar: adminJar, body: { ids: [previewLesson.payload.item._id, lesson.payload.item._id, draftLesson.payload.item._id] } });
  const afterReorder = await call(base, `/api/admin/course-lessons?course=${courseSlug}`, { jar: adminJar });
  record("đổi được thứ tự bài", reordered.status === 200 && afterReorder.payload.items?.[0]?._id === previewLesson.payload.item._id, afterReorder.payload.items?.map((item: { title: string }) => item.title).join(" > "));
  const removed = await call(base, `/api/admin/course-lessons/${lesson.payload.item._id}`, { method: "DELETE", jar: adminJar });
  const videoGone = await fetch(`${base}${lockedVideoUrl}`, { headers: { Cookie: cookieOf(adminJar) } });
  record("xoá bài giảng xoá luôn file video", removed.status === 200 && videoGone.status === 404, `${removed.status}/${videoGone.status}`);

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
