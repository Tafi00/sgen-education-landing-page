// Hậu xử lý bản build GitHub Pages: site chạy dưới đường dẫn con nên các đường dẫn
// tuyệt đối viết cứng trong code ("/assets/...", href="/blog"...) phải gắn thêm base.
// Chỉ dùng cho bản tĩnh (không có API/CMS); bản server chạy ở gốc nên không cần.
import { readdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from "node:fs";
import { join } from "node:path";

const base = (process.env.VITE_BASE ?? "/").replace(/\/$/, "");
const dist = process.env.PAGES_DIST ?? "dist";
if (!base) process.exit(0);

const staticRoots = ["assets/", "uploads/", "favicon.png", "hero-", "bazi-", "iching-"].map((p) => p.replace(/[.-]/g, "\\$&")).join("|");
// "/assets/..." trong chuỗi JS hoặc url(...) của CSS.
const assetRe = new RegExp(`(["'\`(])/(?=(?:${staticRoots}))`, "g");
// href:"/blog" trong JSX đã biên dịch (thẻ <a> thường, không qua react-router).
const hrefRe = /(href:\s*["'`])\/(?!\/|api\/)/g;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (statSync(file).isDirectory()) walk(file);
    else if (/\.(js|css)$/.test(name)) {
      const src = readFileSync(file, "utf8");
      const out = src.replace(assetRe, `$1${base}/`).replace(hrefRe, `$1${base}/`);
      if (out !== src) writeFileSync(file, out);
    }
  }
}
walk(dist);

// SPA fallback: GitHub Pages trả 404.html cho mọi đường dẫn không tồn tại.
copyFileSync(join(dist, "index.html"), join(dist, "404.html"));
writeFileSync(join(dist, ".nojekyll"), "");
console.log(`pages-postbuild: base=${base}`);
