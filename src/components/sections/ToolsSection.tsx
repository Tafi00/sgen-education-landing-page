import { lazy, Suspense, useState } from "react";
import {
  ArrowRight,
  Calculator,
  CalendarDays,
  ChartNoAxesCombined,
  Heart,
  Mountain,
  Smile,
  Star,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
} from "lucide-react";
import cosmicLight from "../../../assets/backgrounds/cosmic-light.webp";
import type { NumerologyMetricKey } from "../../lib/numerology";
import { IconOrb } from "../ui/IconOrb";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

const FengShuiTools = lazy(() => import("./FengShuiTools").then((module) => ({ default: module.FengShuiTools })));

type ToolCategory = "quick" | "free" | "fengshui";

const tabs: { id: ToolCategory; label: string }[] = [
  { id: "quick", label: "Tính nhanh chỉ số" },
  { id: "free", label: "Công cụ miễn phí" },
  { id: "fengshui", label: "Công cụ phong thủy" },
];

const toolGroups = {
  quick: [
    { title: "Chỉ số Đường Đời", icon: UserRound, metric: "lifePath" },
    { title: "Chỉ số Sứ mệnh", icon: Target, metric: "destiny" },
    { title: "Chỉ số Nội Tâm", icon: Heart, metric: "soul" },
    { title: "Chỉ số Thái độ", icon: Smile, metric: "attitude" },
    { title: "Năm cá nhân", icon: CalendarDays, metric: "personalYear" },
    { title: "Giai đoạn đỉnh cao", icon: Mountain, metric: "peaks" },
    { title: "Chỉ số Tương Tác", icon: UsersRound, metric: "interaction" },
    { title: "Chỉ số trưởng thành", icon: ChartNoAxesCombined, metric: "maturity" },
  ],
  free: [
    { title: "Con số ngày sinh", icon: Star },
    { title: "Năng lượng tháng", icon: CalendarDays },
    { title: "Chu kỳ phát triển", icon: TrendingUp },
    { title: "Khả năng kết nối", icon: UsersRound },
  ],
};

export function ToolsSection() {
  const [activeTab, setActiveTab] = useState<ToolCategory>("quick");
  const activeTools = activeTab === "fengshui" ? [] : toolGroups[activeTab];
  const sectionCopy = activeTab === "fengshui"
    ? {
        eyebrow: "Công cụ phong thủy",
        title: "Tra cứu phong thủy",
        description: "Gieo quẻ Kinh Dịch, lập Tứ Trụ Bát Tự và xem ngày tốt theo lịch pháp Việt Nam.",
      }
    : {
        eyebrow: "Tra cứu kiến thức thần số học",
        title: "Các công cụ tính nhanh chỉ số",
        description: "Khám phá các chỉ số quan trọng trong Thần số học Pythagoras.",
      };

  return (
    <section
      id="cong-cu"
      className="tools-section section"
      style={{ "--light-cosmic-bg": `url(${cosmicLight})` } as React.CSSProperties}
    >
      <div className="container">
        <SectionHeading
          eyebrow={sectionCopy.eyebrow}
          title={sectionCopy.title}
          description={sectionCopy.description}
          icon={Calculator}
        />

        <Reveal className="tools-tabs" direction="none">
          <div role="tablist" aria-label="Nhóm công cụ tra cứu">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`tool-tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls="tools-panel"
                className={activeTab === tab.id ? "is-active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </Reveal>

        {activeTab === "fengshui" ? (
          <div id="tools-panel" role="tabpanel" aria-labelledby="tool-tab-fengshui" key={activeTab}>
            <Suspense fallback={<div className="fengshui-loading"><span />Đang mở không gian phong thủy…</div>}>
              <FengShuiTools />
            </Suspense>
          </div>
        ) : (
          <div id="tools-panel" role="tabpanel" aria-labelledby={`tool-tab-${activeTab}`} className="tools-grid" key={activeTab}>
            {activeTools.map((tool, index) => {
              const Icon = tool.icon;
              const metric = "metric" in tool ? tool.metric as NumerologyMetricKey : undefined;
              const target = metric ? `/tra-cuu?metric=${metric}` : "/tra-cuu";
              return (
                <Reveal as="article" className="tool-card" delay={(index % 4) * 70} key={tool.title}>
                  {"number" in tool ? (
                    <span className="tool-card__number">{String(tool.number)}</span>
                  ) : (
                    <IconOrb icon={Icon} size="lg" />
                  )}
                  <h3>{tool.title}</h3>
                  <a
                    href={target}
                  >
                    <span>Tính ngay</span>
                    <ArrowRight aria-hidden="true" size={20} />
                  </a>
                </Reveal>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
