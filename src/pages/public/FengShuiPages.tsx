import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  CircleAlert,
  Clock3,
  Coins,
  Compass,
  LayoutGrid,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { XemNgayView } from "../../components/fengshui/XemNgayView";
import { IChingToolView } from "../../components/fengshui/IChingToolView";
import MenhThuApp from "../../vendor/menh-thu/app/MenhThuApp";
import { ButtonLink, ButtonRow } from "../../components/ui/Button";
import { Callout, CardGrid, Faq, FeatureCard, PageHero, Steps, ToolHeader } from "../../components/ui/Layout";
import { SectionHeading } from "../../components/ui/SectionHeading";
const COURSE_IMAGE = "/assets/programs/program-home-feng-shui-v2.webp";

/** Header của site là `position: fixed` cao 98px, nên section đầu trang công cụ cần chừa thêm khoảng đệm. */
const FIRST_SECTION_STYLE: CSSProperties = { paddingTop: 140 };

const TOOL_LINKS: { href: string; title: string; text: string; icon: LucideIcon }[] = [
  {
    href: "/cong-cu-phong-thuy/gieo-que-kinh-dich",
    title: "Gieo quẻ Kinh Dịch",
    text: "Gieo sáu lần để lập quẻ chủ, xác định hào động và suy ra quẻ biến.",
    icon: Coins,
  },
  {
    href: "/cong-cu-phong-thuy/tu-tru-bat-tu",
    title: "Phân tích Tứ Trụ Bát Tự",
    text: "Lập bốn trụ theo tiết khí, hiệu chỉnh giờ Mặt Trời và đọc Nhật chủ, ngũ hành, Đại vận.",
    icon: LayoutGrid,
  },
  {
    href: "/cong-cu-phong-thuy/xem-ngay",
    title: "Xem ngày",
    text: "Tra cát hung, Thập nhị Trực, Nhị thập bát tú và bảng mười hai giờ tốt — xấu trong ngày.",
    icon: CalendarCheck,
  },
];

type MethodItem = { icon: LucideIcon; title: string; text: string };

function ToolHero({ kicker, icon, title, accent, description }: { kicker: string; icon: LucideIcon; title: string; accent: string; description: string }) {
  return (
    <div className="container">
      <ToolHeader eyebrow={kicker} eyebrowIcon={icon} title={title} accent={accent} description={description} />
    </div>
  );
}

function MethodSection({ heading, lead, items }: { heading: string; lead: string; items: MethodItem[] }) {
  return (
    <section className="page-dark-section">
      <div className="container">
        <SectionHeading eyebrow="Phương pháp luận giải" title={heading} description={lead} />
        <CardGrid>
          {items.map(({ icon, title, text }) => (
            <FeatureCard key={title} icon={icon} title={title}>
              <p>{text}</p>
            </FeatureCard>
          ))}
        </CardGrid>
      </div>
    </section>
  );
}

function FaqSection({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <section className="page-dark-section">
      <div className="container">
        <SectionHeading eyebrow="Câu hỏi thường gặp" title="Giải đáp nhanh trước khi tra cứu" />
        <Faq items={items} />
      </div>
    </section>
  );
}

function RelatedTools({ current }: { current: string }) {
  const others = TOOL_LINKS.filter((tool) => tool.href !== current);
  return (
    <section className="page-light-section">
      <div className="container">
        <SectionHeading eyebrow="Đi tiếp" title="Hai công cụ phong thủy còn lại" />
        <CardGrid>
          {others.map((tool) => (
            <FeatureCard
              key={tool.href}
              title={tool.title}
              footer={<Link className="card-link" to={tool.href}>Mở công cụ <ArrowRight aria-hidden="true" /></Link>}
            >
              <p>{tool.text}</p>
            </FeatureCard>
          ))}
        </CardGrid>
      </div>
    </section>
  );
}

function CourseCta({ note }: { note?: string }) {
  return (
    <section className="page-dark-section fengshui-course-section">
      <div className="container">
        <div className="featured-course">
          <div>
            <span>Khóa học liên quan</span>
            <h2>Phong thủy ứng dụng — hiểu nguyên lý để tự luận</h2>
            <p>
              Khóa học giúp bạn nắm nền tảng Dịch học, Can Chi và lịch pháp để đọc kết quả công cụ một cách có hệ thống, thay vì dựa vào phán đoán cảm tính.
            </p>
            <ul>
              <li><Check aria-hidden="true" /> Nền tảng bát quái, ngũ hành, Can Chi</li>
              <li><Check aria-hidden="true" /> Thực hành an trụ và luận giải theo tình huống</li>
              <li><Check aria-hidden="true" /> Hướng dẫn tự tra cứu cho người mới bắt đầu</li>
            </ul>
            <Link to="/khoa-hoc">
              Xem lộ trình khóa học <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <img src={COURSE_IMAGE} alt="Khóa học phong thủy ứng dụng của SGEN Education" loading="lazy" decoding="async" />
        </div>
        {note ? (
          <Callout icon={BookOpen}>
            <p>{note}</p>
          </Callout>
        ) : null}
      </div>
    </section>
  );
}

/** Trang trung tâm công cụ phong thủy: giới thiệu ba công cụ và điều hướng sang trang tra cứu riêng. */
export function FengShuiHubPage() {
  return (
    <>
      <PageHero
        eyebrow="Công cụ phong thủy"
        eyebrowIcon={Compass}
        title="Ba công cụ tra cứu"
        accent="phong thủy ứng dụng"
        description="SGEN tổng hợp ba công cụ miễn phí: gieo quẻ Kinh Dịch, lập Tứ Trụ Bát Tự và xem ngày theo lịch pháp Việt Nam. Mỗi công cụ trình bày rõ dữ liệu đầu vào, thuật toán đang dùng và phần luận giải để bạn chủ động đối chiếu."
        actions={<ButtonRow><ButtonLink variant="primary" to="/cong-cu-phong-thuy/gieo-que-kinh-dich">
                <Coins aria-hidden="true" /> Gieo quẻ ngay
              </ButtonLink>
              <ButtonLink variant="secondary" to="/cong-cu-phong-thuy/xem-ngay">
                <CalendarCheck aria-hidden="true" /> Xem ngày tốt
              </ButtonLink></ButtonRow>}
      />

      <section className="page-light-section">
        <div className="container">
          <SectionHeading eyebrow="Ba công cụ" title="Chọn công cụ theo câu hỏi của bạn" description="Mỗi công cụ trả lời một nhóm câu hỏi khác nhau và đều chạy trực tiếp trên trình duyệt của bạn." />
          <CardGrid>
            {TOOL_LINKS.map((tool) => (
              <FeatureCard
                key={tool.href}
                icon={tool.icon}
                title={tool.title}
                footer={<Link className="card-link" to={tool.href}>Mở công cụ <ArrowRight aria-hidden="true" /></Link>}
              >
                <p>{tool.text}</p>
              </FeatureCard>
            ))}
          </CardGrid>
          <Steps title="Quy trình luận giải của SGEN" steps={["Chọn công cụ", "Nhập dữ liệu", "Đọc chỉ báo", "Đối chiếu thực tế"]} />
        </div>
      </section>

      <FaqSection
        items={[
          {
            question: "Ba công cụ này có mất phí không?",
            answer: "Tất cả đều miễn phí và không cần tạo tài khoản. Bạn có thể tra cứu không giới hạn số lần.",
          },
          {
            question: "Dữ liệu tôi nhập được xử lý ở đâu?",
            answer: "Các phép tính phong thủy chạy ngay trên trình duyệt. Họ tên, ngày giờ sinh không được tự động gửi lên máy chủ.",
          },
          {
            question: "Kết quả có phải dự báo chắc chắn?",
            answer: "Không. Kết quả là góc nhìn tham khảo theo một hệ phương pháp, không phải kết luận về tương lai hay vận mệnh của bạn.",
          },
        ]}
      />

      <section className="page-light-section">
        <div className="container">
          <SectionHeading eyebrow="Kết hợp thêm" title="Bổ sung góc nhìn từ sim số và thần số học" description="Ba công cụ phong thủy chỉ là một phần trong hệ thống tra cứu của SGEN. Bạn có thể kết hợp thêm các lớp phân tích khác." />
          <CardGrid>
            <FeatureCard
              title="Bói sim phong thủy"
              footer={<Link className="card-link" to="/sim-phong-thuy">Xem cách luận sim <ArrowRight aria-hidden="true" /></Link>}
            >
              <p>Luận số điện thoại theo năm lớp: quẻ Kinh Dịch, ngũ hành dãy số, âm dương, quan niệm dân gian và đối chiếu bản mệnh.</p>
            </FeatureCard>
            <FeatureCard
              title="Công cụ thần số học miễn phí"
              footer={<Link className="card-link" to="/free-tools">Mở Free tools <ArrowRight aria-hidden="true" /></Link>}
            >
              <p>Mười hai công cụ tính nhanh chỉ số từ họ tên và ngày sinh, mỗi công cụ đều ghi rõ cách tính.</p>
            </FeatureCard>
            <FeatureCard
              title="Tra cứu Thần số học đầy đủ"
              footer={<Link className="card-link" to="/tra-cuu/than-so-hoc">Tra cứu ngay <ArrowRight aria-hidden="true" /></Link>}
            >
              <p>Nhập họ tên và ngày sinh một lần để xem trọn bộ tám chỉ số kèm phần luận giải chi tiết.</p>
            </FeatureCard>
          </CardGrid>
        </div>
      </section>

      <CourseCta />
    </>
  );
}

/** Trang gieo quẻ Kinh Dịch: công cụ lập quẻ trực tuyến kèm văn khấn, phương pháp luận giải và FAQ. */
export function GieoQuePage() {
  return (
    <>
      <section className="page-dark-section" style={FIRST_SECTION_STYLE}>
        <ToolHero
          kicker="Công cụ phong thủy"
          icon={Coins}
          title="Gieo quẻ"
          accent="Kinh Dịch"
          description="Đọc văn khấn, giữ một câu hỏi trong đầu rồi gieo đủ sáu lần. Công cụ lập quẻ chủ từ sáu hào, xác định hào động (hoặc hào Ám động khi không có hào động) rồi suy ra quẻ biến và phần luận giải tương ứng."
        />
        <div className="container fengshui-tools">
          <div className="fengshui-workspace is-open">
            <IChingToolView compact />
          </div>
        </div>
      </section>

      <MethodSection
        heading="Sáu hào lập thành một quẻ như thế nào"
        lead="Quy trình bên dưới mô tả đúng cách công cụ đang tính, để bạn kiểm chứng lại kết quả nếu muốn."
        items={[
          {
            icon: Coins,
            title: "Sáu lần gieo, sáu hào",
            text: "Mỗi lần gieo cho ra một hào với giá trị 6, 7, 8 hoặc 9, theo xác suất của phép gieo cổ truyền (ngửa tính 2, sấp tính 3).",
          },
          {
            icon: ArrowRight,
            title: "Lập hào từ dưới lên",
            text: "Hào thứ nhất là hào dưới cùng, hào thứ sáu là hào trên cùng, đúng thứ tự an quẻ theo truyền thống.",
          },
          {
            icon: ArrowLeftRight,
            title: "Hào động và quẻ biến",
            text: "Hào 6 (lão âm) và hào 9 (lão dương) là hào động. Đổi âm dương tại các hào này sẽ cho quẻ biến, thể hiện chiều chuyển dịch. Nếu cả sáu hào đều tĩnh, hệ thống tìm hào Ám động theo Thiên Can của ngày gieo (giờ Việt Nam) và đảo hào đó để tạo quẻ biến.",
          },
          {
            icon: BookOpen,
            title: "Đọc quẻ chủ rồi tới hào động",
            text: "Quẻ chủ mô tả bối cảnh hiện tại; hào động chỉ điểm cần lưu ý; quẻ biến gợi hướng vận động tiếp theo.",
          },
        ]}
      />

      <MethodSection
        heading="Vì sao mỗi lần gieo lại khác nhau"
        lead="Công cụ dùng nguồn ngẫu nhiên bảo mật của trình duyệt, nên kết quả không lặp lại và không phụ thuộc vào máy chủ SGEN."
        items={[
          {
            icon: ShieldCheck,
            title: "Nguồn ngẫu nhiên an toàn",
            text: "Khi trình duyệt hỗ trợ, công cụ dùng crypto.getRandomValues để lấy bit ngẫu nhiên cho từng lần gieo.",
          },
          {
            icon: CircleAlert,
            title: "Không lưu câu hỏi của bạn",
            text: "Nội dung câu hỏi chỉ tồn tại trong phiên làm việc trên máy của bạn và không được gửi đi đâu cả.",
          },
          {
            icon: Clock3,
            title: "Đọc kết quả trong bối cảnh",
            text: "Cùng một quẻ có thể mang thông điệp khác nhau với từng người. Hãy xem đây là gợi ý suy ngẫm, không phải chỉ thị hành động.",
          },
        ]}
      />

      <FaqSection
        items={[
          {
            question: "Có bắt buộc nhập câu hỏi không?",
            answer: "Không. Câu hỏi chỉ giúp bạn tập trung và được ghi lại bên cạnh kết quả; bạn vẫn gieo quẻ bình thường khi để trống.",
          },
          {
            question: "Gieo lại nhiều lần có sao không?",
            answer: "Bạn có thể bấm gieo lại từ đầu bất cứ lúc nào. Công cụ không giới hạn số lần, nhưng nên xác định rõ câu hỏi trước khi gieo.",
          },
          {
            question: "Quẻ biến khác quẻ chủ ở điểm nào?",
            answer: "Quẻ chủ là bối cảnh hiện tại; quẻ biến là trạng thái sau khi các hào động chuyển hóa, thường dùng để tham khảo hướng phát triển.",
          },
        ]}
      />

      <RelatedTools current="/cong-cu-phong-thuy/gieo-que-kinh-dich" />
      <CourseCta note="Kinh Dịch là hệ thống ký hiệu cổ, cần thời gian học mới luận được đầy đủ quẻ thể, quẻ dụng và quan hệ hào vị." />
    </>
  );
}

/** Trang lap Tu Tru Bát Tu dùng truc tiep MenhThuApp voi giao dien Menh Thu nguyên ban, đoi sac tím SGEN. */
export function TuTruPage() {
  const today = useMemo(localDateValue, []);
  const cssReady = useMenhThuStylesheet();
  if (!cssReady) return <div className="bazi-reference-page" aria-busy="true" />;
  return (
    <div className="bazi-reference-page">
      <MenhThuApp
        initialToday={today}
        initialTool="bazi"
        standaloneBazi={true}
        initialChartStyle="Trung Châu Phái + Khâm Thiên"
        initialConfigOpen={true}
      />
    </div>
  );
}

/**
 * Stylesheet Mệnh Thư (Tailwind preflight, `:root` biến màu/font, `html { font-size: 18px }`) được viết cho app độc lập,
 * nạp toàn cục sẽ làm lệch typography của mọi trang khác. Chỉ gắn khi trang Tứ Trụ đang mở và gỡ khi rời trang.
 */
function useMenhThuStylesheet() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let style: HTMLStyleElement | null = null;
    let cancelled = false;
    void import("../../styles/menh-thu-bazi.css?inline").then(({ default: css }) => {
      if (cancelled) return;
      style = document.createElement("style");
      style.dataset.scope = "menh-thu";
      style.textContent = css;
      document.head.appendChild(style);
      setReady(true);
    });
    return () => {
      cancelled = true;
      style?.remove();
    };
  }, []);
  return ready;
}

function localDateValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** Trang xem ngày: công cụ tra ngày tốt xấu đầy đủ theo lịch pháp Việt Nam. */
export function XemNgayPage() {
  return (
    <div className="xem-ngay-page">
      <section className="page-dark-section xn-hero" style={FIRST_SECTION_STYLE}>
        <ToolHero
          kicker="Công cụ phong thủy"
          icon={CalendarCheck}
          title="Xem ngày"
          accent="tốt — xấu theo lịch pháp"
          description="Chọn ngày dương lịch hoặc âm lịch và giờ muốn xem để tra Can Chi, Thập nhị Trực, Nhị thập bát tú, kiết hung tinh, giờ hoàng đạo, Đổng Công và các mục chọn ngày của Trạng Trình."
        />
      </section>
      <section className="page-light-section xn-section">
        <div className="container">
          <XemNgayView />
        </div>
      </section>

      <FaqSection
        items={[
          {
            question: "Giờ hoàng đạo có phải giờ tốt tuyệt đối?",
            answer: "Không. Giờ hoàng đạo là một chỉ báo theo lịch pháp; công việc cụ thể còn phụ thuộc tính chất việc, người thực hiện và bối cảnh.",
          },
          {
            question: "Vì sao cùng một ngày lại có giờ tốt và giờ xấu?",
            answer: "Mỗi giờ có Can Chi và thần trực riêng (Hoàng đạo hoặc Hắc đạo), cùng các sao theo giờ như Thiên Ất, Nhật Lộc, Nhật Phá hay Tuần Không, nên tính chất từng giờ khác nhau.",
          },
          {
            question: "Âm lịch trong công cụ tính theo múi giờ nào?",
            answer: "Âm lịch được tính theo múi giờ Việt Nam (GMT+7); Thập nhị Trực và các sao an theo tiết khí lấy tiết tại 0 giờ đầu ngày.",
          },
        ]}
      />

      <RelatedTools current="/cong-cu-phong-thuy/xem-ngay" />
      <CourseCta note="Lịch pháp Việt Nam kết hợp âm dương lịch và tiết khí; nắm nguyên lý sẽ giúp bạn đọc bảng ngày — giờ chính xác hơn." />
    </div>
  );
}
