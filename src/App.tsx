import { useEffect, useState } from "react";
import { AboutSection } from "./components/sections/AboutSection";
import { BlogSection } from "./components/sections/BlogSection";
import { Footer } from "./components/layout/Footer";
import { ConsultationSection } from "./components/sections/ConsultationSection";
import { HeroSection } from "./components/sections/HeroSection";
import { MethodsSection } from "./components/sections/MethodsSection";
import { NumbersSection } from "./components/sections/NumbersSection";
import { ProgramsSection } from "./components/sections/ProgramsSection";
import { ToolsSection } from "./components/sections/ToolsSection";
import { ScrollToTop } from "./components/ui/ScrollToTop";
import { getBlogPost } from "./data/blog";
import { BlogArticlePage, routePages } from "./pages/SitePages";
import "./styles/global.css";
import "./styles/content.css";
import "./styles/final.css";
import "./styles/hero.css";
import "./styles/tools-numbers.css";
import "./styles/fengshui-tools.css";
import "./styles/pages.css";
import "./styles/responsive.css";

function HomePage() {
  return (
    <main className="app-shell">
      <HeroSection />
      <ToolsSection />
      <NumbersSection />
      <AboutSection />
      <MethodsSection />
      <ProgramsSection />
      <BlogSection />
      <ConsultationSection />
      <Footer />
      <ScrollToTop />
    </main>
  );
}

export default function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname.replace(/\/$/, "") || "/");
  const articleSlug = pathname.startsWith("/blog/") ? decodeURIComponent(pathname.slice("/blog/".length)) : "";
  const articlePost = articleSlug ? getBlogPost(articleSlug) : undefined;

  useEffect(() => {
    const update = () => setPathname(window.location.pathname.replace(/\/$/, "") || "/");
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || !url.pathname.startsWith("/")) return;
      event.preventDefault();
      window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
      update();
      window.requestAnimationFrame(() => {
        if (url.hash) document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" });
        else window.scrollTo({ top: 0, behavior: "auto" });
      });
    };
    window.addEventListener("popstate", update);
    document.addEventListener("click", navigate);
    return () => {
      window.removeEventListener("popstate", update);
      document.removeEventListener("click", navigate);
    };
  }, []);

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "SGEN Education — Thần số học ứng dụng",
      "/gioi-thieu": "Giới thiệu — SGEN Education",
      "/tra-cuu": "Tra cứu Thần số học — SGEN Education",
      "/dich-vu": "Dịch vụ tư vấn — SGEN Education",
      "/khoa-hoc": "Khóa học — SGEN Education",
      "/free-tools": "Free tools — SGEN Education",
      "/blog": "Blog — SGEN Education",
    };
    document.title = articlePost ? `${articlePost.title} — Blog SGEN Education` : titles[pathname] ?? titles["/"];
  }, [articlePost, pathname]);

  if (articlePost) return <BlogArticlePage post={articlePost} />;

  const RoutePage = routePages[pathname] ?? (articleSlug ? routePages["/blog"] : undefined);
  return RoutePage ? <RoutePage /> : <HomePage />;
}
