import { ArrowRight } from "lucide-react";
const cosmicLight = "/assets/backgrounds/cosmic-light.webp";
const programFingerprint = "/assets/programs/program-fingerprint-v2.webp";
const programHome = "/assets/programs/program-home-feng-shui-v2.webp";
const programNumerology = "/assets/programs/program-numerology-v2.webp";
const programPhone = "/assets/programs/program-phone-feng-shui-v2.webp";
const programRelationship = "/assets/programs/program-relationship-v2.webp";
const programYinHome = "/assets/programs/program-yin-home-v2.webp";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { ButtonLink } from "../ui/Button";

const programs = [
  { image: programNumerology, title: "Thần số học", description: "Khám phá bản thân, các chỉ số và bản đồ cuộc đời." },
  { image: programFingerprint, title: "Sinh trắc vân tay", description: "Nhận diện tiềm năng và phong cách học tập nổi trội." },
  { image: programPhone, title: "Phong thủy sim số điện thoại", description: "Đánh giá năng lượng và lựa chọn sim phù hợp." },
  { image: programRelationship, title: "Phong thủy tình duyên, hôn nhân", description: "Thấu hiểu tương hợp và vun bồi mối quan hệ." },
  { image: programHome, title: "Phong thủy dương trạch nhà cửa", description: "Tối ưu không gian sống, công năng và dòng khí." },
  { image: programYinHome, title: "Phong thủy âm trạch mộ phần", description: "Tư vấn quy hoạch hài hòa, trang nghiêm và phù hợp." },
];

export function ProgramsSection() {
  return (
    <section
      id="chuong-trinh"
      className="programs-section section"
      style={{ "--programs-bg": `url(${cosmicLight})` } as React.CSSProperties}
    >
      <div className="container">
        <SectionHeading
          eyebrow="Chương trình đào tạo & tư vấn"
          title="6 chuyên đề ứng dụng cùng SGEN"
          description="Kiến thức hệ thống, hướng dẫn thực hành và giải pháp phù hợp cho từng nhu cầu."
          align="left"
        />

        <div className="programs-grid">
          {programs.map((program, index) => (
            <Reveal as="article" className="program-card" delay={(index % 3) * 80} key={program.title}>
              <div className="program-card__image">
                <img src={program.image} alt={`Minh họa ${program.title}`} loading="lazy" decoding="async" />
              </div>
              <div className="program-card__body">
                <h3>{program.title}</h3>
                <p>{program.description}</p>
                <a href="/khoa-hoc">Xem khóa học <ArrowRight aria-hidden="true" /></a>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="programs-section__cta" delay={120}>
          <ButtonLink variant="primary" to="/khoa-hoc">
            Xem tất cả 11 khóa học <ArrowRight aria-hidden="true" />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
