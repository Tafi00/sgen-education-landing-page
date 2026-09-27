import {
  ArrowDown,
  ArrowRight,
  BriefcaseBusiness,
  Compass,
  HeartHandshake,
  MessageSquare,
  Orbit,
  ShieldCheck,
  Star,
  Target,
  UserRound,
} from "lucide-react";
const cosmicDark = "/assets/backgrounds/cosmic-dark.webp";
import { IconOrb } from "../ui/IconOrb";
import { Reveal } from "../ui/Reveal";
import { SectionBadge } from "../ui/SectionBadge";

const trustItems = [
  { icon: ShieldCheck, label: "Chuẩn phương pháp" },
  { icon: Target, label: "Ứng dụng thực tiễn" },
  { icon: HeartHandshake, label: "Đồng hành dài lâu" },
];

const benefits = [
  {
    icon: HeartHandshake,
    title: "Hiểu bản thân",
    description: "Thấu hiểu tính cách, tài năng và điểm mạnh tiềm ẩn của chính bạn.",
    href: "#gioi-thieu",
  },
  {
    icon: BriefcaseBusiness,
    title: "Chọn đúng nghề",
    description: "Khám phá ngành nghề phù hợp, phát huy tối đa năng lực cá nhân.",
    href: "#tam-nhin",
  },
  {
    icon: Star,
    title: "Vững bước tương lai",
    description: "Xây dựng lộ trình sự nghiệp rõ ràng, tự tin chinh phục mục tiêu.",
    href: "#su-menh",
  },
];

const sections = [
  {
    id: "tam-nhin",
    title: "Tầm nhìn giáo dục",
    desc: "Một hệ thống định hướng toàn diện, giáo dục để hiểu và kiểm chứng.",
    icon: Compass,
  },
  {
    id: "su-menh",
    title: "Sứ mệnh đồng hành",
    desc: "Rút ngắn khoảng cách từ hiểu đến hành qua lộ trình thực tiễn 4 bước.",
    icon: Target,
  },
  {
    id: "gia-tri-cot-loi",
    title: "Giá trị cốt lõi",
    desc: "4 nguyên tắc bất biến định hình cách SGEN đào tạo & tư vấn.",
    icon: HeartHandshake,
  },
  {
    id: "lien-he",
    title: "Liên hệ & tư vấn",
    desc: "Kênh trao đổi trực tiếp và nhận tư vấn định hướng miễn phí.",
    icon: MessageSquare,
  },
];

export function HeroSection() {
  const handleScroll = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section id="top" className="hero" style={{ "--hero-bg": `url(${cosmicDark})` } as React.CSSProperties}>

      <div className="container hero__main">
        <Reveal className="hero__content" direction="right">
          <SectionBadge dark icon={Orbit}>
            Học viện SGEN Education
          </SectionBadge>
          <h1>
            Giới thiệu<br />
            <span>SGEN Education</span>
          </h1>
          <p className="hero__tagline">Hiểu mình sâu sắc. Chọn đúng con đường.</p>
          <p className="hero__description">
            SGEN kết nối tri thức phương Tây và tinh hoa phương Đông thành những hệ thống học tập dễ hiểu, có chiều sâu
            và áp dụng được vào đời sống thực tế.
          </p>

          <div className="hero__actions">
            <a
              className="hero__action hero__action--primary"
              href="#tam-nhin"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, "", "#tam-nhin");
                handleScroll("tam-nhin");
              }}
            >
              <span>Khám phá SGEN</span>
              <ArrowDown aria-hidden="true" size={17} />
            </a>
            <a
              className="hero__action hero__action--secondary"
              href="#lien-he"
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, "", "#lien-he");
                handleScroll("lien-he");
              }}
            >
              <span>Liên hệ tư vấn</span>
              <ArrowRight aria-hidden="true" size={17} />
            </a>
          </div>

          <div className="hero__trust-list">
            {trustItems.map(({ icon: Icon, label }) => (
              <span className="hero__trust-item" key={label}>
                <Icon aria-hidden="true" size={20} />
                {label}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className="lookup-card intro-hub-card" direction="left" delay={120}>
          <div className="lookup-card__heading">
            <span>
              <Compass aria-hidden="true" />
            </span>
            <div>
              <small>Hành trình khám phá bản thân</small>
              <h2>Bốn trụ cột tại SGEN</h2>
            </div>
          </div>

          <p className="lookup-card__intro">
            Khám phá hệ thống giáo dục định hướng, sứ mệnh đào tạo và các giá trị cốt lõi của Học viện:
          </p>

          <div className="intro-hub-items">
            {sections.map(({ id, title, desc, icon: Icon }) => (
              <a
                key={id}
                href={`#${id}`}
                className="intro-hub-item"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState(null, "", `#${id}`);
                  handleScroll(id);
                }}
              >
                <span className="intro-hub-item__num">
                  <Icon aria-hidden="true" size={17} />
                </span>
                <div className="intro-hub-item__info">
                  <strong>{title}</strong>
                  <small>{desc}</small>
                </div>
                <ArrowRight className="intro-hub-item__arrow" size={16} aria-hidden="true" />
              </a>
            ))}
          </div>

          <p className="lookup-card__privacy">
            <ShieldCheck aria-hidden="true" /> Tri thức chuẩn hóa · Phương pháp kiểm chứng · Đồng hành tận tâm
          </p>
        </Reveal>
      </div>

      <div className="hero__benefits-wrap">
        <div className="container hero__benefits">
          {benefits.map(({ icon, title, description, href }, index) => (
            <Reveal as="article" className="benefit-card" delay={index * 90} key={title}>
              <IconOrb icon={icon} size="md" />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <a
                href={href}
                aria-label={`Tìm hiểu ${title}`}
                onClick={(e) => {
                  if (href.startsWith("#")) {
                    e.preventDefault();
                    window.history.pushState(null, "", href);
                    handleScroll(href.slice(1));
                  }
                }}
              >
                <ArrowRight />
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
