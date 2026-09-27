import { BookOpen, HeartHandshake, ShieldCheck, Target } from "lucide-react";
const cosmicDarkClean = "/assets/backgrounds/cosmic-dark-clean.webp";
import { IconOrb } from "../ui/IconOrb";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const values = [
  {
    icon: BookOpen,
    title: "Hiểu đúng bản chất",
    description: "Kiến thức được hệ thống hóa để người học hiểu nguyên lý, không phụ thuộc vào phán đoán cảm tính.",
  },
  {
    icon: Target,
    title: "Ứng dụng thực tiễn",
    description: "Mỗi nội dung đều hướng đến một lựa chọn rõ ràng hơn trong học tập, sự nghiệp và đời sống.",
  },
  {
    icon: HeartHandshake,
    title: "Đồng hành tử tế",
    description: "Tôn trọng khác biệt cá nhân, bảo mật thông tin và trao quyền tự quyết cho mỗi học viên.",
  },
  {
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
          align="center"
          eyebrow="Nguyên tắc làm nghề"
          title="4 Giá trị cốt lõi SGEN luôn giữ vững"
          description="Những nguyên tắc định hình cách SGEN thiết kế chương trình, giảng dạy và tư vấn cho từng học viên."
        />

        <div className="values-landing-grid">
          {values.map(({ icon, title, description }, index) => (
            <Reveal
              as="article"
              className="values-landing-card"
              delay={index * 90}
              key={title}
            >
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
