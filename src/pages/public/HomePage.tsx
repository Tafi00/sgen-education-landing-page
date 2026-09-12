import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { safeQuerySelector } from "../../app/dom";
import { AboutSection } from "../../components/sections/AboutSection";
import { BlogSection } from "../../components/sections/BlogSection";
import { ConsultationSection } from "../../components/sections/ConsultationSection";
import { HeroSection } from "../../components/sections/HeroSection";
import { MethodsSection } from "../../components/sections/MethodsSection";
import { NumbersSection } from "../../components/sections/NumbersSection";
import { ProgramsSection } from "../../components/sections/ProgramsSection";
import { ToolsSection } from "../../components/sections/ToolsSection";

/** Trang chủ: giữ nguyên bố cục landing page hiện có, header/footer do PublicLayout đảm nhiệm. */
export function HomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const target = safeQuerySelector(hash);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <>
      <HeroSection />
      <ToolsSection />
      <NumbersSection />
      <AboutSection />
      <MethodsSection />
      <ProgramsSection />
      <BlogSection />
      <ConsultationSection />
    </>
  );
}
