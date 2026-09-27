import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CircleAlert,
  Compass,
  Flame,
  GraduationCap,
  Hash,
  Layers,
  Phone,
  Scale,
  Star,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import SimPhongThuyView from "../../components/fengshui/SimPhongThuyView";
import { ButtonLink, ButtonRow } from "../../components/ui/Button";
import { Callout, CardGrid, FeatureCard, PageHero } from "../../components/ui/Layout";
import { SectionHeading } from "../../components/ui/SectionHeading";

const LAYERS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Hash,
    title: "Quẻ Kinh Dịch",
    text: "Sáu chữ số cuối của dãy số được quy thành sáu hào để lập quẻ chủ; hào động và quẻ biến cho biết chiều vận động của dãy số.",
  },
  {
    icon: Layers,
    title: "Ngũ hành dãy số",
    text: "Từng chữ số được quy về hành theo bảng Lạc Thư — Hà Đồ, sau đó đếm mức hiện diện và xác định hành vượng, hành khuyết.",
  },
  {
    icon: Scale,
    title: "Âm dương",
    text: "Số chẵn thuộc âm, số lẻ thuộc dương. Tỷ lệ âm — dương cho biết dãy số thiên về tĩnh hay động và mức cân bằng.",
  },
  {
    icon: UsersRound,
    title: "Quan niệm dân gian",
    text: "Các cặp và cụm số quen thuộc trong cách luận phổ thông được đối chiếu như một lớp tham khảo, có ghi rõ chứ không dùng như kết luận.",
  },
  {
    icon: Compass,
    title: "Đối chiếu bản mệnh",
    text: "Nếu bạn nhập ngày giờ sinh, hệ thống xác định Nhật chủ và các hành tương sinh để đo mức phù hợp giữa dãy số và bản mệnh.",
  },
];

const APPROACHES = [
  {
    icon: Star,
    title: "Luận theo cặp số đẹp — xấu",
    text: "Cách phổ biến nhất: tra danh sách cặp số như 39, 68, 86 rồi kết luận nhanh. Ưu điểm là dễ nhớ, nhưng kết quả phụ thuộc bảng tra của từng người và bỏ qua toàn bộ dãy số.",
  },
  {
    icon: Flame,
    title: "Luận theo ngũ hành bản mệnh",
    text: "Chỉ xét hành của các chữ số có tương sinh với mệnh hay không. Cách này có nguyên lý rõ hơn, nhưng thường bỏ qua vai trò của số 0 và vị trí từng chữ số.",
  },
  {
    icon: Hash,
    title: "Luận theo tổng nút và điểm số",
    text: "Cộng toàn bộ chữ số để lấy tổng nút hoặc cho điểm rồi xếp loại. Cách này cho con số dễ so sánh, đổi lại một điểm số không nói được dãy số mạnh hay yếu ở khía cạnh nào.",
  },
  {
    icon: Layers,
    title: "Năm lớp của SGEN",
    text: "Công cụ chạy song song quẻ Kinh Dịch, ngũ hành, âm dương, quan niệm dân gian và đối chiếu bản mệnh, sau đó báo cáo từng lớp để bạn tự cân nhắc.",
  },
];
/** Trang giới thiệu bói sim: giải thích năm lớp phân tích, so sánh cách luận và cảnh báo khác biệt giữa các trường phái. */
export function SimIntroPage() {
  return (
    <>
      <PageHero
        eyebrow="Phong thủy sim số điện thoại"
        eyebrowIcon={Phone}
        title="Luận sim theo"
        accent="năm lớp phân tích"
        description="Thay vì chỉ tra cặp số đẹp, công cụ của SGEN chạy đồng thời năm lớp: quẻ Kinh Dịch, ngũ hành dãy số, âm dương, quan niệm dân gian và đối chiếu bản mệnh. Mỗi lớp được báo cáo riêng để bạn thấy dãy số mạnh yếu ở đâu."
        actions={<ButtonRow><ButtonLink variant="primary" to="/sim-phong-thuy/boi-sim">
                <Phone aria-hidden="true" /> Bói sim ngay
              </ButtonLink>
              <ButtonLink variant="secondary" to="/khoa-hoc">
                <GraduationCap aria-hidden="true" /> Học cách luận sim
              </ButtonLink></ButtonRow>}
      />

      <section className="page-light-section">
        <div className="container">
          <SectionHeading eyebrow="Năm lớp phân tích" title="Một dãy số, năm góc nhìn độc lập" description="Mỗi lớp có quy tắc riêng và được chấm điểm riêng, sau đó mới tổng hợp thành điểm chung của dãy số." />
          <CardGrid>
            {LAYERS.map((layer) => (
              <FeatureCard key={layer.title} icon={layer.icon} title={layer.title}>
                <p>{layer.text}</p>
              </FeatureCard>
            ))}
          </CardGrid>
        </div>
      </section>

      <section className="page-dark-section">
        <div className="container">
          <SectionHeading eyebrow="So sánh cách luận" title="Các cách luận sim phổ biến và điểm khác biệt" description="Không có cách nào là chân lý tuyệt đối. Bảng dưới đây nêu ưu điểm và giới hạn để bạn chọn cách đọc phù hợp nhu cầu." />
          <CardGrid>
            {APPROACHES.map((approach) => (
              <FeatureCard key={approach.title} icon={approach.icon} title={approach.title}>
                <p>{approach.text}</p>
              </FeatureCard>
            ))}
          </CardGrid>
        </div>
      </section>

      <section className="page-dark-section">
        <div className="container">
          <Callout icon={CircleAlert} title="Cảnh báo quan trọng: mỗi trường phái luận một khác">
            <p>
              Cùng một số điện thoại, người luận theo cặp số có thể khen đẹp trong khi người luận theo ngũ hành lại thấy chưa hợp mệnh. Kết quả của
              SGEN là một hệ phương pháp có ghi rõ quy tắc, không phải chân lý chung cho mọi trường phái. Hãy xem đây là thông tin tham khảo và
              không dùng để quyết định thay bạn.
            </p>
          </Callout>
        </div>
      </section>

      <section className="page-light-section">
        <div className="container">
          <SectionHeading eyebrow="Nên làm gì tiếp" title="Từ điểm số tới hành động cụ thể" />
          <CardGrid>
            <FeatureCard
              title="Bói sim miễn phí"
              footer={<Link className="card-link" to="/sim-phong-thuy/boi-sim">Mở công cụ <ArrowRight aria-hidden="true" /></Link>}
            >
              <p>Nhập số điện thoại để nhận báo cáo đầy đủ năm lớp, kèm gợi ý cách đọc từng chỉ báo.</p>
            </FeatureCard>
            <FeatureCard
              title="Học cách luận sim"
              footer={<Link className="card-link" to="/khoa-hoc">Xem khóa học <ArrowRight aria-hidden="true" /></Link>}
            >
              <p>Khóa học Phong thủy sim số hướng dẫn nền tảng ngũ hành, âm dương và cách luận có hệ thống.</p>
            </FeatureCard>
            <FeatureCard
              title="Kết hợp công cụ khác"
              footer={<Link className="card-link" to="/cong-cu-phong-thuy">Xem công cụ phong thủy <ArrowRight aria-hidden="true" /></Link>}
            >
              <p>Đối chiếu thêm Tứ Trụ Bát Tự hoặc xem ngày để có bối cảnh rộng hơn cho quyết định của bạn.</p>
            </FeatureCard>
          </CardGrid>
        </div>
      </section>
    </>
  );
}

/** Trang bói sim phong thủy: render đầy đủ engine Kinh Dịch + Bát Cực Linh Số + Bát Tự (port từ Mệnh thư). */
export function SimToolPage() {
  const [searchParams] = useSearchParams();
  return (
    <section className="page-light-section sim-section tool-page">
      <SimPhongThuyView
        initialPhone={searchParams.get("so") ?? ""}
        initialDay={searchParams.get("ngay") ?? undefined}
        initialMonth={searchParams.get("thang") ?? undefined}
        initialYear={searchParams.get("nam") ?? undefined}
        initialHour={searchParams.get("gio") ?? undefined}
        initialMinute={searchParams.get("phut") ?? undefined}
        initialGender={searchParams.get("gioitinh") === "nu" ? "Nữ" : "Nam"}
        initialCalendarType={searchParams.get("lich") === "al" ? "lunar" : "solar"}
        initialLunarLeapMonth={searchParams.get("nhuan") === "1"}
      />
    </section>
  );
}
