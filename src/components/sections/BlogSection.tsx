import { ArrowRight, BookOpen, Tag } from "lucide-react";
import cosmicLight from "../../../assets/backgrounds/cosmic-light.webp";
import { blogPosts } from "../../data/blog";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const cardClasses = ["blog-card--featured", "blog-card--side", "blog-card--side", "blog-card--wide"];

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
          {blogPosts.slice(0, 4).map((post, index) => (
            <Reveal as="article" className={`blog-card ${cardClasses[index]}`} delay={index * 70} key={post.slug}>
              <a className="blog-card__image" href={`/blog/${post.slug}`} aria-label={post.title}>
                <img src={post.image} alt="" loading="lazy" decoding="async" />
              </a>
              <div className="blog-card__content">
                <span><Tag aria-hidden="true" size={14} /> {post.category}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <a href={`/blog/${post.slug}`}>Đọc bài viết <ArrowRight aria-hidden="true" /></a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="blog-section__more" delay={120}>
          <a href="/blog"><span>Xem thêm bài viết</span><ArrowRight aria-hidden="true" /></a>
        </Reveal>
      </div>
    </section>
  );
}
