import { BriefcaseBusiness, HeartHandshake, Info, Star, Telescope, UserRound } from "lucide-react";
const cosmicLight = "/assets/backgrounds/cosmic-light.webp";
const pythagoras = "/assets/illustrations/pythagoras-cosmic.webp";
import { IconOrb } from "../ui/IconOrb";
import { Reveal } from "../ui/Reveal";
import { SectionBadge } from "../ui/SectionBadge";
import { SparkleButton } from "../ui/GradientButton";

const values = [
  { icon: UserRound, label: "Đào tạo chuyên sâu" },
  { icon: BriefcaseBusiness, label: "Tư vấn ứng dụng" },
  { icon: Star, label: "Đồng hành cá nhân" },
];

export function AboutSection() {
  return (
    <section
      id="gioi-thieu"
      className="about-section section"
      style={{ "--about-bg": `url(${cosmicLight})` } as React.CSSProperties}
    >
      <div className="container about-grid">
        <Reveal className="about-copy" direction="right">
          <SectionBadge icon={Info}>Vài dòng giới thiệu</SectionBadge>
          <h2>Học viện<br /><span>SGEN Education</span></h2>
          <p>
            SGEN Education đào tạo và tư vấn ứng dụng trong Thần số học, Sinh trắc vân tay và các chuyên đề Phong thủy đời sống, giúp học viên hiểu mình, cải thiện lựa chọn và kiến tạo môi trường sống hài hòa.
          </p>

          <div className="about-values">
            {values.map(({ icon, label }, index) => (
              <div key={label} style={{ "--value-delay": `${index * 80}ms` } as React.CSSProperties}>
                <IconOrb icon={icon} size="md" />
                <strong>{label}</strong>
              </div>
            ))}
          </div>

          <SparkleButton href="/gioi-thieu">Tìm hiểu về SGEN</SparkleButton>
        </Reveal>

        <Reveal className="pythagoras-card" direction="left" delay={100}>
          <div className="pythagoras-card__math" aria-hidden="true">
            <span className="pythagoras-card__triangle">△</span>
            <span className="pythagoras-card__formula">a² + b² = c²</span>
            <span className="pythagoras-card__grid">◇</span>
          </div>
          <img src={pythagoras} alt="Minh họa nhà toán học Pythagoras bằng các chòm sao màu tím" loading="lazy" decoding="async" />
          <div className="pythagoras-card__content">
            <h3><Telescope aria-hidden="true" /> Nhà toán học vĩ đại Pythagoras</h3>
            <p>Pythagoras nhận ra mối liên hệ giữa con số, con người và vũ trụ — nền tảng của hệ thống Thần số học phương Tây.</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
