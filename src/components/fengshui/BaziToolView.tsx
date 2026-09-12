import { useEffect, useRef, useState, type FormEvent } from "react";
import { CircleAlert, Clock3, Compass, Flame, LayoutGrid, Leaf, Sparkles, Waves } from "lucide-react";
import {
  getBaziRelations,
  getBaziSupportProfile,
  getElementBalance,
  getFourPillars,
  getHiddenStems,
  getLifeStage,
  getLuckCycles,
  getNaYin,
  getTenGod,
  type BaziRelation,
  type ElementName,
  type Pillar,
} from "../../../shared/menh-thu/metaphysics";

export type BaziToolViewProps = {
  /** Câu hỏi gợi ý — công cụ Tứ Trụ không dùng trường này, giữ để đồng nhất giao diện prop. */
  defaultQuestion?: string;
  /** Chế độ gọn: ẩn phần tiêu đề hồ sơ và ghi chú phương pháp trong thẻ nhập liệu. */
  compact?: boolean;
};

const elementIcons: Record<ElementName, typeof Flame> = {
  Mộc: Leaf,
  Hỏa: Flame,
  Thổ: Compass,
  Kim: Sparkles,
  Thủy: Waves,
};

const elementClasses: Record<ElementName, string> = {
  Mộc: "wood",
  Hỏa: "fire",
  Thổ: "earth",
  Kim: "metal",
  Thủy: "water",
};

const pillarLabels = ["Trụ năm", "Trụ tháng", "Trụ ngày", "Trụ giờ"];

/** Lá số bốn trụ cùng phần hiệu chỉnh thời gian đã áp dụng. */
type BaziChart = {
  pillars: Pillar[];
  dayMaster: Pillar;
  calculation: { civilTime: string; apparentSolarTime: string; solarTerm: string };
};

type ElementBalance = { element: ElementName; count: number; percent: number };

type BaziSupport = {
  status: string;
  strengthScore: number;
  usefulElement: ElementName;
  joyElement: ElementName;
  explanation: string;
};

type LuckCycle = Pillar & { from: number; to: number; startYear: number; endYear: number };

type LuckCycles = {
  forward: boolean;
  start: { year: number; month: number };
  cycles: LuckCycle[];
};

type BaziResult = {
  chart: BaziChart;
  balance: ElementBalance[];
  support: BaziSupport;
  relations: BaziRelation[];
  luck: LuckCycles;
  name: string;
  gender: "Nam" | "Nữ";
};

/**
 * Công cụ lập Tứ Trụ Bát Tự, tách từ `FengShuiTools` để dùng độc lập trên trang
 * `/cong-cu-phong-thuy/tu-tru-bat-tu`. Thuật toán an trụ, hiệu chỉnh giờ Mặt Trời
 * và cách trình bày lá số giữ nguyên như bản gốc.
 */
export function BaziToolView({ compact = false }: BaziToolViewProps) {
  const [result, setResult] = useState<BaziResult | null>(null);
  const [error, setError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Lập xong lá số thì cuộn tới khối kết quả (scroll-margin-top bù chiều cao header).
  useEffect(() => {
    if (compact || !result) return;
    const node = resultRef.current;
    if (!node) return;
    const timer = window.setTimeout(() => node.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    return () => window.clearTimeout(timer);
  }, [compact, result]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const gender = String(data.get("gender")) as "Nam" | "Nữ";
    const date = String(data.get("date"));
    const time = String(data.get("time"));
    try {
      const chart = getFourPillars(date, time, 105.8333, 7, "apparent");
      setResult({
        chart,
        balance: getElementBalance(chart.pillars),
        support: getBaziSupportProfile(chart.pillars),
        relations: getBaziRelations(chart.pillars),
        luck: getLuckCycles(date, time, gender, 105.8333, 7, "apparent"),
        name,
        gender,
      });
      setError("");
    } catch {
      setError("Không thể lập lá số từ dữ liệu này. Vui lòng kiểm tra ngày và giờ sinh.");
    }
  };

  return (
    <div className="fengshui-tool-layout fengshui-tool-layout--bazi" ref={topRef}>
      <form className="fengshui-form-card" onSubmit={submit}>
        {!compact && <span className="fengshui-kicker"><LayoutGrid /> Hồ sơ mệnh chủ</span>}
        {!compact && <h3>Lập Tứ Trụ Bát Tự</h3>}
        <div className="fengshui-fields">
          <label className="is-wide"><span>Họ và tên</span><input name="name" placeholder="Nhập họ tên" required /></label>
          <label><span>Giới tính</span><select name="gender" defaultValue="Nam"><option>Nam</option><option>Nữ</option></select></label>
          <label><span>Ngày sinh dương lịch</span><input name="date" type="date" required /></label>
          <label><span>Giờ sinh</span><input name="time" type="time" defaultValue="12:00" required /></label>
          <label><span>Vị trí / múi giờ</span><input value="Việt Nam · UTC+7" readOnly /></label>
        </div>
        <button className="fengshui-primary-action" type="submit"><Sparkles /> Lập lá số</button>
        {!compact && <p className="fengshui-method-note"><Clock3 /> Giờ sinh được hiệu chỉnh theo kinh độ Hà Nội và phương trình thời gian trước khi an trụ.</p>}
        {error && <p className="fengshui-error" role="alert"><CircleAlert /> {error}</p>}
      </form>

      <div className="fengshui-result-card bazi-chart" id="tu-tru-la-so" ref={resultRef}>
        {!result ? <div className="fengshui-empty fengshui-empty--large"><LayoutGrid /><h3>Chưa lập lá số</h3><p>Nhập ngày giờ sinh để xem Nhật chủ, ngũ hành, quan hệ Can Chi và Đại vận.</p></div> : <>
          <div className="fengshui-result-card__heading">
            <div><small>{result.gender} mệnh · {result.name}</small><h3>Nhật chủ {result.chart.dayMaster.stem} {result.chart.dayMaster.branch}</h3></div>
            <span>{result.support.status}</span>
          </div>

          <div className="bazi-pillars">
            {result.chart.pillars.map((pillar, index) => (
              <article className={`element-${elementClasses[pillar.stemElement]}`} key={`${pillar.stem}-${pillar.branch}-${index}`}>
                <small>{pillarLabels[index]}</small>
                <strong>{pillar.stem}</strong>
                <strong>{pillar.branch}</strong>
                <b>{index === 2 ? "Nhật chủ" : getTenGod(result.chart.dayMaster.stem, pillar.stem)}</b>
                <span>{getNaYin(pillar)}</span>
                <span>Tàng can: {getHiddenStems(pillar.branch).join(" · ") || "—"}</span>
                <span>{getLifeStage(result.chart.dayMaster.stem, pillar.branch)}</span>
              </article>
            ))}
          </div>

          <section className="bazi-analysis">
            <div className="element-balance">
              <h4>Cân bằng ngũ hành</h4>
              {result.balance.map((item) => {
                const Icon = elementIcons[item.element];
                return <div key={item.element}><span><Icon /> {item.element}</span><i><em style={{ width: `${Math.min(100, item.percent)}%` }} /></i><b>{item.percent}%</b></div>;
              })}
            </div>
            <article className="bazi-support">
              <small>Vượng suy Nhật chủ</small>
              <h4>{result.support.status} · {result.support.strengthScore}/100</h4>
              <p>{result.support.explanation}</p>
              <div><span>Dụng thần gợi ý <b>{result.support.usefulElement}</b></span><span>Hỷ thần <b>{result.support.joyElement}</b></span></div>
            </article>
          </section>

          <section className="bazi-relations">
            <h4>Quan hệ Can Chi</h4>
            <div>{result.relations.length ? result.relations.map((relation, index) => <span className={`is-${relation.kind}`} key={`${relation.label}-${index}`}><b>{relation.label}</b> {relation.members.join(" · ")}</span>) : <span>Không có quan hệ hợp/xung nổi bật trong bốn trụ.</span>}</div>
          </section>

          <section className="bazi-luck">
            <div><small>Khởi Đại vận</small><b>{result.luck.start.year} năm {result.luck.start.month} tháng</b><span>{result.luck.forward ? "Thuận hành" : "Nghịch hành"}</span></div>
            <ol>{result.luck.cycles.map((cycle) => <li key={`${cycle.stem}-${cycle.branch}-${cycle.from}`}><small>{cycle.from}–{cycle.to} tuổi</small><b>{cycle.stem} {cycle.branch}</b><span>{cycle.startYear}–{cycle.endYear}</span></li>)}</ol>
          </section>

          <p className="fengshui-method-note"><Clock3 /> Giờ dân dụng {result.chart.calculation.civilTime} → giờ Mặt Trời thực {result.chart.calculation.apparentSolarTime} · tiết {result.chart.calculation.solarTerm}.</p>
        </>}
      </div>
    </div>
  );
}
