import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, CircleCheck, Hash, Loader2, Phone, Search, ShieldCheck, UserRound } from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { saveEbookDraft } from "../../app/ebookDraft";
import { keepTogether as keep } from "../../app/text";
import { normalizePhone } from "../../../shared/phone";
import type { LookupResultPayload } from "../../../shared/lookup-types";
import { TextField } from "../form/Field";
import { SampleEbook } from "../lookup/SampleEbook";
import { Button } from "../ui/Button";
import { Eyebrow } from "../ui/Eyebrow";
import { Reveal } from "../ui/Reveal";
import { useToast } from "../ui/Toast";
import "../../styles/hero-lookup.css";

const cosmicDark = "/assets/backgrounds/cosmic-dark.webp";
/** Chân dung đã tách nền (AI dựng lại từ ảnh gốc) đặt trên nền vũ trụ riêng, ghép bằng CSS. */
const founderPortrait = "/assets/team/pham-ba-nha-cutout.webp";

const promises = [
  `Đơn vị tiên phong đưa ${keep("Thần số học")} Pythagoras ứng dụng ${keep("định hướng")} ${keep("nghề nghiệp")} về ${keep("Việt Nam")}`,
  `Mỗi bản báo cáo đều được chuyên gia SGEN giải đáp ${keep("chi tiết")}, ${keep("chính xác")}`,
  `Được tham gia 1 buổi học về ${keep("Thần số học")} cùng ${keep("Ths. Phạm Bá Nha")}`,
];

type FieldErrors = { name?: string; birthDate?: string; phone?: string };

export function HeroSection() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const phoneRaw = String(formData.get("phone") ?? "").trim();
    const birthDate = String(formData.get("birthDate") ?? "");
    const nextErrors: FieldErrors = {};
    if (name.length < 2) nextErrors.name = "Vui lòng nhập họ tên (ít nhất 2 ký tự).";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) nextErrors.birthDate = "Vui lòng chọn ngày sinh.";
    // Số điện thoại không bắt buộc ở bước tra cứu, nhưng đã nhập thì phải hợp lệ (bắt buộc khi xuất ebook).
    const phoneResult = phoneRaw ? normalizePhone(phoneRaw) : null;
    if (phoneResult && !phoneResult.ok) nextErrors.phone = phoneResult.message;
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
          phone: phoneResult?.ok ? phoneResult.value : undefined,
          referenceYear: new Date().getFullYear(),
        },
        save: true,
        source: "/",
      });
      saveEbookDraft({ name, birthDate, phone: phoneResult?.ok ? phoneResult.value : "", reportId: data.report.id });
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
              <span>
                <span>CEO &amp; Founder</span>
                <span>{`Học viện ${keep("SGEN Education")}`}</span>
              </span>
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
              <h2 id="hero-lookup-title">{`Tra cứu bản đồ ${keep("Thần số học")} miễn phí`}</h2>
              <p>{`Nhập đúng họ tên khai sinh và ngày sinh ${keep("dương lịch")} để nhận báo cáo ${keep("đầy đủ")}.`}</p>
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
                name="phone"
                label="Số điện thoại"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Nhập số điện thoại"
                icon={<Phone aria-hidden="true" />}
                error={errors.phone}
                onChange={() => errors.phone && setErrors((current) => ({ ...current, phone: undefined }))}
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
              <ShieldCheck aria-hidden="true" />
              <span>Miễn phí tra cứu</span>
              <span>Dữ liệu được bảo mật</span>
              <span>Phân tích theo hệ Pythagoras chuẩn hóa</span>
            </p>
            <SampleEbook className="hero-lookup__sample" />
          </form>
        </Reveal>
      </div>
    </section>
  );
}
