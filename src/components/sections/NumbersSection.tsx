import { useState } from "react";
import { Binary, Lightbulb, Orbit, Rocket, ShieldCheck, UserRound } from "lucide-react";
import cosmicDarkClean from "../../../assets/backgrounds/cosmic-dark-clean.webp";
import numeralOne from "../../../assets/illustrations/numeral-1-cosmic.webp";
import numeralTwo from "../../../assets/illustrations/numeral-2-cosmic.webp";
import numeralThree from "../../../assets/illustrations/numeral-3-cosmic.webp";
import numeralFour from "../../../assets/illustrations/numeral-4-cosmic.webp";
import numeralFive from "../../../assets/illustrations/numeral-5-cosmic.webp";
import numeralSix from "../../../assets/illustrations/numeral-6-cosmic.webp";
import numeralSeven from "../../../assets/illustrations/numeral-7-cosmic.webp";
import numeralEight from "../../../assets/illustrations/numeral-8-cosmic.webp";
import numeralNine from "../../../assets/illustrations/numeral-9-cosmic.webp";
import numeralEleven from "../../../assets/illustrations/numeral-11-cosmic.webp";
import numeralTwentyTwo from "../../../assets/illustrations/numeral-22-cosmic.webp";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { SparkleButton } from "../ui/GradientButton";

const numberData = {
  "1": { title: "Người tiên phong", subtitle: "Độc lập — Sáng tạo", description: "Số 1 đại diện cho tinh thần đổi mới, sự tự tin và khả năng dẫn dắt. Khi phát huy đúng năng lượng, bạn có thể biến ý tưởng thành hành động tích cực.", traits: ["Táo bạo", "Sáng tạo", "Độc lập", "Kiên định"] },
  "2": { title: "Người kết nối", subtitle: "Tinh tế — Hợp tác", description: "Số 2 mang năng lượng của sự thấu cảm, cân bằng và kết nối. Bạn tạo nên sức mạnh bằng khả năng lắng nghe và nuôi dưỡng các mối quan hệ.", traits: ["Tinh tế", "Kiên nhẫn", "Hợp tác", "Thấu cảm"] },
  "3": { title: "Người truyền cảm hứng", subtitle: "Biểu đạt — Lạc quan", description: "Số 3 lan tỏa niềm vui qua giao tiếp và sáng tạo. Khả năng biểu đạt tự nhiên giúp bạn chạm tới người khác bằng cảm xúc chân thành.", traits: ["Lạc quan", "Hoạt ngôn", "Sáng tạo", "Cởi mở"] },
  "4": { title: "Người xây nền", subtitle: "Kỷ luật — Thực tế", description: "Số 4 là nền móng của trật tự và bền vững. Bạn phát triển tốt nhất khi có kế hoạch rõ ràng và từng bước biến mục tiêu thành kết quả.", traits: ["Kỷ luật", "Tin cậy", "Thực tế", "Bền bỉ"] },
  "5": { title: "Người khám phá", subtitle: "Tự do — Thích nghi", description: "Số 5 yêu trải nghiệm, chuyển động và sự thay đổi. Tính linh hoạt giúp bạn tìm thấy cơ hội ở những nơi người khác chưa nhìn thấy.", traits: ["Linh hoạt", "Tò mò", "Tự do", "Mạo hiểm"] },
  "6": { title: "Người nuôi dưỡng", subtitle: "Trách nhiệm — Yêu thương", description: "Số 6 hướng về gia đình, cộng đồng và cái đẹp. Bạn tạo ảnh hưởng qua sự tận tâm, trách nhiệm và khả năng chăm sóc.", traits: ["Tận tâm", "Ấm áp", "Trách nhiệm", "Hài hòa"] },
  "7": { title: "Người chiêm nghiệm", subtitle: "Trí tuệ — Nội tâm", description: "Số 7 tìm kiếm chiều sâu và sự thật. Khả năng quan sát, phân tích và học từ trải nghiệm là con đường phát triển cốt lõi của bạn.", traits: ["Sâu sắc", "Phân tích", "Trực giác", "Độc lập"] },
  "8": { title: "Người kiến tạo", subtitle: "Quyền lực — Thành tựu", description: "Số 8 gắn với năng lực quản trị và hiện thực hóa mục tiêu. Khi cân bằng vật chất và giá trị, bạn tạo nên ảnh hưởng bền vững.", traits: ["Bản lĩnh", "Quản trị", "Tham vọng", "Công bằng"] },
  "9": { title: "Người phụng sự", subtitle: "Nhân ái — Bao dung", description: "Số 9 mang tầm nhìn rộng và trái tim nhân văn. Bạn được thúc đẩy bởi mong muốn đóng góp và tạo ra giá trị cho cộng đồng.", traits: ["Nhân ái", "Bao dung", "Lý tưởng", "Truyền cảm"] },
  "11": { title: "Người khai sáng", subtitle: "Trực giác — Tầm nhìn", description: "Số chủ đạo 11 sở hữu độ nhạy cảm và trực giác nổi bật. Năng lượng này mở ra khả năng truyền cảm hứng và dẫn đường bằng tầm nhìn.", traits: ["Trực giác", "Khai sáng", "Nhạy cảm", "Tầm nhìn"] },
  "22": { title: "Bậc thầy kiến tạo", subtitle: "Tầm vóc — Hiện thực hóa", description: "Số chủ đạo 22 kết hợp tầm nhìn lớn với năng lực xây dựng thực tế. Bạn có tiềm năng biến những ý tưởng có ích thành hệ thống bền vững.", traits: ["Kiến tạo", "Thực tế", "Tầm vóc", "Bền vững"] },
};

type NumerologyNumber = keyof typeof numberData;
const numberTabs = Object.keys(numberData) as NumerologyNumber[];
const traitIcons = [Rocket, Lightbulb, UserRound, ShieldCheck];
const numberImages: Record<NumerologyNumber, string> = {
  "1": numeralOne,
  "2": numeralTwo,
  "3": numeralThree,
  "4": numeralFour,
  "5": numeralFive,
  "6": numeralSix,
  "7": numeralSeven,
  "8": numeralEight,
  "9": numeralNine,
  "11": numeralEleven,
  "22": numeralTwentyTwo,
};

export function NumbersSection() {
  const [activeNumber, setActiveNumber] = useState<NumerologyNumber>("1");
  const current = numberData[activeNumber];

  return (
    <section
      id="y-nghia-con-so"
      className="numbers-section section section--dark"
      style={{ "--dark-clean-bg": `url(${cosmicDarkClean})` } as React.CSSProperties}
    >
      <div className="container">
        <SectionHeading
          eyebrow="Khám phá năng lượng con số"
          title={<>Ý nghĩa các con số<br />trong thần số học Pythagoras</>}
          description="Hiểu đúng năng lượng từng con số để sống đúng với bản chất và sứ mệnh của bạn."
          icon={Binary}
          dark
        />

        <Reveal className="number-tabs" direction="none">
          <div role="tablist" aria-label="Chọn con số thần số học">
            {numberTabs.map((number) => (
              <button
                key={number}
                type="button"
                role="tab"
                aria-selected={activeNumber === number}
                aria-controls="number-detail"
                className={activeNumber === number ? "is-active" : ""}
                onClick={() => setActiveNumber(number)}
              >
                {number}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal className="number-panel" delay={80}>
          <div className="number-art" key={`art-${activeNumber}`}>
            <img
              src={numberImages[activeNumber]}
              alt={`Minh họa năng lượng thần số học số ${activeNumber}`}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div id="number-detail" role="tabpanel" className="number-detail" key={`detail-${activeNumber}`}>
            <span className="number-detail__eyebrow"><Orbit aria-hidden="true" /> Thần số học số {activeNumber}</span>
            <p className="number-detail__subtitle">{current.title} — {current.subtitle}</p>
            <p className="number-detail__description">{current.description}</p>
            <div className="number-detail__traits">
              {current.traits.map((trait, index) => {
                const Icon = traitIcons[index];
                return (
                  <div key={trait}>
                    <Icon aria-hidden="true" />
                    <span>{trait}</span>
                  </div>
                );
              })}
            </div>
            <SparkleButton>Xem luận giải chi tiết</SparkleButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
