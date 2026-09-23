import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { safeQuerySelector } from "../../app/dom";
import { HeroSection } from "../../components/sections/HeroSection";
import { AboutSection } from "../../components/sections/AboutSection";
import { MethodsSection } from "../../components/sections/MethodsSection";
import { MissionSection } from "../../components/sections/MissionSection";
import { CoreValuesSection } from "../../components/sections/CoreValuesSection";
import { ConsultationSection } from "../../components/sections/ConsultationSection";

/**
 * Trang chủ: Trang giới thiệu SGEN Education gồm 6 sections chuẩn landing page gốc:
 * 1. HeroSection — Mở đầu vũ trụ tối với 4 trụ cột & 3 lợi ích cốt lõi
 * 2. AboutSection — Vài dòng giới thiệu & thẻ Pythagoras đặc trưng (id="gioi-thieu")
 * 3. Tầm nhìn (id="tam-nhin" — MethodsSection với 3 phương pháp & 3 trụ cột)
 * 4. Sứ mệnh (id="su-menh" — MissionSection với lộ trình 4 giai đoạn)
 * 5. Giá trị cốt lõi (id="gia-tri-cot-loi" — CoreValuesSection với 4 giá trị bất biến)
 * 6. Liên hệ (id="lien-he" — ConsultationSection với thông tin & form tư vấn)
 */
export function HomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const target = safeQuerySelector(hash);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <MethodsSection />
      <MissionSection />
      <CoreValuesSection />
      <ConsultationSection />
    </>
  );
}
