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
import "./styles/global.css";
import "./styles/content.css";
import "./styles/final.css";
import "./styles/hero.css";
import "./styles/tools-numbers.css";
import "./styles/responsive.css";

export default function App() {
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
