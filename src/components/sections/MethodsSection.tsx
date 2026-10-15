import { BriefcaseBusiness, GraduationCap, MoveRight, Star } from "lucide-react";
const cosmicDarkClean = "/assets/backgrounds/cosmic-dark-clean.webp";
const methodIkigai = "/assets/methods/method-ikigai.webp";
const methodLifePath = "/assets/methods/method-life-path.webp";
const methodPythagoras = "/assets/methods/method-pythagoras.webp";
import { IconOrb } from "../ui/IconOrb";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { keepTogether } from "../../app/text";

const methods = [
  {
    image: methodPythagoras,
    title: "Thần số học Pythagoras",
    description: "Nhận diện tính cách, tài năng, điểm mạnh và những bài học cốt lõi.",
  },
  {
    image: methodIkigai,
    title: "Biểu đồ Ikigai",
    description: "Kết nối điều bạn yêu, điều bạn giỏi và giá trị có thể tạo ra.",
  },
  {
    image: methodLifePath,
    title: "Tiến trình cuộc đời",
    description: "Nhìn rõ các giai đoạn, cơ hội và thời điểm chuyển mình quan trọng.",
  },
];

/** Viên nhãn hẹp: chỉ cho ngắt dòng giữa hai từ ghép, không ngắt giữa một từ. */
const pillars = [
  { icon: GraduationCap, label: `${keepTogether("Định hướng")} ${keepTogether("giáo dục")}` },
  { icon: BriefcaseBusiness, label: `${keepTogether("Định hướng")} ${keepTogether("nghề nghiệp")}` },
  { icon: Star, label: `${keepTogether("Đào tạo")} ${keepTogether("tài năng Việt")}` },
];

export function MethodsSection() {
  return (
    <section
      id="tam-nhin"
      className="methods-section section section--dark"
      style={{ "--methods-bg": `url(${cosmicDarkClean})` } as React.CSSProperties}
    >
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Tầm nhìn & phương pháp"
          title="Một hệ thống định hướng toàn diện"
          description="SGEN hướng tới trở thành tổ chức hàng đầu Việt Nam trong tìm kiếm và đào tạo tài năng, tư vấn định hướng giáo dục và định hướng nghề nghiệp."
        />

        <div className="methods-grid">
          {methods.map((method, index) => (
            <Reveal as="article" className="method-card" delay={index * 100} key={method.title}>
              <img src={method.image} alt="" loading="lazy" decoding="async" />
              <h3>{method.title}</h3>
              <p>{method.description}</p>
            </Reveal>
          ))}
        </div>

        <div className="methods-pillars">
          {pillars.map(({ icon, label }, index) => (
            <Reveal className="pillar-pill" direction="none" delay={index * 90} key={label}>
              <IconOrb icon={icon} size="sm" />
              <span>{label}</span>
              {index < pillars.length - 1 ? <MoveRight className="pillar-pill__sparkle" aria-hidden="true" /> : null}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
