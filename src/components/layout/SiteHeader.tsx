import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, LogIn, Menu, Phone, X } from "lucide-react";
import { AUTH_NAV, PRIMARY_NAV } from "../../app/nav";
import { useSiteSettings } from "../../api/hooks";

const AUTO_HIDE_BREAKPOINT = 1240;
const AUTO_HIDE_AFTER = 200;
/** Nhịp trễ khi rời chuột, đủ để đi từ mục cha xuống panel (khe 14px) mà menu không tắt. */
const HOVER_CLOSE_DELAY = 160;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const progressRef = useRef<HTMLSpanElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const lastScrollRef = useRef(0);
  const hoverCapableRef = useRef(false);
  const hoverCloseTimerRef = useRef<number | null>(null);
  const location = useLocation();
  const { settings } = useSiteSettings();

  /** Chỉ mở menu bằng hover trên thiết bị có chuột thật; cảm ứng vẫn dùng nút như cũ. */
  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    hoverCapableRef.current = query.matches;
    const sync = (event: MediaQueryListEvent) => {
      hoverCapableRef.current = event.matches;
    };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(
    () => () => {
      if (hoverCloseTimerRef.current !== null) window.clearTimeout(hoverCloseTimerRef.current);
    },
    [],
  );

  /**
   * Chiều cao thật của header được ghi vào CSS var `--header-h` để mọi section
   * bù đúng chỗ (scroll-margin, padding-top), tránh nội dung nằm dưới header.
   */
  useEffect(() => {
    const node = innerRef.current;
    if (!node) return;
    const apply = () => {
      const height = Math.ceil(node.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--header-h", `${height}px`);
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    window.addEventListener("resize", apply);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", apply);
    };
  }, []);

  useEffect(() => {
    let ticking = false;
    let frameId = 0;

    const update = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollableHeight = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const previous = lastScrollRef.current;
      const isCompact = window.innerWidth <= AUTO_HIDE_BREAKPOINT;

      setScrolled(currentScrollY > 36);

      /** Mobile/tablet: giấu header khi cuộn xuống để không che nội dung, hiện lại khi cuộn lên. */
      if (!isCompact) setHidden(false);
      else if (currentScrollY > AUTO_HIDE_AFTER && currentScrollY > previous + 4) setHidden(true);
      else if (currentScrollY < previous - 4 || currentScrollY <= AUTO_HIDE_AFTER) setHidden(false);

      lastScrollRef.current = currentScrollY;
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${Math.min(currentScrollY / scrollableHeight, 1)})`;
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        frameId = window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenGroup(null);
    setHidden(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  const clearHoverClose = () => {
    if (hoverCloseTimerRef.current === null) return;
    window.clearTimeout(hoverCloseTimerRef.current);
    hoverCloseTimerRef.current = null;
  };

  const handleGroupEnter = (label: string) => {
    if (!hoverCapableRef.current) return;
    clearHoverClose();
    setOpenGroup(label);
  };

  /**
   * Đóng sau một nhịp ngắn: kịp đi qua khe 14px xuống panel hoặc rê ngang sang mục khác,
   * nhưng vẫn tắt ngay khi người dùng rời hẳn khỏi mục.
   */
  const handleGroupLeave = (label: string) => {
    if (!hoverCapableRef.current) return;
    clearHoverClose();
    hoverCloseTimerRef.current = window.setTimeout(() => {
      hoverCloseTimerRef.current = null;
      setOpenGroup((current) => (current === label ? null : current));
    }, HOVER_CLOSE_DELAY);
  };

  return (
    <header
      className={[
        "site-header",
        scrolled ? "site-header--scrolled" : "",
        menuOpen ? "site-header--menu-open" : "",
        hidden ? "site-header--hidden" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="container site-header__inner" ref={innerRef}>
        <Link className="site-header__brand" to="/" aria-label={`${settings.brand.name} - Trang chủ`}>
          <img src={settings.brand.logoDark} alt={settings.brand.name} decoding="async" fetchPriority="high" />
        </Link>

        <nav id="site-navigation" className={`site-nav ${menuOpen ? "site-nav--open" : ""}`} aria-label="Điều hướng chính">
          <ul className="site-nav__list">
            {PRIMARY_NAV.map((item) => (
              <li
                key={item.label}
                className={`site-nav__item ${openGroup === item.label ? "is-open" : ""} ${item.children ? "has-children" : ""}`}
                onMouseEnter={item.children ? () => handleGroupEnter(item.label) : undefined}
                onMouseLeave={item.children ? () => handleGroupLeave(item.label) : undefined}
              >
                {item.children ? (
                  <>
                    <button
                      type="button"
                      className="site-nav__trigger"
                      aria-expanded={openGroup === item.label}
                      onClick={() => setOpenGroup((current) => (current === item.label ? null : item.label))}
                    >
                      <NavLink to={item.href} className={({ isActive }) => (isActive ? "is-active" : "")} onClick={(event) => event.stopPropagation()}>
                        {item.label}
                      </NavLink>
                      <ChevronDown aria-hidden="true" />
                    </button>
                    <div className="site-nav__dropdown">
                      <Link to={item.href} className="site-nav__dropdown-all" onClick={closeMenu}>
                        Tổng quan {item.label}
                      </Link>
                      {item.children.map((child) => (
                        <Link key={child.href} to={child.href} onClick={closeMenu}>
                          <strong>{child.label}</strong>
                          {child.description ? <small>{child.description}</small> : null}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <NavLink to={item.href} className={({ isActive }) => (isActive ? "is-active" : "")} onClick={closeMenu}>
                    {item.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>

          {/* Trên mobile, khu tài khoản và hotline nằm trong drawer để đầu trang chỉ còn logo + nút menu. */}
          <div className="site-nav__mobile-extra">
            <Link className="site-header__login" to={AUTH_NAV.href} onClick={closeMenu}>
              <LogIn aria-hidden="true" />
              <span>Đăng nhập</span>
            </Link>
            <a className="site-header__hotline" href={`tel:${settings.contact.phone}`} onClick={closeMenu}>
              <Phone aria-hidden="true" />
              <span>Hotline {settings.brand.hotline}</span>
            </a>
          </div>
        </nav>

        <div className="site-header__actions">
          <a className="site-header__hotline" href={`tel:${settings.contact.phone}`}>
            <Phone aria-hidden="true" />
            <span>{settings.brand.hotline}</span>
          </a>
          <Link className="site-header__login" to={AUTH_NAV.href}>
            <LogIn aria-hidden="true" />
            <span>Đăng nhập</span>
          </Link>
        </div>

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

        <span className="site-header__progress" aria-hidden="true">
          <span ref={progressRef} />
        </span>
      </div>
    </header>
  );
}
