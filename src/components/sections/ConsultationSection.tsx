import { useState, type FormEvent } from "react";
import { AlertCircle, Clock, Loader2 } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import {
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  Headphones,
  Mail,
  MessageSquareText,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
const cosmicLight = "/assets/backgrounds/cosmic-light.webp";
import { IconOrb } from "../ui/IconOrb";
import { Reveal } from "../ui/Reveal";
import { SectionBadge } from "../ui/SectionBadge";

const benefits = [
  {
    icon: UserRoundCheck,
    title: "Tư vấn đúng nhu cầu",
    description: "Phân tích và định hướng lộ trình phù hợp với năng lực và mục tiêu.",
  },
  {
    icon: ShieldCheck,
    title: "Bảo mật thông tin",
    description: "Cam kết bảo mật tuyệt đối thông tin cá nhân của học viên.",
  },
  {
    icon: Headphones,
    title: "Đồng hành cùng chuyên gia",
    description: "Đội ngũ chuyên gia giàu kinh nghiệm luôn sẵn sàng hỗ trợ bạn.",
  },
];

export function ConsultationSection() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSending(true);
    setError("");
    try {
      await api.post("/api/leads", {
        name: String(data.get("name") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
        birthDate: String(data.get("birthDate") ?? ""),
        message: String(data.get("message") ?? ""),
        source: "trang-chu/lien-he",
        sourceLabel: "Form liên hệ trang chủ",
        consent: true,
      });
      form.reset();
      setSent(true);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="lien-he"
      className="consultation-section section"
      style={{ "--consultation-bg": `url(${cosmicLight})` } as React.CSSProperties}
    >
      <div className="container consultation-grid">
        <Reveal className="consultation-copy" direction="right">
          <SectionBadge icon={CalendarCheck}>Liên hệ & Đăng ký tư vấn</SectionBadge>
          <h2><span>Sẵn sàng hôm nay</span><span>Vững bước tương lai</span></h2>
          <div className="consultation-copy__divider"><span><MessageSquareText /></span></div>
          <p>Liên hệ với chúng tôi để được tư vấn và hỗ trợ miễn phí.</p>

          <div className="consultation-benefits">
            {benefits.map(({ icon, title, description }) => (
              <div key={title}>
                <IconOrb icon={icon} size="sm" />
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>

          <a className="consultation-phone" href="tel:0903891839">
            <IconOrb icon={Phone} size="sm" />
            <span>0903.891.839 — 0982.935.131</span>
          </a>
        </Reveal>

        <Reveal className="consultation-form-card" direction="left" delay={100}>
          <h3><MessageSquareText aria-hidden="true" /> Nhận tư vấn miễn phí</h3>
          <p className="consultation-form-card__intro">Để lại thông tin, SGEN sẽ liên hệ và tư vấn lộ trình phù hợp với bạn.</p>
          <form onSubmit={handleSubmit}>
            <label className="consultation-field consultation-field--name">
              <span className="sr-only">Họ và tên</span>
              <UserRound aria-hidden="true" />
              <input name="name" placeholder="Họ và tên" autoComplete="name" required />
            </label>
            <label className="consultation-field">
              <span className="sr-only">Ngày sinh không bắt buộc</span>
              <CalendarDays aria-hidden="true" />
              <input name="birthDate" type="text" placeholder="Ngày sinh (tùy chọn)" onFocus={(event) => { event.currentTarget.type = "date"; }} />
            </label>
            <label className="consultation-field">
              <span className="sr-only">Email</span>
              <Mail aria-hidden="true" />
              <input name="email" type="email" placeholder="Email" autoComplete="email" required />
            </label>
            <label className="consultation-field consultation-field--phone">
              <span className="sr-only">Điện thoại</span>
              <Phone aria-hidden="true" />
              <input name="phone" type="tel" placeholder="Điện thoại" autoComplete="tel" pattern="[0-9+ .-]{9,15}" required />
            </label>
            <label className="consultation-field consultation-field--textarea">
              <span className="sr-only">Nội dung cần tư vấn</span>
              <MessageSquareText aria-hidden="true" />
              <textarea name="message" placeholder="Nội dung" rows={3} />
            </label>
            <button type="submit" className={`consultation-form-card__submit ${sent ? "is-sent" : ""}`} disabled={sending}>
              {sending ? <Loader2 className="spin" aria-hidden="true" /> : sent ? <CheckCircle2 aria-hidden="true" /> : <Send aria-hidden="true" />}
              <span>{sending ? "Đang gửi…" : sent ? "Đã gửi đăng ký" : "Gửi đăng ký"}</span>
            </button>
            <p className={`consultation-form-card__status ${sent ? "is-visible" : ""} ${error ? "is-error" : ""}`} role="status">
              {error ? (
                <>
                  <AlertCircle aria-hidden="true" /> {error}
                </>
              ) : (
                "Cảm ơn bạn! SGEN sẽ liên hệ trong thời gian sớm nhất."
              )}
            </p>
            <p className="consultation-form-card__promise">
              <Clock aria-hidden="true" /> SGEN phản hồi trong 24 giờ làm việc
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
