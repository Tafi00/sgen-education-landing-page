import { ArrowRight, BookOpen, Tag } from "lucide-react";
import cosmicLight from "../../../assets/backgrounds/cosmic-light.webp";
import blogArrows from "../../../assets/blog/blog-numerology-arrows.webp";
import blogCalculation from "../../../assets/blog/blog-pythagoras-calculation.webp";
import blogName from "../../../assets/blog/blog-name-numerology.webp";
import blogPyramid from "../../../assets/blog/blog-life-pyramid.webp";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const posts = [
  {
    image: blogCalculation,
    title: "Cách tính Thần số học chuẩn Pythagoras theo tên và ngày sinh",
    description: "Hướng dẫn từng bước để nhận diện các chỉ số quan trọng và hiểu ý nghĩa của chúng.",
    category: "Kiến thức nền tảng",
    className: "blog-card--featured",
  },
  {
    image: blogName,
    title: "Giải mã bảng chữ cái Thần số học",
    description: "Vai trò của tên gọi trong hành trình khám phá bản thân.",
    category: "Kiến thức",
    className: "blog-card--side",
  },
  {
    image: blogPyramid,
    title: "Biểu đồ Kim Tự Tháp và 4 đỉnh cao cuộc đời",
    description: "Nhìn rõ các giai đoạn phát triển và cơ hội chuyển mình.",
    category: "Kiến thức",
    className: "blog-card--side",
  },
  {
    image: blogArrows,
    title: "Ý nghĩa các mũi tên trong Thần số học",
    description: "",
    category: "Kiến thức",
    className: "blog-card--wide",
  },
];

export function BlogSection() {
  return (
    <section
      id="blog"
      className="blog-section section"
      style={{ "--blog-bg": `url(${cosmicLight})` } as React.CSSProperties}
    >
      <div className="container">
        <SectionHeading
          eyebrow="Blog SGEN Education"
          title="Kiến thức thú vị trong thần số học Pythagoras"
          description="Khám phá, hiểu sâu và ứng dụng Thần số học vào cuộc sống mỗi ngày."
          icon={BookOpen}
        />

        <div className="blog-grid">
          {posts.map((post, index) => (
            <Reveal as="article" className={`blog-card ${post.className}`} delay={index * 70} key={post.title}>
              <a className="blog-card__image" href="#blog" aria-label={post.title}>
                <img src={post.image} alt="" loading="lazy" decoding="async" />
              </a>
              <div className="blog-card__content">
                <span><Tag aria-hidden="true" size={14} /> {post.category}</span>
                <h3>{post.title}</h3>
                {post.description ? <p>{post.description}</p> : null}
                <a href="#blog">Đọc bài viết <ArrowRight aria-hidden="true" /></a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="blog-section__more" delay={120}>
          <a href="#blog"><span>Xem thêm bài viết</span><ArrowRight aria-hidden="true" /></a>
        </Reveal>
      </div>
    </section>
  );
}
