import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import logoDark from "../../../assets/brand/sgen-logo-dark.png";

const navItems = [
  { label: "Giới thiệu", href: "#gioi-thieu" },
  { label: "Tra cứu", href: "#tra-cuu" },
  { label: "Dịch vụ", href: "#chuong-trinh" },
  { label: "Khóa học", href: "#chuong-trinh" },
  { label: "Free tools", href: "#cong-cu" },
  { label: "Blog", href: "#blog" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let ticking = false;
    let frameId = 0;
    let previousScrolled = false;

    const updateHeader = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollableHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const nextScrolled = currentScrollY > 36;

      if (nextScrolled !== previousScrolled) {
        setScrolled(nextScrolled);
        previousScrolled = nextScrolled;
      }

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.min(currentScrollY / scrollableHeight, 1)})`;
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        frameId = window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    updateHeader();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""} ${menuOpen ? "site-header--menu-open" : ""}`}>
      <div className="container site-header__inner">
        <a className="site-header__brand" href="#top" aria-label="SGEN Education - Trang chủ">
          <img src={logoDark} alt="SGEN Education" decoding="async" fetchPriority="high" />
        </a>

        <button
          className="site-header__menu-button"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav id="site-navigation" className={`site-nav ${menuOpen ? "site-nav--open" : ""}`} aria-label="Điều hướng chính">
          {navItems.map((item) => (
            <a key={item.label} href={item.href} onClick={closeMenu}>{item.label}</a>
          ))}
          <a className="site-nav__login" href="#tu-van" onClick={closeMenu}>Đăng nhập</a>
        </nav>

        <span className="site-header__progress" aria-hidden="true">
          <span ref={progressRef} />
        </span>
      </div>
    </header>
  );
}
