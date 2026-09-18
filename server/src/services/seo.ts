import { Course, Page, Post, ServicePackage } from "../models/index.js";
import { loadSettings } from "./settings.js";

export type PageMeta = { title: string; description: string; canonical: string; ogImage: string; noindex?: boolean };

const STATIC_TITLES: Record<string, { title: string; description: string; noindex?: boolean }> = {
  "/": { title: "SGEN Education — Thần số học ứng dụng", description: "Tra cứu Thần số học Pythagoras, trắc nghiệm DISC/MBTI, phong thủy sim số và các công cụ phong thủy ứng dụng." },
  "/gioi-thieu": { title: "Giới thiệu SGEN Education", description: "Tầm nhìn, sứ mệnh và giá trị cốt lõi của SGEN Education trên hành trình giáo dục số và khai mở tiềm năng." },
  "/gioi-thieu/tam-nhin": { title: "Tầm nhìn", description: "Định hướng dài hạn của SGEN Education: biến tri thức bản thể thành năng lực ứng dụng cho người Việt." },
  "/gioi-thieu/su-menh": { title: "Sứ mệnh", description: "Vì sao SGEN Education tồn tại và cam kết đồng hành cùng học viên, phụ huynh và nhà đào tạo." },
  "/gioi-thieu/gia-tri-cot-loi": { title: "Giá trị cốt lõi", description: "Những nguyên tắc SGEN Education giữ vững: hiểu đúng bản chất, ứng dụng thực tiễn, đồng hành tử tế." },
  "/lien-he": { title: "Liên hệ SGEN Education", description: "Gửi yêu cầu tư vấn, đăng ký khóa học hoặc hợp tác cùng SGEN Education." },
  "/tra-cuu": { title: "Tra cứu Thần số học, DISC, MBTI", description: "Bộ công cụ tra cứu miễn phí: bản đồ số học đầy đủ 20 chỉ số và 4 biểu đồ, trắc nghiệm DISC và MBTI." },
  "/tra-cuu/than-so-hoc": { title: "Tra cứu Thần số học", description: "Nhập họ tên và ngày sinh để xem báo cáo Thần số học Pythagoras đầy đủ: 20 chỉ số, biểu đồ chặng đường đời, Ikigai, ngày sinh và họ tên." },
  "/tra-cuu/disc": { title: "Trắc nghiệm DISC", description: "Bài trắc nghiệm DISC theo khung tham chiếu, giúp nhận diện nhóm hành vi nổi trội trong công việc." },
  "/tra-cuu/mbti": { title: "Trắc nghiệm MBTI", description: "Bài trắc nghiệm MBTI theo khung 4 cặp xu hướng, gợi ý môi trường và ngành nghề phù hợp." },
  "/dich-vu": { title: "Dịch vụ và gói nội dung", description: "Gói VIP Thần số học, bản đồ số học trọn đời và tư vấn định hướng nghề nghiệp cùng SGEN." },
  "/sim-phong-thuy": { title: "Phong thủy sim số điện thoại", description: "Luận sim theo Kinh Dịch, ngũ hành dãy số, âm dương và đối chiếu bản mệnh." },
  "/sim-phong-thuy/boi-sim": { title: "Phần mềm bói sim phong thủy", description: "Nhập số điện thoại và ngày giờ sinh để xem phân tích sim theo năm lớp phương pháp." },
  "/cong-cu-phong-thuy": { title: "Công cụ phong thủy", description: "Gieo quẻ Kinh Dịch, phân tích Tứ Trụ Bát Tự và xem ngày tốt xấu theo lịch pháp Việt Nam." },
  "/cong-cu-phong-thuy/gieo-que-kinh-dich": { title: "Gieo quẻ Kinh Dịch", description: "Lập quẻ theo ba đồng xu, luận quẻ chủ - quẻ biến và hào động cho việc đang suy xét." },
  "/cong-cu-phong-thuy/tu-tru-bat-tu": { title: "Phân tích Tứ Trụ Bát Tự", description: "Lập lá số bốn trụ, xét vượng suy Nhật chủ, ngũ hành và đại vận." },
  "/cong-cu-phong-thuy/xem-ngay": { title: "Xem ngày tốt xấu", description: "Tra cứu ngày tốt xấu, giờ hoàng đạo, tiết khí và đối chiếu tuổi theo lịch pháp Việt Nam." },
  "/khoa-hoc": { title: "Khóa học SGEN Education", description: "11 khóa học từ nền tảng đến chuyên sâu: Thần số học, Kinh Dịch, Tứ Trụ, phong thủy ứng dụng." },
  "/free-tools": { title: "Free tools — công cụ miễn phí", description: "Kho công cụ tra cứu miễn phí của SGEN: chỉ số Thần số học, mũi tên, biểu đồ ngày sinh, phong thủy." },
  "/blog": { title: "Blog SGEN Education", description: "Kiến thức Thần số học, DISC/MBTI, phong thủy và ứng dụng thực tiễn." },
  "/blog/kien-thuc": { title: "Kiến thức", description: "Tổng hợp bài viết kiến thức nền tảng theo từng chuyên mục." },
  "/dang-nhap": { title: "Đăng nhập", description: "Đăng nhập tài khoản SGEN để xem lại kết quả tra cứu và quyền nội dung trả phí.", noindex: true },
  "/dang-ky": { title: "Đăng ký tài khoản", description: "Tạo tài khoản SGEN Education để lưu kết quả tra cứu.", noindex: true },
  "/tai-khoan": { title: "Tài khoản của tôi", description: "Quản lý hồ sơ, lịch sử tra cứu và đơn hàng.", noindex: true },
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
}

/** Sinh thẻ meta cho từng đường dẫn công khai, dùng cho HTML trả về crawler. */
export async function buildPageMeta(pathname: string, origin: string): Promise<PageMeta> {
  const settings = await loadSettings();
  const fallback = settings.seo;
  const clean = pathname.replace(/\/+$/, "") || "/";
  const staticMeta = STATIC_TITLES[clean];
  if (staticMeta) {
    return {
      title: staticMeta.title,
      description: staticMeta.description,
      canonical: `${origin}${clean}`,
      ogImage: fallback.ogImage || "/assets/backgrounds/cosmic-dark.webp",
      noindex: staticMeta.noindex,
    };
  }

  const segments = clean.split("/").filter(Boolean);
  if (segments[0] === "khoa-hoc" && segments[1]) {
    const course = await Course.findOne({ slug: segments[1], status: "published" }).lean();
    if (course) {
      return {
        title: `${course.title} — Khóa học`,
        description: course.summary || course.priceNote || fallback.defaultDescription,
        canonical: `${origin}${clean}`,
        ogImage: course.coverImage || fallback.ogImage,
      };
    }
  }
  if (segments[0] === "blog" && segments[1]) {
    const post = await Post.findOne({ slug: segments[1], status: "published" }).lean();
    if (post) {
      return {
        title: post.title,
        description: post.excerpt || fallback.defaultDescription,
        canonical: `${origin}${clean}`,
        ogImage: post.cover || fallback.ogImage,
      };
    }
  }
  if (segments[0] === "dich-vu" && segments[1]) {
    const service = await ServicePackage.findOne({ slug: segments[1], status: "published" }).lean();
    if (service) {
      return {
        title: service.name,
        description: service.description || service.tagline || fallback.defaultDescription,
        canonical: `${origin}${clean}`,
        ogImage: service.coverImage || fallback.ogImage,
      };
    }
  }
  if (segments[0] === "gioi-thieu" && segments.length === 2) {
    const page = await Page.findOne({ slug: clean, status: "published" }).lean();
    if (page) {
      return {
        title: page.title,
        description: page.description || fallback.defaultDescription,
        canonical: `${origin}${clean}`,
        ogImage: fallback.ogImage,
      };
    }
  }

  return {
    title: fallback.defaultTitle,
    description: fallback.defaultDescription,
    canonical: `${origin}${clean}`,
    ogImage: fallback.ogImage || "/assets/backgrounds/cosmic-dark.webp",
  };
}

/** Thay khối `<!--seo:start-->…<!--seo:end-->` trong index.html bằng thẻ meta cụ thể của trang. */
export function injectSeoTags(html: string, meta: PageMeta) {
  const block = [
    "<!--seo:start-->",
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`,
    meta.noindex ? '<meta name="robots" content="noindex, nofollow" />' : '<meta name="robots" content="index, follow" />',
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="SGEN Education" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`,
    `<meta property="og:url" content="${escapeHtml(meta.canonical)}" />`,
    "<!--seo:end-->",
  ].join("\n    ");
  return html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, block);
}

/** Sinh sitemap.xml từ các route tĩnh và nội dung đã xuất bản trong CMS. */
export async function buildSitemap(origin: string, options: { staticOnly?: boolean } = {}) {
  const [courses, posts, services, pages] = options.staticOnly
    ? [[], [], [], []]
    : await Promise.all([
        Course.find({ status: "published" }).select("slug updatedAt").lean(),
        Post.find({ status: "published" }).select("slug updatedAt").lean(),
        ServicePackage.find({ status: "published" }).select("slug updatedAt").lean(),
        Page.find({ status: "published" }).select("slug updatedAt").lean(),
      ]);
  const entries: { url: string; lastmod?: string }[] = Object.keys(STATIC_TITLES)
    .filter((path) => !STATIC_TITLES[path].noindex && path !== "/dang-ky")
    .map((path) => ({ url: `${origin}${path}` }));
  for (const course of courses) entries.push({ url: `${origin}/khoa-hoc/${course.slug}`, lastmod: course.updatedAt?.toISOString() });
  for (const post of posts) entries.push({ url: `${origin}/blog/${post.slug}`, lastmod: post.updatedAt?.toISOString() });
  for (const service of services) entries.push({ url: `${origin}/dich-vu/${service.slug}`, lastmod: service.updatedAt?.toISOString() });
  for (const page of pages) {
    if (STATIC_TITLES[`/${page.slug}`]) continue;
    entries.push({ url: `${origin}/${page.slug}`, lastmod: page.updatedAt?.toISOString() });
  }
  const body = entries
    .map((entry) => `  <url><loc>${escapeHtml(entry.url)}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod.slice(0, 10)}</lastmod>` : ""}</url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}
