import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, ChevronUp, Lightbulb, Orbit, Rocket, ShieldCheck, UserRound } from "lucide-react";
const cosmicDarkClean = "/assets/backgrounds/cosmic-dark-clean.webp";
const numeralOne = "/assets/illustrations/numeral-1-cosmic.webp";
const numeralTwo = "/assets/illustrations/numeral-2-cosmic.webp";
const numeralThree = "/assets/illustrations/numeral-3-cosmic.webp";
const numeralFour = "/assets/illustrations/numeral-4-cosmic.webp";
const numeralFive = "/assets/illustrations/numeral-5-cosmic.webp";
const numeralSix = "/assets/illustrations/numeral-6-cosmic.webp";
const numeralSeven = "/assets/illustrations/numeral-7-cosmic.webp";
const numeralEight = "/assets/illustrations/numeral-8-cosmic.webp";
const numeralNine = "/assets/illustrations/numeral-9-cosmic.webp";
const numeralEleven = "/assets/illustrations/numeral-11-cosmic.webp";
const numeralTwentyTwo = "/assets/illustrations/numeral-22-cosmic.webp";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";
import { ButtonLink } from "../ui/Button";

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

const imagePreloads = new Map<string, Promise<void>>();

function preloadImage(source: string) {
  const cached = imagePreloads.get(source);
  if (cached) return cached;

  const preload = new Promise<void>((resolve) => {
    const image = new Image();
    const finish = () => resolve();

    image.onload = finish;
    image.onerror = finish;
    image.src = source;

    if (image.decode) {
      image.decode().then(finish, () => undefined);
    }
  });

  imagePreloads.set(source, preload);
  return preload;
}

export function NumbersSection() {
  const [activeNumber, setActiveNumber] = useState<NumerologyNumber>("1");
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [previousNumber, setPreviousNumber] = useState<NumerologyNumber | null>(null);
  const [pendingNumber, setPendingNumber] = useState<NumerologyNumber | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const activeNumberRef = useRef(activeNumber);
  const requestRef = useRef(0);
  const transitionTimerRef = useRef<number | undefined>(undefined);
  const current = numberData[activeNumber];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const preloadAllImages = () => {
      Object.values(numberImages).forEach((source) => void preloadImage(source));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        preloadAllImages();
        observer.disconnect();
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => window.clearTimeout(transitionTimerRef.current), []);

  const selectNumber = async (number: NumerologyNumber) => {
    if (number === activeNumberRef.current) {
      requestRef.current += 1;
      setPendingNumber(null);
      return;
    }

    const request = ++requestRef.current;
    setPendingNumber(number);
    setDescriptionOpen(false);
    await preloadImage(numberImages[number]);
    if (request !== requestRef.current) return;

    window.clearTimeout(transitionTimerRef.current);
    setPreviousNumber(activeNumberRef.current);
    activeNumberRef.current = number;
    setActiveNumber(number);
    setPendingNumber(null);
    transitionTimerRef.current = window.setTimeout(() => setPreviousNumber(null), 460);
  };

  return (
    <section
      ref={sectionRef}
      id="y-nghia-con-so"
      className="numbers-section section section--dark"
      style={{ "--dark-clean-bg": `url(${cosmicDarkClean})` } as React.CSSProperties}
    >
      <div className="container">
        <SectionHeading
          align="center"
          eyebrow="Khám phá năng lượng con số"
          title="Ý nghĩa các con số trong thần số học Pythagoras"
          description="Hiểu đúng năng lượng từng con số để sống đúng với bản chất và sứ mệnh của bạn."
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
                className={`${activeNumber === number ? "is-active" : ""} ${pendingNumber === number ? "is-loading" : ""}`}
                onClick={() => void selectNumber(number)}
              >
                {number}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal className="number-panel" delay={80}>
          <div className="number-art">
            {previousNumber && (
              <img
                className="number-art__image number-art__image--outgoing"
                src={numberImages[previousNumber]}
                alt=""
                aria-hidden="true"
              />
            )}
            <img
              key={activeNumber}
              className="number-art__image number-art__image--incoming"
              src={numberImages[activeNumber]}
              alt={`Minh họa năng lượng thần số học số ${activeNumber}`}
              loading="eager"
              decoding="async"
            />
          </div>

          <div id="number-detail" role="tabpanel" className="number-detail" key={`detail-${activeNumber}`}>
            <span className="number-detail__eyebrow"><Orbit aria-hidden="true" /> Thần số học số {activeNumber}</span>
            <p className="number-detail__subtitle">{current.title} — {current.subtitle}</p>
            <p
              id="number-detail-description"
              className={`number-detail__description${descriptionOpen ? "" : " is-collapsed"}`}
            >
              {current.description}
            </p>
            <button
              type="button"
              className="number-detail__toggle"
              aria-expanded={descriptionOpen}
              aria-controls="number-detail-description"
              onClick={() => setDescriptionOpen((open) => !open)}
            >
              {descriptionOpen ? (
                <>
                  Thu gọn <ChevronUp aria-hidden="true" />
                </>
              ) : (
                <>
                  Đọc thêm <ChevronDown aria-hidden="true" />
                </>
              )}
            </button>
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
            <ButtonLink variant="primary" to="/tra-cuu">
              Tra cứu bản đồ của bạn <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
