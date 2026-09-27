import { BookOpen, Compass, Target, Users } from "lucide-react";
const cosmicLight = "/assets/backgrounds/cosmic-light.webp";
import { IconOrb } from "../ui/IconOrb";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const stages = [
  {
    number: "01",
    icon: BookOpen,
    title: "Hiểu nền tảng",
    description: "Nắm quy tắc tính, thuật ngữ và giới hạn của từng hệ thống trước khi diễn giải.",
  },
  {
    number: "02",
    icon: Compass,
    title: "Thực hành có hướng dẫn",
    description: "Làm bài tập trên mẫu thực tế và nhận phản hồi từ giảng viên cùng nhóm học.",
  },
  {
    number: "03",
    icon: Target,
    title: "Ứng dụng cho chính mình",
    description: "Chuyển kết quả phân tích thành một lựa chọn cụ thể trong đời sống hoặc công việc.",
  },
  {
    number: "04",
    icon: Users,
    title: "Đồng hành dài hạn",
    description: "Tham gia cộng đồng học viên để cập nhật phương pháp và trao đổi tình huống mới.",
  },
];

export function MissionSection() {
  return (
    <section
      id="su-menh"
      className="mission-section section"
      style={{ "--mission-bg": `url(${cosmicLight})` } as React.CSSProperties}
    >
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Sứ mệnh đồng hành"
          title="Đồng hành từ hiểu đến hành"
          description="Biến kiến thức phức tạp thành lộ trình học tập dễ hiểu, có thực hành và có cộng đồng đồng hành lâu dài."
        />

        <div className="mission-stages-grid">
          {stages.map(({ number, icon, title, description }, index) => (
            <Reveal
              as="article"
              className="mission-stage-card"
              delay={index * 90}
              key={number}
            >
              <span className="mission-stage-card__number">{number}</span>
              <IconOrb icon={icon} size="md" />
              <h3>{title}</h3>
              <p>{description}</p>
            </Reveal>
          ))}
        </div>

        <Reveal className="mission-quote-box" direction="up" delay={200}>
          <p>
            “SGEN tồn tại để rút ngắn khoảng cách giữa kiến thức và hành động. Mỗi khóa học đều kết thúc bằng một sản phẩm
            cụ thể: một bản đồ cá nhân đã đọc xong, một mặt bằng đã phân tích, một kế hoạch đã có bước đi đầu tiên.”
          </p>
        </Reveal>
      </div>
    </section>
  );
}
