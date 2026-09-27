import { Link } from "react-router-dom";
import { ChevronRight, Clock3, Globe, Mail, MapPin } from "lucide-react";
import { FOOTER_NAV } from "../../app/nav";
import { useSiteSettings } from "../../api/hooks";

export function SiteFooter() {
  const { settings } = useSiteSettings();
  const half = Math.ceil(FOOTER_NAV.length / 2);

  return (
    <footer className="site-footer" style={{ "--footer-bg": `url(/assets/backgrounds/cosmic-dark.webp)` } as React.CSSProperties}>
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <img src={settings.brand.logoLight} alt={settings.brand.name} decoding="async" />
          <p>{settings.brand.tagline}</p>
          {settings.socials.facebook ? (
            <div className="site-footer__social">
              <a href={settings.socials.facebook} target="_blank" rel="noreferrer" aria-label="Facebook SGEN">
                <Globe aria-hidden="true" />
              </a>
            </div>
          ) : null}
        </div>

        <div className="site-footer__contact">
          <h2>{settings.contact.company}</h2>
          <p>
            <MapPin aria-hidden="true" /> <span>{settings.contact.address}</span>
          </p>
          <p>
            <MapPin aria-hidden="true" /> <span>Văn phòng: {settings.contact.officeAddress}</span>
          </p>
          <p>
            <Mail aria-hidden="true" /> <a href={`mailto:${settings.contact.email}`}>{settings.contact.email}</a>
          </p>
          <p>
            <Clock3 aria-hidden="true" /> <span>Giờ làm việc: {settings.contact.workingHours}</span>
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="Điều hướng cuối trang">
          <div>
            {FOOTER_NAV.slice(0, half).map((item) => (
              <Link key={item.href} to={item.href}>
                {item.label}
                <ChevronRight aria-hidden="true" />
              </Link>
            ))}
          </div>
          <div>
            {FOOTER_NAV.slice(half).map((item) => (
              <Link key={item.href} to={item.href}>
                {item.label}
                <ChevronRight aria-hidden="true" />
              </Link>
            ))}
            <Link to="/admin">
              Quản trị nội dung
              <ChevronRight aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </div>
      <div className="container site-footer__bottom">
        <p>© {new Date().getFullYear()} {settings.brand.name}. All rights reserved.</p>
        <p className="site-footer__legal">{settings.legal.disclaimer}</p>
      </div>
    </footer>
  );
}
