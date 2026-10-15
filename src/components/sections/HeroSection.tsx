import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CircleCheck, Hash, Loader2, Search, ShieldCheck, Tag, UserRound } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import type { LookupResultPayload } from "../../../shared/lookup-types";
import { TextField } from "../form/Field";
import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Eyebrow";
import { Reveal } from "../ui/Reveal";
import { useToast } from "../ui/Toast";
import "../../styles/hero-lookup.css";

const cosmicDark = "/assets/backgrounds/cosmic-dark.webp";
/** Chân dung đã tách nền (AI dựng lại từ ảnh gốc) đặt trên nền vũ trụ riêng, ghép bằng CSS. */
const founderPortrait = "/assets/team/pham-ba-nha-cutout.webp";

const promises = [
  "Đơn vị tiên phong đưa Thần số học Pythagoras ứng dụng định hướng nghề nghiệp về Việt Nam",
  "Mỗi bản báo cáo đều được chuyên gia SGEN giải đáp chi tiết, chính xác",
  "Được tham gia 1 buổi học về Thần số học cùng Ths. Phạm Bá Nha",
];

type FieldErrors = { name?: string; birthDate?: string };

export function HeroSection() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const commonName = String(formData.get("commonName") ?? "").trim();
    const birthDate = String(formData.get("birthDate") ?? "");
    const nextErrors: FieldErrors = {};
    if (name.length < 2) nextErrors.name = "Vui lòng nhập họ tên (ít nhất 2 ký tự).";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) nextErrors.birthDate = "Vui lòng chọn ngày sinh.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      toast.error("Thiếu thông tin", "Vui lòng kiểm tra các ô được đánh dấu rồi thử lại.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.post<{ report: LookupResultPayload & { id: string; shareToken?: string } }>("/api/lookups/numerology", {
        inputs: {
          name,
          birthDate,
          commonName: commonName || undefined,
          referenceYear: new Date().getFullYear(),
        },
        save: true,
        source: "/",
      });
      navigate(
        data.report.shareToken
          ? `/tra-cuu/ket-qua/${data.report.id}?token=${data.report.shareToken}`
          : `/tra-cuu/ket-qua/${data.report.id}`,
      );
    } catch (caught) {
      toast.error("Không thể phân tích", errorMessage(caught));
      setLoading(false);
    }
  };

  return (
    <section id="top" className="hero hero-lookup" style={{ "--hero-bg": `url(${cosmicDark})` } as React.CSSProperties}>
      <div className="container hero-lookup__inner">
        <Reveal className="hero-lookup__portrait" direction="right">
          <figure>
            <div className="hero-lookup__frame">
              <div className="hero-lookup__stage">
                <img
                  src={founderPortrait}
                  alt="Ths. Phạm Bá Nha, CEO & Founder Học viện SGEN Education"
                  width={760}
                  height={1140}
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>
            <figcaption className="hero-lookup__nameplate">
              <strong>Ths. Phạm Bá Nha</strong>
              <span>CEO &amp; Founder Học viện SGEN Education</span>
            </figcaption>
          </figure>
        </Reveal>

        <Reveal className="hero-lookup__heading" direction="left" delay={100}>
          <Eyebrow variant="pill" icon={Hash}>Tra cứu Thần số học</Eyebrow>
          <h1>
            <span className="hero-lookup__kicker">Khám phá bản thân cùng thầy</span>
            <span className="hero-lookup__name">Phạm Bá Nha</span>
          </h1>
        </Reveal>

        <Reveal className="hero-lookup__promises-wrap" direction="left" delay={160}>
          <ul className="hero-lookup__promises">
            {promises.map((promise) => (
              <li key={promise}>
                <CircleCheck aria-hidden="true" size={22} strokeWidth={1.8} />
                <span>{promise}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="hero-lookup__form-wrap" delay={180}>
          <form className="lookup-card hero-lookup__form" onSubmit={handleSubmit} noValidate aria-labelledby="hero-lookup-title">
            <div className="hero-lookup__form-head">
              <h2 id="hero-lookup-title">Tra cứu bản đồ Thần số học miễn phí</h2>
              <p>Nhập đúng họ tên khai sinh và ngày sinh dương lịch để nhận báo cáo đầy đủ.</p>
            </div>
            <div className="hero-lookup__fields">
              <TextField
                name="name"
                label="Họ tên khai sinh"
                required
                autoComplete="name"
                placeholder="Ví dụ: NGUYỄN VĂN A"
                icon={<UserRound aria-hidden="true" />}
                error={errors.name}
                onChange={() => errors.name && setErrors((current) => ({ ...current, name: undefined }))}
              />
              <TextField
                name="commonName"
                label="Tên thường dùng (nếu có)"
                placeholder="Ví dụ: Minh Anh, Anna"
                icon={<Tag aria-hidden="true" />}
              />
              <TextField
                name="birthDate"
                label="Ngày sinh dương lịch"
                type="date"
                required
                icon={<CalendarDays aria-hidden="true" />}
                error={errors.birthDate}
                onChange={() => errors.birthDate && setErrors((current) => ({ ...current, birthDate: undefined }))}
              />
              <Button variant="primary" type="submit" className="lookup-submit hero-lookup__submit" disabled={loading}>
                {loading ? <Loader2 className="spin" aria-hidden="true" /> : <Search aria-hidden="true" />}
                {loading ? "Đang phân tích…" : "Tra cứu ngay"}
              </Button>
            </div>
            <p className="lookup-card__privacy hero-lookup__privacy">
              <ShieldCheck aria-hidden="true" /> Miễn phí tra cứu · Dữ liệu được bảo mật · Phân tích theo hệ Pythagoras chuẩn hóa
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
