import fs from "node:fs";
import path from "node:path";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./env.js";
import { dbState } from "./db.js";
import { getPool } from "./db/pool.js";
import { errorHandler, notFoundHandler } from "./middleware/errors.js";
import { issueCsrfToken, requireCsrf } from "./middleware/csrf.js";
import { requireAdmin } from "./middleware/auth.js";
import { publicApiRouter } from "./routes/public/index.js";
import { adminApiRouter } from "./routes/admin/index.js";
import { adminAuthPublicRouter } from "./routes/admin/auth.js";
import { buildPageMeta, buildSitemap, injectSeoTags } from "./services/seo.js";

function originFrom(req: express.Request) {
  return `${req.protocol}://${req.get("host") ?? "localhost"}`;
}

export function createApp() {
  const app = express();
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(
    session({
      name: "sgen_sid",
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: true,
      rolling: true,
      store:
        dbState.status === "connected" || dbState.status === "connecting"
          ? new (connectPgSimple(session))({ pool: getPool(), tableName: "session", ttl: 60 * 60 * 24 * 14, createTableIfMissing: false })
          : undefined,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: env.cookieSecure,
        maxAge: 1000 * 60 * 60 * 24 * 14,
      },
    }),
  );
  app.use(issueCsrfToken);

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, db: dbState.status, dbError: dbState.lastError, env: env.isProduction ? "production" : "development" });
  });

  app.use("/api", publicApiRouter);
  /** Đăng nhập/đăng xuất/phiên hiện tại: truy cập được khi chưa có phiên admin. */
  app.use("/api/admin/auth", requireCsrf, adminAuthPublicRouter);
  app.use("/api/admin", requireAdmin(), requireCsrf, adminApiRouter);

  fs.mkdirSync(env.uploadDir, { recursive: true });
  app.use(
    "/uploads",
    express.static(env.uploadDir, {
      maxAge: "30d",
      immutable: true,
      index: false,
      dotfiles: "deny",
    }),
  );

  if (fs.existsSync(env.webDistDir)) {
    const indexHtml = fs.readFileSync(path.join(env.webDistDir, "index.html"), "utf8");
    app.use(express.static(env.webDistDir, { index: false }));

    let sitemapCache: { body: string; expiresAt: number } | null = null;
    app.get("/sitemap.xml", async (req, res, next) => {
      try {
        if (!sitemapCache || sitemapCache.expiresAt < Date.now()) {
          sitemapCache = { body: await buildSitemap(originFrom(req)), expiresAt: Date.now() + 10 * 60 * 1000 };
        }
        res.type("application/xml").send(sitemapCache.body);
      } catch {
        /** CSDL chưa sẵn sàng: trả sitemap tối thiểu của các route tĩnh. */
        res.type("application/xml").send(await buildSitemap(originFrom(req), { staticOnly: true }));
      }
    });

    /** Mọi route công khai trả HTML đã gắn meta riêng để crawler đọc được ngay. */
    app.get(/^\/(?!api|uploads|sitemap.xml|robots.txt).*/, async (req, res, next) => {
      try {
        const isAdminArea = req.path.startsWith("/admin") || req.path === "/tai-khoan";
        if (isAdminArea) {
          res.type("html").send(injectSeoTags(indexHtml, { title: "Quản trị nội dung — SGEN", description: "", canonical: originFrom(req), ogImage: "", noindex: true }));
          return;
        }
        /** Nếu CSDL chưa sẵn sàng, vẫn trả HTML với meta tối thiểu thay vì lỗi 500. */
        const meta = await buildPageMeta(req.path, originFrom(req)).catch(() => ({
          title: "SGEN Education — Thần số học ứng dụng",
          description: "SGEN Education — Thần số học Pythagoras, DISC, MBTI và phong thủy ứng dụng.",
          canonical: `${originFrom(req)}${req.path}`,
          ogImage: "/assets/backgrounds/cosmic-dark.webp",
        }));
        res.type("html").send(injectSeoTags(indexHtml, meta));
      } catch (error) {
        next(error);
      }
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
