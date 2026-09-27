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
import { Eyebrow } from "../ui/Eyebrow";
import { Button } from "../ui/Button";
import { TextareaField, TextField } from "../form/Field";

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
          <Eyebrow variant="pill" icon={CalendarCheck}>Liên hệ & Đăng ký tư vấn</Eyebrow>
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
          <form className="form-grid" onSubmit={handleSubmit}>
            <TextField label="Họ và tên" name="name" autoComplete="name" required icon={<UserRound aria-hidden="true" />} placeholder="Nguyễn Văn A" />
            <TextField label="Ngày sinh (không bắt buộc)" name="birthDate" type="date" icon={<CalendarDays aria-hidden="true" />} />
            <TextField label="Email" name="email" type="email" autoComplete="email" required icon={<Mail aria-hidden="true" />} placeholder="ban@email.com" />
            <TextField
              label="Điện thoại"
              name="phone"
              type="tel"
              autoComplete="tel"
              pattern="[0-9+ .-]{9,15}"
              required
              icon={<Phone aria-hidden="true" />}
              placeholder="09xx xxx xxx"
            />
            <TextareaField label="Nội dung cần tư vấn" name="message" rows={4} wide placeholder="Bạn muốn tìm hiểu khóa học hay dịch vụ nào?" />
            <Button variant="primary" type="submit" block className="form-grid__wide" disabled={sending}>
              {sending ? <Loader2 className="spin" aria-hidden="true" /> : sent ? <CheckCircle2 aria-hidden="true" /> : <Send aria-hidden="true" />}
              {sending ? "Đang gửi…" : sent ? "Đã gửi đăng ký" : "Gửi đăng ký"}
            </Button>
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
