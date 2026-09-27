import { BookOpen, HeartHandshake, ShieldCheck, Target } from "lucide-react";
const cosmicDarkClean = "/assets/backgrounds/cosmic-dark-clean.webp";
import { IconOrb } from "../ui/IconOrb";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const values = [
  {
    number: "01",
    icon: BookOpen,
    title: "Hiểu đúng bản chất",
    description: "Kiến thức được hệ thống hóa để người học hiểu nguyên lý, không phụ thuộc vào phán đoán cảm tính.",
  },
  {
    number: "02",
    icon: Target,
    title: "Ứng dụng thực tiễn",
    description: "Mỗi nội dung đều hướng đến một lựa chọn rõ ràng hơn trong học tập, sự nghiệp và đời sống.",
  },
  {
    number: "03",
    icon: HeartHandshake,
    title: "Đồng hành tử tế",
    description: "Tôn trọng khác biệt cá nhân, bảo mật thông tin và trao quyền tự quyết cho mỗi học viên.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Nói rõ giới hạn",
    description: "Không hứa hẹn kết quả, không khẳng định điều chưa kiểm chứng và luôn nêu rõ phạm vi kết luận.",
  },
];

export function CoreValuesSection() {
  return (
    <section
      id="gia-tri-cot-loi"
      className="values-section section section--dark"
      style={{ "--values-bg": `url(${cosmicDarkClean})` } as React.CSSProperties}
    >
      <div className="container">
        <SectionHeading
          eyebrow="Nguyên tắc làm nghề"
          title="4 Giá trị cốt lõi SGEN luôn giữ vững"
          description="Những nguyên tắc định hình cách SGEN thiết kế chương trình, giảng dạy và tư vấn cho từng học viên."
          icon={HeartHandshake}
          dark
        />

        <div className="values-landing-grid">
          {values.map(({ number, icon, title, description }, index) => (
            <Reveal
              as="article"
              className="values-landing-card"
              delay={index * 90}
              key={number}
            >
              <span className="values-landing-card__number">{number}</span>
              <IconOrb icon={icon} size="md" />
              <h3>{title}</h3>
              <p>{description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
