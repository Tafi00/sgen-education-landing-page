import { Building2, ChevronRight, Mail, MapPin } from "lucide-react";
import cosmicDark from "../../../assets/backgrounds/cosmic-dark.webp";
import logoLight from "../../../assets/brand/sgen-logo-light-footer.png";

const footerLinks = [
  { label: "Giới thiệu", href: "#gioi-thieu" },
  { label: "Tra cứu", href: "#tra-cuu" },
  { label: "Dịch vụ", href: "#chuong-trinh" },
  { label: "Khóa học", href: "#chuong-trinh" },
  { label: "Free tools", href: "#cong-cu" },
  { label: "Blog", href: "#blog" },
  { label: "Liên hệ", href: "#tu-van" },
];

export function Footer() {
  return (
    <footer className="site-footer" style={{ "--footer-bg": `url(${cosmicDark})` } as React.CSSProperties}>
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <img src={logoLight} alt="SGEN Education" loading="lazy" decoding="async" />
          <p>Kiến thức chuẩn — Công nghệ mạnh —<br />Tương lai vững chắc.</p>
        </div>

        <div className="site-footer__contact">
          <h2>Công ty TNHH SGEN Education</h2>
          <p><MapPin aria-hidden="true" /> <span>57/27 Đình Tân Khai, P. Bình Trị Đông,<br />Q. Bình Tân, TP.HCM</span></p>
          <p><Building2 aria-hidden="true" /> <span>Văn phòng: 700/2N Tỉnh Lộ 10, P. Bình Trị Đông,<br />Q. Bình Tân, TP.HCM</span></p>
          <p><Mail aria-hidden="true" /> <a href="mailto:sgen.vn@gmail.com">sgen.vn@gmail.com</a></p>
        </div>

        <nav className="site-footer__nav" aria-label="Điều hướng cuối trang">
          {footerLinks.map((link) => (
            <a key={link.label} href={link.href}>{link.label}<ChevronRight aria-hidden="true" /></a>
          ))}
        </nav>
      </div>
      <div className="container site-footer__bottom">
        <p>© {new Date().getFullYear()} SGEN Education. All rights reserved.</p>
      </div>
    </footer>
  );
}
