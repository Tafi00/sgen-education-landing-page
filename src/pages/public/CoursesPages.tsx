/**
 * Trang khóa học công khai.
 *
 * - `CoursesListPage` (`/khoa-hoc`): danh sách 11 khóa kèm tìm kiếm, lọc cấp độ,
 *   lọc nhóm, sắp xếp và phân trang. Toàn bộ trạng thái nằm trên URL
 *   (`?q=&level=&category=&sort=&page=`) để chia sẻ và quay lại đều giữ nguyên.
 * - `CourseDetailPage` (`/khoa-hoc/:slug`): chi tiết khóa và form đăng ký tư vấn
 *   gửi lead với `source: "khoa-hoc/<slug>"`.
 */
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Filter,
  GraduationCap,
  Info,
  Layers,
  Loader2,
  Mail,
  MonitorSmartphone,
  Orbit,
  Phone,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { useCourse, useCourses, useSiteSettings } from "../../api/hooks";
import { COURSE_CATEGORY_NAMES, type DefaultCourse } from "../../data/defaults/types";
import { BlockRenderer } from "../../components/content/BlockRenderer";
import { FieldShell, TextareaField, TextField } from "../../components/form/Field";
import { useToast } from "../../components/ui/Toast";
import { Button, ButtonAnchor, ButtonLink, ButtonRow } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";
import { PageHero } from "../../components/ui/Layout";
import { SectionHeading } from "../../components/ui/SectionHeading";

const LEVELS = ["Nền tảng", "Chuyên đề", "Ứng dụng", "Chuyên sâu"];
const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "order", label: "Thứ tự mặc định", field: "order", dir: "asc" },
  { value: "price-asc", label: "Giá tăng dần", field: "price", dir: "asc" },
  { value: "price-desc", label: "Giá giảm dần", field: "price", dir: "desc" },
  { value: "title-asc", label: "Tên A → Z", field: "title", dir: "asc" },
  { value: "newest", label: "Mới cập nhật", field: "createdAt", dir: "desc" },
];

function priceLabel(price: number) {
  return price > 0 ? `${price.toLocaleString("vi-VN")} đ` : "Liên hệ để nhận báo giá";
}

function categoryName(slug: string) {
  return COURSE_CATEGORY_NAMES[slug] ?? slug;
}

/**
 * Nhãn thời lượng của khóa: `durationLabel` đã là câu mô tả (“8 buổi”, “6 tuần”)
 * nên chỉ dùng `sessionCount` khi CMS để trống, tránh lặp “6 buổi · 6 buổi”.
 */
function durationLabel(course: { durationLabel: string; sessionCount: number }) {
  const label = course.durationLabel.trim();
  if (label) return label;
  return course.sessionCount > 0 ? `${course.sessionCount} buổi` : "";
}

/**
 * Popover lọc của trang khóa học: gom toàn bộ lựa chọn vào một nút để dãy chip
 * không chiếm hai hàng trên mobile. Trạng thái lọc vẫn nằm trên URL — component
 * chỉ phát sự kiện áp dụng/xoá.
 */
function CourseFilterPopover({
  q,
  level,
  category,
  onApply,
  onClear,
}: {
  q: string;
  level: string;
  category: string;
  onApply: (patch: Record<string, string>) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const chips = [
    q ? { key: "q", label: `Từ khoá: ${q}` } : null,
    level ? { key: "level", label: `Cấp độ: ${level}` } : null,
    category ? { key: "category", label: `Nhóm: ${categoryName(category)}` } : null,
  ].filter((chip): chip is { key: string; label: string } => chip !== null);

  return (
    <div className="filter-popover course-filters" ref={rootRef}>
      <button
        type="button"
        className={`filter-popover__trigger${chips.length ? " is-active" : ""}`}
        aria-expanded={open}
        aria-controls="course-filter-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <Filter aria-hidden="true" />
        Bộ lọc
        {chips.length ? <span className="filter-popover__count">{chips.length}</span> : null}
      </button>

      {chips.length ? (
        <div className="filter-popover__chips">
          {chips.map((chip) => (
            <button key={chip.key} type="button" onClick={() => onApply({ [chip.key]: "" })}>
              {chip.label}
              <X aria-hidden="true" />
            </button>
          ))}
          <button type="button" className="filter-popover__clear" onClick={onClear}>
            Xoá tất cả
          </button>
        </div>
      ) : null}

      {open ? (
        <div className="filter-popover__panel course-filters__panel" id="course-filter-panel" role="dialog" aria-label="Bộ lọc khóa học">
          <header>
            <strong>Lọc khóa học</strong>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng bộ lọc">
              <X aria-hidden="true" />
            </button>
          </header>
          <div className="filter-popover__fields">
            <label>
              Cấp độ
              <select value={level} onChange={(event) => onApply({ level: event.target.value })}>
                <option value="">Tất cả cấp độ</option>
                {LEVELS.map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Nhóm chuyên môn
              <select value={category} onChange={(event) => onApply({ category: event.target.value })}>
                <option value="">Tất cả nhóm</option>
                {Object.entries(COURSE_CATEGORY_NAMES).map(([slug, name]) => (
                  <option value={slug} key={slug}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <footer>
            <Button variant="secondary" onClick={onClear}>
              Xoá bộ lọc
            </Button>
            <Button variant="primary" onClick={() => setOpen(false)}>
              Xong
            </Button>
          </footer>
        </div>
      ) : null}
    </div>
  );
}

/** Thẻ khóa học dùng chung cho danh sách và khối “cùng nhóm”. */
function CourseCard({ course }: { course: DefaultCourse }) {
  return (
    <article className="course-card">
      <img src={course.coverImage || "/assets/illustrations/pythagoras-cosmic.webp"} alt="" loading="lazy" />
      <div className="course-card__body">
        <div className="course-card__tags">
          <span className="course-card__category">{categoryName(course.categorySlug)}</span>
          <span className="course-card__level">{course.level}</span>
        </div>
        <h3>
          <Link to={`/khoa-hoc/${course.slug}`}>{course.title}</Link>
        </h3>
        <p className="course-card__summary">{course.summary}</p>
        <p className="course-card__meta">{[durationLabel(course), priceLabel(course.price)].filter(Boolean).join(" · ")}</p>
        <ButtonLink variant="soft" size="sm" block className="course-card__cta" to={`/khoa-hoc/${course.slug}`}>
          Xem chi tiết <ArrowRight aria-hidden="true" />
        </ButtonLink>
      </div>
    </article>
  );
}

export function CoursesListPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const level = params.get("level") ?? "";
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "order";
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const [searchDraft, setSearchDraft] = useState(q);

  useEffect(() => {
    setSearchDraft(q);
  }, [q]);

  const activeSort = SORT_OPTIONS.find((option) => option.value === sort) ?? SORT_OPTIONS[0];
  const query = useCourses({
    q: q || undefined,
    level: level || undefined,
    category: category || undefined,
    sort: activeSort.field,
    dir: activeSort.dir,
    page,
    pageSize: PAGE_SIZE,
  });
  const { isLoading, isFallback } = query;

  const sorted = useMemo(() => {
    const list = [...query.courses];
    if (!isFallback) return list;
    if (activeSort.field === "price") list.sort((left, right) => (activeSort.dir === "desc" ? right.price - left.price : left.price - right.price));
    if (activeSort.field === "title") list.sort((left, right) => left.title.localeCompare(right.title, "vi"));
    return list;
  }, [activeSort, isFallback, query.courses]);

  const total = isFallback ? sorted.length : query.total;
  const totalPages = isFallback ? Math.max(1, Math.ceil(total / PAGE_SIZE)) : query.totalPages;
  const visible = isFallback ? sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : query.courses;
  const hasFilters = Boolean(q || level || category || sort !== "order");

  const update = (patch: Record<string, string | number>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === "" || value === "all" || value === undefined) next.delete(key);
      else next.set(key, String(value));
    }
    if (patch.page === undefined) next.delete("page");
    setParams(next);
  };

  return (
    <>
      <PageHero
        eyebrow="Khóa học SGEN"
        eyebrowIcon={GraduationCap}
        title="11 khóa học"
        accent="từ nền tảng đến ứng dụng"
        description="Khám phá Thần số học, Sinh trắc vân tay, Kinh Dịch, Tứ trụ và các chuyên đề phong thủy. Chọn lĩnh vực bạn muốn học để xem nội dung từng khóa."
        actions={<ButtonRow><ButtonAnchor variant="primary" href="#danh-sach-khoa-hoc">Xem danh sách khóa học <ArrowRight aria-hidden="true" /></ButtonAnchor></ButtonRow>}
      />

      <section className="page-light-section ux-course-list catalog-content" id="danh-sach-khoa-hoc" style={{ "--page-light-bg": "none" } as CSSProperties}>
        <div className="container">
          <SectionHeading eyebrow="Danh mục đào tạo" title="Chọn khóa học phù hợp" description="Toàn bộ 11 chuyên đề theo đúng danh mục đào tạo của SGEN." />
          <form
            className="course-toolbar"
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
                placeholder="Tìm theo tên khóa học…"
                aria-label="Tìm khóa học"
              />
            </label>
            <CourseFilterPopover
              q={q}
              level={level}
              category={category}
              onApply={update}
              onClear={() => setParams(new URLSearchParams())}
            />
          </form>

          <div className="blog-toolbar">
            <p className="blog-count">
              {isLoading ? "Đang tải danh sách…" : `Hiển thị ${visible.length} / ${total} khóa học`}
              {hasFilters ? " sau khi lọc" : ""}
            </p>
            <div className="category-row">
              <label className="admin-hint" htmlFor="course-sort">
                Sắp xếp
              </label>
              <select id="course-sort" className="course-sort" value={sort} onChange={(event) => update({ sort: event.target.value })}>
                {SORT_OPTIONS.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading && !visible.length ? (
            <p className="admin-loading">
              <Loader2 className="spin" aria-hidden="true" /> Đang tải danh sách khóa học…
            </p>
          ) : visible.length ? (
            <div className="course-grid">
              {visible.map((course) => (
                <CourseCard course={course} key={course.slug} />
              ))}
            </div>
          ) : (
            <div className="empty-search">
              {hasFilters ? <Search aria-hidden="true" /> : <Layers aria-hidden="true" />}
              <h2>{hasFilters ? "Không có khóa học nào khớp bộ lọc" : "Chưa có dữ liệu khóa học"}</h2>
              <p>
                {hasFilters
                  ? "Thử bỏ từ khóa hoặc chọn lại cấp độ, nhóm chuyên môn khác."
                  : "Danh sách khóa học đang được cập nhật. Vui lòng quay lại sau hoặc liên hệ SGEN để được tư vấn."}
              </p>
              {hasFilters ? (
                <Button variant="primary" onClick={() => setParams(new URLSearchParams())}>
                  Xoá toàn bộ bộ lọc
                </Button>
              ) : (
                <ButtonLink variant="primary" to="/lien-he">
                  Liên hệ tư vấn <ArrowRight aria-hidden="true" />
                </ButtonLink>
              )}
            </div>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={(next) => update({ page: next })} label="Phân trang khóa học" />
        </div>
      </section>
    </>
  );
}

export function CourseDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { course, isLoading, notFound } = useCourse(slug);
  const { settings } = useSiteSettings();
  const relatedQuery = useCourses({ category: course?.categorySlug ?? "__none__" });
  const toast = useToast();
  const heroRef = useRef<HTMLElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!course) return;
    document.title = `${course.title} — Khóa học SGEN Education`;
  }, [course]);

  useEffect(() => {
    const hero = heroRef.current;
    const media = typeof window.matchMedia === "function" ? window.matchMedia("(max-width: 768px)") : null;
    if (!hero || !media || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setStickyVisible(media.matches && !entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(hero);
    const onMediaChange = () => {
      if (!media.matches) setStickyVisible(false);
    };
    media.addEventListener("change", onMediaChange);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", onMediaChange);
    };
  }, [course]);

  // Thanh CTA cố định đáy màn hình che mất phần cuối trang (kể cả chân trang nằm
  // ngoài phạm vi component), nên bù đúng chiều cao thật của thanh vào body và
  // công bố chiều cao đó qua `--sticky-cta-h` cho các lớp CSS khác bù chỗ.
  useEffect(() => {
    if (!stickyVisible) return;
    const height = actionsRef.current?.getBoundingClientRect().height ?? 0;
    if (height <= 0) return;
    const root = document.documentElement;
    const previous = document.body.style.paddingBottom;
    const previousVar = root.style.getPropertyValue("--sticky-cta-h");
    const measured = `${Math.ceil(height)}px`;
    document.body.style.paddingBottom = `${Math.ceil(height) + 12}px`;
    root.style.setProperty("--sticky-cta-h", measured);
    return () => {
      document.body.style.paddingBottom = previous;
      if (previousVar) root.style.setProperty("--sticky-cta-h", previousVar);
      else root.style.removeProperty("--sticky-cta-h");
    };
  }, [stickyVisible]);

  if (isLoading && !course) {
    return (
      <section className="page-light-section">
        <div className="container">
          <p className="admin-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải khóa học…
          </p>
        </div>
      </section>
    );
  }

  if (notFound || !course) {
    return (
      <section className="page-light-section" style={{ "--page-light-bg": "url(/assets/backgrounds/cosmic-light.webp)" } as CSSProperties}>
        <div className="container empty-search">
          <AlertTriangle aria-hidden="true" />
          <h2>Không tìm thấy khóa học</h2>
          <p>Đường dẫn có thể đã thay đổi sau khi SGEN cập nhật danh mục. Bạn xem lại toàn bộ danh sách khóa học để chọn lớp phù hợp.</p>
          <ButtonLink variant="primary" to="/khoa-hoc">
            <ArrowLeft aria-hidden="true" /> Về danh sách khóa học
          </ButtonLink>
        </div>
      </section>
    );
  }

  const content = course.content ?? [];
  const related = relatedQuery.courses.filter((item) => item.slug !== course.slug).slice(0, 3);
  const hotline = settings.brand.hotline.trim();
  const hotlineHref = `tel:${hotline.replace(/[^\d+]/g, "")}`;
  const quickFacts = [
    { icon: <Layers aria-hidden="true" />, label: course.level },
    { icon: <CalendarDays aria-hidden="true" />, label: course.sessionCount ? `${course.sessionCount} buổi` : "" },
    { icon: <Clock aria-hidden="true" />, label: course.durationLabel },
    { icon: <MonitorSmartphone aria-hidden="true" />, label: course.mode },
    { icon: <UserRound aria-hidden="true" />, label: course.teacher },
  ].filter((fact, index, all) => fact.label.trim().length > 0 && all.findIndex((item) => item.label === fact.label) === index);

  // “Học phí & hình thức”: bỏ dòng lặp khi `durationLabel` đã chính là số buổi
  // (“8 buổi” so với “8 buổi học”) — cùng một dữ liệu, chỉ khác hậu tố.
  const seenFact = new Set<string>();
  const courseFacts = [
    durationLabel(course),
    course.sessionCount > 0 ? `${course.sessionCount} buổi học` : "",
    `Cấp độ ${course.level}`,
    `Hình thức: ${course.mode}`,
    course.teacher ? `Giảng viên: ${course.teacher}` : "",
  ].filter((fact) => {
    const key = fact.toLowerCase().replace(/\s*học$/, "").trim();
    if (!key || seenFact.has(key)) return false;
    seenFact.add(key);
    return true;
  });

  const scrollToForm = () => {
    document.getElementById("dang-ky")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Đã sao chép liên kết", "Dán liên kết để chia sẻ khóa học này.");
    } catch {
      toast.error("Chưa sao chép được", "Trình duyệt không cho phép truy cập clipboard.");
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setFormError("Vui lòng nhập họ tên (ít nhất 2 ký tự).");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/api/leads", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        message: note.trim(),
        source: `khoa-hoc/${course.slug}`,
        sourceLabel: course.title,
        payload: { courseSlug: course.slug, courseTitle: course.title },
        company,
        consent,
      });
      toast.success("Đã gửi đăng ký", "SGEN sẽ liên hệ tư vấn trong giờ làm việc.");
      setName("");
      setPhone("");
      setEmail("");
      setNote("");
      setConsent(false);
    } catch (caught) {
      setFormError(errorMessage(caught));
      toast.error("Chưa gửi được đăng ký", errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        ref={heroRef}
        eyebrow={`${categoryName(course.categorySlug)} · ${course.level}`}
        eyebrowIcon={Orbit}
        title={course.title}
        description={course.summary}
        before={
          <Link className="article-back" to="/khoa-hoc">
            <ArrowLeft aria-hidden="true" /> Tất cả khóa học
          </Link>
        }
        actions={
          <ButtonAnchor variant="primary" href="#dang-ky">
            Đăng ký tư vấn <ArrowRight aria-hidden="true" />
          </ButtonAnchor>
        }
      >
        {quickFacts.length ? (
          <div className="detail-meta">
            {quickFacts.map((fact, index) => (
              <span key={`${fact.label}-${index}`}>
                {fact.icon}
                {fact.label}
              </span>
            ))}
          </div>
        ) : null}
      </PageHero>

      <section
        className="page-light-section ux-course-detail"
        style={{ "--page-light-bg": "url(/assets/backgrounds/cosmic-light.webp)" } as CSSProperties}
      >
        <div className="container">
          <div ref={actionsRef} className={`detail-actions${stickyVisible ? " detail-sticky is-visible" : ""}`}>
            {stickyVisible ? (
              <>
                <span className="detail-sticky__price">
                  <strong>{priceLabel(course.price)}</strong>
                  <small>{durationLabel(course) || course.mode}</small>
                </span>
                <div className="detail-sticky__row">
                  <Button variant="primary" className="detail-sticky__cta" onClick={scrollToForm}>
                    <GraduationCap aria-hidden="true" /> Đăng ký tư vấn
                  </Button>
                  {hotline ? (
                    <ButtonAnchor variant="secondary" size="icon" className="detail-sticky__icon" href={hotlineHref} aria-label={`Gọi hotline ${hotline}`}>
                      <Phone aria-hidden="true" />
                    </ButtonAnchor>
                  ) : null}
                  <Button
                    type="button"
                    variant="secondary" size="icon" className="detail-sticky__icon"
                    onClick={copyLink}
                    aria-label="Sao chép liên kết để chia sẻ khóa học"
                  >
                    <Copy aria-hidden="true" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="detail-share">
                <Button variant="primary" onClick={scrollToForm}>
                  <GraduationCap aria-hidden="true" /> Đăng ký tư vấn
                </Button>
                {hotline ? (
                  <ButtonAnchor variant="secondary" href={hotlineHref}>
                    <Phone aria-hidden="true" /> {hotline}
                  </ButtonAnchor>
                ) : null}
                <Button variant="secondary" onClick={copyLink}>
                  <Copy aria-hidden="true" /> Sao chép liên kết
                </Button>
              </div>
            )}
          </div>

          <div className="featured-course">
            <div>
              <span>Học phí & hình thức</span>
              <h2>{priceLabel(course.price)}</h2>
              <p>{course.priceNote}</p>
              <ul>
                {courseFacts.map((fact) => (
                  <li key={fact}>
                    <CheckCircle2 aria-hidden="true" /> {fact}
                  </li>
                ))}
              </ul>
              <a href="#dang-ky">Đăng ký ngay</a>
            </div>
            {course.coverImage ? (
              <img src={course.coverImage} alt={course.title} />
            ) : (
              <div className="empty-search">
                <Layers aria-hidden="true" />
                <p>Khóa học đang được cập nhật ảnh bìa.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {content.length ? <BlockRenderer blocks={content} /> : null}

      <section
        className="page-light-section ux-course-detail"
        style={{ "--page-light-bg": "url(/assets/backgrounds/cosmic-light.webp)" } as CSSProperties}
      >
        <div className="container">
          <SectionHeading eyebrow="Đề cương" title="Nội dung chương trình" />
          <div className="article-list">
            {course.syllabus.map((item, index) => (
              <article key={`${item.title}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{item.title}</h3>
                  {item.details ? <p>{item.details}</p> : null}
                </div>
              </article>
            ))}
          </div>

          <SectionHeading eyebrow="Kết quả" title="Sau khóa học bạn nhận được gì" />
          <div className="article-list">
            {course.outcomes.map((outcome, index) => (
              <article key={`${outcome}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{outcome}</h3>
                </div>
              </article>
            ))}
          </div>

          <SectionHeading eyebrow="Đối tượng" title="Khóa học phù hợp với ai" />
          <div className="article-list">
            {course.forWhom.map((audience, index) => (
              <article key={`${audience}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{audience}</h3>
                </div>
              </article>
            ))}
          </div>

          {course.faqs.length ? (
            <>
              <SectionHeading eyebrow="Giải đáp" title="Câu hỏi thường gặp" />
              <div className="article-list">
                {course.faqs.map((faq, index) => (
                  <article key={`${faq.question}-${index}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{faq.question}</h3>
                      <p>{faq.answer}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : null}

          {related.length ? (
            <>
              <SectionHeading eyebrow="Cùng nhóm" title="Khóa học cùng nhóm" description={<>Những chuyên đề cùng nhóm {categoryName(course.categorySlug)} bạn có thể học tiếp.</>} />
              <div className="course-grid">
                {related.map((item) => (
                  <CourseCard course={item} key={item.slug} />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>

      <section
        className="page-light-section ux-course-detail"
        style={{ "--page-light-bg": "url(/assets/backgrounds/cosmic-light.webp)" } as CSSProperties}
      >
        <div className="container" id="dang-ky">
          <SectionHeading eyebrow="Đăng ký" title="Nhận tư vấn lộ trình học" description="Để lại thông tin, đội ngũ SGEN sẽ liên hệ xác nhận lịch học và học phí trong giờ làm việc." />

          <div className="lookup-workspace__grid">
            <form className="admin-card" onSubmit={submit}>
              <div className="admin-form">
                <div className="admin-form__grid">
                  <TextField
                    label="Họ và tên"
                    required
                    icon={<UserRound aria-hidden="true" />}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                  <TextField
                    label="Số điện thoại"
                    icon={<Phone aria-hidden="true" />}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="09xx xxx xxx"
                  />
                  <TextField
                    label="Email"
                    type="email"
                    wide
                    icon={<Mail aria-hidden="true" />}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="ban@email.com"
                  />
                  <TextareaField
                    label="Bạn muốn SGEN tư vấn điều gì?"
                    wide
                    rows={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={`Ví dụ: tôi muốn học ${course.title} vào buổi tối.`}
                  />
                </div>

                <FieldShell wide>
                  <label className="field__checkbox">
                    <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                    <span>Tôi đồng ý để SGEN Education liên hệ và lưu thông tin phục vụ tư vấn.</span>
                  </label>
                </FieldShell>

                <input
                  className="sr-only"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />

                {formError ? (
                  <p className="admin-error">
                    <AlertTriangle aria-hidden="true" /> {formError}
                  </p>
                ) : null}

                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
                  {submitting ? "Đang gửi…" : "Gửi đăng ký"}
                </Button>

                <p className="admin-hint">
                  <ShieldCheck aria-hidden="true" /> Thông tin chỉ dùng cho mục đích tư vấn, không chia sẻ cho bên thứ ba.
                </p>
              </div>
            </form>

            <aside className="admin-card">
              <div className="admin-panel__head">
                <h2>Trao đổi trực tiếp</h2>
              </div>
              <div className="admin-form">
                <p className="admin-hint">
                  <Info aria-hidden="true" /> Nếu cần trao đổi nhanh, bạn gọi hotline hoặc gửi email, SGEN phản hồi trong giờ làm việc.
                </p>
                <div className="admin-page__actions">
                  <ButtonLink variant="secondary" to="/lien-he">
                    Trang liên hệ <ArrowRight aria-hidden="true" />
                  </ButtonLink>
                  <ButtonLink variant="secondary" to="/khoa-hoc">
                    Xem khóa học khác
                  </ButtonLink>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
