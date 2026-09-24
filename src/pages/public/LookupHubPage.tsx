import { Link } from "react-router-dom";
import { ArrowRight, Compass, Gift, GraduationCap, Lock, MessageSquareText, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

const TOOLS = [
  {
    number: "01",
    title: "Tra cứu Thần số học",
    href: "/tra-cuu/than-so-hoc",
    description:
      "Nhập họ tên, ngày sinh và tên thường dùng để xem báo cáo đầy đủ 20 chỉ số và 4 biểu đồ theo hệ Pythagoras mà SGEN đang áp dụng.",
    action: "Tra cứu ngay",
  },
  {
    number: "02",
    title: "Trắc nghiệm DISC",
    href: "/tra-cuu/disc",
    description:
      "Mỗi nhóm gồm các mô tả hành vi, bạn chọn một mô tả giống nhất và một mô tả ít giống nhất để xác định nhóm D, I, S, C nổi trội trong công việc.",
    action: "Làm bài DISC",
  },
  {
    number: "03",
    title: "Trắc nghiệm MBTI",
    href: "/tra-cuu/mbti",
    description:
      "Mỗi câu là hai lựa chọn đối lập, kết quả tổng hợp thành mã bốn ký tự theo bốn cặp xu hướng E–I, S–N, T–F, J–P.",
    action: "Làm bài MBTI",
  },
];

const STEPS = ["Chọn công cụ", "Nhập thông tin", "Nhận kết quả", "Lưu & chia sẻ"];

const POLICIES = [
  {
    icon: Gift,
    title: "Miễn phí",
    text: "Tra cứu Thần số học, hai bài trắc nghiệm DISC/MBTI và các công cụ phong thủy đều miễn phí. Bạn không cần tạo tài khoản để xem kết quả cơ bản.",
  },
  {
    icon: Lock,
    title: "Nội dung trả phí",
    text: "Các gói VIP mở khoá phần luận giải chuyên sâu, bản đồ số học dùng trọn đời và buổi tư vấn định hướng cùng chuyên viên SGEN.",
  },
  {
    icon: ShieldCheck,
    title: "Dữ liệu & quyền riêng tư",
    text: "Thông tin chỉ được gửi lên máy chủ khi bạn bấm nút phân tích và đã tích đồng ý. Kết quả lưu tối đa 30 ngày để phục vụ liên kết chia sẻ.",
  },
];

const CTAS = [
  {
    icon: GraduationCap,
    title: "Khóa học định hướng",
    text: "Lộ trình học giúp bạn đọc và vận dụng các chỉ số vào học tập, nghề nghiệp và các mối quan hệ.",
    href: "/khoa-hoc",
    action: "Xem khóa học",
  },
  {
    icon: UsersRound,
    title: "Tư vấn 1:1",
    text: "Trao đổi trực tiếp với chuyên viên SGEN để diễn giải kết quả trong bối cảnh riêng của bạn.",
    href: "/lien-he",
    action: "Liên hệ tư vấn",
  },
  {
    icon: Compass,
    title: "Bộ công cụ phong thủy",
    text: "Bói sim, gieo quẻ Kinh Dịch, Tứ Trụ Bát Tự và xem ngày cho bạn muốn tra cứu thêm.",
    href: "/cong-cu-phong-thuy",
    action: "Khám phá công cụ",
  },
];

/** Trang trung tâm tra cứu: giới thiệu ba công cụ, quy trình bốn bước, chính sách miễn phí/trả phí và CTA liên hệ. */
export function LookupHubPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <span className="page-kicker">
              <Sparkles aria-hidden="true" /> Tra cứu &amp; trắc nghiệm
            </span>
            <h1>
              Hiểu mình hơn bằng <em>dữ liệu có phương pháp</em>
            </h1>
            <p>
              SGEN tổng hợp ba công cụ trong một nơi: tra cứu Thần số học từ họ tên và ngày sinh, trắc nghiệm DISC và MBTI theo khung tham chiếu.
              Mọi kết quả đều kèm phần luận giải dễ hiểu và tuyên bố miễn trừ, giúp bạn có thêm góc nhìn thay vì một lời khuyên tuyệt đối.
            </p>
            <div className="page-hero__actions">
              <Link className="page-primary" to="/tra-cuu/than-so-hoc">
                <Sparkles aria-hidden="true" /> Bắt đầu tra cứu
              </Link>
              <Link className="action-button action-button--outline" to="/lien-he">
                <MessageSquareText aria-hidden="true" /> Cần tư vấn riêng
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-light-section">
        <div className="container">
          <div className="page-section-heading page-section-heading--light">
            <span>Ba công cụ chính</span>
            <h2>Chọn đúng công cụ cho câu hỏi của bạn</h2>
            <p>Mỗi công cụ trả lời một nhóm câu hỏi khác nhau. Bạn có thể làm lần lượt hoặc chỉ chọn phần đang quan tâm.</p>
          </div>
          <div className="service-grid">
            {TOOLS.map((tool) => (
              <article key={tool.href}>
                <span className="service-grid__number">{tool.number}</span>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <Link to={tool.href}>
                  {tool.action} <ArrowRight aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-dark-section" id="quy-trinh">
        <div className="container">
          <div className="page-section-heading">
            <span>Quy trình bốn bước</span>
            <h2>Minh bạch từ lúc nhập liệu tới khi chia sẻ</h2>
            <p>Bạn luôn biết dữ liệu đi tới đâu và kết quả được lưu trong bao lâu.</p>
          </div>
          <div className="lookup-steps">
            {STEPS.map((step, index) => (
              <div className={index === 0 ? "is-active" : ""} key={step}>
                <span>{index + 1}</span>
                <small>{step}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-dark-section">
        <div className="container">
          <div className="page-section-heading">
            <span>Miễn phí và nội dung trả phí</span>
            <h2>Rõ ràng ngay từ đầu</h2>
            <p>Phần lớn nội dung nền tảng miễn phí. Các gói trả phí chỉ mở sâu hơn phần luận giải và tư vấn cá nhân.</p>
          </div>
          <div className="value-grid">
            {POLICIES.map((policy) => {
              const Icon = policy.icon;
              return (
                <article key={policy.title}>
                  <Icon aria-hidden="true" />
                  <h3>{policy.title}</h3>
                  <p>{policy.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="page-dark-section">
        <div className="container">
          <div className="page-section-heading">
            <span>Cần người đồng hành?</span>
            <h2>Đọc kết quả là bước đầu, hành động mới là đích</h2>
            <p>Nếu bạn muốn biến các chỉ số thành kế hoạch cụ thể, SGEN có khóa học và buổi tư vấn định hướng phù hợp với từng nhóm tính cách.</p>
          </div>
          <div className="value-grid">
            {CTAS.map((cta) => {
              const Icon = cta.icon;
              return (
                <article key={cta.href}>
                  <Icon aria-hidden="true" />
                  <h3>{cta.title}</h3>
                  <p>{cta.text}</p>
                  <Link className="action-button action-button--outline" to={cta.href}>
                    {cta.action}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
