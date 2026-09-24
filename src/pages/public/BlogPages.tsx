/**
 * Trang blog công khai.
 *
 * - `BlogListPage` (`/blog`): danh sách bài viết kèm tìm kiếm, chuyên mục và phân
 *   trang; trạng thái giữ trên URL (`?q=&category=&page=`).
 * - `BlogCategoryPage` (`/blog/kien-thuc`): thư viện kiến thức dạng cây chuyên mục
 *   bên trái, bài nổi bật và danh sách bài theo từng chuyên mục.
 * - `BlogDetailPage` (`/blog/:slug`): bài viết kèm dải metadata (tác giả, ngày,
 *   chuyên mục), thẻ tag, nút chia sẻ, bài trước/kế tiếp, mục lục có scroll-spy,
 *   bài liên quan gộp theo chuyên mục và tag, và CTA công cụ.
 */
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Library,
  ListTree,
  Loader2,
  Mail,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { usePost, usePosts, useSiteSettings } from "../../api/hooks";
import { useToast } from "../../components/ui/Toast";
import { POST_CATEGORY_NAMES } from "../../data/defaults/types";
import type { DefaultPost } from "../../data/defaults/types";

const PAGE_SIZE = 9;
const DARK_STYLE = { "--page-dark-bg": "url(/assets/backgrounds/cosmic-dark-clean.webp)" } as CSSProperties;
const LIGHT_STYLE = { "--page-light-bg": "url(/assets/backgrounds/cosmic-light.webp)" } as CSSProperties;
const FALLBACK_COVER = "/assets/blog/blog-pythagoras-calculation.webp";

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function categoryName(slug: string) {
  return POST_CATEGORY_NAMES[slug] ?? slug;
}

/** Trường `author` do CMS trả về nhưng chưa có trong `DefaultPost`; đọc an toàn với mặc định. */
function postAuthor(post: DefaultPost) {
  const value = (post as DefaultPost).author;
  return value && value.trim() ? value : "SGEN Education";
}

function ArticleCard({ post }: { post: DefaultPost }) {
  return (
    <article>
      <img src={post.cover || FALLBACK_COVER} alt="" loading="lazy" />
      <div>
        <small>
          {categoryName(post.categorySlug)} · {formatDate(post.publishedAt)}
        </small>
        <h2>
          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        <p>{post.excerpt}</p>
        {post.tags.length ? (
          <div className="detail-tags">
            {post.tags.slice(0, 2).map((tag) => (
              <Link to={`/blog?q=${encodeURIComponent(tag)}`} key={tag}>
                {tag}
              </Link>
            ))}
          </div>
        ) : null}
        <Link className="button button--ghost" to={`/blog/${post.slug}`}>
          Đọc tiếp <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

/**
 * Mục lục bài viết đặt ngay sau phần mở đầu: desktop mở sẵn để quét nhanh,
 * mobile thu gọn trong `<details>` để không đẩy nội dung xuống dưới màn đầu.
 */
function ArticleOutline({ entries, activeId }: { entries: { id: string; heading: string }[]; activeId: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    setOpen(media.matches);
    const onChange = (event: MediaQueryListEvent) => setOpen(event.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  if (!entries.length) return null;

  return (
    <details className="article-outline" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary>
        <ListTree aria-hidden="true" />
        Mục lục · {entries.length} phần
        <ChevronDown className="article-outline__caret" aria-hidden="true" />
      </summary>
      <nav aria-label="Mục lục bài viết">
        {entries.map((entry) => (
          <a
            href={`#${entry.id}`}
            key={entry.id}
            className={activeId === entry.id ? "is-active" : undefined}
            aria-current={activeId === entry.id ? "true" : undefined}
          >
            {entry.heading} <ArrowRight aria-hidden="true" />
          </a>
        ))}
      </nav>
    </details>
  );
}

export function BlogListPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const [searchDraft, setSearchDraft] = useState(q);

  const query = usePosts({ q: q || undefined, category: category || undefined, page, pageSize: PAGE_SIZE });
  const { isLoading, isFallback } = query;

  const total = isFallback ? query.posts.length : query.total;
  const totalPages = isFallback ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : query.totalPages;
  const visible = isFallback ? query.posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : query.posts;
  const hasFilters = Boolean(q || category);

  const update = (patch: Record<string, string | number>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === "" || value === undefined) next.delete(key);
      else next.set(key, String(value));
    }
    if (patch.page === undefined) next.delete("page");
    setParams(next);
  };

  return (
    <>
      <section className="page-hero catalog-hero catalog-hero--blog" style={DARK_STYLE}>
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <span className="page-kicker">
              <Sparkles aria-hidden="true" /> Blog SGEN
            </span>
            <h1>
              <span className="page-hero__title-line">Blog kiến thức</span>
              <em className="page-hero__title-line">và ứng dụng</em>
            </h1>
            <p>
              Bài viết về Thần số học, ứng dụng thực tiễn, mối quan hệ và phong thủy — viết cho người muốn hiểu nguyên lý trước khi kết luận.
            </p>
            <div className="page-hero__actions"><a className="page-primary" href="#danh-sach-bai-viet">Đọc bài viết <ArrowRight aria-hidden="true" /></a><Link className="action-button action-button--outline" to="/blog/kien-thuc">Thư viện theo chuyên mục</Link></div>
          </div>
        </div>
      </section>

      <section className="page-light-section ux-blog-list catalog-content" id="danh-sach-bai-viet" style={{ "--page-light-bg": "none" } as CSSProperties}>
        <div className="container">
          <div className="catalog-content__heading"><span>Bài viết SGEN</span><h2>Tìm chủ đề bạn quan tâm</h2><p>Lọc theo chuyên mục hoặc tìm một vấn đề cụ thể.</p></div>
          <form
            className="blog-toolbar"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              update({ q: searchDraft.trim() });
            }}
          >
            <label>
              <Search aria-hidden="true" />
              <input
                type="search"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="Tìm bài viết theo tiêu đề hoặc mô tả…"
                aria-label="Tìm bài viết"
              />
            </label>
            <div className="category-row">
              <button type="button" className={category === "" ? "is-active" : ""} onClick={() => update({ category: "" })}>
                Tất cả chuyên mục
              </button>
              {Object.entries(POST_CATEGORY_NAMES).map(([slug, name]) => (
                <button type="button" key={slug} className={category === slug ? "is-active" : ""} onClick={() => update({ category: slug })}>
                  {name}
                </button>
              ))}
            </div>
          </form>

          <p className="blog-count">
            {isLoading ? "Đang tải bài viết…" : `Hiển thị ${visible.length} / ${total} bài viết`}
            {hasFilters ? " sau khi lọc" : ""}
          </p>

          {isLoading && !visible.length ? (
            <p className="admin-loading">
              <Loader2 className="spin" aria-hidden="true" /> Đang tải bài viết…
            </p>
          ) : visible.length ? (
            <div className="blog-page-grid">
              {visible.map((post) => (
                <ArticleCard post={post} key={post.slug} />
              ))}
            </div>
          ) : (
            <div className="empty-search">
              {hasFilters ? <Search aria-hidden="true" /> : <Library aria-hidden="true" />}
              <h2>{hasFilters ? "Không có bài viết nào khớp bộ lọc" : "Chưa có bài viết nào được đăng"}</h2>
              <p>
                {hasFilters
                  ? "Thử từ khóa khác hoặc chọn chuyên mục rộng hơn."
                  : "Nội dung đang được biên tập. Bạn có thể xem thư viện kiến thức hoặc quay lại sau."}
              </p>
              {hasFilters ? (
                <button type="button" className="button button--primary" onClick={() => setParams(new URLSearchParams())}>
                  Xoá bộ lọc
                </button>
              ) : (
                <Link className="page-primary" to="/blog/kien-thuc">
                  Thư viện kiến thức <ArrowRight aria-hidden="true" />
                </Link>
              )}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="category-row" role="navigation" aria-label="Phân trang bài viết">
              <button type="button" className="button button--ghost" disabled={page <= 1} onClick={() => update({ page: page - 1 })}>
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((number) => number === 1 || number === totalPages || Math.abs(number - page) <= 1)
                .map((number) => (
                  <button
                    type="button"
                    key={number}
                    className={`button ${number === page ? "button--primary" : "button--ghost"}`}
                    aria-current={number === page ? "page" : undefined}
                    onClick={() => update({ page: number })}
                  >
                    {number}
                  </button>
                ))}
              <button type="button" className="button button--ghost" disabled={page >= totalPages} onClick={() => update({ page: page + 1 })}>
                Sau
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

/** Mô tả ngắn và công cụ gợi ý cho từng chuyên mục của thư viện kiến thức. */
const CATEGORY_LEADS: Record<string, string> = {
  "kien-thuc": "Nền tảng Thần số học: cách tính chỉ số, ý nghĩa từng con số và nguyên lý đọc một bản đồ số học.",
  "ung-dung": "Biến chỉ số thành hành động: chọn nghề, quản lý thời gian và ra quyết định theo từng năm cá nhân.",
  "moi-quan-he": "Đọc tương hợp giữa các chỉ số để hiểu nhau hơn trong gia đình, tình cảm và công việc.",
  "phong-thuy": "Ứng dụng lịch pháp và ngũ hành: chọn ngày, chọn hướng và sắp xếp không gian sống.",
};

const CATEGORY_TOOLS: Record<string, { label: string; to: string; note: string }> = {
  "kien-thuc": {
    label: "Tra cứu thần số học",
    to: "/tra-cuu/than-so-hoc",
    note: "Nhập họ tên và ngày sinh để xem báo cáo đầy đủ 20 chỉ số và 4 biểu đồ kèm phần luận giải chi tiết.",
  },
  "ung-dung": {
    label: "Trắc nghiệm DISC",
    to: "/tra-cuu/disc",
    note: "Đối chiếu nhóm tính cách DISC với các chỉ số trong bài để chọn hướng phát triển phù hợp.",
  },
  "moi-quan-he": {
    label: "Tra cứu tương hợp",
    to: "/free-tools/kha-nang-ket-noi",
    note: "Đọc chỉ số Tương tác và Nội tâm để hiểu cách bạn và người bên cạnh kết nối với nhau.",
  },
  "phong-thuy": {
    label: "Xem ngày tốt xấu",
    to: "/cong-cu-phong-thuy/xem-ngay",
    note: "Tra Thập nhị Trực, nhị thập bát tú và bảng giờ tốt — xấu trong ngày.",
  },
};

/**
 * Thư viện kiến thức: dải chip chuyên mục cuộn ngang, mỗi chuyên mục là một section
 * gồm bài nổi bật, lưới bài viết và hộp CTA công cụ; cuối trang là khối giới thiệu SGEN.
 */
export function BlogCategoryPage() {
  const query = usePosts({ pageSize: 48 });
  const { posts, isLoading } = query;

  const sections = useMemo(
    () =>
      Object.entries(POST_CATEGORY_NAMES).map(([slug, name]) => {
        const list = posts
          .filter((post) => post.categorySlug === slug)
          .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
        return { slug, name, lead: CATEGORY_LEADS[slug] ?? "", count: list.length, featured: list[0], rest: list.slice(1, 5) };
      }),
    [posts],
  );
  const uncategorised = posts.filter((post) => !(post.categorySlug in POST_CATEGORY_NAMES));
  const visible = sections.filter((section) => section.count > 0);

  return (
    <>
      <section className="page-hero catalog-hero catalog-hero--blog-library" style={DARK_STYLE}>
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <span className="page-kicker">
              <Library aria-hidden="true" /> Thư viện kiến thức
            </span>
            <h1>
              <span className="page-hero__title-line">Toàn bộ bài viết</span>
              <em className="page-hero__title-line">theo chuyên mục</em>
            </h1>
            <p>Bốn chuyên mục xếp theo mạch từ nền tảng tới ứng dụng. Mỗi chuyên mục có bài nổi bật, danh sách bài viết và công cụ để bạn áp dụng ngay.</p>
            <Link className="page-primary" to="/blog">
              Danh sách dạng lưới <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="page-light-section blog-library ux-blog-hub catalog-content" style={{ "--page-light-bg": "none" } as CSSProperties}>
        <div className="container">
          {isLoading && !posts.length ? (
            <p className="admin-loading">
              <Loader2 className="spin" aria-hidden="true" /> Đang tải thư viện…
            </p>
          ) : (
            <>
              <nav className="ref-chips" aria-label="Mục lục chuyên mục">
                {visible.map((section) => (
                  <a href={`#nhom-${section.slug}`} key={section.slug}>
                    {section.name}
                    <small>{section.count} bài</small>
                  </a>
                ))}
                {uncategorised.length ? (
                  <a href="#nhom-khac">
                    Chuyên mục khác
                    <small>{uncategorised.length} bài</small>
                  </a>
                ) : null}
              </nav>

              {posts.length ? (
                <section className="ref-blog-section" aria-labelledby="ref-blog-noi-bat">
                  <header className="ref-blog-section__head">
                    <span>{Math.min(posts.length, 6)} bài mới nhất</span>
                    <h2 id="ref-blog-noi-bat">Bài viết nổi bật</h2>
                    <p>Những bài được cập nhật gần đây trên toàn bộ chuyên mục.</p>
                  </header>
                  <div className="ref-blog-grid">
                    {[...posts]
                      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                      .slice(0, 6)
                      .map((post) => (
                        <article key={`noi-bat-${post.slug}`}>
                          <Link className="ref-blog-grid__cover" to={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
                            <img src={post.cover || FALLBACK_COVER} alt="" loading="lazy" />
                          </Link>
                          <small>
                            {formatDate(post.publishedAt)} · {post.readMinutes} phút đọc
                          </small>
                          <h3>
                            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                          </h3>
                          <p>{post.excerpt}</p>
                          <Link className="ref-blog-grid__more" to={`/blog/${post.slug}`}>
                            Đọc tiếp <ArrowRight aria-hidden="true" />
                          </Link>
                        </article>
                      ))}
                  </div>
                </section>
              ) : null}

              {visible.map((section) => {
                const tool = CATEGORY_TOOLS[section.slug];
                return (
                  <section className="ref-blog-section" id={`nhom-${section.slug}`} key={section.slug} aria-labelledby={`ref-blog-${section.slug}`}>
                    <header className="ref-blog-section__head">
                      <span>{section.count} bài viết</span>
                      <h2 id={`ref-blog-${section.slug}`}>{section.name}</h2>
                      <p>{section.lead}</p>
                    </header>

                    {section.featured ? (
                      <Link className="ref-blog-feature" to={`/blog/${section.featured.slug}`}>
                        <img src={section.featured.cover || FALLBACK_COVER} alt="" loading="lazy" />
                        <div>
                          <small>
                            Bài nổi bật · {formatDate(section.featured.publishedAt)} · {section.featured.readMinutes} phút đọc
                          </small>
                          <h3>{section.featured.title}</h3>
                          <p>{section.featured.excerpt}</p>
                          <span>
                            Đọc bài nổi bật <ArrowRight aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    ) : null}

                    {section.rest.length ? (
                      <div className="ref-blog-grid">
                        {section.rest.map((post) => (
                          <article key={post.slug}>
                            <Link className="ref-blog-grid__cover" to={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
                              <img src={post.cover || FALLBACK_COVER} alt="" loading="lazy" />
                            </Link>
                            <small>
                              {formatDate(post.publishedAt)} · {post.readMinutes} phút đọc
                            </small>
                            <h3>
                              <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                            </h3>
                            <p>{post.excerpt}</p>
                            <Link className="ref-blog-grid__more" to={`/blog/${post.slug}`}>
                              Đọc tiếp <ArrowRight aria-hidden="true" />
                            </Link>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    {tool ? (
                      <div className="ref-blog-cta">
                        <div>
                          <strong>Công cụ tra cứu: {tool.label}</strong>
                          <span>{tool.note}</span>
                        </div>
                        <div className="ref-blog-cta__actions">
                          <Link className="page-primary" to={tool.to}>
                            {tool.label} <ArrowRight aria-hidden="true" />
                          </Link>
                          <Link className="action-button action-button--outline" to={`/blog?category=${section.slug}`}>
                            Xem thêm bài viết về {section.name} <ArrowRight aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </section>
                );
              })}

              {uncategorised.length ? (
                <section className="ref-blog-section" id="nhom-khac" aria-labelledby="ref-blog-khac">
                  <header className="ref-blog-section__head">
                    <span>{uncategorised.length} bài viết</span>
                    <h2 id="ref-blog-khac">Chuyên mục khác</h2>
                    <p>Những bài chưa thuộc bốn chuyên mục chính, vẫn được giữ lại để bạn tra cứu.</p>
                  </header>
                  <div className="ref-blog-grid">
                    {uncategorised.map((post) => (
                      <article key={post.slug}>
                        <Link className="ref-blog-grid__cover" to={`/blog/${post.slug}`} tabIndex={-1} aria-hidden="true">
                          <img src={post.cover || FALLBACK_COVER} alt="" loading="lazy" />
                        </Link>
                        <small>{formatDate(post.publishedAt)}</small>
                        <h3>
                          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>
                        <p>{post.excerpt}</p>
                        <Link className="ref-blog-grid__more" to={`/blog/${post.slug}`}>
                          Đọc tiếp <ArrowRight aria-hidden="true" />
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="ref-about" aria-labelledby="ref-about-heading">
                <div className="ref-about__copy">
                  <span className="page-kicker">
                    <Sparkles aria-hidden="true" /> SGEN Education
                  </span>
                  <h2 id="ref-about-heading">Học Thần số học theo cách dùng được</h2>
                  <p>
                    SGEN Education xây thư viện kiến thức và bộ công cụ tra cứu miễn phí cho người muốn hiểu nguyên lý trước khi kết luận. Mỗi bài viết đều
                    gắn với một công cụ để bạn kiểm chứng trên chính dữ liệu của mình.
                  </p>
                </div>
                <div className="ref-about__links">
                  <Link to="/tra-cuu">
                    Tra cứu miễn phí
                    <small>Tám chỉ số Thần số học, DISC và MBTI</small>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                  <Link to="/khoa-hoc">
                    Khóa học
                    <small>Lộ trình từ căn bản tới luận giải</small>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                  <Link to="/lien-he">
                    Liên hệ
                    <small>Đặt câu hỏi và nhận tư vấn</small>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export function BlogDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { post, related, isLoading, notFound } = usePost(slug);
  const { settings } = useSiteSettings();
  const { posts: allPosts } = usePosts({ pageSize: 50 });
  const toast = useToast();
  const [activeId, setActiveId] = useState("");

  const toc = useMemo(
    () =>
      (post?.content ?? [])
        .map((block, index) => ({ id: `muc-${index + 1}`, heading: block.heading ?? "" }))
        .filter((entry) => entry.heading.length > 0),
    [post],
  );

  const ordered = useMemo(
    () => [...allPosts].sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()),
    [allPosts],
  );
  const currentIndex = post ? ordered.findIndex((item) => item.slug === post.slug) : -1;
  const prevPost = currentIndex > 0 ? ordered[currentIndex - 1] : undefined;
  const nextPost = currentIndex >= 0 && currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : undefined;

  const relatedPosts = useMemo(() => {
    if (!post) return [] as DefaultPost[];
    const merged = new Map<string, DefaultPost>();
    for (const item of related) {
      if (item.slug !== post.slug) merged.set(item.slug, item);
    }
    const postTags = new Set(post.tags);
    for (const item of allPosts) {
      if (merged.size >= 3) break;
      if (item.slug === post.slug) continue;
      if (item.tags.some((tag) => postTags.has(tag))) merged.set(item.slug, item);
    }
    return [...merged.values()].slice(0, 3);
  }, [post, related, allPosts]);

  // Scroll-spy cho mục lục: highlight mục đang trong tầm nhìn, không đổi cấu trúc.
  useEffect(() => {
    if (!toc.length) return;
    const headings = toc
      .map((entry) => document.getElementById(entry.id))
      .filter((element): element is HTMLElement => Boolean(element));
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) setActiveId(first.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] },
    );
    headings.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [toc]);

  if (isLoading && !post) {
    return (
      <section className="page-light-section">
        <div className="container">
          <p className="admin-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải bài viết…
          </p>
        </div>
      </section>
    );
  }

  if (notFound || !post) {
    return (
      <section className="page-light-section" style={LIGHT_STYLE}>
        <div className="container empty-search">
          <AlertTriangle aria-hidden="true" />
          <h2>Không tìm thấy bài viết</h2>
          <p>Bài viết có thể đã được đổi đường dẫn hoặc tạm ẩn. Bạn xem lại danh sách blog để tìm nội dung tương tự.</p>
          <Link className="page-primary" to="/blog">
            <ArrowLeft aria-hidden="true" /> Về trang blog
          </Link>
        </div>
      </section>
    );
  }

  const shareUrl = typeof window === "undefined" ? "" : window.location.href;

  return (
    <section className="article-detail ux-article" style={DARK_STYLE}>
      <div className="container article-detail__shell">
        <Link className="article-back" to="/blog">
          <ArrowLeft aria-hidden="true" /> Tất cả bài viết
        </Link>

        <header>
          <span>{categoryName(post.categorySlug)}</span>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>

          <ArticleOutline entries={toc} activeId={activeId} />

          <div className="detail-meta">
            <span>
              <User aria-hidden="true" /> {postAuthor(post)}
            </span>
            <span>
              <CalendarDays aria-hidden="true" /> {formatDate(post.publishedAt)}
            </span>
            <span>
              <Clock3 aria-hidden="true" /> {post.readMinutes} phút đọc
            </span>
            <Link to={`/blog/kien-thuc?category=${encodeURIComponent(post.categorySlug)}`}>{categoryName(post.categorySlug)}</Link>
            {post.featured ? <span className="status-badge">Bài nổi bật</span> : null}
          </div>

          {post.tags.length ? (
            <div className="detail-tags">
              {post.tags.map((tag) => (
                <Link to={`/blog?q=${encodeURIComponent(tag)}`} key={tag}>
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}

          <div className="detail-actions">
            <div className="detail-share">
              <button
                type="button"
                onClick={async () => {
                  if (!navigator.clipboard) {
                    toast.error("Không thể sao chép", "Hãy sao chép liên kết từ thanh địa chỉ trình duyệt.");
                    return;
                  }
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success("Đã sao chép liên kết", shareUrl);
                  } catch {
                    toast.error("Không thể sao chép", "Hãy sao chép liên kết từ thanh địa chỉ trình duyệt.");
                  }
                }}
              >
                <Copy aria-hidden="true" /> Sao chép liên kết
              </button>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noreferrer"
              >
                <Share2 aria-hidden="true" /> Facebook
              </a>
              <a href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}`}>
                <Mail aria-hidden="true" /> Email
              </a>
            </div>
          </div>
        </header>

        {post.cover ? <img className="article-detail__cover" src={post.cover} alt={post.title} /> : null}

        <div className="article-detail__layout">
          <article className="article-content">
            {post.content.map((block, index) => (
              <section id={`muc-${index + 1}`} key={`${block.heading ?? "phan"}-${index}`}>
                {block.heading ? <h2>{block.heading}</h2> : null}
                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {block.bullets?.length ? (
                  <ul>
                    {block.bullets.map((bullet) => (
                      <li key={bullet}>
                        <CheckCircle2 aria-hidden="true" /> {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </article>

          <aside>
            <div className="article-toc ux-article-tools">
              <span>Công cụ liên quan</span>
              <h2>Áp dụng vào chính bạn</h2>
              <p>Chuyển nội dung vừa đọc thành dữ liệu của riêng bạn bằng các công cụ miễn phí của SGEN.</p>
              <Link to="/tra-cuu/than-so-hoc">
                Tra cứu Thần số học <ArrowRight aria-hidden="true" />
              </Link>
              <Link to="/free-tools">
                Bộ công cụ miễn phí <ArrowRight aria-hidden="true" />
              </Link>
              <Link to="/khoa-hoc">
                Lộ trình khóa học <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>

        <div className="privacy-banner">
          <ShieldCheck aria-hidden="true" />
          <div>
            <strong>Lưu ý về nội dung</strong>
            <span>{settings.legal.disclaimer}</span>
          </div>
        </div>

        {prevPost || nextPost ? (
          <nav className="pager-links" aria-label="Bài viết trước và kế tiếp">
            {prevPost ? (
              <Link to={`/blog/${prevPost.slug}`}>
                <small>
                  <ArrowLeft aria-hidden="true" /> Bài trước
                </small>
                <strong>{prevPost.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link to={`/blog/${nextPost.slug}`}>
                <small>
                  Bài kế tiếp <ArrowRight aria-hidden="true" />
                </small>
                <strong>{nextPost.title}</strong>
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}

        {relatedPosts.length ? (
          <section className="related-posts">
            <header>
              <span>Cùng chuyên mục &amp; thẻ</span>
              <h2>Bài viết liên quan</h2>
            </header>
            <div>
              {relatedPosts.map((item) => (
                <Link to={`/blog/${item.slug}`} key={item.slug}>
                  <img src={item.cover || FALLBACK_COVER} alt="" loading="lazy" />
                  <div>
                    <small>{categoryName(item.categorySlug)}</small>
                    <h3>{item.title}</h3>
                    <span>
                      Đọc bài <ArrowRight aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
