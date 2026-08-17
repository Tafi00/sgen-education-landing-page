import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  ChartNoAxesCombined,
  HeartHandshake,
  Search,
  ShieldCheck,
  Target,
  UserRound,
  VenusAndMars,
} from "lucide-react";
import cosmicDark from "../../../assets/backgrounds/cosmic-dark.webp";
import { Header } from "../layout/Header";
import { CustomSelect } from "../ui/CustomSelect";
import { IconOrb } from "../ui/IconOrb";
import { Reveal } from "../ui/Reveal";
import { SectionBadge } from "../ui/SectionBadge";

const trustItems = [
  { icon: ShieldCheck, label: "Bảo mật thông tin" },
  { icon: BookOpenCheck, label: "Luận giải dễ hiểu" },
  { icon: Target, label: "Định hướng thực tiễn" },
];

const benefits = [
  {
    icon: HeartHandshake,
    title: "Hiểu bản thân",
    description: "Thấu hiểu tính cách, tài năng và điểm mạnh tiềm ẩn của chính bạn.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Chọn đúng nghề",
    description: "Khám phá ngành nghề phù hợp, phát huy tối đa năng lực cá nhân.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Vững bước tương lai",
    description: "Xây dựng lộ trình sự nghiệp rõ ràng, tự tin chinh phục mục tiêu.",
  },
];

const floatingNumbers = ["7", "9", "2", "5", "8", "4", "3", "6"];

export function HeroSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!new FormData(event.currentTarget).get("gender")) return;
    setSubmitted(true);
  };

  return (
    <section id="top" className="hero" style={{ "--hero-bg": `url(${cosmicDark})` } as React.CSSProperties}>
      <Header />
      <div className="hero__numbers" aria-hidden="true">
        {floatingNumbers.map((number, index) => (
          <span key={`${number}-${index}`} className={`hero__number hero__number--${index + 1}`}>{number}</span>
        ))}
      </div>

      <div className="container hero__main">
        <Reveal className="hero__content" direction="right">
          <SectionBadge dark>Học viện SGEN Education</SectionBadge>
          <h1>Thần số học<br /><span>định hướng sự nghiệp</span></h1>
          <p className="hero__tagline">Hiểu mình sâu sắc. Chọn đúng con đường.</p>
          <p className="hero__description">
            Khám phá tài năng, điểm mạnh và lộ trình nghề nghiệp qua Thần số học Pythagoras.
          </p>
          <div className="hero__trust-list">
            {trustItems.map(({ icon: Icon, label }) => (
              <span className="hero__trust-item" key={label}>
                <Icon aria-hidden="true" size={22} />
                {label}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className="lookup-card" direction="left" delay={120}>
          <div className="lookup-card__heading">
            <Calculator aria-hidden="true" />
            <h2>Tra cứu thần số học</h2>
          </div>

          <form onSubmit={handleSubmit} id="tra-cuu">
            <label className="field-group">
              <span>Họ tên khai sinh</span>
              <span className="field-control">
                <UserRound aria-hidden="true" />
                <input name="birthName" placeholder="Nhập họ tên" required />
              </span>
            </label>

            <label className="field-group">
              <span>Tên thường dùng <em>(nếu có)</em></span>
              <span className="field-control">
                <UserRound aria-hidden="true" />
                <input name="commonName" placeholder="Nhập tên thường dùng" />
              </span>
            </label>

            <div className="field-group">
              <span>Giới tính</span>
              <CustomSelect
                icon={VenusAndMars}
                name="gender"
                placeholder="Chọn giới tính"
                required
                options={[
                  { label: "Nữ", value: "female" },
                  { label: "Nam", value: "male" },
                  { label: "Khác", value: "other" },
                ]}
              />
            </div>

            <label className="field-group">
              <span>Ngày/tháng/năm sinh dương lịch</span>
              <span className="field-control">
                <CalendarDays aria-hidden="true" />
                <input name="birthDate" type="date" required />
              </span>
            </label>

            <div className="lookup-card__options">
              <label><input type="checkbox" /> <span>Xem tương hợp tình duyên, hôn nhân</span></label>
              <label><input type="checkbox" /> <span>Xem cả số điện thoại hợp</span></label>
            </div>

            <button className="lookup-card__submit" type="submit">
              <span>Tra cứu ngay</span>
              <Search aria-hidden="true" size={19} />
            </button>

            <p className={`lookup-card__message ${submitted ? "is-visible" : ""}`} role="status">
              Đã nhận thông tin — báo cáo mẫu của bạn đang được chuẩn bị.
            </p>
          </form>
        </Reveal>
      </div>

      <div className="hero__benefits-wrap">
        <div className="container hero__benefits">
          {benefits.map(({ icon, title, description }, index) => (
            <Reveal as="article" className="benefit-card" delay={index * 90} key={title}>
              <IconOrb icon={icon} size="md" />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <a href="#cong-cu" aria-label={`Tìm hiểu ${title}`}><ArrowRight /></a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
