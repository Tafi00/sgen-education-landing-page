import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  ChartNoAxesCombined,
  HeartHandshake,
  Loader2,
  Search,
  ShieldCheck,
  Target,
  UserRound,
  VenusAndMars,
} from "lucide-react";
import { api, errorMessage } from "../../api/client";
import type { LookupResultPayload } from "../../../shared/lookup-types";
const cosmicDark = "/assets/backgrounds/cosmic-dark.webp";

import { CustomSelect } from "../ui/CustomSelect";
import { IconOrb } from "../ui/IconOrb";
import { Reveal } from "../ui/Reveal";
import { SectionBadge } from "../ui/SectionBadge";

const trustItems = [
  { icon: ShieldCheck, label: "Bảo mật thông tin" },
  { icon: BookOpenCheck, label: "Luận giải dễ hiểu" },
  { icon: Target, label: "Định hướng thực tiễn" },
];

const benefits = [
  {
    icon: HeartHandshake,
    title: "Hiểu bản thân",
    description: "Thấu hiểu tính cách, tài năng và điểm mạnh tiềm ẩn của chính bạn.",
    href: "/tra-cuu",
  },
  {
    icon: BriefcaseBusiness,
    title: "Chọn đúng nghề",
    description: "Khám phá ngành nghề phù hợp, phát huy tối đa năng lực cá nhân.",
    href: "/dich-vu",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Vững bước tương lai",
    description: "Xây dựng lộ trình sự nghiệp rõ ràng, tự tin chinh phục mục tiêu.",
    href: "/khoa-hoc",
  },
];

const floatingNumbers = ["7", "9", "2", "5", "8", "4", "3", "6"];

export function HeroSection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const birthName = String(formData.get("birthName") ?? "").trim();
    const birthDate = String(formData.get("birthDate") ?? "");
    const commonName = String(formData.get("commonName") ?? "").trim();
    if (birthName.length < 2) {
      setError("Vui lòng nhập họ tên (ít nhất 2 ký tự).");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      setError("Vui lòng chọn ngày sinh.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await api.post<{ report: LookupResultPayload & { id: string; shareToken?: string } }>("/api/lookups/numerology", {
        inputs: {
          name: birthName,
          birthDate,
          commonName: commonName || undefined,
          referenceYear: new Date().getFullYear(),
        },
        save: true,
        source: "/#tra-cuu",
      });
      const url = data.report.shareToken
        ? `/tra-cuu/ket-qua/${data.report.id}?token=${data.report.shareToken}`
        : `/tra-cuu/ket-qua/${data.report.id}`;
      navigate(url);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="top" className="hero" style={{ "--hero-bg": `url(${cosmicDark})` } as React.CSSProperties}>
      <div className="hero__numbers" aria-hidden="true">
        {floatingNumbers.map((number, index) => (
          <span key={`${number}-${index}`} className={`hero__number hero__number--${index + 1}`}>{number}</span>
        ))}
      </div>

      <div className="container hero__main">
        <Reveal className="hero__content" direction="right">
          <SectionBadge dark>Học viện SGEN Education</SectionBadge>
          <h1>Thần số học<br /><span>định hướng sự nghiệp</span></h1>
          <p className="hero__tagline">Hiểu mình sâu sắc. Chọn đúng con đường.</p>
          <p className="hero__description">
            Khám phá tài năng, điểm mạnh và lộ trình nghề nghiệp qua Thần số học Pythagoras.
          </p>
          <div className="hero__actions">
            <a className="hero__action hero__action--primary" href="/tra-cuu">
              <Search aria-hidden="true" />
              <span>Tra cứu miễn phí</span>
            </a>
            <a className="hero__action hero__action--secondary" href="/free-tools">
              <span>Khám phá công cụ</span>
              <ArrowRight aria-hidden="true" />
            </a>
          </div>
          <div className="hero__trust-list">
            {trustItems.map(({ icon: Icon, label }) => (
              <span className="hero__trust-item" key={label}>
                <Icon aria-hidden="true" size={22} />
                {label}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className="lookup-card" direction="left" delay={120}>
          <div className="lookup-card__heading">
            <span><Calculator aria-hidden="true" /></span>
            <div>
              <small>Khám phá bản đồ cá nhân</small>
              <h2>Tra cứu thần số học</h2>
            </div>
          </div>
          <p className="lookup-card__intro">Nhập thông tin để bắt đầu hành trình hiểu mình và chọn đúng hướng đi.</p>

          <form onSubmit={handleSubmit} id="tra-cuu">
            <label className="field-group">
              <span>Họ tên khai sinh</span>
              <span className="field-control">
                <UserRound aria-hidden="true" />
                <input name="birthName" placeholder="Nhập họ tên" required />
              </span>
            </label>

            <label className="field-group">
              <span>Tên thường dùng <em>(nếu có)</em></span>
              <span className="field-control">
                <UserRound aria-hidden="true" />
                <input name="commonName" placeholder="Nhập tên thường dùng" />
              </span>
            </label>

            <div className="field-group">
              <span>Giới tính</span>
              <CustomSelect
                icon={VenusAndMars}
                name="gender"
                placeholder="Chọn giới tính"
                required
                options={[
                  { label: "Nữ", value: "female" },
                  { label: "Nam", value: "male" },
                  { label: "Khác", value: "other" },
                ]}
              />
            </div>

            <label className="field-group">
              <span>Ngày/tháng/năm sinh dương lịch</span>
              <span className="field-control">
                <CalendarDays aria-hidden="true" />
                <input name="birthDate" type="date" required />
              </span>
            </label>

            <div className="lookup-card__options">
              <label><input type="checkbox" /> <span>Xem tương hợp tình duyên, hôn nhân</span></label>
              <label><input type="checkbox" /> <span>Xem cả số điện thoại hợp</span></label>
            </div>

            <button className="lookup-card__submit" type="submit" disabled={loading}>
              <span>{loading ? "Đang phân tích…" : "Tra cứu ngay"}</span>
              {loading ? <Loader2 className="spin" aria-hidden="true" size={19} /> : <Search aria-hidden="true" size={19} />}
            </button>

            {error ? (
              <p className="lookup-card__error" role="alert">
                {error}
              </p>
            ) : null}

            <p className="lookup-card__privacy">
              <ShieldCheck aria-hidden="true" /> Miễn phí tra cứu · Bảo mật thông tin
            </p>
          </form>
        </Reveal>
      </div>

      <div className="hero__benefits-wrap">
        <div className="container hero__benefits">
          {benefits.map(({ icon, title, description, href }, index) => (
            <Reveal as="article" className="benefit-card" delay={index * 90} key={title}>
              <IconOrb icon={icon} size="md" />
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <a href={href} aria-label={`Tìm hiểu ${title}`}><ArrowRight /></a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
