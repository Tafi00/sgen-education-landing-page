import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  CircleAlert,
  Clock3,
  Coins,
  Compass,
  LayoutGrid,
  Printer,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { BaziToolView } from "../../components/fengshui/BaziToolView";
import { CalendarToolView } from "../../components/fengshui/CalendarToolView";
import { IChingToolView } from "../../components/fengshui/IChingToolView";
import { getDateProfile } from "../../../shared/menh-thu/metaphysics";
import { RESULTS_DISCLAIMER } from "../../../shared/lookup-types";

const COURSE_IMAGE = "/assets/programs/program-home-feng-shui-v2.webp";

/** Header của site là `position: fixed` cao 98px, nên section đầu trang công cụ cần chừa thêm khoảng đệm. */
const FIRST_SECTION_STYLE: CSSProperties = { paddingTop: 140 };

const TOOL_LINKS: { href: string; title: string; text: string; icon: LucideIcon }[] = [
  {
    href: "/cong-cu-phong-thuy/gieo-que-kinh-dich",
    title: "Gieo quẻ Kinh Dịch",
    text: "Tung ba đồng xu sáu lần để lập quẻ chủ, xác định hào động và suy ra quẻ biến.",
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

function ToolHero({ kicker, icon: Icon, title, accent, description }: { kicker: string; icon: LucideIcon; title: string; accent: string; description: string }) {
  return (
    <div className="container lookup-workspace">
      <header>
        <span className="page-kicker">
          <Icon aria-hidden="true" /> {kicker}
        </span>
        <h1>
          {title} <em>{accent}</em>
        </h1>
        <p>{description}</p>
      </header>
    </div>
  );
}

function MethodSection({ heading, lead, items }: { heading: string; lead: string; items: MethodItem[] }) {
  return (
    <section className="page-dark-section">
      <div className="container">
        <div className="page-section-heading">
          <span>Phương pháp luận giải</span>
          <h2>{heading}</h2>
          <p>{lead}</p>
        </div>
        <div className="value-grid">
          {items.map(({ icon: Icon, title, text }) => (
            <article key={title}>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <section className="page-dark-section">
      <div className="container">
        <div className="page-section-heading">
          <span>Câu hỏi thường gặp</span>
          <h2>Giải đáp nhanh trước khi tra cứu</h2>
        </div>
        <div className="value-grid">
          {items.map((item) => (
            <article key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedTools({ current }: { current: string }) {
  const others = TOOL_LINKS.filter((tool) => tool.href !== current);
  return (
    <section className="page-light-section">
      <div className="container">
        <div className="page-section-heading page-section-heading--light">
          <span>Đi tiếp</span>
          <h2>Hai công cụ phong thủy còn lại</h2>
        </div>
        <div className="service-grid">
          {others.map((tool) => (
            <article key={tool.href}>
              <h3>{tool.title}</h3>
              <p>{tool.text}</p>
              <Link to={tool.href}>
                Mở công cụ <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseCta({ note }: { note?: string }) {
  return (
    <section className="page-dark-section">
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
        {note ? <p className="report-note"><BookOpen aria-hidden="true" /> {note}</p> : null}
      </div>
    </section>
  );
}

function Disclaimer() {
  return (
    <section className="page-dark-section">
      <div className="container">
        <div className="privacy-banner">
          <ShieldCheck aria-hidden="true" />
          <div>
            <strong>Tuyên bố miễn trừ</strong>
            <span>
              {RESULTS_DISCLAIMER} Các chỉ báo phong thủy, lịch pháp là quan niệm văn hóa truyền thống, không phải kết luận khoa học về vận mệnh
              và không thay thế quyết định của bạn.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Trang trung tâm công cụ phong thủy: giới thiệu ba công cụ và điều hướng sang trang tra cứu riêng. */
export function FengShuiHubPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div className="page-hero__copy">
            <span className="page-kicker">
              <Compass aria-hidden="true" /> Công cụ phong thủy
            </span>
            <h1>
              Ba công cụ tra cứu <em>phong thủy ứng dụng</em>
            </h1>
            <p>
              SGEN tổng hợp ba công cụ miễn phí: gieo quẻ Kinh Dịch, lập Tứ Trụ Bát Tự và xem ngày theo lịch pháp Việt Nam. Mỗi công cụ trình bày
              rõ dữ liệu đầu vào, thuật toán đang dùng và phần luận giải để bạn chủ động đối chiếu.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="page-primary" to="/cong-cu-phong-thuy/gieo-que-kinh-dich">
                <Coins aria-hidden="true" /> Gieo quẻ ngay
              </Link>
              <Link className="action-button action-button--outline" to="/cong-cu-phong-thuy/xem-ngay">
                <CalendarCheck aria-hidden="true" /> Xem ngày tốt
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-light-section">
        <div className="container">
          <div className="page-section-heading page-section-heading--light">
            <span>Ba công cụ</span>
            <h2>Chọn công cụ theo câu hỏi của bạn</h2>
            <p>Mỗi công cụ trả lời một nhóm câu hỏi khác nhau và đều chạy trực tiếp trên trình duyệt của bạn.</p>
          </div>
          <div className="service-grid">
            {TOOL_LINKS.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <article key={tool.href}>
                  <span className="service-grid__number">{String(index + 1).padStart(2, "0")}</span>
                  <Icon aria-hidden="true" />
                  <h3>{tool.title}</h3>
                  <p>{tool.text}</p>
                  <Link to={tool.href}>
                    Mở công cụ <ArrowRight aria-hidden="true" />
                  </Link>
                </article>
              );
            })}
          </div>
          <div className="process-card">
            <h2>Quy trình luận giải của SGEN</h2>
            <div>
              {["Chọn công cụ", "Nhập dữ liệu", "Đọc chỉ báo", "Đối chiếu thực tế"].map((step, index) => (
                <span key={step}>
                  <b>{index + 1}</b>
                  {step}
                </span>
              ))}
            </div>
          </div>
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
          <div className="page-section-heading page-section-heading--light">
            <span>Kết hợp thêm</span>
            <h2>Bổ sung góc nhìn từ sim số và thần số học</h2>
            <p>Ba công cụ phong thủy chỉ là một phần trong hệ thống tra cứu của SGEN. Bạn có thể kết hợp thêm các lớp phân tích khác.</p>
          </div>
          <div className="service-grid">
            <article>
              <h3>Bói sim phong thủy</h3>
              <p>Luận số điện thoại theo năm lớp: quẻ Kinh Dịch, ngũ hành dãy số, âm dương, quan niệm dân gian và đối chiếu bản mệnh.</p>
              <Link to="/sim-phong-thuy">
                Xem cách luận sim <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article>
              <h3>Công cụ thần số học miễn phí</h3>
              <p>Mười hai công cụ tính nhanh chỉ số từ họ tên và ngày sinh, mỗi công cụ đều ghi rõ cách tính.</p>
              <Link to="/free-tools">
                Mở Free tools <ArrowRight aria-hidden="true" />
              </Link>
            </article>
            <article>
              <h3>Tra cứu Thần số học đầy đủ</h3>
              <p>Nhập họ tên và ngày sinh một lần để xem trọn bộ tám chỉ số kèm phần luận giải chi tiết.</p>
              <Link to="/tra-cuu/than-so-hoc">
                Tra cứu ngay <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          </div>
        </div>
      </section>

      <CourseCta />
      <Disclaimer />
    </>
  );
}

/** Trang gieo quẻ Kinh Dịch: công cụ lập quẻ theo ba đồng xu kèm phương pháp luận giải và FAQ. */
export function GieoQuePage() {
  return (
    <>
      <section className="page-dark-section" style={FIRST_SECTION_STYLE}>
        <ToolHero
          kicker="Công cụ phong thủy"
          icon={Coins}
          title="Gieo quẻ"
          accent="Kinh Dịch"
          description="Giữ một câu hỏi trong đầu, gieo ba đồng xu đủ sáu lần. Công cụ lập quẻ chủ từ sáu hào, xác định hào động rồi suy ra quẻ biến và phần luận giải tương ứng."
        />
        <div className="container fengshui-tools">
          <div className="fengshui-workspace is-open">
            <IChingToolView />
          </div>
        </div>
      </section>

      <MethodSection
        heading="Sáu hào lập thành một quẻ như thế nào"
        lead="Quy trình bên dưới mô tả đúng cách công cụ đang tính, để bạn kiểm chứng lại kết quả nếu muốn."
        items={[
          {
            icon: Coins,
            title: "Ba đồng xu, sáu lần gieo",
            text: "Mỗi lần gieo ba đồng xu cho một hào. Mặt ngửa tính 2, mặt sấp tính 3; tổng ba đồng cho ra 6, 7, 8 hoặc 9.",
          },
          {
            icon: ArrowRight,
            title: "Lập hào từ dưới lên",
            text: "Hào thứ nhất là hào dưới cùng, hào thứ sáu là hào trên cùng, đúng thứ tự an quẻ theo truyền thống.",
          },
          {
            icon: Sparkles,
            title: "Hào động và quẻ biến",
            text: "Hào 6 (lão âm) và hào 9 (lão dương) là hào động. Đổi âm dương tại các hào này sẽ cho quẻ biến, thể hiện chiều chuyển dịch.",
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
            text: "Khi trình duyệt hỗ trợ, công cụ dùng crypto.getRandomValues để lấy bit ngẫu nhiên cho từng đồng xu.",
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
      <Disclaimer />
    </>
  );
}

/** Trang lập Tứ Trụ Bát Tự: an bốn trụ theo tiết khí kèm luận giải ngũ hành và Đại vận. */
export function TuTruPage() {
  return (
    <>
      <section className="page-dark-section" style={FIRST_SECTION_STYLE}>
        <ToolHero
          kicker="Công cụ phong thủy"
          icon={LayoutGrid}
          title="Phân tích"
          accent="Tứ Trụ Bát Tự"
          description="Nhập họ tên, giới tính, ngày và giờ sinh dương lịch. Công cụ hiệu chỉnh giờ Mặt Trời theo kinh độ Hà Nội rồi an bốn trụ, tính cân bằng ngũ hành, quan hệ Can Chi và chu kỳ Đại vận."
        />
        <div className="container fengshui-tools">
          <div className="fengshui-workspace is-open">
            <BaziToolView />
          </div>
        </div>
      </section>

      <MethodSection
        heading="Bốn trụ được an theo tiết khí"
        lead="Công cụ dùng lịch Can Chi và tiết khí để an trụ, không dùng tháng dương lịch thông thường."
        items={[
          {
            icon: Clock3,
            title: "Hiệu chỉnh giờ Mặt Trời",
            text: "Giờ dân dụng được quy về giờ Mặt Trời thực theo kinh độ 105,8333° Đông, múi giờ UTC+7 và phương trình thời gian.",
          },
          {
            icon: LayoutGrid,
            title: "An trụ năm, tháng, ngày, giờ",
            text: "Trụ tháng cắt theo tiết khí; trụ ngày theo chu kỳ 60 Can Chi; trụ giờ theo địa chi giờ sinh.",
          },
          {
            icon: Sparkles,
            title: "Nhật chủ và Thập thần",
            text: "Thiên can trụ ngày là Nhật chủ. Quan hệ giữa Nhật chủ với các can còn lại được biểu diễn bằng Thập thần.",
          },
          {
            icon: Compass,
            title: "Cân bằng ngũ hành và Đại vận",
            text: "Công cụ đếm hành của can, chi và tàng can để tính tỷ trọng, đồng thời tính mốc khởi và mười chu kỳ Đại vận.",
          },
        ]}
      />

      <MethodSection
        heading="Đọc chỉ báo vượng suy cho đúng"
        lead="Phần vượng suy là lớp định lượng để có kết quả ngay; luận chuyên sâu vẫn cần xét hợp hóa và điều hậu của toàn cục."
        items={[
          {
            icon: ShieldCheck,
            title: "Điểm vượng suy có giới hạn",
            text: "Điểm số tổng hợp từ tỷ trọng khí, tháng lệnh và số lần thông căn, chỉ nên xem là chỉ báo tương đối.",
          },
          {
            icon: CircleAlert,
            title: "Dụng thần là gợi ý",
            text: "Dụng thần và hỷ thần do công cụ đề xuất theo quy tắc cố định, không thay thế phán đoán của người có chuyên môn.",
          },
          {
            icon: BookOpen,
            title: "Không dùng để quyết định thay bạn",
            text: "Lá số là một cách nhìn bối cảnh. Các quyết định về nghề nghiệp, sức khỏe hay tài chính vẫn thuộc về bạn.",
          },
        ]}
      />

      <FaqSection
        items={[
          {
            question: "Vì sao cần nhập giờ sinh chính xác?",
            answer: "Trụ giờ phụ thuộc trực tiếp vào giờ sinh. Lệch một canh giờ có thể đổi trụ giờ và làm thay đổi phần Đại vận.",
          },
          {
            question: "Sinh ở tỉnh khác Hà Nội thì sao?",
            answer: "Công cụ hiện dùng kinh độ Hà Nội và múi giờ UTC+7 cho toàn quốc. Nếu sinh ở nơi khác múi giờ, kết quả chỉ mang tính tham khảo.",
          },
          {
            question: "Đại vận tính theo tuổi nào?",
            answer: "Công cụ quy đổi khoảng cách từ ngày sinh tới tiết khí gần nhất theo tỷ lệ ba ngày dân sự tương ứng một năm vận, rồi liệt kê mười chu kỳ.",
          },
        ]}
      />

      <RelatedTools current="/cong-cu-phong-thuy/tu-tru-bat-tu" />
      <CourseCta note="Muốn luận trọn lá số, bạn cần học thêm quan hệ hợp xung, thập thần, cách cục và điều hậu theo mùa sinh." />
      <Disclaimer />
    </>
  );
}

function addDays(base: string, days: number) {
  const [year, month, day] = base.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

function localDateValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

/** Trang xem ngày: chọn nhanh ngày, tra cát hung và in bảng mười hai giờ tốt — xấu. */
export function XemNgayPage() {
  const today = useMemo(localDateValue, []);
  const [date, setDate] = useState(today);
  const profile = useMemo(() => getDateProfile(date), [date]);
  const presets = [
    { label: "Hôm nay", value: today },
    { label: "Ngày mai", value: addDays(today, 1) },
    { label: "+7 ngày", value: addDays(today, 7) },
  ];
  const weekdayLabel = useMemo(() => new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", { weekday: "short" }), [date]);
  const dateLabel = useMemo(() => new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }), [date]);
  const lunarLabel = `Âm lịch ${profile.lunarDate.day}/${profile.lunarDate.month}${profile.lunarDate.leap ? " nhuận" : ""}`;

  return (
    <div className="xem-ngay-page">
      <section className="page-dark-section" style={FIRST_SECTION_STYLE}>
        <ToolHero
          kicker="Công cụ phong thủy"
          icon={CalendarCheck}
          title="Xem ngày"
          accent="tốt — xấu theo lịch pháp"
          description="Chọn ngày dương lịch để tra âm lịch, Can Chi, Thập nhị Trực, Nhị thập bát tú, cát hung tinh và giờ hoàng đạo. Bạn có thể chọn nhanh hôm nay, ngày mai hoặc cộng thêm bảy ngày."
        />
        <div className="container fengshui-tools">
          <div className="xem-ngay-bar">
            <p className="xem-ngay-bar__current">
              <small>Đang xem · {weekdayLabel}</small>
              <b>{dateLabel} · {lunarLabel}</b>
            </p>
            <div className="category-row">
              <button type="button" aria-label="Xem ngày trước" onClick={() => setDate(addDays(date, -1))}>
                −1 ngày
              </button>
              <button type="button" aria-label="Xem ngày sau" onClick={() => setDate(addDays(date, 1))}>
                +1 ngày
              </button>
              {presets.map((preset) => (
                <button type="button" className={date === preset.value ? "is-active" : ""} onClick={() => setDate(preset.value)} key={preset.label}>
                  {preset.label}
                </button>
              ))}
              <button type="button" onClick={() => window.print()}>
                <Printer aria-hidden="true" /> In trang
              </button>
            </div>
          </div>
          <div className="fengshui-workspace is-open">
            <CalendarToolView date={date} onDateChange={setDate} />
          </div>
        </div>
      </section>

      <MethodSection
        heading="Cát hung của một ngày được tính từ đâu"
        lead="Công cụ tổng hợp nhiều lớp dữ liệu lịch pháp thay vì dùng một phép tính đơn lẻ."
        items={[
          {
            icon: CalendarCheck,
            title: "Âm lịch và Can Chi",
            text: "Ngày dương lịch được quy về âm lịch, từ đó xác định Can Chi của năm, tháng và ngày.",
          },
          {
            icon: Sparkles,
            title: "Thập nhị Trực và Nhị thập bát tú",
            text: "Mỗi ngày ứng với một Trực trong mười hai trực và một sao trong hai mươi tám tú, kèm mô tả nên và kỵ.",
          },
          {
            icon: Check,
            title: "Cát tinh và hung tinh",
            text: "Công cụ liệt kê các sao tốt và sao xấu chiếu trong ngày để bạn đối chiếu thay vì chỉ nhìn một con số.",
          },
          {
            icon: Clock3,
            title: "Điểm năng lượng và mười hai giờ",
            text: "Điểm ngày và điểm từng giờ được tính từ cát/hung thần, Trực, Tú và thần trực; bảng phía trên xếp hạng đủ mười hai giờ.",
          },
        ]}
      />

      <MethodSection
        heading="Đối chiếu với tuổi của bạn"
        lead="Khi bạn nhập ngày giờ sinh ở ô tùy chọn, công cụ so trụ năm sinh với trụ ngày để ước lượng mức hợp — xung."
        items={[
          {
            icon: Compass,
            title: "Hợp tuổi và xung tuổi",
            text: "Kết quả dựa trên quan hệ Địa chi và Thiên can giữa trụ năm sinh và trụ ngày, kèm tuổi mụ để bạn dễ đối chiếu.",
          },
          {
            icon: CircleAlert,
            title: "Kết quả chỉ là tương đối",
            text: "Một ngày bị coi là xung tuổi không có nghĩa mọi việc đều bất lợi; đây là lớp tham khảo trong nhiều yếu tố khác.",
          },
          {
            icon: Printer,
            title: "In và lưu lại",
            text: "Nút in dùng chức năng in của trình duyệt, giúp bạn lưu bảng giờ hoặc đối chiếu trước khi chọn thời điểm.",
          },
        ]}
      />

      <FaqSection
        items={[
          {
            question: "Giờ hoàng đạo có phải giờ tốt tuyệt đối?",
            answer: "Không. Giờ hoàng đạo là một chỉ báo theo lịch pháp; công việc cụ thể còn phụ thuộc tính chất việc, người thực hiện và bối cảnh.",
          },
          {
            question: "Vì sao cùng một ngày lại có giờ tốt và giờ xấu?",
            answer: "Mỗi giờ có Can Chi và thần trực riêng, được chấm theo Nhật Phá, Trực giờ, Quý Nhân và Hoàng — Hắc đạo nên điểm số khác nhau.",
          },
          {
            question: "Nhập ngày sinh có bắt buộc không?",
            answer: "Không bắt buộc. Bạn vẫn xem được toàn bộ thông tin của ngày khi bỏ trống phần đối chiếu tuổi.",
          },
        ]}
      />

      <RelatedTools current="/cong-cu-phong-thuy/xem-ngay" />
      <CourseCta note="Lịch pháp Việt Nam kết hợp âm dương lịch và tiết khí; nắm nguyên lý sẽ giúp bạn đọc bảng ngày — giờ chính xác hơn." />
      <Disclaimer />
    </div>
  );
}
