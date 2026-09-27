import { Link } from "react-router-dom";
import { Brain, GraduationCap, ListChecks, MessageSquareText, Route, ShieldCheck } from "lucide-react";
import { QuizRunner } from "../../components/lookup/QuizRunner";
import { LookupNavTabs } from "../../components/lookup/LookupNavTabs";
import { ButtonLink } from "../../components/ui/Button";
import { ToolHeader } from "../../components/ui/Layout";
import { SectionHeading } from "../../components/ui/SectionHeading";

const cosmicDarkClean = "/assets/backgrounds/cosmic-dark-clean.webp";

type QuizPageConfig = {
  quizKey: "disc" | "mbti";
  kicker: string;
  title: string;
  accent: string;
  lead: string;
  runnerTitle: string;
  runnerDescription: string;
  groups: { key: string; label: string }[];
  groupsTitle: string;
  methods: { title: string; text: string }[];
};

function QuizPage({ config }: { config: QuizPageConfig }) {
  return (
    <div
      className="quiz-page numerology-lookup-page"
      style={
        {
          "--page-dark-bg": `url(${cosmicDarkClean})`,
          backgroundColor: "#07032e",
          backgroundImage:
            "radial-gradient(circle at 75% 18%, rgba(132, 60, 245, 0.22), transparent 45%), radial-gradient(circle at 25% 45%, rgba(90, 34, 232, 0.18), transparent 40%), var(--page-dark-bg)",
          backgroundPosition: "center top",
          backgroundSize: "cover",
        } as React.CSSProperties
      }
    >
      <div className="container numerology-hero-container">
        <LookupNavTabs activeKey={config.quizKey} />

        <ToolHeader eyebrow={config.kicker} eyebrowIcon={Brain} title={config.title} accent={config.accent} description={config.lead}>
          <p className="tool-header__note">
            <ShieldCheck aria-hidden="true" />
            Bài trắc nghiệm tham chiếu khung {config.quizKey === "disc" ? "DISC" : "MBTI"}, không phải công cụ chẩn đoán tâm lý hay đánh giá năng lực.
          </p>
        </ToolHeader>

        <div className="lookup-workspace" style={{ marginTop: 28 }}>
          <QuizRunner quizKey={config.quizKey} title={config.runnerTitle} description={config.runnerDescription} />
        </div>
      </div>

      <section className="page-light-section">
        <div className="container">
          <SectionHeading eyebrow="Phương pháp &amp; lưu ý" title="Phương pháp và giới hạn cần biết" description="Bài trắc nghiệm dùng khung tham chiếu quốc tế đã được Việt hoá, không hứa hẹn kết quả cố định và không thay thế đánh giá chuyên môn." />

          <div className="process-card">
            <h2>{config.groupsTitle}</h2>
            <div>
              {config.groups.map((group) => (
                <span key={group.key}>
                  <b>{group.key}</b>
                  {group.label}
                </span>
              ))}
            </div>
          </div>

          <div className="service-grid" style={{ marginTop: 28 }}>
            {config.methods.map((method, index) => (
              <article key={method.title}>
                <span className="service-grid__number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{method.title}</h3>
                <p>{method.text}</p>
              </article>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 28 }}>
            <ButtonLink variant="primary" to="/khoa-hoc">
              <GraduationCap aria-hidden="true" /> Xem khóa học liên quan
            </ButtonLink>
            <ButtonLink variant="secondary" to="/lien-he">
              <MessageSquareText aria-hidden="true" /> Đặt tư vấn 1:1
            </ButtonLink>
            <ButtonLink variant="secondary" to="/tra-cuu">
              <Route aria-hidden="true" /> Về trang tra cứu
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}

const DISC_CONFIG: QuizPageConfig = {
  quizKey: "disc",
  kicker: "Trắc nghiệm DISC",
  title: "Nhận diện",
  accent: "phong cách làm việc",
  lead: "DISC mô tả bốn nhóm hành vi quan sát được trong công việc: Thống lĩnh, Ảnh hưởng, Kiên định và Tuân thủ. Bài làm giúp bạn thấy cách mình phản ứng với áp lực, giao tiếp và ra quyết định.",
  runnerTitle: "Bài trắc nghiệm DISC",
  runnerDescription: "Mỗi nhóm câu hỏi gồm các mô tả hành vi. Hãy chọn một mô tả giống bạn nhất và một mô tả ít giống bạn nhất, trả lời nhanh theo cảm nhận thay vì suy nghĩ quá lâu.",
  groupsTitle: "Bốn nhóm hành vi DISC",
  groups: [
    { key: "D", label: "Thống lĩnh — quyết đoán, hướng kết quả" },
    { key: "I", label: "Ảnh hưởng — sôi nổi, truyền cảm hứng" },
    { key: "S", label: "Kiên định — bình tĩnh, giữ nhịp ổn định" },
    { key: "C", label: "Tuân thủ — chính xác, chú trọng chi tiết" },
  ],
  methods: [
    {
      title: "Cách trả lời đúng nhất",
      text: "Chọn đáp án mô tả bạn ở môi trường công việc thường ngày. Không có đáp án đúng sai và không nên chọn theo hình mẫu bạn mong muốn.",
    },
    {
      title: "Cách đọc kết quả",
      text: "Kết quả cho thấy nhóm hành vi nổi trội và nhóm thứ hai. Đây là xu hướng hành vi, có thể thay đổi theo bối cảnh và vai trò.",
    },
    {
      title: "Không dùng để chẩn đoán",
      text: "DISC không phải công cụ chẩn đoán tâm lý hay đánh giá năng lực. Mọi kết luận về con người cần được kiểm chứng bằng quan sát và trải nghiệm thực tế.",
    },
  ],
};

const MBTI_CONFIG: QuizPageConfig = {
  quizKey: "mbti",
  kicker: "Trắc nghiệm MBTI",
  title: "Khám phá",
  accent: "xu hướng tính cách",
  lead: "MBTI mô tả bốn cặp xu hướng: Hướng ngoại – Hướng nội, Giác quan – Trực giác, Lý trí – Cảm xúc, Nguyên tắc – Linh hoạt. Kết quả tổng hợp thành mã bốn ký tự gợi ý cách bạn nạp năng lượng và xử lý thông tin.",
  runnerTitle: "Bài trắc nghiệm MBTI",
  runnerDescription: "Mỗi câu có hai lựa chọn đối lập. Hãy chọn phương án gần với bạn hơn ở phần lớn thời gian, không cần cân nhắc quá lâu cho từng câu.",
  groupsTitle: "Bốn cặp xu hướng MBTI",
  groups: [
    { key: "E–I", label: "Hướng ngoại – Hướng nội: nguồn năng lượng" },
    { key: "S–N", label: "Giác quan – Trực giác: cách tiếp nhận thông tin" },
    { key: "T–F", label: "Lý trí – Cảm xúc: cách ra quyết định" },
    { key: "J–P", label: "Nguyên tắc – Linh hoạt: cách tổ chức cuộc sống" },
  ],
  methods: [
    {
      title: "Trả lời theo con người thật",
      text: "Chọn phương án đúng với bạn trong phần lớn tình huống, không chọn theo kỳ vọng của người khác hay hình mẫu lý tưởng.",
    },
    {
      title: "Kết quả có thể thay đổi",
      text: "Xu hướng tính cách chịu ảnh hưởng của hoàn cảnh và trải nghiệm, nên kết quả có thể khác nhau giữa các giai đoạn cuộc sống.",
    },
    {
      title: "Không dùng để chẩn đoán",
      text: "MBTI không phải công cụ chẩn đoán tâm lý. Kết quả chỉ nên dùng như một khung tham chiếu để hiểu mình và giao tiếp hiệu quả hơn.",
    },
  ],
};

/** Trang trắc nghiệm DISC: giới thiệu phương pháp, làm bài và gợi ý khóa học/tư vấn liên quan. */
export function DiscQuizPage() {
  return <QuizPage config={DISC_CONFIG} />;
}

/** Trang trắc nghiệm MBTI: giới thiệu phương pháp, làm bài và gợi ý khóa học/tư vấn liên quan. */
export function MbtiQuizPage() {
  return <QuizPage config={MBTI_CONFIG} />;
}
