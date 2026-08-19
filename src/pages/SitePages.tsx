import { useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  HeartHandshake,
  LayoutGrid,
  Lightbulb,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import cosmicDark from "../../assets/backgrounds/cosmic-dark-clean.webp";
import cosmicLight from "../../assets/backgrounds/cosmic-light.webp";
import pythagoras from "../../assets/illustrations/pythagoras-cosmic.webp";
import programFingerprint from "../../assets/programs/program-fingerprint-v2.webp";
import programHome from "../../assets/programs/program-home-feng-shui-v2.webp";
import programNumerology from "../../assets/programs/program-numerology-v2.webp";
import programPhone from "../../assets/programs/program-phone-feng-shui-v2.webp";
import programRelationship from "../../assets/programs/program-relationship-v2.webp";
import programYinHome from "../../assets/programs/program-yin-home-v2.webp";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";
import { ConsultationSection } from "../components/sections/ConsultationSection";
import { ToolsSection } from "../components/sections/ToolsSection";
import { IconOrb } from "../components/ui/IconOrb";
import { ScrollToTop } from "../components/ui/ScrollToTop";
import { blogPosts, type BlogPost } from "../data/blog";
import { calculateNumerologyReport, type NumerologyMetricKey, type NumerologyReport } from "../lib/numerology";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  children?: React.ReactNode;
};

function PageHero({ eyebrow, title, accent, description, children }: PageHeroProps) {
  return (
    <section className="page-hero" style={{ "--page-dark-bg": `url(${cosmicDark})` } as React.CSSProperties}>
      <div className="page-hero__numbers" aria-hidden="true"><span>7</span><span>9</span><span>2</span><span>6</span></div>
      <div className="container page-hero__inner">
        <div className="page-hero__copy">
          <span className="page-kicker"><Sparkles /> {eyebrow}</span>
          <h1>{title}<br /><em>{accent}</em></h1>
          <p>{description}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

function PageFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <main className={`site-page ${className}`}>
      <Header />
      {children}
      <Footer />
      <ScrollToTop />
    </main>
  );
}

const values = [
  { icon: Lightbulb, title: "Hiểu đúng bản chất", text: "Kiến thức được hệ thống hóa để người học hiểu nguyên lý, không phụ thuộc vào phán đoán cảm tính." },
  { icon: Target, title: "Ứng dụng thực tiễn", text: "Mỗi nội dung đều hướng đến một lựa chọn rõ ràng hơn trong học tập, sự nghiệp và đời sống." },
  { icon: HeartHandshake, title: "Đồng hành tử tế", text: "Tôn trọng khác biệt cá nhân, bảo mật thông tin và trao quyền tự quyết cho mỗi học viên." },
];

export function AboutPage() {
  return <PageFrame className="about-page">
    <PageHero
      eyebrow="Về SGEN Education"
      title="Giáo dục số — khai mở"
      accent="trí tuệ, sống chủ đích"
      description="SGEN kết nối tri thức phương Tây và tinh hoa phương Đông thành những hệ thống học tập dễ hiểu, có chiều sâu và áp dụng được vào đời sống."
    >
      <a className="page-primary" href="/khoa-hoc">Xem lộ trình học <ArrowRight /></a>
    </PageHero>

    <section className="page-light-section" id="hanh-trinh" style={{ "--page-light-bg": `url(${cosmicLight})` } as React.CSSProperties}>
      <div className="container story-grid">
        <div className="story-copy">
          <span className="page-kicker page-kicker--light"><BookOpen /> Câu chuyện SGEN</span>
          <h2>Một hệ thống định hướng lấy con người làm trung tâm</h2>
          <p>SGEN Education ra đời với mong muốn biến những hệ thống kiến thức phức tạp thành bản đồ rõ ràng, để mỗi người nhận ra tiềm năng, hiểu bối cảnh và tự tin chọn hướng phát triển phù hợp.</p>
          <p>Chúng tôi không đưa ra một “đáp án số phận”. SGEN cung cấp góc nhìn, công cụ và phương pháp để người học chủ động kiến tạo lựa chọn của mình.</p>
          <div className="story-stats">
            <span><strong>06</strong> chuyên đề ứng dụng</span>
            <span><strong>03</strong> hệ phương pháp cốt lõi</span>
            <span><strong>100%</strong> chú trọng thực hành</span>
          </div>
        </div>
        <div className="story-art">
          <img src={pythagoras} alt="Minh họa Pythagoras trong không gian số học" />
          <div><small>Nền tảng phương pháp</small><strong>Pythagoras · Ikigai · Tiến trình cuộc đời</strong></div>
        </div>
      </div>
    </section>

    <section className="page-dark-section" style={{ "--page-dark-bg": `url(${cosmicDark})` } as React.CSSProperties}>
      <div className="container">
        <header className="page-section-heading"><span>Giá trị cốt lõi</span><h2>Điều SGEN luôn giữ vững</h2></header>
        <div className="value-grid">{values.map(({ icon, title, text }) => <article key={title}><IconOrb icon={icon} size="md" /><h3>{title}</h3><p>{text}</p></article>)}</div>
        <div className="journey-line">
          {["Khám phá bản thân", "Hiểu năng lực", "Chọn hướng phù hợp", "Hành động có chủ đích"].map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>)}
        </div>
      </div>
    </section>
    <ConsultationSection />
  </PageFrame>;
}

export function LookupPage() {
  const [report, setReport] = useState<NumerologyReport | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const requestedMetric = new URLSearchParams(window.location.search).get("metric") as NumerologyMetricKey | null;
  const requestedMetricLabel = report?.metrics.find(metric => metric.key === requestedMetric)?.label;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setReport(calculateNumerologyReport(String(data.get("name") ?? ""), String(data.get("date") ?? "")));
    setSubmitted(true);
    window.setTimeout(() => document.querySelector("#ket-qua")?.scrollIntoView({ behavior: "smooth", block: "start" }), 20);
  };

  return <PageFrame className="lookup-page">
    <section className="lookup-page__hero" style={{ "--page-dark-bg": `url(${cosmicDark})` } as React.CSSProperties}>
      <div className="container lookup-workspace">
        <header>
          <span className="page-kicker"><Sparkles /> Tra cứu thần số học</span>
          <h1>Khám phá bản đồ số học<br /><em>hiểu mình — định hướng đúng</em></h1>
          <div className="lookup-steps" aria-label="Quy trình tra cứu">
            {["Nhập thông tin", "Xác nhận", "Phân tích", "Kết quả"].map((step, index) => <div className={submitted || index === 0 ? "is-active" : ""} key={step}><span>{index + 1}</span><small>{step}</small></div>)}
          </div>
        </header>
        <div className="lookup-workspace__grid">
          <form className="page-form-card" onSubmit={submit}>
            <div><small>Bước 01</small><h2>Thông tin của bạn</h2></div>
            <label><span>Họ và tên khai sinh</span><div><UserRound /><input name="name" placeholder="Nguyễn Minh Anh" required /></div></label>
            <label><span>Ngày sinh dương lịch</span><div><CalendarDays /><input name="date" type="date" required /></div></label>
            <label className="page-check"><input type="checkbox" required /><span>Tôi đồng ý để SGEN xử lý dữ liệu cho phiên tra cứu này.</span></label>
            <button type="submit">Phân tích bản đồ số học <ArrowRight /></button>
            <p><ShieldCheck /> Dữ liệu chỉ được xử lý tại trình duyệt và không tự động gửi đi.</p>
          </form>
          <div className="result-preview" id="ket-qua">
            {!report ? <div className="result-preview__empty"><LayoutGrid /><h2>Kết quả xem trước</h2><p>Biểu đồ và tám chỉ số quan trọng sẽ xuất hiện tại đây sau khi bạn hoàn tất thông tin.</p><div className="mini-grid">{[3, 6, 9, 2, 5, 8, 1, 4, 7].map(n => <span key={n}>{n}</span>)}</div></div> : <>
              <header><div><small>{requestedMetricLabel ? `Chỉ số bạn vừa chọn: ${requestedMetricLabel}` : "Bản đồ số học của"}</small><h2>{report.displayName}</h2><p>{report.birthDateLabel}</p></div><strong>{report.metrics[0].value}</strong></header>
              <div className="report-grid">{report.metrics.map(metric => <article className={metric.key === requestedMetric ? "is-requested" : ""} key={metric.key}><span className={String(metric.value).length > 3 ? "is-wide-value" : ""}>{metric.value}</span><div><strong>{metric.label}</strong><small>{metric.note}</small></div></article>)}</div>
              <p className="report-note"><Sparkles /> Đây là bản tóm tắt định hướng, không thay thế quyết định chuyên môn hoặc tư vấn cá nhân.</p>
            </>}
          </div>
        </div>
        <div className="privacy-banner"><ShieldCheck /><div><strong>Chúng tôi cam kết bảo mật</strong><span>Không bán dữ liệu, không công khai thông tin cá nhân và không lưu nội dung tra cứu khi chưa có sự đồng ý.</span></div></div>
      </div>
    </section>
  </PageFrame>;
}

const services = [
  { icon: UserRound, title: "Tư vấn cá nhân", text: "Đọc bản đồ số học, nhận diện thế mạnh và xây lộ trình phát triển." },
  { icon: HeartHandshake, title: "Tư vấn mối quan hệ", text: "Hiểu khác biệt nhu cầu, cách giao tiếp và điểm hòa hợp." },
  { icon: BriefcaseBusiness, title: "Tư vấn nghề nghiệp", text: "Kết nối năng lực tự nhiên với môi trường và hướng nghề phù hợp." },
  { icon: UsersRound, title: "Tư vấn doanh nghiệp", text: "Thấu hiểu đội ngũ, vai trò và cách phối hợp hiệu quả hơn." },
  { icon: LayoutGrid, title: "Đặt tên theo số học", text: "Phân tích cấu trúc tên và lựa chọn phương án hài hòa mục tiêu." },
  { icon: Compass, title: "Phong thủy ứng dụng", text: "Gợi ý không gian, thời điểm và lựa chọn phù hợp hoàn cảnh." },
];

export function ServicesPage() {
  return <PageFrame className="services-page">
    <PageHero eyebrow="Dịch vụ tư vấn & ứng dụng" title="Đồng hành cùng bạn" accent="trên hành trình chuyển hóa" description="Các dịch vụ tư vấn của SGEN dựa trên dữ liệu cá nhân, phương pháp có cấu trúc và đối thoại sâu để tạo ra bước đi thực tế.">
      <a className="page-primary" href="tel:0903891839">Gọi chuyên gia SGEN <Phone /></a>
    </PageHero>
    <section className="page-light-section" id="dich-vu" style={{ "--page-light-bg": `url(${cosmicLight})` } as React.CSSProperties}>
      <div className="container">
        <header className="page-section-heading page-section-heading--light"><span>Giải pháp theo nhu cầu</span><h2>6 dịch vụ đồng hành chuyên sâu</h2><p>Mỗi gói bắt đầu bằng việc làm rõ nhu cầu, sau đó mới lựa chọn công cụ phân tích phù hợp.</p></header>
        <div className="service-grid">{services.map(({ icon, title, text }, index) => <article key={title}><span className="service-grid__number">{String(index + 1).padStart(2, "0")}</span><IconOrb icon={icon} size="md" /><h3>{title}</h3><p>{text}</p><a href={`mailto:sgen.vn@gmail.com?subject=${encodeURIComponent(`Tư vấn: ${title}`)}`}>Gửi email tư vấn <Mail /></a></article>)}</div>
        <div className="process-card"><h2>Quy trình làm việc rõ ràng</h2><div>{["Tiếp nhận nhu cầu", "Phân tích chuyên sâu", "Tư vấn & đối thoại", "Định hướng hành động"].map((item, index) => <span key={item}><b>{index + 1}</b>{item}</span>)}</div></div>
      </div>
    </section>
    <ConsultationSection />
  </PageFrame>;
}

const courses = [
  { image: programNumerology, title: "Thần số học căn bản", level: "Nền tảng", duration: "8 buổi", text: "Nắm hệ chỉ số cốt lõi và thực hành đọc bản đồ cá nhân.", suitable: "Người mới bắt đầu, phụ huynh và người làm công việc đồng hành.", outcomes: ["Tự tính tám chỉ số nền tảng", "Đọc mối liên hệ giữa tên và ngày sinh", "Thực hành trên bản đồ số học hoàn chỉnh"] },
  { image: programFingerprint, title: "Sinh trắc vân tay ứng dụng", level: "Chuyên đề", duration: "6 buổi", text: "Hiểu nhóm năng lực, cách học và phương pháp đồng hành.", suitable: "Phụ huynh, giáo viên và người làm đào tạo.", outcomes: ["Hiểu các nhóm vân tay", "Nhận diện phong cách tiếp nhận", "Xây gợi ý học tập phù hợp"] },
  { image: programPhone, title: "Phong thủy sim số", level: "Ứng dụng", duration: "4 buổi", text: "Đọc cấu trúc năng lượng và thực hành tư vấn sim số.", suitable: "Người muốn hiểu nguyên tắc đánh giá sim có hệ thống.", outcomes: ["Phân tích cấu trúc dãy số", "Nhận diện điểm cân bằng", "Thực hành đánh giá tình huống"] },
  { image: programRelationship, title: "Tình duyên & hôn nhân", level: "Ứng dụng", duration: "4 buổi", text: "Phân tích tương tác, nhu cầu cảm xúc và cách hòa hợp.", suitable: "Cá nhân, cặp đôi và người làm tham vấn.", outcomes: ["Đọc nhu cầu cốt lõi", "Nhận diện điểm dễ xung đột", "Xây cách giao tiếp phù hợp"] },
  { image: programHome, title: "Phong thủy dương trạch", level: "Chuyên sâu", duration: "10 buổi", text: "Nền tảng công năng, dòng khí và bố trí không gian sống.", suitable: "Người làm thiết kế, bất động sản và chủ nhà.", outcomes: ["Đánh giá công năng cơ bản", "Hiểu dòng khí và phương vị", "Thực hành trên mặt bằng thực tế"] },
  { image: programYinHome, title: "Phong thủy âm trạch", level: "Chuyên sâu", duration: "10 buổi", text: "Kiến thức quy hoạch, đánh giá địa thế và nghi thức phù hợp.", suitable: "Học viên đã có nền tảng phong thủy.", outcomes: ["Đọc địa thế và môi trường", "Hiểu nguyên tắc quy hoạch", "Phân tích tình huống có hướng dẫn"] },
];

export function CoursesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tất cả");
  const [selectedCourse, setSelectedCourse] = useState<(typeof courses)[number] | null>(null);
  const filtered = useMemo(() => courses.filter(course => (filter === "Tất cả" || course.level === filter) && course.title.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))), [filter, query]);
  return <PageFrame className="courses-page">
    <PageHero eyebrow="Giáo dục thực học" title="Học để hiểu — hiểu để sống" accent="chủ động và thịnh vượng" description="Lộ trình từ nền tảng đến ứng dụng, có hướng dẫn thực hành, bài tập tình huống và cộng đồng học tập đồng hành.">
      <button className="page-primary" type="button" onClick={() => setSelectedCourse(courses[0])}>Xem khóa học nổi bật <ArrowRight /></button>
    </PageHero>
    <section className="page-light-section" id="khoa-hoc" style={{ "--page-light-bg": `url(${cosmicLight})` } as React.CSSProperties}>
      <div className="container">
        <div className="course-toolbar"><label><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm khóa học..." /></label><div>{["Tất cả", "Nền tảng", "Ứng dụng", "Chuyên đề", "Chuyên sâu"].map(item => <button className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)} type="button" key={item}>{item}</button>)}</div></div>
        <div className="featured-course"><div><span>Khóa học nổi bật</span><h2>Thần số học căn bản — hiểu mình từ gốc</h2><p>Lộ trình 8 buổi giúp bạn tự tính, đọc và kết nối các chỉ số quan trọng trên một bản đồ số học hoàn chỉnh.</p><ul><li><Check /> Học trực tuyến có tương tác</li><li><Check /> Bài tập thực hành từng buổi</li><li><Check /> Cộng đồng hỗ trợ sau khóa học</li></ul><button type="button" onClick={() => setSelectedCourse(courses[0])}>Xem nội dung khóa học <ArrowRight /></button></div><img src={programNumerology} alt="Khóa học Thần số học căn bản" /></div>
        <header className="page-section-heading page-section-heading--light"><span>Danh mục đào tạo</span><h2>Chọn lộ trình phù hợp với bạn</h2></header>
        <div className="course-grid">{filtered.map(course => <article key={course.title}><img src={course.image} alt="" /><div><span>{course.level} · {course.duration}</span><h3>{course.title}</h3><p>{course.text}</p><button type="button" onClick={() => setSelectedCourse(course)}>Xem nội dung <ChevronRight /></button></div></article>)}</div>
        {!filtered.length && <div className="empty-search"><Search /><h3>Chưa tìm thấy khóa học phù hợp</h3><p>Thử một từ khóa ngắn hơn hoặc chọn lại nhóm nội dung.</p></div>}
      </div>
    </section>
    {selectedCourse && <div className="detail-modal" role="dialog" aria-modal="true" aria-label={`Chi tiết ${selectedCourse.title}`} onClick={() => setSelectedCourse(null)}><article onClick={event => event.stopPropagation()}><button className="detail-modal__close" type="button" onClick={() => setSelectedCourse(null)} aria-label="Đóng chi tiết"><X /></button><div className="detail-modal__hero"><img src={selectedCourse.image} alt="" /><div><span>{selectedCourse.level}</span><h2>{selectedCourse.title}</h2><p><Clock3 /> {selectedCourse.duration}</p></div></div><p>{selectedCourse.text}</p><section><h3>Bạn sẽ đạt được</h3><ul>{selectedCourse.outcomes.map(item => <li key={item}><Check /> {item}</li>)}</ul></section><section><h3>Phù hợp với</h3><p>{selectedCourse.suitable}</p></section><footer><a href={`mailto:sgen.vn@gmail.com?subject=${encodeURIComponent(`Đăng ký khóa học: ${selectedCourse.title}`)}`}><Mail /> Nhận lịch khai giảng</a><a href="tel:0903891839"><Phone /> Gọi 0903.891.839</a></footer></article></div>}
    <ConsultationSection />
  </PageFrame>;
}

export function FreeToolsPage() {
  return <PageFrame className="tools-page">
    <PageHero eyebrow="Kho công cụ SGEN" title="Công cụ tra cứu" accent="miễn phí — nhanh — chính xác" description="Tự khám phá các chỉ số Thần số học và công cụ Phong thủy ứng dụng ngay trên trình duyệt, không cần cài đặt." />
    <div id="thu-vien-cong-cu"><ToolsSection /></div>
    <section className="tool-assurance" style={{ "--page-dark-bg": `url(${cosmicDark})` } as React.CSSProperties}><div className="container"><header className="page-section-heading"><span>Nguyên tắc sử dụng</span><h2>Công cụ để hiểu thêm, không thay bạn quyết định</h2></header><div>{[{icon: ShieldCheck,title:"Bảo mật tại trình duyệt",text:"Phần lớn phép tính được thực hiện ngay trên thiết bị của bạn."},{icon: BookOpen,title:"Có giải thích phương pháp",text:"Kết quả đi kèm quy tắc tính và ngữ cảnh để bạn hiểu đúng."},{icon: MessageSquareText,title:"Có chuyên gia khi cần",text:"Bạn có thể đặt lịch trao đổi khi cần phân tích chuyên sâu."}].map(({icon,title,text}) => { const Icon=icon; return <article key={title}><Icon /><h3>{title}</h3><p>{text}</p></article>;})}</div></div></section>
  </PageFrame>;
}

export function BlogPage() {
  const [category, setCategory] = useState("Tất cả");
  const [query, setQuery] = useState("");
  const visiblePosts = useMemo(() => blogPosts.filter(post => (category === "Tất cả" || post.category === category) && `${post.title} ${post.excerpt}`.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi"))), [category, query]);
  return <PageFrame className="blog-page">
    <PageHero eyebrow="Blog SGEN Education" title="Tri thức — cảm hứng" accent="và ứng dụng mỗi ngày" description="Chia sẻ kiến thức có hệ thống, câu chuyện thực tế và những góc nhìn giúp bạn hiểu mình sâu hơn." />
    <section className="blog-library" style={{ "--page-light-bg": `url(${cosmicLight})` } as React.CSSProperties}><div className="container"><div className="blog-toolbar"><label><Search /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Tìm bài viết..." /></label><div className="category-row">{["Tất cả", "Thần số học", "Ứng dụng", "Mối quan hệ", "Phong thủy"].map(item => <button type="button" className={category === item ? "is-active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></div><p className="blog-count">{visiblePosts.length} bài viết</p><div className="blog-page-grid">{visiblePosts.map(post => <article key={post.slug}><img src={post.image} alt="" /><div><small>{post.category} · {post.date} · {post.readTime}</small><h2>{post.title}</h2><p>{post.excerpt}</p><a href={`/blog/${post.slug}`}>Đọc bài viết <ArrowRight /></a></div></article>)}</div>{!visiblePosts.length && <div className="empty-search"><Search /><h3>Không tìm thấy bài viết</h3><p>Thử từ khóa khác hoặc chọn lại chuyên mục.</p></div>}</div></section>
  </PageFrame>;
}

export function BlogArticlePage({ post }: { post: BlogPost }) {
  const related = blogPosts.filter(item => item.slug !== post.slug && item.category === post.category);
  const fallbackRelated = [...related, ...blogPosts.filter(item => item.slug !== post.slug && !related.includes(item))].slice(0, 2);
  return <PageFrame className="article-page">
    <article className="article-detail" style={{ "--page-dark-bg": `url(${cosmicDark})` } as React.CSSProperties}>
      <div className="container article-detail__shell">
        <a className="article-back" href="/blog"><ArrowLeft /> Tất cả bài viết</a>
        <header><span>{post.category}</span><h1>{post.title}</h1><p>{post.excerpt}</p><div><time>{post.date}</time><i /> <span>{post.readTime}</span></div></header>
        <img className="article-detail__cover" src={post.image} alt={`Minh họa ${post.title}`} />
        <div className="article-detail__layout">
          <div className="article-content">{post.content.map((section, index) => <section key={`${post.slug}-${index}`}>{section.heading && <h2>{section.heading}</h2>}{section.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map(item => <li key={item}><Check /> {item}</li>)}</ul>}</section>)}</div>
          <aside><div><span>Thực hành ngay</span><h2>Biến kiến thức thành trải nghiệm của bạn</h2><p>Tra cứu bản đồ cá nhân hoặc khám phá bộ công cụ miễn phí của SGEN.</p><a href="/tra-cuu">Tra cứu cá nhân <ArrowRight /></a><a href="/free-tools">Mở free tools <ArrowRight /></a></div></aside>
        </div>
        <section className="related-posts"><header><span>Đọc tiếp</span><h2>Bài viết liên quan</h2></header><div>{fallbackRelated.map(item => <a href={`/blog/${item.slug}`} key={item.slug}><img src={item.image} alt="" /><div><small>{item.category} · {item.readTime}</small><h3>{item.title}</h3><span>Đọc bài viết <ArrowRight /></span></div></a>)}</div></section>
      </div>
    </article>
  </PageFrame>;
}

export const routePages: Record<string, () => React.JSX.Element> = {
  "/gioi-thieu": AboutPage,
  "/tra-cuu": LookupPage,
  "/dich-vu": ServicesPage,
  "/khoa-hoc": CoursesPage,
  "/free-tools": FreeToolsPage,
  "/blog": BlogPage,
};
