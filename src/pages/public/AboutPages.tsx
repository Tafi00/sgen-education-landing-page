/**
 * Nhóm trang giới thiệu và liên hệ.
 *
 * Bốn trang tĩnh đọc nội dung từ CMS qua `usePage(slug)` và render bằng
 * `BlockRenderer`, nên khi khách hàng sửa block trong CMS thì giao diện đổi theo.
 * Riêng `ContactPage` dựng thêm form gửi lead (`source: "lien-he"`), thông tin
 * liên hệ lấy từ `useSiteSettings()` và bản đồ nhúng theo `contact.mapEmbed`.
 */
import { useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Clock3,
  Info,
  Loader2,
  Mail,
  MapPin,
  Orbit,
  Phone,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { api, errorMessage } from "../../api/client";
import { usePage, useSiteSettings } from "../../api/hooks";
import { BlockRenderer } from "../../components/content/BlockRenderer";
import { FieldShell, TextareaField, TextField } from "../../components/form/Field";
import { useToast } from "../../components/ui/Toast";
import { Button, ButtonAnchor, ButtonLink } from "../../components/ui/Button";
import { CardGrid, FeatureCard, PageHero } from "../../components/ui/Layout";
import { SectionHeading } from "../../components/ui/SectionHeading";

const DARK_STYLE = { "--page-dark-bg": "url(/assets/backgrounds/cosmic-dark-clean.webp)" } as CSSProperties;
const LIGHT_STYLE = { "--page-light-bg": "url(/assets/backgrounds/cosmic-light.webp)" } as CSSProperties;

function ContentPage({ slug, children }: { slug: string; children?: ReactNode }) {
  const { page, isLoading } = usePage(slug);

  if (isLoading && !page) {
    return (
      <section className="page-light-section">
        <div className="container">
          <p className="admin-loading">
            <Loader2 className="spin" aria-hidden="true" /> Đang tải nội dung…
          </p>
        </div>
      </section>
    );
  }

  if (!page) {
    return (
      <section className="page-light-section" style={LIGHT_STYLE}>
        <div className="container empty-search">
          <AlertTriangle aria-hidden="true" />
          <h2>Không tìm thấy trang</h2>
          <p>Trang này chưa được xuất bản hoặc đã đổi đường dẫn. Bạn quay lại trang giới thiệu để tiếp tục.</p>
          <ButtonLink variant="primary" to="/gioi-thieu">
            Về trang giới thiệu
          </ButtonLink>
        </div>
      </section>
    );
  }

  const isSubPage = page.slug.startsWith("gioi-thieu/");

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        eyebrowIcon={Orbit}
        title={page.title}
        accent={page.accent}
        description={page.description}
        before={
          isSubPage ? (
            <nav className="ux-breadcrumb" aria-label="Đường dẫn trang">
              <Link to="/">Trang chủ</Link>
              <span aria-hidden="true">/</span>
              <Link to="/gioi-thieu">Giới thiệu</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{page.title}</span>
            </nav>
          ) : null
        }
      />
      <BlockRenderer blocks={page.blocks} />
      {children}
    </>
  );
}

export function AboutHubPage() {
  return (
    <ContentPage slug="gioi-thieu">
      <section className="page-light-section" style={LIGHT_STYLE}>
        <div className="container">
          <SectionHeading eyebrow="Đi tiếp" title="Bốn hướng tìm hiểu về SGEN" />
          <CardGrid>
            <FeatureCard
              title="Tầm nhìn"
              footer={
                <Link className="card-link" to="/gioi-thieu/tam-nhin">
                  Đọc tầm nhìn <ArrowRight aria-hidden="true" />
                </Link>
              }
            >
              <p>Định hướng dài hạn và cách SGEN đặt công cụ khám phá bản thân vào đúng vị trí.</p>
            </FeatureCard>
            <FeatureCard
              title="Sứ mệnh"
              footer={
                <Link className="card-link" to="/gioi-thieu/su-menh">
                  Đọc sứ mệnh <ArrowRight aria-hidden="true" />
                </Link>
              }
            >
              <p>Vì sao SGEN tồn tại và cách chúng tôi rút ngắn khoảng cách từ hiểu đến hành.</p>
            </FeatureCard>
            <FeatureCard
              title="Giá trị cốt lõi"
              footer={
                <Link className="card-link" to="/gioi-thieu/gia-tri-cot-loi">
                  Đọc giá trị <ArrowRight aria-hidden="true" />
                </Link>
              }
            >
              <p>Những nguyên tắc định hình cách SGEN thiết kế chương trình và tư vấn học viên.</p>
            </FeatureCard>
            <FeatureCard
              title="Liên hệ"
              footer={
                <Link className="card-link" to="/lien-he">
                  Đi tới liên hệ <ArrowRight aria-hidden="true" />
                </Link>
              }
            >
              <p>Gửi câu hỏi về khóa học, dịch vụ tư vấn hoặc hợp tác đào tạo cho đội ngũ SGEN.</p>
            </FeatureCard>
          </CardGrid>
        </div>
      </section>
    </ContentPage>
  );
}

export function AboutVisionPage() {
  return <ContentPage slug="gioi-thieu/tam-nhin" />;
}

export function AboutMissionPage() {
  return <ContentPage slug="gioi-thieu/su-menh" />;
}

export function AboutValuesPage() {
  return <ContentPage slug="gioi-thieu/gia-tri-cot-loi" />;
}

export function ContactPage() {
  const { page } = usePage("lien-he");
  const { settings } = useSiteSettings();
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  // Khối `contactInfo` và `map` trong CMS được thay bằng bản dựng từ settings để
  // tránh trùng lặp; các khối còn lại vẫn render qua BlockRenderer.
  const blocks = (page?.blocks ?? []).filter((block) => block.type !== "contactInfo" && block.type !== "map");
  const mapEmbed = settings.contact.mapEmbed.trim();
  const officeAddress = (settings.contact.officeAddress || settings.contact.address).trim();
  const contactRows = [
    { label: "Hotline", value: settings.contact.phone || settings.brand.hotline, href: `tel:${(settings.contact.phone || settings.brand.hotline).replace(/[^\d+]/g, "")}`, icon: Phone },
    { label: "Điện thoại phụ", value: settings.contact.phoneAlt, href: settings.contact.phoneAlt ? `tel:${settings.contact.phoneAlt.replace(/[^\d+]/g, "")}` : "", icon: Phone },
    { label: "Email", value: settings.contact.email, href: settings.contact.email ? `mailto:${settings.contact.email}` : "", icon: Mail },
    { label: "Trụ sở", value: settings.contact.address, href: "", icon: MapPin },
    { label: "Văn phòng", value: settings.contact.officeAddress, href: "", icon: Building2 },
    { label: "Giờ làm việc", value: settings.contact.workingHours, href: "", icon: Clock3 },
  ].filter((row) => row.value);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 2) {
      setFormError("Vui lòng nhập họ tên (ít nhất 2 ký tự).");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/api/leads", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        message: message.trim(),
        source: "lien-he",
        sourceLabel: "Trang liên hệ",
        company,
        consent,
      });
      toast.success("Đã gửi liên hệ", "SGEN sẽ phản hồi trong giờ làm việc.");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setConsent(false);
      setSent(true);
    } catch (caught) {
      setFormError(errorMessage(caught));
      toast.error("Chưa gửi được liên hệ", errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow={page?.eyebrow ?? "Kết nối với SGEN"}
        eyebrowIcon={Orbit}
        title={page?.title ?? "Liên hệ"}
        accent={page?.accent}
        description={page?.description ?? "Gửi câu hỏi về khóa học, dịch vụ tư vấn hoặc hợp tác đào tạo. Đội ngũ SGEN phản hồi trong giờ làm việc."}
      />

      <section className="page-light-section ux-contact" style={LIGHT_STYLE}>
        <div className="container">
          <SectionHeading eyebrow="Trao đổi với SGEN" title="Gửi câu hỏi cho đội ngũ" description="Điền thông tin bên dưới hoặc liên hệ trực tiếp qua hotline, email trong giờ làm việc." />

          <div className="lookup-workspace__grid">
            <form className="admin-card" onSubmit={submit}>
              <div className="admin-form">
                <div className="admin-form__grid">
                  <TextField
                    label="Họ và tên"
                    required
                    icon={<UserRound aria-hidden="true" />}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                  <TextField
                    label="Số điện thoại"
                    icon={<Phone aria-hidden="true" />}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="09xx xxx xxx"
                  />
                  <TextField
                    label="Email"
                    type="email"
                    wide
                    icon={<Mail aria-hidden="true" />}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="ban@email.com"
                  />
                  <TextareaField
                    label="Nội dung cần hỏi"
                    wide
                    rows={4}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Bạn muốn hỏi về khóa học, dịch vụ hay hợp tác đào tạo?"
                  />
                </div>

                <FieldShell wide>
                  <label className="field__checkbox">
                    <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                    <span>Tôi đồng ý để SGEN Education liên hệ và lưu thông tin phục vụ tư vấn.</span>
                  </label>
                </FieldShell>

                <input
                  className="sr-only"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />

                {formError ? (
                  <p className="admin-error">
                    <AlertTriangle aria-hidden="true" /> {formError}
                  </p>
                ) : null}

                {sent ? (
                  <p className="admin-hint">
                    <ShieldCheck aria-hidden="true" /> SGEN đã nhận thông tin và sẽ liên hệ lại trong giờ làm việc.
                  </p>
                ) : null}

                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
                  {submitting ? "Đang gửi…" : "Gửi liên hệ"}
                </Button>

                <p className="admin-hint">
                  <ShieldCheck aria-hidden="true" /> Thông tin chỉ dùng cho mục đích tư vấn, không chia sẻ cho bên thứ ba.
                </p>
              </div>
            </form>

            <aside className="admin-card contact-card">
              <h2 className="contact-card__title">Thông tin liên hệ</h2>
              <ul className="contact-list">
                {contactRows.map((row) => {
                  const Icon = row.icon;
                  const body = (
                    <>
                      <span className="contact-list__icon">
                        <Icon aria-hidden="true" />
                      </span>
                      <span className="contact-list__text">
                        <small>{row.label}</small>
                        <strong>{row.value}</strong>
                      </span>
                    </>
                  );
                  return (
                    <li key={row.label}>
                      {row.href ? (
                        <a className="contact-list__item" href={row.href}>
                          {body}
                        </a>
                      ) : (
                        <div className="contact-list__item">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="contact-card__company">
                <Info aria-hidden="true" /> {settings.contact.company}
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="page-light-section ux-contact" style={LIGHT_STYLE}>
        <div className="container">
          <SectionHeading eyebrow="Bản đồ" title="Văn phòng SGEN Education" />
          {mapEmbed ? (
            mapEmbed.trim().startsWith("<") ? (
              <div dangerouslySetInnerHTML={{ __html: mapEmbed }} />
            ) : (
              <iframe
                src={mapEmbed}
                title="Bản đồ văn phòng SGEN Education"
                loading="lazy"
                style={{ width: "100%", minHeight: 420, border: 0, borderRadius: 18 }}
              />
            )
          ) : (
            <div className="map-placeholder">
              <MapPin aria-hidden="true" />
              <div>
                <strong>Bản đồ đang được cập nhật</strong>
                {officeAddress ? <p>{officeAddress}</p> : <p>Địa chỉ văn phòng sẽ sớm được cập nhật tại đây.</p>}
                {officeAddress ? (
                  <ButtonAnchor
                    variant="primary"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Chỉ đường <ArrowRight aria-hidden="true" />
                  </ButtonAnchor>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </section>

      {blocks.length ? <BlockRenderer blocks={blocks} /> : null}

      <section className="page-light-section" style={LIGHT_STYLE}>
        <div className="container">
          <SectionHeading eyebrow="Định hướng" title="Tìm hiểu thêm trước khi liên hệ" />
          <CardGrid>
            <FeatureCard
              title="Khóa học"
              footer={
                <Link className="card-link" to="/khoa-hoc">
                  Xem khóa học <ArrowRight aria-hidden="true" />
                </Link>
              }
            >
              <p>Xem 11 chuyên đề theo cấp độ và nhóm chuyên môn để chọn lớp phù hợp.</p>
            </FeatureCard>
            <FeatureCard
              title="Dịch vụ"
              footer={
                <Link className="card-link" to="/dich-vu">
                  Xem dịch vụ <ArrowRight aria-hidden="true" />
                </Link>
              }
            >
              <p>Ba gói đồng hành: VIP Thần số học, trọn đời và định hướng nghề nghiệp.</p>
            </FeatureCard>
            <FeatureCard
              title="Giá trị & sứ mệnh"
              footer={
                <Link className="card-link" to="/gioi-thieu/gia-tri-cot-loi">
                  Đọc giá trị <ArrowRight aria-hidden="true" />
                </Link>
              }
            >
              <p>Cách SGEN làm nghề, giới hạn của công cụ và trách nhiệm với người học.</p>
            </FeatureCard>
          </CardGrid>
        </div>
      </section>
    </>
  );
}
